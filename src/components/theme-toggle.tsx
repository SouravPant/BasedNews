import * as React from "react";
import { Moon, Sun, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'base'>('light');

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'base') => {
    setTheme(newTheme);
    // Apply theme to document root
    document.documentElement.classList.remove('light', 'dark', 'base');
    document.documentElement.classList.add(newTheme);
    // Store in localStorage
    localStorage.setItem('basedhub-theme', newTheme);
  };

  // Initialize theme on client side
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('basedhub-theme') as 'light' | 'dark' | 'base';
    if (savedTheme && ['light', 'dark', 'base'].includes(savedTheme)) {
      setTheme(savedTheme);
      document.documentElement.classList.add(savedTheme);
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 base:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 base:scale-0" />
          <Zap className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all base:rotate-0 base:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("base")}>
          <Zap className="mr-2 h-4 w-4" />
          <span>Base Mode</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}