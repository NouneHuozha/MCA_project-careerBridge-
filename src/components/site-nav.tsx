"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Award, Bell, Bookmark, Building2, ChevronDown, Compass, FileText, GraduationCap, LayoutDashboard, MessageCircle, Route, PencilRuler, Menu, X, ArrowRight, BookOpen, Info, Sparkles, Search, Wallet } from "lucide-react";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { ButtonLink, cx } from "@/components/ui";

type NavUser = { name: string | null; email: string } | null;

const exploreMenu = [
  { href: "/explore", label: "Areas to explore", detail: "Start with something that interests you", icon: Compass, color: "bg-mint text-mint-ink" },
  { href: "/pathways", label: "Ways to get there", detail: "Compare different routes", icon: Route, color: "bg-butter text-butter-ink" },
  { href: "/courses", label: "Courses", detail: "Degrees, diplomas and trades", icon: GraduationCap, color: "bg-lavender text-lavender-ink" },
  { href: "/institutions", label: "Schools and colleges", detail: "Find places to study in Nagaland", icon: Building2, color: "bg-sky text-sky-ink" },
  { href: "/exams", label: "Entrance exams", detail: "Requirements and official sources", icon: FileText, color: "bg-sky text-sky-ink" },
  { href: "/scholarships", label: "Scholarships", detail: "Help with study costs", icon: Award, color: "bg-peach text-peach-ink" },
  { href: "/opportunities", label: "Skills and opportunities", detail: "Small steps you can start now", icon: PencilRuler, color: "bg-mint text-mint-ink" },
];

const secondaryLinks = [
  { href: "/how-it-works", label: "How it works", icon: BookOpen },
  { href: "/about", label: "About", icon: Info },
];

const primaryNav = [
  { href: "/explore", label: "Explore" },
  { href: "/pathways", label: "Pathways" },
  { href: "/courses", label: "Courses" },
  { href: "/institutions", label: "Institutions" },
];

