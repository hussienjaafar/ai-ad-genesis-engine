
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  MessageSquarePlus,
  Share2,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  isOnboarded: boolean;
}

const Sidebar = ({ isOnboarded }: SidebarProps) => {
  const { logout } = useAuth();
  const isMobile = useIsMobile();

  if (!isOnboarded) return null;

  return (
    <aside
      className={cn(
        "flex flex-col bg-slate-50 border-r h-full",
        isMobile ? "fixed bottom-0 w-full h-16 z-50 border-t" : "w-64"
      )}
    >
      {!isMobile && (
        <div className="p-6">
          <h2 className="text-xl font-bold">AI Ad Genesis</h2>
        </div>
      )}

      <nav
        className={cn(
          "flex-1",
          isMobile ? "flex flex-row items-center justify-around" : "flex-col space-y-1 p-2"
        )}
      >
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/ad-generator" icon={MessageSquarePlus} label="Ad Generator" />
        <NavItem to="/generate-content/123" icon={ChevronRight} label="Generate Content" />
        <NavItem to="/platforms" icon={Share2} label="Platforms" />
        {!isMobile && (
          <>
            <Separator className="my-4" />
            <NavItem to="/settings" icon={Settings} label="Settings" />
          </>
        )}
      </nav>

      {!isMobile && (
        <div className="p-4 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      )}
    </aside>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const NavItem = ({ to, icon: Icon, label }: NavItemProps) => {
  const isMobile = useIsMobile();

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center py-2 px-4 rounded-md text-sm transition-colors",
          isMobile
            ? "flex-col text-xs justify-center"
            : "hover:bg-slate-100",
          isActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:text-slate-900"
        )
      }
    >
      <Icon className={cn("h-5 w-5", isMobile ? "h-6 w-6" : "mr-2")} />
      <span>{label}</span>
    </NavLink>
  );
};

export default Sidebar;
