from fastapi import FastAPI

app = FastAPI(
    title="BillWise AI",
    description="Electricity Bill Predictor",
    version="1.0.0",
)


@app.get("/")
def home():
    return {
        "message": "Welcome to BillWise AI",
        "status": "running",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BillWise AI Backend",
    }
