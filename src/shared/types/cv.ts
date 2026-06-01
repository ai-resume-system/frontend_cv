import type {
  ECVStatus,
  EProcessingStatus,
} from "@/shared/constants/enums/cv.enum";

export interface CvDto {
  id: string;
  userId: string;
  title: string | null;
  fileUrl: string | null;
  fileExtension: string | null;
  processingStatus: EProcessingStatus | null;
  isDefault: boolean | null;
  summary: string | null;
  status: ECVStatus;
  createdAt: string;
  updatedAt: string;
}

export type CvItem = CvDto;

export interface CvDownloadResponse {
  downloadUrl: string;
  expiresIn: number;
}

export interface CvPreviewResponse {
  previewUrl: string;
  expiresIn: number;
}

export interface UpdateCvPayload {
  title?: string;
}
