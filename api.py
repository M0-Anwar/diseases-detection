import os
import json
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import logging
from model2 import TwoStageDiseasePredictor
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()
app.config['ALLOWED_EXTENSIONS'] = {'csv', 'tsv', 'txt'}
app.config['MODEL_PATH'] = 'two_stage_predictor_trained.pkl'

# Global model variable
model = None


def load_model():
    """Load the trained model"""
    global model
    try:
        if os.path.exists(app.config['MODEL_PATH']):
            model = TwoStageDiseasePredictor.load(app.config['MODEL_PATH'])
            logger.info(f"Model loaded successfully. Target disease: {model.target_disease}")
            return True
        else:
            logger.error(f"Model file not found: {app.config['MODEL_PATH']}")
            return False
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def validate_genome_data(df):
    """Validate the uploaded genome data"""
    # Required columns from your model
    required_columns = [
        'REGION', 'CHR_ID', 'MAPPED_GENE', 'SNPS', 'CONTEXT',
        'INTERGENIC', 'RISK_ALLELE_FREQUENCY', 'P_VALUE', 'P_VALUE_MLOG',
        'CI_95', 'EFFECT_LOWER', 'EFFECT_UPPER', 'EFFECT_MIDPOINT',
        'EFFECT_DIRECTION_ENCODED', 'IS_INTERGENIC', 'HAS_KNOWN_GENE',
        'IS_SIGNIFICANT_0_05', 'IS_SIGNIFICANT_0_01', 'IS_SIGNIFICANT_5e_8',
        'P_VALUE_CATEGORY'
    ]

    missing_cols = [col for col in required_columns if col not in df.columns]

    if missing_cols:
        return False, f"Missing required columns: {missing_cols}"

    # Check for NaN values in critical columns
    critical_cols = ['SNPS', 'EFFECT_MIDPOINT', 'P_VALUE']
    for col in critical_cols:
        if df[col].isnull().any():
            return False, f"Missing values in column: {col}"

    return True, "Data validation successful"


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = "loaded" if model else "not loaded"
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_status': model_status,
        'target_disease': model.target_disease if model else None
    })


@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if not model:
        return jsonify({'error': 'Model not loaded'}), 400

    return jsonify({
        'target_disease': model.target_disease,
        'person_classifier_trained': model.person_classifier_trained,
        'feature_count': len(model.feature_columns) if model.feature_columns else 0,
        'model_type': 'Two-Stage Disease Predictor'
    })


