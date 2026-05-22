import { API_ROUTES } from "@/shared/constants/constants/api";
import { EUploadType } from "@/shared/constants/enums/upload.enum";
import { apiService } from "@/shared/services/api-service";
import type { IResponseApiItem } from "@/shared/types/api";

interface UploadImageResponse {
  type: string;
  bucketType: string;
  objectKey: string;
  previewUrl: string;
  expiresIn: number;
  originalName: string;
  fileExtension: string;
  mimeType: string;
  size: number;
}

export interface UploadResult {
  /** Object key lưu vào DB (ví dụ: userId/uuid.png) */
  objectKey: string;
  /** URL có thể hiển thị ngay (public hoặc presigned) */
  previewUrl: string;
}

export async function uploadFile(
  file: File,
  type: EUploadType,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await apiService.post<
    IResponseApiItem<UploadImageResponse>
  >(API_ROUTES.UPLOAD.BASE, formData, { auth: true });

  return {
    objectKey: response.data.objectKey,
    previewUrl: response.data.previewUrl,
  };
}
