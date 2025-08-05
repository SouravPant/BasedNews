import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "base" | "system";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark" | "base"; // The resolved theme (no "system")
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  actualTheme: "light"
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "basedhub-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  const [actualTheme, setActualTheme] = useState<"light" | "dark" | "base">("light");

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark", "base");

    let resolvedTheme: "light" | "dark" | "base";

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      resolvedTheme = systemTheme;
    } else {
      resolvedTheme = theme;
    }

    // Add the resolved theme class
    root.classList.add(resolvedTheme);
    setActualTheme(resolvedTheme);

    // Set CSS custom properties based on theme
    if (resolvedTheme === "base") {
      // Base theme: Blue and black/white
      root.style.setProperty("--background", "0 0% 100%");
      root.style.setProperty("--foreground", "222.2 84% 4.9%");
      root.style.setProperty("--primary", "214 100% 50%"); // Base blue
      root.style.setProperty("--primary-foreground", "210 40% 98%");
      root.style.setProperty("--secondary", "210 40% 96%");
      root.style.setProperty("--secondary-foreground", "222.2 84% 4.9%");
      root.style.setProperty("--accent", "210 40% 96%");
      root.style.setProperty("--accent-foreground", "222.2 84% 4.9%");
      root.style.setProperty("--muted", "210 40% 96%");
      root.style.setProperty("--muted-foreground", "215.4 16.3% 46.9%");
      root.style.setProperty("--card", "0 0% 100%");
      root.style.setProperty("--card-foreground", "222.2 84% 4.9%");
      root.style.setProperty("--border", "214.3 31.8% 91.4%");
      root.style.setProperty("--input", "214.3 31.8% 91.4%");
      root.style.setProperty("--ring", "214 100% 50%");
      root.style.setProperty("--radius", "0.5rem");
      
      // Base theme dark mode
      if (root.classList.contains("dark")) {
        root.style.setProperty("--background", "222.2 84% 4.9%");
        root.style.setProperty("--foreground", "210 40% 98%");
        root.style.setProperty("--primary", "214 100% 60%"); // Lighter blue for dark
        root.style.setProperty("--secondary", "217.2 32.6% 17.5%");
        root.style.setProperty("--muted", "217.2 32.6% 17.5%");
        root.style.setProperty("--card", "222.2 84% 4.9%");
        root.style.setProperty("--border", "217.2 32.6% 17.5%");
      }
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    actualTheme
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};