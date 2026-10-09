import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/login-page";

export const metadata: Metadata = {
  title: "Reset password | Trivia Trap",
  description: "Choose a new password for your Trivia Trap account.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ResetPasswordPage() {
  return <LoginPage initialMode="new-password" />;
}
