import * as React from "react";
import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  // Temporarily disabled theme toggle for debugging
  return (
    <Button variant="ghost" size="sm" className="w-9 px-0">
      <Sun className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Light theme</span>
    </Button>
  );
}