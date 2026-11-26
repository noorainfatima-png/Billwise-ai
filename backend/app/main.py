
from fastapi import HTTPException
from pydantic import BaseModel, Field

from app.tariff_engine import calculate_bill


class BillRequest(BaseModel):
    units: float = Field(
        ...,
        ge=0,
        description="Monthly electricity consumption in kWh",
    )


@app.post("/api/calculate")
def calculate_electricity_bill(request: BillRequest):
    try:
        result = calculate_bill(request.units)
        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
