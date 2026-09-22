import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, GraduationCap, MapPin, Route, ShieldCheck, Play } from "lucide-react";
import { ButtonLink, Eyebrow, SectionHeading, accentSurface } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { ArrowDoodle, CurveLine, Ridge } from "@/components/decor";
import { GuidanceCompass } from "@/components/guidance-compass";
import { FieldIcon, fieldVisual } from "@/components/field-visuals";
import { getFields } from "@/services/catalog";

export const dynamic = "force-dynamic";
const pills = [
  { href: "/explore", title: "Explore", sub: "career possibilities", icon: Compass, accent: "mint" as const, cls: "left-0 top-[16%]" },
  { href: "/institutions", title: "Find a college", sub: "in Nagaland", icon: MapPin, accent: "lavender" as const, cls: "right-0 top-[38%]" },
  { href: "/courses", title: "See courses", sub: "degrees & diplomas", icon: GraduationCap, accent: "butter" as const, cls: "left-0 top-[61%]" },
];
const pillars = [
  { href: "/start", icon: Compass, accent: "mint" as const, title: "Understand yourself", text: "A short conversation about what makes you, you.", cta: "Get started" },
  { href: "/explore", icon: Route, accent: "butter" as const, title: "Explore possibilities", text: "Find fields and different ways to get there.", cta: "Explore fields" },
  { href: "/action-plan", icon: ShieldCheck, accent: "lavender" as const, title: "Plan your next step", text: "Turn a direction into small, practical actions.", cta: "See next steps" },
];

