import tensorflow as tf
import numpy as np
import joblib

MODEL_PATH = "models/best_disease_model.keras"
SCALER_PATH = "models/disease_scaler.pkl"
INFO_PATH = "models/model_info.pkl"

model = tf.keras.models.load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
model_info = joblib.load(INFO_PATH)

feature_columns = model_info["feature_columns"]
target_columns = model_info["target_columns"]


def prepare_features(snp_list):
    features = np.zeros((1, len(feature_columns)))
    for snp in snp_list:
        if snp in feature_columns:
            features[0, feature_columns.index(snp)] = 1
    return features


def predict_diseases(features, threshold=0.5):
    features_scaled = scaler.transform(features)
    predictions = model.predict(features_scaled, verbose=0)[0]

    results = {}
    for i, disease in enumerate(target_columns):
        prob = float(predictions[i])

        if prob > 0.7:
            risk = "HIGH"
        elif prob > 0.5:
            risk = "MEDIUM"
        elif prob > 0.3:
            risk = "LOW"
        else:
            risk = "VERY LOW"

        results[disease] = {
            "probability": prob,
            "has_disease": prob > threshold,
            "risk_level": risk,
            "percentage": f"{prob * 100:.1f}%"
        }

    return results
