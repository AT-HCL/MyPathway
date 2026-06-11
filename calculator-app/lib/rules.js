// MyBenefitsPathway rules engine
// ------------------------------------------------------------------
// Encodes the participation math for both programs. This module is
// deliberately framework-free so it can later seed the Module 6
// policy engine configuration.
//
// Medi-Cal: CMS-2454-IFC (Interim Final Rule, June 3, 2026),
//   42 CFR 435.550-435.563. Seven pathways to demonstrate community
//   engagement for a month (435.552(a)):
//     1. Work >= 80 hours
//     2. Community service >= 80 hours
//     3. Work program >= 80 hours
//     4. Enrolled in an educational program at least half-time
//     5. Combination of 1-4 totaling >= 80 hours
//     6. Monthly income >= federal minimum wage x 80 ($580)
//     7. Seasonal worker: 6-month average monthly income >= $580
//   Education conversion for less-than-half-time, credit-based programs
//   (435.552(d)): credit hours x 3 x 4.33 per month.
//   Income-to-hours conversion (state option, 435.552(e)(2)):
//   hours = monthly income / federal minimum wage, available when
//   income < $580 and hours are not documented.
//
// CalFresh: ABAWD work rules as modified by H.R.1 — 80 hours/month
//   (roughly 20 hours/week), or weekly earnings >= $217.50
//   (federal minimum wage x 30), or workfare where required hours =
//   monthly benefit / applicable local minimum wage. County waivers
//   apply through October 31, 2026 for the waived counties list.
//
// IMPORTANT: This engine produces ESTIMATES to help people who are
// likely subject to the requirements plan and track participation.
// It does not decide whether the requirements apply to anyone; only
// the county and state make official decisions.

import { getMinWageForZip, getWaivedCounty } from "./aurrera-data";

export const WEEKS_PER_MONTH = 4.33;
export const FED_MIN_WAGE = 7.25; // FLSA section 6(a)(1)(C), per IFR
export const MONTHLY_HOURS_REQUIRED = 80;
export const MEDICAL_INCOME_THRESHOLD = FED_MIN_WAGE * MONTHLY_HOURS_REQUIRED; // $580
export const CALFRESH_WEEKLY_PAY_THRESHOLD = 217.5; // $7.25 x 30
export const CREDIT_HOUR_MULTIPLIER = 3; // Carnegie Unit: 1 credit ~ 3 hrs/week

export const weeklyToMonthly = (weekly) => Math.round((Number(weekly) || 0) * WEEKS_PER_MONTH);

/* ------------------------------------------------------------------
   Education (Medi-Cal, 435.552(c)-(d))
------------------------------------------------------------------- */
export function educationMonthlyHours({ enrollment, creditHours, weeklyHours }) {
  // enrollment: "half_time_plus" | "less_credit" | "less_noncredit" | "none"
  if (enrollment === "half_time_plus") {
    // At least half-time enrollment satisfies the month outright (435.552(a)(4)).
    return { satisfiesAlone: true, monthlyHours: MONTHLY_HOURS_REQUIRED };
  }
  if (enrollment === "less_credit") {
    const hrs = (Number(creditHours) || 0) * CREDIT_HOUR_MULTIPLIER * WEEKS_PER_MONTH;
    return { satisfiesAlone: false, monthlyHours: Math.round(hrs * 100) / 100 };
  }
  if (enrollment === "less_noncredit") {
    return { satisfiesAlone: false, monthlyHours: weeklyToMonthly(weeklyHours) };
  }
  return { satisfiesAlone: false, monthlyHours: 0 };
}

