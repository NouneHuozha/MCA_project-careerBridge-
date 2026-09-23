import Link from "next/link";
import { ArrowRight, Check, Compass, FileText, HeartHandshake, ListChecks, MapPin, Route, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/components/ui";

type JourneyKey = "start" | "counselling" | "possibilities" | "explore" | "pathways" | "study" | "plan" | "mentor";

const steps: { key: JourneyKey; label: string; detail: string; href: string; icon: typeof Compass }[] = [
  { key: "start", label: "Start here", detail: "Begin your journey", href: "/start", icon: Sparkles },
  { key: "counselling", label: "Tell us about you", detail: "Interests and strengths", href: "/counselling", icon: HeartHandshake },
  { key: "possibilities", label: "My possibilities", detail: "See what may fit", href: "/profile", icon: Compass },
  { key: "explore", label: "Explore a direction", detail: "Learn about options", href: "/explore", icon: Route },
  { key: "study", label: "Find study options", detail: "Courses and places", href: "/institutions", icon: MapPin },
  { key: "plan", label: "My plan", detail: "Take one next step", href: "/dashboard", icon: ListChecks },
];

export function JourneyRail({ active, compact = false }: { active: JourneyKey; compact?: boolean }) {
  const activeIndex = steps.findIndex((step) => step.key === active);
  return <aside className={cx("journey-rail", compact && "journey-rail-compact")} aria-label="Your journey"><div className="journey-rail-inner"><div className="journey-rail-brand"><span className="journey-rail-mark"><Compass aria-hidden className="h-4 w-4" /></span><div><p className="text-sm font-bold text-ink-900">Your journey</p><p className="mt-1 text-xs text-ink-500">One step at a time.</p></div></div><ol className="mt-8 space-y-1">{steps.map((step, index) => { const Icon = step.icon; const done = index < activeIndex; const current = step.key === active; return <li key={step.key}><Link href={step.href} aria-current={current ? "step" : undefined} className={cx("journey-step", current && "journey-step-active", done && "journey-step-done")}><span className="journey-step-marker">{done ? <Check aria-hidden className="h-3.5 w-3.5" /> : <Icon aria-hidden className="h-3.5 w-3.5" />}</span><span className="min-w-0"><span className="block text-sm font-semibold">{step.label}</span><span className="mt-0.5 block text-xs text-ink-500">{step.detail}</span></span></Link></li>; })}</ol><div className="journey-rail-note"><p className="text-xs font-semibold text-forest-800">You’re doing great.</p><p className="mt-1 text-xs leading-relaxed text-ink-500">Your direction can change as you learn more.</p></div></div></aside>;
}

export function WorkspacePage({ active, children, className }: { active: JourneyKey; children: ReactNode; className?: string }) {
  return <div className={cx("cb-container cb-page workspace-page", className)}><JourneyRail active={active} /><main className="workspace-main">{children}</main></div>;
}

export function WorkspaceBack({ href = "/profile", label = "Back to My possibilities" }: { href?: string; label?: string }) { return <Link href={href} className="workspace-back"><ArrowRight aria-hidden className="h-3.5 w-3.5 rotate-180" />{label}</Link>; }

export function WorkspaceEyebrow({ children }: { children: ReactNode }) { return <p className="workspace-eyebrow">{children}</p>; }
