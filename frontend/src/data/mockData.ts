export interface TariffBreakdown {
  units_kwh: number;
  energy_charges: number;
  fixed_charges: number;
  duty_charges: number;
  total_bill: number;
  current_slab_label: string;
  next_slab_threshold: number | null;
  units_to_next_slab: number | null;
}

export interface BillingRecord {
  id: string;
  month: string;
  service_number: string;
  units_kwh: number;
  slab_label: string;
  bill_amount: number;
}

export interface SavingsRecommendation {
  id: string;
  title: string;
  action: string;
  kwh_saved: number;
  rupees_saved: number;
}

export interface PredictionResponse {
  predicted_kwh: number;
  predicted_bill: number;
  confidence_range: {
    lower: number;
    upper: number;
  };
  slab_warning: boolean;
  slab_warning_message: string | null;
  savings_recommendations: SavingsRecommendation[];
  tariff_breakdown: TariffBreakdown;
}

export interface ScannedBillResult {
  service_number: string;
  billing_month: string;
  units_consumed: number;
  bill_amount: number;
}

export interface ApplianceInputs {
  ac_tonnage: number;
  ac_star_rating: number;
  ac_hours_per_day: number;
  ac_temp_celsius: number;
  water_heater_mins_per_day: number;
  fridge_litres: number;
  washing_machine_loads_per_week: number;
  fans_lights_hours_per_day: number;
}

export function calculateBillLocal(unitsKwh: number): TariffBreakdown {
  const units = Math.max(0, Number(unitsKwh) || 0);
  let remaining = units;
  let energyCharges = 0;

  const slabs = [
    { min: 0, max: 100, rate: 3.4, label: "0-100 units" },
    { min: 100, max: 200, rate: 4.8, label: "101-200 units" },
    { min: 200, max: 300, rate: 7.7, label: "201-300 units" },
    { min: 300, max: 400, rate: 9.0, label: "301-400 units" },
    { min: 400, max: 800, rate: 9.5, label: "401-800 units" },
    { min: 800, max: Infinity, rate: 10.0, label: "Above 800 units" }
  ];

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const capacity = slab.max === Infinity ? remaining : slab.max - slab.min;
    const slabUnits = Math.min(remaining, capacity);
    energyCharges += slabUnits * slab.rate;
    remaining -= slabUnits;
  }

  let fixedCharges = 50;
  if (units > 800) fixedCharges = 100;
  else if (units > 400) fixedCharges = 90;
  else if (units > 300) fixedCharges = 80;
  else if (units > 200) fixedCharges = 70;
  else if (units > 100) fixedCharges = 60;

  const dutyCharges = Number((units * 0.06).toFixed(2));
  const roundedEnergy = Number(energyCharges.toFixed(2));
  const totalBill = Number((roundedEnergy + fixedCharges + dutyCharges).toFixed(2));

  let currentSlabLabel = "0-100 units";
  let nextSlabThreshold: number | null = 100;
  let unitsToNextSlab: number | null = Number((100 - units).toFixed(1));

  if (units > 800) {
    currentSlabLabel = "Above 800 units";
    nextSlabThreshold = null;
    unitsToNextSlab = null;
  } else if (units > 400) {
    currentSlabLabel = "401-800 units";
    nextSlabThreshold = 800;
    unitsToNextSlab = Number((800 - units).toFixed(1));
  } else if (units > 300) {
    currentSlabLabel = "301-400 units";
    nextSlabThreshold = 400;
    unitsToNextSlab = Number((400 - units).toFixed(1));
  } else if (units > 200) {
    currentSlabLabel = "201-300 units";
    nextSlabThreshold = 300;
    unitsToNextSlab = Number((300 - units).toFixed(1));
  } else if (units > 100) {
    currentSlabLabel = "101-200 units";
    nextSlabThreshold = 200;
    unitsToNextSlab = Number((200 - units).toFixed(1));
  }

  return {
    units_kwh: Number(units.toFixed(1)),
    energy_charges: roundedEnergy,
    fixed_charges: fixedCharges,
    duty_charges: dutyCharges,
    total_bill: totalBill,
    current_slab_label: currentSlabLabel,
    next_slab_threshold: nextSlabThreshold,
    units_to_next_slab: unitsToNextSlab
  };
}

