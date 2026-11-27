from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "BillWise AI Backend",
    }


def test_estimate_bill_valid_150_units():
    response = client.post("/api/bill/estimate", json={"units": 150})
    assert response.status_code == 200
    assert response.json() == {
        "units": 150.0,
        "energy_charges": 550.0,
        "fixed_charges": 70.0,
        "applicable_fees": 27.5,
        "estimated_bill": 647.5,
        "currency": "INR",
    }


def test_estimate_bill_zero_units():
    response = client.post("/api/bill/estimate", json={"units": 0})
    assert response.status_code == 200
    assert response.json() == {
        "units": 0.0,
        "energy_charges": 0.0,
        "fixed_charges": 0.0,
        "applicable_fees": 0.0,
        "estimated_bill": 0.0,
        "currency": "INR",
    }


def test_estimate_bill_negative_units():
    response = client.post("/api/bill/estimate", json={"units": -10})
    assert response.status_code == 422


def test_estimate_bill_missing_units():
    response = client.post("/api/bill/estimate", json={})
    assert response.status_code == 422