# Use official Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy requirements first (caching optimization)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code
COPY . .

# Expose the port your FastAPI app will use
EXPOSE 8080

# Start FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]

