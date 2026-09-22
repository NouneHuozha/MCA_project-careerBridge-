# CareerBridge UX Redesign and Frontend Improvement Prompt

## Role

Act as a senior product designer, UX researcher, information architect, accessibility specialist, and frontend design-system engineer. Improve the existing CareerBridge application carefully and iteratively. Inspect the current code and routes before changing anything.

Do not treat this as a greenfield redesign. Preserve the existing working product, database boundaries, catalogue services, authentication behavior, counselling persistence, recommendation logic, AI Mentor guardrails, source metadata, admin import workflow, and privacy protections unless a change is necessary for the UX.

Before editing code, provide:

1. A concise UX diagnosis based on the actual repository.
2. A revised student journey.
3. A route-by-route information architecture map.
4. A desktop and mobile navigation proposal.
5. A primary/secondary/tertiary action hierarchy table.
6. A content and label rewrite list.
7. A visual design direction and component strategy.
8. A small, reversible implementation plan ordered by user impact.
9. A mobile and desktop validation checklist.

Only after that analysis should implementation begin.

## Product context

CareerBridge is a real student-facing career and education guidance platform for Northeast India. The first geographic implementation is **Nagaland**. The initial product is focused only on **Class 10 and Class 12 students**. The architecture should remain state-aware so other Northeast states can be added later, but do not dilute the first experience by designing the current counselling flow for every age group or state.

This is an MCA final-year project, but it is intended for genuine student use rather than only a classroom demo or startup mockup. Reliability, clarity, privacy, accessibility, maintainability, and honest uncertainty are therefore more important than adding impressive-looking features quickly.

The product principle is:

> **Guide, don’t decide.**

CareerBridge should help a student understand themselves, explore possible fields and routes, compare education options, verify requirements, and take a practical next step. It must not claim to know a student’s fixed future, guarantee admission or employment, or display unsupported match percentages.

## Core student experience

The central experience should be:

> Choose your stage → Answer a few questions → Review what CareerBridge understood → Explore fields and routes → Find relevant courses and institutions → Check exams and funding → Save or take one small next step

The student should not need to understand the internal system before using it. The interface should quietly guide them from uncertainty to exploration.

The first release should prioritize:

- Class 10 counselling and stream/path exploration
- Class 12 counselling and course/path exploration
- Student profile understanding
- Explainable suggestions with reasons and cautions
- Nagaland institutions, courses, exams, scholarships, and opportunities
- Source-linked and freshness-aware information
- Saved items and small practical action plans
- Contextual Mentor support

Advanced collaborative filtering, complex predictive ML, broad live scraping, and full travel intelligence are later phases. Do not let those features make the primary counselling journey confusing.

## Data and trust requirements

Use the existing data architecture and preserve the distinction between data types:

1. **Student data** is private application data stored securely in PostgreSQL. This includes credentials, counselling answers, marks, interests, strengths, goals, constraints, saved items, action plans, and appropriate Mentor history.
2. **Curated catalogue data** is maintained through reviewed Excel imports, validation, admin review, and PostgreSQL storage. Excel must not be the runtime database.
3. **Volatile external facts** such as fees, deadlines, exam dates, scholarship cycles, eligibility changes, course availability, hostel availability, and admission notices should be refreshed from official sources periodically, not scraped live whenever a student asks a question.
4. Every external fact should preserve source URL, source organization, retrieval date, verification status, geographic scope, study-stage applicability, and freshness where applicable.
5. Unknown information must be displayed as “Not available,” “Not verified,” or “Check the official source.” Never turn missing data into a negative claim and never invent an answer.
6. Important catalogue facts must remain source-linked in the interface. Do not hide evidence behind the Mentor.

## UX problems to solve

Audit the current application for:

- Too many equally prominent choices
- Unclear first action for a new student
- Navigation based too heavily on internal database categories
- Confusion between field, career, route/pathway, course, institution, exam, and scholarship
- Detail pages without a clear next step
- Weak distinction between Save, Compare, Ask Mentor, Open source, and Continue
- Small or low-contrast text
- Dense cards and long paragraphs
- Decorative elements that compete with important actions
- Dashboard terminology that feels technical or corporate
- Unclear difference between saved reminders and committed action plans
- Mentor presentation that competes with guided counselling
- Missing or weak recovery paths such as “Change my answers” or “Go back”
- Missing freshness and verification clarity

For every important page, the student should understand:

1. Where am I?
2. What is this page helping me understand?
3. What is the most important next action?
4. What can I do instead if I am not ready?
5. How do I return to my progress or change direction?

## Navigation and workspace direction

Use a hybrid navigation model.

### Public pages

Keep a light, familiar top navigation for visitors. It should not expose every internal category as an equal primary destination. Consider:

- CareerBridge logo
- Start here
- Explore careers
- Find courses and colleges
- Exams and scholarships
- Sign in or start

### Student workspace

After the student starts counselling or signs in, use a desktop left sidebar for the personal workspace. Do not call the main page “Dashboard” unless there is a strong reason. Prefer **My progress** or **My journey**.

