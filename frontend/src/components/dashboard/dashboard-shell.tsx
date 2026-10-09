"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { DashboardBrand, DashboardSidebar } from "./dashboard-sidebar";
import type { UserData } from "@/types/userData";
import { apiFetch } from "@/lib/api";

export function DashboardShell({ children, user }: { children: React.ReactNode; user?: UserData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!user) return;
    const updatePresence = () => {
      void apiFetch("/users/me/presence", { method: "POST" }).catch(() => {
        // Presence is best-effort and must not interrupt the authenticated UI.
      });
    };
    updatePresence();
    const interval = window.setInterval(updatePresence, 30_000);
    return () => window.clearInterval(interval);
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <DashboardSidebar user={user} className="sticky top-0 hidden h-screen border-r border-white/[0.07] lg:flex" />

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#111114]/95 px-4 backdrop-blur-md lg:hidden">
        <DashboardBrand />
        <Button type="button" variant="surface" size="icon-sm" onClick={() => setMenuOpen(true)} aria-label="Open navigation" aria-expanded={menuOpen}>
          <Menu className="size-4" />
        </Button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Dashboard navigation"
              className="absolute inset-y-0 left-0 w-[min(86vw,300px)] border-r border-white/10 shadow-2xl"
              initial={{ x: reducedMotion ? 0 : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: reducedMotion ? 0 : "-100%" }}
              transition={{ duration: reducedMotion ? 0.01 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <DashboardSidebar user={user} onNavigate={() => setMenuOpen(false)} />
              <Button type="button" variant="surface" size="icon-sm" onClick={() => setMenuOpen(false)} aria-label="Close navigation" className="absolute right-4 top-6">
                <X className="size-4" />
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.main
        initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.42 }}
        className="min-w-0 overflow-hidden"
      >
        <div aria-hidden="true" className="pointer-events-none fixed right-0 top-0 size-[32rem] rounded-full bg-primary/[0.045] blur-[130px]" />
        <div className="relative mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
