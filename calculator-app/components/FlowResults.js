"use client";

// Results screen for the question flow. Hedged, plain-language estimates
// per program, with the official-notice reminder and disclaimer required
// on every result.

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { evaluateFlow, MONTHLY_HOURS_REQUIRED, MEDICAL_INCOME_THRESHOLD, CALFRESH_WEEKLY_PAY_THRESHOLD } from "@/lib/rules";

export default function FlowResults({ answers, onBack }) {
  const { t } = useI18n();

  const a = { ...answers };
  if (a.isSeasonal === "yes" && a.seasonal6moTotal) {
    a.seasonalAvgIncome = (Number(a.seasonal6moTotal) || 0) / 6;
  }
  const r = evaluateFlow(a);

  const fmt = (n) => `$${Number(n).toFixed(2)}`;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Overall banner */}
      {r.overallMet ? (
        <div className="alert alert-success" style={{ textAlign: "center", padding: "var(--s-4)" }}>
          <div style={{ fontSize: "2rem" }} aria-hidden="true">✅</div>
          <h3 style={{ color: "var(--success-900)" }}>{t("results.metTitle")}</h3>
          <p>{t("results.metSub")}</p>
        </div>
      ) : (
        <div className="alert alert-warning" style={{ textAlign: "center", padding: "var(--s-4)" }}>
          <div style={{ fontSize: "2rem" }} aria-hidden="true">⚠️</div>
          <h3 style={{ color: "var(--warning-900)" }}>{t("results.gapTitle")}</h3>
          <p>{t("results.gapSub")}</p>
        </div>
      )}

      {/* Waived county (CalFresh) */}
      {r.isCalFresh && r.calFresh?.waivedCounty && (
        <div className="alert alert-success">
          {t("results.waived", { county: r.calFresh.waivedCounty })}{" "}
          <a href="https://www.cdss.ca.gov/inforesources/calfresh/abawd" target="_blank" rel="noopener noreferrer">
            {t("results.waivedSource")}
          </a>
        </div>
      )}

      {/* Hours breakdown */}
      <div className="card mb-3">
        <h5 className="mb-2">{t("results.breakdownTitle")}</h5>
        <table className="table">
          <tbody>
            {r.workMonthly > 0 && (
              <tr><td>{t("results.rows.work")}</td><td style={{ textAlign: "right" }}>{t("results.hrs", { n: r.workMonthly })}</td></tr>
            )}
            {r.volMonthly > 0 && (
              <tr><td>{t("results.rows.volunteering")}</td><td style={{ textAlign: "right" }}>{t("results.hrs", { n: r.volMonthly })}</td></tr>
            )}
            {r.eduSatisfiesAlone && (
              <tr><td>{t("results.rows.eduHalfTime")}</td><td style={{ textAlign: "right", fontWeight: 700 }}>{t("results.eduMeets")}</td></tr>
            )}
            {!r.eduSatisfiesAlone && r.eduMonthly > 0 && (
              <tr><td>{t("results.rows.school")}</td><td style={{ textAlign: "right" }}>{t("results.hrs", { n: r.eduMonthly })}</td></tr>
            )}
            {r.weeklyPay > 0 && (
              <tr>
                <td className="text-muted">{t("results.rows.pay")}</td>
                <td style={{ textAlign: "right" }}>{fmt(r.weeklyPay)}/{t("results.week")} ({fmt(r.monthlyPay)}/{t("results.month")})</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Per-program cards */}
      <div className="grid-2 mb-3">
        {r.isCalFresh && r.calFresh && (
          <div className="card" style={{ borderTop: `4px solid ${r.calFresh.met ? "var(--success-500)" : "var(--accent1-500)"}` }}>
            <h5>{t("results.calfreshTitle")}</h5>
            {r.calFresh.mode === "workfare" ? (
              <p className="text-small mt-1">
                {t("results.cfWorkfare", {
                  required: r.calFresh.requiredHours,
                  wage: fmt(r.calFresh.localMinWage),
                  locality: r.calFresh.locality,
                })}
              </p>
            ) : (
              <p className="text-small mt-1">
                {t("results.cfStandard", { hours: MONTHLY_HOURS_REQUIRED, pay: fmt(CALFRESH_WEEKLY_PAY_THRESHOLD) })}
              </p>
            )}
            <p className="mt-1" style={{ fontWeight: 700, color: r.calFresh.met ? "var(--success-700)" : "var(--accent1-700)" }}>
              {r.calFresh.met ? t("results.cfMet") : t("results.cfGap", { n: r.calFresh.gapHours })}
            </p>
          </div>
        )}
        {r.isMediCal && r.mediCal && (
          <div className="card" style={{ borderTop: `4px solid ${r.mediCal.met ? "var(--success-500)" : "var(--accent1-500)"}` }}>
            <h5>{t("results.medicalTitle")}</h5>
            <p className="text-small mt-1">
              {t("results.mcStandard", { hours: MONTHLY_HOURS_REQUIRED, income: fmt(MEDICAL_INCOME_THRESHOLD) })}
            </p>
            {r.mediCal.met ? (
              <p className="mt-1" style={{ fontWeight: 700, color: "var(--success-700)" }}>
                {t(`results.mcPathways.${r.mediCal.pathway}`)}
              </p>
            ) : (
              <p className="mt-1" style={{ fontWeight: 700, color: "var(--accent1-700)" }}>
                {t("results.mcGap", { n: r.mediCal.gapHours, income: fmt(r.mediCal.gapIncome) })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* What counts */}
      {!r.overallMet && (
        <div className="card mb-3">
          <h5 className="mb-1">{t("results.whatCountsTitle")}</h5>
          <p className="text-small">{t("results.whatCountsBody")}</p>
        </div>
      )}

      {/* Official notice reminder + disclaimer */}
      <div className="alert alert-info">{t("common.officialNotice")}</div>
      <p className="text-small text-muted mb-3">{t("common.disclaimer")}</p>

      {/* CTAs */}
      <div className="flex gap-2 flex-wrap no-print">
        <Link href="/create-account" className="btn btn-primary">
          {t("results.ctaCreate")}
        </Link>
        <button className="btn btn-outline" onClick={() => window.print()}>
          🖨 {t("results.print")}
        </button>
        <button className="btn btn-outline" onClick={onBack}>
          ← {t("flow.back")}
        </button>
      </div>
    </div>
  );
}
