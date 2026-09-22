import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, BriefcaseBusiness, Building2, GraduationCap, HeartHandshake, Lightbulb, Route, ShieldCheck } from "lucide-react";
import { Badge, BulletList, ButtonLink, Callout, Disclosure } from "@/components/ui";
import { DetailTabs } from "@/components/detail-tabs";
import { DetailHeader, JourneyStepper, LinkRow, NextStepPanel, NoCatalogItems } from "@/components/detail-parts";
import { FieldIcon, fieldVisual } from "@/components/field-visuals";
import { SaveButton } from "@/components/save-button";
import { getCareers, getCourses, getField, getFields, getInstitutions, getPathways } from "@/services/catalog";
import { getSessionState } from "@/services/profile";
import { FACTOR_LABELS, scoreField, whatIfScenarios, whyNotConsiderations } from "@/recommendation/engine";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const field = await getField((await params).slug); return { title: field?.name ?? "Explore a field" }; }

export default async function FieldPage({ params }: { params: Promise<{ slug: string }> }) {
  const field = await getField((await params).slug);
  if (!field) notFound();
  const [careers, pathways, courses, institutions, allFields, state] = await Promise.all([getCareers(field.slug), getPathways({ fieldSlug: field.slug }), getCourses({ fieldSlug: field.slug }), getInstitutions({ fieldSlug: field.slug }), getFields(), getSessionState()]);
  const suggestion = state ? scoreField(field, state.snapshot) : null;
  const cautions = whyNotConsiderations(field, state?.snapshot);
  const scenarios = whatIfScenarios(field, state?.snapshot);
  const related = allFields.filter((f) => (field.relatedFields ?? []).includes(f.slug));
  const overview = <div className="space-y-5">
    <section className="cb-panel"><h2 className="cb-panel-title"><BookOpen />The field, in a nutshell</h2><p className="cb-measure text-base leading-relaxed text-ink-600">{field.overview}</p>
      <div className="mt-6 border-t border-ink-100 pt-5"><h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><BriefcaseBusiness className="h-4 w-4 text-forest-700" />What people actually do</h3><BulletList items={(field.whatPeopleDo ?? []).slice(0, 3)} />{(field.whatPeopleDo?.length ?? 0) > 3 && <div className="mt-4"><Disclosure summary="More day-to-day activities"><BulletList items={field.whatPeopleDo!.slice(3)} /></Disclosure></div>}</div>
    </section>
    <div className="grid gap-4 sm:grid-cols-2"><section className="rounded-xl border border-sky-ink/15 bg-sky/40 p-5"><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><GraduationCap aria-hidden className="h-4 w-4 text-sky-ink" />Subjects that help</h3><div className="flex flex-wrap gap-2">{(field.usefulSubjects ?? []).map((s) => <Badge key={s}>{s}</Badge>)}</div></section><section className="rounded-xl border border-butter-ink/15 bg-butter/30 p-5"><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Lightbulb aria-hidden className="h-4 w-4 text-butter-ink" />Skills to build</h3><div className="flex flex-wrap gap-2">{(field.skills ?? []).map((s) => <Badge key={s}>{s}</Badge>)}</div></section></div>
    <Callout title="Curious about the actual work?" tone="forest"><p>Open the <strong>Careers</strong> tab above to explore a role. You don’t need to choose one yet.</p></Callout>
  </div>;
  const careerContent = <section className="cb-panel"><h2 className="cb-panel-title"><BriefcaseBusiness />Explore a kind of work</h2><p className="mb-5 text-sm text-ink-500">See what a day in the role involves, the skills it uses, and its challenges.</p><div className="grid gap-3 xl:grid-cols-2">{careers.map((career) => <LinkRow key={career.slug} href={`/careers/${career.slug}`} title={career.title} description={career.summary} icon={<BriefcaseBusiness className="h-4 w-4" />} accent={fieldVisual(field.slug).accent} action="View career" />)}</div>{!careers.length && <NoCatalogItems />}</section>;
  const studyContent = <div className="space-y-5"><section className="cb-panel"><h2 className="cb-panel-title"><Route />Different routes into this field</h2><div className="space-y-3">{pathways.map((path) => <LinkRow key={path.slug} href={`/pathways/${path.slug}`} title={path.title} description={path.typicalDuration} icon={<Route className="h-4 w-4" />} accent="butter" action="See route" />)}{!pathways.length && <NoCatalogItems href="/pathways" label="Explore all pathways" />}</div></section>
    <Disclosure summary={`Courses to explore (${courses.length})`}><div className="grid gap-3 xl:grid-cols-2">{courses.map((course) => <LinkRow key={course.slug} href={`/courses/${course.slug}`} title={course.name} description={course.durationLabel} icon={<GraduationCap className="h-4 w-4" />} accent="lavender" action="View course" />)}</div></Disclosure>
    <Disclosure summary={`Institutions in Nagaland (${institutions.length})`} hint="Sample listings · confirm course availability"><div className="mb-4"><Badge tone="amber">Sample data — needs verification</Badge></div><div className="space-y-3">{institutions.map((i) => <LinkRow key={i.code} href={`/institutions/${i.code}`} title={i.name} description={i.district} icon={<Building2 className="h-4 w-4" />} accent="sky" action="View college" />)}</div></Disclosure></div>;
  const reflect = <div className="space-y-4">
    <section className="rounded-xl border border-lavender-ink/20 bg-lavender/25 p-5"><h2 className="cb-panel-title"><HeartHandshake />Think it through, without pressure.</h2><p className="text-sm text-ink-600">Open the questions that matter to you. There is no score to pass.</p></section>
    <Disclosure summary="Why are we showing this?" tone="forest">{suggestion?.reasons.length ? <ul className="space-y-3">{suggestion.reasons.map((r, i) => <li key={i}><strong>{FACTOR_LABELS[r.factor]}: </strong>{r.detail}</li>)}</ul> : <p>You chose to explore this field. That curiosity is a useful starting point — not a prediction.</p>}</Disclosure>
    <Disclosure summary="What could make it worthwhile?"><BulletList items={field.pros ?? []} /></Disclosure>
    <Disclosure summary="Why might this NOT be right for me?" tone="amber"><BulletList items={cautions} /></Disclosure>
    <Disclosure summary="What if my situation changes?"><div className="space-y-3">{scenarios.map((s) => <Disclosure key={s.key} summary={s.question}><p className="mb-3">{s.answer}</p><BulletList items={s.suggestions} /></Disclosure>)}</div></Disclosure>
    <Disclosure summary="What else could I explore?"><BulletList items={field.alternatives ?? []} /><div className="mt-4 space-y-2">{related.map((r) => <LinkRow key={r.slug} href={`/explore/${r.slug}`} title={r.name} icon={<FieldIcon slug={r.slug} className="h-4 w-4" />} action="Explore" />)}</div></Disclosure>
  </div>;
  return <div className="cb-container cb-page">
    <div className="mb-6"><JourneyStepper current={1} /></div>
    <DetailHeader eyebrow="Step 2 · Explore paths" title={field.name} description={field.tagline} icon={<FieldIcon slug={field.slug} className="h-6 w-6" />} accent={fieldVisual(field.slug).accent} actions={<><ButtonLink href="#pathways">See study routes<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink><SaveButton itemType="field" itemRef={field.slug} label={field.name} /></>} />
    <div className="mb-5 rounded-xl border border-forest-200 bg-mint/45 p-4 text-sm text-ink-700"><strong className="text-forest-800">Start here:</strong> understand the kind of work first. When you are ready, open <strong>Routes to enter</strong> to see courses, pathways and colleges.</div>
    <div className="cb-detail-content"><DetailTabs tabs={[{ id: "overview", label: "Understand this field", content: overview }, { id: "careers", label: "Possible careers", content: careerContent }, { id: "pathways", label: "Routes to enter", content: studyContent }, { id: "reflect", label: "Think it through", content: reflect }]} />
      <aside className="cb-detail-aside"><NextStepPanel title="See how you could get there." text="Compare the routes before choosing a course. Degrees aren’t the only option." href={`/pathways?field=${field.slug}`} cta="Find a pathway" mentorQuestion={`Help me explore ${field.name}, including reasons it might not suit me.`} />
        <section className="rounded-xl border border-ink-200 bg-white p-5"><h2 className="mb-2 flex items-center gap-2 text-sm font-semibold"><ShieldCheck aria-hidden className="h-4 w-4 text-forest-700" />About this information</h2><p className="text-xs leading-relaxed text-ink-500">General CareerBridge guidance. Course and institution pages show their own sources and verification status.</p></section>
      </aside></div>
  </div>;
}
