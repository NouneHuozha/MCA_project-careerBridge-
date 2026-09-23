import Link from "next/link";
import { Check } from "lucide-react";
import { cx } from "@/components/ui";
import { Ridge } from "@/components/decor";

export type JourneyStepState = "done" | "current" | "todo";
export type JourneyStep = {
  label: string;
  detail?: string;
  href?: string;
  state: JourneyStepState;
};

/**
 * Left journey rail from the reference frames: numbered/done dots,
 * a soft gradient panel, and the hill illustration at the bottom.
 */
export function JourneyRail({ title = "Your journey", intro, steps, note }: { title?: string; intro?: string; steps: JourneyStep[]; note?: string }) {
  return (
    <aside className="cb-journey hidden w-[264px] shrink-0 lg:flex lg:flex-col" aria-label={title}>
      <div>
        <p className="text-[1.35rem] font-extrabold leading-tight text-ink-900" style={{ fontFamily: "var(--font-display)" }}>{title}</p>
        {intro && <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">{intro}</p>}
      </div>

      <ol className="mt-2 space-y-1">
        {steps.map((step, index) => {
          const inner = (
            <>
              <span className="cb-journey-dot" aria-hidden>
                {step.state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
              </span>
              <span className="min-w-0 pt-0.35">
                <span className={cx("block text-[13.5px] font-bold leading-snug", step.state === "todo" ? "text-ink-500" : "text-ink-900")}>
                  {step.label}
                </span>
                {step.detail && <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-400">{step.detail}</span>}
              </span>
            </>
          );
          const stateClass = cx("cb-journey-step", step.state === "current" && "shadow-sm");
          return (
            <li key={step.label} className={stateClass} data-state={step.state} aria-current={step.state === "current" ? "step" : undefined}>
              {step.href && step.state !== "current" ? (
                <Link href={step.href} className="flex w-full items-start gap-3">{inner}</Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-auto pt-8">
        <div aria-hidden className="text-forest-300/70">
          <Ridge className="h-16 w-full" />
        </div>
        {note && <p className="mt-3 text-[12px] leading-snug text-ink-400">{note}</p>}
      </div>
    </aside>
  );
}

/** Horizontal journey strip used on pathways-style pages. */
export function JourneyStrip({ title = "Your journey", steps, aside }: { title?: string; steps: { label: string; active?: boolean }[]; aside?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-ink-100 bg-white/70 px-4 py-3 sm:px-6">
      <span className="text-sm font-extrabold text-ink-900" style={{ fontFamily: "var(--font-display)" }}>{title}</span>
      <ol className="flex flex-1 flex-wrap items-center gap-x-1 gap-y-1">
        {steps.map((step, index) => (
          <li key={step.label} className="flex items-center">
            <span className={cx("rounded-full px-3 py-1.5 text-[13px] font-bold", step.active ? "bg-mint text-forest-800 underline decoration-forest-500 decoration-2 underline-offset-4" : "text-ink-400")}>
              {step.label}
            </span>
            {index < steps.length - 1 && <span aria-hidden className="mx-0.5 h-px w-5 bg-ink-200" />}
          </li>
        ))}
      </ol>
      {aside && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-mint px-3 py-1.5 text-[12px] font-bold text-forest-800">
          {aside}
        </span>
      )}
    </div>
  );
}
