import MainDashboard from "@/components/dashboard/main-dashboard";
import { Logo } from "@/components/icons/logo";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-card">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Logo />
            <h1 className="text-2xl font-bold text-primary">G-Expenses Calculator</h1>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <MainDashboard />
      </main>
    </div>
  );
}
