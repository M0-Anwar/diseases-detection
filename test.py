import pandas as pd
import numpy as np
import requests
import json
import tempfile
import os
from io import StringIO

# Import your model's simulation functions
from model2 import simulate_gwas_data, simulate_individual_genome

# API endpoint
API_URL = "http://localhost:5000"


def create_test_snp_data(num_snps=200):
    """
    Create test SNP data using your simulation functions
    Returns: pandas DataFrame with required columns
    """
    print(f"Generating test data with {num_snps} SNPs...")

    # First, create GWAS data
    gwas_df = simulate_gwas_data(n_snps=10000)

    # Create a simulated individual genome
    person_genome = simulate_individual_genome(gwas_df, snps_per_person=num_snps)

    return person_genome


def test_api_with_generated_data():
    """Test the API with generated SNP data"""
    print("=" * 50)
    print("Testing Disease Prediction API")
    print("=" * 50)

    # Step 1: Check API health
    print("\n1. Testing API health...")
    try:
        response = requests.get(f"{API_URL}/api/health")
        if response.status_code == 200:
            health_data = response.json()
            print(f"✓ API is healthy")
            print(f"  Model loaded: {health_data.get('model_loaded', False)}")
            print(f"  Target disease: {health_data.get('target_disease', 'Unknown')}")
        else:
            print(f"✗ API health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"✗ Cannot connect to API: {e}")
        print(f"  Make sure the API is running on {API_URL}")
        return

    # Step 2: Get model info
    print("\n2. Getting model information...")
    try:
        response = requests.get(f"{API_URL}/api/model/info")
        if response.status_code == 200:
            model_info = response.json()
            print(f"✓ Model info retrieved")
            print(f"  Disease: {model_info.get('target_disease', 'Unknown')}")
            print(f"  Person classifier trained: {model_info.get('person_classifier_trained', False)}")
            print(f"  Feature count: {model_info.get('feature_count', 0)}")
        else:
            print(f"✗ Failed to get model info: {response.status_code}")
    except Exception as e:
        print(f"✗ Error getting model info: {e}")

    # Step 3: Generate test data
    print("\n3. Generating test SNP data...")
    test_data = create_test_snp_data(num_snps=150)
    print(f"✓ Generated {len(test_data)} SNPs")
    print(f"  Columns: {list(test_data.columns)}")
    print(f"  Sample SNP: {test_data.iloc[0]['SNPS']}")

    # Step 4: Test JSON endpoint
    print("\n4. Testing prediction via JSON endpoint...")

    # Convert DataFrame to JSON
    json_data = test_data.to_dict(orient='records')

    # Send to API
    try:
        headers = {'Content-Type': 'application/json'}
        response = requests.post(
            f"{API_URL}/api/predict/json",
            json=json_data,
            headers=headers
        )

        if response.status_code == 200:
            result = response.json()
            print(f"✓ Prediction successful!")
            print(f"  Risk score: {result['prediction']['risk_score']:.2%}")
            print(f"  Risk category: {result['prediction']['risk_category']}")
            print(f"  Relevant SNPs: {result['prediction']['num_relevant_snps']}")
            print(f"  Disease: {result['prediction']['target_disease']}")

            # Print explanation
            print(f"\n  Explanation:")
            for line in result['explanation'].split('\n')[:5]:  # Show first 5 lines
                print(f"    {line}")

            # Save result to file
            with open('prediction_result.json', 'w') as f:
                json.dump(result, f, indent=2)
            print(f"\n✓ Full results saved to 'prediction_result.json'")

        else:
            print(f"✗ Prediction failed: {response.status_code}")
            print(f"  Error: {response.text}")

    except Exception as e:
        print(f"✗ Error during prediction: {e}")

    # Step 5: Test file upload endpoint
    print("\n5. Testing prediction via file upload...")

    # Save test data to CSV
    csv_file = tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False)
    test_data.to_csv(csv_file.name, index=False)
    csv_file.close()

    try:
        with open(csv_file.name, 'rb') as f:
            files = {'file': (os.path.basename(csv_file.name), f, 'text/csv')}
            response = requests.post(f"{API_URL}/api/predict/upload", files=files)

        if response.status_code == 200:
            result = response.json()
            print(f"✓ File upload prediction successful!")
            print(f"  Risk score: {result['prediction']['risk_score']:.2%}")
        else:
            print(f"✗ File upload failed: {response.status_code}")
            print(f"  Error: {response.text}")

    except Exception as e:
        print(f"✗ Error during file upload: {e}")
    finally:
        # Clean up temp file
        os.unlink(csv_file.name)

    # Step 6: Test feature importance
    print("\n6. Getting feature importance...")
    try:
        response = requests.get(f"{API_URL}/api/features/importance")
        if response.status_code == 200:
            features = response.json()
            if 'feature_importance' in features:
                print(f"✓ Retrieved feature importance")
                print(f"  Top 5 features:")
                for i, feature in enumerate(features['feature_importance'][:5], 1):
                    print(f"    {i}. {feature['feature']}: {feature['importance']:.4f}")
            else:
                print(f"  No feature importance available")
        else:
            print(f"✗ Failed to get feature importance: {response.status_code}")
    except Exception as e:
        print(f"✗ Error getting feature importance: {e}")

    print("\n" + "=" * 50)
    print("Test completed!")
    print("=" * 50)


