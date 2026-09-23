# CareerBridge Project Documentation

**Project:** CareerBridge  
**Repository:** `NouneHuozha/MCA_project-careerBridge-`  
**Document status:** Detailed current-state documentation  
**Document date:** 23 September 2026  
**Inspected branch:** `feature/admin-import-review`  
**Latest inspected commit:** `77d3f4c`  
**Primary region:** Nagaland, India  
**Future region:** The wider Northeast of India  
**Product principle:** **Guide, do not decide.**

---

## 1. Executive summary

CareerBridge is a student-facing career and higher-education guidance platform for students who are deciding what to do after Class 10 or Class 12. The first regional implementation focuses on Nagaland. The database and product model are intended to support the other Northeastern states later without requiring a complete redesign.

The platform combines structured counselling, an editable student profile, explainable recommendations, career-field exploration, education pathways, courses, institutions, examinations, scholarships, comparisons, saved items, action plans, and an optional AI Mentor. Its purpose is not to predict one “correct” career. Its purpose is to help a student understand several reasonable directions, investigate them, compare their trade-offs, and take a practical next step.

The current repository is an advanced application foundation rather than an empty prototype. The core student journey, database model, recommendation engine, catalogue services, authentication abstraction, mentor integration, and administration/import foundation are present. The most important work remaining is not a complete rewrite of the application. It is the controlled transition from a functional product foundation to a trustworthy real-world service.

That transition requires four kinds of work:

1. **Data trust:** Replace or supplement sample catalogue content with reviewed, source-linked, freshness-aware data.
2. **Operational readiness:** Establish a repeatable database migration, import, verification, and refresh process.
3. **Security and privacy:** Complete authorization, rate-limiting, logging, and minor-focused privacy review.
4. **UX refinement:** Continue reducing cognitive load so a student always knows where they are, what the page is for, and what to do next.

---

## 2. Product vision and objectives

### 2.1 Product vision

CareerBridge should become a reliable digital guidance companion for students who do not have easy access to a qualified career counsellor or a well-organized source of higher-education information. It should help a student move from uncertainty to informed exploration without pretending that a software system can determine the student’s future.

The product should answer practical questions such as:

- What subjects, interests, strengths, and values appear important to me?
- Which broad career fields could I explore?
- What kinds of work exist inside each field?
- Which routes are available after Class 10 or Class 12?
- Which courses, colleges, institutions, examinations, and scholarships may be relevant?
- What should I verify from an official source before making a decision?
- What is one realistic next step I can take now?

### 2.2 Initial scope

The first product scope is deliberately focused on students at the Class 10 and Class 12 decision points. These stages are important because students may need to choose a stream, diploma, vocational route, higher-secondary option, undergraduate direction, or entrance-examination path.

The first geographic scope is Nagaland. The long-term scope is the eight-state Northeast region:

- Assam
- Arunachal Pradesh
- Manipur
- Meghalaya
- Mizoram
- Nagaland
- Sikkim
- Tripura

The application should therefore keep geographic information state-aware from the beginning, even when the initial interface mainly presents Nagaland records.

### 2.3 Product principles

**Guide, do not decide.** Recommendations are starting points. They are not predictions, verdicts, or guarantees.

**Explain the reason.** A student should be able to understand why a field or pathway appeared in a recommendation list.

**Do not hide alternatives.** Prioritization is useful, but the platform must not make a student believe that lower-ranked options are unavailable or unsuitable.

**Separate stable guidance from changing facts.** General descriptions of a career field can be maintained as catalogue content. Fees, dates, eligibility rules, deadlines, and course availability require source-linked verification and periodic refresh.

**Respect uncertainty.** “Not sure yet,” “unknown,” and “needs verification” are valid states. The application must not convert missing data into a negative claim.

**Keep the student in control.** Answers, recommendations, saved items, and plans should be editable. Students should be able to reconsider a direction without being treated as inconsistent.

---

## 3. Target users

### 3.1 Primary users

The primary users are students who are currently in Class 10 or Class 12, have recently completed one of those classes, or are waiting for results and need help understanding their next options.

A student may be unsure about:

- Which stream or route to choose.
- Whether a degree, diploma, vocational, or professional route is more suitable.
- What a career actually involves day to day.
- Whether a course is available nearby or requires relocation.
- How subjects, interests, budget, location, hostel requirements, and family circumstances affect practical choices.

### 3.2 Secondary users

Parents, teachers, mentors, counsellors, and administrators are important secondary users. The current student experience is the main product focus, while the data and administration layers provide the foundation for trusted information maintenance.

### 3.3 Administrator and data-review users

Administrators maintain catalogue information and review imported workbook records. They are responsible for deciding whether a staged row is sufficiently normalized and verified to become student-facing canonical data.

The administrator workflow must remain separate from the student workflow. Unreviewed workbook rows should not silently replace canonical records.

---

## 4. Student journey

