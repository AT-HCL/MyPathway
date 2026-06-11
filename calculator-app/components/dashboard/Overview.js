"use client";

// Monthly progress tracker. Unified hours + income view: the federal
// minimum wage conversion happens in the rules engine; the member sees
// plain-language guidance only.

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  getActivities, monthKey, isMonthlyPromptDismissed, dismissMonthlyPrompt,
} from "@/lib/store";
import {
  evaluateMonthEntries, seasonalSixMonthAverage, MONTHLY_HOURS_REQUIRED,
} from "@/lib/rules";

export default function Overview({ user, onChanged, goTo }) {
  const { t, lang } = useI18n();
  const [promptDismissed, setPromptDismissed] = useState(isMonthlyPromptDismissed());

  const month = monthKey();
  const activities = getActivities();
  const m = evaluateMonthEntries(activities, month);
  const seasonal = seasonalSixMonthAverage(activities, month);
  const isSeasonalUser = user.flowAnswers?.isSeasonal === "yes";

  const monthName = new Date().toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "long", year: "numeric" });
  const fmt = (n) => `$${Number(n).toFixed(2)}`;

  return (
    <div>
      {/* Start-of-month recalculation prompt */}
      {!promptDismissed && (
        <div className="alert alert-info flex justify-between items-center gap-2 no-print">
          <span>{t("dash.monthlyPrompt")}</span>
          <span className="flex gap-1">
            <button className="btn btn-sm btn-primary" onClick={() => goTo("plan")}>{t("dash.monthlyPromptCta")}</button>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => { dismissMonthlyPrompt(); setPromptDismissed(true); }}
            >
              {t("dash.dismiss")}
            </button>
          </span>
        </div>
      )}

      {/* Profile completion prompt */}
      {!user.profileComplete && (
        <div className="alert alert-warning flex justify-between items-center gap-2 no-print">
          <span>{t("dash.profilePrompt")}</span>
          <button className="btn btn-sm btn-outline" onClick={() => goTo("profile")}>{t("dash.profilePromptCta")}</button>
        </div>
      )}

      {/* Progress card */}
      <div className="card mb-3">
        <div className="flex justify-between items-center mb-2 flex-wrap gap-1">
          <h4>{t("dash.progressTitle", { month: monthName })}</h4>
          <span className="badge badge-info">{t("dash.requirement", { n: MONTHLY_HOURS_REQUIRED })}</span>
        </div>

        <div className="progress-track mb-2" role="progressbar" aria-valuenow={m.pct} aria-valuemin={0} aria-valuemax={100} aria-label={t("dash.progressTitle", { month: monthName })}>
          <div className="progress-fill" style={{ width: `${m.pct}%` }} />
        </div>

        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>
          {m.met
            ? t("dash.statusMet", { hours: Math.round(m.hours * 10) / 10, income: fmt(m.income) })
            : t("dash.statusGap", { hours: Math.round(m.hours * 10) / 10, income: fmt(m.income), gapHours: m.gapHours, gapIncome: fmt(m.gapIncome) })}
        </p>
        {!m.met && <p className="text-small text-muted mt-1">{t("dash.statusGapHint")}</p>}

        <div className="grid-2 mt-2">
          <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-3)", padding: "var(--s-2)" }}>
            <div className="text-small text-muted">{t("dash.hoursReported")}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{Math.round(m.hours * 10) / 10}</div>
          </div>
          <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-3)", padding: "var(--s-2)" }}>
            <div className="text-small text-muted">{t("dash.incomeReported")}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{fmt(m.income)}</div>
          </div>
        </div>
      </div>

      {/* Seasonal averaging */}
      {(isSeasonalUser || seasonal.avg > 0) && (
        <div className="card mb-3" style={{ borderLeft: "5px solid var(--accent2-300)" }}>
          <h5>{t("dash.seasonalTitle")}</h5>
          <p className="text-small mt-1">
            {t("dash.seasonalBody", { avg: fmt(seasonal.avg) })}{" "}
            {seasonal.met ? (
              <strong style={{ color: "var(--success-700)" }}>{t("dash.seasonalMet")}</strong>
            ) : (
              <span>{t("dash.seasonalNotMet")}</span>
            )}
          </p>
        </div>
      )}

      {/* Recent entries */}
      <div className="card mb-3">
        <div className="flex justify-between items-center mb-2">
          <h5>{t("dash.recentTitle")}</h5>
          <button className="btn btn-sm btn-primary no-print" onClick={() => goTo("log")}>+ {t("dash.tabs.log")}</button>
        </div>
        {m.entries.length === 0 ? (
          <p className="text-small text-muted">{t("dash.noEntries")}</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t("log.date")}</th>
                <th>{t("log.type")}</th>
                <th>{t("log.reported")}</th>
                <th>{t("validation.status")}</th>
              </tr>
            </thead>
            <tbody>
              {m.entries.slice(0, 6).map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{t(`log.types.${e.type}`)}</td>
                  <td>{e.mode === "hours" ? t("results.hrs", { n: e.hours }) : fmt(e.amount)}</td>
                  <td><ValidationBadge status={e.validation?.status || "not_submitted"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="alert alert-info text-small">{t("common.officialNotice")}</div>
      <p className="text-small text-muted">{t("common.disclaimer")}</p>
    </div>
  );
}

export function ValidationBadge({ status }) {
  const { t } = useI18n();
  const cls = {
    not_submitted: "badge-gray",
    pending: "badge-pending",
    validated: "badge-validated",
    declined: "badge-declined",
    expired: "badge-gray",
  }[status] || "badge-gray";
  return <span className={`badge ${cls}`}>{t(`validation.statuses.${status}`)}</span>;
}
