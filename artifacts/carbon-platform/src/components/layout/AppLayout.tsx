import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-[100dvh] w-full bg-background flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative flex flex-col">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
