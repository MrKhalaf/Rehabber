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

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Any time settings.theme changes, update our local state
    setTheme(settings.theme);

    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }
    
    root.classList.add(theme);
  }, [theme, settings.theme]);

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