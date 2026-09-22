"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { CheckSquare, ChevronDown, ChevronRight, Compass, GraduationCap, LayoutDashboard, Menu, MessageCircle, X } from "lucide-react";
import { cx } from "@/components/ui";

type WorkspaceUser = { name: string | null };

type WorkspaceLink = {
  href: string;
  label: string;
  detail: string;
  icon: typeof LayoutDashboard;
  matches: string[];
};

const workspaceLinks: WorkspaceLink[] = [
  {
    href: "/dashboard",
    label: "My progress",
    detail: "See what to do next",
    icon: LayoutDashboard,
    matches: ["/dashboard", "/profile", "/counselling"],
  },
  {
    href: "/recommendations",
    label: "Explore paths",
    detail: "Fields, careers, and routes",
    icon: Compass,
    matches: ["/recommendations", "/explore", "/careers", "/pathways"],
  },
  {
    href: "/courses",
    label: "Find study options",
    detail: "Courses, colleges, tests, and funding",
    icon: GraduationCap,
    matches: ["/courses", "/institutions", "/exams", "/scholarships", "/opportunities"],
  },
  {
    href: "/action-plan",
    label: "Make a plan",
    detail: "Saved items and next steps",
    icon: CheckSquare,
    matches: ["/action-plan", "/saved", "/compare"],
  },
];

function isWorkspaceRoute(pathname: string) {
  return workspaceLinks.some((link) => link.matches.some((route) => pathname === route || pathname.startsWith(`${route}/`))) || pathname.startsWith("/mentor");
}

function isActive(item: WorkspaceLink, pathname: string) {
  return item.matches.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function WorkspaceNavLink({ item, pathname, onNavigate }: { item: WorkspaceLink; pathname: string; onNavigate?: () => void }) {
  const active = isActive(item, pathname);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cx(
        "group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
        active ? "bg-mint text-forest-800 shadow-sm" : "text-ink-700 hover:bg-forest-50",
      )}
    >
      <item.icon aria-hidden className={cx("h-[19px] w-[19px] shrink-0", active ? "text-forest-700" : "text-ink-500 group-hover:text-forest-700")} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{item.label}</span>
        <span className="mt-0.5 block truncate text-[11px] text-ink-500">{item.detail}</span>
      </span>
      {active && <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-forest-600" />}
    </Link>
  );
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-mint/60 px-3 py-2.5">
        <span className="text-xs font-semibold text-forest-800">Start with yourself, one step at a time.</span>
        <Link href="/start" onClick={onNavigate} className="shrink-0 text-[11px] font-bold text-forest-700 underline underline-offset-4">Restart</Link>
      </div>

      <nav aria-label="Student journey" className="space-y-1">
        {workspaceLinks.map((item) => <WorkspaceNavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />)}
      </nav>

      <div className="my-6 border-t border-ink-200" />
      <Link href="/mentor" onClick={onNavigate} className={cx("flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors", pathname.startsWith("/mentor") ? "border-lavender-ink/30 bg-lavender text-lavender-ink" : "border-ink-200 bg-white text-ink-700 hover:border-forest-300 hover:bg-forest-50")}>
        <MessageCircle aria-hidden className="h-[18px] w-[18px]" />
        <span className="flex-1">Ask the Mentor</span>
        <ChevronRight aria-hidden className="h-4 w-4" />
      </Link>

      <div className="mt-4 rounded-xl bg-canvas-deep px-3 py-3 text-xs leading-relaxed text-ink-600">
        <p className="font-semibold text-ink-800">You can change direction.</p>
        <p className="mt-1">Your suggestions are starting points, not final decisions.</p>
      </div>
    </>
  );
}

export function WorkspaceShell({ user, children }: { user: WorkspaceUser; children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!isWorkspaceRoute(pathname)) return <>{children}</>;
  const activeWorkspace = workspaceLinks.find((item) => isActive(item, pathname));

  return (
    <div className="cb-workspace-layout">
      <aside className="cb-workspace-sidebar hidden lg:block" aria-label="Student workspace navigation">
        <div className="sticky top-[92px]">
          <details open className="group rounded-2xl border border-ink-200 bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
              <span><span className="block text-xs font-semibold text-ink-500">Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}</span><span className="mt-1 block text-base font-semibold text-ink-900">{activeWorkspace?.label ?? "Your journey"}</span></span>
              <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full border border-ink-200 bg-ink-50 text-forest-700"><ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></span>
            </summary>
            <div className="border-t border-ink-200 p-3"><SidebarContent pathname={pathname} /></div>
          </details>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="cb-workspace-mobilebar lg:hidden">
          <div>
            <p className="text-xs font-semibold text-ink-500">Your workspace</p>
            <p className="text-base font-semibold text-ink-900">{activeWorkspace?.label ?? "My progress"}</p>
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
