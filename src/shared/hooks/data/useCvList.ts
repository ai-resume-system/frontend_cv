"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  deleteCv,
  fetchCvAnalysis,
  fetchCvDownload,
  fetchCvPreview,
  fetchMyCvList,
  queueCvAnalysis,
  uploadCv,
  setDefaultCv,
  updateCv,
} from "@/shared/services/cv.service";
import type { CvAnalysisResponse } from "@/shared/types/cv-analysis";
import type { CvItem } from "@/shared/types/cv";
import type { IResponseApiPagination } from "@/shared/types/api";

interface UseCvListReturn {
  cvList: CvItem[];
  isLoading: boolean;
  isUploading: boolean;
  isPreviewingCvId: string | null;
  isDownloadingCvId: string | null;
  isAnalyzingCvId: string | null;
  isLoadingAnalysisCvId: string | null;
  analysisByCvId: Record<string, CvAnalysisResponse>;
  loadError: string | null;
  uploadError: string | null;
  deleteError: string | null;
  actionError: string | null;
  refresh: () => Promise<void>;
  handleUpload: (file: File) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handlePreview: (id: string) => Promise<void>;
  handleDownload: (id: string) => Promise<void>;
  handleAnalyze: (id: string) => Promise<void>;
  handleLoadAnalysis: (id: string) => Promise<CvAnalysisResponse | null>;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: "ASC" | "DESC";
  setSortOrder: (order: "ASC" | "DESC") => void;
  q: string;
  setQ: (q: string) => void;
  pagination?: IResponseApiPagination;
  handleSetDefault: (id: string, isDefault: boolean) => Promise<void>;
  handleRename: (id: string, title: string) => Promise<void>;
}

function triggerFileDownload(url: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener noreferrer";
  anchor.download = "";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

export function useCvList(): UseCvListReturn {
  const [cvList, setCvList] = useState<CvItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewingCvId, setIsPreviewingCvId] = useState<string | null>(null);
  const [isDownloadingCvId, setIsDownloadingCvId] = useState<string | null>(null);
  const [isAnalyzingCvId, setIsAnalyzingCvId] = useState<string | null>(null);
  const [isLoadingAnalysisCvId, setIsLoadingAnalysisCvId] = useState<string | null>(null);
  const [analysisByCvId, setAnalysisByCvId] = useState<
    Record<string, CvAnalysisResponse>
  >({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // States for query filters, sorting and pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [q, setQ] = useState("");
  const [pagination, setPagination] = useState<IResponseApiPagination | undefined>(undefined);

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
      setLoadError(null);
      const { cvs, pagination: apiPagination } = await fetchMyCvList({
        page,
        limit,
        sortBy,
        sortOrder,
        q: q.trim() || undefined,
      });

      if (isMounted.current) {
        setCvList(cvs);
        setPagination(apiPagination);
      }
    } catch (error) {
      if (isMounted.current) {
        setLoadError(
          error instanceof Error ? error.message : "Không thể tải danh sách CV.",
        );
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [page, limit, sortBy, sortOrder, q]);

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
        if (isMounted.current) {
          setUploadError(
            error instanceof Error ? error.message : "Tải lên thất bại.",
          );
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
        setCvList((currentState) => currentState.filter((cv) => cv.id !== id));
        setAnalysisByCvId((currentState) => {
          const nextState = { ...currentState };
          delete nextState[id];
          return nextState;
        });
      }
    } catch (error) {
      if (isMounted.current) {
        setDeleteError(
          error instanceof Error ? error.message : "Xóa CV thất bại.",
        );
      }
    }
  }, []);

  const handlePreview = useCallback(async (id: string) => {
    setActionError(null);
    setIsPreviewingCvId(id);

    try {
      const { previewUrl } = await fetchCvPreview(id);
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      if (isMounted.current) {
        setActionError(
          error instanceof Error ? error.message : "Không thể xem trước CV.",
        );
      }
    } finally {
      if (isMounted.current) {
        setIsPreviewingCvId((currentState) =>
          currentState === id ? null : currentState,
        );
      }
    }
  }, []);

  const handleDownload = useCallback(async (id: string) => {
    setActionError(null);
    setIsDownloadingCvId(id);

    try {
      const { downloadUrl } = await fetchCvDownload(id);
      triggerFileDownload(downloadUrl);
    } catch (error) {
      if (isMounted.current) {
        setActionError(
          error instanceof Error ? error.message : "Không thể tải CV xuống.",
        );
      }
    } finally {
      if (isMounted.current) {
        setIsDownloadingCvId((currentState) =>
          currentState === id ? null : currentState,
        );
      }
    }
  }, []);

  const handleLoadAnalysis = useCallback(
    async (id: string): Promise<CvAnalysisResponse | null> => {
      const cachedAnalysis = analysisByCvId[id];

      if (cachedAnalysis) {
        return cachedAnalysis;
      }

      setActionError(null);
      setIsLoadingAnalysisCvId(id);

      try {
        const analysis = await fetchCvAnalysis(id);

        if (isMounted.current) {
          setAnalysisByCvId((currentState) => ({
            ...currentState,
            [id]: analysis,
          }));
        }

        return analysis;
      } catch (error) {
        if (isMounted.current) {
          setActionError(
            error instanceof Error
              ? error.message
              : "Không thể tải kết quả phân tích CV.",
          );
        }

        return null;
      } finally {
        if (isMounted.current) {
          setIsLoadingAnalysisCvId((currentState) =>
            currentState === id ? null : currentState,
          );
        }
      }
    },
    [analysisByCvId],
  );

  const handleAnalyze = useCallback(
    async (id: string) => {
      setActionError(null);
      setIsAnalyzingCvId(id);

      try {
        const result = await queueCvAnalysis(id);
        await refresh();

        if (result.processingStatus === "completed") {
          await handleLoadAnalysis(id);
        }
      } catch (error) {
        if (isMounted.current) {
          setActionError(
            error instanceof Error
              ? error.message
              : "Không thể gửi CV sang hệ thống AI.",
          );
        }
      } finally {
        if (isMounted.current) {
          setIsAnalyzingCvId((currentState) =>
            currentState === id ? null : currentState,
          );
        }
      }
    },
    [handleLoadAnalysis, refresh],
  );

  const handleSetDefault = useCallback(
    async (id: string, isDefault: boolean) => {
      setActionError(null);
      try {
        await setDefaultCv(id, { isDefault });
        await refresh();
      } catch (error) {
        if (isMounted.current) {
          setActionError(
            error instanceof Error ? error.message : "Không thể cập nhật trạng thái mặc định CV.",
          );
        }
      }
    },
    [refresh],
  );

  const handleRename = useCallback(
    async (id: string, title: string) => {
      setActionError(null);
      try {
        await updateCv(id, { title });
        await refresh();
      } catch (error) {
        if (isMounted.current) {
          setActionError(
            error instanceof Error ? error.message : "Không thể đổi tên CV.",
          );
        }
      }
    },
    [refresh],
  );

  return {
    cvList,
    isLoading,
    isUploading,
    isPreviewingCvId,
    isDownloadingCvId,
    isAnalyzingCvId,
    isLoadingAnalysisCvId,
    analysisByCvId,
    loadError,
    uploadError,
    deleteError,
    actionError,
    refresh,
    handleUpload,
    handleDelete,
    handlePreview,
    handleDownload,
    handleAnalyze,
    handleLoadAnalysis,
    page,
    setPage,
    limit,
    setLimit,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    q,
    setQ,
    pagination,
    handleSetDefault,
    handleRename,
  };
}
