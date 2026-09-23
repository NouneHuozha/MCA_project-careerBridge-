import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, GraduationCap, MapPin, MessageCircle, Route, ShieldCheck } from "lucide-react";
import { ButtonLink, Eyebrow, SectionHeading, accentSurface } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { GuidanceCompass } from "@/components/guidance-compass";
import { FieldIcon, fieldVisual } from "@/components/field-visuals";
import { getFields } from "@/services/catalog";

export const dynamic = "force-dynamic";

const steps = [
  { number: "01", icon: Compass, accent: "mint" as const, title: "Tell us where you are", text: "Class 10 or Class 12? We’ll ask only the questions that help you begin." },
  { number: "02", icon: BookOpen, accent: "butter" as const, title: "Notice what fits", text: "Explore areas, work, subjects and different ways to get there—without being told what to choose." },
  { number: "03", icon: Route, accent: "lavender" as const, title: "Take one next step", text: "Save, compare or make a small plan when something feels worth looking into." },
];

export default async function HomePage() {
  const fields = await getFields();
  return <>
    <section className="relative overflow-hidden border-b border-ink-200 bg-[#f4f7ef]">
      <div aria-hidden className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-mint/70 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 left-[30%] h-80 w-80 rounded-full bg-butter/35 blur-3xl" />
      <div className="cb-container relative grid items-center gap-12 py-12 lg:min-h-[650px] lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:py-16 2xl:min-h-[720px]">
        <div className="max-w-2xl">
          <div className="animate-rise flex flex-wrap items-center gap-3"><Eyebrow>Career and education guidance · Nagaland</Eyebrow><span className="rounded-full border border-forest-200 bg-white/70 px-3 py-1 text-xs font-semibold text-forest-700">For Class 10 &amp; 12</span></div>
          <h1 className="animate-rise delay-1 mt-6 max-w-[14ch] text-[clamp(2.7rem,5.4vw,5.6rem)] font-semibold leading-[1.03] tracking-[-.055em]">Your path is yours <span className="text-forest-700">to shape.</span></h1>
          <p className="animate-rise delay-2 mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-600">Career choices become easier to think about when you understand what interests you, what matters to you and what options are actually available.</p>
          <div className="animate-rise delay-3 mt-8 flex flex-wrap items-center gap-3">
            <Link href="/start" className="cb-button cb-cta-650 cb-button-primary px-6 py-3.5 text-base">Start exploring<ArrowRight aria-hidden className="h-5 w-5" /></Link>
            <Link href="/how-it-works" className="cb-button cb-button-secondary px-5 py-3.5">See how it works</Link>
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-ink-500"><ShieldCheck aria-hidden className="h-4 w-4 text-forest-600" />No right answer. No career chosen for you.</p>
        </div>
        <div className="relative min-w-0 lg:pl-8">
          <div aria-hidden className="absolute -left-2 top-6 hidden h-24 w-24 rounded-[2rem] bg-lavender sm:block" />
          <div aria-hidden className="absolute -bottom-5 right-0 h-32 w-32 rounded-full bg-butter/80" />
          <div className="relative mx-auto aspect-[1.08] max-w-[650px] overflow-hidden rounded-[2rem] border-8 border-white bg-white shadow-[0_24px_70px_-35px_#19382f70] sm:aspect-[1.25]">
            <Image src="/images/hero-student.png" alt="A student taking a thoughtful pause at her study desk" fill priority sizes="(max-width: 1024px) 92vw, 48vw" className="object-cover" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[270px]"><p className="text-xs font-bold uppercase tracking-[.14em] text-forest-700">Your journey</p><p className="mt-1 text-sm font-semibold leading-relaxed text-ink-900">Understand yourself → explore options → decide at your own pace.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section className="cb-container py-14 sm:py-18" aria-labelledby="how-starts">
      <SectionHeading eyebrow="A simple place to begin" title="You do not need to have it all figured out." description="CareerBridge helps you take the next useful step—one question, one possibility and one decision at a time." />
      <div id="how-starts" className="mt-8 grid gap-3 md:grid-cols-3">{steps.map((step, index) => <Reveal key={step.number} delay={index * 80}><article className="relative h-full rounded-2xl border border-ink-200 bg-white p-6"><div className="flex items-center justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl ${accentSurface[step.accent]}`}><step.icon aria-hidden className="h-5 w-5" /></span><span className="text-sm font-bold text-ink-300">{step.number}</span></div><h2 className="mt-6 text-lg font-semibold">{step.title}</h2><p className="mt-2 text-sm leading-relaxed text-ink-500">{step.text}</p></article></Reveal>)}</div>
    </section>

    <section className="border-y border-ink-200 bg-white" aria-labelledby="principle">
      <div className="cb-container grid items-center gap-10 py-14 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:py-18"><div><Eyebrow>Our promise</Eyebrow><h2 id="principle" className="mt-4 max-w-[16ch] text-[clamp(2rem,3.4vw,3.4rem)] font-semibold">Guide, don’t decide.</h2><p className="mt-5 max-w-md text-base leading-relaxed text-ink-600">We’ll help you understand fields, courses, institutions and routes. The decision stays yours.</p><ButtonLink href="/start" className="mt-7">Begin with a conversation<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink></div><div className="rounded-[1.5rem] border border-forest-200 bg-mint/35 p-4 sm:p-7"><GuidanceCompass /></div></div>
    </section>

    <section className="cb-container py-14 sm:py-18" aria-labelledby="browse-title"><div className="flex flex-wrap items-end justify-between gap-5"><SectionHeading eyebrow="If you already have a question" title="You can look around too." description="Explore an area, compare routes or find institutions in Nagaland. You can come back to the guided journey whenever you like." /><ButtonLink href="/explore" variant="secondary">Browse all areas<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{fields.slice(0, 8).map((field) => <Link href={`/explore/${field.slug}`} key={field.slug} className="cb-link-row group"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accentSurface[fieldVisual(field.slug).accent]}`}><FieldIcon slug={field.slug} /></span><span className="text-sm font-semibold text-ink-800">{field.name}</span><ArrowRight aria-hidden className="link-arrow" /></Link>)}</div></section>

    <section className="cb-container pb-16"><div className="grid overflow-hidden rounded-[1.5rem] border border-sky-ink/20 bg-sky/35 lg:grid-cols-[minmax(0,1fr)_minmax(0,.72fr)]"><div className="p-7 sm:p-10"><div className="flex items-center gap-2 text-sm font-semibold text-sky-ink"><MessageCircle aria-hidden className="h-4 w-4" />Still unsure?</div><h2 className="mt-4 max-w-[22ch] text-2xl font-semibold sm:text-3xl">You can talk it through before choosing.</h2><p className="mt-4 max-w-md text-base leading-relaxed text-ink-600">Ask the mentor a question, or start with the short conversation when you are ready.</p><div className="mt-7 flex flex-wrap gap-3"><ButtonLink href="/mentor">Ask Mentor<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink><ButtonLink href="/start" variant="secondary">Start here</ButtonLink></div></div><div className="relative hidden min-h-64 lg:block"><Image src="/images/students-campus.jpg" alt="Students walking across a campus" fill sizes="(max-width: 1024px) 0vw, 35vw" className="object-cover" /></div></div></section>
  </>;
}
