import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/ui/page-intro";
import { contactEmail, contactHref } from "@/lib/contact";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-14">
      <PageIntro
        badge="GradeLog"
        description={
          <>
            <p>
              Have a thought, a rough edge, or an idea that would make GradeLog
              feel better to use? Send it to{" "}
              <a
                className="font-medium text-foreground underline decoration-foreground/35 underline-offset-4 transition hover:decoration-foreground"
                href={contactHref}
              >
                {contactEmail}
              </a>
              .
            </p>
            <p className="mt-2">
              Feedback, bug reports, privacy questions, and account or data
              requests are all welcome. GradeLog is independent, so replies may
              be async.
            </p>
          </>
        }
        title="Tell me what would help"
      />

      <div className="mt-10 grid gap-8">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Good reasons to reach out
          </h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-ink-soft sm:text-[0.98rem]">
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-ink-muted">
                -
              </span>
              Something feels confusing or takes too many taps.
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-ink-muted">
                -
              </span>
              A grade, course, semester, or sync flow did something unexpected.
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-ink-muted">
                -
              </span>
              You want a feature that would make tracking school feel calmer.
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-ink-muted">
                -
              </span>
              You have a privacy, terms, account, or data request.
            </li>
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="pill" variant="glass">
            <a href={contactHref}>Email feedback</a>
          </Button>
          <Button asChild size="pill" variant="glass-soft">
            <Link href="/" prefetch={false}>
              Back to GradeLog
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
