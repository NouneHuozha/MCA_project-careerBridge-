import { redirect } from "next/navigation";
import { GraduationCap, School } from "lucide-react";
import { ArrowGlyph, Button, Eyebrow } from "@/components/ui";
import { Blob, DottedGrid, Sparkle } from "@/components/decor";
import { startSession } from "@/services/profile";
import { questionsForStage, type Stage } from "@/data/counselling";

export const dynamic = "force-dynamic";
export const metadata = { title: "Where are you in your education journey?" };

const stageCards: { stage: Stage; label: string; description: string; opens: string[]; icon: typeof School; accent: string }[] = [
  {
    stage: "class10",
    label: "Class 10",
    description: "I’m in Class 10 or have just finished it",
    opens: ["Streams", "Polytechnic", "ITI trades"],
    icon: School,
    accent: "bg-mint text-mint-ink",
  },
  {
    stage: "class12",
    label: "Class 12",
    description: "I’m in Class 12 or have just finished it",
    opens: ["Degrees", "Entrance exams", "Admissions"],
    icon: GraduationCap,
    accent: "bg-lavender text-lavender-ink",
  },
];

export default async function StartPage({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  const params = await searchParams;
  const preselected = params.stage === "class12" ? "class12" : "class10";
  const count = questionsForStage("class10").length;

  async function begin(formData: FormData) {
    "use server";
    const stage = (formData.get("stage") === "class12" ? "class12" : "class10") as Stage;
    const detail = String(formData.get("stageDetail") ?? "studying");
    await startSession(stage, detail);
    redirect("/counselling");
  }

  return (
    <div className="relative overflow-hidden">
      <Blob className="pointer-events-none absolute -right-24 -top-16 h-72 w-72 text-mint/70" />
      <DottedGrid className="pointer-events-none absolute bottom-24 left-6 hidden h-12 w-24 text-ink-200 lg:block" />

      <div className="cb-container relative max-w-3xl py-14 lg:py-20">
        <div className="animate-rise flex items-center gap-3">
          <Eyebrow>Start with yourself</Eyebrow>
          <span aria-hidden className="h-px flex-1 bg-ink-200" />
          <Sparkle className="h-4 w-4 text-butter-ink/50" />
        </div>

        <h1 className="animate-rise delay-1 mt-5 text-[clamp(2rem,4.5vw,2.8rem)] font-semibold">
          Let’s start with where you are.
        </h1>
        <p className="animate-rise delay-2 mt-4 max-w-lg text-[16px] leading-relaxed text-ink-500">
          Tell us whether you’re exploring what comes after Class 10 or Class 12. We’ll ask a few short questions and help you find options worth exploring.
        </p>

        <div className="animate-rise delay-2 mt-7 grid max-w-xl grid-cols-3 gap-2 text-center text-xs sm:gap-3">
          {["Understand yourself", "Explore possibilities", "Take a next step"].map((label, index) => <div key={label} className={`rounded-xl border px-2 py-3 ${index === 0 ? "border-forest-300 bg-mint text-forest-800" : "border-ink-200 bg-white text-ink-500"}`}><span className="mx-auto mb-1 grid h-6 w-6 place-items-center rounded-full bg-white/80 text-[11px] font-bold text-forest-700">{index + 1}</span>{label}</div>)}
        </div>

        <form action={begin} className="mt-10 space-y-8">
          <fieldset className="animate-rise delay-3">
            <legend className="sr-only">Your current stage</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {stageCards.map((card) => (
                <label
                  key={card.stage}
                  className="group relative cursor-pointer rounded-2xl border border-ink-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-forest-300 has-[:checked]:border-forest-500 has-[:checked]:shadow-[0_16px_36px_-24px_rgba(16,56,42,0.6)]"
                >
                  <input
                    type="radio"
                    name="stage"
                    value={card.stage}
                    defaultChecked={preselected === card.stage}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className="absolute right-5 top-5 grid h-5 w-5 place-items-center rounded-full border border-ink-200 text-[10px] text-transparent transition-colors peer-checked:border-forest-600 peer-checked:bg-forest-600 peer-checked:text-white"
                  >
                    ✓
                  </span>
                  <span aria-hidden className={`grid h-11 w-11 place-items-center rounded-xl ${card.accent}`}>
                    <card.icon className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <span className="mt-4 block text-lg font-semibold text-ink-900">{card.label}</span>
                  <span className="mt-1 block text-sm text-ink-500">{card.description}</span>
                  <span className="mt-4 flex flex-wrap gap-1.5">
                    {card.opens.map((item) => (
                      <span key={item} className="rounded-full bg-canvas-deep px-2.5 py-1 text-[11px] text-ink-500">
                        {item}
                      </span>
                    ))}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="animate-rise delay-4">
            <legend className="mb-3 text-sm font-medium text-ink-700">Which describes you best right now?</legend>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "studying", label: "Still studying" },
                { value: "completed", label: "Completed it" },
                { value: "awaiting_results", label: "Waiting for results" },
              ].map((option, index) => (
                <label
                  key={option.value}
                  className="cursor-pointer rounded-full border border-ink-200 bg-white px-4 py-2.5 text-[13px] text-ink-600 transition-all duration-200 hover:border-forest-300 has-[:checked]:border-forest-500 has-[:checked]:bg-forest-600 has-[:checked]:text-white"
                >
                  <input type="radio" name="stageDetail" value={option.value} defaultChecked={index === 0} className="sr-only" />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="animate-rise delay-5 flex flex-wrap items-center gap-4 border-t border-ink-100 pt-7">
            <Button type="submit" size="lg">
              Continue
              <ArrowGlyph />
            </Button>
            <p className="text-[13px] text-ink-400">
              {count} short questions · about 2 minutes · you can change your answers later
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
