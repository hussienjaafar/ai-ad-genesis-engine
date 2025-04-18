
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboardIcon, 
  SparklesIcon, 
  BarChart3Icon, 
  SettingsIcon, 
  LinkIcon,
  MenuIcon,
  XIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  isOnboarded: boolean;
}

const Sidebar = ({ isOnboarded }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link 
        to={to}
        onClick={() => isMobile && setIsOpen(false)} 
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
          isActive ? 
            "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : 
            "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  const sidebarContent = (
    <>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Ad Genesis Engine
        </h2>
        <div className="space-y-1">
          <NavLink 
            to="/" 
            icon={<LayoutDashboardIcon className="h-4 w-4" />} 
            label="Dashboard" 
          />
          <NavLink 
            to="/ad-generator" 
            icon={<SparklesIcon className="h-4 w-4" />} 
            label="Ad Generator" 
          />
          <NavLink 
            to="/platforms" 
            icon={<LinkIcon className="h-4 w-4" />} 
            label="Platform Integrations" 
          />
          <NavLink 
            to="/analytics" 
            icon={<BarChart3Icon className="h-4 w-4" />} 
            label="Analytics" 
          />
          <NavLink 
            to="/settings" 
            icon={<SettingsIcon className="h-4 w-4" />} 
            label="Settings" 
          />
        </div>
      </div>
      <div className="mt-auto p-4">
        <div className="rounded-md bg-sidebar-primary p-4">
          <h3 className="font-medium text-sidebar-primary-foreground mb-2">Need help?</h3>
          <p className="text-xs text-sidebar-primary-foreground/80 mb-3">
            Check our documentation or contact support for assistance.
          </p>
          <Button variant="secondary" size="sm" className="w-full">
            View Documentation
          </Button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 left-4 z-50" 
          onClick={toggleSidebar}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
        
        {isOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={toggleSidebar} />
        )}
        
        <div className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-sidebar transition-transform duration-300 z-50 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <XIcon className="h-5 w-5" />
            </Button>
          </div>
          {sidebarContent}
        </div>
      </>
    );
  }

  return (
    <div className="hidden md:flex flex-col h-screen w-64 border-r bg-sidebar">
      {sidebarContent}
    </div>
  );
};

export default Sidebar;
