
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { 
  Home, 
  Building, 
  BarChart, 
  FlaskConical, 
  Menu 
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuItems = [
    {
      title: "Home",
      href: "/",
      icon: <Home className="size-4" />,
      roles: ["admin", "client", "staff", "agencyAdmin"]
    },
    {
      title: "Businesses",
      href: "/businesses",
      icon: <Building className="size-4" />,
      roles: ["admin", "client", "staff", "agencyAdmin"]
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart className="size-4" />,
      roles: ["admin", "client", "staff", "agencyAdmin"]
    },
    {
      title: "Experiments",
      href: "/businesses/1/experiments", // TODO: Dynamic business ID
      icon: <FlaskConical className="size-4" />,
      roles: ["admin", "client", "staff", "agencyAdmin"]
    },
    {
      title: "Agencies",
      href: "/agencies",
      icon: <Building className="size-4" />,
      roles: ["agencyAdmin"]
    },
  ];

  const renderMenuItems = () => {
    return menuItems.filter(item => item.roles.includes(user?.role || '')).map((item) => (
      <NavigationMenuItem key={item.title}>
        <Link to={item.href} className="block">
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <div className="flex items-center space-x-2">
              {item.icon}
              <span>{item.title}</span>
            </div>
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
    ));
  };

  if (isMobile) {
    return (
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-4 left-4">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="pl-6 pr-4 pt-6 pb-4">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Navigate through the application.
            </SheetDescription>
          </SheetHeader>
          <NavigationMenu orientation="vertical" className="border-none">
            <NavigationMenuList className="flex flex-col space-y-1">
              {renderMenuItems()}
            </NavigationMenuList>
          </NavigationMenu>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="w-64 border-r flex-shrink-0">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <Link to="/" className="font-bold text-lg">
            Growth Engine
          </Link>
        </div>
        <NavigationMenu className="flex-1 border-0">
          <NavigationMenuList className="flex flex-col space-y-1">
            {renderMenuItems()}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span>{user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