The intended primary journey is:

```text
Landing page
    ↓
Choose Class 10 or Class 12 stage
    ↓
Answer guided counselling questions
    ↓
Review the editable profile
    ↓
Explore prioritized and alternative paths
    ↓
Understand a field and possible careers
    ↓
Review pathways, courses, and institutions
    ↓
Compare two options
    ↓
Create a practical action plan
    ↓
Use the Mentor and official sources when needed
```

The current UX work makes the journey explicit through four major steps:

```text
1. Your profile
2. Explore paths
3. Compare options
4. Plan next steps
```

The step indicator is intentionally simple. It answers three questions for the student:

1. Where am I now?
2. What have I already completed?
3. What is the next useful action?

### 4.1 Entry and stage selection

The `/start` route allows the student to select the relevant stage. The counselling questions are stage-aware for Class 10 and Class 12. Stage details can include whether the student is currently studying, has completed the class, or is awaiting results.

### 4.2 Counselling

The `/counselling` route presents the structured questionnaire. The core flow collects information such as:

- Subjects the student enjoys.
- Subjects the student finds difficult.
- Academic performance or confidence.
- Interests.
- Strengths.
- Goals.
- Values and work preferences.
- Location preference.
- Budget and scholarship needs.
- Institution and hostel preferences.
- Optional notes or free-text context.

The flow supports progress, previous answers, validation, resumability, and a “Not sure yet” state. The student does not need to provide an artificially certain answer to continue.

Responses are persisted through the counselling API. Anonymous students can resume through an HTTP-only journey cookie. When an anonymous student signs in, the journey can be associated with the account.

### 4.3 Profile checkpoint

The `/profile` route is the checkpoint between counselling and exploration. It should not overwhelm the student with every recommendation and catalogue option at once.

The current UX direction makes the profile page responsible for three tasks:

- Confirm that the student’s information has been captured.
- Let the student review or edit answers.
- Provide one prominent transition to recommendations.

The profile should communicate that the answers are useful signals, not a permanent identity or final decision.

### 4.4 Recommendations

The `/recommendations` route is the main exploration starting point after the profile. Recommendations are ordered possibilities, not deterministic predictions.

The page provides:

- A visible journey position.
- A prioritized group of fields to investigate first.
- Access to all available fields.
- Explanations for why a field appeared.
- Search across the available catalogue.
- Links into field detail pages.
- Save-for-later controls.
- Pathway and planning destinations.

The top results are intended to reduce decision overload. They must not remove the student’s ability to browse other options.

Recommendation cards should remain independent. Expanding or reading information about one result must not change the height or layout of unrelated results.

### 4.5 Field exploration

The `/explore/[slug]` route explains one broad field. It is not intended to force the student to select a career immediately.

The page is organized around four questions:

1. **Understand this field:** What the field is and what people do.
2. **Possible careers:** What kinds of work exist within it.
3. **Routes to enter:** Which pathways, courses, and institutions may lead into it.
4. **Think it through:** Why it appeared, what could make it worthwhile, what challenges exist, and what alternatives are available.

The field detail page uses deep-linkable tabs. A link such as `/explore/technology#pathways` can open the relevant topic directly.

### 4.6 Comparison

The `/compare` route allows the student to compare two courses, careers, institutions, or pathways. The comparison should help the student understand trade-offs in areas such as:

- Entry stage.
- Duration.
- Eligibility.
- Subjects.
- Entrance requirements.
- Further study.
- Career directions.
- Location or ownership.
- Hostel or fee notes.
- Verification state.

The comparison is not intended to declare a universal winner. Its purpose is to make differences visible so that the student can decide which trade-offs deserve further investigation.

### 4.7 Action plan

The `/action-plan` route turns a direction into manageable tasks. An action plan may include checking official eligibility, identifying relevant pathways, reviewing institutions, checking scholarships, understanding examinations, and discussing a choice with a trusted person.

The action plan should remain a checklist rather than a countdown. The student can complete items gradually and return later.

### 4.8 Mentor support

The Mentor is available as a separate route and as a modeless support panel. It should support exploration and clarification rather than replace the main navigation.

The Mentor must communicate uncertainty when verified information is not available. It must not invent fees, dates, eligibility rules, institutions, application windows, or scholarship facts.

---

## 5. Current technology stack

| Layer | Technology or implementation |
|---|---|
| Web framework | Next.js 16.2.6 App Router |
| UI library | React 19.2.6 |
| Language | TypeScript 5.9.3 |
| Styling | Tailwind CSS 4.1.17 plus shared CSS/components |
| Database | PostgreSQL |
| Database access | `pg`, Drizzle ORM, Drizzle Kit |
| Workbook parsing | SheetJS `xlsx` |
| Authentication | Local secure-session provider with optional Clerk configuration |
| AI providers | Optional OpenAI, Anthropic, and Google integrations |
| Retrieval | PostgreSQL-backed knowledge chunks with deterministic local embeddings |
| Browser testing | Playwright |
| Icons | `lucide-react` |
| Map support | Optional Google Maps integration with a labelled schematic fallback |

