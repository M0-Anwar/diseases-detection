import pandas as pd
import numpy as np
import logging
import sys
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
import joblib

# Configure logging without Unicode symbols for Windows
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('two_stage_model.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class TwoStageDiseasePredictor:
    """
    Complete two-stage disease prediction system:

    Stage 1: SNP Classifier - Identifies disease-associated SNPs
    Stage 2: Person Classifier - Predicts disease risk from filtered SNPs
    """

    def __init__(self, target_disease):
        self.target_disease = target_disease
        self.snp_classifier = None
        self.person_classifier = None
        self.feature_columns = None
        self.person_classifier_trained = False

    # ============================================
    # STAGE 1: SNP CLASSIFIER
    # ============================================
    def train_snp_classifier(self, gwas_data):
        """Train model to identify disease-associated SNPs"""
        logger.info(f"Stage 1: Training SNP classifier for '{self.target_disease}'")

        # Prepare SNP-level data
        X_snp = gwas_data.drop('DISEASE_TRAIT', axis=1)
        y_snp = (gwas_data['DISEASE_TRAIT'] == self.target_disease).astype(int)  # FIXED: Binary label

        # Save feature columns for later use - THIS WAS MISSING!
        self.feature_columns = X_snp.columns.tolist()

        # Handle categorical features
        categorical_cols = X_snp.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            X_snp[col] = pd.Categorical(X_snp[col]).codes

        # Fill missing values
        X_snp = X_snp.fillna(X_snp.median())

        # Train-test split for evaluation
        X_train, X_test, y_train, y_test = train_test_split(
            X_snp, y_snp, test_size=0.2, random_state=42, stratify=y_snp
        )

        # Check class distribution
        class_counts = y_snp.value_counts()
        logger.info(f"Class distribution: {class_counts.to_dict()}")

        # Handle class imbalance
        positive_ratio = np.sum(y_train) / len(y_train)
        scale_pos_weight = (1 - positive_ratio) / positive_ratio if positive_ratio > 0 else 1
        logger.info(f"Positive ratio: {positive_ratio:.2%}, Scale pos weight: {scale_pos_weight:.2f}")

        # Train SNP classifier
        self.snp_classifier = XGBClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            objective='binary:logistic',
            scale_pos_weight=scale_pos_weight,  # Added for class imbalance
            random_state=42,
            n_jobs=-1
        )

        self.snp_classifier.fit(X_train, y_train)

        # Evaluate
        y_pred = self.snp_classifier.predict(X_test)
        y_pred_proba = self.snp_classifier.predict_proba(X_test)[:, 1]

        accuracy = accuracy_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)

        logger.info(f"SNP Classifier Results:")
        logger.info(f"  Accuracy: {accuracy:.4f}")
        logger.info(f"  ROC-AUC: {roc_auc:.4f}")

        # Get feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.snp_classifier.feature_importances_
        }).sort_values('importance', ascending=False)

        logger.info(f"Top 5 SNP features for {self.target_disease}:")
        for i, row in feature_importance.head(5).iterrows():
            logger.info(f"  {row['feature']}: {row['importance']:.4f}")

        return self

    # ============================================
    # CREATE PERSON-LEVEL DATASET
    # ============================================
    def create_person_dataset(self, individual_genomes, disease_labels):
        """
        Convert individual genomes to person-level features using SNP classifier
        """
        logger.info("Creating person-level dataset from individual genomes...")

        person_features = []

        for i, genome in enumerate(individual_genomes):
            # Ensure genome has the same features as training
            genome_processed = genome[self.feature_columns].copy()

            # Handle categorical features
            categorical_cols = genome_processed.select_dtypes(include=['object']).columns
            for col in categorical_cols:
                genome_processed[col] = pd.Categorical(genome_processed[col]).codes

            # Fill missing values
            genome_processed = genome_processed.fillna(genome_processed.median())

            # Stage 1: Get SNP probabilities
            snp_probabilities = self.snp_classifier.predict_proba(genome_processed)[:, 1]

            # Filter SNPs with high disease probability (threshold = 0.5)
            relevant_mask = snp_probabilities >= 0.5
            relevant_snps = genome_processed[relevant_mask]

            # Extract person-level features
            features = self._extract_person_features(relevant_snps, snp_probabilities[relevant_mask])
            person_features.append(features)

            if (i + 1) % 100 == 0:
                logger.info(f"Processed {i + 1} individuals")

        X_person = pd.DataFrame(person_features)
        y_person = np.array(disease_labels)

        logger.info(f"Person dataset shape: {X_person.shape}")
        logger.info(f"Person class distribution: {pd.Series(y_person).value_counts().to_dict()}")

        return X_person, y_person

    def _extract_person_features(self, relevant_snps, snp_probabilities):
        """Extract comprehensive features from a person's relevant SNPs"""
        features = {}

        # Initialize with zeros
        default_features = {
            'prs_score': 0,
            'weighted_prs': 0,
            'num_disease_snps': 0,
            'num_rare_snps': 0,
            'avg_effect': 0,
            'max_effect': 0,
            'effect_std': 0,
            'avg_p_value': 0,
            'min_p_value': 0,
            'confidence_score': 0,
            'avg_risk_frequency': 0
        }

        if len(relevant_snps) == 0:
            return default_features

        # Calculate features
        if 'EFFECT_MIDPOINT' in relevant_snps.columns:
            features['prs_score'] = relevant_snps['EFFECT_MIDPOINT'].sum()
        else:
            features['prs_score'] = 0

        # Weighted PRS (by p-value significance)
        if 'P_VALUE' in relevant_snps.columns and 'EFFECT_MIDPOINT' in relevant_snps.columns:
            weights = -np.log10(relevant_snps['P_VALUE'] + 1e-10)
            weighted_effects = relevant_snps['EFFECT_MIDPOINT'] * weights
            features['weighted_prs'] = weighted_effects.sum()
        else:
            features['weighted_prs'] = 0

        # Count features
        features['num_disease_snps'] = len(relevant_snps)

        # Rare variants (frequency < 1%)
        if 'RISK_ALLELE_FREQUENCY' in relevant_snps.columns:
            rare_mask = relevant_snps['RISK_ALLELE_FREQUENCY'] < 0.01
            features['num_rare_snps'] = rare_mask.sum()
            features['avg_risk_frequency'] = relevant_snps['RISK_ALLELE_FREQUENCY'].mean()
        else:
            features['num_rare_snps'] = 0
            features['avg_risk_frequency'] = 0

        # Effect size statistics
        if 'EFFECT_MIDPOINT' in relevant_snps.columns:
            features['avg_effect'] = relevant_snps['EFFECT_MIDPOINT'].mean()
            features['max_effect'] = relevant_snps['EFFECT_MIDPOINT'].max()
            features['effect_std'] = relevant_snps['EFFECT_MIDPOINT'].std()
        else:
            features['avg_effect'] = 0
            features['max_effect'] = 0
            features['effect_std'] = 0

        # P-value statistics
        if 'P_VALUE' in relevant_snps.columns:
            neg_log_p = -np.log10(relevant_snps['P_VALUE'] + 1e-10)
            features['avg_p_value'] = neg_log_p.mean()
            features['min_p_value'] = neg_log_p.max()  # Note: max of -log10(p) = min p-value
        else:
            features['avg_p_value'] = 0
            features['min_p_value'] = 0

        # Confidence weighted score
        if 'EFFECT_MIDPOINT' in relevant_snps.columns:
            features['confidence_score'] = np.dot(
                relevant_snps['EFFECT_MIDPOINT'],
                snp_probabilities[:len(relevant_snps)]
            )
        else:
            features['confidence_score'] = 0

        return features

    # ============================================
    # STAGE 2: PERSON CLASSIFIER
    # ============================================
    def train_person_classifier(self, individual_genomes, disease_labels):
        """Train model to predict person's disease risk"""
        logger.info("Stage 2: Training person classifier...")

        # Create person-level dataset
        X_person, y_person = self.create_person_dataset(individual_genomes, disease_labels)

        # Check class distribution - CRITICAL FIX!
        unique_classes = np.unique(y_person)
        logger.info(f"Unique classes in labels: {unique_classes}")

        if len(unique_classes) < 2:
            logger.error(f"Need both classes (0 and 1) but only have: {unique_classes}")
            logger.error("Cannot train person classifier with only one class.")
            self.person_classifier_trained = False
            return self

        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X_person, y_person, test_size=0.2, random_state=42, stratify=y_person
        )

        # Handle class imbalance
        positive_ratio = np.sum(y_train) / len(y_train)
        scale_pos_weight = (1 - positive_ratio) / positive_ratio if positive_ratio > 0 else 1

        logger.info(f"Class distribution - Positive: {positive_ratio:.2%}, Negative: {1 - positive_ratio:.2%}")
        logger.info(f"Scale pos weight: {scale_pos_weight:.2f}")

        # Train person classifier
        self.person_classifier = XGBClassifier(
            n_estimators=100,  # Reduced for testing
            max_depth=4,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            objective='binary:logistic',
            scale_pos_weight=scale_pos_weight,
            random_state=42,
            n_jobs=-1
        )

        self.person_classifier.fit(X_train, y_train)
        self.person_classifier_trained = True

        # Evaluate
        y_pred = self.person_classifier.predict(X_test)
        y_pred_proba = self.person_classifier.predict_proba(X_test)[:, 1]

        accuracy = accuracy_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)

        logger.info(f"Person Classifier Results:")
        logger.info(f"  Accuracy: {accuracy:.4f}")
        logger.info(f"  ROC-AUC: {roc_auc:.4f}")

        # Feature importance for person classifier
        person_feature_importance = pd.DataFrame({
            'feature': X_person.columns,
            'importance': self.person_classifier.feature_importances_
        }).sort_values('importance', ascending=False)

        logger.info(f"Top 5 person-level features:")
        for i, row in person_feature_importance.head(5).iterrows():
            logger.info(f"  {row['feature']}: {row['importance']:.4f}")

        return self

    # ============================================
    # PREDICTION PIPELINE
    # ============================================
    def predict(self, new_person_genome):
        """Full pipeline prediction for a new person"""
        if not self.person_classifier_trained or self.person_classifier is None:
            logger.info("Person classifier not trained. Using SNP-level prediction only.")
            return self._predict_snp_level_only(new_person_genome)

        # Prepare genome data
        genome_processed = new_person_genome[self.feature_columns].copy()

        # Handle categorical features
        categorical_cols = genome_processed.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            genome_processed[col] = pd.Categorical(genome_processed[col]).codes

        # Fill missing values
        genome_processed = genome_processed.fillna(genome_processed.median())

        # Stage 1: Filter SNPs
        snp_probabilities = self.snp_classifier.predict_proba(genome_processed)[:, 1]
        relevant_mask = snp_probabilities > 0.5
        relevant_snps = genome_processed[relevant_mask]

        # Stage 2: Extract features and predict
        person_features = self._extract_person_features(relevant_snps, snp_probabilities[relevant_mask])
        person_features_df = pd.DataFrame([person_features])

        # Ensure all features are present
        for col in self.person_classifier.feature_names_in_:
            if col not in person_features_df.columns:
                person_features_df[col] = 0

        # Reorder columns to match training
        person_features_df = person_features_df[self.person_classifier.feature_names_in_]

        # Predict
        risk_score = self.person_classifier.predict_proba(person_features_df)[0, 1]

        # Generate explanation
        explanation = self._generate_explanation(relevant_snps, risk_score)

        return {
            'risk_score': risk_score,
            'risk_category': self._categorize_risk(risk_score),
            'num_relevant_snps': len(relevant_snps),
            'explanation': explanation
        }

    def _predict_snp_level_only(self, new_person_genome):
        """Predict using only SNP classifier (when person classifier not trained)"""
        # Prepare genome data
        genome_processed = new_person_genome[self.feature_columns].copy()

        # Handle categorical features
        categorical_cols = genome_processed.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            genome_processed[col] = pd.Categorical(genome_processed[col]).codes

        # Fill missing values
        genome_processed = genome_processed.fillna(genome_processed.median())

        # Use SNP classifier only
        snp_probabilities = self.snp_classifier.predict_proba(genome_processed)[:, 1]
        relevant_mask = snp_probabilities > 0.5
        relevant_snps = genome_processed[relevant_mask]

        # Simple risk calculation based on SNP probabilities
        if len(snp_probabilities) > 0:
            risk_score = snp_probabilities.mean()
        else:
            risk_score = 0.5  # Neutral if no probabilities

        explanation = self._generate_explanation(relevant_snps, risk_score)

        return {
            'risk_score': risk_score,
            'risk_category': self._categorize_risk(risk_score),
            'num_relevant_snps': len(relevant_snps),
            'explanation': explanation
        }

    def _generate_explanation(self, relevant_snps, risk_score):
        """Generate human-readable explanation"""
        explanation = []

        if len(relevant_snps) > 0:
            explanation.append(f"Found {len(relevant_snps)} SNPs associated with {self.target_disease}")

            # Top SNPs by effect size
            if 'EFFECT_MIDPOINT' in relevant_snps.columns:
                top_snps = relevant_snps.nlargest(3, 'EFFECT_MIDPOINT')
                explanation.append("Top contributing SNPs by effect size:")
                for i, (idx, snp) in enumerate(top_snps.iterrows(), 1):
                    effect = snp.get('EFFECT_MIDPOINT', 0)
                    pval = snp.get('P_VALUE', 1)
                    explanation.append(f"  {i}. Effect: {effect:.3f}, P-value: {pval:.2e}")
        else:
            explanation.append(f"No strong SNP associations found for {self.target_disease}")

        explanation.append(f"Overall predicted risk: {risk_score:.1%}")
        explanation.append(f"Risk category: {self._categorize_risk(risk_score)}")

        # Recommendations based on risk
        if risk_score > 0.6:
            explanation.append("\nRecommendations:")
            explanation.append("  - Consider genetic counseling")
            explanation.append("  - Regular health screenings recommended")
            explanation.append("  - Maintain healthy lifestyle")

        return "\n".join(explanation)

    def _categorize_risk(self, risk_score):
        """Categorize risk level"""
        if risk_score < 0.2:
            return "Low"
        elif risk_score < 0.4:
            return "Moderate"
        elif risk_score < 0.6:
            return "High"
        else:
            return "Very High"

    # ============================================
    # UTILITY METHODS
    # ============================================
    def save(self, filepath):
        """Save the complete model"""
        model_data = {
            'target_disease': self.target_disease,
            'snp_classifier': self.snp_classifier,
            'person_classifier': self.person_classifier,
            'feature_columns': self.feature_columns,
            'person_classifier_trained': self.person_classifier_trained
        }
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")

    @classmethod
    def load(cls, filepath):
        """Load saved model"""
        model_data = joblib.load(filepath)
        model = cls(model_data['target_disease'])
        model.snp_classifier = model_data['snp_classifier']
        model.person_classifier = model_data['person_classifier']
        model.feature_columns = model_data['feature_columns']
        model.person_classifier_trained = model_data['person_classifier_trained']
        logger.info(f"Model loaded from {filepath}")
        return model


