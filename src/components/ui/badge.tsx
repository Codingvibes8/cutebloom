import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--primary))] text-white",
        secondary:
          "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
        accent:
          "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
        terracotta:
          "bg-[hsl(var(--terracotta))]/15 text-[hsl(var(--terracotta))] font-semibold border border-[hsl(var(--terracotta))]/30",
        destructive:
          "bg-[hsl(var(--destructive))]/15 text-[hsl(var(--destructive))]",
        outline:
          "border border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
