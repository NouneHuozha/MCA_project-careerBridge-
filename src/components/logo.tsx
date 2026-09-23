import Link from "next/link";

/**
 * Wordmark + arch/rings mark used across the redesign.
 * Pure SVG so it stays crisp at every size and matches the reference frames.
 */
export function Logo({ tone = "dark", href = "/", compact = false }: { tone?: "dark" | "light"; href?: string; compact?: boolean }) {
  const ink = tone === "light" ? "text-white" : "text-ink-900";
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5" aria-label="CareerBridge home">
      <span aria-hidden className="grid h-10 w-10 place-items-center rounded-xl bg-forest-700 text-white shadow-[0_6px_16px_-10px_#1c634b] transition-transform duration-300 group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
          <path d="M3.5 17.5c3.6 0 4.2-9 8.5-9s4.9 9 8.5 9" />
          <path d="M12 8.5v9" opacity="0.55" />
        </svg>
      </span>
      <span className={compact ? "hidden sm:block" : undefined}>
        <span className={`block text-[1.15rem] font-extrabold leading-none tracking-[-0.03em] ${ink}`} style={{ fontFamily: "var(--font-display)" }}>
          CareerBridge
        </span>
        {!compact && (
          <span className={`mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.22em] ${tone === "light" ? "text-white/70" : "text-ink-400"}`}>
            Nagaland
          </span>
        )}
      </span>
    </Link>
  );
}