Recommended workspace groups:

**My journey**

- My progress
- Continue counselling
- My suggestions
- My action plan

**Keep for later**

- Saved items
- My profile

**Explore**

- Career fields and careers
- Courses and colleges
- Exams and scholarships

**Support**

- Mentor

The sidebar should feel warm and personal, not like an enterprise administration panel. It may include a compact journey indicator, a clear active state, icons with labels, and a small “Next step” panel. Do not overload it with statistics.

During the focused counselling questionnaire, do not show a distracting full navigation system. Keep the student focused on the current question, progress, back/edit actions, save-and-return behavior, and one clear Continue action.

On mobile, use a compact top bar and an accessible navigation drawer. Do not combine a permanent sidebar, bottom navigation, and multiple competing menus. Keep the most important next action visible without requiring the drawer to open.

## Visual design direction

Minimalism must not mean plainness. Create a visually attractive interface that is calm, warm, memorable, and easy to use.

Preserve and refine the existing warm editorial identity:

- Forest green for trust and primary actions
- Mint for progress and positive states
- Lavender for reflection and self-understanding
- Sky for learning and courses
- Peach for practical next steps
- Butter for funding and scholarships
- Warm off-white surfaces and readable dark ink text

Use color purposefully, not as decoration. Maintain accessible contrast and never use color alone to communicate status, selection, verification, or errors.

Use visual richness through:

- Meaningful illustrations and regional visual motifs
- Editorial page composition with large, medium, and compact content blocks
- A calm pathway or journey visual
- Clear progress markers
- Purposeful section accents
- Friendly empty states
- Route diagrams and comparison layouts
- Subtle, performant motion during progress and transitions
- Strong typography, comfortable line height, and generous spacing

Avoid:

- Generic corporate dashboards
- Dark neon “AI” styling
- Excessive gradients or glassmorphism
- Generic AI sparkles
- Huge decorative hero sections that push actions below the fold
- Equal-sized cards for every feature
- Excessive floating animation
- Tiny text inside attractive layouts
- Visual decoration that makes education information feel unreliable

## Homepage requirements

Within the first screen, the homepage must answer:

1. Who is CareerBridge for?
2. What can it help me do?
3. What should I click first?

Use one dominant first-time action:

> **Start with a few questions**

Supporting explanation:

> Answer a few questions about yourself. We’ll show you fields and routes worth exploring. You stay in control.

Use one clear secondary route:

> **Browse options**

Supporting text:

> Already have an idea? Explore careers, courses, colleges, exams, and scholarships.

Keep “How it works” available as a supporting link, but do not make it compete with the counselling route. Group alternative destinations under a clear heading such as “Already know what you want?”

## Counselling requirements

Counselling is the heart of CareerBridge and must feel like a thoughtful conversation, not a form-heavy government portal.

The flow should:

- Start with Class 10 or Class 12 selection
- Explain what will happen in simple language
- Ask short, manageable questions
- Collect structured information for reliable recommendations
- Allow “Not sure yet” wherever uncertainty is reasonable
- Allow marks to be entered as free input or marked as result pending
- Collect relevant interests, strengths, subjects, goals, values, budget, location, relocation preference, scholarship need, institution preference, and practical concerns
- Offer optional free text after the student has gained context, rather than making the first screen feel like an essay
- Show progress without creating pressure
- Allow back, edit, save-and-return, and resume behavior
- End with an editable confirmation summary
- Make clear that suggestions are possibilities to explore, not a final decision

After results, show:

- What CareerBridge understood
- Fields or routes worth exploring
- “Why this may be worth exploring” reasons
- “Things to think about” cautions and trade-offs
- Alternative routes
- A prominent **Change my answers** action
- A clear next step toward courses or institutions

## Language and concept explanations

Use short, familiar, student-friendly language. Use sentence case. Do not remove official terminology completely; explain it the first time.

Preferred examples:

- “What are you interested in?” instead of “Select your areas of interest.”
- “Ways to get there” instead of using “Pathways” without explanation.
- “Where can I study this?” instead of showing only “Institutions.”
- “Tests you may need” when introducing entrance examinations.
- “Help paying for study” when introducing scholarships.
- “What should I do next?” instead of “Recommended action.”
- “Not sure yet” instead of forcing precision.

Use short dismissible explanations near first use:

- **Career field:** A broad area of work, such as health, technology, business, or design.
- **Career:** A type of work someone may do within a field.
- **Route:** One possible way from school toward a course or career.
- **Course:** What you study, such as a degree, diploma, or trade.
- **Institution:** A college, university, school, or training centre.
- **Entrance test:** An exam some courses or institutions require before admission.
- **Scholarship:** Financial support that may help pay for education.

## Action hierarchy

Every important page should normally have:

- One visually dominant primary action: the most useful next step
- One or two subordinate secondary actions
- Tertiary links for supporting information
- A separate bookmark-style Save action
- Clearly distinct destructive actions

