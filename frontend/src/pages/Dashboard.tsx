import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import {
  BillingRecord,
  DEFAULT_APPLIANCES,
  PredictionResponse,
  buildMockPrediction
} from "../data/mockData";
import { predictBillApi } from "../services/api";

interface DashboardProps {
  history: BillingRecord[];
}

const SLAB_SEGMENTS = [
  { label: "0-100", max: 100, rate: "Rs 3.40" },
  { label: "101-200", max: 200, rate: "Rs 4.80" },
  { label: "201-300", max: 300, rate: "Rs 7.70" },
  { label: "301-400", max: 400, rate: "Rs 9.00" },
  { label: "401-800", max: 800, rate: "Rs 9.50" },
  { label: "800+", max: 1000, rate: "Rs 10.00" }
];

export function Dashboard({ history }: DashboardProps) {
  const [prediction, setPrediction] = useState<PredictionResponse>(() =>
    buildMockPrediction(history, DEFAULT_APPLIANCES)
  );

  useEffect(() => {
    let active = true;
    predictBillApi(history, DEFAULT_APPLIANCES).then((res) => {
      if (active) setPrediction(res);
    });
    return () => {
      active = false;
    };
  }, [history]);

  const latestRecord = history[0];
  const varianceKwh = latestRecord
    ? Number((prediction.predicted_kwh - latestRecord.units_kwh).toFixed(1))
    : 0;

  const chartData = useMemo(() => {
    const recentSix = [...history].slice(0, 6).reverse();
    const rows = recentSix.map((item) => ({
      month: item.month,
      units_kwh: item.units_kwh,
      bill_amount: item.bill_amount
    }));
    rows.push({
      month: "Next (Est)",
      units_kwh: prediction.predicted_kwh,
      bill_amount: prediction.predicted_bill
    });
    return rows;
  }, [history, prediction]);

  const activeUnits = prediction.predicted_kwh;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#18181B]">
            Overview Dashboard
          </h1>
          <p className="text-sm text-[#52525B]">
            Next billing cycle projection under TGSPDCL domestic slab rates.
          </p>
        </div>
        <div className="font-mono text-xs text-[#52525B] tabular-nums">
          Confidence: {prediction.confidence_range.lower} - {prediction.confidence_range.upper} kWh
        </div>
      </div>

      {prediction.slab_warning && prediction.slab_warning_message && (
        <div className="bg-[#FFFFFF] border border-[#B45309] rounded-[6px] p-4 flex items-center justify-between gap-4">
          <div className="text-sm font-medium text-[#B45309]">
            Slab Threshold Alert: {prediction.slab_warning_message}
          </div>
          <span className="font-mono text-xs text-[#B45309] tabular-nums shrink-0">
            Within 30 kWh
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-[#52525B]">
            Predicted Next Bill
          </div>
          <div className="mt-2 font-mono text-3xl font-semibold text-[#18181B] tabular-nums">
            Rs {prediction.predicted_bill.toFixed(2)}
          </div>
          <div className="mt-3 pt-3 border-t border-[#E4E4E7] flex items-center justify-between text-xs text-[#52525B]">
            <span>Current Slab: {prediction.tariff_breakdown.current_slab_label}</span>
            <span className="font-mono tabular-nums">
              Fixed: Rs {prediction.tariff_breakdown.fixed_charges} + Duty: Rs{" "}
              {prediction.tariff_breakdown.duty_charges}
            </span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-[#52525B]">
            Predicted Consumption
          </div>
          <div className="mt-2 font-mono text-3xl font-semibold text-[#18181B] tabular-nums">
            {prediction.predicted_kwh} kWh
          </div>
          <div className="mt-3 pt-3 border-t border-[#E4E4E7] flex items-center justify-between text-xs">
            <span className="text-[#52525B]">vs Last Month ({latestRecord?.units_kwh ?? 0} kWh)</span>
            <span
              className={`font-mono font-medium tabular-nums ${
                varianceKwh > 0 ? "text-[#B45309]" : "text-[#166534]"
              }`}
            >
              {varianceKwh > 0 ? `+${varianceKwh}` : varianceKwh} kWh
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[#18181B]">Tariff Slab Meter</h2>
            <p className="text-xs text-[#52525B]">
              Progressive unit brackets and remaining buffer before higher per-unit charges apply.
            </p>
          </div>
          <div className="font-mono text-xs text-[#18181B] tabular-nums">
            {prediction.tariff_breakdown.units_to_next_slab !== null
              ? `${prediction.tariff_breakdown.units_to_next_slab} kWh until ${prediction.tariff_breakdown.next_slab_threshold} units`
              : "Top slab (Above 800 units)"}
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {SLAB_SEGMENTS.map((seg, idx) => {
            const prevMax = idx === 0 ? 0 : SLAB_SEGMENTS[idx - 1].max;
            const span = seg.max - prevMax;
            const fillRatio = Math.max(0, Math.min(1, (activeUnits - prevMax) / span));
            return (
              <div key={seg.label} className="space-y-1.5">
                <div className="h-3 bg-[#F8F8F6] border border-[#E4E4E7] rounded-[6px] overflow-hidden">
                  <div
                    className="h-full bg-[#18181B]"
                    style={{ width: `${Math.round(fillRatio * 100)}%` }}
                  />
                </div>
                <div className="font-mono text-[11px] text-[#18181B] tabular-nums">
                  {seg.label}
                </div>
                <div className="font-mono text-[11px] text-[#52525B] tabular-nums">
                  {seg.rate}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#18181B]">
                6-Month Usage & Forecast
              </h2>
              <p className="text-xs text-[#52525B]">
                Monthly consumption (kWh bars) and bill cost (Rs line).
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#E4E4E7" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#52525B", fontSize: 12 }}
                  axisLine={{ stroke: "#E4E4E7" }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="kwh"
                  tick={{ fill: "#52525B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="rs"
                  orientation="right"
                  tick={{ fill: "#52525B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E4E4E7",
                    borderRadius: "6px",
                    fontSize: "12px"
                  }}
                />
                <Bar
                  yAxisId="kwh"
                  dataKey="units_kwh"
                  name="Units (kWh)"
                  fill="#18181B"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
                <Line
                  yAxisId="rs"
                  type="monotone"
                  dataKey="bill_amount"
                  name="Bill (Rs)"
                  stroke="#166534"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#166534" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#18181B]">
              Quantified Savings Actions
            </h2>
            <p className="text-xs text-[#52525B] mt-0.5">
              Top 3 adjustments based on current usage profile.
            </p>

            <div className="mt-4 divide-y divide-[#E4E4E7]">
              {prediction.savings_recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                  <div className="text-sm font-medium text-[#18181B]">{rec.title}</div>
                  <p className="text-xs text-[#52525B]">{rec.action}</p>
                  <div className="pt-1 flex items-center justify-between font-mono text-xs tabular-nums">
                    <span className="text-[#166534] font-medium">
                      Save Rs {rec.rupees_saved.toFixed(2)}/mo
                    </span>
                    <span className="text-[#52525B]">-{rec.kwh_saved} kWh</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
