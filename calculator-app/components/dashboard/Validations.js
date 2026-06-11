"use client";

// Validation workflow. Every entry carries a status: not submitted,
// pending, validated, declined, expired. Members request third-party
// validation by entering the validator's email or phone; the system
// sends a magic link (simulated here with a direct link to the
// validator view). Reminders at day 3 and 7; links expire at day 14.

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { getActivities, updateActivity, addValidation, getValidations, updateValidation } from "@/lib/store";
import { ValidationBadge } from "@/components/dashboard/Overview";

const DAY = 24 * 60 * 60 * 1000;

export function validationAge(v) {
  return Math.floor((Date.now() - new Date(v.requestedAt).getTime()) / DAY);
}

export default function Validations({ user, onChanged }) {
  const { t } = useI18n();
  const [requesting, setRequesting] = useState(null); // activity id
  const [contact, setContact] = useState("");
  const [err, setErr] = useState("");
  const [tick, setTick] = useState(0);

  const activities = getActivities();
  const validations = getValidations();

  // Expire pending validations older than 14 days.
  validations.forEach((v) => {
    if (v.status === "pending" && validationAge(v) >= 14) {
      updateValidation(v.id, { status: "expired" });
      updateActivity(v.activityId, { validation: { status: "expired" } });
    }
  });

  const request = (e) => {
    e.preventDefault();
    if (!contact.trim()) { setErr(t("auth.errEmpty")); return; }
    setErr("");
    addValidation({
      activityId: requesting,
      validatorContact: contact.trim(),
      status: "pending",
      requestedAt: new Date().toISOString(),
    });
    updateActivity(requesting, { validation: { status: "pending", validatorContact: contact.trim() } });
    setRequesting(null);
    setContact("");
    setTick(tick + 1);
    onChanged();
  };

  const fmt = (n) => `$${Number(n).toFixed(2)}`;

  return (
    <div>
      <h4 className="mb-1">{t("validation.title")}</h4>
      <p className="text-small text-muted mb-3">{t("validation.sub")}</p>

      {activities.length === 0 && <p className="text-small text-muted">{t("dash.noEntries")}</p>}

      {activities.map((a) => {
        const v = validations.find((x) => x.activityId === a.id && x.status !== "expired") ||
                  validations.find((x) => x.activityId === a.id);
        const age = v && v.status === "pending" ? validationAge(v) : null;
        return (
          <div key={a.id} className="card mb-2">
            <div className="flex justify-between items-center gap-2 flex-wrap">
              <div>
                <strong>{t(`log.types.${a.type}`)}</strong>{" "}
                <span className="text-small text-muted">
                  {a.date} · {a.mode === "hours" ? t("results.hrs", { n: a.hours }) : fmt(a.amount)}
                  {a.description ? ` · ${a.description}` : ""}
                  {a.docName ? ` · 📎 ${a.docName}` : ""}
                </span>
              </div>
              <ValidationBadge status={a.validation?.status || "not_submitted"} />
            </div>

            {v && v.status === "pending" && (
              <div className="alert alert-warning text-small mt-2" style={{ marginBottom: 0 }}>
                {t("validation.pendingInfo", { contact: v.validatorContact, days: age })}
                {age >= 3 && age < 7 && ` ${t("validation.reminder3")}`}
                {age >= 7 && ` ${t("validation.reminder7")}`}
                <div className="mt-1">
                  <Link href={`/validate/${v.id}`} className="btn btn-sm btn-outline">
                    {t("validation.demoOpenValidator")}
                  </Link>
                </div>
              </div>
            )}

            {v && v.status === "validated" && (
              <p className="text-small mt-1" style={{ color: "var(--success-700)" }}>
                {t("validation.validatedBy", { name: v.validatorName, title: v.validatorTitle, org: v.validatorOrg })}
              </p>
            )}
            {v && v.status === "declined" && (
              <p className="text-small mt-1" style={{ color: "var(--danger-700)" }}>
                {t("validation.declinedReason", { reason: v.reason || "—" })}
              </p>
            )}

            {(!a.validation || ["not_submitted", "declined", "expired"].includes(a.validation.status)) && (
              <div className="mt-2 no-print">
                {requesting === a.id ? (
                  <form onSubmit={request} className="flex gap-1 flex-wrap items-center">
                    <input
                      className="form-input"
                      style={{ maxWidth: 280 }}
                      placeholder={t("validation.contactPlaceholder")}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      aria-label={t("validation.contactPlaceholder")}
                    />
                    <button className="btn btn-sm btn-primary" type="submit">{t("validation.send")}</button>
                    <button className="btn btn-sm btn-outline" type="button" onClick={() => setRequesting(null)}>{t("validation.cancel")}</button>
                    {err && <p className="form-error">{err}</p>}
                  </form>
                ) : (
                  <button className="btn btn-sm btn-outline" onClick={() => { setRequesting(a.id); setContact(""); }}>
                    {t("validation.requestCta")}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      <p className="text-small text-muted mt-3">{t("validation.lifecycleNote")}</p>
    </div>
  );
}
