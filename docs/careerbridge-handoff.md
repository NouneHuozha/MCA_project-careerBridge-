# CareerBridge Continuation Handoff

**Prepared for:** another AI agent or developer continuing the project  
**Project:** CareerBridge  
**Repository:** `NouneHuozha/MCA_project-careerBridge-`  
**Current branch:** `feature/admin-import-review`  
**Latest verified commit:** `4d13cc2 feat: validate catalogue data against UI`  
**Status date:** 22 September 2026

## 1. What CareerBridge is

CareerBridge is an AI-assisted career and education guidance platform for students in Northeast India. The first regional implementation is Nagaland. The product is intended primarily for Class 9–12 students and students after Class 12, especially those who have limited access to reliable career counsellors or higher-education information.

The product promise is **“Guide, don’t decide.”** CareerBridge must help students understand options, compare pathways, and decide their next steps. It must not claim to predict a student’s future, produce deterministic career outcomes, display unsupported match percentages, or make decisions on behalf of a student.

The platform should answer questions such as:

- What subjects, interests, strengths, and values matter to me?
- Which career fields and routes could I explore?
- What should I study next?
- Which courses and institutions offer relevant opportunities?
- Which entrance examinations and eligibility rules apply?
- Which scholarships may be relevant?
- What practical next step should I take?

The long-term geographic scope is the entire Northeast region: Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura. The current product experience and imported institution catalogue begin with Nagaland, but the database and records should remain state-aware so the other states can be added without redesigning the system.

## 2. Current technology stack

The application is a Next.js 16.2.6 App Router project using React 19, TypeScript, Tailwind CSS, PostgreSQL, Drizzle ORM, and the `xlsx` package for workbook parsing. It contains server-rendered pages, client components for interactive flows, API route handlers, a database-backed catalogue service, an authentication abstraction, a rule-based recommendation engine, and a retrieval-augmented AI Mentor.

The main runtime commands are:

```text
npm run dev       Start the development server
npm run build     Create the production build
npm run start     Start the production server
npm run lint      Run ESLint
npm run typecheck Run TypeScript without emitting files
```

The project does not currently contain a root `README.md`; this handoff is the main continuation reference. The environment template is `.env.example`.

## 3. Product architecture already present

### 3.1 Student experience

The main journey is:

```text
Landing page
  → stage selection
  → guided counselling questionnaire
  → profile summary
  → suggested fields
  → career, pathway, course, and institution exploration
  → saved items and action plan
  → AI Mentor support
```

The counselling flow is stage-aware for Class 10 and Class 12. Responses are validated and persisted. The student can resume an anonymous journey through an HTTP-only cookie or continue with an account. The profile snapshot includes stage, subjects, performance band, interests, strengths, goals, values, work style, location preference, district, budget, scholarship need, institution preference, hostel requirement, notes, answered keys, and completion percentage.

### 3.2 Recommendation engine

`src/recommendation/engine.ts` contains the current rule-based guidance engine. It uses tag overlap and practical constraints to order fields and pathways. The visible result is a `FieldSuggestion` with reasons, cautions, and overlap explanations. Any internal relevance value must remain internal; do not expose it as a probability or match percentage.

The engine can account for factors such as interests, academic preferences, strengths, goals, values, budget, location, difficult subjects, outdoor work, people-oriented work, and geographically constrained routes. Future changes should preserve reason transparency and test for unintended bias.

### 3.3 AI Mentor and retrieval

The relevant modules are:

- `src/ai/index.ts` — provider abstraction and configured provider selection.
- `src/services/mentor.ts` — mentor orchestration and safe response behavior.
- The retrieval implementation is part of the existing service layer and uses PostgreSQL-backed knowledge chunks.

The available AI providers are OpenAI, Anthropic, and Google. `AI_PROVIDER` can pin a provider. Without an AI key, the Mentor falls back to retrieval-only responses. If no verified retrieval context exists, it should explain that it cannot answer confidently and direct the student to an official source.

The current local retrieval implementation uses deterministic hashed embeddings stored as JSONB, combined with keyword and title matching. It is suitable for development and a self-contained prototype. It is not yet a production vector-search architecture. A future phase may replace it with hosted embeddings and PostgreSQL vector search, but the current abstraction should be preserved.

The Mentor must not invent fees, dates, eligibility, institutions, application windows, or scholarship facts. It should cite or link to the verified source records used in an answer and show uncertainty where the source is incomplete or stale.

## 4. Database and data ownership

PostgreSQL is the system of record for the catalogue and user data. Catalogue data must not be hardcoded into VS Code as the source of truth. Bundled TypeScript seed data remains useful as a development fallback, but student-facing production data should come from PostgreSQL and should be visibly distinguishable from demo mode if the database is unavailable.

