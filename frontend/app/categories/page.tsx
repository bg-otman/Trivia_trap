import CategoriesPage from "@/components/categories/CategoriesPage";
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import Navbar from '@/components/landing/Navbar';

import Footer from '@/components/landing/Footer';
import SubPageWrapper from "@/components/landing/SubPageWrapper";

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <SubPageWrapper title="Categories">
            <CategoriesPage />
          </SubPageWrapper>
        </main>
        <Footer />
      </div>
    </div>
  );
}