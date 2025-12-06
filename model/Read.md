# Disease Prediction API Documentation

## Overview
This API provides a two-stage disease prediction system for genetic risk assessment using SNP data.

## Base URL
`http://localhost:5000` (local development)
`https://your-domain.com` (production)

## Authentication
Currently no authentication. Add API keys or JWT tokens for production.

## Endpoints

### 1. Health Check
**GET** `/api/health`
Check if API and model are running.

### 2. Model Information
**GET** `/api/model/info`
Get information about the loaded model.

### 3. Predict from File Upload
**POST** `/api/predict/upload`
Upload CSV/TSV file with SNP data.

**Parameters:**
- `file`: CSV/TSV file (required)
- `disease`: Target disease (optional, defaults to trained disease)

### 4. Predict from JSON
**POST** `/api/predict/json`
Send SNP data as JSON array.

**Request Body:**
```json
[
  {
    "REGION": "chr1.12345",
    "CHR_ID": "1",
    "SNPS": "rs12345",
    ... // all required columns
  }
]