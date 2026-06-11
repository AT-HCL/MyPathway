// Question flow configuration.
// Questions and branching ported from the Aurrera Participation Calculator
// prototype, with two upgrades to match CMS-2454-IFC:
//   - education uses enrollment status (at-least-half-time satisfies the
//     month outright; less-than-half-time credit programs convert at
//     credits x 3 x 4.33)
//   - seasonal workers can use 6-month income averaging (Medi-Cal)
// All display strings live in /locales via the keys below.

const isCF = (a) => a.program === "calfresh" || a.program === "both";
const isMC = (a) => a.program === "medical" || a.program === "both";

export const FLOW_STEPS = [
  {
    key: "userType",
    type: "single",
    sectionKey: "flow.sections.welcome",
    options: ["participant", "professional"],
    introKey: "flow.userType.intro",
  },
  {
    key: "gotNotice",
    type: "single",
    sectionKey: "flow.sections.before",
    options: ["yes", "no", "notsure"],
    introKey: "flow.gotNotice.intro",
  },
  {
    key: "program",
    type: "single",
    sectionKey: "flow.sections.benefits",
    options: ["calfresh", "medical", "both"],
    introKey: "flow.program.intro",
  },
  {
    key: "hasJob",
    type: "single",
    sectionKey: "flow.sections.work",
    options: ["yes", "no", "notsure"],
    introKey: "flow.hasJob.intro",
  },
  {
    key: "workHrs",
    type: "number",
    sectionKey: "flow.sections.work",
    unitKey: "flow.units.hoursPerWeek",
    showIf: (a) => a.hasJob === "yes",
  },
  {
    key: "hourlyPay",
    type: "number",
    prefix: "$",
    sectionKey: "flow.sections.work",
    unitKey: "flow.units.dollarsPerHour",
    showIf: (a) => a.hasJob === "yes",
  },
  {
    key: "isSeasonal",
    type: "single",
    sectionKey: "flow.sections.work",
    options: ["yes", "no"],
    introKey: "flow.isSeasonal.intro",
    showIf: (a) => a.hasJob === "yes" && isMC(a),
  },
  {
    key: "seasonal6moTotal",
    type: "number",
    prefix: "$",
    sectionKey: "flow.sections.work",
    unitKey: "flow.units.dollarsTotal",
    showIf: (a) => a.hasJob === "yes" && isMC(a) && a.isSeasonal === "yes",
  },
  {
    key: "inSchool",
    type: "single",
    sectionKey: "flow.sections.school",
    options: ["yes", "no"],
    introKey: "flow.inSchool.intro",
  },
  {
    key: "schoolEnrollment",
    type: "single",
    sectionKey: "flow.sections.school",
    options: ["half_time_plus", "less_credit", "less_noncredit", "notsure"],
    showIf: (a) => a.inSchool === "yes",
  },
  {
    key: "schoolCredits",
    type: "number",
    sectionKey: "flow.sections.school",
    unitKey: "flow.units.creditHours",
    showIf: (a) => a.inSchool === "yes" && a.schoolEnrollment === "less_credit",
  },
  {
    key: "schoolHrs",
    type: "number",
    sectionKey: "flow.sections.school",
    unitKey: "flow.units.hoursPerWeek",
    showIf: (a) =>
      a.inSchool === "yes" &&
      (a.schoolEnrollment === "less_noncredit" || a.schoolEnrollment === "notsure"),
  },
  {
    key: "volunteers",
    type: "single",
    sectionKey: "flow.sections.volunteer",
    options: ["yes", "no"],
    introKey: "flow.volunteers.intro",
  },
  {
    key: "volQualifies",
    type: "single",
    sectionKey: "flow.sections.volunteer",
    options: ["yes", "no", "notsure"],
    showIf: (a) => a.volunteers === "yes",
  },
  {
    key: "volHrs",
    type: "number",
    sectionKey: "flow.sections.volunteer",
    unitKey: "flow.units.hoursPerWeek",
    showIf: (a) => a.volunteers === "yes" && a.volQualifies !== "no",
  },
  {
    key: "zipCode",
    type: "zip",
    sectionKey: "flow.sections.zip",
    introKey: "flow.zipCode.intro",
  },
  {
    key: "workfare",
    type: "single",
    sectionKey: "flow.sections.workfare",
    options: ["yes", "no", "notsure"],
    introKey: "flow.workfare.intro",
    showIf: (a) => isCF(a),
  },
  {
    key: "workfareBenefit",
    type: "number",
    prefix: "$",
    sectionKey: "flow.sections.workfare",
    unitKey: "flow.units.dollarsPerMonth",
    showIf: (a) => isCF(a) && a.workfare === "yes",
  },
];

export function visibleSteps(answers) {
  return FLOW_STEPS.filter((s) => !s.showIf || s.showIf(answers));
}
