import type { Metadata } from "next";
import { Bowlby_One_SC, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const bowlbyOneSC = Bowlby_One_SC({
  subsets: ["latin"],
  variable: "--font-bowlby",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Trivia Trap",
  description: "Know the answer. Bluff the room.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${bowlbyOneSC.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