# ============================================
# SIMULATION FUNCTIONS FOR TESTING - FIXED!
# ============================================
def simulate_gwas_data(n_snps=10000):
    """Simulate GWAS-like data for testing"""
    logger.info(f"Simulating GWAS data with {n_snps} SNPs...")

    # Create synthetic SNP features matching your data structure
    data = {
        'REGION': [f'chr{np.random.randint(1, 23)}.{np.random.randint(1, 100)}' for _ in range(n_snps)],
        'CHR_ID': [str(np.random.randint(1, 23)) for _ in range(n_snps)],
        'MAPPED_GENE': [f'GENE_{i}' for i in range(n_snps)],
        'SNPS': [f'rs{i}' for i in range(n_snps)],
        'CONTEXT': np.random.choice(['intron', 'exon', 'intergenic', 'promoter'], n_snps),
        'INTERGENIC': np.random.choice(['Y', 'N'], n_snps),
        'RISK_ALLELE_FREQUENCY': np.random.beta(2, 8, n_snps),
        'P_VALUE': np.random.exponential(0.1, n_snps),
        'P_VALUE_MLOG': -np.log10(np.random.exponential(0.1, n_snps) + 1e-10),
        'CI_95': ['[0.95-1.05]' for _ in range(n_snps)],
        'EFFECT_LOWER': np.random.normal(0.9, 0.1, n_snps),
        'EFFECT_UPPER': np.random.normal(1.1, 0.1, n_snps),
        'EFFECT_MIDPOINT': np.random.normal(1.0, 0.2, n_snps),
        'EFFECT_DIRECTION_ENCODED': np.random.choice([-1, 0, 1], n_snps),
        'IS_INTERGENIC': np.random.choice([0, 1], n_snps),
        'HAS_KNOWN_GENE': np.random.choice([0, 1], n_snps),
        'IS_SIGNIFICANT_0_05': np.random.choice([0, 1], n_snps, p=[0.3, 0.7]),
        'IS_SIGNIFICANT_0_01': np.random.choice([0, 1], n_snps, p=[0.5, 0.5]),
        'IS_SIGNIFICANT_5e_8': np.random.choice([0, 1], n_snps, p=[0.8, 0.2]),
        'P_VALUE_CATEGORY': np.random.choice(
            ['ultra_sig', 'very_sig', 'high_sig', 'moderate_sig', 'low_sig', 'not_sig'], n_snps)
    }

    df = pd.DataFrame(data)

    # Create disease labels - make some SNPs more likely for diabetes
    disease_labels = []
    for idx, row in df.iterrows():
        # SNPs with low p-value and high effect are more likely diabetes
        diabetes_prob = 0.3
        if row['P_VALUE'] < 0.001 and row['EFFECT_MIDPOINT'] > 1.2:
            diabetes_prob = 0.8
        elif row['P_VALUE'] < 0.01 and row['EFFECT_MIDPOINT'] > 1.1:
            diabetes_prob = 0.6

        if np.random.random() < diabetes_prob:
            disease_labels.append('diabetes')
        else:
            disease_labels.append(np.random.choice(['heart_disease', 'cancer', 'alzheimers', 'asthma']))

    df['DISEASE_TRAIT'] = disease_labels

    return df