export const INITIAL_BILLING_HISTORY: BillingRecord[] = [
  { id: "bill-12", month: "Oct 2026", service_number: "TG-HYD-408912", units_kwh: 374, slab_label: "301-400 units", bill_amount: calculateBillLocal(374).total_bill },
  { id: "bill-11", month: "Sep 2026", service_number: "TG-HYD-408912", units_kwh: 332, slab_label: "301-400 units", bill_amount: calculateBillLocal(332).total_bill },
  { id: "bill-10", month: "Aug 2026", service_number: "TG-HYD-408912", units_kwh: 289, slab_label: "201-300 units", bill_amount: calculateBillLocal(289).total_bill },
  { id: "bill-09", month: "Jul 2026", service_number: "TG-HYD-408912", units_kwh: 264, slab_label: "201-300 units", bill_amount: calculateBillLocal(264).total_bill },
  { id: "bill-08", month: "Jun 2026", service_number: "TG-HYD-408912", units_kwh: 445, slab_label: "401-800 units", bill_amount: calculateBillLocal(445).total_bill },
  { id: "bill-07", month: "May 2026", service_number: "TG-HYD-408912", units_kwh: 518, slab_label: "401-800 units", bill_amount: calculateBillLocal(518).total_bill },
  { id: "bill-06", month: "Apr 2026", service_number: "TG-HYD-408912", units_kwh: 462, slab_label: "401-800 units", bill_amount: calculateBillLocal(462).total_bill },
  { id: "bill-05", month: "Mar 2026", service_number: "TG-HYD-408912", units_kwh: 356, slab_label: "301-400 units", bill_amount: calculateBillLocal(356).total_bill },
  { id: "bill-04", month: "Feb 2026", service_number: "TG-HYD-408912", units_kwh: 228, slab_label: "201-300 units", bill_amount: calculateBillLocal(228).total_bill },
  { id: "bill-03", month: "Jan 2026", service_number: "TG-HYD-408912", units_kwh: 194, slab_label: "101-200 units", bill_amount: calculateBillLocal(194).total_bill },
  { id: "bill-02", month: "Dec 2025", service_number: "TG-HYD-408912", units_kwh: 182, slab_label: "101-200 units", bill_amount: calculateBillLocal(182).total_bill },
  { id: "bill-01", month: "Nov 2025", service_number: "TG-HYD-408912", units_kwh: 215, slab_label: "201-300 units", bill_amount: calculateBillLocal(215).total_bill }
];

export const DEFAULT_APPLIANCES: ApplianceInputs = {
  ac_tonnage: 1.5,
  ac_star_rating: 4,
  ac_hours_per_day: 6,
  ac_temp_celsius: 23,
  water_heater_mins_per_day: 25,
  fridge_litres: 260,
  washing_machine_loads_per_week: 4,
  fans_lights_hours_per_day: 8
};

export function buildMockPrediction(
  history: BillingRecord[],
  appliances: ApplianceInputs = DEFAULT_APPLIANCES
): PredictionResponse {
  const latestKwh = history[0]?.units_kwh ?? 374;
  const tempAdjustment = (24 - appliances.ac_temp_celsius) * 14;
  const acRuntimeAdjustment = (appliances.ac_hours_per_day - 6) * 22;
  const predictedKwh = Number(
    Math.max(80, latestKwh * 0.96 + tempAdjustment + acRuntimeAdjustment).toFixed(1)
  );
  const tariff = calculateBillLocal(predictedKwh);

  const slabWarning =
    tariff.units_to_next_slab !== null && tariff.units_to_next_slab <= 30;
  const slabWarningMessage = slabWarning
    ? `Within ${tariff.units_to_next_slab} kWh of the ${tariff.next_slab_threshold} unit slab threshold.`
    : null;

  const tempSavingsKwh = Number(Math.max(12, (appliances.ac_temp_celsius < 25 ? (25 - appliances.ac_temp_celsius) * 18 : 18)).toFixed(1));
  const runtimeSavingsKwh = Number(Math.max(15, appliances.ac_hours_per_day * 4.5).toFixed(1));
  const geyserSavingsKwh = Number(Math.max(8, appliances.water_heater_mins_per_day * 0.45).toFixed(1));

  const baseBill = tariff.total_bill;
  const recs: SavingsRecommendation[] = [
    {
      id: "rec-ac-temp",
      title: "Raise AC Setpoint to 25 C",
      action: "Set inverter AC to 25 C instead of lower cooling temperatures.",
      kwh_saved: tempSavingsKwh,
      rupees_saved: Number(Math.max(0, baseBill - calculateBillLocal(Math.max(0, predictedKwh - tempSavingsKwh)).total_bill).toFixed(2))
    },
    {
      id: "rec-ac-hours",
      title: "Trim AC Runtime by 1 Hour Daily",
      action: "Turn off AC 60 minutes earlier and use ceiling fan circulation.",
      kwh_saved: runtimeSavingsKwh,
      rupees_saved: Number(Math.max(0, baseBill - calculateBillLocal(Math.max(0, predictedKwh - runtimeSavingsKwh)).total_bill).toFixed(2))
    },
    {
      id: "rec-geyser",
      title: "Cap Water Heater to 15 Mins/Day",
      action: "Switch off storage geyser immediately after heating water.",
      kwh_saved: geyserSavingsKwh,
      rupees_saved: Number(Math.max(0, baseBill - calculateBillLocal(Math.max(0, predictedKwh - geyserSavingsKwh)).total_bill).toFixed(2))
    }
  ];

  return {
    predicted_kwh: predictedKwh,
    predicted_bill: tariff.total_bill,
    confidence_range: {
      lower: Number((predictedKwh * 0.92).toFixed(1)),
      upper: Number((predictedKwh * 1.08).toFixed(1))
    },
    slab_warning: slabWarning,
    slab_warning_message: slabWarningMessage,
    savings_recommendations: recs,
    tariff_breakdown: tariff
  };
}
