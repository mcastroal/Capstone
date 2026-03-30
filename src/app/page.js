import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import HomePreviewSections from "@/components/sections/HomePreviewSections";
import { CTA } from "@/components/sections/CTA";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[var(--stone)] text-[var(--ink)]">
      <Navbar />
      <Hero />
      <HomePreviewSections />
      <CTA />
      <Footer />
    </main>
  );
}