export function SiteNav({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);
  const exploreButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) setExploreOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExploreOpen(false);
        setMobileOpen(false);
        if (exploreOpen) exploreButton.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [exploreOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const closeAll = () => { setMobileOpen(false); setExploreOpen(false); };
  const progressHref = user ? "/dashboard" : "/profile";
  const progressLabel = user ? "My plan" : "Start here";
  const initials = user?.name ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() : "CB";

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-canvas/92 shadow-[0_1px_0_#1c634b08] backdrop-blur-md">
      <div className="cb-container flex h-[72px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-5 2xl:gap-10">
          <Logo />
          <form action="/explore" className="relative hidden lg:block" role="search">
            <label htmlFor="nav-search" className="sr-only">Search careers, courses, institutions</label>
            <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              id="nav-search"
              name="q"
              placeholder="Search careers, courses…"
              className="w-52 rounded-full border border-ink-200 bg-white/90 py-2 pl-9 pr-3 text-[13px] outline-none transition-all placeholder:text-ink-400 focus:w-64 focus:border-forest-400 xl:w-60 xl:focus:w-72"
            />
          </form>
          <nav aria-label="Main" className="hidden items-center gap-1 xl:flex 2xl:gap-2">
            <div ref={exploreRef} className="relative">
              <button
                ref={exploreButton}
                type="button"
                onClick={() => setExploreOpen((v) => !v)}
                aria-expanded={exploreOpen}
                aria-controls="explore-menu"
                className={cx(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors",
                  exploreOpen || isActive("/explore") || isActive("/pathways") || isActive("/courses") || isActive("/institutions")
                    ? "border-forest-300 bg-mint text-forest-800"
                    : "border-transparent text-ink-700 hover:border-forest-200 hover:bg-forest-50",
                )}
              >
                <Compass aria-hidden className="h-4 w-4" />
                Explore
                <ChevronDown aria-hidden className={cx("h-4 w-4 transition-transform", exploreOpen && "rotate-180")} />
              </button>
              {exploreOpen && (
                <div id="explore-menu" className="animate-rise absolute left-0 top-[calc(100%+0.9rem)] w-[34rem] rounded-2xl border border-forest-200 bg-white p-3 shadow-xl shadow-forest-900/10">
                  <p className="px-3 pb-2 text-xs font-extrabold uppercase tracking-[.14em] text-forest-700">Choose what you want to look at</p>
                  <div className="grid grid-cols-2 gap-1">
                    {exploreMenu.map((item) => (
                      <Link key={item.href} href={item.href} onClick={closeAll} className="flex items-start gap-3 rounded-xl p-3 hover:bg-forest-50">
                        <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-xl", item.color)}>
                          <item.icon aria-hidden className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-ink-900">{item.label}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-ink-500">{item.detail}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link href="/start" onClick={closeAll} className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-forest-200 bg-mint p-3 text-sm font-bold text-forest-800">
                    Not sure where to begin? Start with a conversation
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
            <Link href="/scholarships" className={cx("inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-bold transition-colors", isActive("/scholarships") ? "border-forest-300 bg-mint text-forest-800" : "border-transparent text-ink-700 hover:bg-forest-50")}>Scholarships</Link>
            <Link href={progressHref} aria-current={isActive(progressHref) ? "page" : undefined} className={cx("inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors", isActive(progressHref) ? "border-forest-300 bg-mint text-forest-800" : "border-transparent text-ink-700 hover:bg-forest-50")}>
              {user ? <LayoutDashboard aria-hidden className="h-4 w-4" /> : <Bookmark aria-hidden className="h-4 w-4" />}
              {progressLabel}
            </Link>
            <Link href="/mentor" aria-current={isActive("/mentor") ? "page" : undefined} className={cx("inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors", isActive("/mentor") ? "border-forest-300 bg-mint text-forest-800" : "border-transparent text-ink-700 hover:bg-forest-50")}>
              <MessageCircle aria-hidden className="h-4 w-4" />
              Ask Mentor
            </Link>
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <span className="hidden items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-500 2xl:inline-flex">
            <Sparkles aria-hidden className="h-3.5 w-3.5 text-butter-ink" />
            Class 10 · Nagaland
          </span>
          <button type="button" aria-label="Notifications (none)" className="relative grid h-10 w-10 place-items-center rounded-full border border-ink-200 bg-white text-ink-500 hover:border-forest-300 hover:text-forest-700">
            <Bell aria-hidden className="h-4 w-4" />
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile" className="cb-button border border-forest-200 bg-mint/70 px-3 py-2 text-sm text-forest-800">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-forest-700 text-[10px] font-extrabold text-white">{initials}</span>
                <span className="max-w-24 truncate">{user.name?.split(" ")[0] ?? "My profile"}</span>
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ButtonLink href="/sign-in" variant="ghost" size="sm">Sign in</ButtonLink>
              <ButtonLink href="/start" size="sm">
                Start here
                <ArrowRight aria-hidden className="h-4 w-4" />
              </ButtonLink>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          {!user && (
            <ButtonLink href="/start" size="sm" className="hidden sm:inline-flex">Start here</ButtonLink>
          )}
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileOpen((v) => !v)}
            className="cb-button cb-button-secondary h-11 w-11"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="animate-rise border-t border-ink-100 bg-white xl:hidden">
          <nav aria-label="Mobile" className="cb-container cb-scroll max-h-[75dvh] py-5">
            <p className="cb-eyebrow mb-3">Your next step</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Link href="/start" onClick={closeAll} className="flex items-center gap-3 rounded-xl border border-forest-200 bg-mint p-3 text-sm font-bold text-forest-800">
                <Sparkles aria-hidden className="h-4 w-4" />Start here
              </Link>
              <Link href={progressHref} onClick={closeAll} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-3 text-sm font-bold">
                <Bookmark aria-hidden className="h-4 w-4 text-forest-700" />{progressLabel}
              </Link>
              <Link href="/mentor" onClick={closeAll} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-3 text-sm font-bold">
                <MessageCircle aria-hidden className="h-4 w-4 text-forest-700" />Ask Mentor
              </Link>
            </div>
            <details className="mt-5 rounded-xl border border-ink-200 bg-white">
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-bold text-ink-800">
                Browse all options
                <ChevronDown aria-hidden className="h-4 w-4" />
              </summary>
              <div className="grid grid-cols-2 gap-2 border-t border-ink-100 p-3">
                {exploreMenu.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeAll} className="flex items-center gap-2 rounded-xl border border-ink-200 p-3 text-[13px] font-bold">
                    <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-lg", item.color)}>
                      <item.icon aria-hidden className="h-4 w-4" />
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 px-1 text-sm">
              <Link href="/scholarships" onClick={closeAll} className="cb-source">
                <Wallet aria-hidden className="h-4 w-4" />
                Scholarships
              </Link>
              {secondaryLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={closeAll} className="cb-source">
                  <link.icon aria-hidden className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3 border-t border-ink-100 pt-4">
              {user ? (
                <SignOutButton className="w-full" />
              ) : (
                <ButtonLink href="/sign-in" onClick={closeAll} variant="secondary" className="w-full">Sign in</ButtonLink>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
