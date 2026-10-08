import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/login-page";
import { getCurrentUser, UserApiError } from "@/lib/getUser";
import { redirect } from "next/navigation";

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
  try {
    if (await getCurrentUser()) redirect("/dashboard");
  } catch (error) {
    if (!(error instanceof UserApiError) || error.status !== 401) throw error;
  }
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
