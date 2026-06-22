import { API_ROUTES } from "@/shared/constants/constants/api";
import { EUploadType } from "@/shared/constants/enums/upload.enum";
import { apiService } from "@/shared/services/api-service";
import type {
  IResponseApiItem,
  IResponseApiList,
  IResponseApiPagination,
} from "@/shared/types/api";
import type {
  CvAnalysisResponse,
  CvAnalyzeResponse,
  TempCvUploadResult,
  TempCvPreviewResult,
  TempCvSaveResult,
} from "@/shared/types/cv-analysis";
import type {
  CvDownloadResponse,
  CvItem,
  CvPreviewResponse,
  UpdateCvPayload,
} from "@/shared/types/cv";
import type { JobApiItem } from "@/shared/types/job";

export interface FetchMyCvListParams {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  status?: string;
}

export interface FetchMyCvListResult {
  cvs: CvItem[];
  pagination?: IResponseApiPagination;
}

function buildCvListPath({
  page = 1,
  limit = 10,
  q,
  sortBy,
  sortOrder,
  status,
}: FetchMyCvListParams = {}): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  if (q) {
    searchParams.set("q", q);
  }

  if (sortBy) {
    searchParams.set("sortBy", sortBy);
  }

  if (sortOrder) {
    searchParams.set("sortOrder", sortOrder);
  }

  if (status) {
    searchParams.set("status", status);
  }

  return `${API_ROUTES.CV.BASE}?${searchParams.toString()}`;
}

export async function fetchMyCvList(
  params?: FetchMyCvListParams,
): Promise<FetchMyCvListResult> {
  const response = await apiService.get<IResponseApiList<CvItem>>(
    buildCvListPath(params),
    { auth: true, cache: "no-store" },
  );

  return {
    cvs: response.data ?? [],
    pagination: response.pagination,
  };
}

export async function uploadCv(file: File): Promise<CvItem> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", EUploadType.CV);

  const response = await apiService.post<IResponseApiItem<CvItem>, FormData>(
    API_ROUTES.UPLOAD.BASE,
    formData,
    { auth: true },
  );

  return response.data;
}

export async function updateCv(
  id: string,
  payload: UpdateCvPayload,
): Promise<CvItem> {
  const response = await apiService.patch<IResponseApiItem<CvItem>, UpdateCvPayload>(
    API_ROUTES.CV.DETAIL(id),
    payload,
    { auth: true },
  );

  return response.data;
}

export async function fetchCvDetail(id: string): Promise<CvItem> {
  const response = await apiService.get<IResponseApiItem<CvItem>>(
    API_ROUTES.CV.DETAIL(id),
    { auth: true, cache: "no-store" },
  );

  return response.data;
}

export async function deleteCv(id: string): Promise<void> {
  await apiService.delete<void>(API_ROUTES.CV.DETAIL(id), { auth: true });
}

export async function setDefaultCv(
  id: string,
  payload: { isDefault: boolean },
): Promise<CvItem> {
  const response = await apiService.patch<
    IResponseApiItem<CvItem>,
    { isDefault: boolean }
  >(API_ROUTES.CV.DEFAULT(id), payload, { auth: true });

  return response.data;
}

export async function fetchCvDownload(id: string): Promise<CvDownloadResponse> {
  const response = await apiService.get<IResponseApiItem<CvDownloadResponse>>(
    API_ROUTES.CV.DOWNLOAD(id),
    { auth: true, cache: "no-store" },
  );

  return response.data;
}

export async function fetchCvPreview(id: string): Promise<CvPreviewResponse> {
  const response = await apiService.get<IResponseApiItem<CvPreviewResponse>>(
    API_ROUTES.CV.PREVIEW(id),
    { auth: true, cache: "no-store" },
  );

  return response.data;
}

export async function queueCvAnalysis(id: string): Promise<CvAnalyzeResponse> {
  const response = await apiService.post<IResponseApiItem<CvAnalyzeResponse>>(
    API_ROUTES.CV.ANALYZE(id),
    undefined,
    { auth: true },
  );

  return response.data;
}

function mapBackendAnalysisToFrontend(data: any): CvAnalysisResponse {
  if (!data) return data;
  return {
    ...data,
    skills: data.matchedSkills ?? [],
    suggestions: data.improvementSuggestions ?? [],
    score: data.resumeQualityScore ?? 0,
  };
}

export async function fetchCvAnalysis(id: string): Promise<CvAnalysisResponse> {
  const response = await apiService.get<IResponseApiItem<any>>(
    API_ROUTES.CV.ANALYSIS(id),
    { auth: true, cache: "no-store" },
  );

  return mapBackendAnalysisToFrontend(response.data);
}

export async function fetchCvRecommendedJobs(id: string): Promise<JobApiItem[]> {
  const response = await apiService.get<IResponseApiList<JobApiItem>>(
    API_ROUTES.CV.RECOMMENDED_JOBS(id),
    { auth: true, cache: "no-store" }
  );
  return response.data ?? [];
}

export async function uploadTempCv(file: File): Promise<TempCvUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiService.post<IResponseApiItem<TempCvUploadResult>, FormData>(
    API_ROUTES.CV_ANALYSIS_PREVIEW.UPLOAD_TEMP,
    formData,
    { auth: true }
  );
  return response.data;
}

export async function previewTempCv(tempFileKey: string): Promise<TempCvPreviewResult> {
  const response = await apiService.post<IResponseApiItem<any>>(
    API_ROUTES.CV_ANALYSIS_PREVIEW.PREVIEW,
    { tempFileKey },
    { auth: true }
  );
  return {
    ...response.data,
    analysis: mapBackendAnalysisToFrontend(response.data?.analysis),
  };
}

export async function saveTempCv(tempFileKey: string, title?: string): Promise<any> {
  const response = await apiService.post<IResponseApiItem<any>>(
    API_ROUTES.CV_ANALYSIS_PREVIEW.SAVE_PREVIEW,
    { tempFileKey, title },
    { auth: true }
  );
  return {
    ...response.data,
    analysis: mapBackendAnalysisToFrontend(response.data?.analysis),
  };
}
