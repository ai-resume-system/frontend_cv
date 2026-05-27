import type {
  ECVStatus,
  EProcessingStatus,
} from "@/shared/constants/enums/cv.enum";

// ─────────────────────── Domain entity ───────────────────────

export interface ICvEntity {
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
  deletedAt: string | null;
}

// ─────────────────────── UI-friendly alias ───────────────────────

export type CvItem = ICvEntity;

// ─────────────────────── Download / Preview ───────────────────────

export interface CvDownloadResponse {
  downloadUrl: string;
  expiresIn: number;
}

export interface CvPreviewResponse {
  previewUrl: string;
  expiresIn: number;
}
