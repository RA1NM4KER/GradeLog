interface SemesterSummaryStatProps {
  label: string;
  value: string;
}

export function SemesterSummaryStat({
  label,
  value,
}: SemesterSummaryStatProps) {
  return (
    <div className="rounded-[18px] bg-[hsl(var(--surface-subtle))] px-3 py-3 sm:rounded-[20px] sm:px-4 sm:py-3.5">
      <p className="min-h-[2.15rem] text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-muted sm:min-h-[2.8rem] sm:text-[0.68rem] sm:tracking-[0.16em]">
        {label}
      </p>
      <p className="mt-1.5 text-[1.35rem] font-semibold tracking-[-0.04em] text-foreground sm:mt-2 sm:text-[1.75rem] sm:tracking-[-0.05em]">
        {value}
      </p>
    </div>
  );
}
