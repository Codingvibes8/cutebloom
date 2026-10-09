"use client";

import * as React from "react";
import { Type } from "lucide-react";
import { Button } from "./button";

export function DyslexiaToggle() {
  const [isDyslexic, setIsDyslexic] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("cutebloom_dyslexic_font");
    if (saved === "true") {
      setIsDyslexic(true);
      document.documentElement.classList.add("dyslexic-mode");
    }
  }, []);

  const toggleDyslexic = () => {
    const nextState = !isDyslexic;
    setIsDyslexic(nextState);
    if (nextState) {
      document.documentElement.classList.add("dyslexic-mode");
      localStorage.setItem("cutebloom_dyslexic_font", "true");
    } else {
      document.documentElement.classList.remove("dyslexic-mode");
      localStorage.setItem("cutebloom_dyslexic_font", "false");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleDyslexic}
      title={isDyslexic ? "Switch to standard font" : "Enable dyslexia-friendly font"}
      aria-label="Toggle dyslexia-friendly font"
      className="gap-2 text-xs"
    >
      <Type className="h-4 w-4 text-[hsl(var(--primary))]" />
      <span className="hidden sm:inline">
        {isDyslexic ? "Standard Font" : "Dyslexia Font"}
      </span>
    </Button>
  );
}
