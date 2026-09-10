import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Bookmark, Check, ClipboardList, Compass, MessageCircle, Route, User, Wallet } from "lucide-react";
import { ButtonLink, Callout, Disclosure, Eyebrow, ProgressDots } from "@/components/ui";
import { LinkRow } from "@/components/detail-parts";
import { FieldIcon, fieldVisual } from "@/components/field-visuals";
import { getCurrentUser } from "@/auth";
import { getSessionState, progressFor } from "@/services/profile";
import { hrefForItem, listPlans, listSaved } from "@/services/student";
import { suggestFields, suggestPathways } from "@/recommendation/engine";
import { getScholarships } from "@/services/catalog";
import { images } from "@/lib/images";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your dashboard" };
export default async function DashboardPage() {
  const user = await getCurrentUser(); if (!user) redirect("/sign-in?next=/dashboard");
  const [state, saved, plans, scholarships] = await Promise.all([getSessionState(), listSaved(user.id).catch(() => []), listPlans(user.id).catch(() => []), getScholarships({})]);
  const fields = state ? await suggestFields(state.snapshot, 3) : [];
  const paths = state ? await suggestPathways(state.snapshot, 2) : [];
  const progress = state ? progressFor(state.stage, state.snapshot.answeredKeys) : { answered: 0, total: 8 };
  const savedCourses = saved.filter((s) => s.itemType === "course");
  const next = !state ? { title: "Let’s find your starting points.", text: "Eight short questions. No right or wrong answers.", href: "/start", cta: "Start my profile" } : progress.answered < progress.total ? { title: "Pick up where you left off.", text: `${progress.total - progress.answered} questions left in your conversation.`, href: "/counselling", cta: "Continue my conversation" } : savedCourses.length >= 2 ? { title: "Look at your options side by side.", text: "Compare two saved courses before narrowing your shortlist.", href: `/compare?type=course&a=${savedCourses[0].itemRef}&b=${savedCourses[1].itemRef}`, cta: "Compare my courses" } : plans.length ? { title: "One small step closer.", text: "Open your checklist and choose the next task to work on.", href: "/action-plan", cta: "Open my action plan" } : { title: "Choose something to explore.", text: "Your profile is ready. Start with a field that makes you curious.", href: "/profile", cta: "Explore my starting points" };
  return <div className="cb-container cb-page">
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><Eyebrow>Your space, your pace</Eyebrow><h1 className="cb-page-title mt-3">Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}.</h1><p className="mt-2 text-sm text-ink-500">You don’t have to figure it all out today.</p></div><ButtonLink href="/mentor" variant="secondary"><MessageCircle aria-hidden className="h-4 w-4" />Ask Mentor</ButtonLink></header>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-6"><section className="grid overflow-hidden rounded-2xl border border-forest-300 bg-mint/65 md:grid-cols-[minmax(0,1fr)_minmax(0,.65fr)]"><div className="p-6 sm:p-8"><span className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700"><Compass aria-hidden className="h-4 w-4" />Your next step</span><h2 className="text-2xl font-semibold">{next.title}</h2><p className="mt-3 text-sm leading-relaxed text-ink-600">{next.text}</p><ButtonLink href={next.href} className="mt-6">{next.cta}<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink></div><div className="relative hidden min-h-60 md:block"><Image src={images.nagalandHills} alt="A quiet view of green hills" fill placeholder="blur" sizes="(max-width: 1024px) 30vw, 22vw" className="object-cover" /></div></section>
        <section className="cb-panel"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="cb-panel-title mb-0"><User />Your profile</h2><Link href="/profile" className="cb-source text-sm">Review & edit<ArrowRight aria-hidden className="h-3.5 w-3.5" /></Link></div><div className="mt-5 flex flex-wrap items-center gap-4"><ProgressDots total={progress.total} current={progress.answered} label="Profile questions completed" /><span className="text-xs text-ink-500">{progress.answered} of {progress.total} answered</span></div><div className="mt-5 grid grid-cols-2 gap-3"><LinkRow href="/saved" title={`${saved.length} saved items`} icon={<Bookmark className="h-4 w-4" />} accent="lavender" action="Open" /><LinkRow href="/action-plan" title={`${plans.length} action plans`} icon={<ClipboardList className="h-4 w-4" />} accent="butter" action="Open" /></div></section>
        <section className="cb-panel"><h2 className="cb-panel-title"><ClipboardList />Your checklist</h2>{plans.length ? <div className="space-y-3">{plans.slice(0, 3).map(({ plan, items }) => <LinkRow key={plan.id} href="/action-plan" title={plan.title} description={`${items.filter((i) => i.status === "done").length} of ${items.length} complete · ${items.find((i) => i.status !== "done")?.label ?? "All steps checked"}`} icon={<Check className="h-4 w-4" />} action="Continue" />)}</div> : <><p className="mb-4 text-sm text-ink-500">When a route interests you, turn it into a simple action plan.</p><ButtonLink href="/pathways" variant="secondary">Explore pathways<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink></>}</section>
      </div>
      <aside className="space-y-5"><section className="rounded-2xl border border-lavender-ink/20 bg-lavender/25 p-5 sm:p-6"><h2 className="cb-panel-title"><Compass />Pick up your exploration</h2><div className="space-y-3">{fields.map((s) => <LinkRow key={s.field.slug} href={`/explore/${s.field.slug}`} title={s.field.name} description="Open to see careers, routes and reasons to explore" icon={<FieldIcon slug={s.field.slug} className="h-4 w-4" />} accent={fieldVisual(s.field.slug).accent} action="Explore" />)}</div><ButtonLink href="/explore" variant="secondary" className="mt-4 w-full">Browse all fields<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink></section>
        <Disclosure summary={`Saved for later (${saved.length})`}><div className="space-y-2">{saved.slice(0, 6).map((item) => <LinkRow key={item.id} href={hrefForItem(item.itemType, item.itemRef)} title={item.label ?? item.itemRef} description={item.itemType} action="Open" />)}{!saved.length && <p>No saved items yet. Use the lavender Save for later buttons as you explore.</p>}</div></Disclosure>
        {!!paths.length && <Disclosure summary="Routes from your stage"><div className="space-y-3">{paths.map(({ pathway }) => <LinkRow key={pathway.slug} href={`/pathways/${pathway.slug}`} title={pathway.title} icon={<Route className="h-4 w-4" />} accent="butter" action="View route" />)}</div></Disclosure>}
        <Disclosure summary="Funding & dates to check"><p className="mb-4">No current deadlines have been verified. Use the official source links on these pages.</p><div className="space-y-3">{scholarships.slice(0, 2).map((s) => <LinkRow key={s.slug} href={`/scholarships#${s.slug}`} title={s.name} icon={<Wallet className="h-4 w-4" />} accent="butter" action="Check" />)}<LinkRow href="/exams" title="Entrance examination portals" action="See dates" /></div></Disclosure>
      </aside>
    </div>
  </div>;
}
