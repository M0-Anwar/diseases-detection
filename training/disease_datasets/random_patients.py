import pandas as pd
import numpy as np
import os


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = BASE_DIR

print(f"[INFO] Script directory: {BASE_DIR}")
print(f"[INFO] Loading CSV files from: {DATA_DIR}")

# STEP 1: Load all disease datasets
def load_all_disease_data():
    diseases = {}

    files = [
        'Type_2_diabetes_data.csv',
        'Glaucoma_primary_open-angle_data.csv',
        'Non-glioblastoma_glioma_data.csv',
        'Endometriosis_data.csv',
        'Suicide_attempts_in_major_depressive_disorder_or_bipolar_disorder_or_schizophrenia_data.csv'
    ]

    for file in files:
        path = os.path.join(DATA_DIR, file)

        # --- safety check: file must exist ---
        if not os.path.exists(path):
            raise FileNotFoundError(f"[ERROR] Missing file: {path}")

        print(f"[INFO] Loading: {file}")
        df = pd.read_csv(path)

        disease_name = df['DISEASE/TRAIT'].iloc[0]
        diseases[disease_name] = df

    print(f"[INFO] Loaded {len(diseases)} diseases.")
    return diseases


# STEP 2: Get all unique SNPs
def get_all_snps(diseases):
    all_snps = set()

    for disease_name, df in diseases.items():
        snps = df['SNPS'].dropna().tolist()
        all_snps.update(snps)

    return list(all_snps)


# STEP 3: Create synthetic patients
def create_synthetic_patients(all_snps, diseases, n_patients=1000):
    np.random.seed(42)

    print(f"[INFO] Creating {n_patients} synthetic patients...")

    # Binary SNP presence table
    patients = pd.DataFrame(0, index=range(n_patients), columns=all_snps)

    disease_names = list(diseases.keys())
    disease_labels = pd.DataFrame(0, index=range(n_patients), columns=disease_names)

    for idx in range(n_patients):

        if np.random.random() < 0.7:
            disease = np.random.choice(disease_names)
            disease_snps = diseases[disease]['SNPS'].dropna().tolist()

            n_snps_to_assign = np.random.randint(1, 4)
            chosen_snps = np.random.choice(disease_snps, n_snps_to_assign, replace=False)

            for snp in chosen_snps:
                patients.loc[idx, snp] = 1

            disease_labels.loc[idx, disease] = 1

        else:
            n_random_snps = np.random.randint(0, 5)
            random_snps = np.random.choice(all_snps, n_random_snps, replace=False)
            for snp in random_snps:
                patients.loc[idx, snp] = 1

        if np.random.random() < 0.2:
            random_disease = np.random.choice(disease_names)
            random_snp = np.random.choice(diseases[random_disease]['SNPS'].dropna().tolist())
            patients.loc[idx, random_snp] = 1
            disease_labels.loc[idx, random_disease] = 1

    return patients, disease_labels


# STEP 4: Save dataset
def save_synthetic_data(patients, disease_labels):
    full_data = pd.concat([patients, disease_labels], axis=1)
    out_path = os.path.join(BASE_DIR, "synthetic_patients_data.csv")

    full_data.to_csv(out_path, index=False)

    print("[INFO] Synthetic dataset saved!")
    print(f"[INFO] File location: {out_path}")
    print(f"[INFO] Total patients: {len(patients)}")
    print(f"[INFO] SNP count: {len(patients.columns)}")
    print("[INFO] Disease counts:", disease_labels.sum().to_dict())

    return full_data


# MAIN EXECUTION
if __name__ == "__main__":

    print("Loading disease data...")
    diseases = load_all_disease_data()

    print("\nCollecting unique SNPs...")
    all_snps = get_all_snps(diseases)
    print(f"[INFO] Total unique SNPs: {len(all_snps)}")

    print("\nGenerating synthetic patients...")
    patients, disease_labels = create_synthetic_patients(all_snps, diseases, n_patients=2000)

    print("\nSaving synthetic dataset...")
    combined_data = save_synthetic_data(patients, disease_labels)

    print("\nPreview of synthetic data:")
    print(combined_data.head(5))