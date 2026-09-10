"use client";
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import SocialProof from '@/components/landing/SocialProof';
import HowItWorks from '@/components/landing/HowItWorks';
import GameplayPreview from '@/components/landing/GameplayPreview';
import CategorySection from '@/components/landing/CategorySection';
import FeatureSection from '@/components/landing/FeatureSection';
import LiveGame from '@/components/landing/LiveGame';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <SocialProof />
          <HowItWorks />
          <GameplayPreview />
          <CategorySection />
          <FeatureSection />
          <LiveGame />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
