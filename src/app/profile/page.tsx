import Link from "next/link";
import { ArrowRight, BookOpen, Check, Compass, Fingerprint, Heart, MapPin, MessageCircle, Pencil, Route, Target, Wallet } from "lucide-react";
import { Badge, ButtonLink, Callout, Disclosure, EmptyState, Eyebrow, AddLink, accentSurface, type Accent } from "@/components/ui";
import { FieldIcon, fieldVisual } from "@/components/field-visuals";
import { MiniJourney, LinkRow } from "@/components/detail-parts";
import { FACTOR_LABELS, suggestFields, suggestPathways } from "@/recommendation/engine";
import { getSessionState, labelFor } from "@/services/profile";
import { optionalQuestionsForStage } from "@/data/counselling";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your profile & next steps" };
const answerLabels: Record<string, string> = { "home-district": "Near my district", "within-nagaland": "Within Nagaland", "outside-open": "Open to outside Nagaland", "not-sure": "Not sure yet", low: "Lower-fee options", moderate: "Moderate fees", flexible: "Flexible budget", unsure: "Budget not known yet", "with-people": "Working with people", independent: "Independent work", "hands-on": "Hands-on work", outdoors: "Outdoor work", mixed: "A mix" };
const optionalLabels: Record<string, string> = { subjects_difficult: "Difficult subjects", performance: "How studies are going", interest_story: "Something you enjoy", work_style: "Preferred work style", home_district: "Your district", scholarship_need: "Scholarship needs", institution_pref: "Institution preference", hostel: "Hostel needs", anything_else: "Anything else" };
const pretty = (value: string | null) => value ? answerLabels[value] ?? value.replace(/-/g, " ") : null;

