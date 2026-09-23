"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp, MessageCircle, Pencil, RotateCcw } from "lucide-react";
import { Button, Callout, ProgressDots, cx } from "@/components/ui";
import { questionsForStage, type CounsellingQuestion } from "@/data/counselling";
import type { StudentSnapshot } from "@/services/profile";

type Answer = { values: string[]; text: string | null };
type State = { started: boolean; stage: "class10" | "class12"; stageDetail?: string | null; snapshot: StudentSnapshot; question: CounsellingQuestion | null; answers?: Record<string, Answer>; acknowledgement?: string; progress: { answered: number; total: number }; sections: { key: string; label: string }[]; completed: boolean };
type Turn = { role: "mentor" | "student"; text: string };

export function CounsellingExperience({ initial, focusKey }: { initial: State; focusKey?: string }) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const question = state.question;
  const initialAnswer = initial.question ? initial.answers?.[initial.question.key] : undefined;
  const initialOptions = initial.question?.options?.map((o) => o.value) ?? [];
  const [selected, setSelected] = useState<string[]>(initialAnswer?.values.filter((v) => initialOptions.includes(v) || v === "not-sure") ?? []);
  const [other, setOther] = useState(initialAnswer?.values.filter((v) => !initialOptions.includes(v) && v !== "not-sure").join(", ") ?? "");
  const [text, setText] = useState(initialAnswer?.text ?? "");
  const [turns, setTurns] = useState<Turn[]>(() => {
    const history: Turn[] = [];
    if (!focusKey) for (const q of questionsForStage(initial.stage)) {
      const a = initial.answers?.[q.key];
      if (a) history.push({ role: "mentor", text: q.prompt }, { role: "student", text: a.text || a.values.map((v) => q.options?.find((o) => o.value === v)?.label ?? (v === "not-sure" ? "Not sure yet" : v)).join(", ") || "Skipped for now" });
    }
    return [{ role: "mentor", text: focusKey ? "Let’s update this. Your previous answer is selected below." : history.length ? "Welcome back. Your earlier answers are saved." : "Hi! Let’s start with what matters to you. There’s no right answer." }, ...history, ...(initial.question ? [{ role: "mentor" as const, text: initial.question.prompt }] : [{ role: "mentor" as const, text: "Your profile is ready. Choose an area to explore next." }])];
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const confirmReset = useRef<HTMLDialogElement>(null);
  const busy = useRef(false);
  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [turns.length]);

  async function submit(action: "answer" | "skip" | "reset" = "answer", unsure = false) {
    if (busy.current || (!question && action !== "reset")) return;
    const chosen = unsure ? ["not-sure"] : [...selected, ...(other.trim() ? [other.trim()] : [])];
    if (action === "answer" && !chosen.length && !text.trim()) { setError("Choose an option, write your answer, or choose ‘Not sure yet’."); return; }
    busy.current = true; setPending(true); setError(null);
    try {
      const response = await fetch("/api/counselling", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, questionKey: question?.key, values: chosen, text: question?.answerType === "text" ? (unsure ? "Not sure yet" : text.trim()) : null, stage: state.stage }) });
      const next = await response.json() as State & { error?: string };
      if (!response.ok || next.error) { setError(next.error ?? "Couldn’t save. Please try again."); return; }
      if (focusKey && action !== "reset") { router.push("/profile"); router.refresh(); return; }
      setState(next); setSelected([]); setOther(""); setText("");
      if (action === "reset") { setTurns([{ role: "mentor", text: "A fresh start. Your previous answers have been cleared." }, ...(next.question ? [{ role: "mentor" as const, text: next.question.prompt }] : [])]); }
      else {
        const answerText = action === "skip" ? "Skip for now" : question?.answerType === "text" && !unsure ? text : chosen.map((v) => question?.options?.find((o) => o.value === v)?.label ?? (v === "not-sure" ? "Not sure yet" : v)).join(", ");
        setTurns((prev) => [...prev, { role: "student", text: answerText }, { role: "mentor", text: next.question ? `${next.acknowledgement ?? "Thanks."} ${next.question.prompt}` : "That’s all we need. Your next step is to explore a field that makes you curious." }]);
        if (!next.question) {
          const finished = await fetch("/api/counselling", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "complete" }) });
          if (!finished.ok) setError("Your answers are saved. You can open your profile below.");
          else { router.push("/profile"); router.refresh(); }
        }
      }
    } catch { setError("The connection was interrupted. Your earlier answers are safe — try again."); }
    finally { busy.current = false; setPending(false); }
  }
  const total = state.progress.total;
  const done = state.progress.answered;
  const lastAnswered = [...questionsForStage(state.stage)].filter((q) => state.snapshot.answeredKeys.includes(q.key)).at(-1);
  const noted = [{ label: "Subjects", values: state.snapshot.subjectsEnjoy }, { label: "Interests", values: state.snapshot.interests }, { label: "Strengths", values: state.snapshot.strengths }, { label: "Goals", values: state.snapshot.goals }].filter((row) => row.values.length);
  function choose(value: string) {
    setSelected((prev) => question?.answerType === "single" ? (prev.includes(value) ? [] : [value]) : prev.includes(value) ? prev.filter((v) => v !== value) : question?.maxSelections && prev.length >= question.maxSelections ? prev : [...prev.filter((v) => v !== "not-sure"), value]);
  }
  return <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
    <section className="cb-counselling-shell" aria-label="Guided conversation">
      <header className="border-b border-forest-200 bg-mint/65 px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm font-bold text-forest-800"><MessageCircle aria-hidden className="h-4 w-4" />A short conversation about you</span><span className="text-xs font-semibold text-forest-800">{done} of {total}</span></div>
        <div className="mt-2 flex items-center justify-between gap-3"><ProgressDots total={total} current={done} label="Questions answered" /><button type="button" disabled={pending} onClick={() => confirmReset.current?.showModal()} className="flex min-h-8 items-center gap-1.5 text-xs font-semibold text-forest-700 underline underline-offset-4"><RotateCcw aria-hidden className="h-3 w-3" />Start again</button></div>
      </header>
      <div ref={scroller} role="log" tabIndex={0} aria-live="polite" aria-relevant="additions" aria-label="Conversation history — scroll for previous answers" className="cb-scroll space-y-3 bg-[#f4f6ef] p-4 sm:p-6">
        {turns.map((turn, i) => <div key={i} className={cx("flex", turn.role === "student" ? "justify-end" : "justify-start")}><p className={cx("max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%]", turn.role === "student" ? "rounded-br-sm bg-forest-700 text-white" : "rounded-bl-sm border border-ink-200 bg-white text-ink-700")}><span className="sr-only">{turn.role === "student" ? "You: " : "Mentor: "}</span>{turn.text}</p></div>)}
        {pending && <p role="status" className="text-xs text-ink-500">Saving your answer…</p>}
      </div>
      <div className="cb-counselling-composer cb-scroll p-4 sm:p-5">
        {error && <div className="mb-3"><Callout tone="amber"><p role="alert">{error}</p></Callout></div>}
        {question ? <form onSubmit={(event) => { event.preventDefault(); void submit(); }}><fieldset disabled={pending}>
          <legend className="mb-1.5 text-sm font-semibold text-ink-900">{question.prompt}</legend>
          {question.maxSelections && <p className="mb-3 text-xs text-ink-500">Choose up to {question.maxSelections} · {selected.length} selected</p>}
          {question.answerType === "text" ? <><label className="sr-only" htmlFor="counselling-text">Your answer</label><textarea id="counselling-text" rows={2} maxLength={600} value={text} onChange={(e) => setText(e.target.value)} placeholder="In your own words…" className="w-full rounded-xl border border-ink-200 bg-canvas p-3 text-sm" /></> : <div key={question.key} className="flex flex-wrap gap-2">{(question.options ?? []).map((option) => <button type="button" key={option.value} aria-pressed={selected.includes(option.value)} onClick={() => choose(option.value)} className="cb-choice">{selected.includes(option.value) && <Check aria-hidden className="h-3.5 w-3.5" />}{option.label}</button>)}</div>}
          {question.allowOther && <div className="mt-3"><label htmlFor="counselling-other" className="sr-only">Something else</label><input id="counselling-other" value={other} onChange={(e) => setOther(e.target.value)} maxLength={80} placeholder="Something else? Add it here." className="w-full rounded-xl border border-ink-200 bg-canvas px-3 py-2.5 text-sm" /></div>}
          <div className="mt-4 flex flex-wrap items-center gap-2.5"><Button type="submit" disabled={pending}>{pending ? "Saving…" : focusKey ? "Save changes" : done >= total - 1 ? "Finish & see my profile" : "Continue"}<ArrowRight aria-hidden className="h-4 w-4" /></Button><button type="button" onClick={() => void submit("answer", true)} className="cb-button px-2 py-2 text-xs text-forest-700 underline underline-offset-4"><CircleHelp aria-hidden className="h-3.5 w-3.5" />Not sure yet</button>{question.allowSkip && <button type="button" onClick={() => void submit("skip")} className="text-xs font-semibold text-ink-500 underline underline-offset-4">Skip</button>}</div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500">{lastAnswered && !focusKey ? <Link href={`/counselling?edit=${lastAnswered.key}`} className="flex items-center gap-1 font-semibold text-forest-700 underline underline-offset-4"><ArrowLeft aria-hidden className="h-3 w-3" />Change an earlier answer</Link> : <span>You can change this later.</span>}<Link href="/profile" className="font-semibold text-forest-700 underline underline-offset-4">Save and leave</Link></div>
        </fieldset></form> : <div className="rounded-xl bg-mint p-4"><p className="font-semibold text-forest-800">Your starting points are ready.</p><p className="mt-1 text-sm text-ink-600">Review your profile, then pick a field to explore.</p><Button type="button" onClick={() => { router.push("/profile"); router.refresh(); }} className="mt-4">See my profile & explore<ArrowRight aria-hidden className="h-4 w-4" /></Button></div>}
      </div>
    </section>
    <aside className="space-y-4">
      <section className="hidden rounded-2xl border border-forest-200 bg-forest-50 p-5 lg:block"><h2 className="mb-5 text-base font-semibold">A few small steps</h2><ol className="space-y-4">{state.sections.map((section) => {
        const inSection = questionsForStage(state.stage).filter((q) => q.section === section.key);
        const complete = inSection.every((q) => state.snapshot.answeredKeys.includes(q.key));
        const active = question?.section === section.key;
        return <li key={section.key} className="flex items-center gap-3 text-sm"><span aria-hidden className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full border", complete ? "border-forest-600 bg-forest-600 text-white" : active ? "border-forest-500 bg-white text-forest-700" : "border-ink-200 bg-white text-ink-500")}>{complete ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</span><span className={active ? "font-semibold text-forest-800" : "text-ink-600"}>{section.label}</span></li>;
      })}</ol></section>
      <details className="group rounded-2xl border border-lavender-ink/20 bg-lavender/30 p-5" open={false}><summary className="flex list-none items-center justify-between text-sm font-semibold text-lavender-ink">Your answers so far<ChevronDown className="h-4 w-4 group-open:rotate-180" /></summary><div className="mt-4 space-y-4">{noted.length ? noted.map((row) => <div key={row.label}><p className="text-xs font-semibold text-ink-500">{row.label}</p><p className="mt-1 text-sm capitalize text-ink-700">{row.values.map((v) => v.replace(/-/g, " ")).join(" · ")}</p></div>) : <p className="text-sm text-ink-500">Your answers will appear here.</p>}<Link href="/profile" className="cb-source text-xs"><Pencil aria-hidden className="h-3.5 w-3.5" />Review or edit</Link></div></details>
      <Callout tone="forest" title="Just enough to get started"><p>Eight questions. No marks required. No career chosen for you.</p></Callout>
    </aside>
    <dialog ref={confirmReset} className="cb-dialog" aria-labelledby="restart-title"><h2 id="restart-title" className="text-xl font-semibold">Start the conversation again?</h2><p className="mt-3 text-sm text-ink-500">This clears your counselling answers, not your saved items.</p><div className="mt-6 flex gap-3"><Button type="button" variant="secondary" onClick={() => confirmReset.current?.close()}>Keep my answers</Button><Button type="button" onClick={() => { confirmReset.current?.close(); void submit("reset"); }}>Restart</Button></div></dialog>
  </div>;
}
