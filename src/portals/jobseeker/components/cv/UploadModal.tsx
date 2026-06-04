"use client";

import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BaseButton } from "@/shared/components/ui/BaseButton";
import { cn } from "@/shared/lib/utils/cn";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE_MB = 10;

interface UploadModalProps {
  isOpen: boolean;
  isUploading: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  uploadError: string | null;
}

export function UploadModal({
  isOpen,
  isUploading,
  onClose,
  onUpload,
  uploadError,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setFileError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function validateFile(file: File) {
    setFileError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Chỉ chấp nhận file PDF hoặc DOCX.");
      return false;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File không được vượt quá ${MAX_FILE_SIZE_MB}MB.`);
      return false;
    }
    return true;
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  }

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()} // Ngăn không cho click bên trong nội dung bị tính là click ra ngoài */
      >
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-lg font-bold text-slate-800">Tải lên CV mới</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-6">
          {!selectedFile ? (
            <div
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 px-10 transition-colors text-center",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-slate-300 bg-slate-50/50 hover:border-primary hover:bg-slate-50",
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <UploadCloud className="h-7 w-7 text-primary" />
              </div>
              <h1 className="mb-1 text-xl font-semibold text-slate-800">
                Tải lên từ máy tính, chọn hoặc kéo thả
              </h1>
              <span className="text-xs font-medium text-slate-400 uppercase">
                Hỗ trợ định dạng PDF, DOC, DOCX (Tối đa {MAX_FILE_SIZE_MB}MB)
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary bg-primary/5 p-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <p className="font-bold text-primary text-sm line-clamp-1 mb-1">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-400 mb-4">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
                disabled={isUploading}
                type="button"
              >
                Chọn tệp khác
              </button>
            </div>
          )}

          <input
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />

          {(fileError ?? uploadError) && (
            <p className="mt-3 text-sm text-error text-center font-medium">
              {fileError ?? uploadError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 shrink-0">
          <BaseButton
            variant="secondary"
            onClick={onClose}
            disabled={isUploading}
          >
            Hủy bỏ
          </BaseButton>

          <button
            onClick={handleConfirmUpload}
            disabled={!selectedFile || isUploading}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-6 text-xs font-bold text-white shadow-md transition hover:bg-primary-hover active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {isUploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Tải CV lên</span>
          </button>
        </div>
      </div>
    </div>
  );
}
