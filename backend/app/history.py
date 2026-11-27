from sqlalchemy.orm import Session
from app.models import BillRecord


def save_bill_record(
    db: Session,
    month_label: str,
    units: float,
    energy_charges: float,
    fixed_charges: float,
    applicable_fees: float,
    total_bill: float,
) -> BillRecord:
    record = BillRecord(
        month_label=month_label,
        units=units,
        energy_charges=energy_charges,
        fixed_charges=fixed_charges,
        applicable_fees=applicable_fees,
        total_bill=total_bill,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_bill_records(db: Session, limit: int = 20) -> list[BillRecord]:
    return (
        db.query(BillRecord)
        .order_by(BillRecord.id.desc())
        .limit(limit)
        .all()
    )