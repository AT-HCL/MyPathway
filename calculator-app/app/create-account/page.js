"use client";

// Account creation: minimal fields up front (name, email/phone, county,
// programs, zip), per the Module 1 spec. Additional profile fields are
// collected later via the profile completion prompt on the dashboard.
// Carries question-flow answers into the new account when present.

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { saveUser, getFlowAnswers } from "@/lib/store";
import { CA_COUNTIES } from "@/lib/counties";
import { getWaivedCounty } from "@/lib/aurrera-data";

// The question flow stores a single program value ("calfresh", "medical",
// or "both"); the account stores an array of individual programs. Expand
// "both" so the two never mix (bug #5).
function programsFromFlow(program) {
  if (program === "both") return ["calfresh", "medical"];
  if (program === "calfresh" || program === "medical") return [program];
  return [];
}

function CreateAccountForm() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const flow = typeof window !== "undefined" ? getFlowAnswers() : null;

  const [form, setForm] = useState({
    name: "",
    contact: params.get("contact") || "",
    county: "",
    zip: flow?.zipCode || "",
    programs: programsFromFlow(flow?.program),
  });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleProgram = (p) => {
    set("programs", form.programs.includes(p) ? form.programs.filter((x) => x !== p) : [...form.programs, p]);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim() || !form.county || form.programs.length === 0) {
      setErr(t("auth.errRequired"));
      return;
    }
    setErr("");
    setSent(true);
  };

  const completeLink = () => {
    const zipCounty = getWaivedCounty(form.zip);
    saveUser({
      name: form.name.trim(),
      contact: form.contact.trim(),
      county: form.county,
      zip: form.zip.trim(),
      programs: ["calfresh", "medical"].filter((p) => form.programs.includes(p)),
      zipWaivedCounty: zipCounty,
      createdAt: new Date().toISOString(),
      profileComplete: false,
      flowAnswers: flow || null,
    });
    window.dispatchEvent(new Event("mpw-user-change"));
    router.push("/dashboard");
  };

  if (sent) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "var(--s-4)" }}>
        <div style={{ fontSize: "2.5rem" }} aria-hidden="true">📬</div>
        <h3 className="mb-2">{t("auth.checkTitle")}</h3>
        <p className="text-small text-muted mb-3">{t("auth.checkBody", { contact: form.contact })}</p>
        <div className="alert alert-warning text-small" style={{ textAlign: "left" }}>{t("auth.demoNote")}</div>
        <button className="btn btn-success btn-block" onClick={completeLink}>{t("auth.demoOpenLink")}</button>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-2">{t("auth.createTitle")}</h2>
      <p className="text-small text-muted mb-3">{t("auth.createSub")}</p>
      {flow && <div className="alert alert-success text-small">{t("auth.flowCarryover")}</div>}
      <form onSubmit={submit} className="card">
        <label className="form-label" htmlFor="name">{t("auth.nameLabel")}</label>
        <input id="name" className="form-input mb-2" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />

        <label className="form-label" htmlFor="contact2">{t("auth.contactLabel")}</label>
        <input id="contact2" className="form-input mb-2" value={form.contact} onChange={(e) => set("contact", e.target.value)} placeholder={t("auth.contactPlaceholder")} />

        <label className="form-label" htmlFor="county">{t("auth.countyLabel")}</label>
        <select id="county" className="form-select mb-2" value={form.county} onChange={(e) => set("county", e.target.value)}>
          <option value="">{t("auth.countySelect")}</option>
          {CA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className="form-label" htmlFor="zip">{t("auth.zipLabel")}</label>
        <input id="zip" className="form-input mb-2" style={{ maxWidth: 160 }} inputMode="numeric" maxLength={5} value={form.zip} onChange={(e) => set("zip", e.target.value)} />

        <fieldset className="mb-2">
          <legend style={{ fontSize: "1rem" }}>{t("auth.programsLabel")}</legend>
          {["calfresh", "medical"].map((p) => (
            <label key={p} className="flex items-center gap-1 text-small" style={{ cursor: "pointer", marginBottom: "0.3rem" }}>
              <input type="checkbox" checked={form.programs.includes(p)} onChange={() => toggleProgram(p)} style={{ width: "1.1rem", height: "1.1rem" }} />
              {t(`auth.programs.${p}`)}
            </label>
          ))}
        </fieldset>

        {err && <p className="form-error mb-1">{err}</p>}
        <button className="btn btn-primary btn-block" type="submit">{t("auth.createCta")}</button>
        <p className="text-small text-muted mt-2">{t("auth.noPassword")}</p>
      </form>
    </>
  );
}

export default function CreateAccountPage() {
  return (
    <div className="container mt-4" style={{ maxWidth: 520 }}>
      <Suspense fallback={null}>
        <CreateAccountForm />
      </Suspense>
    </div>
  );
}
