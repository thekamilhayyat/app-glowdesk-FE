import { ReactNode } from "react";
import { TopNavigation } from "./TopNavigation";

export interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <TopNavigation />
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}