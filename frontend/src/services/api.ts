import {
  ApplianceInputs,
  BillingRecord,
  PredictionResponse,
  ScannedBillResult,
  buildMockPrediction,
  calculateBillLocal
} from "../data/mockData";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function calculateBillApi(unitsKwh: number) {
  try {
    return await postJson("/api/calculate-bill", { units_kwh: unitsKwh });
  } catch {
    return calculateBillLocal(unitsKwh);
  }
}

export async function predictBillApi(
  history: BillingRecord[],
  appliances: ApplianceInputs
): Promise<PredictionResponse> {
  try {
    return await postJson<PredictionResponse>("/api/predict", {
      history,
      appliances
    });
  } catch {
    return buildMockPrediction(history, appliances);
  }
}

export async function scanBillApi(file: File): Promise<ScannedBillResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/api/scan-bill`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`OCR API error ${response.status}`);
    }

    return (await response.json()) as ScannedBillResult;
  } catch {
    const fallbackUnits = 388;
    return {
      service_number: "TG-HYD-408912",
      billing_month: "Nov 2026",
      units_consumed: fallbackUnits,
      bill_amount: calculateBillLocal(fallbackUnits).total_bill
    };
  }
}