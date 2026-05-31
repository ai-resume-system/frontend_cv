import { API_ROUTES } from "@/shared/constants/constants/api";
import { EUploadType } from "@/shared/constants/enums/upload.enum";
import { apiService } from "@/shared/services/api-service";
import type { IResponseApiItem } from "@/shared/types/api";
import type { UploadFileDto, UploadResult } from "@/shared/types/upload";

export async function uploadFile(
  file: File,
  type: EUploadType.AVATAR | EUploadType.LOGO | EUploadType.BANNER,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await apiService.post<IResponseApiItem<UploadFileDto>>(
    API_ROUTES.UPLOAD.BASE,
    formData,
    { auth: true },
  );

  return {
    objectKey: response.data.objectKey,
    previewUrl: response.data.previewUrl,
  };
}
