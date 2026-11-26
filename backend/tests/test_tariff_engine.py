import pytest
from app.tariff_engine import calculate_bill


def test_zero_units():
    assert calculate_bill(0) == 0


def test_50_units():
    assert calculate_bill(50) == 97.5


def test_100_units():
    assert calculate_bill(100) == 310


def test_150_units():
    assert calculate_bill(150) == 550


def test_negative_units():
    with pytest.raises(ValueError):
        calculate_bill(-10)
