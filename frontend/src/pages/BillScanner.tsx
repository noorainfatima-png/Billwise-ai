import { ChangeEvent, DragEvent, FormEvent, useEffect, useState } from "react";
import {
  Upload,
  FileText,
  X,
  LoaderCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import {
  BillingRecord,
  ScannedBillResult,
  calculateBillLocal
} from "../data/mockData";

import { scanBillApi } from "../services/api";

interface BillScannerProps {
  onAddRecord: (record: BillingRecord) => void;
}

const INITIAL_FORM: ScannedBillResult = {
  service_number: "TG-HYD-408912",
  billing_month: "Nov 2026",
  units_consumed: 388,
  bill_amount: calculateBillLocal(388).total_bill
};

const SAMPLE_BILL_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="520" height="360">
  <rect width="520" height="360" fill="#FFFFFF" stroke="#E4E4E7"/>
  <text x="30" y="50" font-size="17" font-weight="bold" fill="#18181B">TGSPDCL HYDERABAD</text>
  <text x="30" y="100" font-size="14" fill="#52525B">SERVICE NO: TG-HYD-408912</text>
  <text x="30" y="140" font-size="14" fill="#52525B">BILLING MONTH: Nov 2026</text>
  <text x="30" y="190" font-size="15" fill="#18181B">UNITS CONSUMED: 388 kWh</text>
  <text x="30" y="230" font-size="15" fill="#166534">TOTAL AMOUNT: Rs 2610.28</text>
  <text x="30" y="310" font-size="12" fill="#52525B">SAMPLE ELECTRICITY BILL</text>
</svg>`);

export function BillScanner({ onAddRecord }: BillScannerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "pdf" | null>(null);
  const [fileName, setFileName] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ScannedBillResult>(INITIAL_FORM);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function processFile(file?: File) {
    if (!file) return;

    setError(null);
    setSavedNotice(null);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf"
    ];

    const extension = file.name.split(".").pop()?.toLowerCase();

    const validExtension = ["jpg", "jpeg", "png", "pdf"].includes(
      extension || ""
    );

    if (!allowedTypes.includes(file.type) && !validExtension) {
      setError("Unsupported file. Please upload JPG, PNG or PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      return;
    }

    const isPdf =
      file.type === "application/pdf" || extension === "pdf";

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);
    setFileType(isPdf ? "pdf" : "image");
    setFileName(file.name);
    setIsScanning(true);

    try {
      const extracted = await scanBillApi(file);
      setForm(extracted);
    } catch {
      setError("Unable to process this bill. Please try again.");
    } finally {
      setIsScanning(false);
    }
  }

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    processFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    processFile(e.dataTransfer.files?.[0]);
  }

  function handleLoadSample() {
    setError(null);
    setSavedNotice(null);
    setPreviewUrl(SAMPLE_BILL_SVG);
    setFileType("image");
    setFileName("Sample Electricity Bill.svg");

    const units = 388;

    setForm({
      service_number: "TG-HYD-408912",
      billing_month: "Nov 2026",
      units_consumed: units,
      bill_amount: calculateBillLocal(units).total_bill
    });
  }

  function handleRemoveFile() {
    setPreviewUrl(null);
    setFileType(null);
    setFileName("");
    setError(null);
    setSavedNotice(null);
  }

  function handleUnitsChange(value: string) {
    const units = Math.max(0, Number(value) || 0);

    setForm((prev) => ({
      ...prev,
      units_consumed: units,
      bill_amount: calculateBillLocal(units).total_bill
    }));
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();

    if (isScanning) return;

    if (!form.service_number.trim() || !form.billing_month.trim()) {
      setError("Please enter the service number and billing month.");
      return;
    }

    const breakdown = calculateBillLocal(form.units_consumed);

    const newRecord: BillingRecord = {
      id: `bill-${Date.now()}`,
      month: form.billing_month.trim(),
      service_number: form.service_number.trim(),
      units_kwh: breakdown.units_kwh,
      slab_label: breakdown.current_slab_label,
      bill_amount: Number(form.bill_amount)
    };

    onAddRecord(newRecord);

    setSavedNotice(
      `Successfully added ${newRecord.month} to Billing Ledger.`
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#18181B]">
            OCR Bill Scanner
          </h1>

          <p className="text-sm text-[#52525B]">
            Upload your electricity bill to extract and verify details.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="px-4 py-2 rounded-[6px] bg-white border border-[#E4E4E7] hover:border-[#18181B] text-sm font-medium"
        >
          Load Sample Bill
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upload Section */}

        <div className="bg-white border border-[#E4E4E7] rounded-[6px] p-6 space-y-4">

          <h2 className="text-sm font-semibold">
            Bill Upload & Preview
          </h2>

          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center border-2 border-dashed border-[#E4E4E7] hover:border-[#18181B] rounded-[6px] p-8 cursor-pointer bg-[#F8F8F6] transition"
          >
            <Upload className="w-7 h-7 text-[#52525B] mb-3" />

            <span className="text-sm font-medium text-[#18181B]">
              Drag and drop your bill here
            </span>

            <span className="text-xs text-[#52525B] mt-2">
              or click to browse files
            </span>

            <span className="text-xs text-[#71717A] mt-3">
              JPG, JPEG, PNG, PDF · Maximum 10 MB
            </span>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Preview */}

          {previewUrl ? (
            <div className="border border-[#E4E4E7] rounded-[6px] overflow-hidden">

              <div className="flex items-center justify-between p-3 bg-[#F8F8F6] border-b border-[#E4E4E7]">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 shrink-0" />

                  <span className="text-xs truncate">
                    {fileName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-[#E4E4E7] rounded"
                  aria-label="Remove uploaded file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {fileType === "image" ? (
                <img
                  src={previewUrl}
                  alt="Electricity bill preview"
                  className="w-full max-h-80 object-contain bg-[#F8F8F6]"
                />
              ) : (
                <iframe
                  src={previewUrl}
                  title="PDF bill preview"
                  className="w-full h-80 bg-white"
                />
              )}
            </div>
          ) : (
            <div className="h-48 border border-[#E4E4E7] rounded-[6px] bg-[#F8F8F6] flex flex-col items-center justify-center text-xs text-[#52525B] gap-2">
              <FileText className="w-8 h-8" />
              No bill uploaded yet.
            </div>
          )}

          {isScanning && (
            <div className="flex items-center gap-2 text-xs text-[#B45309]">
              <LoaderCircle className="w-4 h-4 animate-spin" />
              Processing bill...
            </div>
          )}

        </div>

        {/* Verification Form */}

        <form
          onSubmit={handleSave}
          className="bg-white border border-[#E4E4E7] rounded-[6px] p-6 space-y-4"
        >

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Extracted Bill Details
            </h2>

            <span className="text-xs text-[#52525B]">
              Verify before saving
            </span>
          </div>

          <div className="space-y-4">

            <div>
              <label className="block text-xs font-medium text-[#52525B] mb-1">
                Service Number
              </label>

              <input
                type="text"
                value={form.service_number}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    service_number: e.target.value
                  }))
                }
                className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] focus:border-[#18181B] focus:outline-none text-sm"
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
                  setForm((prev) => ({
                    ...prev,
                    billing_month: e.target.value
                  }))
                }
                className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] focus:border-[#18181B] focus:outline-none text-sm"
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
                  className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] focus:border-[#18181B] focus:outline-none font-mono text-sm"
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
                  className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] focus:border-[#18181B] focus:outline-none font-mono text-sm"
                />
              </div>

            </div>
          </div>

          {/* Slab Information */}

          <div className="p-3 rounded-[6px] bg-[#F8F8F6] border border-[#E4E4E7]">
            <div className="text-xs text-[#52525B]">
              Calculated Tariff Slab
            </div>

            <div className="text-sm font-semibold mt-1">
              {calculateBillLocal(form.units_consumed).current_slab_label}
            </div>
          </div>

          {/* Error */}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-[6px] bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}

          {savedNotice && (
            <div className="flex items-center gap-2 p-3 rounded-[6px] bg-green-50 border border-green-200 text-green-700 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {savedNotice}
            </div>
          )}

          <button
            type="submit"
            disabled={isScanning}
            className="w-full py-2.5 rounded-[6px] bg-[#18181B] hover:bg-[#27272A] disabled:opacity-50 text-white text-sm font-medium"
          >
            {isScanning ? "Please wait..." : "Add to Billing Ledger"}
          </button>

        </form>
      </div>
    </div>
  );
}