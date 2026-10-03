import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/login-page";

export const metadata: Metadata = {
  title: "Sign in | Trivia Trap",
  description: "Sign in to Trivia Trap and get back in the game.",
  robots: { index: false, follow: false },
  referrer: process.env.NODE_ENV === "development"
    ? "no-referrer-when-downgrade"
    : "strict-origin-when-cross-origin",
};

export default async function Page({ searchParams }: {
  searchParams: Promise<{ mode?: string; passwordReset?: string }>;
}) {
  const { mode, passwordReset } = await searchParams;
  const initialMode = mode === "reset-password" ? "new-password" : "login";

  return (
    <LoginPage
      key={initialMode}
      initialMode={initialMode}
      initialMessage={initialMode === "login" && passwordReset === "success"
        ? "Password reset. Sign in with your new password."
        : ""}
    />
  );
}
