import { ChangeEvent, FormEvent, useState } from "react";
import { Upload } from "lucide-react";
import {
  BillingRecord,
  ScannedBillResult,
  calculateBillLocal
} from "../data/mockData";
import { scanBillApi } from "../services/api";

interface BillScannerProps {
  onAddRecord: (record: BillingRecord) => void;
}

const SAMPLE_BILL_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="520" height="360" viewBox="0 0 520 360">
  <rect width="520" height="360" fill="#FFFFFF" stroke="#E4E4E7" stroke-width="2"/>
  <rect x="24" y="24" width="472" height="44" fill="#F8F8F6" stroke="#E4E4E7"/>
  <text x="38" y="51" font-family="monospace" font-size="14" font-weight="bold" fill="#18181B">TGSPDCL HYDERABAD - ELECTRICITY BILL</text>
  <text x="38" y="102" font-family="monospace" font-size="13" fill="#52525B">SERVICE NO   : TG-HYD-408912</text>
  <text x="38" y="132" font-family="monospace" font-size="13" fill="#52525B">BILLING MONTH: Nov 2026</text>
  <text x="38" y="162" font-family="monospace" font-size="13" fill="#52525B">CATEGORY     : LT-I DOMESTIC</text>
  <line x1="38" y1="186" x2="482" y2="186" stroke="#E4E4E7"/>
  <text x="38" y="218" font-family="monospace" font-size="14" font-weight="bold" fill="#18181B">UNITS CONSUMED : 388 kWh</text>
  <text x="38" y="248" font-family="monospace" font-size="14" font-weight="bold" fill="#166534">TOTAL AMOUNT   : Rs 2610.28</text>
  <text x="38" y="315" font-family="monospace" font-size="11" fill="#52525B">SAMPLE RECEIPT FOR OCR VERIFICATION</text>
</svg>`);

export function BillScanner({ onAddRecord }: BillScannerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [form, setForm] = useState<ScannedBillResult>({
    service_number: "TG-HYD-408912",
    billing_month: "Nov 2026",
    units_consumed: 388,
    bill_amount: calculateBillLocal(388).total_bill
  });

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSavedNotice(null);
    setPreviewUrl(URL.createObjectURL(file));
    setIsScanning(true);
    try {
      const extracted = await scanBillApi(file);
      setForm(extracted);
    } finally {
      setIsScanning(false);
    }
  }

  function handleLoadSample() {
    setSavedNotice(null);
    setPreviewUrl(SAMPLE_BILL_SVG);
    const sampleUnits = 388;
    setForm({
      service_number: "TG-HYD-408912",
      billing_month: "Nov 2026",
      units_consumed: sampleUnits,
      bill_amount: calculateBillLocal(sampleUnits).total_bill
    });
  }

  function handleUnitsChange(value: string) {
    const units = Number(value) || 0;
    const breakdown = calculateBillLocal(units);
    setForm((prev) => ({
      ...prev,
      units_consumed: units,
      bill_amount: breakdown.total_bill
    }));
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    const breakdown = calculateBillLocal(form.units_consumed);
    const newRecord: BillingRecord = {
      id: `bill-${Date.now()}`,
      month: form.billing_month.trim() || "Nov 2026",
      service_number: form.service_number.trim() || "TG-HYD-408912",
      units_kwh: breakdown.units_kwh,
      slab_label: breakdown.current_slab_label,
      bill_amount: Number(form.bill_amount) || breakdown.total_bill
    };
    onAddRecord(newRecord);
    setSavedNotice(`Saved ${newRecord.month} (${newRecord.units_kwh} kWh) to Billing Ledger.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#18181B]">
            OCR Bill Scanner
          </h1>
          <p className="text-sm text-[#52525B]">
            Upload a TGSPDCL bill photo or load a sample receipt to extract and verify charges.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="px-4 py-2 rounded-[6px] bg-[#FFFFFF] border border-[#E4E4E7] hover:border-[#18181B] text-sm font-medium text-[#18181B] self-start sm:self-auto"
        >
          Load Sample Bill
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] p-6 space-y-4">
          <div className="text-sm font-semibold text-[#18181B]">Bill Image Preview</div>

          <label className="flex flex-col items-center justify-center border border-dashed border-[#E4E4E7] hover:border-[#18181B] rounded-[6px] p-6 cursor-pointer bg-[#F8F8F6]">
            <Upload className="w-5 h-5 text-[#52525B] mb-2" />
            <span className="text-sm font-medium text-[#18181B]">
              Select JPG or PNG electricity bill
            </span>
            <span className="text-xs text-[#52525B] mt-1">
              Extracts Service Number, Month, Units, and Total Amount
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {previewUrl ? (
            <div className="border border-[#E4E4E7] rounded-[6px] overflow-hidden bg-[#F8F8F6]">
              <img
                src={previewUrl}
                alt="Electricity bill preview"
                className="w-full max-h-72 object-contain mx-auto"
              />
            </div>
          ) : (
            <div className="h-48 border border-[#E4E4E7] rounded-[6px] bg-[#F8F8F6] flex items-center justify-center text-xs text-[#52525B]">
              No bill image loaded yet. Upload an image or click Load Sample Bill.
            </div>
          )}
        </div>

        <form
          onSubmit={handleSave}
          className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#18181B]">
              Extracted Bill Verification
            </h2>
            {isScanning && (
              <span className="font-mono text-xs text-[#B45309]">Running OCR...</span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#52525B] mb-1">
                Service Number
              </label>
              <input
                type="text"
                value={form.service_number}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, service_number: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] focus:border-[#18181B] focus:outline-none font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#52525B] mb-1">
                Billing Month
              </label>
              <input
                type="text"
                value={form.billing_month}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, billing_month: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] focus:border-[#18181B] focus:outline-none font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#52525B] mb-1">
                  Units Consumed (kWh)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={form.units_consumed}
                  onChange={(e) => handleUnitsChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] focus:border-[#18181B] focus:outline-none font-mono text-sm tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#52525B] mb-1">
                  Total Bill Amount (Rs)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.bill_amount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      bill_amount: Number(e.target.value) || 0
                    }))
                  }
                  className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] focus:border-[#18181B] focus:outline-none font-mono text-sm tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-4">
            <span className="font-mono text-xs text-[#52525B]">
              Slab: {calculateBillLocal(form.units_consumed).current_slab_label}
            </span>
            <button
              type="submit"
              className="px-4 py-2 rounded-[6px] bg-[#18181B] hover:bg-[#27272A] text-[#FFFFFF] text-sm font-medium"
            >
              Add to Billing Ledger
            </button>
          </div>

          {savedNotice && (
            <div className="p-3 rounded-[6px] border border-[#166534] bg-[#F8F8F6] text-xs font-medium text-[#166534]">
              {savedNotice}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
