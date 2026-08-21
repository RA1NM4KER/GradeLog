import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/shared/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-card hover:bg-primary-hover",
        secondary: "bg-surface-muted text-foreground hover:bg-line/80",
        outline:
          "border border-line bg-surface text-surface-foreground hover:bg-surface-subtle",
        destructive:
          "border border-transparent bg-danger-solid text-white shadow-card hover:brightness-[0.96] disabled:border-transparent disabled:bg-danger-solid disabled:text-white",
        "destructive-soft":
          "border border-danger-soft bg-danger-soft text-danger hover:brightness-[0.98] disabled:border-line disabled:bg-surface disabled:text-ink-soft disabled:opacity-100",
        ghost: "text-ink-strong ",
        nav: "rounded-md px-3 py-2 text-sm font-medium text-ink-strong hover:bg-surface-muted hover:text-foreground",
        glass:
          "border border-line bg-surface text-foreground shadow-card hover:bg-surface-hover",
        "glass-soft":
          "border border-line/80 bg-surface-soft text-foreground shadow-card hover:bg-surface-hover",
        "glass-panel":
          "border border-line/80 bg-surface-panel text-foreground shadow-card hover:bg-surface-panel-hover",
        "glass-strong":
          "border border-transparent bg-foreground text-background shadow-card hover:bg-foreground/90",
        "glass-muted":
          "border border-line bg-surface-muted text-ink-muted shadow-none hover:bg-line/60",
        "dialog-primary":
          "border border-transparent bg-foreground text-background shadow-card hover:bg-foreground/90",
        "dialog-muted":
          "border border-line bg-surface-muted text-ink-muted shadow-none hover:bg-line/60",
        contrast:
          "border border-transparent bg-foreground text-background shadow-card hover:bg-foreground/90",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
        icon: "h-9 w-9",
        "icon-responsive": "h-9 w-9 sm:h-10 sm:w-10",
        pill: "h-auto rounded-full px-4 py-2",
        "pill-sm":
          "h-auto rounded-[10px] px-3 py-1.5 text-[13px] sm:px-4 sm:py-2 sm:text-sm",
        panel: "h-11 rounded-[18px] px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
