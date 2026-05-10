import { Header } from "@/shared/components/layouts/Header";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/shared/constants/constants/routes";
import { messages } from "@/shared/i18n/config";

export function JobsPage() {
  const t = messages.home;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-8 md:flex-row md:items-end">
          <div>
            <Badge>{t.hotJobs.title}</Badge>
            <h1 className="mt-4 text-3xl font-bold">{t.hotJobs.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.hotJobs.subtitle}
            </p>
          </div>
          <Button href={ROUTES.JOB_SEEKER_REGISTER}>
            {messages.common.actions.chooseRole}
          </Button>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {t.jobs.map((job) => (
            <article
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
              key={job.title}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{job.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.company}
                  </p>
                </div>
                <Badge className="bg-ai-soft text-ai-strong">{job.match}</Badge>
              </div>
              <div className="mt-5 grid gap-2 text-sm text-muted-foreground">
                <span>{job.location}</span>
                <span>{job.type}</span>
              </div>
              <Button
                className="mt-5 w-full"
                href={ROUTES.JOBS}
                variant="secondary"
              >
                {t.hotJobs.viewDetail}
              </Button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
