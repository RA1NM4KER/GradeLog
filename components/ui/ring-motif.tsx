import { cn } from "@/lib/shared/utils";

interface RingSpinnerProps {
  size?: number;
  className?: string;
}

/** Three concentric spinning arcs — used for loading states. */
export function RingSpinner({ size = 96, className }: RingSpinnerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative", className)}
      style={{ height: size, width: size }}
    >
      <span className="border-loader-sand-top border-loader-sand-right border-loader-sand-bottom absolute inset-[5%] rounded-full border-[3px] border-transparent motion-safe:animate-[spin_2.8s_linear_infinite]" />
      <span className="border-loader-sand-top border-loader-sand-bottom border-loader-sand-left absolute inset-[19%] rounded-full border-[3px] border-transparent motion-safe:animate-[spin_2.2s_linear_infinite_reverse]" />
      <span className="border-loader-coral-top border-loader-coral-bottom border-loader-coral-left absolute inset-[33%] rounded-full border-[3px] border-transparent motion-safe:animate-[spin_1.6s_linear_infinite]" />
    </div>
  );
}
