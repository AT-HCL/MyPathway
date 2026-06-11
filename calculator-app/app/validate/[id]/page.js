"use client";

// Simulated validator view — what the third party sees when they open
// the magic link. No account required. They see the specific activity,
// enter name/title/organization, and attest (digital signature) or
// decline with a reason.

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { getValidations, updateValidation, getActivities, updateActivity, getUser } from "@/lib/store";

export default function ValidatorPage() {
  const { t } = useI18n();
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", title: "", org: "", reason: "", docName: "" });
  const [done, setDone] = useState(null);
  const [err, setErr] = useState("");

  const v = getValidations().find((x) => x.id === id);
  const activity = v && getActivities().find((a) => a.id === v.activityId);
  const member = getUser();

  if (!v || !activity) {
    return (
      <div className="container mt-4" style={{ maxWidth: 520 }}>
        <div className="alert alert-danger">{t("validator.notFound")}</div>
      </div>
    );
  }

  const set = (k, val) => setForm((f) => ({ ...f, [k]: val }));
  const fmt = (n) => `$${Number(n).toFixed(2)}`;

  const respond = (status) => {
    if (!form.name.trim() || !form.org.trim()) { setErr(t("validator.errRequired")); return; }
    if (status === "declined" && !form.reason.trim()) { setErr(t("validator.errReason")); return; }
    setErr("");
    const patch = {
      status,
      validatorName: form.name.trim(),
      validatorTitle: form.title.trim(),
      validatorOrg: form.org.trim(),
      reason: form.reason.trim(),
      validatorDocName: form.docName,
      respondedAt: new Date().toISOString(),
    };
    updateValidation(v.id, patch);
    updateActivity(activity.id, { validation: { status, ...patch } });
    setDone(status);
  };

  if (done) {
    return (
      <div className="container mt-4" style={{ maxWidth: 520 }}>
        <div className={`alert ${done === "validated" ? "alert-success" : "alert-warning"}`} style={{ textAlign: "center", padding: "var(--s-4)" }}>
          <h3>{done === "validated" ? t("validator.thanksValidated") : t("validator.thanksDeclined")}</h3>
          <p className="mt-1">{t("validator.recorded")}</p>
        </div>
        <button className="btn btn-outline" onClick={() => router.push("/dashboard")}>{t("validator.backToDemo")}</button>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 560 }}>
      <div className="alert alert-info text-small">{t("validator.demoBanner")}</div>
      <h3 className="mb-2">{t("validator.title")}</h3>
      <p className="text-small text-muted mb-3">{t("validator.sub", { member: member?.name || "" })}</p>

      <div className="card mb-3" style={{ background: "var(--gray-50)" }}>
        <table className="table">
          <tbody>
            <tr><td className="text-muted">{t("log.type")}</td><td>{t(`log.types.${activity.type}`)}</td></tr>
            <tr><td className="text-muted">{t("log.date")}</td><td>{activity.date}</td></tr>
            <tr>
              <td className="text-muted">{t("log.reported")}</td>
              <td>{activity.mode === "hours" ? t("results.hrs", { n: activity.hours }) : fmt(activity.amount)}</td>
            </tr>
            {activity.description && <tr><td className="text-muted">{t("log.desc")}</td><td>{activity.description}</td></tr>}
            {activity.docName && <tr><td className="text-muted">{t("log.doc")}</td><td>📎 {activity.docName}</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card">
        <label className="form-label" htmlFor="v-name">{t("validator.name")}</label>
        <input id="v-name" className="form-input mb-2" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <label className="form-label" htmlFor="v-title">{t("validator.vtitle")}</label>
        <input id="v-title" className="form-input mb-2" value={form.title} onChange={(e) => set("title", e.target.value)} />
        <label className="form-label" htmlFor="v-org">{t("validator.org")}</label>
        <input id="v-org" className="form-input mb-2" value={form.org} onChange={(e) => set("org", e.target.value)} />
        <label className="form-label" htmlFor="v-doc">{t("validator.doc")}</label>
        <input id="v-doc" type="file" className="form-input mb-2" onChange={(e) => set("docName", e.target.files?.[0]?.name || "")} />
        <label className="form-label" htmlFor="v-reason">{t("validator.reason")}</label>
        <p className="form-hint">{t("validator.reasonHint")}</p>
        <input id="v-reason" className="form-input mb-2" value={form.reason} onChange={(e) => set("reason", e.target.value)} />

        {err && <p className="form-error mb-1">{err}</p>}
        <div className="flex gap-1 flex-wrap">
          <button className="btn btn-success" onClick={() => respond("validated")}>{t("validator.attest")}</button>
          <button className="btn btn-outline" onClick={() => respond("declined")}>{t("validator.decline")}</button>
        </div>
        <p className="text-small text-muted mt-2">{t("validator.signatureNote")}</p>
      </div>
    </div>
  );
}