def quick_test():
    """Quick test without API - directly using the model"""
    print("=" * 50)
    print("Quick Direct Model Test")
    print("=" * 50)

    try:
        # Import your model
        from model2 import TwoStageDiseasePredictor

        # Load or create model
        model_file = 'two_stage_predictor_trained.pkl'
        if os.path.exists(model_file):
            print(f"Loading model from {model_file}...")
            predictor = TwoStageDiseasePredictor.load(model_file)
        else:
            print("Creating new model with simulated data...")
            # Create and train a model
            gwas_df = simulate_gwas_data(n_snps=5000)
            predictor = TwoStageDiseasePredictor("diabetes")
            predictor.train_snp_classifier(gwas_df)

        # Generate test data
        gwas_df = simulate_gwas_data(n_snps=10000)
        test_person = simulate_individual_genome(gwas_df, snps_per_person=200)

        print(f"\nMaking prediction for test person...")
        print(f"Test data shape: {test_person.shape}")

        # Make prediction
        result = predictor.predict(test_person)

        print(f"\nPrediction Results:")
        print(f"  Risk Score: {result['risk_score']:.2%}")
        print(f"  Risk Category: {result['risk_category']}")
        print(f"  Relevant SNPs Found: {result['num_relevant_snps']}")

        print(f"\nExplanation:")
        print(result['explanation'])

        # Save the model if it was newly created
        if not os.path.exists(model_file):
            predictor.save(model_file)
            print(f"\n✓ Model saved to {model_file}")

    except Exception as e:
        print(f"Error during direct test: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("Disease Prediction System Test")
    print()
    print("Options:")
    print("1. Test API (requires API to be running)")
    print("2. Quick direct model test")
    print("3. Create sample CSV file")

    choice = input("\nEnter choice (1-3): ").strip()

    if choice == '1':
        # Ask for API URL
        custom_url = input(f"Enter API URL [default: {API_URL}]: ").strip()
        if custom_url:
            API_URL = custom_url
        test_api_with_generated_data()

    elif choice == '2':
        quick_test()

    elif choice == '3':
        # Create a sample CSV file
        print("\nCreating sample CSV file...")
        sample_data = create_test_snp_data(num_snps=50)

        # Save to file
        filename = "sample_patient_snps.csv"
        sample_data.to_csv(filename, index=False)
        print(f"✓ Sample data saved to '{filename}'")
        print(f"  Rows: {len(sample_data)}")
        print(f"  Columns: {len(sample_data.columns)}")
        print(f"\nYou can now use this file to test the API.")

        # Show first few rows
        print("\nFirst few rows:")
        print(sample_data.head(3).to_string())

    else:
        print("Invalid choice. Exiting.")