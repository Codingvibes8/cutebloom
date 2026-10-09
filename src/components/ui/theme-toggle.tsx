"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const isDark =
      localStorage.getItem("cutebloom_theme") === "dark" ||
      (!("cutebloom_theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("cutebloom_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("cutebloom_theme", "light");
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="rounded-full h-11 w-11"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-[hsl(var(--foreground))]" />
      ) : (
        <Sun className="h-5 w-5 text-amber-300" />
      )}
    </Button>
  );
}