/* ------------------------------------------------------------------
   Medi-Cal monthly evaluation
------------------------------------------------------------------- */
export function evaluateMediCal({
  workHours = 0,            // monthly
  communityServiceHours = 0,
  workProgramHours = 0,
  education = { enrollment: "none" },
  monthlyIncome = 0,
  isSeasonal = false,
  sixMonthAvgIncome = null,
}) {
  const edu = educationMonthlyHours(education);

  // Pathway 4: at-least-half-time enrollment satisfies on its own.
  if (edu.satisfiesAlone) {
    return {
      met: true,
      pathway: "education_half_time",
      totalHours: null,
      gapHours: 0,
      gapIncome: 0,
      detail: { edu },
    };
  }

  // Pathway 6: income.
  if ((Number(monthlyIncome) || 0) >= MEDICAL_INCOME_THRESHOLD) {
    return {
      met: true,
      pathway: "income",
      totalHours: null,
      gapHours: 0,
      gapIncome: 0,
      detail: { monthlyIncome },
    };
  }

  // Pathway 7: seasonal 6-month average.
  if (isSeasonal && sixMonthAvgIncome != null && sixMonthAvgIncome >= MEDICAL_INCOME_THRESHOLD) {
    return {
      met: true,
      pathway: "seasonal_average",
      totalHours: null,
      gapHours: 0,
      gapIncome: 0,
      detail: { sixMonthAvgIncome },
    };
  }

  // Pathways 1-3 + 5 (combination), plus the income-to-hours conversion
  // (state option) for income below the threshold.
  const activityHours =
    (Number(workHours) || 0) +
    (Number(communityServiceHours) || 0) +
    (Number(workProgramHours) || 0) +
    edu.monthlyHours;

  const incomeAsHours =
    (Number(monthlyIncome) || 0) > 0
      ? Math.floor((Number(monthlyIncome) || 0) / FED_MIN_WAGE)
      : 0;

  const totalHours = Math.round((activityHours + incomeAsHours) * 100) / 100;
  const met = totalHours >= MONTHLY_HOURS_REQUIRED;
  const gapHours = met ? 0 : Math.ceil(MONTHLY_HOURS_REQUIRED - totalHours);

  return {
    met,
    pathway: met ? "combination" : null,
    totalHours,
    activityHours: Math.round(activityHours * 100) / 100,
    incomeAsHours,
    gapHours,
    gapIncome: met ? 0 : Math.round(gapHours * FED_MIN_WAGE * 100) / 100,
    detail: { edu, monthlyIncome },
  };
}

/* ------------------------------------------------------------------
   CalFresh monthly evaluation
------------------------------------------------------------------- */
export function evaluateCalFresh({
  totalMonthlyHours = 0,
  weeklyPay = 0,
  inWorkfare = false,
  workfareMonthlyBenefit = 0,
  zip = "",
}) {
  const waivedCounty = getWaivedCounty(zip || "");
  const { wage: localMinWage, locality } = getMinWageForZip(zip || "");

  if (inWorkfare && (Number(workfareMonthlyBenefit) || 0) > 0) {
    const requiredHours = Math.floor((Number(workfareMonthlyBenefit) || 0) / localMinWage);
    const met = totalMonthlyHours >= requiredHours;
    return {
      met,
      mode: "workfare",
      requiredHours,
      localMinWage,
      locality,
      waivedCounty,
      gapHours: met ? 0 : requiredHours - Math.floor(totalMonthlyHours),
    };
  }

  const metHours = totalMonthlyHours >= MONTHLY_HOURS_REQUIRED;
  const metPay = (Number(weeklyPay) || 0) >= CALFRESH_WEEKLY_PAY_THRESHOLD;
  const met = metHours || metPay;
  return {
    met,
    mode: "standard",
    requiredHours: MONTHLY_HOURS_REQUIRED,
    localMinWage,
    locality,
    waivedCounty,
    metHours,
    metPay,
    gapHours: met ? 0 : Math.ceil(MONTHLY_HOURS_REQUIRED - totalMonthlyHours),
  };
}