The project is a private Next.js application. The package name remains the template-derived `nextjs-postgresql-template`, but the product itself is CareerBridge.

---

## 6. Repository structure

The most important directories are:

```text
CareerBridge/
├── src/
│   ├── app/                 Next.js routes, pages, APIs, and global styles
│   ├── ai/                  AI provider abstraction and provider selection
│   ├── admin/               Workbook parsing, normalization, and approval logic
│   ├── auth/                Authentication abstraction and session handling
│   ├── components/          Reusable UI and interactive client components
│   ├── data/                Bundled development seed data and counselling data
│   ├── db/                  Drizzle schema and database access
│   ├── rag/                 Retrieval and local embedding implementation
│   ├── recommendation/      Explainable recommendation engine
│   └── services/            Catalogue, profile, mentor, and student services
├── drizzle/                 SQL migrations
├── docs/                    Project reports, handoff notes, and validation documents
├── public/                  Images and public assets
├── scripts/                 Validation and maintenance scripts
├── tests/                   Playwright UX tests and related test configuration
├── .env.example             Environment variable template
├── drizzle.config.json      Drizzle configuration
├── package.json             Commands and dependencies
└── tsconfig.json            TypeScript configuration
```

### 6.1 Important source files

| File or directory | Responsibility |
|---|---|
| `src/app/page.tsx` | Landing page and primary entry points |
| `src/app/start/page.tsx` | Stage selection and counselling entry |
| `src/app/counselling/page.tsx` | Counselling page wrapper |
| `src/components/counselling-experience.tsx` | Interactive counselling experience |
| `src/app/profile/page.tsx` | Editable profile checkpoint |
| `src/app/recommendations/page.tsx` | Prioritized and complete field exploration |
| `src/app/explore/[slug]/page.tsx` | Field detail page |
| `src/app/compare/page.tsx` | Comparison workflow |
| `src/app/action-plan/page.tsx` | Saved action checklists |
| `src/recommendation/engine.ts` | Explainable field and pathway ordering |
| `src/services/catalog.ts` | Typed catalogue read boundary |
| `src/services/profile.ts` | Profile state and snapshot helpers |
| `src/services/student.ts` | Saved items, plans, and student actions |
| `src/services/mentor.ts` | Mentor orchestration and guardrails |
| `src/rag/index.ts` | Retrieval implementation |
| `src/db/schema.ts` | Database schema |
| `src/admin/importer.ts` | Workbook parsing and normalization |
| `src/admin/approval.ts` | Transactional import approval and canonical upserts |
| `src/app/admin/page.tsx` | Admin import dashboard |
| `src/app/admin/imports/[id]/page.tsx` | Import review page |
| `scripts/validate-catalog-data.py` | Workbook and UI contract validator |
| `tests/ux.spec.ts` | Playwright end-to-end UX coverage |

---

## 7. Application routes

### 7.1 Public and onboarding routes

| Route | Purpose |
|---|---|
| `/` | Landing page and product introduction |
| `/start` | Select Class 10 or Class 12 counselling stage |
| `/about` | Project and product explanation |
| `/how-it-works` | Explain the guidance process |
| `/sign-in` | Sign in |
| `/sign-up` | Create an account |

### 7.2 Student journey routes

| Route | Purpose |
|---|---|
| `/counselling` | Answer or resume counselling questions |
| `/profile` | Review the captured profile and continue to recommendations |
| `/dashboard` | Student progress and saved workspace |
| `/recommendations` | Prioritized and complete exploration of fields |
| `/explore` | Browse fields |
| `/explore/[slug]` | Understand one field |
| `/careers/[slug]` | Explore one career role |
| `/pathways` | Browse entry routes |
| `/pathways/[slug]` | Inspect one pathway |
| `/courses` | Browse courses |
| `/courses/[slug]` | Inspect one course |
| `/institutions` | Search and filter institutions |
| `/institutions/[code]` | Inspect one institution |
| `/compare` | Compare two entities |
| `/saved` | Review saved items |
| `/action-plan` | Complete practical next steps |
| `/mentor` | Use the Mentor directly |

### 7.3 Additional catalogue routes

| Route | Purpose |
|---|---|
| `/exams` | Entrance and other examination catalogue |
| `/scholarships` | Scholarship catalogue and filters |
| `/opportunities` | Opportunity catalogue |

### 7.4 Administration routes

| Route | Purpose |
|---|---|
| `/admin` | Import dashboard and administration entry |
| `/admin/imports/[id]` | Inspect, review, and approve one import |

### 7.5 API routes

The application contains API handlers for authentication, profile state, counselling, recommendations, catalogue resources, institutions, Mentor messages, saved items, action plans, search, health, and administration imports.

