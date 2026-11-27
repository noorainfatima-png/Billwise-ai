from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, String
from app.database import Base


class BillRecord(Base):
    __tablename__ = "bill_records"

    id = Column(Integer, primary_key=True, index=True)
    month_label = Column(String, nullable=False)
    units = Column(Float, nullable=False)
    energy_charges = Column(Float, nullable=False)
    fixed_charges = Column(Float, nullable=False)
    applicable_fees = Column(Float, nullable=False)
    total_bill = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))