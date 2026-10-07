import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bowlby_One_SC, Black_Ops_One } from "next/font/google";


import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const blackOpsOne = Black_Ops_One({
  variable: "--font-black-ops",
  subsets: ["latin"],
  weight: "400",
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
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${bowlbyOneSC.variable} ${blackOpsOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
        {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
