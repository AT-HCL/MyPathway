"use client";

// Guided question flow -> participation estimate.
// Questions and logic from the Aurrera prototype; education and seasonal
// handling per CMS-2454-IFC. One question per screen, back stack,
// progress within visible questions only.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { visibleSteps } from "@/lib/flow-config";
import { saveFlowAnswers } from "@/lib/store";
import FlowResults from "@/components/FlowResults";

export default function FlowPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [history, setHistory] = useState([]);
  const [numVal, setNumVal] = useState("");
  const [showResults, setShowResults] = useState(false);

  const steps = useMemo(() => visibleSteps(answers), [answers]);
  const step = steps[idx];
  const pct = showResults ? 100 : Math.round((idx / steps.length) * 100);

  const advance = (nextAnswers) => {
    const nextSteps = visibleSteps(nextAnswers);
    const curKey = step.key;
    const curPos = nextSteps.findIndex((s) => s.key === curKey);
    setHistory((h) => [...h, { idx, answers }]);
    if (curPos + 1 < nextSteps.length) {
      setIdx(curPos + 1);
      setNumVal(nextAnswers[nextSteps[curPos + 1].key] ?? "");
    } else {
      saveFlowAnswers(nextAnswers);
      setShowResults(true);
    }
  };

  const pick = (value) => {
    const next = { ...answers, [step.key]: value };
    setAnswers(next);
    advance(next);
  };

  const submitNumber = (e) => {
    e.preventDefault();
    const raw = String(numVal).trim();
    if (raw === "" || isNaN(Number(raw)) || Number(raw) < 0) return;
    const next = { ...answers, [step.key]: raw };
    setAnswers(next);
    advance(next);
  };

  const goBack = () => {
    if (showResults) {
      setShowResults(false);
      return;
    }
    const prev = history[history.length - 1];
    if (!prev) {
      router.push("/");
      return;
    }
    setHistory((h) => h.slice(0, -1));
    setAnswers(prev.answers);
    setIdx(prev.idx);
    const prevStep = visibleSteps(prev.answers)[prev.idx];
    setNumVal(prev.answers[prevStep?.key] ?? "");
  };

  if (showResults) {
    return (
      <div className="container mt-4">
        <FlowResults answers={answers} onBack={goBack} />
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 640 }}>
      <div className="flex items-center justify-between mb-1 no-print">
        <span className="text-small text-muted">{t(step.sectionKey)}</span>
        <span className="text-small text-muted">
          {t("flow.progress", { current: idx + 1, total: steps.length })}
        </span>
      </div>
      <div className="progress-track mb-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: "var(--primary-700)" }} />
      </div>

      {step.introKey && <div className="alert alert-info">{t(step.introKey)}</div>}

      <fieldset>
        <legend>{t(`flow.${step.key}.q`)}</legend>
        <p className="form-hint mb-2">{t(`flow.${step.key}.hint`)}</p>

        {step.type === "single" && (
          <div role="radiogroup" aria-label={t(`flow.${step.key}.q`)}>
            {step.options.map((opt) => (
              <button
                key={opt}
                role="radio"
                aria-checked={answers[step.key] === opt}
                className={`option-card${answers[step.key] === opt ? " selected" : ""}`}
                onClick={() => pick(opt)}
              >
                <span className="radio-dot" aria-hidden="true" />
                <span>{t(`flow.${step.key}.opts.${opt}`)}</span>
              </button>
            ))}
          </div>
        )}

        {(step.type === "number" || step.type === "zip") && (
          <form onSubmit={step.type === "zip" ? (e) => { e.preventDefault(); if (/^\d{5}$/.test(String(numVal).trim())) pick(String(numVal).trim()); } : submitNumber}>
            <div className="flex items-center gap-1">
              {step.prefix && <span style={{ fontWeight: 700, fontSize: "1.2rem" }}>{step.prefix}</span>}
              <input
                className="form-input"
                style={{ maxWidth: 220 }}
                inputMode="numeric"
                aria-label={t(`flow.${step.key}.q`)}
                value={numVal}
                onChange={(e) => setNumVal(e.target.value)}
                autoFocus
              />
              {step.unitKey && <span className="text-small text-muted">{t(step.unitKey)}</span>}
            </div>
            <button className="btn btn-primary mt-2" type="submit">
              {t("flow.next")}
            </button>
          </form>
        )}
      </fieldset>

      <div className="mt-4 no-print">
        <button className="btn btn-outline btn-sm" onClick={goBack}>
          ← {t("flow.back")}
        </button>
      </div>

      <p className="text-small text-muted mt-4">{t("common.estimateOnly")}</p>
    </div>
  );
}
