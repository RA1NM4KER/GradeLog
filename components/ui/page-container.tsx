import { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/shared/utils";

type PageContainerProps = ComponentPropsWithoutRef<"div">;

export function PageContainer({
  children,
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-5xl px-5 sm:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}
