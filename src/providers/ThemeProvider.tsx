import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "base";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "light", 
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "basedhub-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isClient, setIsClient] = useState(false);

  // Following Next.js official guidance for hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load theme from localStorage only after client hydration
  useEffect(() => {
    if (!isClient) return;
    
    const savedTheme = localStorage.getItem(storageKey) as Theme;
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "base")) {
      setTheme(savedTheme);
    }
  }, [isClient, storageKey]);

  // Apply theme to document only on client side
  useEffect(() => {
    if (!isClient) return;
    
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "base");
    root.classList.add(theme);
  }, [theme, isClient]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (isClient) {
      localStorage.setItem(storageKey, newTheme);
    }
  };

  const value = {
    theme,
    setTheme: handleSetTheme,
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