def simulate_individual_genome(gwas_data, snps_per_person=300):
    """Simulate one person's genome by sampling from GWAS data"""
    # Sample SNPs for this person
    sampled_indices = np.random.choice(len(gwas_data), snps_per_person, replace=False)
    person_genome = gwas_data.iloc[sampled_indices].copy()
    return person_genome.drop('DISEASE_TRAIT', axis=1)


def simulate_individuals_with_balanced_labels(gwas_data, n_people=500, snps_per_person=250):
    """Simulate individuals with BOTH healthy and diseased people"""
    logger.info(f"Simulating {n_people} individuals with balanced labels...")

    individual_genomes = []
    disease_labels = []

    # Create roughly 50% healthy, 50% diseased
    n_diseased = n_people // 2
    n_healthy = n_people - n_diseased

    # Simulate healthy individuals (label = 0)
    for i in range(n_healthy):
        # Sample SNPs randomly
        genome = simulate_individual_genome(gwas_data, snps_per_person)
        individual_genomes.append(genome)
        disease_labels.append(0)  # Healthy

        if (i + 1) % 50 == 0:
            logger.info(f"  Simulated {i + 1} healthy individuals")

    # Simulate diseased individuals (label = 1)
    for i in range(n_diseased):
        # Sample SNPs, but bias toward diabetes-associated SNPs
        all_snps = len(gwas_data)
        # Try to sample more diabetes SNPs for diseased individuals
        diabetes_mask = gwas_data['DISEASE_TRAIT'] == 'diabetes'
        diabetes_snps = gwas_data[diabetes_mask]
        other_snps = gwas_data[~diabetes_mask]

        # Sample 60% from diabetes SNPs, 40% from others
        n_diabetes_snps = int(snps_per_person * 0.6)
        n_other_snps = snps_per_person - n_diabetes_snps

        if len(diabetes_snps) > n_diabetes_snps:
            diabetes_sample = diabetes_snps.sample(n_diabetes_snps)
        else:
            diabetes_sample = diabetes_snps

        if len(other_snps) > n_other_snps:
            other_sample = other_snps.sample(n_other_snps)
        else:
            other_sample = other_snps

        # Combine samples
        genome = pd.concat([diabetes_sample, other_sample], ignore_index=True)
        genome = genome.drop('DISEASE_TRAIT', axis=1)

        individual_genomes.append(genome)
        disease_labels.append(1)  # Diseased

        if (i + 1) % 50 == 0:
            logger.info(f"  Simulated {i + 1} diseased individuals")

    # Shuffle the data
    combined = list(zip(individual_genomes, disease_labels))
    np.random.shuffle(combined)
    individual_genomes, disease_labels = zip(*combined)

    logger.info(f"Final class distribution: Healthy={disease_labels.count(0)}, Diseased={disease_labels.count(1)}")

    return list(individual_genomes), list(disease_labels)


