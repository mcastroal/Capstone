import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import { CTA } from "@/components/sections/CTA";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[var(--stone)] text-[var(--ink)]">
      <Navbar />
      <Hero />
      <CTA />
      <Footer />
    </main>
  );
}
