import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Home, 
  Coins, 
  Newspaper, 
  User, 
  Settings, 
  Star,
  PieChart,
  Bell,
  TrendingUp,
  LogIn,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMiniKit } from "@/hooks/useMiniKit";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { user: miniKitUser, wallet: miniKitWallet } = useMiniKit();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/cryptocurrencies", label: "Cryptocurrencies", icon: Coins },
    { href: "/news", label: "News", icon: Newspaper },
    { href: "/portfolio", label: "Portfolio", icon: PieChart, auth: true },
    { href: "/watchlist", label: "Watchlist", icon: Star, auth: true },
    { href: "/alerts", label: "Price Alerts", icon: Bell, auth: true },
  ];

  const isActivePath = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigationItems.map((item) => {
        if (item.auth && !isAuthenticated) return null;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => mobile && setIsMobileMenuOpen(false)}
          >
            <Button
              variant={isActivePath(item.href) ? "default" : "ghost"}
              className={cn(
                mobile ? "w-full justify-start" : "",
                "transition-colors duration-200"
              )}
              data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
              {item.label === "Portfolio" && (
                <Badge variant="secondary" className="ml-2">New</Badge>
              )}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 w-full">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  BasedHub
                </span>
              </div>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-4">
              <NavItems />
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Auth Section */}
              <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-700 pl-4">
                {isAuthenticated ? (
                  <>
                    {miniKitUser?.pfpUrl ? (
                      <img
                        src={miniKitUser.pfpUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                        data-testid="img-user-avatar"
                      />
                    ) : (
                      <User className="w-8 h-8 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {miniKitUser?.displayName || (user as any)?.firstName || (user as any)?.email || 'User'}
                    </span>
                    {miniKitWallet && (
                      <Badge variant="secondary" className="text-xs">
                        {miniKitWallet.address.slice(0, 6)}...{miniKitWallet.address.slice(-4)}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = "/api/logout"}
                      data-testid="button-logout"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="button-login"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  BasedHub
                </span>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="py-6 space-y-4">
                  {/* User Info */}
                  {isAuthenticated && (
                    <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                      {miniKitUser?.pfpUrl ? (
                        <img
                          src={miniKitUser.pfpUrl}
                          alt="Profile"
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <User className="w-10 h-10 p-2 bg-gray-100 dark:bg-gray-800 rounded-full" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {miniKitUser?.displayName || (user as any)?.firstName || (user as any)?.email || 'User'}
                        </p>
                        {miniKitWallet && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {miniKitWallet.address.slice(0, 6)}...{miniKitWallet.address.slice(-4)}
                          </p>
                        )}
                        {(user as any)?.email && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {(user as any).email}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Theme Toggle in Mobile */}
                  <div className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="space-y-2">
                    <NavItems mobile />
                  </div>

                  {/* Auth Button */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    {isAuthenticated ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          window.location.href = "/api/logout";
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => {
                          window.location.href = "/api/login";
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Login with Replit
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  );
}