def calculate_bill(units: float) -> float:
    """
    Calculate an estimated electricity bill.

    Args:
        units: Monthly electricity consumption in kWh.

    Returns:
        Estimated electricity charge in rupees.
    """

    if units < 0:
        raise ValueError("Units cannot be negative")

    if units <= 50:
        bill = units * 1.95

    elif units <= 100:
        bill = units * 3.10

    elif units <= 200:
        bill = (100 * 3.10) + ((units - 100) * 4.80)

    else:
        bill = (100 * 3.10) + (100 * 4.80) + (
            (units - 200) * 7.70
        )

    return round(bill, 2)


def calculate_bill_breakdown(units: float) -> dict:
    """
    Calculate an itemized electricity bill breakdown.

    Args:
        units: Monthly electricity consumption in kWh.

    Returns:
        Dictionary containing energy_charges, fixed_charges,
        applicable_fees, and total_bill in rupees.
    """
    energy_charges = calculate_bill(units)

    if units == 0:
        fixed_charges = 0.0
    elif units <= 100:
        fixed_charges = 40.0
    elif units <= 200:
        fixed_charges = 70.0
    else:
        fixed_charges = 110.0

    # 5% electricity duty / customer surcharge on energy charges
    applicable_fees = round(energy_charges * 0.05, 2)
    total_bill = round(energy_charges + fixed_charges + applicable_fees, 2)

    return {
        "energy_charges": energy_charges,
        "fixed_charges": fixed_charges,
        "applicable_fees": applicable_fees,
        "total_bill": total_bill,
    }


def forecast_monthly_bill(
    units_used_so_far: float,
    days_elapsed: int,
    billing_cycle_days: int = 30,
) -> dict:
    """
    Project end-of-month electricity consumption and bill based on current daily average.
    """
    if units_used_so_far < 0:
        raise ValueError("Units used cannot be negative")
    if days_elapsed <= 0 or days_elapsed > billing_cycle_days:
        raise ValueError("Days elapsed must be between 1 and billing_cycle_days")

    daily_average = round(units_used_so_far / days_elapsed, 2)
    projected_units = round(daily_average * billing_cycle_days, 2)

    current_breakdown = calculate_bill_breakdown(units_used_so_far)
    projected_breakdown = calculate_bill_breakdown(projected_units)

    if projected_units > 200:
        slab_alert = "High usage alert: Projected to enter the ₹7.70/unit slab (above 200 units)."
    elif projected_units > 100:
        slab_alert = "Moderate usage: Projected to enter the ₹4.80/unit slab (101–200 units)."
    else:
        slab_alert = "Within lower tariff slab (up to 100 units)."

    return {
        "units_used_so_far": units_used_so_far,
        "days_elapsed": days_elapsed,
        "billing_cycle_days": billing_cycle_days,
        "daily_average_units": daily_average,
        "projected_units": projected_units,
        "current_bill_so_far": current_breakdown["total_bill"],
        "projected_total_bill": projected_breakdown["total_bill"],
        "projected_breakdown": projected_breakdown,
        "slab_alert": slab_alert,
    }