@app.route('/api/predict/upload', methods=['POST'])
def predict_from_upload():
    """
    Endpoint for file upload and prediction
    Accepts: CSV file with genomic data
    Returns: Prediction results
    """
    if not model:
        return jsonify({'error': 'Model not loaded. Please load model first.'}), 400

    # Check if file is in request
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Please upload CSV, TSV, or TXT.'}), 400

    try:
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Read the file
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        elif filename.endswith('.tsv'):
            df = pd.read_csv(filepath, sep='\t')
        else:
            # Try to auto-detect delimiter
            df = pd.read_csv(filepath, sep=None, engine='python')

        # Validate data
        is_valid, message = validate_genome_data(df)
        if not is_valid:
            return jsonify({'error': f'Invalid data format: {message}'}), 400

        # Get optional parameters
        disease_filter = request.form.get('disease', model.target_disease)

        # Ensure we only predict for the model's trained disease
        if disease_filter != model.target_disease:
            return jsonify({
                'error': f'Model trained for {model.target_disease}, not {disease_filter}'
            }), 400

        logger.info(f"Processing {len(df)} SNPs for disease: {disease_filter}")

        # Make prediction
        result = model.predict(df)

        # Clean up temporary file
        os.remove(filepath)

        # Prepare response
        response = {
            'status': 'success',
            'prediction': {
                'risk_score': float(result['risk_score']),
                'risk_category': result['risk_category'],
                'num_relevant_snps': result['num_relevant_snps'],
                'target_disease': model.target_disease
            },
            'explanation': result['explanation'],
            'statistics': {
                'total_snps_processed': len(df),
                'relevant_snps_percentage': (result['num_relevant_snps'] / len(df)) * 100 if len(df) > 0 else 0
            }
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@app.route('/api/predict/json', methods=['POST'])
def predict_from_json():
    """
    Endpoint for JSON data input
    Accepts: JSON array of SNP data
    """
    if not model:
        return jsonify({'error': 'Model not loaded'}), 400

    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        # Convert JSON to DataFrame
        df = pd.DataFrame(data)

        # Validate data
        is_valid, message = validate_genome_data(df)
        if not is_valid:
            return jsonify({'error': f'Invalid data format: {message}'}), 400

        # Make prediction
        result = model.predict(df)

        # Prepare response
        response = {
            'status': 'success',
            'prediction': {
                'risk_score': float(result['risk_score']),
                'risk_category': result['risk_category'],
                'num_relevant_snps': result['num_relevant_snps'],
                'target_disease': model.target_disease
            },
            'explanation': result['explanation'],
            'statistics': {
                'total_snps_processed': len(df)
            }
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"JSON prediction error: {str(e)}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@app.route('/api/batch/predict', methods=['POST'])
def batch_predict():
    """
    Endpoint for batch predictions (multiple individuals)
    Accepts: ZIP file containing multiple CSV files or a multi-sheet Excel file
    """
    if not model:
        return jsonify({'error': 'Model not loaded'}), 400

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']

    try:
        results = []

        if file.filename.endswith('.zip'):
            import zipfile
            from io import BytesIO

            # Process ZIP file
            with zipfile.ZipFile(BytesIO(file.read())) as z:
                for filename in z.namelist():
                    if filename.endswith('.csv'):
                        with z.open(filename) as f:
                            df = pd.read_csv(f)

                            # Validate and predict
                            is_valid, _ = validate_genome_data(df)
                            if is_valid:
                                result = model.predict(df)
                                results.append({
                                    'patient_id': filename.replace('.csv', ''),
                                    'risk_score': float(result['risk_score']),
                                    'risk_category': result['risk_category'],
                                    'num_relevant_snps': result['num_relevant_snps']
                                })

        elif file.filename.endswith(('.xlsx', '.xls')):
            # Process Excel file
            df_dict = pd.read_excel(file, sheet_name=None)

            for sheet_name, df in df_dict.items():
                is_valid, _ = validate_genome_data(df)
                if is_valid:
                    result = model.predict(df)
                    results.append({
                        'patient_id': sheet_name,
                        'risk_score': float(result['risk_score']),
                        'risk_category': result['risk_category'],
                        'num_relevant_snps': result['num_relevant_snps']
                    })

        else:
            return jsonify({'error': 'Unsupported file format for batch processing'}), 400

        return jsonify({
            'status': 'success',
            'predictions': results,
            'total_patients': len(results),
            'target_disease': model.target_disease
        })

    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        return jsonify({'error': f'Batch prediction failed: {str(e)}'}), 500


@app.route('/api/features/importance', methods=['GET'])
def feature_importance():
    """Get feature importance from the model"""
    if not model or not model.snp_classifier:
        return jsonify({'error': 'Model not loaded or trained'}), 400

    try:
        # Get feature importance from SNP classifier
        if hasattr(model.snp_classifier, 'feature_importances_'):
            importance_data = []
            for i, (feature, importance) in enumerate(
                    zip(model.feature_columns, model.snp_classifier.feature_importances_)
            ):
                importance_data.append({
                    'feature': feature,
                    'importance': float(importance),
                    'rank': i + 1
                })

            # Sort by importance
            importance_data.sort(key=lambda x: x['importance'], reverse=True)

            return jsonify({
                'status': 'success',
                'feature_importance': importance_data[:20]  # Top 20 features
            })
        else:
            return jsonify({'error': 'Feature importance not available'}), 400

    except Exception as e:
        logger.error(f"Feature importance error: {str(e)}")
        return jsonify({'error': f'Failed to get feature importance: {str(e)}'}), 500


@app.route('/api/sample/data', methods=['GET'])
def sample_data():
    """Get sample data format for testing"""
    sample_snp = {
        "REGION": "chr1.12345",
        "CHR_ID": "1",
        "MAPPED_GENE": "GENE_ABC",
        "SNPS": "rs12345",
        "CONTEXT": "intron",
        "INTERGENIC": "N",
        "RISK_ALLELE_FREQUENCY": 0.25,
        "P_VALUE": 0.0001,
        "P_VALUE_MLOG": 4.0,
        "CI_95": "[0.95-1.05]",
        "EFFECT_LOWER": 0.9,
        "EFFECT_UPPER": 1.1,
        "EFFECT_MIDPOINT": 1.0,
        "EFFECT_DIRECTION_ENCODED": 1,
        "IS_INTERGENIC": 0,
        "HAS_KNOWN_GENE": 1,
        "IS_SIGNIFICANT_0_05": 1,
        "IS_SIGNIFICANT_0_01": 1,
        "IS_SIGNIFICANT_5e_8": 0,
        "P_VALUE_CATEGORY": "high_sig"
    }

    return jsonify({
        "sample_format": "JSON array of SNP objects",
        "required_fields": list(sample_snp.keys()),
        "example_single_snp": sample_snp,
        "note": "Upload multiple SNPs (typically 200-500 per individual)"
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Load model on startup
    if load_model():
        logger.info("Starting API server...")
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        logger.error("Failed to load model. API cannot start.")