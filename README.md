# MyPathway

MyBenefitsPathway: a modular compliance platform that helps Californians subject to HR1 community engagement requirements generate, track, and report qualifying hours and income to maintain their Medi-Cal and CalFresh benefits.

Built by The Health CoLab in partnership with California's seven-county implementation pilot (Alameda, Humboldt, Los Angeles, Mariposa, Riverside, Sacramento, and San Diego), designed for statewide adoption.

## Repository structure

| Folder | Module | Status |
|---|---|---|
| `calculator-app/` | Module 1: The Calculator, the core compliance tracking platform | Prototype |

Future modules (Job Ready California LMS, Front Door integration, closed-loop referrals, chatbot, county system integration) will be added as sibling folders.

## Branches

- `main`: production. Vercel deploys from this branch.
- `dev`: working branch. Vercel creates preview deployments automatically.

Feature work happens on branches off `dev`, merged via PR. Merges from `dev` to `main` are deliberate production releases.

## Deploying (Vercel)

1. Import this repo at vercel.com/new.
2. Set **Root Directory** to `calculator-app`. Framework auto-detects as Next.js.
3. Production branch: `main`. Pushes to `dev` get preview URLs automatically.

See `calculator-app/README.md` for full details on the prototype, the rules engine, and language compliance requirements.
