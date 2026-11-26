
from fastapi import FastAPI

app = FastAPI(
    title="BillWise AI Backend",
    version="1.0.0",
)


@app.get("/")
def home():
    return {
        "message": "BillWise AI Backend is running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BillWise AI Backend"
    }
