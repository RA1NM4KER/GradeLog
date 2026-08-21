import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/shared/utils";

const selectableCardButtonVariants = cva(
  "rounded-[20px] border text-left transition sm:rounded-[24px]",
  {
    variants: {
      tone: {
        active: "border-line-strong bg-surface text-foreground shadow-card",
        inactive:
          "border-line bg-surface-soft text-foreground hover:border-line-strong hover:bg-surface",
      },
      size: {
        default: "px-3 py-3 sm:px-4 sm:py-4",
        compact:
          "rounded-[18px] px-3 py-3 text-sm font-medium sm:rounded-[20px] sm:px-4 sm:py-3.5",
      },
    },
    defaultVariants: {
      tone: "inactive",
      size: "default",
    },
  },
);

type SelectableCardButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof selectableCardButtonVariants>;

const SelectableCardButton = React.forwardRef<
  HTMLButtonElement,
  SelectableCardButtonProps
>(({ className, size, tone, type = "button", ...props }, ref) => (
  <button
    className={cn(selectableCardButtonVariants({ size, tone }), className)}
    ref={ref}
    type={type}
    {...props}
  />
));
SelectableCardButton.displayName = "SelectableCardButton";

export { SelectableCardButton, selectableCardButtonVariants };
