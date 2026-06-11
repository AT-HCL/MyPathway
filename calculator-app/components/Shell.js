"use client";

// Shell: password gate (prototype/prototype per Module 1 spec) + i18n provider
// + CA.gov-style header and footer around every page.

import { useEffect, useState } from "react";
import { I18nProvider } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Gate({ onUnlock }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (u.trim() === "prototype" && p === "prototype") {
      try { window.sessionStorage.setItem("mpw_gate", "ok"); } catch {}
      onUnlock();
    } else {
      setErr(true);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--primary-900)", padding: "var(--s-2)" }}>
      <form onSubmit={submit} className="card" style={{ width: "100%", maxWidth: 380 }}>
        <h4 style={{ marginBottom: "var(--s-1)" }}>MyBenefitsPathway</h4>
        <p className="text-small text-muted" style={{ marginBottom: "var(--s-2)" }}>
          Prototype preview. Enter the shared username and password to continue.
        </p>
        <label className="form-label" htmlFor="gate-user">Username</label>
        <input id="gate-user" className="form-input mb-2" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" />
        <label className="form-label" htmlFor="gate-pass">Password</label>
        <input id="gate-pass" className="form-input mb-2" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
        {err && <p className="form-error mb-1">That username or password is not correct.</p>}
        <button className="btn btn-primary btn-block" type="submit">Continue</button>
      </form>
    </div>
  );
}

export default function Shell({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setUnlocked(window.sessionStorage.getItem("mpw_gate") === "ok");
    } catch {}
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <I18nProvider>
      {!unlocked ? (
        <Gate onUnlock={() => setUnlocked(true)} />
      ) : (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <Header />
          <main style={{ flex: 1, paddingBottom: "var(--s-6)" }}>{children}</main>
          <Footer />
        </div>
      )}
    </I18nProvider>
  );
}
