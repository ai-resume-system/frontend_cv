import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type { IResponseApiItem, IResponseApiList } from "@/shared/types/api";
import type { Job, JobApiItem } from "@/shared/types/job";

interface FavoriteJobRelationApiItem {
  id: string;
  job?: JobApiItem | null;
  jobId?: string;
}

type FavoriteJobApiItem = JobApiItem | FavoriteJobRelationApiItem;

function toOptionalDate(value: string | null | undefined): Date | undefined {
  return value ? new Date(value) : undefined;
}

function toOptionalNumber(
  value: number | null | undefined,
): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function toOptionalString(
  value: string | null | undefined,
): string | undefined {
  return value ?? undefined;
}

function mapJobApiItemToJob(job: JobApiItem): Job {
  return {
    id: job.id,
    title: job.title,
    shortDescription: toOptionalString(job.shortDescription),
    description: toOptionalString(job.description),
    address: toOptionalString(job.address),
    salaryMin: toOptionalNumber(job.salaryMin),
    salaryMax: toOptionalNumber(job.salaryMax),
    vacancyCount: toOptionalNumber(job.vacancyCount ?? null),
    experienceYears: toOptionalNumber(job.experienceYears),
    expiredAt: toOptionalDate(job.expiredAt),
    jobType: job.jobType,
    rejectReason: toOptionalString(job.rejectReason),
    status: job.status,
    skills: job.skills ?? undefined,
    isFavourited: job.isFavourited ?? undefined,
    createdAt: new Date(job.createdAt),
    updatedAt: new Date(job.updatedAt),
    company: job.company ?? undefined,
    careerCategory: job.careerCategory ?? undefined,
  };
}

function extractJobApiItem(item: FavoriteJobApiItem): JobApiItem | null {
  if ("job" in item) {
    return item.job ?? null;
  }

  return item as JobApiItem;
}

export async function fetchFavoriteJobs(): Promise<Job[]> {
  const response = await apiService.get<IResponseApiList<FavoriteJobApiItem>>(
    API_ROUTES.FAVORITE_JOB.BASE,
    {
      auth: true,
      cache: "no-store",
    },
  );

  return response.data
    .map(extractJobApiItem)
    .filter((job): job is JobApiItem => Boolean(job))
    .map(mapJobApiItemToJob);
}

export async function addFavoriteJob(jobId: string): Promise<void> {
  await apiService.post<IResponseApiItem<null>, { jobId: string }>(
    API_ROUTES.FAVORITE_JOB.BASE,
    { jobId },
    {
      auth: true,
    },
  );
}

export async function removeFavoriteJob(jobId: string): Promise<void> {
  await apiService.delete<IResponseApiItem<null>>(
    API_ROUTES.FAVORITE_JOB.DETAIL(jobId),
    {
      auth: true,
    },
  );
}
