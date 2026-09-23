import Link from "next/link";
import { Logo } from "@/components/logo";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/explore", label: "Career fields" },
      { href: "/pathways", label: "Pathways" },
      { href: "/courses", label: "Courses" },
      { href: "/institutions", label: "Institutions" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/exams", label: "Entrance exams" },
      { href: "/scholarships", label: "Scholarships" },
      { href: "/opportunities", label: "Skills" },
      { href: "/how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/dashboard", label: "My plan" },
      { href: "/saved", label: "Saved" },
      { href: "/mentor", label: "Mentor" },
      { href: "/about", label: "About" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ink-100 bg-white">
      <div className="cb-container grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
            Career and education guidance for students in Nagaland.
          </p>
          <p className="cb-hand mt-4 text-xl">Guide, don&apos;t decide.</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-[12px] font-bold text-mint-ink">
            For Class 10 &amp; 12 students
          </p>
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-400">{column.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link className="font-medium text-ink-600 transition-colors hover:text-forest-700" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-ink-200 bg-forest-50">
        <div className="cb-container flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-ink-500">
          <p>CareerBridge · Made for your next step.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/how-it-works" className="font-semibold text-forest-700 hover:underline">How it works</Link>
            <Link href="/about" className="font-semibold text-forest-700 hover:underline">Our approach →</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
