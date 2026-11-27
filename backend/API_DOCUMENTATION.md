
# BillWise AI - Backend API Documentation

## Base URL

http://127.0.0.1:8000

## Health Check

GET /api/health

Response:
{
  "status": "healthy",
  "service": "BillWise AI Backend"
}

## Estimate Bill

POST /api/bill/estimate

Request:
{
  "units": 150
}

Response fields:
- units
- energy_charges
- fixed_charges
- applicable_fees
- estimated_bill
- currency

## Forecast Bill

POST /api/bill/forecast

Request:
{
  "units_used_so_far": 120,
  "days_elapsed": 15,
  "billing_cycle_days": 30
}

## Save Bill History

POST /api/bill/history

Request:
{
  "month_label": "Nov 2026",
  "units": 150
}

## Get Bill History

GET /api/bill/history

Optional query parameter:
limit

Example:
GET /api/bill/history?limit=10

## Frontend Integration

Use fetch() or Axios to call the backend.

During local development, the frontend should run
on an origin allowed by the backend CORS settings.

The backend currently allows:
- http://localhost:5173
- http://127.0.0.1:5173
- http://localhost:3000
- http://127.0.0.1:3000
