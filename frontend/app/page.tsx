import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import CategorySection from "@/components/landing/CategorySection";
import FeatureSection from "@/components/landing/FeatureSection";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#03040D] text-white">
      <Navbar />

      <Hero />

      <CategorySection />

      <FeatureSection />

      <footer className="border-t border-white/[0.06] py-10 text-center text-sm text-white/40">
        © 2026 Trivia Trap. Play smart. Bluff smarter.
      </footer>
    </main>
  );
}