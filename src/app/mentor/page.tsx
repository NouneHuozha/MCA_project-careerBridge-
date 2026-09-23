import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { MentorChat, type MentorMessage } from "@/components/mentor-chat";
import { getCurrentUser } from "@/auth";
import { getOrCreateConversation, listMessages } from "@/services/mentor";
import { aiStatus } from "@/ai";
import { ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ask the mentor" };

export default async function MentorPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  let initialMessages: MentorMessage[] = [];
  if (user) { try { const conversation = await getOrCreateConversation(user.id, null); const rows = await listMessages(conversation.id); initialMessages = rows.slice(-30).map((row) => ({ role: row.role as "student" | "mentor", content: row.content, citations: row.citations ?? [], confidence: row.confidence })); } catch { /* empty conversation stays usable */ } }
  return <main className="concept-canvas min-h-[calc(100vh-72px)] bg-[#eef8f5]"><div className="mb-5 flex items-center gap-2 text-xs text-ink-500"><Link href="/dashboard" className="underline underline-offset-4">My plan</Link><ArrowRight className="h-3.5 w-3.5" /><span className="font-bold text-forest-700">Talk to Mentor</span></div><div className="grid items-stretch gap-5 lg:grid-cols-[.9fr_1.1fr]"><section className="relative min-h-[560px] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-mint via-white to-lavender p-7 sm:p-10"><p className="concept-kicker">CareerBridge Mentor</p><h1 className="mt-5 max-w-[11ch] text-4xl font-bold tracking-[-.06em] text-ink-900 sm:text-5xl">Let’s talk it through.</h1><p className="mt-4 max-w-md text-lg leading-relaxed text-ink-600">Ask a question, explore an alternative, or make sense of your options.</p><div className="absolute bottom-0 left-0 right-0 h-[46%]"><Image src="/images/hero-student.png" alt="A friendly mentor helping a student" fill sizes="50vw" className="object-contain object-bottom" /></div><p className="absolute bottom-6 left-7 rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-forest-800 backdrop-blur-sm sm:left-10">The choice stays yours.</p></section><section className="concept-soft-panel flex min-h-[560px] flex-col overflow-hidden border border-mint-ink/15"><div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-mint text-mint-ink"><MessageCircle className="h-4 w-4" /></span><div><p className="text-sm font-bold text-ink-900">Your conversation</p><p className="text-xs text-ink-500">Clear guidance, one question at a time.</p></div></div><div className="min-h-0 flex-1 p-3 sm:p-5"><MentorChat key={params.q ?? "mentor"} initialMessages={initialMessages} initialQuestion={params.q} providerConfigured={aiStatus().configured} /></div>{!user && <p className="border-t border-ink-100 px-5 py-3 text-xs text-ink-500"><Link className="font-bold text-forest-700 underline" href="/sign-in">Sign in to save</Link> your conversation.</p>}</section></div><div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-xl bg-white/75 px-5 py-4"><p className="text-sm text-ink-700">Not sure what to ask?</p><ButtonLink href="/mentor?q=Which%20route%20fits%20after%20Class%2012%3F" variant="secondary" size="sm">Try a question<ArrowRight className="h-4 w-4" /></ButtonLink></div></main>;
}
