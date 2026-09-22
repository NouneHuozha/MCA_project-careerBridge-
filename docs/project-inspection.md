# CareerBridge Project Inspection

**Repository:** `NouneHuozha/MCA_project-careerBridge-`
**Branch inspected:** `main`
**Inspection date:** 22 September 2026

## Executive conclusion

CareerBridge is already a substantial Next.js application that implements the central product idea from the supplied brief: it guides students through exploration instead of predicting a single career. The current checkout is not an empty foundation. It contains the landing experience, stage selection, persisted counselling, profile summaries, field and career exploration, pathways, courses, institutions, comparisons, saved items, action plans, scholarships, entrance examinations, opportunities, an AI mentor, a retrieval layer, and a rule-based guidance engine.

The code is organized into a maintainable separation between App Router pages, reusable components, service modules, data seeds, database schema, authentication, artificial-intelligence providers, retrieval, maps, and recommendation logic. The most important remaining work is not to rebuild the application. It is to make the current implementation production-safe: repair the type-check configuration and untyped JSX module, establish a real database and migration workflow, replace or clearly isolate sample catalogue data, verify source freshness, harden authorization and data ownership, and add the missing operational workflows for importing and maintaining authoritative data.

The primary student experience currently follows this path:

> Landing page → stage selection → eight-question counselling flow → profile summary → suggested fields → field/career/pathway/course/institution exploration → saved items and action plan → mentor support.

That flow is implemented across both the UI and server-side services. The product principle, “Guide, don’t decide,” is also reflected in the recommendation copy and mentor guardrails.

## Product intent and how the implementation reflects it

The supplied specification defines CareerBridge as a Nagaland-focused career and education guidance platform for Class 10 and Class 12 students. It explicitly rejects deterministic career prediction, unsupported percentages, fabricated admissions information, and an overbearing chatbot interface. The implementation follows those constraints in several important places.

The landing page uses the message “Your path is yours. We help you understand it.” It presents three product pillars: understanding oneself, exploring possibilities, and planning the next step. The counselling UI uses a conversational mentor area alongside structured progress and reassures students that there is no right answer and that answers can be changed later.

The recommendation module is explicitly named the **Career Exploration & Guidance Engine**. It returns areas worth exploring, not predicted careers. It stores reasons by factor, including interests, academic preferences, strengths, goals, values, and practical preferences. It also generates cautions and “what if” alternatives. The UI therefore has the foundations for explainability and honest comparison rather than a black-box score.

The mentor system has a strong system prompt. It prohibits percentages, guarantees, unsupported eligibility claims, invented institutions, invented fees, and invented deadlines. When there is no verified retrieval context, the fallback says that there is not enough verified information to answer confidently and directs the student to an official source.

## Current architecture

### Frontend and routing

The application uses Next.js 16 with the App Router, React 19, TypeScript, and Tailwind CSS. Most pages are server components that load data through services. Interactive experiences are isolated into client components such as the counselling experience, mentor chat, save controls, tabs, maps, and animated guidance elements.

The current routes include:

| Area | Routes or capabilities |
|---|---|
| Entry and identity | `/`, `/start`, `/sign-in`, `/sign-up`, `/about`, `/how-it-works` |
| Counselling and profile | `/counselling`, `/profile`, `/dashboard` |
| Exploration | `/explore`, `/explore/[slug]`, `/careers/[slug]`, `/pathways`, `/pathways/[slug]` |
| Education catalogue | `/courses`, `/courses/[slug]`, `/institutions`, `/institutions/[code]`, `/exams`, `/scholarships`, `/opportunities` |
| Planning and persistence | `/action-plan`, `/saved`, `/compare` |
| Mentor and administration | `/mentor`, `/admin` |
| API | Authentication, profile, counselling, catalogue, institutions, mentor, recommendations, saved items, action plans, search, and health endpoints |

The landing page calls `getFields()` to render a selection of fields from the catalogue. The page is intentionally dynamic so that catalogue data can come from PostgreSQL when available and fall back to bundled seeds when it is not.

### Persistence and database

The database adapter uses PostgreSQL through `pg` and Drizzle ORM. `DATABASE_URL` is required at module load time. The schema is broad enough for a real product and includes users, sessions, student profiles, academic profiles, counselling sessions and responses, interests, strengths, goals, preferences, fields, careers, skills, pathways, courses, institutions, source records, admission information, entrance exams, scholarships, opportunities, saved items, comparisons, action plans, mentor conversations, recommendations, knowledge documents, knowledge chunks, data imports, audit events, and feedback flags.

