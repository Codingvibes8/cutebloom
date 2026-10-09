"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "./button";

interface MedicalDisclaimerProps {
  onAcknowledge?: () => void;
  compact?: boolean;
}

export function MedicalDisclaimer({
  onAcknowledge,
  compact = false,
}: MedicalDisclaimerProps) {
  const [acknowledged, setAcknowledged] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cutebloom_medical_disclaimer_accepted");
      if (stored === "true") {
        setAcknowledged(true);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cutebloom_medical_disclaimer_accepted", "true");
    }
    setAcknowledged(true);
    if (onAcknowledge) onAcknowledge();
  };

  if (compact) {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-[hsl(var(--secondary))] p-3.5 text-xs text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[hsl(var(--terracotta))]" />
        <div>
          <span className="font-semibold text-[hsl(var(--foreground))]">Clinical & Legal Notice: </span>
          CuteBloom is an ADHD personal tracking tool only. It does not provide medical advice, diagnose conditions, or adjust doses. Always consult your prescriber, GP, or pharmacist.
        </div>
      </div>
    );
  }

  if (acknowledged) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Medical Disclaimer"
      className="rounded-3xl border-2 border-[hsl(var(--terracotta))]/40 bg-[hsl(var(--card))] p-6 shadow-sm transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--terracotta))]/15 text-[hsl(var(--terracotta))]">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            Important Medical Disclaimer
          </h4>
          <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            <strong>CuteBloom</strong> is an ADHD medication reminder, refill tracker, and focus companion. It is strictly a personal recording and habit support tool.
          </p>
          <ul className="text-xs list-disc list-inside space-y-1 text-[hsl(var(--muted-foreground))]">
            <li>Never interprets, recommends, or changes medication doses</li>
            <li>Does not diagnose, cure, or provide clinical treatment for ADHD</li>
            <li>In case of missed doses or adverse reactions, please refer to your patient information leaflet or contact your GP / NHS 111</li>
          </ul>
          <div className="pt-2">
            <Button
              onClick={handleAccept}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              I understand and agree
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
