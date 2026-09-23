"use client";

import Link from "next/link";
import { Bell, ChevronDown, Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { ButtonLink, cx } from "@/components/ui";

type NavUser = { name: string | null; email: string } | null;

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/dashboard", label: "Plan" },
  { href: "/courses", label: "Learn" },
  { href: "/institutions", label: "Opportunities" },
];

export function SiteNav({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return <header className="concept-header"><div className="concept-header-inner"><Link href="/" className="concept-logo" aria-label="CareerBridge home"><Logo /></Link><nav className="concept-nav" aria-label="Main">{links.map((link) => <Link key={link.href} href={link.href} className={cx("concept-nav-link", active(link.href) && "concept-nav-link-active")}>{link.label}</Link>)}</nav><div className="concept-header-actions"><button type="button" className="concept-icon-button" aria-label="Search"><Search aria-hidden className="h-[18px] w-[18px]" /></button><span className="concept-header-divider" />{user ? <details className="concept-profile"><summary><span className="concept-avatar">{(user.name ?? "S").slice(0, 1).toUpperCase()}</span><span className="hidden text-left sm:block"><strong>{user.name?.split(" ")[0] ?? "Student"}</strong><small>Class 10 / 12</small></span><ChevronDown aria-hidden className="h-4 w-4" /></summary><div className="concept-profile-menu"><Link href="/profile">My possibilities</Link><Link href="/saved">Saved items</Link><Link href="/mentor">Mentor</Link><SignOutButton /></div></details> : <><Link href="/sign-in" className="hidden text-sm font-semibold text-ink-700 sm:inline">Sign in</Link><ButtonLink href="/start" size="sm">Start here</ButtonLink></>}</div><button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className="concept-menu-button">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>{open && <div className="concept-mobile-menu"><nav aria-label="Mobile main">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={cx("concept-mobile-link", active(link.href) && "concept-mobile-link-active")}>{link.label}</Link>)}<Link href="/mentor" onClick={() => setOpen(false)} className="concept-mobile-link">Mentor</Link>{user ? <Link href="/profile" onClick={() => setOpen(false)} className="concept-mobile-link">My possibilities</Link> : <Link href="/sign-in" onClick={() => setOpen(false)} className="concept-mobile-link">Sign in</Link>}</nav></div>}</header>;
}