Geography is designed as a self-referencing `regions` hierarchy with country, state, district, and city levels. The initial seed is Nagaland-only, while the schema can support more states later. Externally sourced catalogue facts have fields such as `source_url`, `retrieved_at`, and `verification_status`, which is the right foundation for freshness indicators.

The seed process is idempotent and guarded by a PostgreSQL advisory lock. It loads the reference catalogue and RAG corpus but intentionally does not delete student-generated profile, counselling, saved-item, or mentor data. Catalogue reads first attempt database access and then fall back to bundled TypeScript seeds if the database is unavailable.

This fallback is useful for local development, but it also means the application can appear healthy while operating without PostgreSQL. Production readiness will require explicit environment health reporting and a clear distinction between a database-backed deployment and a demo-mode deployment.

### Counselling and profile flow

`/start` allows the student to choose Class 10 or Class 12 and a stage detail such as studying, completed, or awaiting results. A server action creates or resumes a counselling session and redirects to `/counselling`.

The counselling client communicates with `/api/counselling`. Questions are stage-aware and stored as structured responses with a question key, question text, answer type, selected values, and optional free text. The server validates question keys, stage compatibility, option values, selection limits, and text lengths before saving. The session can be resumed anonymously through an HTTP-only `cb_journey` cookie or associated with a signed-in account.

`buildSnapshot()` converts the response rows into a `StudentSnapshot`. The snapshot contains stage, subjects, performance, interests, strengths, goals, values, work style, location preference, district, budget, scholarship need, institution preference, hostel requirement, notes, answered keys, and completion percentage. On completion, the snapshot is persisted into normalized profile tables as well as a JSON summary.

This is one of the strongest parts of the existing system. It is progressive, editable, structured, privacy-conscious, and already supports the “not sure yet” state required by the brief.

### Catalogue and discovery

`src/services/catalog.ts` is the main catalogue boundary. It exposes typed functions for fields, careers, career skills, pathways, courses, institutions, institution-course links, sources, admission information, exams, scholarships, opportunities, districts, and cross-catalogue search.

Institution discovery supports query text, district, institution type, ownership, study level, field, course, and hostel filters. Search uses tolerant matching based on substrings, token overlap, and small edit distance. This meets the brief’s request for reasonable spelling tolerance without requiring an external search service.

The data currently comes from bundled seed files in `src/data/fields.ts`, `src/data/learning.ts`, and `src/data/institutions.ts`. The admin page explicitly labels the institution catalogue as a sample dataset. The seed notes also state that institution names and locations require verification and that no fees, dates, or seat counts are included. This honesty is good, but it means the catalogue must not yet be treated as a production authoritative source.

### Recommendation engine

`src/recommendation/engine.ts` calculates an internal relevance ordering from tag overlap. The visible output is a `FieldSuggestion` containing a field, a headline, factor-specific reasons, cautions, and overlap details. The relevance number is internal and is not presented as a probability or match percentage.

The engine applies practical adjustments for staying within Nagaland, low budget, difficult subjects, outdoor work, people-oriented work, and long or geographically constrained routes. It also suggests pathways using stage, field, budget, location, stream, and top field signals.

The design is appropriately rule-based for Version 1. Before expanding it, the main need is to test its behavior with representative student profiles and check for hidden bias, especially where practical constraints reduce relevance. The product should always show the reasons and cautions alongside any ordering effect.

### Mentor and retrieval

The mentor endpoint retrieves up to five relevant chunks, builds a context block, and calls the configured provider through an `AIProvider` interface. The available implementations are OpenAI, Anthropic, and Google. Provider selection can be pinned with `AI_PROVIDER`, or the first configured provider is selected.

The retrieval layer is described as a RAG pipeline, but the current implementation is deliberately self-contained. It uses a 256-dimensional deterministic hashing embedding, stores vectors as JSONB in PostgreSQL, preloads up to 4,000 chunks, combines cosine similarity with keyword and title hits, and returns citations. This is a practical development implementation, not yet a production-grade vector search architecture. It provides a clean abstraction for replacing the local embedding provider with hosted embeddings and PostgreSQL vector search later.

