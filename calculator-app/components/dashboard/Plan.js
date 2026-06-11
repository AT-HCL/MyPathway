"use client";

// Personalized compliance plan. Short survey on individual circumstances
// (transportation, caregiving, schedule, digital access, interests),
// then a rule-based recommended pathway mix to reach 80 hours. The plan
// is meant to refine over time as activity is reported.

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { getPlan, savePlan, getActivities, monthKey } from "@/lib/store";
import { evaluateMonthEntries, MONTHLY_HOURS_REQUIRED, FED_MIN_WAGE } from "@/lib/rules";

const QUESTIONS = [
  { key: "transport", options: ["yes", "limited", "no"] },
  { key: "caregiving", options: ["yes", "no"] },
  { key: "schedule", options: ["full", "part", "varies", "none"] },
  { key: "digital", options: ["smartphone", "computer", "limited"] },
  { key: "interests", options: ["jobs", "volunteering", "education", "training"], multi: true },
];

function buildPlan(answers, gapHours) {
  // Rule-based allocation of the remaining monthly hours.
  const recs = [];
  const remote = answers.transport !== "yes" || answers.caregiving === "yes";
  const online = answers.digital !== "limited";

  if (answers.schedule === "none" && answers.interests?.includes("jobs")) {
    recs.push({ key: "findWork", hours: Math.min(gapHours, 40) });
  }
  if (answers.interests?.includes("education") || (remote && online)) {
    recs.push({ key: remote && online ? "onlineCourses" : "localClasses", hours: Math.min(gapHours, 30) });
  }
  if (answers.interests?.includes("training")) {
    recs.push({ key: "training", hours: Math.min(gapHours, 30) });
  }
  if (answers.interests?.includes("volunteering") || recs.length === 0) {
    recs.push({ key: remote ? "remoteVolunteering" : "volunteering", hours: Math.min(gapHours, 20) });
  }
  if (answers.schedule === "part" || answers.schedule === "varies") {
    recs.push({ key: "reportIncome", hours: null });
  }

  // Scale hour suggestions so they sum to roughly the gap.
  const hourRecs = recs.filter((r) => r.hours);
  const total = hourRecs.reduce((s, r) => s + r.hours, 0);
  if (total > 0 && gapHours > 0) {
    let remaining = gapHours;
    hourRecs.forEach((r, i) => {
      const share = i === hourRecs.length - 1 ? remaining : Math.max(4, Math.round((r.hours / total) * gapHours));
      r.hours = Math.min(share, remaining);
      remaining -= r.hours;
    });
  }
  return recs.filter((r) => r.hours === null || r.hours > 0);
}

export default function Plan({ user, onChanged }) {
  const { t } = useI18n();
  const saved = getPlan();
  const [answers, setAnswers] = useState(saved?.answers || {});
  const [editing, setEditing] = useState(!saved);

  const m = evaluateMonthEntries(getActivities(), monthKey());
  const gapHours = m.met ? 0 : m.gapHours;

  const set = (k, v) => setAnswers((a) => ({ ...a, [k]: v }));
  const toggleMulti = (k, v) =>
    setAnswers((a) => {
      const cur = a[k] || [];
      return { ...a, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] };
    });

  const complete = QUESTIONS.every((q) => (q.multi ? (answers[q.key] || []).length > 0 : answers[q.key]));

  const generate = () => {
    const plan = buildPlan(answers, gapHours || MONTHLY_HOURS_REQUIRED);
    savePlan({ answers, plan, generatedAt: new Date().toISOString() });
    setEditing(false);
    onChanged();
  };

  const plan = getPlan();

  return (
    <div style={{ maxWidth: 640 }}>
      <h4 className="mb-1">{t("plan.title")}</h4>
      <p className="text-small text-muted mb-3">{t("plan.sub")}</p>

      {editing ? (
        <div className="card">
          {QUESTIONS.map((q) => (
            <fieldset key={q.key} className="mb-3">
              <legend style={{ fontSize: "1.05rem" }}>{t(`plan.q.${q.key}.label`)}</legend>
              <div className="flex gap-1 flex-wrap">
                {q.options.map((opt) => {
                  const selected = q.multi ? (answers[q.key] || []).includes(opt) : answers[q.key] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`btn btn-sm ${selected ? "btn-primary" : "btn-outline"}`}
                      aria-pressed={selected}
                      onClick={() => (q.multi ? toggleMulti(q.key, opt) : set(q.key, opt))}
                    >
                      {t(`plan.q.${q.key}.opts.${opt}`)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <button className="btn btn-primary" onClick={generate} disabled={!complete} aria-disabled={!complete}>
            {t("plan.generate")}
          </button>
        </div>
      ) : (
        plan && (
          <>
            <div className="alert alert-success">
              {gapHours > 0
                ? t("plan.summaryGap", { gap: gapHours, income: `$${(gapHours * FED_MIN_WAGE).toFixed(2)}` })
                : t("plan.summaryMet")}
            </div>
            {plan.plan.map((r) => (
              <div key={r.key} className="card mb-2" style={{ borderLeft: "5px solid var(--primary-500)" }}>
                <div className="flex justify-between items-center gap-2">
                  <strong>{t(`plan.recs.${r.key}.title`)}</strong>
                  {r.hours && <span className="badge badge-info">{t("plan.hoursPerMonth", { n: r.hours })}</span>}
                </div>
                <p className="text-small mt-1">{t(`plan.recs.${r.key}.desc`)}</p>
              </div>
            ))}
            <button className="btn btn-outline btn-sm mt-2" onClick={() => setEditing(true)}>
              {t("plan.redo")}
            </button>
          </>
        )
      )}
    </div>
  );
}
