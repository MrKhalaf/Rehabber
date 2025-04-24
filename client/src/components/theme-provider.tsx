import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { settings } = useSettings();
  
  // Use the theme from settings
  const [theme, setTheme] = useState<Theme>(settings.theme);
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">(
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Any time settings.theme changes, update our local state
    setTheme(settings.theme);

    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      root.classList.add(systemTheme);
      
      // Set data attribute as well for components that use it
      root.setAttribute("data-theme", systemTheme);
      return;
    }
    
    root.classList.add(theme);
    root.setAttribute("data-theme", theme);
    
    // Make sure we also update the contrast appropriately
    if (theme === "dark" || (theme === "system" && systemTheme === "dark")) {
      root.style.setProperty("color-scheme", "dark");
    } else {
      root.style.setProperty("color-scheme", "light");
    }
  }, [theme, settings.theme, systemTheme]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
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