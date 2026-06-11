"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="no-print" style={{ background: "var(--primary-900)", color: "var(--white)", padding: "var(--s-4) 0", marginTop: "var(--s-5)" }}>
      <div className="container container-wide">
        <p style={{ fontSize: "0.875rem", lineHeight: 1.7, maxWidth: 720 }}>{t("footer.disclaimer")}</p>
        <div className="flex gap-3 flex-wrap mt-2" style={{ fontSize: "0.875rem" }}>
          <a href="https://www.cdss.ca.gov/inforesources/calfresh/abawd" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-300)" }}>
            {t("footer.cdssLink")}
          </a>
          <a href="https://www.dhcs.ca.gov/medi-cal/help/medi-cal-changes/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-300)" }}>
            {t("footer.dhcsLink")}
          </a>
          <a href="https://benefitscal.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-300)" }}>
            BenefitsCal.com
          </a>
          <Link href="/how-it-works" style={{ color: "var(--primary-300)" }}>
            {t("footer.howItWorks")}
          </Link>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--primary-300)", marginTop: "var(--s-2)" }}>
          {t("footer.builtByPrefix")}{" "}
          <a href="https://www.thehealthcolab.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-300)" }}>
            The Health CoLab
          </a>{" "}
          {t("footer.builtByAnd")}{" "}
          <a href="https://www.aurrerahealth.com/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-300)" }}>
            Aurrera Health Group
          </a>{" "}
          {t("footer.builtBySuffix")}
        </p>
      </div>
    </footer>
  );
}
