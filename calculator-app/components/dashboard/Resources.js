"use client";

// County-tailored resources, driven by the member's county/zip.

import { useI18n } from "@/lib/i18n";
import { resourcesForCounty, PILOT_COUNTIES } from "@/lib/counties";
import { getWaivedCounty } from "@/lib/aurrera-data";

export default function Resources({ user }) {
  const { t } = useI18n();
  const { local, statewide } = resourcesForCounty(user.county);
  const waived = user.zip ? getWaivedCounty(user.zip) : null;

  const Card = ({ r }) => (
    <a href={r.url} target="_blank" rel="noopener noreferrer" className="card mb-2" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <strong style={{ color: "var(--primary-700)" }}>{r.name} ↗</strong>
      <p className="text-small text-muted" style={{ marginTop: "0.25rem" }}>{t(r.descKey)}</p>
    </a>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <h4 className="mb-1">{t("resources.title", { county: user.county })}</h4>
      <p className="text-small text-muted mb-3">{t("resources.sub")}</p>

      {waived && (
        <div className="alert alert-success text-small">
          {t("results.waived", { county: waived })}
        </div>
      )}

      {local.length > 0 && (
        <>
          <h5 className="mb-2">{t("resources.localHeader", { county: user.county })}</h5>
          {local.map((r) => <Card key={r.url} r={r} />)}
        </>
      )}
      {local.length === 0 && PILOT_COUNTIES.includes(user.county) === false && (
        <p className="text-small text-muted mb-2">{t("resources.noLocal")}</p>
      )}

      <h5 className="mb-2 mt-3">{t("resources.statewideHeader")}</h5>
      {statewide.map((r) => <Card key={r.url} r={r} />)}
    </div>
  );
}
