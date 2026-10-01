import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/login-page";

export const metadata: Metadata = {
  title: "Sign in | Trivia Trap",
  description: "Sign in to Trivia Trap and get back in the game.",
};

export default function Page() {
  return <LoginPage />;
}
