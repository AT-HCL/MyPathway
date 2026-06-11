"use client";

// Magic-link sign-in, simulated for the prototype. One field (email or
// phone), then a "check your email" screen with a demo button that
// completes the link click. Social sign-in buttons are visual placeholders
// per the Module 1 spec.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { getUser, saveUser } from "@/lib/store";

export default function SignInPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const send = (e) => {
    e.preventDefault();
    if (!contact.trim()) { setErr(t("auth.errEmpty")); return; }
    setErr("");
    setSent(true);
  };

  const completeLink = () => {
    const existing = getUser();
    if (existing) {
      saveUser({ ...existing, lastSignIn: new Date().toISOString() });
      window.dispatchEvent(new Event("mpw-user-change"));
      router.push("/dashboard");
    } else {
      router.push(`/create-account?contact=${encodeURIComponent(contact.trim())}`);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 480 }}>
      {!sent ? (
        <>
          <h2 className="mb-2">{t("auth.signInTitle")}</h2>
          <p className="text-small text-muted mb-3">{t("auth.signInSub")}</p>
          <form onSubmit={send} className="card">
            <label className="form-label" htmlFor="contact">{t("auth.contactLabel")}</label>
            <p className="form-hint">{t("auth.contactHint")}</p>
            <input
              id="contact"
              className="form-input mb-2"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={t("auth.contactPlaceholder")}
              autoComplete="email"
            />
            {err && <p className="form-error mb-1">{err}</p>}
            <button className="btn btn-primary btn-block" type="submit">{t("auth.sendLink")}</button>

            <div className="mt-3" style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "var(--s-2)" }}>
              <p className="text-small text-muted mb-1">{t("auth.orSocial")}</p>
              <div className="grid-2" style={{ gap: "var(--s-1)" }}>
                {["Google", "Apple", "Facebook", "X"].map((p) => (
                  <button key={p} type="button" className="btn btn-outline btn-sm" onClick={() => setSent(true)}>
                    {t("auth.signInWith", { provider: p })}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "var(--s-4)" }}>
          <div style={{ fontSize: "2.5rem" }} aria-hidden="true">📬</div>
          <h3 className="mb-2">{t("auth.checkTitle")}</h3>
          <p className="text-small text-muted mb-3">{t("auth.checkBody", { contact: contact || t("auth.yourInbox") })}</p>
          <div className="alert alert-warning text-small" style={{ textAlign: "left" }}>
            {t("auth.demoNote")}
          </div>
          <button className="btn btn-success btn-block" onClick={completeLink}>
            {t("auth.demoOpenLink")}
          </button>
        </div>
      )}
    </div>
  );
}
