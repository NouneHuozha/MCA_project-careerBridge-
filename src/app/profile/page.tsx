import Link from "next/link";
import { ArrowRight, BookOpen, Check, Compass, Fingerprint, Heart, MapPin, Pencil, Target, Wallet } from "lucide-react";
import { ButtonLink, Disclosure, EmptyState, Eyebrow, accentSurface, type Accent } from "@/components/ui";
import { JourneyStepper } from "@/components/detail-parts";
import { getSessionState, labelFor } from "@/services/profile";
import { optionalQuestionsForStage } from "@/data/counselling";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your profile" };
const answerLabels: Record<string, string> = { "home-district": "Near my district", "within-nagaland": "Within Nagaland", "outside-open": "Open to outside Nagaland", "not-sure": "Not sure yet", low: "Lower-fee options", moderate: "Moderate fees", flexible: "Flexible budget", unsure: "Budget not known yet", "with-people": "Working with people", independent: "Independent work", "hands-on": "Hands-on work", outdoors: "Outdoor work", mixed: "A mix" };
const optionalLabels: Record<string, string> = { subjects_difficult: "Difficult subjects", performance: "How studies are going", interest_story: "Something you enjoy", work_style: "Preferred work style", home_district: "Your district", scholarship_need: "Scholarship needs", institution_pref: "Institution preference", hostel: "Hostel needs", anything_else: "Anything else" };
const pretty = (value: string | null) => value ? answerLabels[value] ?? value.replace(/-/g, " ") : null;

export default async function ProfilePage() {
  const state = await getSessionState();
  if (!state) return <div className="cb-container cb-page"><EmptyState icon={<Compass className="h-5 w-5" />} title="Let’s find your starting points." description="Eight short questions help us understand what interests you." action={<ButtonLink href="/start">Start my profile<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink>} /></div>;
  const { snapshot } = state;
  const ready = snapshot.completion >= 100;
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
    <div className="mb-5 text-xs text-ink-500"><Link href="/dashboard" className="hover:text-forest-700">Home</Link><span className="mx-2">›</span><span>Your profile</span></div>
    <header className="mb-6 flex flex-wrap items-start justify-between gap-5"><div className="max-w-3xl"><Eyebrow>Step 1 · Your profile</Eyebrow><h1 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-semibold">Your profile is {ready ? "ready to explore" : "taking shape"}.</h1><p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-600">{ready ? "We have enough to show you several possible directions. Review your answers if you want, then continue to recommendations." : "Finish the short conversation first. Your answers are saved, and you can change them later."}</p><div className="mt-5 flex flex-wrap gap-2">{ready ? <ButtonLink href="/recommendations">See my recommendations<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink> : <ButtonLink href="/counselling">Continue counselling<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink>}<ButtonLink href="/counselling" variant="secondary" size="sm"><Pencil aria-hidden className="h-3.5 w-3.5" />Review answers</ButtonLink></div></div><span className="inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-mint/55 px-4 py-3 text-sm font-semibold text-forest-800"><Check aria-hidden className="h-4 w-4" />{snapshot.stage === "class10" ? "Class 10" : "Class 12"} · {ready ? "Ready to explore" : `${snapshot.completion}% complete`}</span></header>
    <JourneyStepper current={0} />
    <section className="mt-7 rounded-2xl border-2 border-forest-300 bg-[#edf3e9] p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-5"><div><Eyebrow>Next step</Eyebrow><h2 className="mt-2 text-2xl font-semibold">{ready ? "Explore your possible paths." : "Complete your profile before exploring."}</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">{ready ? "Recommendations will help you decide where to look first. They will not decide your future or remove any option." : "A few more answers will make the suggestions more useful and easier to explain."}</p></div>{ready && <ButtonLink href="/recommendations">Continue to Explore paths<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink>}</div></section>
    <section className="mt-6 rounded-2xl border border-ink-200 bg-white p-5 sm:p-6"><Disclosure summary="Review what we understood" hint="Your answers are editable" defaultOpen={false}><div className="grid gap-3 sm:grid-cols-2">{groups.map((group) => <div key={group.title} className="rounded-xl border border-ink-100 bg-ink-50/45 p-4"><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2.5"><span className={`grid h-8 w-8 place-items-center rounded-lg ${accentSurface[group.accent]}`}><group.icon aria-hidden className="h-4 w-4" /></span><span className="text-sm font-semibold">{group.title}</span></span><Link href={`/counselling?edit=${group.edit}`} className="text-xs font-bold text-forest-700 underline underline-offset-4">Edit</Link></div><div className="mt-3 flex flex-wrap gap-1.5">{group.items.length ? group.items.map((item) => <span key={item} className="rounded-lg border border-ink-100 bg-white px-2.5 py-1 text-xs text-ink-700">{item}</span>) : <span className="text-xs text-ink-500">Not answered yet</span>}</div></div>)}</div></Disclosure></section>
    <section className="mt-4"><Disclosure summary="Add optional details" hint="Only if useful"><div className="flex flex-wrap gap-2">{optional.map((q) => <Link key={q.key} href={`/counselling?edit=${q.key}`} className="cb-button border border-ink-200 bg-white px-3 py-2 text-xs text-ink-700 hover:border-forest-300">{snapshot.answeredKeys.includes(q.key) ? "Edit " : "Add "}{optionalLabels[q.key]?.toLowerCase() ?? "a preference"}</Link>)}</div></Disclosure></section>
    <p className="mt-5 text-xs leading-relaxed text-ink-500">You can change direction at any time. CareerBridge gives you starting points to investigate, not a final answer about your life.</p>
  </div>;
}
