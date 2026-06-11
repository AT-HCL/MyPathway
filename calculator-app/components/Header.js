"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { getUser, signOut } from "@/lib/store";

export default function Header() {
  const { lang, setLang, t } = useI18n();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
    const onStorage = () => setUser(getUser());
    window.addEventListener("mpw-user-change", onStorage);
    return () => window.removeEventListener("mpw-user-change", onStorage);
  }, []);

  return (
    <header className="no-print">
      {/* Branding stripe (CA.gov pattern; prototype is NOT an official state site) */}
      <div style={{ background: "var(--cagov-primary-dark)", color: "var(--white)", fontSize: "0.8rem", padding: "0.3rem 0" }}>
        <div className="container container-wide flex items-center justify-between">
          <span>{t("header.stripe")}</span>
          <span style={{ color: "var(--cagov-highlight)", fontWeight: 700 }}>{t("header.prototypeTag")}</span>
        </div>
      </div>

      <div style={{ background: "var(--primary-900)", color: "var(--white)", padding: "0.75rem 0" }}>
        <div className="container container-wide flex items-center justify-between gap-2 flex-wrap">
          <Link href="/" style={{ color: "var(--white)", textDecoration: "none", fontWeight: 700, fontSize: "1.25rem" }}>
            MyBenefitsPathway
          </Link>
          <nav className="flex items-center gap-2 flex-wrap" aria-label="Main">
            <div role="group" aria-label={t("header.langToggle")} style={{ display: "inline-flex", border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: "var(--radius-2)", overflow: "hidden" }}>
              {["en", "es"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  style={{
                    fontFamily: "var(--site-font)", fontSize: "0.85rem", fontWeight: 600,
                    padding: "0.25rem 0.7rem", border: "none", cursor: "pointer",
                    background: lang === l ? "var(--white)" : "transparent",
                    color: lang === l ? "var(--primary-900)" : "var(--white)",
                  }}
                >
                  {l === "en" ? "English" : "Español"}
                </button>
              ))}
            </div>
            {user ? (
              <>
                <Link href="/dashboard" className="btn btn-sm" style={{ background: "var(--accent2-300)", color: "var(--gray-900)", border: "none" }}>
                  {t("header.myPathway")}
                </Link>
                <button
                  className="btn btn-sm"
                  style={{ background: "transparent", color: "var(--white)", border: "1.5px solid rgba(255,255,255,0.5)" }}
                  onClick={() => {
                    signOut();
                    window.dispatchEvent(new Event("mpw-user-change"));
                    window.location.href = "/";
                  }}
                >
                  {t("header.signOut")}
                </button>
              </>
            ) : (
              <Link href="/signin" className="btn btn-sm" style={{ background: "transparent", color: "var(--white)", border: "1.5px solid rgba(255,255,255,0.5)" }}>
                {t("header.signIn")}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
