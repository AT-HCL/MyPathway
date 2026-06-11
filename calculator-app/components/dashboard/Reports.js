"use client";

// Report generation: any time period, CSV download or print-friendly view
// (use the browser's print-to-PDF). Includes entries with validation
// statuses, monthly totals, combined status, and the 6-month seasonal
// average when applicable.

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { getActivities, monthKey } from "@/lib/store";
import { evaluateMonthEntries, seasonalSixMonthAverage } from "@/lib/rules";
import { ValidationBadge } from "@/components/dashboard/Overview";

export default function Reports({ user }) {
  const { t, lang } = useI18n();
  const thisMonth = monthKey();
  const [from, setFrom] = useState(thisMonth);
  const [to, setTo] = useState(thisMonth);
  const [shared, setShared] = useState(false);

  const activities = getActivities();
  const months = [];
  if (from && to && from <= to) {
    let [y, m] = from.split("-").map(Number);
    while (true) {
      const key = `${y}-${String(m).padStart(2, "0")}`;
      months.push(key);
      if (key === to || months.length > 24) break;
      m += 1;
      if (m > 12) { m = 1; y += 1; }
    }
  }
  const monthResults = months.map((mo) => evaluateMonthEntries(activities, mo));
  const isSeasonalUser = user.flowAnswers?.isSeasonal === "yes";
  const seasonal = isSeasonalUser ? seasonalSixMonthAverage(activities, to || thisMonth) : null;
  const fmt = (n) => `$${Number(n).toFixed(2)}`;

  const downloadCsv = () => {
    const rows = [["month", "date", "type", "mode", "hours", "amount", "description", "document", "validation_status", "validator"]];
    monthResults.forEach((mr) =>
      mr.entries.forEach((e) =>
        rows.push([
          mr.month, e.date, e.type, e.mode, e.hours ?? "", e.amount ?? "",
          (e.description || "").replaceAll('"', '""'), e.docName || "",
          e.validation?.status || "not_submitted",
          e.validation?.validatorName ? `${e.validation.validatorName} (${e.validation.validatorOrg || ""})` : "",
        ])
      )
    );
    rows.push([]);
    rows.push(["month", "total_hours", "total_income", "combined_hour_equivalent", "monthly_status"]);
    monthResults.forEach((mr) =>
      rows.push([mr.month, mr.hours, mr.income.toFixed(2), mr.combined.toFixed(1), mr.met ? "meets" : "below"])
    );
    if (seasonal) {
      rows.push([]);
      rows.push(["seasonal_6_month_average_income", seasonal.avg.toFixed(2)]);
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c)}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mypathway-report-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <h4 className="mb-1">{t("reports.title")}</h4>
      <p className="text-small text-muted mb-3">{t("reports.sub")}</p>

      <div className="card mb-3 no-print">
        <div className="flex gap-2 flex-wrap items-center">
          <div>
            <label className="form-label" htmlFor="rep-from">{t("reports.from")}</label>
            <input id="rep-from" type="month" className="form-input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="form-label" htmlFor="rep-to">{t("reports.to")}</label>
            <input id="rep-to" type="month" className="form-input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-1 flex-wrap mt-2">
          <button className="btn btn-primary btn-sm" onClick={downloadCsv}>⬇ {t("reports.csv")}</button>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>🖨 {t("reports.pdf")}</button>
          <button className="btn btn-outline btn-sm" onClick={() => setShared(true)}>✉ {t("reports.share")}</button>
        </div>
        {shared && <div className="alert alert-success text-small mt-2" style={{ marginBottom: 0 }}>{t("reports.sharedNote")}</div>}
      </div>

      {/* Printable report */}
      <div className="card">
        <h5>{t("reports.reportHeader", { name: user.name })}</h5>
        <p className="text-small text-muted mb-2">
          {user.county} ·{" "}
          {["calfresh", "medical"]
            .filter((p) => user.programs.includes(p) || user.programs.includes("both"))
            .map((p) => t(`auth.programs.${p}`))
            .join(" + ")}{" "}
          ·{" "}
          {t("reports.generated", { date: new Date().toLocaleDateString(lang === "es" ? "es-US" : "en-US") })}
        </p>

        {monthResults.map((mr) => (
          <div key={mr.month} className="mb-3">
            <div className="flex justify-between items-center" style={{ background: "var(--gray-50)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-2)" }}>
              <strong>{mr.month}</strong>
              <span className={`badge ${mr.met ? "badge-validated" : "badge-pending"}`}>
                {mr.met ? t("reports.monthMeets") : t("reports.monthBelow")}
              </span>
            </div>
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
                {mr.entries.length === 0 ? (
                  <tr><td colSpan={4} className="text-muted text-small">{t("dash.noEntries")}</td></tr>
                ) : (
                  mr.entries.map((e) => (
                    <tr key={e.id}>
                      <td>{e.date}</td>
                      <td>{t(`log.types.${e.type}`)}</td>
                      <td>{e.mode === "hours" ? t("results.hrs", { n: e.hours }) : fmt(e.amount)}</td>
                      <td><ValidationBadge status={e.validation?.status || "not_submitted"} /></td>
                    </tr>
                  ))
                )}
                <tr style={{ fontWeight: 700 }}>
                  <td colSpan={2}>{t("reports.monthTotals")}</td>
                  <td colSpan={2}>
                    {t("results.hrs", { n: Math.round(mr.hours * 10) / 10 })} + {fmt(mr.income)} ={" "}
                    {t("reports.combinedEquiv", { n: mr.combined.toFixed(1) })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}

        {seasonal && (
          <p className="text-small">
            <strong>{t("dash.seasonalTitle")}:</strong> {t("dash.seasonalBody", { avg: fmt(seasonal.avg) })}
          </p>
        )}

        <p className="text-small text-muted mt-2">{t("common.disclaimer")}</p>
      </div>
    </div>
  );
}
