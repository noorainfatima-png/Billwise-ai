
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