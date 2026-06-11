"use client";

// Prototype data layer. Everything persists in the browser via localStorage,
// shaped so the same calls can later be backed by API routes + PostgreSQL.
// Keys:
//   mpw_user        — the signed-in user profile
//   mpw_activities  — array of activity/income entries
//   mpw_validations — array of validation requests
//   mpw_plan        — personalized plan survey answers + generated plan
//   mpw_flow        — last question-flow answers (so account creation can carry them over)
//   mpw_monthly_prompt_<YYYY-MM> — dismissed flag for start-of-month survey prompt

const isBrowser = () => typeof window !== "undefined";

function read(key, fallback) {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (!isBrowser()) return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* ---- User ---- */
export const getUser = () => read("mpw_user", null);
export const saveUser = (user) => write("mpw_user", user);
export function signOut() {
  if (!isBrowser()) return;
  window.localStorage.removeItem("mpw_user");
}

/* ---- Flow answers ---- */
export const getFlowAnswers = () => read("mpw_flow", null);
export const saveFlowAnswers = (a) => write("mpw_flow", a);

/* ---- Activities ----
   Entry: { id, type: work|community_service|education|work_program,
            mode: hours|wages, hours, amount, date (YYYY-MM-DD), month (YYYY-MM),
            description, docName, validation: { status, validator, requestedAt, ... } } */
export const getActivities = () => read("mpw_activities", []);
export const saveActivities = (list) => write("mpw_activities", list);
export function addActivity(entry) {
  const list = getActivities();
  list.unshift({ ...entry, id: uid() });
  saveActivities(list);
  return list;
}
export function updateActivity(id, patch) {
  const list = getActivities().map((a) => (a.id === id ? { ...a, ...patch } : a));
  saveActivities(list);
  return list;
}
export function deleteActivity(id) {
  const list = getActivities().filter((a) => a.id !== id);
  saveActivities(list);
  return list;
}

/* ---- Validations ----
   { id, activityId, validatorContact, validatorName, validatorTitle, validatorOrg,
     status: pending|validated|declined|expired, requestedAt, respondedAt, reason } */
export const getValidations = () => read("mpw_validations", []);
export const saveValidations = (list) => write("mpw_validations", list);
export function addValidation(v) {
  const list = getValidations();
  list.unshift({ ...v, id: uid() });
  saveValidations(list);
  return list;
}
export function updateValidation(id, patch) {
  const list = getValidations().map((v) => (v.id === id ? { ...v, ...patch } : v));
  saveValidations(list);
  return list;
}

/* ---- Personalized plan ---- */
export const getPlan = () => read("mpw_plan", null);
export const savePlan = (p) => write("mpw_plan", p);

/* ---- Monthly prompt ---- */
export const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
export const isMonthlyPromptDismissed = () => read(`mpw_monthly_prompt_${monthKey()}`, false);
export const dismissMonthlyPrompt = () => write(`mpw_monthly_prompt_${monthKey()}`, true);

/* ---- Demo reset ---- */
export function resetAll() {
  if (!isBrowser()) return;
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith("mpw_") && k !== "mpw_lang" && k !== "mpw_gate")
    .forEach((k) => window.localStorage.removeItem(k));
}
