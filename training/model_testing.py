import pandas as pd
from tensorflow import keras
import joblib
import os

print("DISEASE PREDICTION MODEL - TEST ")

# LOAD SAVED MODEL AND ARTIFACTS
def load_model_artifacts():
    try:
        print("\nLoading model files...")

        BASE_DIR = os.path.dirname(os.path.abspath(__file__))

        model_path = os.path.join(BASE_DIR, "final_disease_model.keras")
        scaler_path = os.path.join(BASE_DIR, "disease_scaler.pkl")
        info_path = os.path.join(BASE_DIR, "model_info.pkl")

        model = keras.models.load_model(model_path)
        print("Model loaded successfully.")

        scaler = joblib.load(scaler_path)
        print("Scaler loaded successfully.")

        model_info = joblib.load(info_path)
        print("Model info loaded successfully.")

        return model, scaler, model_info

    except Exception as e:
        print(f"\nERROR: Failed to load model artifacts - {e}")
        exit(1)

# Load everything
model, scaler, model_info = load_model_artifacts()

# PREDICTION FUNCTION
def predict_disease_risk(patient_snps, threshold=0.5):

    # Convert input to dictionary if it's a list
    if isinstance(patient_snps, list):
        patient_dict = {snp: 1 for snp in patient_snps}
    else:
        patient_dict = patient_snps

    # Create feature vector with zeros
    features = pd.DataFrame(0, index=[0], columns=model_info['feature_columns'])

    # Fill in the patient's SNPs
    for snp, value in patient_dict.items():
        if snp in features.columns:
            features.loc[0, snp] = value
        else:
            print(f" Warning: SNP '{snp}' not recognized by model")

    # Scale the features
    features_scaled = scaler.transform(features)

    # Make prediction
    predictions = model.predict(features_scaled, verbose=0)

    # Format results
    results = {}
    for i, disease in enumerate(model_info['target_columns']):
        prob = float(predictions[0, i])

        # Determine risk level
        if prob > 0.7:
            risk_level = " HIGH RISK"
        elif prob > 0.5:
            risk_level = " MEDIUM RISK"
        elif prob > 0.3:
            risk_level = " LOW RISK"
        else:
            risk_level = " VERY LOW RISK"

        results[disease] = {
            'probability': prob,
            'has_disease': prob > threshold,
            'risk_level': risk_level,
            'percentage': f"{prob * 100:.1f}%"
        }

    return results


def print_predictions(results, patient_snps=None):
    print(" DISEASE RISK PREDICTION RESULTS")
    if patient_snps:
        if isinstance(patient_snps, list):
            print(f"Input SNPs ({len(patient_snps)}): {', '.join(patient_snps[:3])}")
            if len(patient_snps) > 3:
                print(f"             ... and {len(patient_snps) - 3} more SNPs")
        else:
            print("Input SNPs: Custom SNP profile")

    print("\nDISEASE RISK ASSESSMENT:")

    sorted_results = sorted(results.items(),
                            key=lambda x: x[1]['probability'],
                            reverse=True)

    positive_count = 0
    for disease, info in sorted_results:
        prob = info['probability']

        if info['has_disease']:
            status = " POSITIVE"
            positive_count += 1
        else:
            status = "NEGATIVE"

        # Truncate long disease names
        display_name = disease[:35] + "..." if len(disease) > 35 else disease

    # Summary
    if positive_count > 0:
        print(f"\n ALERT: {positive_count} disease(s) detected:")
        for disease, info in sorted_results:
            if info['has_disease']:
                print(f"   • {disease}: {info['percentage']} risk")
    else:
        print("\n No diseases detected - Patient appears healthy!")

    # Top recommendations
    print(f"\n RECOMMENDATIONS:")
    high_risk_diseases = [d for d, info in results.items() if info['probability'] > 0.3]
    for disease in high_risk_diseases[:2]:  # Top 2 highest risks
        simple_name = disease.split('(')[0].strip() if '(' in disease else disease
        print(f"   • Consider screening for {simple_name}")

