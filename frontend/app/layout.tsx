import type { Metadata } from "next";
import { Geist, Geist_Mono, Black_Ops_One } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const blackOpsOne = Black_Ops_One({
  variable: "--font-black-ops",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Trivia Trap",
  description: "Trivia Trap Quiz Game",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${blackOpsOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
