import type { Metadata } from "next";
import { ChooseUsername } from "@/components/auth/choose-username";

export const metadata: Metadata = {
  title: "Choose your username | Trivia Trap",
  description: "Finish setting up your Trivia Trap account.",
  robots: { index: false, follow: false },
};

export default function ChooseUsernamePage() {
  return <ChooseUsername />;
}