# PRE-DEFINED TEST CASES
def run_test_cases():
    print("PRE-DEFINED TEST CASES")
    # Test Case 1: Type 2 Diabetes
    print("\n TEST CASE: Type 2 Diabetes Risk")
    test_snps_1 = ['rs6947395-T', 'rs7310615-C']
    results = predict_disease_risk(test_snps_1)
    print_predictions(results, test_snps_1)

    # Test Case 2: Glaucoma
    print("\n\n TEST CASE: Glaucoma Risk")
    test_snps_2 = ['rs327636-A', 'rs11004733-C']
    results = predict_disease_risk(test_snps_2)
    print_predictions(results, test_snps_2)

    # Test Case 3: Multiple Diseases
    print("\n\n TEST CASE: Multiple Disease Risk")
    test_snps_3 = ['rs6947395-T', 'rs327636-A', 'rs77294520-C', 'rs11004733-C']
    results = predict_disease_risk(test_snps_3)
    print_predictions(results, test_snps_3)

    # Test Case 4: Healthy Person
    print("\n\n TEST CASE: Healthy Individual")
    test_snps_4 = ['rs12219514-A', 'rs531347476-C']
    results = predict_disease_risk(test_snps_4)
    print_predictions(results, test_snps_4)

# INTERACTIVE TESTING
def interactive_test():
    print(" INTERACTIVE TESTING")
    while True:
        print("\nOptions:")
        print("1. Enter your own SNPs")
        print("2. Run pre-defined test cases")
        print("3. Exit")

        choice = input("\nEnter choice (1-3): ").strip()

        if choice == '1':
            print("\nEnter SNPs one per line (press Enter twice when done):")
            print("Format: SNP_ID (e.g., rs6947395-T)")
            print("Leave blank and press Enter to finish")

            snps_list = []
            while True:
                snp = input(f"SNP {len(snps_list) + 1}: ").strip()
                if snp == "":
                    if len(snps_list) > 0:
                        break
                    else:
                        print("Please enter at least one SNP")
                else:
                    snps_list.append(snp)

            if snps_list:
                print(f"\nAnalyzing {len(snps_list)} SNPs...")
                results = predict_disease_risk(snps_list)
                print_predictions(results, snps_list)
            else:
                print("No SNPs entered!")

        elif choice == '2':
            run_test_cases()

        elif choice == '3':
            print("\nExiting...")
            break

        else:
            print("Invalid choice! Please enter 1, 2, or 3")


# SINGLE PATIENT TEST (Simple Function)

def quick_test(snp_list):
    results = predict_disease_risk(snp_list)

    # Simple output format
    output = {
        'predictions': results,
        'summary': {
            'total_snps': len(snp_list),
            'diseases_detected': sum(1 for info in results.values() if info['has_disease']),
            'high_risk_diseases': [
                disease for disease, info in results.items()
                if info['probability'] > 0.7
            ]
        }
    }

    return output


# MAIN EXECUTION

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("MODEL INFORMATION")
    print("=" * 60)

    print(f"\nModel Details:")
    print(f"  • Input features: {model_info['input_shape']} SNPs")
    print(f"  • Output diseases: {model_info['output_shape']}")
    print(f"  • Prediction threshold: {model_info['threshold']}")

    print(f"\nAvailable Diseases:")
    for i, disease in enumerate(model_info['target_columns'], 1):
        print(f"  {i}. {disease}")

    print(f"\nExample SNPs recognized by model:")
    print(f"  • {model_info['feature_columns'][0]}")
    print(f"  • {model_info['feature_columns'][1]}")
    print(f"  • {model_info['feature_columns'][2]}")
    print(f"  • ... and {len(model_info['feature_columns']) - 3} more")

    # Ask user what to do
    print("\n" + "=" * 60)
    print("What would you like to do?")
    print("1. Run interactive testing")
    print("2. Run pre-defined test cases")
    print("3. Exit")

    while True:
        choice = input("\nEnter choice (1-3): ").strip()

        if choice == '1':
            interactive_test()
            break
        elif choice == '2':
            run_test_cases()
            break
        elif choice == '3':
            print("\nGoodbye!")
            break
        else:
            print("Invalid choice! Please enter 1, 2, or 3")