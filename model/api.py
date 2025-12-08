from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib


app = Flask(__name__)
# Enable CORS so frontend can call this API from another origin
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Global variables for model
model = None
scaler = None
model_info = None
feature_columns = None
target_columns = None


def load_model():
    """Load the trained model and artifacts"""
    global model, scaler, model_info, feature_columns, target_columns

    try:
        # Load model
        model = tf.keras.models.load_model('final_disease_model.keras')

        # Load scaler
        scaler = joblib.load('disease_scaler.pkl')

        # Load model info
        model_info = joblib.load('model_info.pkl')

        feature_columns = model_info['feature_columns']
        target_columns = model_info['target_columns']

        print(" Model loaded successfully")
        print(f"  - Features: {len(feature_columns)} SNPs")
        print(f"  - Diseases: {len(target_columns)}")

    except Exception as e:
        print(f"Error loading model: {e}")
        model = None


# Load model on startup
load_model()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if model else 'unhealthy',
        'model_loaded': model is not None,
        'timestamp': pd.Timestamp.now().isoformat()
    })


@app.route('/api/model/info', methods=['GET'])
def model_info_endpoint():
    """Get model information"""
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    return jsonify({
        'model_name': 'Multi-Disease SNP Predictor',
        'input_features': len(feature_columns),
        'output_diseases': len(target_columns),
        'diseases': target_columns,
        'feature_count': len(feature_columns),
        'example_features': feature_columns[:5],  # First 5 SNPs
        'threshold': model_info.get('threshold', 0.5)
    })


def prepare_features(snp_list):
    """Convert SNP list to feature vector"""
    # Create vector of zeros
    features = np.zeros((1, len(feature_columns)))

    # Set 1 for SNPs in the list
    for snp in snp_list:
        if snp in feature_columns:
            idx = feature_columns.index(snp)
            features[0, idx] = 1
        else:
            # Optional: log unknown SNPs
            print(f"Warning: SNP '{snp}' not in model features")

    return features


def predict_diseases(features, threshold=0.5):
    """Make predictions and format results"""
    # Scale features
    features_scaled = scaler.transform(features) if scaler else features

    # Make prediction
    predictions = model.predict(features_scaled, verbose=0)[0]

    # Format results
    results = {}
    for i, disease in enumerate(target_columns):
        prob = float(predictions[i])

        # Determine risk level
        if prob > 0.7:
            risk_level = "HIGH"
        elif prob > 0.5:
            risk_level = "MEDIUM"
        elif prob > 0.3:
            risk_level = "LOW"
        else:
            risk_level = "VERY LOW"

        results[disease] = {
            'probability': prob,
            'has_disease': prob > threshold,
            'risk_level': risk_level,
            'percentage': f"{prob * 100:.1f}%"
        }

    return results


@app.route('/api/predict/list', methods=['POST'])
def predict_from_list():
    """Predict from list of SNP IDs"""
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.get_json()

        if not data or 'snp_list' not in data:
            return jsonify({'error': 'Missing snp_list in request body'}), 400

        snp_list = data['snp_list']
        threshold = data.get('threshold', 0.5)

        # Validate input
        if not isinstance(snp_list, list):
            return jsonify({'error': 'snp_list must be an array'}), 400

        # Prepare features
        features = prepare_features(snp_list)

        # Make prediction
        predictions = predict_diseases(features, threshold)

        # Create summary
        diseases_detected = [d for d, info in predictions.items() if info['has_disease']]
        high_risk = [d for d, info in predictions.items() if info['probability'] > 0.7]

        return jsonify({
            'predictions': predictions,
            'summary': {
                'total_snps_input': len(snp_list),
                'diseases_detected': len(diseases_detected),
                'diseases_detected_names': diseases_detected,
                'high_risk_diseases': high_risk,
                'threshold_used': threshold
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/predict/binary', methods=['POST'])
def predict_from_binary():
    """Predict from binary vector"""
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.get_json()

        if not data or 'binary_vector' not in data:
            return jsonify({'error': 'Missing binary_vector in request body'}), 400

        binary_vector = data['binary_vector']
        threshold = data.get('threshold', 0.5)

        # Validate input
        if not isinstance(binary_vector, list):
            return jsonify({'error': 'binary_vector must be an array'}), 400

        if len(binary_vector) != len(feature_columns):
            return jsonify({
                'error': f'Expected {len(feature_columns)} features, got {len(binary_vector)}'
            }), 400

        # Convert to numpy array
        features = np.array([binary_vector])

        # Make prediction
        predictions = predict_diseases(features, threshold)

        return jsonify({
            'predictions': predictions,
            'summary': {
                'features_processed': len(binary_vector),
                'threshold_used': threshold
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/examples/snps', methods=['GET'])
def example_snps():
    """Get example SNPs for each disease"""
    examples = {
        'Type 2 diabetes': ['rs6947395-T', 'rs7310615-C', 'rs4506565-T'],
        'Glaucoma (primary open-angle)': ['rs327636-A', 'rs11004733-C', 'rs10757272-C'],
        'Non-glioblastoma glioma': ['rs10069690-T', 'rs17752199-A', 'rs2252586-T'],
        'Endometriosis': ['rs77294520-C', 'rs12076373-G', 'rs1519761-G'],
        'Suicide attempts in major depressive disorder or bipolar disorder or schizophrenia': [
            'chr4_23273116-I-?', 'rs75633108-C', 'rs138689899-C'
        ]
    }

    return jsonify(examples)


@app.route('/api/predict/batch', methods=['POST'])
def batch_predict():
    """Batch prediction for multiple patients"""
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.get_json()

        if not data or 'patients' not in data:
            return jsonify({'error': 'Missing patients in request body'}), 400

        patients = data['patients']
        threshold = data.get('threshold', 0.5)

        if not isinstance(patients, list):
            return jsonify({'error': 'patients must be an array'}), 400

        results = []

        for patient in patients:
            if 'patient_id' not in patient or 'snp_list' not in patient:
                continue

            patient_id = patient['patient_id']
            snp_list = patient['snp_list']

            # Prepare features
            features = prepare_features(snp_list)

            # Make prediction
            predictions = predict_diseases(features, threshold)

            # Format patient result
            diseases_detected = [d for d, info in predictions.items() if info['has_disease']]

            results.append({
                'patient_id': patient_id,
                'predictions': predictions,
                'summary': {
                    'snps_count': len(snp_list),
                    'diseases_detected': diseases_detected,
                    'diseases_count': len(diseases_detected)
                }
            })

        return jsonify({'results': results})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)