When no AI key is configured, the mentor falls back to retrieval-only prose. When retrieval returns no chunks, the mentor gives a safe uncertainty response. Mentor conversations and messages can be persisted for signed-in users or anonymous journeys.

### Authentication and privacy

The authentication module is an abstraction. It is designed to use Clerk when both Clerk environment variables exist, but the current file contains a local first-party provider using PostgreSQL, scrypt password hashes, and HTTP-only cookies. The checked-in code therefore supports local sign-up and sign-in even though the brief names Clerk as the intended production provider.

Anonymous counselling uses a random cookie key. Signing out removes both the authentication cookie and the anonymous journey cookie so a shared device does not expose the previous student’s journey. Account-owned data remains in PostgreSQL and is restored on a later sign-in.

The counselling flow avoids exact addresses and does not require sensitive financial details. This is aligned with the minor-focused privacy requirements. The next security review should verify authorization on every user-owned endpoint, ensure that anonymous session ownership cannot be guessed or transferred, add rate limits to sign-in and mentor endpoints, and confirm that sensitive data is not included in logs.

## What is implemented versus what remains incomplete

| Requirement area | Current state | Interpretation |
|---|---|---|
| Product foundation and design system | Implemented | Strong visual foundation, responsive components, shared UI primitives, and accessible interaction patterns exist. |
| Authentication | Implemented with abstraction | Local auth works as a fallback; Clerk integration is represented by configuration detection but needs production verification. |
| Stage selection and counselling | Implemented | The core eight-question guided flow is persisted, editable, resumable, and validated. |
| Profile summary | Implemented | Snapshot and normalized profile persistence exist, with field suggestions. |
| Field, career, and pathway exploration | Implemented | Detail pages, tabs, related content, “why not,” and “what if” foundations exist. |
| Courses and institutions | Implemented with bundled seed data | Discovery and details exist, but the catalogue is explicitly sample data and needs authoritative imports and verification. |
| Search and filters | Implemented | Search and institution filters are available through service and API boundaries. |
| Maps | Partially implemented | There is a map service and schematic/keyless fallback. Full Google Maps behavior is optional and requires a configured key. |
| AI mentor | Implemented | Provider abstraction, guardrails, persistence, retrieval fallback, and citations exist. |
| RAG | Development implementation | Local hashed embeddings and JSONB retrieval work without external services; production vector infrastructure is still future work. |
| Scholarships, exams, opportunities, action plans | Implemented as catalogue features | The UI and seed structures exist, but current data must be verified before being presented as current. |
| Dashboard and saved progress | Implemented | Saved items, comparisons, action checklist, and dashboard routes exist. |
| Admin and data management | Early scaffold | An admin view and data-import schema exist, but there is no complete protected import, review, verification, or audit workflow. |
| Testing | Meaningful end-to-end coverage exists | Playwright covers major UX flows, but the suite requires a working database and running app. Unit and service-level coverage is limited. |
| Deployment readiness | Not yet verified | The app needs environment setup, migration commands, production auth configuration, database health checks, and a successful clean build. |

## Validation results from this checkout

The locked dependencies install successfully with `npm ci`. ESLint passes with no reported errors.

The normal TypeScript command currently fails before checking application code because `tsconfig.json` contains `"ignoreDeprecations": "6.0"`, while the installed TypeScript version is 5.9.3. Retrying with a compatible command-line override reaches a real code error: `src/app/about/page.tsx` imports `src/app/about/values-explorer.jsx`, which has no TypeScript declaration and is treated as an implicit `any` module.

The Next.js production build compiles the application successfully but fails during its TypeScript phase on the same untyped JSX import. Therefore, the first technical repair should be small and focused: make the TypeScript configuration compatible with the lockfile and convert or type the `values-explorer` module. No product rewrite is justified by the current validation results.

`npm ci` reports seven dependency audit findings: four moderate, two high, and one critical. These should be triaged separately from the application work. An automatic force upgrade should not be applied blindly because it may introduce breaking changes into the Next.js and TypeScript toolchain.

The repository has no uncommitted changes at the time of inspection. The latest commit removes `.codeatlas` files from version control; the preceding commits contain the application update rather than a large feature branch split.

## Recommended implementation sequence

### First: make the baseline reproducible

