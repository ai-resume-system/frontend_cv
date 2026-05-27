import type { IResponseApiList } from "@/shared/types/api";

import type { JobApiItem } from "@/shared/types/job";

// ─────────────────────── Domain entity ───────────────────────

export interface IFavouriteJobEntity {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ─────────────────────── Favorite job relation item ───────────────────────

export interface FavoriteJobRelationApiItem {
  id: string;
  userId?: string;
  jobId?: string;
  job?: JobApiItem | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─────────────────────── Union type (backend may return either shape) ───────────────────────

export type FavoriteJobApiItem = JobApiItem | FavoriteJobRelationApiItem;

// ─────────────────────── List response ───────────────────────

export type FavoriteJobListResponse =
  IResponseApiList<FavoriteJobApiItem>;

// ─────────────────────── Create payload ───────────────────────

export interface AddFavoriteJobPayload {
  jobId: string;
}