The principal API route groups are:

```text
/api/auth/[action]
/api/auth/sign-out
/api/profile
/api/counselling
/api/recommendations
/api/catalog/[resource]
/api/institutions
/api/institutions/[code]
/api/search
/api/saved
/api/action-plan
/api/mentor
/api/admin/imports
/api/admin/imports/[id]
/api/health
```

---

## 8. System architecture

### 8.1 Request and rendering model

The project uses the Next.js App Router. Most pages are server components. They load data through service modules rather than embedding database queries directly in the page whenever practical.

Interactive experiences are isolated into client components. Examples include:

- Counselling question transitions.
- Mentor chat.
- Save controls.
- Detail tabs.
- Animated guidance elements.
- Admin import review controls.
- Map interactions.

This separation keeps data loading and authorization close to the server while allowing focused client-side interaction where needed.

### 8.2 Service boundaries

The service layer provides a boundary between routes and data sources. Important boundaries include:

- `catalog.ts` for catalogue reads and cross-catalogue search.
- `profile.ts` for counselling snapshots and profile state.
- `student.ts` for saved items and action plans.
- `mentor.ts` for retrieval, AI provider calls, persistence, and fallback behavior.
- Authentication services for session and user ownership.

Catalogue reads can use PostgreSQL when it is available and bundled seed data as a development fallback. This fallback is useful for local development, but production deployments must clearly expose whether they are using database-backed data or demo fallback data.

### 8.3 Database-backed source of truth

PostgreSQL is intended to be the system of record for user data and canonical catalogue data. TypeScript seed files are development support material, not the long-term source of truth for current official facts.

Every externally sourced fact should preserve:

- A source URL.
- The source or provider name where available.
- Retrieval or verification time.
- A controlled verification status.
- Geographic scope where applicable.

---

## 9. Database design

The schema is defined in `src/db/schema.ts`. The design uses surrogate numeric IDs internally while preserving stable external keys such as slugs and institution codes.

### 9.1 Geography

The `regions` table is a self-referencing hierarchy. It can represent:

```text
country → state → district → city
```

The initial seed is Nagaland. The hierarchy is designed to support the other Northeastern states later.

Records should use region identifiers or controlled geographic scope wherever possible. Free-text location alone is not sufficient for reliable filtering.

### 9.2 Authentication and profiles

Important user-related tables include:

- `users`
- `auth_sessions`
- `student_profiles`
- `academic_profiles`
- `interests`
- `student_interests`
- `strengths`
- `student_strengths`
- `goals`
- `student_goals`
- `preferences`

A student profile stores the broad stage and completion state. Academic profile data stores class, stream, results status, performance band, subjects, strong subjects, and difficult subjects. Student selections are stored in normalized link tables and preferences.

### 9.3 Counselling

Counselling is represented through:

- `counselling_sessions`
- `counselling_responses`

A session may belong to a signed-in user or remain associated with an anonymous journey key. It stores the stage, status, current step, total steps, and completion timestamps.

Each response stores:

- Question key.
- Question text at the time of answering.
- Answer type.
- Selected values.
- Optional free text.
- Session association.

This preserves a structured record of the counselling interaction rather than storing only one opaque final result.

### 9.4 Career and education catalogue

The core catalogue entities include:

- `career_fields`
- `careers`
- `career_skills`
- `pathways`
- `courses`
- `institutions`
- Institution-course relationships.

A field describes a broad area such as Technology or Healthcare. A career describes a role inside or related to a field. A pathway describes a route into education or work. A course describes an educational offering. An institution describes a provider.

This distinction is important because “field,” “career,” “course,” “pathway,” and “institution” are not interchangeable concepts in the student journey.

### 9.5 Sources and verification

Catalogue entities carry source and verification information. The intended semantics are:

- **Verified:** The record has been checked against an authoritative or sufficiently reliable source.
- **Multi-source:** The record is supported by more than one source but may require a stronger official confirmation.
- **Needs verification:** The record is present but should not be treated as fully confirmed.
- **Unknown or unavailable:** The value is not known. It is not a negative claim.

A source URL establishes provenance. It does not prove that a fee, deadline, course offering, or admission rule is still current.

### 9.6 Student planning and feedback

The schema also includes structures for:

- Saved items.
- Comparisons.
- Action plans and action-plan items.
- Mentor conversations and messages.
- Recommendations.
- Knowledge documents and knowledge chunks.
- Feedback flags.
- Audit events.

These structures support a future product in which the student’s exploration history and next steps can be carried across sessions.

---

## 10. Counselling and recommendation logic

### 10.1 Counselling snapshot

The counselling service converts structured response rows into a `StudentSnapshot`. The snapshot contains:

- Stage and stage detail.
- Subjects enjoyed.
- Subjects found difficult.
- Academic performance information.
- Stream where relevant.
- Interests.
- Strengths.
- Goals.
- Values.
- Work style.
- Location preference.
- District.
- Budget.
- Scholarship need.
- Institution preference.
- Hostel preference.
- Notes.
- Answered question keys.
- Completion percentage.

