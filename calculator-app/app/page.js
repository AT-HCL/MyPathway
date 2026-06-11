"use client";

// BenefitsPathwayCal landing page — three entry points per the Module 1 spec,
// plus the "I got a letter from my county" section with official resources.

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <>
      {/* Hero */}
      <div style={{ background: "var(--primary-100)", padding: "var(--s-5) 0" }}>
        <div className="container">
          <h1 style={{ color: "var(--primary-900)", marginBottom: "var(--s-2)" }}>{t("landing.title")}</h1>
          <p style={{ fontSize: "1.2rem", maxWidth: 640 }}>{t("landing.subtitle")}</p>
        </div>
      </div>

      <div className="container mt-4">
        {/* Three entry points */}
        <div style={{ display: "grid", gap: "var(--s-2)" }}>
          <Link href="/flow" className="action-btn">
            <div className="action-title">{t("landing.entry1Title")}</div>
            <div className="action-desc">{t("landing.entry1Desc")}</div>
          </Link>
          <Link href="/signin" className="action-btn">
            <div className="action-title">{t("landing.entry2Title")}</div>
            <div className="action-desc">{t("landing.entry2Desc")}</div>
          </Link>
          <Link href="/create-account" className="action-btn">
            <div className="action-title">{t("landing.entry3Title")}</div>
            <div className="action-desc">{t("landing.entry3Desc")}</div>
          </Link>
        </div>

        {/* Key dates */}
        <div className="alert alert-info mt-4">
          <strong>{t("landing.datesTitle")}</strong> {t("landing.datesBody")}
        </div>

        {/* Got a letter? */}
        <div className="card mt-4" style={{ borderLeft: "5px solid var(--accent1-500)" }}>
          <h4>{t("landing.letterTitle")}</h4>
          <p className="mt-1">{t("landing.letterBody")}</p>
          <ul style={{ marginTop: "var(--s-2)", paddingLeft: "1.4rem", lineHeight: 2 }}>
            <li>
              <a href="https://www.cdss.ca.gov/inforesources/calfresh/abawd" target="_blank" rel="noopener noreferrer">
                {t("landing.linkCdss")}
              </a>
            </li>
            <li>
              <a href="https://www.dhcs.ca.gov/medi-cal/help/medi-cal-changes/" target="_blank" rel="noopener noreferrer">
                {t("landing.linkDhcs")}
              </a>
            </li>
            <li>
              <a href="https://benefitscal.com" target="_blank" rel="noopener noreferrer">
                {t("landing.linkBenefitsCal")}
              </a>
            </li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-small text-muted mt-4">{t("common.disclaimer")}</p>
      </div>
    </>
  );
}
