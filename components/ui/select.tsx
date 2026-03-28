import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-12 w-full appearance-none rounded-2xl border border-stone-200 bg-white/90 px-4 py-2 pr-10 text-sm text-stone-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
    </div>
  );
});

Select.displayName = "Select";

export { Select };