The snapshot is used by the profile page and the recommendation engine.

### 10.2 Recommendation engine

The recommendation engine is rule-based and explainable. It calculates internal relevance from overlap between student signals and field tags. The internal relevance value is used for ordering and should not be shown as a probability or unsupported “match percentage.”

The output includes:

- A field.
- A headline.
- Reason objects grouped by factor.
- Cautions.
- Overlap information.

Factors may include:

- Interests.
- Academic preferences.
- Strengths.
- Goals.
- Values.
- Location.
- Budget.
- Difficult subjects.
- Work style.
- Practical constraints.

The engine can also suggest pathways by considering stage, field, budget, location, stream, and top field signals.

### 10.3 Recommendation trust requirements

The recommendation engine must remain transparent. Any future change should preserve:

- Visible reason explanations.
- Visible cautions or trade-offs.
- Access to non-prioritized options.
- A clear distinction between guidance and prediction.
- Tests using representative Class 10 and Class 12 profiles.
- Review for unintended bias against students with lower budgets, difficult subjects, or location constraints.

A student’s practical constraint should influence the order of exploration, but it should not be treated as proof that a path is impossible.

---

## 11. Catalogue and data-management strategy

### 11.1 Two categories of data

CareerBridge should distinguish between **stable guidance content** and **volatile official facts**.

Stable guidance content includes:

- What a field generally involves.
- Common activities in a career.
- Useful subjects and skills.
- General advantages and challenges.
- Broad alternative routes.

Volatile official facts include:

- Application deadlines.
- Entrance-examination dates.
- Current fees.
- Course availability.
- Eligibility rules.
- Seat availability.
- Scholarship deadlines.
- Current institution contact details.
- Current admission notices.

Stable guidance can be maintained in the catalogue. Volatile facts should be tied to official source records and refreshed when needed.

### 11.2 Workbook import principle

The dynamic catalogue data is intended to be maintained through Excel workbooks and an administrator review process. The workbook must not directly overwrite canonical student-facing records without validation and human review.

The intended pipeline is:

```text
Excel workbook
    ↓
Raw import record
    ↓
Parsed row staging
    ↓
Normalization and warnings/errors
    ↓
Protected administrator review
    ↓
Approved canonical record
    ↓
Student catalogue and Mentor retrieval
```

### 11.3 Import staging

The admin import schema stores:

- Dataset type.
- Original filename.
- Original workbook content in the import record.
- Source hash.
- Import status.
- Warning count.
- Error count.
- Review timestamp.
- Raw row JSON.
- Normalized row JSON.
- Row-level warnings and errors.
- Row-level review status.

The design preserves the original row and normalized interpretation separately. This is important because a reviewer must be able to see what the workbook contained and what the importer changed.

### 11.4 Supported workbook types

The current import workflow recognizes:

| Dataset | Stable key | Primary purpose |
|---|---|---|
| Institutions | `code` | Education providers and institutions |
| Entrance examinations | `slug` | Entrance, recruitment, professional, olympiad, and other examinations |
| Scholarships | `slug` | Central, national, Northeast-wide, and state scholarship schemes |

The importer validates required headers, expected sheets, duplicate keys, URL shape, stage values, and required fields. It can normalize district spellings, class-stage values, delimited arrays, and source fields that contain descriptive text followed by a URL.

### 11.5 Canonical Nagaland catalogue

The documented supplied catalogue contains:

| Dataset | Records |
|---|---:|
| Institutions | 423 |
| Entrance examinations | 79 |
| Scholarships | 66 |

The validation report records zero duplicate keys and no required blanks in the primary datasets. The final counts should still be confirmed against the local PostgreSQL database after import.

### 11.6 Institution data limitations

The institution workbook is useful but incomplete in several areas:

- Official websites are not available for every institution.
- Contact information is absent for many records.
- Hostel fields are often blank.
- Course offerings are partly free text.
- Exact coordinates are not supplied for every institution.
- Blank data must not be interpreted as “not available at the institution.”

Institution course text should eventually be mapped to controlled course records and institution-course relationships. Ambiguous mappings should enter a review queue.

### 11.7 Examination data limitations

The examination catalogue contains useful fields such as category, scope, state, mode, frequency, and active status. These fields should be preserved because they affect how a student interprets an examination.

Exam dates, application windows, fees, and eligibility details can become outdated. The official examination website should be the final authority for current application information.

### 11.8 Scholarship data limitations

Scholarships may apply to:

- Nagaland specifically.
- The wider Northeast.
- All-India or central schemes.
- Other individual states.

Geographic applicability should be modeled explicitly rather than inferred only from provider or eligibility text. A future `scholarship_regions` relationship or equivalent scope model would make filtering safer.

---

