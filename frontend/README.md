# BillWise AI Backend

Backend for the BillWise AI electricity bill prediction application.

## Technologies

- Python
- FastAPI
- Uvicorn

## Setup

Create a virtual environment:

```bash
python -m venv venv
```

Activate it and install dependencies:

```bash
python -m pip install -r requirements.txt
```

## Run the server

```bash
uvicorn app.main:app --reload
```

## API Endpoints

- GET `/`
- GET `/api/health`

## Documentation

Visit `http://127.0.0.1:8000/docs` while the server is running.
