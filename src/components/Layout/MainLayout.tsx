
import { useState } from "react";
import Sidebar from "../Common/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className={`flex-1 ${isMobile ? 'pt-16' : ''}`}>
        <div className="container py-6 md:py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
