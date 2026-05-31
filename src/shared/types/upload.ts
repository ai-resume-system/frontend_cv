import type { EBucketType, EUploadType } from "@/shared/constants/enums/upload.enum";
import type { CvItem } from "@/shared/types/cv";

export type UploadCvResponse = CvItem;

export interface UploadFileDto {
  type: EUploadType;
  bucketType: EBucketType;
  objectKey: string;
  previewUrl: string;
  expiresIn: number;
  originalName: string;
  fileExtension: string;
  mimeType: string;
  size: number;
}

export interface UploadResult {
  objectKey: string;
  previewUrl: string;
}