## 12. Official-source and web-refresh strategy

The project should not scrape arbitrary websites each time a user asks a question. That approach is difficult to audit, vulnerable to layout changes, and can expose students to stale or misleading information.

The preferred strategy is:

1. Store the canonical catalogue record.
2. Store the official URL and source metadata.
3. Mark when the record was last checked.
4. Refresh volatile fields from the official source on a defined schedule or through an administrator-triggered refresh.
5. Preserve the previous value and audit event when a change occurs.
6. Display verification state and freshness information to the student.
7. Link the student to the official page for final confirmation.

A refresh process should distinguish between:

- **Source retrieval:** The page or document was accessed.
- **Field extraction:** Relevant information was identified.
- **Human verification:** An administrator confirmed that the extracted information is suitable for student-facing use.

The application should never present a source URL alone as proof that the information is current.

---

## 13. AI Mentor and retrieval architecture

### 13.1 Provider abstraction

The AI layer supports optional OpenAI, Anthropic, and Google providers. Provider selection can be pinned with `AI_PROVIDER`. When no provider key is configured, the application can still operate with retrieval-only behavior.

### 13.2 Retrieval

The current retrieval implementation is self-contained. It uses deterministic hashed embeddings with PostgreSQL JSONB storage and combines vector-like similarity with keyword and title matching. It retrieves relevant knowledge chunks and returns citation information.

This is suitable for development and a self-contained project environment. It is not yet a production vector-search architecture. A later improvement could use hosted embeddings and PostgreSQL vector search while preserving the current retrieval service interface.

### 13.3 Mentor safety requirements

The Mentor must not invent:

- Fees.
- Deadlines.
- Examination dates.
- Eligibility conditions.
- Institutions.
- Scholarship facts.
- Application windows.
- Course availability.

When no verified retrieval context is available, the Mentor should state that it cannot answer confidently and direct the student to the official source or a trusted adult or counsellor.

The Mentor should support a student’s reasoning. It should not make a high-impact decision on behalf of the student.

---

## 14. Authentication, privacy, and security

### 14.1 Authentication model

The authentication module is an abstraction. When configured Clerk variables are present, the application can use the Clerk path. Otherwise, the application uses a first-party local provider with PostgreSQL-backed users, password hashing, and HTTP-only sessions.

This fallback is useful for development and controlled deployments. The production authentication choice should be finalized and tested separately.

### 14.2 Anonymous journeys

Students can begin counselling without immediately creating an account. Anonymous journey state is associated with a random HTTP-only cookie. On sign-in, the journey can be connected to the account.

Signing out clears local journey access on shared devices while preserving account-owned progress in the database.

### 14.3 Privacy expectations

The product is intended for minors and young students. It should therefore minimize unnecessary personal data collection.

The counselling flow should avoid requiring:

- Exact home addresses.
- Sensitive financial documents.
- Unnecessary identity information.
- Private information that is not needed for guidance.

The application should provide clear explanations of what is stored and why.

### 14.4 Security work still required

Before production use, the project should complete a focused review of:

- Authorization for every admin route and API operation.
- Ownership checks for user-owned profiles, saved items, comparisons, plans, and mentor conversations.
- Anonymous session access and cookie transfer risks.
- Rate limits for authentication and Mentor endpoints.
- Input validation and output encoding.
- Secret handling and environment separation.
- Sensitive information in logs.
- File size and content limits for workbook uploads.
- Auditability of approval and resync actions.
- Database backup and restoration procedures.

---

## 15. Local development setup

### 15.1 Prerequisites

A development machine should have:

- Node.js compatible with the project’s Next.js version.
- npm.
- PostgreSQL.
- Git.
- A configured database user and database.
- Optional AI provider credentials for Mentor generation.
- Optional Google Maps credentials for the full map integration.

### 15.2 Clone and select the working branch

```bash
git clone https://github.com/NouneHuozha/MCA_project-careerBridge-.git
cd MCA_project-careerBridge
git switch feature/admin-import-review
git pull origin feature/admin-import-review
```

### 15.3 Install dependencies

```bash
npm ci
```

### 15.4 Configure environment variables

Copy the template:

```bash
cp .env.example .env
```

At minimum, configure:

```env
DATABASE_URL=postgresql://user:password@host:5432/careerbridge
```

Optional authentication variables include:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

