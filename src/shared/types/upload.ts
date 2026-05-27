import type {
  ECVStatus,
  EProcessingStatus,
} from "@/shared/constants/enums/cv.enum";

// ─────────────────────── CV upload response ───────────────────────

export interface UploadCvResponse {
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

// ─────────────────────── Media upload response (avatar / logo / banner) ───────────────────────

export interface UploadMediaResponse {
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

// ─────────────────────── UI-friendly result ───────────────────────

export interface UploadResult {
  objectKey: string;
  previewUrl: string;
}
