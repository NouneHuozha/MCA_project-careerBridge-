# CareerBridge

**AI-powered career & education guidance for students in Nagaland.**
Core principle: **guide, don't decide.**

CareerBridge is not a career prediction system. It behaves like a digital career counsellor: it
understands the student first, then helps them explore fields, careers, courses, institutions,
pathways, scholarships and opportunities — always with the reasoning shown, and always leaving the
decision with the student.

## Product rules baked into the code

- No prediction, no match percentages, no "your career". Suggestions are "areas worth exploring".
- Every suggestion carries **Why this?**, **Why not?** and **What if?**.
- Time-sensitive facts (fees, dates, eligibility, deadlines) are shown **only with a source and a
  verification date**. Otherwise the UI says "Currently unavailable" and links to the official source.
- The catalogue of institutions is a clearly labelled **sample dataset** (`sample-dataset-v1`).
  No fees, seat counts or admission dates are invented.
- Privacy by design: no address, no income figures, no phone numbers. Location is district-level.

## Architecture

```
src/
  app/            routes (landing, start, counselling, profile, explore, careers,
                  pathways, courses, institutions, exams, scholarships, opportunities,
                  compare, action-plan, dashboard, mentor, admin, api/*)
  components/     design-system primitives and client widgets
  auth/           authentication abstraction (Clerk adapter + first-party sessions)
  ai/             AIProvider abstraction (OpenAI / Anthropic / Google / none)
  rag/            corpus builder, chunking, embeddings, retrieval + citations
  recommendation/ Career Exploration & Guidance Engine (rule/content based, explainable)
  services/       catalog, profile/counselling, mentor, student (saved/plans)
  maps/           Google Maps Platform integration + keyless fallbacks
  data/           sample master dataset + counselling question bank
  db/             Drizzle schema, connection, idempotent seeding
```

### Database (PostgreSQL + Drizzle)

~32 tables including `users`, `student_profiles`, `counselling_sessions`, `counselling_responses`,
`academic_profiles`, `interests`/`student_interests`, `strengths`/`student_strengths`,
`goals`/`student_goals`, `preferences`, `career_fields`, `careers`, `career_skills`, `pathways`,
`courses`, `institutions`, `institution_courses`, `institution_sources`, `admission_information`,
`entrance_exams`, `scholarships`, `opportunities`, `saved_items`, `comparisons`, `action_plans`,
`action_items`, `mentor_conversations`, `mentor_messages`, `recommendations`,
`recommendation_reasons`, `knowledge_documents`, `knowledge_chunks`, plus `regions` (country →
state → district → city) and admin tables (`data_imports`, `audit_events`, `feedback_flags`).

Apply the schema and seed:

```bash
npx drizzle-kit push     # create/update tables
npm run dev              # catalogue + RAG corpus seed lazily on first request
```

### RAG

Trusted sources → documents → cleaning → chunking → embeddings → Postgres vector store →
hybrid retrieval (vector + keyword) → mentor answer **with citations**. Embeddings use a
deterministic local provider by default; `EmbeddingProvider` can be swapped for a hosted model.

### AI provider

`getAIProvider()` returns the first configured provider (OpenAI, Anthropic, Google) or `null`.
With no provider the mentor still answers, but only from retrieved source text — it never
generates unsupported facts. Guardrails live in `MENTOR_SYSTEM_PROMPT`.

## Environment

See `.env.example`. Only `DATABASE_URL` is required; Clerk, AI and Google Maps keys are optional and
degrade gracefully with honest UI states.

## Scripts

```bash
npm run dev        # development
npm run build      # production build
npm run start      # production server
npm run typecheck  # TypeScript
npm run lint       # ESLint
```