Optional AI variables include:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_MODEL=...
```

The project also supports Anthropic and Google AI variables. Optional Google Maps configuration is provided through:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

Never commit real secrets to GitHub.

### 15.5 Database setup

The schema source is `src/db/schema.ts`, and the Drizzle configuration is `drizzle.config.json`. The repository contains SQL migration material, including the admin import staging migration.

The exact migration procedure should be standardized before production deployment. In a local development environment, the responsible developer should:

1. Create the PostgreSQL database.
2. Configure `DATABASE_URL`.
3. Apply the repository migrations or generate and apply the Drizzle schema according to the selected deployment procedure.
4. Run the project’s seed process if seed scripts are available in the current checkout.
5. Confirm the database health endpoint and key catalogue counts.

The `drizzle.config.json` file currently contains a local PostgreSQL URL. The environment-specific database URL should be reviewed before using Drizzle commands against a shared or production database.

### 15.6 Start development

```bash
npm run dev
```

The development server normally runs at:

```text
http://localhost:3000
```

### 15.7 Production build and start

```bash
npm run build
npm run start
```

---

## 16. Available commands

| Command | Purpose |
|---|---|
| `npm ci` | Install the lockfile dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Create the optimized production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npx playwright test` | Run the configured browser tests when the test environment is ready |
| `python3 scripts/validate-catalog-data.py` | Validate supplied workbook structure and UI contracts when the workbook path is available |

The catalogue validator requires the supplied workbook files. Those workbooks are external to Git and may not be present in every environment.

---

## 17. Testing and validation

### 17.1 Static validation

The project currently validates through:

- ESLint.
- TypeScript.
- Next.js production build.
- Git whitespace checks.
- Catalogue workbook validation.

The recent UX phases passed lint, typecheck, production build, and route smoke tests.

### 17.2 Route smoke testing

The following routes have been smoke-tested successfully during the current UX work:

- `/profile`
- `/recommendations`
- `/explore/technology`
- `/compare`
- `/action-plan`

The routes returned HTTP 200 in the configured development environment.

### 17.3 Browser testing

The browser suite is located in `tests/ux.spec.ts`. The project documentation indicates that it should run against an already running production preview and should not launch an additional application server.

A typical browser test sequence is:

```bash
npx playwright install --with-deps chromium
npx playwright test
```

Use `CAREERBRIDGE_TEST_URL` when the preview runs at a URL other than the default test target.

### 17.4 Catalogue validation

The catalogue validation script checks:

- Required workbook headers.
- Record counts.
- Duplicate stable keys.
- Required values.
- URL shape.
- District coverage.
- Scholarship stage coverage.
- Source-code UI contracts.

The documented supplied dataset passed these checks with 423 institutions, 79 entrance examinations, and 66 scholarships.

### 17.5 Local database verification

The sandbox cannot verify the user’s local PostgreSQL database. After pulling the branch, the local environment should confirm the canonical counts with a query similar to:

```sql
SELECT
  (SELECT COUNT(*) FROM institutions) AS institutions,
  (SELECT COUNT(*) FROM entrance_exams) AS entrance_exams,
  (SELECT COUNT(*) FROM scholarships) AS scholarships;
```

The expected documented counts are:

```text
institutions: 423
entrance_exams: 79
scholarships: 66
```

---

## 18. Current implementation status

| Area | Status | Explanation |
|---|---|---|
| Product foundation | Implemented | Major routes, services, shared UI, and database model exist. |
| Class 10/Class 12 counselling | Implemented | Stage-aware, validated, persisted, editable, and resumable. |
| Profile | Implemented | Snapshot review and profile-to-recommendation transition exist. |
| Recommendations | Implemented | Rule-based ordering, reasons, cautions, and complete browsing exist. |
| Field exploration | Implemented | Field, career, pathway, and related exploration routes exist. |
| Courses and institutions | Implemented with data limitations | Pages and filters exist, but authoritative freshness must be maintained. |
| Exams and scholarships | Implemented with imported-data foundation | Catalogue structure and validation exist; current facts require refresh. |
| Comparison | Implemented | Two-item comparison exists for multiple catalogue types. |
| Action plans | Implemented | Saved checklists and item status updates exist. |
| Saved items | Implemented | Students can save catalogue items for later. |
| AI Mentor | Implemented with optional provider | Retrieval-only fallback and safety rules exist. |
| RAG | Development implementation | Local deterministic embeddings and JSONB retrieval work, but production vector search is future work. |
| Authentication | Implemented with abstraction | Local secure sessions exist; production provider choice needs verification. |
| Admin import | Early-to-substantial foundation | Workbook staging, normalization, review, approval, and audit structures exist. Full operational hardening remains. |
| Real-time official refresh | Planned | Source records exist, but a complete scheduled or administrator-controlled refresh process remains to be finalized. |
| Multi-state Northeast expansion | Planned | Geography is designed for expansion, but the initial content and filters focus on Nagaland. |
| Production deployment | Not fully verified | Clean deployment, database operations, monitoring, security, and backup procedures remain to be validated. |

---

## 19. Known limitations and risks

### 19.1 Data freshness

The most important product risk is presenting a historically correct but currently outdated fact. Source URLs, verification status, and retrieval timestamps reduce this risk but do not eliminate it.

Volatile information should display freshness or verification context and should direct the student to the official source before an important decision.

### 19.2 Sample and fallback data

The application can use bundled seed data when the database is unavailable. This is useful for development, but it may make a deployment appear functional while it is not connected to the intended database.

