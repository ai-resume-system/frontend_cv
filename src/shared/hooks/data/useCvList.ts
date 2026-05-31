"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  deleteCv,
  fetchMyCvList,
  uploadCv,
} from "@/shared/services/cv.service";
import type { CvItem } from "@/shared/types/cv";

interface UseCvListReturn {
  cvList: CvItem[];
  isLoading: boolean;
  isUploading: boolean;
  uploadError: string | null;
  deleteError: string | null;
  refresh: () => Promise<void>;
  handleUpload: (file: File) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
}

export function useCvList(): UseCvListReturn {
  const [cvList, setCvList] = useState<CvItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const { cvs } = await fetchMyCvList();
      if (isMounted.current) {
        setCvList(cvs);
      }
    } catch {
      // Silently handle — empty list stays
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploadError(null);
      setIsUploading(true);
      try {
        await uploadCv(file);
        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Tải lên thất bại.";
        if (isMounted.current) {
          setUploadError(message);
        }
      } finally {
        if (isMounted.current) {
          setIsUploading(false);
        }
      }
    },
    [refresh],
  );

  const handleDelete = useCallback(async (id: string) => {
    setDeleteError(null);
    try {
      await deleteCv(id);
      if (isMounted.current) {
        setCvList((prev) => prev.filter((cv) => cv.id !== id));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Xóa CV thất bại.";
      if (isMounted.current) {
        setDeleteError(message);
      }
    }
  }, []);

  return {
    cvList,
    isLoading,
    isUploading,
    uploadError,
    deleteError,
    refresh,
    handleUpload,
    handleDelete,
  };
}
