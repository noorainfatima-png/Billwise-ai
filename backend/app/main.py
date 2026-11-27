from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.history import list_bill_records, save_bill_record
from app.tariff_engine import calculate_bill_breakdown, forecast_monthly_bill

# Ensure database tables exist on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BillWise AI Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[    
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",

    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BillEstimateRequest(BaseModel):
    units: float = Field(..., ge=0, description="Monthly electricity consumption in kWh")


class BillEstimateResponse(BaseModel):
    units: float
    energy_charges: float
    fixed_charges: float
    applicable_fees: float
    estimated_bill: float
    currency: str = "INR"


class BillForecastRequest(BaseModel):
    units_used_so_far: float = Field(..., ge=0, description="Units consumed so far in current cycle")
    days_elapsed: int = Field(..., ge=1, le=31, description="Number of days elapsed in billing cycle")
    billing_cycle_days: int = Field(default=30, ge=28, le=31, description="Total days in billing cycle")


class BillHistoryCreate(BaseModel):
    month_label: str = Field(..., min_length=1, description="Billing month label, e.g., 'Nov 2026'")
    units: float = Field(..., ge=0, description="Monthly electricity consumption in kWh")


class BillHistoryItem(BaseModel):
    id: int
    month_label: str
    units: float
    energy_charges: float
    fixed_charges: float
    applicable_fees: float
    total_bill: float
    currency: str = "INR"


@app.get("/")
def home():
    return {"message": "BillWise AI Backend is running"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "BillWise AI Backend"}


@app.post("/api/bill/estimate", response_model=BillEstimateResponse)
def estimate_bill(payload: BillEstimateRequest):
    try:
        breakdown = calculate_bill_breakdown(payload.units)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return BillEstimateResponse(
        units=payload.units,
        energy_charges=breakdown["energy_charges"],
        fixed_charges=breakdown["fixed_charges"],
        applicable_fees=breakdown["applicable_fees"],
        estimated_bill=breakdown["total_bill"],
        currency="INR",
    )


@app.post("/api/bill/forecast")
def forecast_bill(payload: BillForecastRequest):
    try:
        forecast = forecast_monthly_bill(
            units_used_so_far=payload.units_used_so_far,
            days_elapsed=payload.days_elapsed,
            billing_cycle_days=payload.billing_cycle_days,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {**forecast, "currency": "INR"}


@app.post("/api/bill/history", response_model=BillHistoryItem)
def create_bill_history(payload: BillHistoryCreate, db: Session = Depends(get_db)):
    breakdown = calculate_bill_breakdown(payload.units)
    record = save_bill_record(
        db=db,
        month_label=payload.month_label,
        units=payload.units,
        energy_charges=breakdown["energy_charges"],
        fixed_charges=breakdown["fixed_charges"],
        applicable_fees=breakdown["applicable_fees"],
        total_bill=breakdown["total_bill"],
    )
    return BillHistoryItem(
        id=record.id,
        month_label=record.month_label,
        units=record.units,
        energy_charges=record.energy_charges,
        fixed_charges=record.fixed_charges,
        applicable_fees=record.applicable_fees,
        total_bill=record.total_bill,
        currency="INR",
    )


@app.get("/api/bill/history", response_model=list[BillHistoryItem])
def get_bill_history(limit: int = 20, db: Session = Depends(get_db)):
    records = list_bill_records(db=db, limit=limit)
    return [
        BillHistoryItem(
            id=r.id,
            month_label=r.month_label,
            units=r.units,
            energy_charges=r.energy_charges,
            fixed_charges=r.fixed_charges,
            applicable_fees=r.applicable_fees,
            total_bill=r.total_bill,
            currency="INR",
        )
        for r in records
    ]