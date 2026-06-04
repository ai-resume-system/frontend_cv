import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import { mapJobApiItemToJob } from "@/shared/services/job.service";
import type { IResponseApiItem, IResponseApiList } from "@/shared/types/api";
import type { Job, JobApiItem } from "@/shared/types/job";

interface FavouriteJobRelationApiItem {
  id: string;
  job?: JobApiItem | null;
  jobId?: string;
}

type FavouriteJobApiItem = JobApiItem | FavouriteJobRelationApiItem;

function extractJobApiItem(item: FavouriteJobApiItem): JobApiItem | null {
  if ("job" in item) {
    return item.job ?? null;
  }

  return item as JobApiItem;
}

export async function fetchFavouriteJobs(): Promise<Job[]> {
  const response = await apiService.get<IResponseApiList<FavouriteJobApiItem>>(
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

export async function addFavouriteJob(jobId: string): Promise<void> {
  await apiService.post<IResponseApiItem<null>, { jobId: string }>(
    API_ROUTES.FAVORITE_JOB.BASE,
    { jobId },
    {
      auth: true,
    },
  );
}

export async function removeFavouriteJob(jobId: string): Promise<void> {
  await apiService.delete<IResponseApiItem<null>>(
    API_ROUTES.FAVORITE_JOB.DETAIL(jobId),
    {
      auth: true,
    },
  );
}
