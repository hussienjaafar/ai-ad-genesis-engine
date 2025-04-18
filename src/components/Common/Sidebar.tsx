import {
  LayoutDashboard,
  Settings,
  Users,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={22} />,
      path: "/",
      active: location.pathname === "/",
    },
    {
      name: "Users",
      icon: <Users size={22} />,
      path: "/users",
      active: location.pathname === "/users",
    },
    {
      name: "Analytics",
      icon: <BarChart3 size={22} />,
      path: "/analytics",
      active: location.pathname === "/analytics",
    },
    {
      name: "Settings",
      icon: <Settings size={22} />,
      path: "/settings",
      active: location.pathname === "/settings",
    },
    {
      name: "Help",
      icon: <HelpCircle size={22} />,
      path: "/help",
      active: location.pathname === "/help",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r py-4 w-64">
      <div className="px-6 mb-8">
        <Button variant="ghost" className="justify-start w-full hover:bg-gray-100">
          <span className="font-bold text-lg">AdGenesis AI</span>
        </Button>
      </div>

      <nav className="flex-1">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <Button
                variant="ghost"
                className={`justify-start w-full px-6 hover:bg-gray-100 ${item.active ? 'text-primary font-semibold' : 'text-gray-700'
                  }`}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t py-4 mt-4">
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="justify-start w-full px-6 font-normal hover:bg-gray-100">
              <Avatar className="mr-3 h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium leading-none">{user?.name}</span>
                <span className="text-xs text-gray-500">{user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