/* ------------------------------------------------------------------
   Question-flow adapter: turns flow answers into both evaluations.
   Mirrors the Aurrera prototype logic, with the education handling
   upgraded to the IFR enrollment rules.
------------------------------------------------------------------- */
export function evaluateFlow(a) {
  const workWeekly = a.hasJob === "yes" ? Number(a.workHrs) || 0 : 0;
  const hourlyPay = a.hasJob === "yes" ? Number(a.hourlyPay) || 0 : 0;
  const workMonthly = weeklyToMonthly(workWeekly);
  const weeklyPay = workWeekly * hourlyPay;
  const monthlyPay = Math.round(weeklyPay * WEEKS_PER_MONTH * 100) / 100;

  const volQualifies = a.volunteers === "yes" && a.volQualifies === "yes";
  const volMonthly = volQualifies ? weeklyToMonthly(a.volHrs) : 0;

  const education =
    a.inSchool === "yes"
      ? a.schoolEnrollment === "half_time_plus"
        ? { enrollment: "half_time_plus" }
        : a.schoolEnrollment === "less_credit"
          ? { enrollment: "less_credit", creditHours: a.schoolCredits }
          : { enrollment: "less_noncredit", weeklyHours: a.schoolHrs }
      : { enrollment: "none" };
  const edu = educationMonthlyHours(education);

  const programs = a.program; // "calfresh" | "medical" | "both"
  const isCalFresh = programs === "calfresh" || programs === "both";
  const isMediCal = programs === "medical" || programs === "both";

  const mediCal = isMediCal
    ? evaluateMediCal({
        workHours: workMonthly,
        communityServiceHours: volMonthly,
        workProgramHours: 0,
        education,
        monthlyIncome: monthlyPay,
        isSeasonal: a.isSeasonal === "yes",
        sixMonthAvgIncome: a.isSeasonal === "yes" ? Number(a.seasonalAvgIncome) || 0 : null,
      })
    : null;

  // CalFresh totals: education counts via allowable training hours
  // (the Aurrera prototype counts school hours toward CalFresh).
  const calFreshHours =
    workMonthly + volMonthly + (edu.satisfiesAlone ? MONTHLY_HOURS_REQUIRED : edu.monthlyHours);

  const calFresh = isCalFresh
    ? evaluateCalFresh({
        totalMonthlyHours: calFreshHours,
        weeklyPay,
        inWorkfare: a.workfare === "yes",
        workfareMonthlyBenefit: Number(a.workfareBenefit) || 0,
        zip: a.zipCode || "",
      })
    : null;

  return {
    isCalFresh,
    isMediCal,
    workMonthly,
    volMonthly,
    eduMonthly: edu.satisfiesAlone ? null : edu.monthlyHours,
    eduSatisfiesAlone: edu.satisfiesAlone,
    weeklyPay: Math.round(weeklyPay * 100) / 100,
    monthlyPay,
    mediCal,
    calFresh,
    overallMet: (!isCalFresh || calFresh.met) && (!isMediCal || mediCal.met),
  };
}

/* ------------------------------------------------------------------
   Dashboard: evaluate logged activities for a given month ("YYYY-MM").
   Implements the unified hours + income tracker from the Module 1 spec:
   the $7.25/hour conversion happens here, behind the scenes.
------------------------------------------------------------------- */
export function evaluateMonthEntries(activities, month) {
  const entries = activities.filter((e) => e.month === month);
  const hours = entries
    .filter((e) => e.mode === "hours")
    .reduce((s, e) => s + (Number(e.hours) || 0), 0);
  const income = entries
    .filter((e) => e.mode === "wages")
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const incomeMet = income >= MEDICAL_INCOME_THRESHOLD;
  const incomeAsHours = income / FED_MIN_WAGE;
  const combined = hours + incomeAsHours;
  const met = incomeMet || combined >= MONTHLY_HOURS_REQUIRED;

  const gapHours = met ? 0 : Math.ceil(MONTHLY_HOURS_REQUIRED - combined);
  const gapIncome = met ? 0 : Math.round(gapHours * FED_MIN_WAGE * 100) / 100;
  const pct = Math.min(100, Math.round((combined / MONTHLY_HOURS_REQUIRED) * 100));

  const byType = {};
  for (const e of entries) {
    const k = e.type || "other";
    byType[k] = byType[k] || { hours: 0, income: 0, count: 0 };
    if (e.mode === "hours") byType[k].hours += Number(e.hours) || 0;
    else byType[k].income += Number(e.amount) || 0;
    byType[k].count += 1;
  }

  return { month, entries, hours, income, incomeMet, combined, met, gapHours, gapIncome, pct, byType };
}

/* Seasonal: average reported income over the 6 months preceding `month`. */
export function seasonalSixMonthAverage(activities, month) {
  const [y, m] = month.split("-").map(Number);
  const months = [];
  for (let i = 1; i <= 6; i++) {
    const d = new Date(y, m - 1 - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const total = activities
    .filter((e) => months.includes(e.month) && e.mode === "wages")
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const avg = Math.round((total / 6) * 100) / 100;
  return { months, avg, met: avg >= MEDICAL_INCOME_THRESHOLD };
}
