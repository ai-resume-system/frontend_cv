export type CvAiStatus = "pending" | "processing" | "completed" | "failed";

export interface CvItem {
  id: string;
  originalName: string;
  fileUrl: string | null;
  fileSize: number | null;
  mimeType: string | null;
  aiStatus: CvAiStatus;
  matchScore: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