Do not style Explore, Save, Compare, Ask Mentor, and Open official source as identical CTAs.

Context-specific examples:

| Page | Primary action | Secondary actions | Tertiary/supporting actions |
|---|---|---|---|
| Career field | See possible routes | Explore careers; find related courses | Institutions; exams; save |
| Career | Find courses for this career | Explore related routes; ask about this career | Save; sources |
| Route | See courses and institutions | Compare routes; ask Mentor | Save; requirements |
| Course | Find institutions offering this course | Compare; ask what this course involves | Exams; official course source |
| Institution | View courses and official admission information | Save; compare | Directions; source records |
| Exam | Check the official exam source | See relevant routes | Save; Mentor |
| Scholarship | Check eligibility and official application details | Save; ask what to verify | Related study options |

## Saved items and action plans

Use clear language:

- **Saved:** “I may want to look at this again.”
- **Action plan:** “I am ready to take a small step.”

When saving:

> Saved for later. This is not a commitment.

When adding a plan item, suggest small practical actions such as:

- Read the official course page.
- Compare two institutions.
- Check the latest exam date.
- Ask a teacher or guardian.
- Save the official application link.

## Mentor behavior and placement

The Mentor supports the guided journey and should not replace it. Keep it available but contextual rather than visually dominant on every page.

Use prompts such as:

- “Ask about this career.”
- “Ask what this course involves.”
- “Ask what to check before applying.”
- “Ask what eligibility details to verify.”

Preserve all existing guardrails:

- No invented facts, dates, fees, deadlines, eligibility, institutions, or scholarship claims
- No admission or employment guarantees
- No unsupported match percentages
- Use approved, source-aware retrieval context
- Cite official sources where available
- Clearly say when verified information is insufficient

## Route and page audit

Before implementation, map the existing routes into this student journey:

> Start → Understand yourself → Explore fields → Find routes → Compare options → Check requirements and funding → Make a plan

Identify duplicate routes, ambiguous labels, dead ends, inconsistent terminology, missing back paths, and pages without a clear contextual next action.

Audit at least:

- Homepage
- Start and stage selection
- Counselling
- Profile and results
- My progress/dashboard
- Explore and field pages
- Career pages
- Route/pathway pages
- Course pages
- Institution list and detail pages
- Exams
- Scholarships
- Saved items
- Action plan
- Mentor
- Sign in/sign up and empty/error states

## Implementation constraints

- Inspect the actual current repository before editing.
- Prefer small, focused, reversible changes over a complete visual rewrite.
- Preserve functionality and routes unless a route change clearly improves comprehension.
- Do not break PostgreSQL integration, authentication, counselling persistence, catalogue reads, admin imports, source records, or privacy behavior.
- Do not hardcode new catalogue facts into the frontend.
- Do not introduce unsupported recommendations or prediction percentages.
- Do not collect unnecessary personal or exact location data.
- Keep the experience mobile-first, responsive, accessible, and usable on low-end devices.
- Use real existing data and honest empty/unavailable states.

## Validation requirements

After implementation, run the available checks, including:

- ESLint
- TypeScript typecheck
- Production build
- Existing Playwright/UX checks where the required environment is available
- Manual or browser review at mobile and desktop widths

Test these representative tasks:

1. A Class 10 student who does not know what to choose.
2. A Class 12 student comparing courses.
3. A student looking for institutions in Nagaland.
4. A student checking entrance tests.
5. A student checking scholarships.
6. A student who wants to browse without counselling.
7. A returning student continuing an unfinished journey.

For each task, verify:

- The student can identify where to begin.
- The page purpose is understandable.
- The first action is obvious.
- The student understands the next step.
- The student can recover from a wrong route.
- The student can return to progress.
- Important terms are understandable.
- Source and freshness information remain visible.
- Save and Action Plan remain distinct.
- The Mentor supports rather than distracts.
- Text is readable on a typical mobile screen.

## Acceptance criteria

The UX improvement is successful when:

- A first-time Class 10 or Class 12 student can identify the recommended starting point immediately.
- The interface feels visually attractive, warm, and memorable without becoming crowded or “AI-styled.”
- The student can understand the difference between a field, career, route, course, institution, exam, and scholarship.
- Each important page has one obvious primary action.
- Secondary actions remain available without competing visually.
- The student can browse without being forced into counselling.
- The student can complete counselling without feeling that the result is a final decision.
- The student can edit answers and change direction.
- The student knows what to do after receiving suggestions.
- Saved items and action plans are clearly different.
- The Mentor feels contextual and helpful rather than distracting.
- Verification status, source links, and freshness remain understandable.
- The existing database, admin import workflow, catalogue behavior, and privacy behavior continue to work.
- No unsupported prediction percentages or deterministic career claims are introduced.

## Final design principle

> **Start with yourself. Explore a few possibilities. Understand the routes. Check the facts. Take one small next step.**

CareerBridge should feel like a calm, visually engaging guide for a student who is unsure—not like a directory, a generic chatbot, a corporate dashboard, or a black-box prediction tool.
