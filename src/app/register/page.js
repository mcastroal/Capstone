import RegForm from "@/components/forms/RegForm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RegisterPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-[var(--stone)]">
      <Navbar />
      <RegForm />
      <Footer />
    </div>
  );
}