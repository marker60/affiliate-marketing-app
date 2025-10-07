declare module "next-themes" {
  import * as React from "react";

  export interface ThemeProviderProps {
    attribute?: "class" | "data-theme";
    defaultTheme?: "system" | "light" | "dark";
    enableSystem?: boolean;
    children?: React.ReactNode;
  }

  export const ThemeProvider: React.ComponentType<ThemeProviderProps>;

  export function useTheme(): {
    theme?: "system" | "light" | "dark";
    setTheme: (theme: "system" | "light" | "dark") => void;
    systemTheme?: "light" | "dark";
  };
}
