"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Gamepad2,
  History,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Medal,
  MoreHorizontal,
  Settings,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/game/players/player-avatar";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  { label: "Play / Create Room", icon: Gamepad2, href: "/create-room" },
  { label: "Profile", icon: UserRound, href: "/profile" },
  { label: "Friends", icon: Users },
  { label: "Game History", icon: History },
  { label: "Statistics", icon: BarChart3 },
  { label: "Achievements", icon: Medal },
  { label: "Notifications", icon: Bell },
  { label: "Settings", icon: Settings },
];

export function DashboardBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2.5 font-black tracking-wide text-primary"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <Zap className="size-5 fill-current" aria-hidden="true" />
      </div>
      {!compact && <span>TRIVIA TRAP</span>}
    </Link>
  );
}

export function DashboardSidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await apiFetch("/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      window.location.replace("/");
    } catch {
      setLogoutError("Could not log out. Please try again.");
      setLoggingOut(false);
    }
  }

  return (
    <aside className={cn("flex h-full flex-col bg-[#151519]", className)}>
      <div className="flex h-20 items-center border-b border-white/[0.07] px-6">
        <DashboardBrand />
      </div>

      <nav
        aria-label="Dashboard navigation"
        className="flex-1 space-y-1.5 px-3 py-6"
      >
        {navigation.map((item) => {
          const active = item.href === pathname;
          const content = (
            <>
              <item.icon className="size-[18px]" aria-hidden="true" />
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </>
          );
          const styles = cn(
            "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-bold tracking-[0.02em] transition-colors",
            active
              ? "bg-primary/12 text-primary"
              : "text-[#8f8f99] hover:bg-white/[0.045] hover:text-white",
          );

          return item.href ? (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={styles}
              aria-current={active ? "page" : undefined}
            >
              {content}
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={onNavigate}
              className={styles}
            >
              {content}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.07] p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.035] p-3">
          <span className="relative">
            <PlayerAvatar
              name="Mehdi"
              src="https://blobatar.dev/?via=dailydev"
              size={40}
              animated
            />
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-trap-success ring-2 ring-[#202026]" aria-label="Online" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-white">Mehdi</p>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-trap-success">
              <span className="size-1.5 rounded-full bg-current" /> Online
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Open user menu"
            className="text-[#8f8f99]"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={logout}
          disabled={loggingOut}
          className="mt-2 w-full justify-start gap-3 text-[#8f8f99] hover:bg-trap-danger/10 hover:text-trap-danger"
        >
          {loggingOut ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
          {loggingOut ? "Logging out…" : "Log out"}
        </Button>
        {logoutError && <p role="alert" className="px-3 pt-2 text-xs text-trap-danger">{logoutError}</p>}
      </div>
    </aside>
  );
}