The schema is defined in `src/db/schema.ts`. It includes users, sessions, student profiles, academic profiles, counselling sessions and responses, interests, strengths, goals, preferences, career fields, careers, skills, pathways, courses, institutions, source records, admission data, entrance exams, scholarships, opportunities, saved items, comparisons, action plans, mentor conversations, recommendations, knowledge documents, knowledge chunks, imports, import rows, audit events, and feedback flags.

Geography uses a self-referencing `regions` hierarchy with country, state, district, and city levels. The initial seed is Nagaland. Future records should carry explicit geography or geographic scope instead of relying only on free-text descriptions.

The database environment is configured through:

```env
DATABASE_URL=postgresql://user:password@host:5432/careerbridge
```

The user's local database has been described as:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/careerbridge
```

The local database is outside this sandbox, so it was not directly queried during the final automated validation. A local count check remains necessary.

## 5. Excel import and admin workflow

The current import pipeline is implemented and pushed to the feature branch. Its purpose is to protect the canonical catalogue from unreviewed workbook data.

The intended data flow is:

```text
Excel workbook
  → raw import record in data_imports
  → parsed rows in data_import_rows
  → normalization and warnings/errors
  → protected admin review
  → accepted rows
  → canonical PostgreSQL tables
  → student-facing catalogue and Mentor retrieval
```

### 5.1 Where uploaded workbooks are stored

When an administrator uploads a workbook, the original file content is stored in PostgreSQL in `data_imports.file_content_base64`. The import record also stores dataset type, original filename, source hash, counts, status, review time, and notes.

The parsed row-level records are stored in `data_import_rows`. Each row retains the sheet name, row number, raw JSON data, normalized JSON data, warnings, errors, and review status. This provides an audit trail and allows the workbook to be reviewed without placing the workbook in source code or GitHub.

After approval, normalized records are written to the canonical tables:

| Dataset | Canonical table | Stable key |
|---|---|---|
| Institutions | `institutions` | `code` |
| Entrance examinations | `entrance_exams` | `slug` |
| Scholarships | `scholarships` | `slug` |

GitHub contains the application code and migrations. It does not contain the uploaded workbook contents or PostgreSQL records.

### 5.2 Relevant implementation files

- `src/admin/importer.ts` parses and normalizes workbooks.
- `src/admin/approval.ts` performs transactional approval and upsert into canonical tables.
- `src/components/admin-import-uploader.tsx` provides the upload interface.
- `src/components/admin-import-review.tsx` provides search, status filtering, pagination, row review, and bulk actions.
- `src/app/admin/page.tsx` is the protected admin import dashboard.
- `src/app/admin/imports/[id]/page.tsx` is the import detail and review page.
- `src/app/api/admin/imports/route.ts` handles import creation/listing.
- `src/app/api/admin/imports/[id]/route.ts` handles import detail, row actions, and approval actions.
- `drizzle/0001_admin_import_staging.sql` adds staging columns, staging rows, metadata columns, and text-width changes.

### 5.3 Supported workbook types and required fields

The importer recognizes three dataset types:

```text
institutions
exams
scholarships
```

Required headers are:

- Institutions: `institution code`, `name`, `type`, `district`, `entry stage`, `source url`.
- Exams: `exam_slug`, `name`, `level_stage`, `official_website`, `source_url`.
- Scholarships: `scholarship_slug`, `name`, `eligibility`, `official_url`, `source_url`.

Expected primary sheets are `Master Census`, `All Exams`, and `Master`. If the expected sheet is missing, the importer previews the first sheet and records a warning.

The importer normalizes district spellings, normalizes class-stage values such as `class_10` and `class_12`, detects discontinued exam rows, preserves warning/error states, splits semicolon-delimited arrays, and validates required fields. Approval extracts the first valid HTTP or HTTPS URL when a source field contains descriptive text followed by a URL.

Approval is transactional. Accepted rows are inserted or updated using stable keys. Institutions use code conflict handling, exams use slug conflict handling, and scholarships use slug conflict handling. The approval logic preserves source URLs, verification statuses, and last-verified timestamps. It also records an audit event.

The `resync` option allows already-imported or accepted rows to be re-applied when needed. A rejected batch cannot be approved, and an imported batch with no remaining review rows cannot be approved again unless resync is explicitly requested.

## 6. Imported Nagaland catalogue

The supplied workbooks contain the first real regional catalogue:

| Workbook | Purpose | Records |
|---|---|---:|
| `Nagaland.xlsx` | Nagaland institutions and education providers | 423 |
| `EntranceExam.xlsx` | Northeast-relevant active entrance, recruitment, professional, olympiad, and study-abroad examinations | 79 |
| `scholarships.xlsx` | Central, national private/CSR, Northeast-region, and state scholarship schemes | 66 |

The validated dataset results are:

| Dataset | Duplicate keys | Missing required fields | Notes |
|---|---:|---:|---|
| Institutions | 0 | 0 | One descriptive source annotation was normalized to its embedded URL |
| Entrance examinations | 0 | 0 | Official and source URLs have valid shape |
| Scholarships | 0 | 0 | Official and source URLs have valid shape |

The institution data covers 18 distinct source district spellings. `Chumoukedima` and `Chümoukedima` are normalized to `Chümoukedima`. `Tseminyu` is normalized to the application spelling `Tseminyü`. `Meluri` is represented in the approval district map.

Important data limitations must remain visible in the product:

- Many institutions do not have official websites or contact information.
- Blank hostel values do not mean that hostel facilities are unavailable.
- Free-text course descriptions are not yet a complete controlled course catalogue.
- A source URL proves provenance, not current validity.
- Exam application windows, deadlines, dates, fees, and scholarship deadlines are time-sensitive and need later official-site refresh.
- Scholarships are not only Nagaland-specific. Their geographic applicability must eventually be modeled explicitly so that central, Northeast-wide, Nagaland-specific, and other-state schemes can be filtered correctly.

## 7. Student-facing catalogue routes

The primary verification routes are:

```text
/institutions
/institutions/[code]
/exams
/scholarships
```

The institution page supports search and filters such as district, type, ownership, study level, field, course, and hostel. Details expose name, location, district, official website, source, and verification state. Unknown values should be rendered as unavailable rather than as negative claims.

The exam page now displays the preserved metadata fields: category, scope, state, exam mode, active status, conducting body, eligibility, preparation, official website, source, and verification state.

The scholarship page displays provider, eligibility, amount note, deadline note, documents, official URL, source URL, verification state, and applicable study-stage badges. Filters cover Class 9, Class 10, Class 11, Class 12, Diploma, Undergraduate, and Postgraduate.

## 8. Validation completed

The repeatable validator is `scripts/validate-catalog-data.py`. It checks workbook headers, row counts, duplicate keys, required values, URL shape, scholarship stage coverage, district coverage, and source-code UI requirements.

The detailed validation report is `docs/catalog-validation-report.md`.

The following checks passed in the sandbox after the latest changes:

- ESLint.
- TypeScript as part of the Next.js production build.
- Next.js optimized production build.
- Workbook structural and content validation.
- UI/source-contract validation for institutions, exams, and scholarships.
- Git diff whitespace validation.

The production build completed successfully and generated routes including `/admin`, `/admin/imports/[id]`, `/institutions`, `/exams`, and `/scholarships`.

The final automated validation could not query the user's local PostgreSQL instance. The user must run the following in pgAdmin after pulling the branch:

```sql
SELECT
  (SELECT COUNT(*) FROM institutions) AS institutions,
  (SELECT COUNT(*) FROM entrance_exams) AS entrance_exams,
  (SELECT COUNT(*) FROM scholarships) AS scholarships;
