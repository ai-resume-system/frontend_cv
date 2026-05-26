import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type { IResponseApiItem, IResponseApiList } from "@/shared/types/api";
import type { CvItem } from "@/shared/types/cv";

export async function fetchMyCvList(): Promise<CvItem[]> {
  const response = await apiService.get<IResponseApiList<CvItem>>(
    API_ROUTES.CV.BASE,
    { auth: true, cache: "no-store" },
  );

  return response.data ?? [];
}

export async function uploadCv(file: File): Promise<CvItem> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiService.post<IResponseApiItem<CvItem>, FormData>(
    API_ROUTES.CV.BASE,
    formData,
    { auth: true },
  );

  return response.data;
}

export async function deleteCv(id: string): Promise<void> {
  await apiService.delete<void>(`${API_ROUTES.CV.BASE}/${id}`, { auth: true });
}

export async function setDefaultCv(id: string): Promise<void> {
  await apiService.patch<void, Record<string, never>>(
    API_ROUTES.CV.DEFAULT(id),
    {},
    { auth: true },
  );
}

export function getCvDownloadUrl(id: string): string {
  return API_ROUTES.CV.DOWNLOAD(id);
}

export function getCvPreviewUrl(id: string): string {
  return API_ROUTES.CV.PREVIEW(id);
}
