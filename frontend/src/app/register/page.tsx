import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginPage } from "@/components/auth/login-page";
import { getCurrentUser, UserApiError } from "@/lib/getUser";

export const metadata: Metadata = {
  title: "Create account | Trivia Trap",
  description: "Create your Trivia Trap account.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  try {
    if (await getCurrentUser()) redirect("/dashboard");
  } catch (error) {
    if (!(error instanceof UserApiError) || error.status !== 401) throw error;
  }

  return <LoginPage initialMode="register" />;
}