# ============================================
# MAIN EXECUTION - FIXED VERSION
# ============================================
if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("TWO-STAGE DISEASE PREDICTION SYSTEM")
    logger.info("=" * 60)

    try:
        # Try to load your real data
        gwas_df = pd.read_csv('gwas_cleaned_final.csv',low_memory=False)
        logger.info(f"SUCCESS: Loaded real GWAS data: {gwas_df.shape}")

        # Check what diseases are available
        diseases = gwas_df['DISEASE_TRAIT'].unique()
        logger.info(f"Available diseases: {len(diseases)}")
        logger.info(f"Sample diseases: {diseases[:5]}")

        # Pick the most common disease
        disease_counts = gwas_df['DISEASE_TRAIT'].value_counts()
        most_common = disease_counts.index[0]
        TARGET_DISEASE = most_common

        logger.info(f"Most common disease: {most_common} ({disease_counts.iloc[0]} SNPs)")

    except Exception as e:
        logger.error(f"Error loading data: {e}")
        logger.warning("Using simulated data for testing...")

        # Create simulated data
        gwas_df = simulate_gwas_data(n_snps=5000)
        TARGET_DISEASE = "diabetes"

    logger.info(f"Target disease: {TARGET_DISEASE}")

    # ============================================
    # STEP 1: TRAIN SNP CLASSIFIER (STAGE 1)
    # ============================================
    logger.info("\n" + "=" * 60)
    logger.info("STEP 1: TRAINING SNP CLASSIFIER")
    logger.info("=" * 60)

    predictor = TwoStageDiseasePredictor(TARGET_DISEASE)
    predictor.train_snp_classifier(gwas_df)

    # ============================================
    # STEP 2: TEST SNP-LEVEL PREDICTION
    # ============================================
    logger.info("\n" + "=" * 60)
    logger.info("STEP 2: TESTING SNP-LEVEL PREDICTION")
    logger.info("=" * 60)

    # Simulate a test person
    test_person = simulate_individual_genome(gwas_df, snps_per_person=200)
    logger.info(f"Test person genome shape: {test_person.shape}")

    # Test prediction (using SNP classifier only)
    result = predictor.predict(test_person)

    logger.info(f"\nPREDICTION RESULTS (SNP-level only):")
    logger.info(f"  Risk Score: {result['risk_score']:.1%}")
    logger.info(f"  Risk Category: {result['risk_category']}")
    logger.info(f"  Relevant SNPs Found: {result['num_relevant_snps']}")

    # ============================================
    # STEP 3: CREATE BALANCED PERSON-LEVEL DATA
    # ============================================
    logger.info("\n" + "=" * 60)
    logger.info("STEP 3: CREATING BALANCED PERSON-LEVEL DATA")
    logger.info("=" * 60)

    # Use the FIXED function that creates both healthy and diseased individuals
    individual_genomes, disease_labels = simulate_individuals_with_balanced_labels(
        gwas_df,
        n_people=200,  # Smaller for testing
        snps_per_person=150
    )

    logger.info(f"Created {len(individual_genomes)} individuals")
    logger.info(f"Disease labels - Healthy: {disease_labels.count(0)}, Diseased: {disease_labels.count(1)}")

    # ============================================
    # STEP 4: TRAIN PERSON CLASSIFIER (STAGE 2)
    # ============================================
    logger.info("\n" + "=" * 60)
    logger.info("STEP 4: TRAINING PERSON CLASSIFIER")
    logger.info("=" * 60)

    try:
        predictor.train_person_classifier(individual_genomes, disease_labels)

        if predictor.person_classifier_trained:
            # Test full two-stage prediction
            logger.info("\n" + "=" * 60)
            logger.info("FULL TWO-STAGE PREDICTION TEST")
            logger.info("=" * 60)

            new_person = simulate_individual_genome(gwas_df, snps_per_person=200)
            full_result = predictor.predict(new_person)

            logger.info(f"\nFULL PREDICTION RESULTS:")
            logger.info(f"  Risk Score: {full_result['risk_score']:.1%}")
            logger.info(f"  Risk Category: {full_result['risk_category']}")
            logger.info(f"  Relevant SNPs Found: {full_result['num_relevant_snps']}")

            # Save the model
            predictor.save('two_stage_predictor_trained.pkl')
            logger.info("SUCCESS: Model saved to 'two_stage_predictor_trained.pkl'")
        else:
            logger.warning("Person classifier training failed or was skipped.")
            predictor.save('snp_only_predictor.pkl')
            logger.info("Saved SNP-only model to 'snp_only_predictor.pkl'")

    except Exception as e:
        logger.error(f"Error in person classifier training: {str(e)[:100]}...")
        logger.info("Continuing with SNP-level model only...")
        predictor.save('snp_only_predictor.pkl')
        logger.info("Saved SNP-only model to 'snp_only_predictor.pkl'")

    # ============================================
    # FINAL SUMMARY
    # ============================================
    logger.info("\n" + "=" * 60)
    logger.info("SYSTEM STATUS SUMMARY")
    logger.info("=" * 60)

    logger.info(f"""
    STAGE 1: SNP Classifier
       Status: COMPLETE
       Target Disease: {TARGET_DISEASE}

    STAGE 2: Person Classifier
       Status: {'COMPLETE' if predictor.person_classifier_trained else 'NOT TRAINED'}

    HOW TO USE:

    1. Load model:
       from model2 import TwoStageDiseasePredictor
       predictor = TwoStageDiseasePredictor.load('two_stage_predictor_trained.pkl')

    2. Prepare new person's genome DataFrame

    3. Predict:
       result = predictor.predict(person_genome)
       print(f"Risk: {{result['risk_score']:.1%}}")
       print(f"Category: {{result['risk_category']}}")

    NEXT STEPS:
    1. Get real individual genotype data
    2. Replace simulated data with real data
    3. Retrain person classifier with real data
    """)

    logger.info("\n" + "=" * 60)
    logger.info("PROGRAM COMPLETED SUCCESSFULLY")
    logger.info("=" * 60)