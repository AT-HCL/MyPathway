"use client";

// How this tool works: a human-readable version of the rules engine
// (lib/rules.js), tracing each policy requirement to the mechanics of
// the site. Working document for discussion purposes; not intended to
// be permanently housed on the tool. English only by design.

import { useI18n } from "@/lib/i18n";

const UPDATED = "June 11, 2026";

function Section({ id, title, children }) {
  return (
    <section id={id} className="mb-4">
      <h3 style={{ fontSize: "1.4rem", marginBottom: "var(--s-2)" }}>{title}</h3>
      {children}
    </section>
  );
}

function Formula({ children }) {
  return (
    <div
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.88rem",
        background: "var(--gray-50)",
        border: "1px solid var(--gray-200)",
        borderRadius: "var(--radius-2)",
        padding: "0.6rem 0.9rem",
        margin: "0.5rem 0 1rem",
        overflowX: "auto",
      }}
    >
      {children}
    </div>
  );
}

export default function HowItWorksPage() {
  const { lang } = useI18n();

  return (
    <div className="container mt-4" style={{ maxWidth: 820 }}>
      {lang === "es" && (
        <div className="alert alert-info">
          Este documento de trabajo está disponible solo en inglés por ahora. Es un documento
          técnico para fines de discusión sobre cómo funciona la herramienta.
        </div>
      )}

      <p className="text-small text-muted mb-1">Working document for discussion purposes. Last updated {UPDATED}.</p>
      <h2 className="mb-2">How this tool works</h2>
      <p className="mb-3">
        This page explains, in plain terms, how the policy requirements for CalFresh and Medi-Cal
        community engagement are translated into the mechanics of this site: what each question
        collects, how every number is calculated, and how reported activity is checked against the
        rules. It is the human-readable version of the calculation engine that runs the tool. If
        you want to know exactly how the calculator turns answers and logged activity into the
        guidance a user sees, this is how.
      </p>

      <div className="alert alert-warning text-small">
        This tool assists people who are likely subject to community engagement requirements. It
        does not decide whether the requirements apply to anyone, and it does not make any official
        decision about benefits. Counties and the State of California do that, and users are
        reminded of this on every result screen. All figures the tool produces are estimates.
      </div>

      {/* Table of contents */}
      <div className="card mb-4 text-small">
        <strong>Contents</strong>
        <ol style={{ paddingLeft: "1.3rem", marginTop: "0.5rem", lineHeight: 2 }}>
          <li><a href="#sources">Policy sources</a></li>
          <li><a href="#questions">What each question collects, and why</a></li>
          <li><a href="#medical">The Medi-Cal monthly test</a></li>
          <li><a href="#calfresh">The CalFresh monthly test</a></li>
          <li><a href="#dashboard">How the dashboard tracker works</a></li>
          <li><a href="#validation">How validation works</a></li>
          <li><a href="#data">How data is handled in the prototype</a></li>
          <li><a href="#open">Known limitations and open policy questions</a></li>
        </ol>
      </div>

      <Section id="sources" title="1. Policy sources">
        <p className="mb-2">
          The Medi-Cal rules implemented here come from CMS-2454-IFC, the federal Interim Final
          Rule published June 3, 2026, which adds sections 435.550 through 435.563 to title 42 of
          the Code of Federal Regulations. The CalFresh rules come from the able-bodied adult
          work rules as modified by H.R.1, including the $217.50 weekly earnings standard, the
          workfare hour calculation, and the county waiver list maintained by CDSS. The question
          set and the CalFresh-specific data (waived counties, local minimum wages by zip code)
          were developed with Aurrera Health Group. Where the federal rule allows more than one
          reading, the choice this tool makes is flagged in section 8.
        </p>
      </Section>

      <Section id="questions" title="2. What each question collects, and why">
        <table className="table text-small mb-2">
          <thead>
            <tr><th>Question</th><th>What it collects</th><th>Where it is used</th></tr>
          </thead>
          <tbody>
            <tr><td>Who is filling this out</td><td>Participant vs. professional</td><td>Display only; no effect on math</td></tr>
            <tr><td>County notice received</td><td>Yes / no / not sure</td><td>Context only. Many people never need to meet these rules; the county decides. No effect on math</td></tr>
            <tr><td>Which benefits</td><td>CalFresh, Medi-Cal, or both</td><td>Selects which of the two tests (sections 3 and 4) run</td></tr>
            <tr><td>Job, weekly hours, hourly pay</td><td>Work hours and wage</td><td>Hours feed both tests; pay feeds the income standards in both tests</td></tr>
            <tr><td>Seasonal work + 6-month earnings</td><td>Seasonal status, total pay over 6 months</td><td>Medi-Cal seasonal averaging (section 3, pathway 7)</td></tr>
            <tr><td>School and enrollment status</td><td>Half-time or more; credit hours; or weekly hours</td><td>Medi-Cal education pathway and hour conversion (section 3); hours count toward CalFresh total</td></tr>
            <tr><td>Volunteering + organization type</td><td>Weekly volunteer hours, whether the organization is nonprofit, government, or faith-based</td><td>Hours count only when the organization qualifies, since the rule requires a structured program that can confirm hours</td></tr>
            <tr><td>Zip code</td><td>5-digit zip</td><td>CalFresh county waiver lookup, local minimum wage for workfare, county resources</td></tr>
            <tr><td>Workfare + monthly benefit</td><td>Workfare participation, monthly CalFresh amount</td><td>Workfare hour requirement (section 4)</td></tr>
          </tbody>
        </table>
        <p className="text-small text-muted">
          Weekly figures are converted to monthly using 4.33 weeks per month throughout.
        </p>
      </Section>

      <Section id="medical" title="3. The Medi-Cal monthly test">
        <p className="mb-2">
          The federal rule gives seven independent ways to demonstrate community engagement for a
          month. The tool checks them in this order and stops at the first one that is satisfied:
        </p>
        <ol style={{ paddingLeft: "1.3rem", lineHeight: 1.9, marginBottom: "1rem" }}>
          <li>
            <strong>Education, at least half-time.</strong> If the person reports enrollment at
            least half-time (as defined by their school), the month is satisfied outright, with no
            hour counting. Source: 435.552(a)(4).
          </li>
          <li>
            <strong>Income of $580 or more in the month.</strong> The $580 standard is the federal
            minimum wage of $7.25 times 80 hours, set by 435.552(a)(6) and (f). The federal wage
            applies even though California's minimum wage is higher; the rule does not permit
            state wages here.
          </li>
          <li>
            <strong>Seasonal worker averaging.</strong> If the work is seasonal, the tool averages
            the reported income over the preceding 6 months. An average of $580 or more satisfies
            the month. Source: 435.552(a)(7) and (g).
            <Formula>average = (total income over 6 months) / 6; satisfied if average &gt;= 580</Formula>
          </li>
          <li>
            <strong>Hours, alone or in combination.</strong> Otherwise the tool adds up monthly
            hours across work, community service, work programs, and education, and compares the
            total to 80. Source: 435.552(a)(1) through (a)(5) and (e).
            <Formula>
              work + community service + work program + education hours + income-as-hours &gt;= 80
            </Formula>
            Three conversions feed this total:
            <ul style={{ paddingLeft: "1.2rem", lineHeight: 1.8, marginTop: "0.5rem" }}>
              <li>
                Weekly hours become monthly hours at 4.33 weeks per month.
              </li>
              <li>
                Less-than-half-time education in credit-hour programs converts at credit hours x 3
                x 4.33 (the Carnegie Unit convention in 435.552(d)): 4 credits is 51.96 hours per
                month. Non-credit programs count actual participation hours.
              </li>
              <li>
                Income below $580 converts to hours at the federal minimum wage, rounded down
                (435.552(e)(2), a state option): $380 of income is credited as 52 hours, leaving
                28 hours to cover by activity.
              </li>
            </ul>
          </li>
        </ol>
        <p className="mb-2">
          When the month falls short, the gap is reported both ways, because hours and income are
          interchangeable at the federal conversion rate:
        </p>
        <Formula>
          gap hours = roundup(80 - total); gap income = gap hours x 7.25
        </Formula>
        <p className="text-small text-muted">
          The engine reproduces the worked examples in the federal rule's preamble: 4 credit hours
          plus 30 hours of work totals 81.96 hours (compliant), and $650 of monthly income
          satisfies the month on income alone.
        </p>
      </Section>

      <Section id="calfresh" title="4. The CalFresh monthly test">
        <p className="mb-2">Three checks, applied in this order:</p>
        <ol style={{ paddingLeft: "1.3rem", lineHeight: 1.9 }}>
          <li>
            <strong>County waiver.</strong> If the zip code maps to one of the seven waived
            counties (Alpine, Colusa, Imperial, Merced, Monterey, Plumas, Tulare), the tool shows
            that the work rules likely do not apply there through October 31, 2026, and points to
            CDSS for current status.
          </li>
          <li>
            <strong>Workfare.</strong> If the person is in workfare, their required hours are
            their monthly benefit divided by the applicable minimum wage, rounded down. The tool
            looks up the local minimum wage from the zip code (40 California localities with
            wages above the state floor of $16.90 are loaded); everywhere else uses the state
            wage.
            <Formula>required hours = floor(monthly CalFresh benefit / local minimum wage)</Formula>
          </li>
          <li>
            <strong>Standard rule.</strong> Otherwise the month is satisfied by 80 hours of
            qualifying activity (about 20 hours per week) or weekly earnings of at least $217.50
            (the federal minimum wage times 30 hours).
          </li>
        </ol>
        <p className="text-small text-muted">
          School and volunteer hours count toward the CalFresh total the same way work hours do,
          matching the combined-hours approach in the question set this tool inherited.
        </p>
      </Section>

      <Section id="dashboard" title="5. How the dashboard tracker works">
        <p className="mb-2">
          After account creation, the My Pathway tracker evaluates each calendar month from logged
          entries. Every entry is either hours (work, volunteering, education, work program) or
          wages (dollars). The tracker combines them with the same federal conversion used in
          section 3, but the user never sees the conversion; they see plain-language guidance
          like "you need 30 more hours or $218 more in reported income."
        </p>
        <Formula>
          combined = hours + (income / 7.25); month satisfied if income &gt;= 580 or combined &gt;= 80
        </Formula>
        <p className="mb-2">
          The progress bar shows combined hours against 80. For seasonal workers, the tracker also
          maintains the rolling 6-month income average from logged wage entries. At the start of
          each month, a dismissable prompt asks whether anything changed, and the personalized
          plan allocates any remaining hours across activities that fit the person's
          transportation, caregiving, schedule, and interest constraints.
        </p>
        <p className="text-small text-muted">
          Reports (CSV and print) show each entry, its validation status, monthly totals, the
          combined hour equivalent, and the seasonal average where applicable, so a caseworker can
          re-derive every number.
        </p>
      </Section>

      <Section id="validation" title="6. How validation works">
        <p className="mb-2">
          Any logged entry can be sent to a third party who can vouch for it: a supervisor,
          volunteer coordinator, or instructor. The validator receives a secure link, sees only
          that one entry, and either confirms it (recording their name, title, and organization as
          a digital signature) or declines with a reason. Statuses move through not submitted,
          pending, validated, declined, or expired. Reminders go out on day 3 and day 7; links
          expire at day 14. Validator identity, response, and timestamps are stored with the entry
          as an auditable record. This anticipates the federal rule's documentation expectations,
          which tighten on January 1, 2028, when documentation must be required wherever it is
          reasonably available.
        </p>
      </Section>

      <Section id="data" title="7. How data is handled in the prototype">
        <p className="mb-2">
          In this prototype, everything a user enters stays in their own browser on their own
          device. There is no server database, no analytics, and no transmission of answers or
          activity data anywhere. Documents are recorded by filename only; file contents are not
          uploaded. The production build will replace this with a secured database, real email and
          text delivery for the secure links, and the privacy and security controls described in
          the platform's technical plan.
        </p>
      </Section>

      <Section id="open" title="8. Known limitations and open policy questions">
        <ol style={{ paddingLeft: "1.3rem", lineHeight: 1.9 }}>
          <li>
            <strong>Whose income counts.</strong> The federal rule measures household income under
            the Medi-Cal income methodology, not just the individual's pay. The tool currently
            uses the pay the person reports for themselves, which is conservative for multi-person
            households (it may understate income that could satisfy the month).
          </li>
          <li>
            <strong>Seasonal averaging method.</strong> The tool uses the strict 6-month lookback
            average. If California elects the "reasonably predictable changes" methodology, the
            rule instead prorates predictable seasonal income across the year, which produces
            different results for some workers. Pending confirmation from the state.
          </li>
          <li>
            <strong>Which months must be shown.</strong> States choose how many months to review
            at application (1 to 3 consecutive) and during each eligibility period at renewal (1
            or more). The tool evaluates every month independently and does not yet model
            California's specific elections, which are pending.
          </li>
          <li>
            <strong>Income-to-hours conversion is a state option.</strong> Crediting hours for
            income below $580 (section 3, pathway 4) is permitted but not required. The tool
            applies it because it favors the user; if California declines the option, the
            estimate would be removed.
          </li>
          <li>
            <strong>Work program hours.</strong> The federal rule does not fully specify how hours
            inside work programs are counted, beyond limiting supervised job search to less than
            half of program hours. The tool counts reported program hours one-for-one.
          </li>
          <li>
            <strong>CalFresh data currency.</strong> The waiver list and local minimum wages are
            point-in-time data and need a maintenance process before production.
          </li>
        </ol>
      </Section>

      <p className="text-small text-muted mt-4">
        This is not an official tool endorsed or supported by the State of California in any way.
        It is provided for informational purposes only.
      </p>
    </div>
  );
}