A production deployment should expose database health clearly and avoid silently presenting fallback data as current official information.

### 19.3 Course mapping

Institution course offerings are partly free text. A controlled mapping between institutions and canonical courses is required for accurate course filtering and pathway discovery.

### 19.4 Geographic applicability

Scholarships and examinations can be national, Northeast-wide, state-specific, or institution-specific. Geographic scope should be structured rather than inferred from free text.

### 19.5 Recommendation bias

Rule-based recommendations are explainable, but they can still encode unintended bias. Profiles with lower budgets, difficult subjects, or location constraints require representative test cases and careful review to ensure that the engine presents realistic choices without prematurely narrowing the student’s future.

### 19.6 Security and authorization

The admin import flow and user-owned resources require a deliberate authorization audit. A working UI does not prove that every server-side action is correctly protected.

### 19.7 Dependency security

Dependency audit warnings were reported during the documented baseline validation. They should be triaged deliberately. Automatic force upgrades should not be applied without checking compatibility with Next.js, React, Drizzle, and the application’s test suite.

---

## 20. Recommended development roadmap

### Phase 1: Local environment verification

Before adding more product features:

1. Confirm the local PostgreSQL connection.
2. Apply the current schema and migrations.
3. Verify seed and imported catalogue counts.
4. Run the health endpoint.
5. Run the main Playwright flows at desktop and mobile widths.
6. Confirm that admin routes are unavailable to ordinary students.

### Phase 2: Data trust and freshness

Next, strengthen the data system:

1. Import the real Nagaland workbooks through the staging workflow.
2. Review rejected and ambiguous rows.
3. Normalize districts and geographic scope.
4. Map institution course text to controlled course records.
5. Add freshness labels and last-verified display.
6. Establish an administrator refresh procedure for official sources.
7. Preserve audit history for changes.

### Phase 3: Student journey polish

Continue testing the student journey with real users or representative student profiles:

1. Complete counselling.
2. Review the profile.
3. Open recommendations.
4. Open a field.
5. Compare two options.
6. Create an action plan.
7. Return later and resume progress.

The success criterion is not only that every page works. The student should understand the next action without assistance.

### Phase 4: Security and production readiness

Complete:

- Authorization review.
- Rate limiting.
- File upload restrictions.
- Environment separation.
- Database backup and restore testing.
- Error monitoring.
- Audit-log review.
- Accessibility review.
- Privacy review for minors.
- Deployment rollback procedure.

### Phase 5: Northeast expansion

After the Nagaland flow and data maintenance process are reliable:

1. Add state-aware geography for the remaining Northeastern states.
2. Add region-specific institutions and scholarships.
3. Preserve national and Northeast-wide examinations and schemes.
4. Add state filters and student location selection.
5. Review recommendation behavior for regional differences.
6. Expand verified sources state by state.

---

## 21. Definition of done for real-world use

CareerBridge should not be considered ready for broad real-world student use until the following conditions are satisfied:

- The production database is configured and monitored.
- The canonical catalogue is populated from reviewed data.
- Every volatile catalogue fact has source and freshness metadata.
- The import workflow has been tested with the real workbooks.
- Admin authorization has been verified.
- Student data ownership has been verified for every API route.
- Anonymous and signed-in journey behavior is tested.
- The recommendation engine has representative test profiles.
- The Mentor refuses unsupported factual answers and cites verified sources.
- Browser tests pass at desktop and mobile widths.
- The application distinguishes database-backed data from fallback seed data.
- A backup and restoration procedure has been tested.
- Students can understand the four-step journey without external explanation.

---

## 22. Current handoff summary

The application is ready for continued development on the `feature/admin-import-review` branch. The recent UX work has focused on reducing confusion after counselling:

```text
Profile checkpoint
    ↓
Recommendations
    ↓
Field detail
    ↓
Comparison
    ↓
Action plan
```

The next development decisions should be made with the following distinction in mind:

- **Do not rebuild working application foundations without evidence.**
- **Do improve unclear UX when students cannot understand the next action.**
- **Do not treat workbook data as permanently current.**
- **Do use official sources for time-sensitive facts.**
- **Do preserve explainability and student choice.**

CareerBridge already has the structure of a serious product. Its success now depends on trustworthy data operations, security, validation, and disciplined UX testing with the students it is intended to serve.

---

## References

[1]: https://github.com/NouneHuozha/MCA_project-careerBridge-/tree/feature/admin-import-review "CareerBridge feature branch"

[2]: https://nextjs.org/docs "Next.js documentation"

[3]: https://orm.drizzle.team/docs/overview "Drizzle ORM documentation"

[4]: https://www.postgresql.org/docs/ "PostgreSQL documentation"

[5]: https://playwright.dev/docs/intro "Playwright documentation"

[6]: https://www.nagaland.gov.in/ "Government of Nagaland official portal"
