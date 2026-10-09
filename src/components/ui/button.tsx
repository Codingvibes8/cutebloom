import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--primary))] text-white hover:opacity-95 shadow-sm focus-visible:ring-[hsl(var(--ring))]",
        secondary:
          "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-black/5 dark:hover:bg-white/5",
        outline:
          "border-2 border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]",
        ghost:
          "hover:bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]",
        accent:
          "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:opacity-90 font-semibold",
        terracotta:
          "bg-[hsl(var(--terracotta))] text-white hover:opacity-95 shadow-sm",
        destructive:
          "bg-[hsl(var(--destructive))] text-white hover:opacity-90",
      },
      size: {
        default: "min-h-[48px] px-6 py-3", // Enforce 44px+ minimum tap target
        sm: "min-h-[44px] px-4 py-2 text-sm",
        lg: "min-h-[56px] px-8 py-4 text-lg font-semibold rounded-3xl",
        icon: "h-12 w-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