export default async function ProfilePage() {
  const state = await getSessionState();
  if (!state) return <div className="cb-container cb-page"><EmptyState icon={<Compass className="h-5 w-5" />} title="Let’s find your starting points." description="Eight short questions help us understand what interests you." action={<ButtonLink href="/start">Start my profile<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink>} /></div>;
  const { snapshot } = state;
  const ready = snapshot.completion >= 100;
  const [fields, paths] = await Promise.all([suggestFields(snapshot, 3), suggestPathways(snapshot, 3)]);
  const groups: { title: string; edit: string; accent: Accent; icon: typeof Heart; items: string[] }[] = [
    { title: "Subjects you enjoy", edit: "subjects_enjoy", accent: "mint", icon: BookOpen, items: snapshot.subjectsEnjoy.map((s) => labelFor("subject", s)) },
    { title: "Interests", edit: "interests", accent: "butter", icon: Heart, items: snapshot.interests.map((s) => labelFor("interest", s)) },
    { title: "Strengths", edit: "strengths", accent: "lavender", icon: Fingerprint, items: snapshot.strengths.map((s) => labelFor("strength", s)) },
    { title: "Goals", edit: "goals", accent: "peach", icon: Target, items: snapshot.goals.map((s) => labelFor("goal", s)) },
    { title: "What matters", edit: "values", accent: "sky", icon: Compass, items: snapshot.values.map((s) => labelFor("value", s)) },
    { title: "Location", edit: "location_pref", accent: "mint", icon: MapPin, items: [pretty(snapshot.locationPref), snapshot.district].filter(Boolean) as string[] },
    { title: "Budget", edit: "budget", accent: "butter", icon: Wallet, items: [pretty(snapshot.budget)].filter(Boolean) as string[] },
  ];
  const optional = optionalQuestionsForStage(snapshot.stage);
  return <div className="cb-container cb-page">
    <header className="mb-7 flex flex-wrap items-start justify-between gap-6 rounded-2xl border border-forest-200 bg-mint/65 p-6 sm:p-8">
      <div className="max-w-3xl"><Eyebrow>{ready ? "Profile ready · Your next chapter" : "A good beginning · Your profile"}</Eyebrow><h1 className="mt-3 text-[clamp(1.8rem,2.8vw,3rem)] font-semibold">{ready ? "You’ve told us about you. Let’s explore." : "Your starting points are taking shape."}</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-600">{ready ? "Choose a field below. You’re exploring a possibility — not making a final decision." : "You can explore now, or finish the remaining questions when you’re ready."}</p></div>
      <span className="inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-white px-4 py-3 text-sm font-semibold text-forest-800"><Check aria-hidden className="h-4 w-4" />{snapshot.stage === "class10" ? "Class 10" : "Class 12"} · {ready ? "Ready to explore" : "Saved so far"}</span>
    </header>
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><MiniJourney /><Link href="#my-answers" className="cb-source text-xs lg:hidden">Review my answers<Pencil aria-hidden className="h-3.5 w-3.5" /></Link></div>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.25fr)] 2xl:gap-10">
      <section id="my-answers" className="order-2 min-w-0 lg:order-1" aria-labelledby="profile-summary-title">
        <div className="cb-panel">
          <div className="flex items-start justify-between gap-3"><div><h2 id="profile-summary-title" className="text-xl font-semibold">Here’s what we understood.</h2><p className="mt-2 text-sm text-ink-500">Your words. Always open to change.</p></div><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky text-sky-ink"><Fingerprint aria-hidden className="h-5 w-5" /></span></div>
          <dl className="mt-5 divide-y divide-ink-100">{groups.map((group) => <div key={group.title} className="py-4">
            <dt className="flex items-center justify-between gap-3"><span className="flex items-center gap-2.5"><span className={`grid h-8 w-8 place-items-center rounded-lg ${accentSurface[group.accent]}`}><group.icon aria-hidden className="h-4 w-4" /></span><span className="text-sm font-semibold text-ink-700">{group.title}</span></span><Link href={`/counselling?edit=${group.edit}`} aria-label={`Edit ${group.title.toLowerCase()}`} className="cb-button min-h-9 border border-ink-200 bg-forest-50 px-2.5 py-1 text-xs text-forest-700 hover:bg-mint"><Pencil aria-hidden className="h-3 w-3" />Edit</Link></dt>
            <dd className="mt-2.5 flex flex-wrap gap-1.5 sm:pl-[42px]">{group.items.length ? group.items.map((item) => <span key={item} className="rounded-lg border border-ink-100 bg-ink-50 px-2.5 py-1 text-xs text-ink-700">{item}</span>) : <span className="text-xs text-ink-500">Not answered yet</span>}</dd>
          </div>)}</dl>
          {!ready && <ButtonLink href="/counselling" className="mt-4 w-full">Continue my conversation<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink>}
        </div>
        <div className="mt-4"><Disclosure summary="More about me" hint="Optional — only if useful"><div className="flex flex-wrap gap-2">{optional.map((q) => <AddLink key={q.key} href={`/counselling?edit=${q.key}`}>{snapshot.answeredKeys.includes(q.key) ? "Edit " : "Add "}{optionalLabels[q.key]?.toLowerCase() ?? "a preference"}</AddLink>)}</div>{snapshot.notes.length > 0 && <div className="mt-5 border-t border-ink-200 pt-4"><p className="mb-2 font-semibold">In your words</p>{snapshot.notes.map((note, i) => <p key={i} className="mb-2">“{note}”</p>)}</div>}</Disclosure></div>
        <p className="mt-4 px-1 text-xs leading-relaxed text-ink-500">These are not conclusions about your future. They are starting points for exploration.</p>
      </section>
      <section className="order-1 min-w-0 rounded-[1.5rem] border border-forest-200 bg-[#edf3e9] p-5 sm:p-7 lg:order-2" aria-labelledby="starting-points-title" id="starting-points">
        <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest-700 text-white"><Compass aria-hidden className="h-5 w-5" /></span><div><Eyebrow>Start here</Eyebrow><h2 id="starting-points-title" className="mt-1 text-[1.45rem] font-semibold">Pick a field to look into.</h2><p className="mt-2 text-sm text-ink-600">Tap <strong>Explore this field</strong> to see careers and routes.</p></div></div>
        <div className="mt-6 space-y-4">{fields.map((suggestion) => <article key={suggestion.field.slug} className="rounded-xl border border-ink-200 bg-white p-5">
          <div className="flex items-center gap-3"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accentSurface[fieldVisual(suggestion.field.slug).accent]}`}><FieldIcon slug={suggestion.field.slug} /></span><div><h3 className="text-base font-semibold">{suggestion.field.name}</h3><p className="mt-1 text-xs leading-relaxed text-ink-500">{suggestion.field.tagline}</p></div></div>
          <div className="mt-4 flex flex-wrap items-start gap-3"><ButtonLink href={`/explore/${suggestion.field.slug}`} size="sm">Explore this field<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink><Link href={`/explore/${suggestion.field.slug}#reflect`} className="cb-button px-2 py-2 text-xs text-forest-700 underline underline-offset-4">Why might it not suit me?</Link></div>
          <div className="mt-3"><Disclosure summary="Why are we showing this?">{suggestion.reasons.length ? <ul className="space-y-3">{suggestion.reasons.map((reason, i) => <li key={i}><span className="font-semibold text-forest-800">{FACTOR_LABELS[reason.factor]}: </span>{reason.detail}</li>)}</ul> : <p>This is a starting point to browse, not a conclusion about you.</p>}</Disclosure></div>
        </article>)}</div>
        <ButtonLink href="/explore" variant="secondary" className="mt-5 w-full">Something different? Browse all fields<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink>
        <div className="mt-6"><Disclosure summary="Prefer to start with an education route?" hint={`${snapshot.stage === "class10" ? "After Class 10" : "After Class 12"}`}><div className="space-y-3">{paths.map(({ pathway }) => <LinkRow key={pathway.slug} href={`/pathways/${pathway.slug}`} title={pathway.title} description={pathway.typicalDuration} icon={<Route className="h-4 w-4" />} accent="butter" action="See route" />)}</div></Disclosure></div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-forest-200 pt-5"><p className="text-sm text-ink-600">Still unsure? Talk it through.</p><ButtonLink href="/mentor" variant="secondary" size="sm"><MessageCircle aria-hidden className="h-4 w-4" />Ask Mentor</ButtonLink></div>
      </section>
    </div>
  </div>;
}