Repair the TypeScript configuration and the untyped JSX import. Add or verify the database migration workflow, a documented local `.env` setup, and a health-check procedure. Then run the production build again. This creates a trustworthy baseline before any product changes.

### Second: establish data truth

Separate development sample content from verified production content at the data model and UI levels. Add an import format for the master institution dataset, including source URL, retrieved date, verification status, district, coordinates, and official links. Add a review state so administrators can approve records before they appear as current guidance. Current admission dates, fees, scholarships, and opportunities should be sourced only from official portals or clearly marked as unavailable.

### Third: harden identity and ownership

Verify that the Clerk adapter is actually implemented or complete it behind the existing auth abstraction. Review every profile, saved-item, mentor, action-plan, and recommendation endpoint for user ownership checks. Add rate limiting, secure cookie settings for deployment, and audit logging for administrative data changes.

### Fourth: test the core journey at service level

Add unit tests for `buildSnapshot`, question progression, recommendation reasons, practical cautions, pathway ordering, search tolerance, and retrieval ranking. Keep the existing Playwright tests for the end-to-end experience, but make database setup and teardown deterministic so the suite can run in CI.

### Fifth: improve factual retrieval and catalogue operations

Once the data pipeline is reliable, replace the development hashing retrieval with a real embedding provider and vector index if scale requires it. Preserve the existing `EmbeddingProvider` interface. Add source-aware filters so time-sensitive answers prefer recently verified official material, and make citations visible in every relevant mentor response and detail page.

### Sixth: refine product behavior rather than adding breadth

The current feature surface is already broad. The next product work should improve the quality of the main journey: better profile explanations, stronger comparisons, more complete alternative routes, clearer unavailable-data states, and a focused dashboard next step. Avoid adding more catalogue categories until the existing Nagaland data is verified and maintainable.

## Files that matter most for future work

| Concern | Primary files |
|---|---|
| Landing and shared layout | `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/components/ui.tsx` |
| Counselling | `src/app/start/page.tsx`, `src/app/counselling/page.tsx`, `src/components/counselling-experience.tsx`, `src/data/counselling.ts`, `src/services/profile.ts`, `src/app/api/counselling/route.ts` |
| Catalogue | `src/services/catalog.ts`, `src/data/fields.ts`, `src/data/learning.ts`, `src/data/institutions.ts`, `src/db/seed.ts` |
| Guidance logic | `src/recommendation/engine.ts`, `src/app/api/recommendations/route.ts` |
| Mentor and RAG | `src/ai/index.ts`, `src/services/mentor.ts`, `src/rag/index.ts`, `src/rag/corpus.ts`, `src/app/api/mentor/route.ts` |
| Database | `src/db/schema.ts`, `src/db/index.ts`, `drizzle.config.json` |
| Authentication | `src/auth/index.ts`, `src/app/api/auth/[action]/route.ts`, `src/app/api/auth/sign-out/route.ts` |
| Persistence features | `src/services/student.ts`, `src/app/api/saved/route.ts`, `src/app/api/action-plan/route.ts` |
| Automated UX coverage | `tests/ux.spec.ts`, `tests/progress.spec.ts`, `playwright.config.ts` |

## Bottom line

The repository already expresses the intended product architecture and much of the intended student journey. It should be treated as a working prototype or early product build with a good foundation, not as a project that needs to be generated from scratch. The correct next step is to repair the baseline build, verify the database and authentication setup, and then choose one concrete improvement to the existing journey. For trustworthy real-world use, data verification and administrative maintenance are more urgent than adding another user-facing feature.

## References

[1]: https://github.com/NouneHuozha/MCA_project-careerBridge- "CareerBridge GitHub repository"
[2]: https://github.com/NouneHuozha/MCA_project-careerBridge-/blob/main/src/db/schema.ts "CareerBridge database schema"
[3]: https://github.com/NouneHuozha/MCA_project-careerBridge-/blob/main/src/recommendation/engine.ts "Career Exploration & Guidance Engine"
[4]: https://github.com/NouneHuozha/MCA_project-careerBridge-/blob/main/src/services/mentor.ts "CareerBridge mentor service"
[5]: https://github.com/NouneHuozha/MCA_project-careerBridge-/blob/main/tests/ux.spec.ts "CareerBridge Playwright UX tests"
[6]: https://github.com/NouneHuozha/MCA_project-careerBridge-/blob/main/.env.example "CareerBridge environment configuration example"
