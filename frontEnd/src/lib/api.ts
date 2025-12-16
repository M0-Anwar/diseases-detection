export const API_BASE_URL = 'https://diseases-detection-wdqcoa.fly.dev';

export interface PredictionResult {
    disease: string;
    has_disease: boolean;
    probability: number;
    risk_level: string;
    percentage: string;
}

export interface PredictionResponse {
    predictions: Record<string, PredictionResult>;
    summary: {
        total_snps_input: number;
        diseases_detected: number;
        diseases_detected_names: string[];
        high_risk_diseases: string[];
        threshold_used: number;
    };
}

export async function fetchExamples() {
    const response = await fetch(`${API_BASE_URL}/examples/snps`);
    if (!response.ok) throw new Error('Failed to fetch examples');
    return response.json();
}

export async function predict(snpList: string[]) {
    const response = await fetch(`${API_BASE_URL}/predict/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snp_list: snpList }),
    });
    if (!response.ok) throw new Error('Prediction failed');
    return response.json() as Promise<PredictionResponse>;
}