export default async function HomePage() {
  const fields = await getFields();
  return <>
    <section className="relative isolate overflow-hidden border-b border-ink-200">
      <Ridge className="pointer-events-none absolute -bottom-2 -left-2 -z-10 h-24 w-[36vw] min-w-64 text-forest-100" />
      <div className="cb-container grid min-h-[620px] items-center gap-12 pb-16 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 lg:py-16 2xl:min-h-[740px]">
        <div className="min-w-0">
          <Eyebrow className="animate-rise">Career & education guidance · Nagaland</Eyebrow>
          <h1 className="animate-rise delay-1 mt-5 max-w-[13.8ch] text-[clamp(2.5rem,4.1vw,5.1rem)] font-semibold leading-[1.08] tracking-[-.045em]">Your path is yours.<br /><span className="text-forest-700">We help you</span> understand it.</h1>
          <p className="animate-rise delay-2 mt-6 max-w-[48ch] text-base leading-relaxed text-ink-500 lg:text-lg">Answer a few questions about yourself, then explore fields and routes worth considering. You stay in control of the decision.</p>
          <div className="animate-rise delay-3 mt-8 flex flex-wrap gap-3"><ButtonLink href="/start" size="lg">Start with a few questions<ArrowRight aria-hidden className="h-5 w-5" /></ButtonLink><ButtonLink href="/explore" variant="secondary" size="lg">Browse options</ButtonLink></div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-500"><span className="flex items-center gap-2"><BookOpen aria-hidden className="h-4 w-4 text-forest-600" />For Class 10 & Class 12</span><span className="flex items-center gap-2"><MapPin aria-hidden className="h-4 w-4 text-forest-600" />Starting with Nagaland</span></div>
        </div>
        <div className="relative min-w-0 pb-6 pt-3">
          <div aria-hidden className="absolute left-[3%] top-0 h-36 w-36 rounded-t-[5rem] rounded-b-[2rem] bg-mint sm:h-52 sm:w-52" />
          <div aria-hidden className="absolute bottom-0 right-[3%] h-36 w-36 rounded-full bg-butter/70" />
          <CurveLine className="pointer-events-none absolute -bottom-6 -right-4 h-28 w-36 text-forest-400" />
          <div className="animate-fade relative mx-auto aspect-[1.22] w-[84%] overflow-hidden rounded-[1.75rem] border-4 border-white shadow-[0_18px_45px_-30px_#19382f50] sm:aspect-[1.27]">
            <Image src="/images/hero-student.png" alt="" fill priority sizes="(max-width: 1024px) 85vw, 43vw" className="object-cover" />
          </div>
          {pills.map((pill, i) => <Link href={pill.href} key={pill.title} className={`cb-pill group absolute z-10 flex items-center gap-2.5 px-2.5 py-2.5 transition-transform hover:-translate-y-1 ${pill.cls}`}>
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${accentSurface[pill.accent]}`}><pill.icon aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.8} /></span>
            <span className="pr-2"><span className="block text-xs font-bold text-ink-900 sm:text-sm">{pill.title}</span><span className="hidden text-xs text-ink-500 sm:block">{pill.sub}</span></span>
            <ArrowRight aria-hidden className={`hidden h-3.5 w-3.5 text-forest-600 ${i % 2 ? "sm:block" : "lg:block"}`} />
          </Link>)}
          <div className="absolute bottom-0 left-[8%] flex items-center gap-1"><ArrowDoodle className="hidden h-12 w-10 text-forest-700 sm:block" /><span className="cb-pill bg-white px-4 py-3 text-xs text-ink-600 sm:text-sm"><strong className="text-ink-900">More than one route.</strong> Your decision.</span></div>
        </div>
      </div>
    </section>
    <section className="bg-white py-7">
      <div className="cb-container mb-4"><p className="cb-eyebrow">Already know what you want?</p><p className="mt-2 text-sm text-ink-500">You can browse without answering the questions.</p></div>
      <div className="cb-container grid gap-4 md:grid-cols-3">{pillars.slice(1).map((pillar, i) => <Reveal key={pillar.title} delay={i * 80}><Link href={pillar.href} className="group flex h-full items-start gap-4 rounded-2xl border border-ink-200 p-5 transition-all hover:-translate-y-1 hover:border-forest-400 lg:p-6">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${accentSurface[pillar.accent]}`}><pillar.icon aria-hidden className="h-5 w-5" /></span><span><span className="block text-base font-semibold text-ink-900">{pillar.title}</span><span className="mt-2 block text-sm leading-relaxed text-ink-500">{pillar.text}</span><span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-forest-700">{pillar.cta}<ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></span>
      </Link></Reveal>)}</div>
    </section>
    <section className="border-y border-ink-200 bg-canvas-deep">
      <div className="cb-container grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <Reveal><Eyebrow>Guide, don’t decide</Eyebrow><h2 className="mt-4 max-w-[20ch] text-[clamp(1.8rem,3vw,3rem)] font-semibold">We don’t choose your career for you.</h2><p className="mt-5 max-w-md text-base leading-relaxed text-ink-500">CareerBridge helps you understand your options. You make the decision.</p><ButtonLink href="/start" className="mt-7">Start with a few questions<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink></Reveal>
        <Reveal delay={100}><GuidanceCompass /></Reveal>
      </div>
    </section>
    <section className="cb-container py-16">
      <div className="flex flex-wrap items-end justify-between gap-5"><SectionHeading eyebrow="Room to be curious" title="You don’t need a plan to begin." description="Pick a field. See what the work is like. Keep your options open." /><ButtonLink href="/explore" variant="secondary">Browse all fields<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink></div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{fields.slice(0, 8).map((field) => <Link href={`/explore/${field.slug}`} key={field.slug} className="cb-link-row group"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accentSurface[fieldVisual(field.slug).accent]}`}><FieldIcon slug={field.slug} /></span><span className="text-sm font-semibold text-ink-800">{field.name}</span><ArrowRight aria-hidden className="link-arrow" /></Link>)}</div>
    </section>
    <section className="cb-container pb-16"><div className="grid overflow-hidden rounded-[1.5rem] border border-forest-200 bg-mint/35 lg:grid-cols-[minmax(0,1fr)_minmax(0,.8fr)]">
      <div className="p-7 sm:p-10 xl:p-14"><Eyebrow>Not sure where to begin?</Eyebrow><h2 className="mt-4 max-w-[26ch] text-2xl font-semibold sm:text-3xl">“I don’t know what to do after Class 10 or 12.”</h2><p className="mt-4 max-w-md text-base text-ink-500">That’s okay. Let’s understand what interests you first.</p><div className="mt-7 flex flex-wrap gap-3"><ButtonLink href="/start">Let’s get started<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink><ButtonLink href="/mentor" variant="secondary">Talk to the mentor</ButtonLink></div></div>
      <div className="relative min-h-60"><Image src="/images/students-campus.jpg" alt="" fill sizes="(max-width: 1024px) 92vw, 44vw" className="object-cover" /></div>
    </div></section>
  </>;
}
