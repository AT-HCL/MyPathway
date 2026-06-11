"use client";

// Coming-soon views for future modules: Take a Class (Job Ready
// California, Module 2) and Build Your Career (Front Door, Module 3).
// Rendered inside the dashboard so all navigation stays available.

import { useI18n } from "@/lib/i18n";

export default function ComingSoon({ which, goTo }) {
  const { t } = useI18n();

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="card" style={{ textAlign: "center", padding: "var(--s-5) var(--s-3)" }}>
        <div style={{ fontSize: "2.5rem" }} aria-hidden="true">{which === "classes" ? "📚" : "🧭"}</div>
        <span className="badge badge-info mt-2" style={{ fontSize: "0.85rem" }}>{t("comingSoon.tag")}</span>
        <h3 className="mt-2">{t(`comingSoon.${which}.title`)}</h3>
        <p className="mt-2 text-small" style={{ maxWidth: 480, margin: "var(--s-2) auto 0" }}>
          {t(`comingSoon.${which}.body`)}
        </p>
        <p className="mt-2 text-small text-muted">{t("comingSoon.meanwhile")}</p>
        <div className="flex gap-1 mt-2 no-print" style={{ justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-sm" onClick={() => goTo("resources")}>
            {t("dash.tabs.resources")}
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => goTo("plan")}>
            {t("dash.tabs.plan")}
          </button>
        </div>
      </div>
    </div>
  );
}
