import RegForm from "@/components/forms/RegForm";
import Navbar from "@/components/layout/Navbar";

export default function RegisterPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-[var(--stone)]">
      <Navbar />
      <RegForm />
    </div>
  );
}