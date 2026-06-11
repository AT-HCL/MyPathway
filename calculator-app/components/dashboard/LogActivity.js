"use client";

// Activity logging: pick a type (work, community service, education/
// training, work program) and a reporting mode (hours or wages), per the
// Module 1 spec. Supporting documents can be attached (name stored for
// the prototype). Each entry starts with validation status not_submitted.

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { addActivity, monthKey } from "@/lib/store";

const TYPES = ["work", "community_service", "education", "work_program"];

export default function LogActivity({ user, onChanged }) {
  const { t } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ type: "work", mode: "hours", date: today, hours: "", amount: "", description: "", docName: "" });
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const val = form.mode === "hours" ? Number(form.hours) : Number(form.amount);
    if (!form.date || !val || val <= 0) { setErr(t("log.errInvalid")); return; }
    setErr("");
    addActivity({
      type: form.type,
      mode: form.mode,
      hours: form.mode === "hours" ? Number(form.hours) : null,
      amount: form.mode === "wages" ? Number(form.amount) : null,
      date: form.date,
      month: form.date.slice(0, 7),
      description: form.description.trim(),
      docName: form.docName,
      validation: { status: "not_submitted" },
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
    setForm({ type: "work", mode: "hours", date: today, hours: "", amount: "", description: "", docName: "" });
    onChanged();
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <h4 className="mb-2">{t("log.title")}</h4>
      {saved && <div className="alert alert-success">{t("log.saved")}</div>}
      <form onSubmit={submit} className="card">
        <label className="form-label">{t("log.type")}</label>
        <div className="grid-2 mb-2" style={{ gap: "var(--s-1)" }}>
          {TYPES.map((ty) => (
            <button
              key={ty}
              type="button"
              className={`option-card${form.type === ty ? " selected" : ""}`}
              style={{ marginBottom: 0 }}
              onClick={() => set("type", ty)}
            >
              <span className="radio-dot" aria-hidden="true" />
              <span className="text-small">{t(`log.types.${ty}`)}</span>
            </button>
          ))}
        </div>

        <label className="form-label">{t("log.mode")}</label>
        <p className="form-hint">{t("log.modeHint")}</p>
        <div className="flex gap-1 mb-2">
          {["hours", "wages"].map((mo) => (
            <button
              key={mo}
              type="button"
              className={`btn btn-sm ${form.mode === mo ? "btn-primary" : "btn-outline"}`}
              onClick={() => set("mode", mo)}
              aria-pressed={form.mode === mo}
            >
              {t(`log.modes.${mo}`)}
            </button>
          ))}
        </div>

        <div className="grid-2">
          <div>
            <label className="form-label" htmlFor="log-date">{t("log.date")}</label>
            <input id="log-date" type="date" className="form-input mb-2" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div>
            {form.mode === "hours" ? (
              <>
                <label className="form-label" htmlFor="log-hours">{t("log.hours")}</label>
                <input id="log-hours" className="form-input mb-2" inputMode="decimal" value={form.hours} onChange={(e) => set("hours", e.target.value)} />
              </>
            ) : (
              <>
                <label className="form-label" htmlFor="log-amount">{t("log.amount")}</label>
                <input id="log-amount" className="form-input mb-2" inputMode="decimal" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
              </>
            )}
          </div>
        </div>

        <label className="form-label" htmlFor="log-desc">{t("log.desc")}</label>
        <p className="form-hint">{t("log.descHint")}</p>
        <input id="log-desc" className="form-input mb-2" value={form.description} onChange={(e) => set("description", e.target.value)} />

        <label className="form-label" htmlFor="log-doc">{t("log.doc")}</label>
        <p className="form-hint">{t("log.docHint")}</p>
        <input
          id="log-doc"
          type="file"
          className="form-input mb-2"
          onChange={(e) => set("docName", e.target.files?.[0]?.name || "")}
        />

        {err && <p className="form-error mb-1">{err}</p>}
        <button className="btn btn-primary btn-block" type="submit">{t("log.save")}</button>
      </form>
      <p className="text-small text-muted mt-2">{t("log.footnote")}</p>
    </div>
  );
}
