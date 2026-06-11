"use client";

// Profile completion (post-account-creation fields per the Module 1 spec)
// plus third-party access management and a demo reset.

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { saveUser, resetAll, uid } from "@/lib/store";
import { CA_COUNTIES } from "@/lib/counties";

export default function Profile({ user, onChanged }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    mediCalId: user.mediCalId || "",
    calFreshCase: user.calFreshCase || "",
    dob: user.dob || "",
    address: user.address || "",
    county: user.county,
    zip: user.zip || "",
  });
  const [helpers, setHelpers] = useState(user.helpers || []);
  const [newHelper, setNewHelper] = useState({ contact: "", level: "read" });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = (e) => {
    e.preventDefault();
    saveUser({ ...user, ...form, helpers, profileComplete: true });
    window.dispatchEvent(new Event("mpw-user-change"));
    setSaved(true);
    onChanged();
    setTimeout(() => setSaved(false), 3000);
  };

  const addHelper = () => {
    if (!newHelper.contact.trim()) return;
    const next = [...helpers, { id: uid(), contact: newHelper.contact.trim(), level: newHelper.level }];
    setHelpers(next);
    saveUser({ ...user, ...form, helpers: next });
    setNewHelper({ contact: "", level: "read" });
    onChanged();
  };

  const revoke = (id) => {
    const next = helpers.filter((h) => h.id !== id);
    setHelpers(next);
    saveUser({ ...user, ...form, helpers: next });
    onChanged();
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <h4 className="mb-2">{t("profile.title")}</h4>
      {saved && <div className="alert alert-success">{t("profile.saved")}</div>}

      <form onSubmit={save} className="card mb-3">
        <p className="text-small text-muted mb-2">{t("profile.sub")}</p>

        <label className="form-label" htmlFor="p-medical">{t("profile.mediCalId")}</label>
        <input id="p-medical" className="form-input mb-2" value={form.mediCalId} onChange={(e) => set("mediCalId", e.target.value)} />

        <label className="form-label" htmlFor="p-cf">{t("profile.calFreshCase")}</label>
        <input id="p-cf" className="form-input mb-2" value={form.calFreshCase} onChange={(e) => set("calFreshCase", e.target.value)} />

        <label className="form-label" htmlFor="p-dob">{t("profile.dob")}</label>
        <input id="p-dob" type="date" className="form-input mb-2" value={form.dob} onChange={(e) => set("dob", e.target.value)} />

        <label className="form-label" htmlFor="p-addr">{t("profile.address")}</label>
        <input id="p-addr" className="form-input mb-2" value={form.address} onChange={(e) => set("address", e.target.value)} />

        <div className="grid-2">
          <div>
            <label className="form-label" htmlFor="p-county">{t("auth.countyLabel")}</label>
            <select id="p-county" className="form-select mb-2" value={form.county} onChange={(e) => set("county", e.target.value)}>
              {CA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="p-zip">{t("auth.zipLabel")}</label>
            <input id="p-zip" className="form-input mb-2" maxLength={5} inputMode="numeric" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
          </div>
        </div>

        <button className="btn btn-primary" type="submit">{t("profile.save")}</button>
      </form>

      {/* Third-party access */}
      <div className="card mb-3">
        <h5 className="mb-1">{t("profile.helpersTitle")}</h5>
        <p className="text-small text-muted mb-2">{t("profile.helpersSub")}</p>
        {helpers.map((h) => (
          <div key={h.id} className="flex justify-between items-center mb-1" style={{ background: "var(--gray-50)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-2)" }}>
            <span className="text-small">
              {h.contact} · <em>{t(`profile.levels.${h.level}`)}</em>
            </span>
            <button className="btn btn-sm btn-outline" onClick={() => revoke(h.id)}>{t("profile.revoke")}</button>
          </div>
        ))}
        <div className="flex gap-1 flex-wrap items-center mt-2">
          <input
            className="form-input"
            style={{ maxWidth: 240 }}
            placeholder={t("validation.contactPlaceholder")}
            value={newHelper.contact}
            onChange={(e) => setNewHelper((n) => ({ ...n, contact: e.target.value }))}
            aria-label={t("profile.helpersTitle")}
          />
          <select
            className="form-select"
            style={{ maxWidth: 160 }}
            value={newHelper.level}
            onChange={(e) => setNewHelper((n) => ({ ...n, level: e.target.value }))}
            aria-label={t("profile.accessLevel")}
          >
            <option value="read">{t("profile.levels.read")}</option>
            <option value="full">{t("profile.levels.full")}</option>
          </select>
          <button className="btn btn-sm btn-primary" onClick={addHelper} type="button">{t("profile.invite")}</button>
        </div>
      </div>

      {/* Demo reset */}
      <div className="card" style={{ borderLeft: "5px solid var(--danger-500)" }}>
        <h5 className="mb-1">{t("profile.resetTitle")}</h5>
        <p className="text-small text-muted mb-2">{t("profile.resetSub")}</p>
        <button
          className="btn btn-outline btn-sm"
          style={{ color: "var(--danger-700)", borderColor: "var(--danger-700)" }}
          onClick={() => {
            if (window.confirm(t("profile.resetConfirm"))) {
              resetAll();
              window.dispatchEvent(new Event("mpw-user-change"));
              window.location.href = "/";
            }
          }}
        >
          {t("profile.resetCta")}
        </button>
      </div>
    </div>
  );
}
