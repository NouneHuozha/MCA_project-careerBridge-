import Link from "next/link";
import { ArrowRight, Check, Compass, Filter, Route, Search, Sparkles } from "lucide-react";
import { ButtonLink, Disclosure, Eyebrow, Badge, accentSurface } from "@/components/ui";
import { FieldIcon, fieldVisual } from "@/components/field-visuals";
import { MiniJourney, LinkRow } from "@/components/detail-parts";
import { FACTOR_LABELS, scoreField, suggestPathways, type FieldSuggestion } from "@/recommendation/engine";
import { getFields, getPathways } from "@/services/catalog";
import { getSessionState } from "@/services/profile";
import { SaveButton } from "@/components/save-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your recommendations" };

type SearchParams = { q?: string; show?: string };

function matchesQuery(suggestion: FieldSuggestion, query: string) {
  if (!query) return true;
  const haystack = `${suggestion.field.name} ${suggestion.field.tagline ?? ""} ${suggestion.field.overview}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function ReasonList({ suggestion, compact = false }: { suggestion: FieldSuggestion; compact?: boolean }) {
  const reasons = suggestion.reasons.slice(0, compact ? 2 : 4);
  return <div className="space-y-2 text-xs leading-relaxed text-ink-600">{reasons.length ? reasons.map((reason) => <p key={reason.detail} className="flex gap-2"><Check aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-600" /><span><strong className="text-ink-800">{FACTOR_LABELS[reason.factor]}:</strong> {reason.detail}</span></p>) : <p>This is a useful possibility to browse, even without a strong signal yet.</p>}</div>;
}

function FieldCard({ suggestion, rank, top }: { suggestion: FieldSuggestion; rank: number; top?: boolean }) {
  const accent = fieldVisual(suggestion.field.slug).accent;
  return <article className={`flex h-full flex-col rounded-2xl border bg-white p-5 ${top ? "border-forest-200 shadow-[0_10px_32px_-24px_#1d634b]" : "border-ink-200"}`}>
    <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accentSurface[accent]}`}><FieldIcon slug={suggestion.field.slug} /></span><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-semibold">{suggestion.field.name}</h3>{top && <Badge tone="green">Top starting point</Badge>}</div><p className="mt-1 text-xs leading-relaxed text-ink-500">{suggestion.field.tagline}</p></div></div><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-50 text-xs font-bold text-ink-500">{rank}</span></div>
    <div className="mt-4 flex-1"><p className="text-sm leading-relaxed text-ink-600">{suggestion.headline}</p><div className="mt-4"><p className="mb-2 text-xs font-bold uppercase tracking-[.13em] text-forest-700">Why this appeared</p><ReasonList suggestion={suggestion} compact={!top} /></div>{suggestion.cautions.length > 0 && <Disclosure summary="Things to think about" hint="Before deciding" tone="amber"><ul className="space-y-2 text-xs leading-relaxed">{suggestion.cautions.slice(0, 3).map((caution) => <li key={caution} className="flex gap-2"><span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-butter-ink" />{caution}</li>)}</ul></Disclosure>}</div>
    <div className="mt-5 flex flex-wrap gap-2 border-t border-ink-100 pt-4"><ButtonLink href={`/explore/${suggestion.field.slug}`} size="sm">Explore this path<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink><SaveButton itemType="field" itemRef={suggestion.field.slug} label={suggestion.field.name} /></div>
  </article>;
}

export default async function RecommendationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const [state, fields, pathways] = await Promise.all([getSessionState(), getFields(), getPathways()]);
  const scored = fields.map((field) => scoreField(field, state?.snapshot ?? { stage: "class10", stageDetail: null, subjectsEnjoy: [], subjectsDifficult: [], performance: null, stream: null, interests: [], strengths: [], goals: [], values: [], workStyle: null, locationPref: null, district: null, budget: null, scholarshipNeed: null, institutionPref: null, hostel: null, notes: [], answeredKeys: [], completion: 0 })).sort((a, b) => b.relevance - a.relevance);
  const visible = scored.filter((suggestion) => matchesQuery(suggestion, query));
  const top = visible.slice(0, 5);
  const other = visible.slice(5);
  const recommendedPathways = state ? await suggestPathways(state.snapshot, 4) : pathways.slice(0, 4).map((pathway) => ({ pathway, reasons: ["A route students can explore from this stage."] }));
  const complete = state?.snapshot.completion === 100;

  return <div className="cb-container cb-page">
    <header className="mb-5 flex flex-wrap items-start justify-between gap-5"><div className="max-w-3xl"><Eyebrow>Step 2 · Explore paths</Eyebrow><h1 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-semibold">Your recommendations</h1><p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-600">{state ? "Based on what you told us, these are possibilities worth exploring. The order helps you choose where to begin—it does not limit what you can become." : "Browse every field below, or answer a few short questions to organise the possibilities around you."}</p><div className="mt-5 flex flex-wrap gap-2">{state ? <ButtonLink href="/profile" variant="secondary" size="sm">Review my profile<ArrowRight aria-hidden className="h-3.5 w-3.5" /></ButtonLink> : <ButtonLink href="/start" size="sm">Start with questions<ArrowRight aria-hidden className="h-3.5 w-3.5" /></ButtonLink>}<ButtonLink href="/courses" variant="ghost" size="sm">Find study options<ArrowRight aria-hidden className="h-3.5 w-3.5" /></ButtonLink></div></div><div className="min-w-[220px] rounded-2xl border border-forest-200 bg-mint/55 p-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-forest-700"><Sparkles aria-hidden className="h-3.5 w-3.5" />Your journey</p><div className="mt-3 flex items-center gap-2 text-xs font-semibold"><span className="grid h-7 w-7 place-items-center rounded-full bg-forest-700 text-white">1</span><span className="h-px flex-1 bg-forest-300" /><span className="grid h-7 w-7 place-items-center rounded-full bg-forest-700 text-white">2</span><span className="h-px flex-1 bg-ink-200" /><span className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink-400">3</span></div><div className="mt-2 flex justify-between text-[11px] text-ink-500"><span>Your profile</span><span>Explore paths</span><span>Compare</span></div></div></header>

    <div className="mb-6"><MiniJourney /></div>

    <section className="mb-7 rounded-2xl border border-forest-200 bg-forest-50/75 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-forest-700"><Compass aria-hidden className="h-5 w-5" /></span><div><h2 className="text-lg font-semibold">You have more than one possible direction.</h2><p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-600">{complete ? "Your answers point towards several kinds of work. That is useful—you have options to compare, not one fixed answer." : "These are broad possibilities. Finish your profile if you want the order and explanations to become more personal."}</p></div></div></section>

    <section aria-labelledby="top-recommendations-title"><div className="flex flex-wrap items-end justify-between gap-3"><div><Eyebrow>Best places to start</Eyebrow><h2 id="top-recommendations-title" className="mt-1 text-2xl font-semibold">Top {Math.min(5, top.length)} paths for your first look</h2></div><span className="text-xs text-ink-500">Prioritised, not restricted</span></div>{top.length ? <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{top.map((suggestion, index) => <FieldCard key={suggestion.field.slug} suggestion={suggestion} rank={index + 1} top />)}</div> : <p className="mt-4 rounded-xl border border-ink-200 bg-white p-5 text-sm text-ink-500">No fields match that search. Try a broader word or clear the search.</p>}</section>

    <section className="mt-10" aria-labelledby="all-fields-title"><div className="flex flex-wrap items-end justify-between gap-4"><div><Eyebrow>Nothing is hidden</Eyebrow><h2 id="all-fields-title" className="mt-1 text-2xl font-semibold">Explore all possibilities</h2><p className="mt-1 text-sm text-ink-500">Every field in the current CareerBridge catalogue remains available to you.</p></div><form action="/recommendations" className="flex w-full max-w-sm gap-2"><label htmlFor="recommendation-search" className="sr-only">Search all possibilities</label><div className="relative min-w-0 flex-1"><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><input id="recommendation-search" name="q" defaultValue={query} placeholder="Search fields…" className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-forest-400" /></div><button type="submit" className="cb-button cb-button-secondary px-3 text-sm"><Filter aria-hidden className="h-4 w-4" />Filter</button></form></div>{other.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{other.map((suggestion, index) => <FieldCard key={suggestion.field.slug} suggestion={suggestion} rank={index + 6} />)}</div> : <p className="mt-4 text-sm text-ink-500">The top section contains every field matching your search.</p>}</section>

    <section className="mt-10 rounded-2xl border border-ink-200 bg-white p-5 sm:p-6" aria-labelledby="routes-title"><div className="flex flex-wrap items-end justify-between gap-3"><div><Eyebrow>From your stage</Eyebrow><h2 id="routes-title" className="mt-1 text-xl font-semibold">Education routes to compare</h2><p className="mt-1 text-sm text-ink-500">A field is the direction; a route is one way to get there.</p></div><Link href="/pathways" className="cb-source text-sm">See all routes<ArrowRight aria-hidden className="h-3.5 w-3.5" /></Link></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{recommendedPathways.map(({ pathway }) => <LinkRow key={pathway.slug} href={`/pathways/${pathway.slug}`} title={pathway.title} description={pathway.typicalDuration} icon={<Route className="h-4 w-4" />} accent="butter" action="See route" />)}</div></section>

    <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-lavender-ink/20 bg-lavender/25 p-5"><div><h2 className="text-base font-semibold">What would you like to do next?</h2><p className="mt-1 text-sm text-ink-600">Compare possibilities, look for study options, or save something to revisit.</p></div><div className="flex flex-wrap gap-2"><ButtonLink href="/compare" variant="secondary" size="sm">Compare options<ArrowRight aria-hidden className="h-3.5 w-3.5" /></ButtonLink><ButtonLink href="/action-plan" variant="ghost" size="sm">Make a plan<ArrowRight aria-hidden className="h-3.5 w-3.5" /></ButtonLink></div></section>
  </div>;
}
