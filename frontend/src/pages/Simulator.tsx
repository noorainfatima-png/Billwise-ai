import { useEffect, useState } from "react";
import {
  ApplianceInputs,
  DEFAULT_APPLIANCES,
  calculateBillLocal
} from "../data/mockData";
import { calculateBillApi } from "../services/api";

interface BillCalcResult {
  total_bill: number;
  slab_label: string;
  energy_charges: number;
  fixed_charges: number;
  duty_charges: number;
}

export function Simulator() {
  const [appliances, setAppliances] = useState<ApplianceInputs>(DEFAULT_APPLIANCES);
  const [estimatedKwh, setEstimatedKwh] = useState<number>(360);
  const [calc, setCalc] = useState<BillCalcResult>(() =>
    calculateBillLocal(360) as BillCalcResult
  );

  useEffect(() => {
    const acKwh = appliances.ac_hours_per_day * appliances.ac_count * 30 * 1.5;
    const geyserKwh = appliances.geyser_hours_per_day * 30 * 2.0;
    const fridgeKwh = appliances.fridge_count * 30 * 1.2;
    const baseKwh = 110;
    const totalKwh = Math.max(50, Math.round(baseKwh + acKwh + geyserKwh + fridgeKwh));
    setEstimatedKwh(totalKwh);

    let active = true;
    calculateBillApi(totalKwh).then((res) => {
      if (active && res && typeof (res as BillCalcResult).total_bill === "number") {
        setCalc(res as BillCalcResult);
      } else if (active) {
        setCalc(calculateBillLocal(totalKwh) as BillCalcResult);
      }
    });

    return () => {
      active = false;
    };
  }, [appliances]);

  function updateField(key: keyof ApplianceInputs, value: number) {
    setAppliances((prev) => ({
      ...prev,
      [key]: Number.isNaN(value) ? 0 : Math.max(0, value)
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#18181B]">
          Tariff & Appliance Simulator
        </h1>
        <p className="text-sm text-[#52525B]">
          Adjust daily appliance usage to preview monthly kWh and TGSPDCL slab charges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#18181B]">Appliance Inputs</h2>

          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between gap-4">
              <span className="text-[#52525B]">AC Count</span>
              <input
                type="number"
                min={0}
                max={10}
                value={appliances.ac_count}
                onChange={(e) => updateField("ac_count", Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] font-mono text-right"
              />
            </label>

            <label className="flex items-center justify-between gap-4">
              <span className="text-[#52525B]">AC Hours / Day</span>
              <input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={appliances.ac_hours_per_day}
                onChange={(e) => updateField("ac_hours_per_day", Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] font-mono text-right"
              />
            </label>

            <label className="flex items-center justify-between gap-4">
              <span className="text-[#52525B]">Geyser Hours / Day</span>
              <input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={appliances.geyser_hours_per_day}
                onChange={(e) => updateField("geyser_hours_per_day", Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] font-mono text-right"
              />
            </label>

            <label className="flex items-center justify-between gap-4">
              <span className="text-[#52525B]">Refrigerator Count</span>
              <input
                type="number"
                min={0}
                max={5}
                value={appliances.fridge_count}
                onChange={(e) => updateField("fridge_count", Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] font-mono text-right"
              />
            </label>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#18181B]">Simulated Bill Output</h2>

          <div className="font-mono text-3xl font-semibold text-[#18181B] tabular-nums">
            Rs {calc.total_bill.toFixed(2)}
          </div>
          <div className="font-mono text-sm text-[#52525B] tabular-nums">
            Estimated Usage: {estimatedKwh} kWh ({calc.slab_label})
          </div>

          <div className="pt-3 border-t border-[#E4E4E7] space-y-1.5 font-mono text-xs text-[#52525B] tabular-nums">
            <div>Energy Charges: Rs {calc.energy_charges.toFixed(2)}</div>
            <div>Fixed Charges: Rs {calc.fixed_charges.toFixed(2)}</div>
            <div>Electricity Duty: Rs {calc.duty_charges.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}