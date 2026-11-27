from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = "sqlite:///./test_billwise.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db


def teardown_function():
    app.dependency_overrides.clear()


client = TestClient(app)


def test_create_and_list_bill_history():
    create_response = client.post(
        "/api/bill/history",
        json={"month_label": "Nov 2026", "units": 150.0},
    )
    assert create_response.status_code == 200
    created = create_response.json()
    assert created["month_label"] == "Nov 2026"
    assert created["units"] == 150.0
    assert created["total_bill"] > 0

    list_response = client.get("/api/bill/history")
    assert list_response.status_code == 200
    items = list_response.json()
    assert len(items) == 1
    assert items[0]["month_label"] == "Nov 2026"


def test_forecast_bill_endpoint():
    response = client.post(
        "/api/bill/forecast",
        json={
            "units_used_so_far": 110.0,
            "days_elapsed": 15,
            "billing_cycle_days": 30,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["daily_average_units"] == 7.33
    assert data["projected_units"] == 219.9
    assert data["projected_total_bill"] > data["current_bill_so_far"]