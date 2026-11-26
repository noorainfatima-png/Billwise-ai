import { useMemo, useState } from "react";
import { BillingRecord } from "../data/mockData";

interface HistoryProps {
  history: BillingRecord[];
}

export function History({ history }: HistoryProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (r) =>
        r.month.toLowerCase().includes(q) ||
        r.slab_label.toLowerCase().includes(q) ||
        String(r.units_kwh).includes(q) ||
        String(r.bill_amount).includes(q)
    );
  }, [history, query]);

  function handleDownloadCsv() {
    const headers = ["Month", "Units (kWh)", "Slab Tier", "Bill Amount (Rs)"];
    const rows = filtered.map((r) => [
      `"${r.month}"`,
      r.units_kwh,
      `"${r.slab_label}"`,
      r.bill_amount.toFixed(2)
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "billwise-billing-history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#18181B]">
            Billing Ledger
          </h1>
          <p className="text-sm text-[#52525B]">
            Monthly consumption, tariff slab tier, and billed amount.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="px-4 py-2 rounded-[6px] bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-medium self-start sm:self-auto"
        >
          Download CSV
        </button>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] p-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by month, slab (e.g. 301-400), units, or amount..."
          className="w-full px-3 py-2 rounded-[6px] border border-[#E4E4E7] focus:border-[#18181B] focus:outline-none text-sm"
        />
      </div>

      <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#F8F8F6] text-xs font-medium text-[#52525B]">
              <th className="py-3 px-4">Month</th>
              <th className="py-3 px-4">Units (kWh)</th>
              <th className="py-3 px-4">Slab Tier</th>
              <th className="py-3 px-4 text-right">Bill Amount (Rs)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E4E7] text-sm">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-[#F8F8F6]">
                <td className="py-3 px-4 font-medium text-[#18181B]">{row.month}</td>
                <td className="py-3 px-4 font-mono tabular-nums text-[#18181B]">
                  {row.units_kwh}
                </td>
                <td className="py-3 px-4 font-mono tabular-nums text-[#52525B]">
                  {row.slab_label}
                </td>
                <td className="py-3 px-4 font-mono tabular-nums text-right text-[#18181B]">
                  Rs {row.bill_amount.toFixed(2)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 px-4 text-center text-sm text-[#52525B]">
                  No matching billing records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}