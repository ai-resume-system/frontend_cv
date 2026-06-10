"use client";

import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { ImagePlus, Upload, X, ZoomIn, ZoomOut, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { BaseButton } from "@/shared/components/ui/BaseButton";
import { EUploadType } from "@/shared/constants/enums/upload.enum";
import { cn } from "@/shared/lib/utils/cn";
import { showSuccessToast, showErrorToast } from "@/shared/lib/ui/toast";
import { uploadFile } from "@/shared/services/upload.service";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void; // Callback này sẽ được gọi sau khi hoàn tất (cả khi upload mới hoặc xóa)
  currentAvatarUrl?: string;
  hasExistingAvatar: boolean;
  onDeleteAvatar: () => Promise<void>; // Hàm API xóa ảnh của bạn
}

async function getCroppedFile(
  imageSrc: string,
  pixelCrop: Area,
): Promise<File> {
  const image = new Image();
  image.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas toBlob failed"));
          return;
        }
        resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.85,
    );
  });
}

export function AvatarUploadModal({
  isOpen,
  onClose,
  onUploaded,
  currentAvatarUrl,
  hasExistingAvatar,
  onDeleteAvatar,
}: AvatarUploadModalProps) {
  const [step, setStep] = useState<"pick" | "crop">("pick");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Dùng chung cho trạng thái loading khi ấn "Xong"

  // Flag đánh dấu người dùng đã bấm nút "Xóa ảnh hiện tại" tạm thời trên UI
  const [isDeletedAvatarAction, setIsDeletedAvatarAction] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("pick");
    setImageSrc(null);
    setFileName("");
    setFileSize(0);
    setIsDragging(false);
    setIsProcessing(false);
    setIsDeletedAvatarAction(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCroppedPreview(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Chỉ chấp nhận định dạng jpg, png hoặc webp.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Kích thước ảnh không được vượt quá 5MB.";
    }
    return null;
  }

  function processFile(file: File) {
    const error = validateFile(file);
    if (error) {
      showErrorToast(error);
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      setStep("crop");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedPreview(null);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);

      if (imageSrc) {
        const canvas = document.createElement("canvas");
        const size = 160;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(
            img,
            croppedPixels.x,
            croppedPixels.y,
            croppedPixels.width,
            croppedPixels.height,
            0,
            0,
            size,
            size,
          );
          setCroppedPreview(canvas.toDataURL());
        };
        img.src = imageSrc;
      }
    },
    [imageSrc],
  );

  function handleRemoveFile() {
    // Nếu ở bước crop mà ấn xóa ảnh, quay về bước chọn ảnh ban đầu
    setImageSrc(null);
    setFileName("");
    setFileSize(0);
    setStep("pick");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCroppedPreview(null);
  }

  function handleDeleteClick() {
    setIsDeletedAvatarAction(true);
  }

  async function handleConfirm() {
    setIsProcessing(true);
    try {
      // TRƯỜNG HỢP 1: Người dùng chọn ảnh mới và tiến hành crop
      if (step === "crop" && imageSrc && croppedAreaPixels) {
        const croppedFile = await getCroppedFile(imageSrc, croppedAreaPixels);
        await uploadFile(croppedFile, EUploadType.AVATAR);
        onUploaded();
        showSuccessToast("Ảnh đại diện đã được cập nhật thành công.");
        handleClose();
        return;
      }

      // TRƯỜNG HỢP 2: Người dùng nhấn nút xóa ảnh hiện tại ở Step 1 và nhấn "Xong"
      if (step === "pick" && isDeletedAvatarAction) {
        await onDeleteAvatar();
        onUploaded();
        handleClose();
        return;
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Không thể xử lý yêu cầu. Vui lòng thử lại.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  if (!isOpen) return null;

  const isConfirmDisabled =
    !(step === "crop" && croppedAreaPixels) &&
    !(step === "pick" && isDeletedAvatarAction);

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-on-surface/45 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative z-91 w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-surface-container-lowest shadow-[0_24px_60px_rgba(25,28,29,0.14)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 bg-primary px-6 py-4 sm:px-8">
          <h2 className="text-center text-lg font-bold uppercase tracking-wide text-on-primary">
            Cập nhật ảnh đại diện
          </h2>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-on-primary/70 transition-colors hover:bg-white/10 hover:text-on-primary"
            onClick={handleClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 sm:px-8 sm:py-8">
          {step === "pick" ? (
            /* ===== STEP 1: Pick file + Current Avatar Preview ===== */
            <div className="grid gap-6 md:grid-cols-5">
              {/* Khu vực kéo thả bên trái - Chiếm 3 phần */}
              <div
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-200 md:col-span-3",
                  isDragging
                    ? "border-primary bg-primary-soft/30"
                    : "border-outline-variant hover:border-primary hover:bg-surface-container-low",
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div
                  className={cn(
                    "rounded-2xl p-4 transition-colors duration-200",
                    isDragging
                      ? "bg-primary/10 text-primary"
                      : "bg-surface-container text-on-surface-variant",
                  )}
                >
                  <Upload className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    Kéo thả ảnh vào đây
                  </p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    hoặc nhấn để chọn từ máy tính
                  </p>
                </div>
                <p className="text-xs text-outline">
                  jpg, png, webp — Tối đa 5MB
                </p>
              </div>

              {/* Khu vực hiển thị ảnh hiện tại */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface-container-high p-6 md:col-span-2">
                <p className="mb-3 text-sm font-semibold text-on-surface-variant">
                  Ảnh hiện tại
                </p>
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-gray-300 bg-surface-container shadow-sm">
                  <img
                    alt="Ảnh đại diện hiện tại"
                    className="h-full w-full object-cover"
                    src={
                      isDeletedAvatarAction
                        ? "/user-default.png"
                        : currentAvatarUrl || "/user-default.png"
                    }
                  />
                </div>

                {/* Nút chỉ hiển thị khi tài khoản có ảnh */}
                {hasExistingAvatar && !isDeletedAvatarAction && (
                  <BaseButton
                    variant="danger"
                    type="button"
                    onClick={handleDeleteClick}
                    startIcon={<Trash2 className="h-4 w-4" />}
                    className="mt-5 w-full"
                  >
                    Xóa ảnh hiện tại
                  </BaseButton>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-5">
              {/* Vùng ảnh gốc */}
              <div className="flex flex-col md:col-span-3">
                <p className="mb-2 text-center text-sm font-semibold text-on-surface-variant">
                  Ảnh gốc
                </p>
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-surface-container">
                  {imageSrc && (
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="rect"
                      showGrid
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <ZoomOut className="h-4 w-4 text-on-surface-variant" />
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-surface-container-highest accent-primary"
                  />
                  <ZoomIn className="h-4 w-4 text-on-surface-variant" />
                </div>
              </div>

              {/* Vùng ảnh Preview */}
              <div className="flex flex-col items-center md:col-span-2">
                <p className="mb-2 text-sm font-semibold text-on-surface-variant">
                  Ảnh hiển thị
                </p>
                <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-primary/20 bg-surface-container">
                  {croppedPreview ? (
                    <img
                      alt="Preview tròn"
                      className="h-full w-full object-cover"
                      src={croppedPreview}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
                      <ImagePlus className="h-10 w-10" />
                    </div>
                  )}
                </div>

                {/*Thông tin file */}
                <div className="mt-4 w-full rounded-xl bg-surface-container-low px-3 py-2">
                  <p className="truncate text-xs font-medium text-on-surface text-center">
                    {fileName}
                  </p>
                  <p className="text-xs text-on-surface-variant text-center mt-0.5">
                    {fileSize ? `${(fileSize / 1024).toFixed(0)} KB` : ""}
                  </p>
                </div>

                <div className="mt-4 flex w-full gap-2">
                  <BaseButton
                    variant="secondary"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    Đổi ảnh
                  </BaseButton>
                  <BaseButton
                    variant="danger"
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex-1"
                  >
                    Hủy chọn
                  </BaseButton>
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex items-center justify-center gap-3 border-t border-border px-6 py-5 sm:px-8">
          <BaseButton
            type="button"
            onClick={handleConfirm}
            loading={isProcessing}
            disabled={isConfirmDisabled}
            className="min-w-40"
          >
            Xong
          </BaseButton>

          <BaseButton
            variant="secondary"
            type="button"
            onClick={handleClose}
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Đóng lại (Không lưu)
          </BaseButton>
        </div>
      </div>
    </div>
  );
}