```

Expected results are 423 institutions, 79 entrance examinations, and 66 scholarships.

## 9. Git and local synchronization

The latest work is already pushed. The user does not need to push merely to receive these changes. From the local project directory, the user should run:

```powershell
git checkout feature/admin-import-review
git pull origin feature/admin-import-review
```

The expected latest commit is:

```text
4d13cc2 feat: validate catalogue data against UI
```

If Next.js appears stale, clear the build directory and restart:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

Applying the final database migration depends on the local project’s migration setup. Inspect `package.json`, `drizzle.config.json`, and the local migration workflow before inventing a command. The focused SQL migration is `drizzle/0001_admin_import_staging.sql`; it adds import staging support, preserves uploaded workbook data, adds institution metadata, preserves exam metadata, widens exam fields, and widens scholarship text fields.

## 10. Recommended next actions

### Immediate local verification

First, pull the feature branch and apply any pending database migration. Then verify the three canonical counts in pgAdmin. Open `/admin`, inspect the scholarship import, and approve remaining valid rows if any remain. Finally, smoke-test `/institutions`, `/exams`, and `/scholarships` on desktop and mobile widths.

### Phase 5: make the catalogue more trustworthy

Before adding broad automation, improve geographic applicability and freshness. Add structured scholarship-region relationships. Add a canonical district table or region foreign keys. Preserve source records and retrieval dates consistently. Add explicit freshness labels and make volatile facts such as deadlines and exam dates clearly time-sensitive.

Courses offered by institutions are currently free text. The next catalogue improvement should create controlled course mappings and an admin review queue for ambiguous course names rather than pretending every free-text value is a canonical course.

### Phase 6: strengthen the AI Mentor RAG

The Mentor should retrieve only approved, verification-aware catalogue records and knowledge chunks. Each answer should expose sources and verification dates where applicable. The retrieval context should distinguish stable guidance from volatile facts. The system should never answer an admission or scholarship question with an unsupported guarantee.

A practical implementation sequence is:

1. Add catalogue records to the retrieval corpus after approval.
2. Include dataset type, geographic scope, verification state, source URL, and last-verified date in each chunk.
3. Filter retrieval by student state and study stage before ranking.
4. Add source citations to Mentor responses.
5. Add tests for unsupported claims, stale facts, missing sources, and cross-state leakage.
6. Only then evaluate hosted embeddings or PostgreSQL vector search.

### Later: maps and web refresh

Google Maps integration is a later feature. The application already has a schematic/keyless fallback and optional `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` configuration. Exact coordinates should be added only from reliable sources. District/town-level approximations must be labelled as approximate.

Web refresh should target frequently changing information such as application windows, deadlines, examination dates, current fees, seat availability, scholarship cycles, and official admission notices. A refresh job must create reviewable updates rather than silently overwriting trusted records.

## 11. Non-negotiable product and engineering rules

1. PostgreSQL is the canonical storage location for imported catalogue data. Do not replace the database with hardcoded workbook data.
2. All imported records need provenance, verification status, and last-verified information.
3. Never show an unknown value as a negative fact. Use “Not available” or “Not verified.”
4. Do not expose prediction percentages or deterministic career claims.
5. Keep reasons and cautions visible when ordering recommendations.
6. Do not invent fees, deadlines, admission rules, institutions, or scholarship eligibility.
7. Protect admin routes and verify admin authorization on every admin API operation.
8. Protect user-owned profiles, counselling sessions, saved items, action plans, and mentor conversations from cross-user access.
9. Avoid exact addresses and unnecessary personal information for minors.
10. Treat web-scraped or workbook data as evidence with a freshness date, not as permanently current truth.
11. Preserve raw imports and audit events so changes can be reviewed and reversed.
12. Design records with state scope so the remaining Northeast states can be enabled later.

## 12. Useful files at a glance

| File or directory | Purpose |
|---|---|
| `src/db/schema.ts` | PostgreSQL and Drizzle schema |
| `src/db/index.ts` | Database connection |
| `src/services/catalog.ts` | Catalogue read boundary and search/filter services |
| `src/admin/importer.ts` | Excel parsing and normalization |
| `src/admin/approval.ts` | Transactional canonical upsert logic |
| `src/components/admin-import-uploader.tsx` | Admin upload UI |
| `src/components/admin-import-review.tsx` | Admin row review and bulk actions |
| `src/app/admin/page.tsx` | Admin dashboard |
| `src/app/admin/imports/[id]/page.tsx` | Import detail page |
| `src/app/api/admin/imports/route.ts` | Import list/create API |
| `src/app/api/admin/imports/[id]/route.ts` | Import review and approval API |
| `src/app/institutions/page.tsx` | Institution listing |
| `src/app/institutions/[code]/page.tsx` | Institution details |
| `src/app/exams/page.tsx` | Entrance examination catalogue |
| `src/app/scholarships/page.tsx` | Scholarship catalogue |
| `src/recommendation/engine.ts` | Explainable rule-based guidance |
| `src/ai/index.ts` | AI provider abstraction |
| `src/services/mentor.ts` | Mentor orchestration and guardrails |
| `drizzle/0001_admin_import_staging.sql` | Admin import and schema increment |
| `scripts/validate-catalog-data.py` | Repeatable catalogue/UI validator |
| `docs/catalog-validation-report.md` | Latest validation report |
| `docs/nagaland-data-inventory.md` | Dataset analysis and future data architecture |
| `.env.example` | Environment variable template |

## 13. Continuation instruction for another AI

Start by checking the local branch and working tree. Read this handoff, `docs/catalog-validation-report.md`, `src/db/schema.ts`, `src/admin/importer.ts`, `src/admin/approval.ts`, and the relevant route files before changing behavior. Do not assume that the old inspection notes describe the current admin state; those notes were written before the import-review workflow was completed.

Then verify the local PostgreSQL counts and the three student-facing routes. If those checks pass, continue with the AI Mentor retrieval upgrade using approved catalogue records, geographic scope, verification metadata, and citations. Keep the product student-centred and explainable. Any new data source or automation must enter through a reviewable staging process rather than directly overwriting canonical records.

## References

[1]: https://github.com/NouneHuozha/MCA_project-careerBridge-/tree/feature/admin-import-review "CareerBridge feature branch"
[2]: https://nextjs.org/docs "Next.js documentation"
[3]: https://orm.drizzle.team/docs/overview "Drizzle ORM documentation"
[4]: https://docs.sheetjs.com/ "SheetJS documentation"

> This document is a project handoff summary based on the current repository state and the completed catalogue validation. It should be updated whenever the database schema, import workflow, deployment model, or product priorities materially change.

**Author:** Manus AI
