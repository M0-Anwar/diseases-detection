from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.model_loader import prepare_features, predict_diseases, feature_columns

router = APIRouter(prefix="/api")

class SNPListInput(BaseModel):
    snp_list: list[str]
    threshold: float = 0.5


@router.get("/health")
def health():
    return {"status": "healthy"}


@router.post("/predict/list")
def predict_from_list(data: SNPListInput):
    features = prepare_features(data.snp_list)
    predictions = predict_diseases(features, data.threshold)

    detected = [d for d, v in predictions.items() if v["has_disease"]]

    return {
        "predictions": predictions,
        "summary": {
            "total_snps_input": len(data.snp_list),
            "diseases_detected": detected,
            "count": len(detected)
        }
    }
