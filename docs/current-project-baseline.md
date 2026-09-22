# CareerBridge: Current Project Baseline

**Repository:** `NouneHuozha/MCA_project-careerBridge-`

**Inspected branch:** `feature/admin-import-review`

**Latest branch commit:** `b5f3995 docs: add CareerBridge continuation handoff`

**Baseline date:** 22 September 2026

## Executive summary

CareerBridge is a substantial Next.js career and higher-education guidance platform for students, initially focused on Nagaland and designed to expand across Northeast India. It follows the product principle **“Guide, don’t decide.”** The application already contains the main student journey, a database-backed domain model, explainable recommendations, an AI Mentor with retrieval and safety guardrails, student planning features, catalogue pages, and an administrator-controlled Excel import/review workflow.

This is not a blank starter project. The current branch is an advanced prototype/early product implementation. The most important next work is verification, data trustworthiness, security hardening, and targeted feature completion rather than rebuilding the application foundation.

## Repository and branch state

The public repository’s default `main` branch is behind the documented work. `main` points to commit `30f4c1b` (`saving`). The handoff-referenced branch exists publicly and was checked out locally as `feature/admin-import-review`. Its latest commit is `b5f3995`, following the documented catalogue-validation commit `4d13cc2`.

The feature branch adds the admin import/review workflow, catalogue metadata preservation, staging migration, validation scripts, and project documentation. The local working tree is clean.

## Technology stack

The application uses:

- Next.js `16.2.6` App Router
- React `19.2.6`
- TypeScript `5.9.3`
- Tailwind CSS `4.1.17`
- PostgreSQL with `pg`
- Drizzle ORM and Drizzle Kit
- SheetJS `xlsx` for workbook parsing
- Playwright for end-to-end tests
- Optional OpenAI, Anthropic, and Google AI providers
- Optional Clerk authentication and Google Maps integration

## Implemented product areas

| Area | Current implementation |
|---|---|
| Entry and onboarding | Landing page, stage selection, sign-in, sign-up, about, and how-it-works pages |
| Counselling | Stage-aware Class 10/Class 12 guided questionnaire with validation, persistence, resume support, and anonymous journey cookies |
| Profile | Student snapshot containing academic, interest, strength, goal, value, work-style, location, budget, scholarship, institution, hostel, and notes information |
| Recommendations | Explainable rule-based field and pathway ordering with reasons, cautions, and practical constraints; no visible prediction percentages |
| Exploration | Fields, careers, pathways, courses, institutions, exams, scholarships, opportunities, search, filters, detail pages, and related-content navigation |
| Planning | Saved items, comparisons, dashboard, action plans, and next-step prompts |
| AI Mentor | Provider abstraction, retrieval context, citations, persistence, retrieval-only fallback, uncertainty messaging, and restrictions against inventing fees, dates, eligibility, or institutions |
| Database | Broad PostgreSQL/Drizzle schema for users, sessions, profiles, counselling, catalogue, sources, recommendations, mentor conversations, imports, audit events, and feedback |
| Authentication | Local first-party secure-session fallback, with configuration path for Clerk |
| Maps | Schematic/keyless fallback and optional Google Maps configuration |
| Admin imports | Excel upload, raw import preservation, row-level staging, normalization, warnings/errors, protected review UI, bulk actions, transactional approval, stable-key upserts, resync support, and audit events |

## Admin catalogue workflow

The feature branch supports three workbook types:

- Institutions: stable key `code`
- Entrance examinations: stable key `slug`
- Scholarships: stable key `slug`

The intended flow is:

> Workbook upload → raw import record → parsed and normalized rows → admin review → approved canonical records → student catalogue and Mentor retrieval

Uploaded workbook content is stored in PostgreSQL staging records rather than committed to the repository. Approval preserves provenance, verification state, source URLs, and timestamps. This is an appropriate foundation for a trustworthy catalogue because unreviewed workbook rows do not directly overwrite canonical student-facing data.

The documented supplied dataset contains 423 institutions, 79 examinations, and 66 scholarships. Those counts still require confirmation against the user’s local PostgreSQL database.

## Validation performed in this sandbox

The following checks passed on `feature/admin-import-review`:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

The production build compiled successfully and generated the expected application routes, including `/admin`, `/admin/imports/[id]`, `/institutions`, `/exams`, and `/scholarships`.

The catalogue validator did not complete because the source Excel workbooks are not included in Git and are unavailable in this sandbox. It expected:

`/home/ubuntu/Careerbridge-data/Careerbridge(data)/Nagaland.xlsx`

The validator therefore failed with `FileNotFoundError`; this is an input/environment problem, not a discovered catalogue-data failure. The repository’s checked-in validation report documents the previous successful workbook validation.

`npm ci` reported 8 dependency audit findings: 4 moderate, 3 high, and 1 critical. These should be triaged deliberately; an automatic force upgrade should not be applied without checking compatibility.

## Important known gaps

1. **PostgreSQL has not been verified in this sandbox.** The local database counts, pending migrations, seed state, and admin role must be checked in the user’s environment.
2. **The source workbooks are external to Git.** The catalogue validator needs the workbook directory or an equivalent configurable input path.
3. **Catalogue freshness is limited.** Source URLs establish provenance, not current validity. Exam dates, application windows, fees, seat availability, and scholarship deadlines are volatile.
4. **Scholarship geography needs stronger modeling.** Central, Northeast-wide, Nagaland-specific, and other-state applicability should become structured relationships rather than relying mainly on text.
5. **Institution course data is still partly free text.** A controlled course mapping and review queue would improve accuracy.
6. **RAG is suitable for development but not yet production vector search.** It currently uses deterministic hashed embeddings and JSONB retrieval.
7. **Security requires a focused review.** Every admin operation and every user-owned resource should be checked for authorization, with rate limiting and careful logging added where appropriate.
8. **Browser smoke testing remains outstanding.** The principal student routes and admin review flow should be tested against a real configured database at desktop and mobile widths.

## Recommended next sequence

Before adding major new functionality, verify the local database migration and catalogue counts, then smoke-test the admin and student catalogue routes. After that, prioritize whichever direction the next product brief requires. For data trust, the strongest next phase is geographic applicability, freshness labels, controlled course mappings, and retrieval of only approved, verification-aware catalogue records with citations.

## Key files

- `src/db/schema.ts` — database schema
- `src/services/catalog.ts` — catalogue read boundary
- `src/admin/importer.ts` — workbook parsing and normalization
- `src/admin/approval.ts` — transactional canonical upsert logic
- `src/components/admin-import-uploader.tsx` — upload UI
- `src/components/admin-import-review.tsx` — review and bulk-action UI
- `src/app/admin/page.tsx` — admin dashboard
- `src/app/api/admin/imports/route.ts` — import list/create API
- `src/app/api/admin/imports/[id]/route.ts` — review and approval API
- `src/recommendation/engine.ts` — explainable recommendation engine
- `src/services/mentor.ts` — Mentor orchestration and guardrails
- `src/rag/index.ts` — retrieval implementation
- `scripts/validate-catalog-data.py` — workbook/UI validator
- `docs/catalog-validation-report.md` — documented catalogue validation
- `docs/careerbridge-handoff.md` — continuation handoff
