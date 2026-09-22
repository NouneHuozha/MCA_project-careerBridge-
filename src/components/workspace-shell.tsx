"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  Award,
  Bookmark,
  CheckSquare,
  ChevronRight,
  Compass,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Route,
  User,
  X,
} from "lucide-react";
import { cx } from "@/components/ui";

type WorkspaceUser = { name: string | null };

type WorkspaceLink = {
  href: string;
  label: string;
  detail?: string;
  icon: typeof LayoutDashboard;
};

const journeyLinks: WorkspaceLink[] = [
  { href: "/dashboard", label: "My progress", detail: "See what to do next", icon: LayoutDashboard },
  { href: "/counselling", label: "Continue counselling", detail: "Keep exploring yourself", icon: Compass },
  { href: "/profile", label: "My suggestions", detail: "Fields and routes to explore", icon: Route },
  { href: "/action-plan", label: "My action plan", detail: "Small steps to take", icon: CheckSquare },
];

const savedLinks: WorkspaceLink[] = [
  { href: "/saved", label: "Saved for later", detail: "Things to revisit", icon: Bookmark },
  { href: "/profile", label: "My profile", detail: "Review or change answers", icon: User },
];

const exploreLinks: WorkspaceLink[] = [
  { href: "/explore", label: "Careers and fields", icon: Compass },
  { href: "/courses", label: "Courses and colleges", icon: GraduationCap },
  { href: "/exams", label: "Exams and scholarships", icon: FileText },
];

function isWorkspaceRoute(pathname: string) {
  return ["/dashboard", "/profile", "/saved", "/action-plan", "/mentor", "/compare", "/counselling"].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function WorkspaceNavLink({ item, pathname, onNavigate }: { item: WorkspaceLink; pathname: string; onNavigate?: () => void }) {
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cx(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
        active ? "bg-mint text-forest-800 shadow-sm" : "text-ink-700 hover:bg-forest-50",
      )}
    >
      <item.icon aria-hidden className={cx("h-[18px] w-[18px] shrink-0", active ? "text-forest-700" : "text-ink-500 group-hover:text-forest-700")} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{item.label}</span>
        {item.detail && <span className="mt-0.5 block truncate text-[11px] text-ink-500">{item.detail}</span>}
      </span>
      {active && <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-forest-600" />}
    </Link>
  );
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="mb-6 rounded-2xl border border-forest-200 bg-gradient-to-br from-mint to-white p-4">
        <p className="cb-eyebrow">Your journey</p>
        <p className="mt-2 text-sm font-semibold text-ink-900">Start with yourself. Take one step at a time.</p>
        <Link href="/start" onClick={onNavigate} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 underline underline-offset-4">
          Begin or restart <ChevronRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-6">
        <nav aria-label="My journey">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.15em] text-ink-400">My journey</p>
          <div className="space-y-1">{journeyLinks.map((item) => <WorkspaceNavLink key={item.href + item.label} item={item} pathname={pathname} onNavigate={onNavigate} />)}</div>
        </nav>
        <nav aria-label="Saved and profile">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.15em] text-ink-400">Keep for later</p>
          <div className="space-y-1">{savedLinks.map((item) => <WorkspaceNavLink key={item.href + item.label} item={item} pathname={pathname} onNavigate={onNavigate} />)}</div>
        </nav>
        <nav aria-label="Explore">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.15em] text-ink-400">Explore</p>
          <div className="space-y-1">{exploreLinks.map((item) => <WorkspaceNavLink key={item.href + item.label} item={item} pathname={pathname} onNavigate={onNavigate} />)}</div>
        </nav>
        <Link href="/mentor" onClick={onNavigate} className={cx("flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors", pathname.startsWith("/mentor") ? "border-lavender-ink/30 bg-lavender text-lavender-ink" : "border-ink-200 bg-white text-ink-700 hover:border-forest-300 hover:bg-forest-50")}>
          <MessageCircle aria-hidden className="h-[18px] w-[18px]" />
          <span className="flex-1">Ask the Mentor</span>
          <ChevronRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}

export function WorkspaceShell({ user, children }: { user: WorkspaceUser; children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!isWorkspaceRoute(pathname)) return <>{children}</>;

  return (
    <div className="cb-workspace-layout">
      <aside className="cb-workspace-sidebar hidden lg:block" aria-label="Student workspace navigation">
        <div className="sticky top-[92px]">
          <div className="mb-5 border-b border-ink-200 pb-4">
            <p className="text-xs font-semibold text-ink-500">Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}</p>
            <p className="mt-1 text-lg font-semibold text-ink-900">Your space, your pace.</p>
          </div>
          <SidebarContent pathname={pathname} />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="cb-workspace-mobilebar lg:hidden">
          <div>
            <p className="text-xs font-semibold text-ink-500">Your workspace</p>
            <p className="text-base font-semibold text-ink-900">My progress</p>
          </div>
          <button type="button" className="cb-button cb-button-secondary h-11 w-11" aria-expanded={mobileOpen} aria-controls="workspace-mobile-nav" aria-label={mobileOpen ? "Close workspace navigation" : "Open workspace navigation"} onClick={() => setMobileOpen((open) => !open)}>
            {mobileOpen ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && <div id="workspace-mobile-nav" className="cb-workspace-mobilemenu lg:hidden"><SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} /></div>}
        {children}
      </div>
    </div>
  );
}
