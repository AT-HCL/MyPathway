# MyBenefitsPathway — Calculator Prototype (Module 1)

A working prototype of the Calculator, the core compliance tracking platform from the HR1 Module Approach Document. Next.js app, Vercel-ready, English/Spanish, styled on the California Design System (Public Sans, CA Design System color tokens, mobile-first, WCAG 2.1 AA patterns).

**Access gate:** username `prototype`, password `prototype` (per the Module 1 spec).

## What's included

- **Landing page** with the three entry points: guided question flow, magic-link login, and direct account creation, plus the "I got a letter from my county" section with official CDSS/DHCS/BenefitsCal links.
- **Question flow** ported from the Aurrera Participation Calculator (questions, branching, zip-based county waiver and local minimum wage lookups, workfare math), upgraded to CMS-2454-IFC rules for education (at-least-half-time enrollment satisfies the month; less-than-half-time credit programs convert at credits x 3 x 4.33) and seasonal worker 6-month income averaging.
- **Simulated magic-link auth**: no passwords; a demo button stands in for tapping the emailed link. Social sign-in buttons are visual placeholders.
- **My Pathway dashboard**: unified hours + income monthly tracker (the $7.25/hour federal conversion happens behind the scenes; members see plain-language guidance), activity logging by type and reporting mode, document attachment, seasonal averaging, start-of-month update prompt, profile completion prompt.
- **Validation workflow**: request third-party confirmation per entry; statuses not submitted / pending / validated / declined / expired; day 3 and 7 reminders and day 14 expiry; a simulated validator view (no account needed).
- **Personalized plan**: short circumstances survey generating a rule-based activity mix to reach 80 hours.
- **Reports**: CSV download and print-to-PDF view with entries, validation statuses, monthly totals, combined hour equivalents, and the seasonal average.
- **County resources**: tailored entries for the seven pilot counties plus statewide resources.

## Rules engine

`lib/rules.js` is framework-free and encodes both programs:

- **Medi-Cal (CMS-2454-IFC, 42 CFR 435.550-563):** the seven monthly pathways, including the $580 income test (federal minimum wage x 80), combination rules, the income-to-hours conversion option (income / $7.25), and seasonal 6-month averaging. Verified against the IFR preamble's worked examples.
- **CalFresh:** 80 hours/month or $217.50/week earnings, workfare hours = monthly benefit / applicable local minimum wage, and the county waiver list (through October 31, 2026), all from the Aurrera prototype data.

This module is the seed for the Module 6 policy engine configuration.

## Prototype boundaries

- All data is member-entered and stored in the browser (localStorage). No backend, no real email/SMS. The data layer (`lib/store.js`) is shaped to swap to API routes + PostgreSQL later.
- Documents are recorded by filename only; no file contents are uploaded or stored.
- The flow estimates participation; it does not decide whether requirements apply to anyone. Counties make all official decisions, and every result says so.

## Language compliance

No use of "screener," "screening," or "eligibility determination" anywhere (code, comments, or copy). All results use hedged language, remind users about official State of California notices, and carry the standard disclaimer. No em dashes in user-facing text.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

## Deploy to Vercel

1. Push this folder to a repo on the At-HCL GitHub account (or drag-and-drop the folder at vercel.com/new).
2. Vercel auto-detects Next.js; no configuration needed.
3. Every push to the production branch deploys automatically.

## i18n

All user-facing strings live in `locales/en.json` and `locales/es.json` (350 keys each). To add a language: copy `en.json`, translate, and register it in `lib/i18n.js` (`DICTS`).
