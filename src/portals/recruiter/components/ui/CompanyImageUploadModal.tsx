"use client";

import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { ImagePlus, Upload, X, ZoomIn, ZoomOut, Trash2 } from "lucide-react";
import { useCallback, useRef, useState, useEffect } from "react";

import { BaseButton } from "@/shared/components/ui/BaseButton";
import { EUploadType } from "@/shared/constants/enums/upload.enum";
import { cn } from "@/shared/lib/utils/cn";
import { showSuccessToast, showErrorToast } from "@/shared/lib/ui/toast";
import { uploadFile } from "@/shared/services/upload.service";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB cho ảnh công ty

interface CompanyImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
  type: "logo" | "banner";
  currentImageUrl?: string | null;
  onDeleteImage: () => Promise<void>;
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
        resolve(new File([blob], "image.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.85,
    );
  });
}

export function CompanyImageUploadModal({
  isOpen,
  onClose,
  onUploaded,
  type,
  currentImageUrl,
  onDeleteImage,
}: CompanyImageUploadModalProps) {
  const [step, setStep] = useState<"pick" | "crop">("pick");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeletedAction, setIsDeletedAction] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLogo = type === "logo";
  const aspect = isLogo ? 1 : 4; // Logo 1:1, Banner 4:1

  // Reset state when type changes or modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, type]);

  function reset() {
    setStep("pick");
    setImageSrc(null);
    setFileName("");
    setFileSize(0);
    setIsDragging(false);
    setIsProcessing(false);
    setIsDeletedAction(false);
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
      return "Kích thước ảnh không được vượt quá 10MB.";
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
        // Resize preview
        const targetWidth = isLogo ? 160 : 320;
        const targetHeight = isLogo ? 160 : 80;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
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
            targetWidth,
            targetHeight,
          );
          setCroppedPreview(canvas.toDataURL());
        };
        img.src = imageSrc;
      }
    },
    [imageSrc, isLogo],
  );

  function handleRemoveFile() {
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
    setIsDeletedAction(true);
  }

  async function handleConfirm() {
    setIsProcessing(true);
    try {
      const uploadType = isLogo ? EUploadType.LOGO : EUploadType.BANNER;
      const label = isLogo ? "Logo" : "Ảnh bìa";

      // TRƯỜNG HỢP 1: Crop và Upload ảnh mới
      if (step === "crop" && imageSrc && croppedAreaPixels) {
        const croppedFile = await getCroppedFile(imageSrc, croppedAreaPixels);
        await uploadFile(croppedFile, uploadType);
        onUploaded();
        showSuccessToast(`${label} đã được cập nhật thành công.`);
        handleClose();
        return;
      }

      // TRƯỜNG HỢP 2: Xác nhận xóa ảnh
      if (step === "pick" && isDeletedAction) {
        await onDeleteImage();
        onUploaded();
        showSuccessToast(`Đã xóa ${label.toLowerCase()} thành công.`);
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

  const hasExistingImage = !!currentImageUrl;
  const isConfirmDisabled =
    !(step === "crop" && croppedAreaPixels) &&
    !(step === "pick" && isDeletedAction);

  const title = isLogo ? "Cập nhật Logo công ty" : "Cập nhật Ảnh bìa công ty";
  const pickPlaceholder = isLogo ? "/logo.png" : "";

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
            {title}
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
            /* ===== STEP 1: Chọn ảnh & hiển thị ảnh hiện tại ===== */
            <div className="grid gap-6 md:grid-cols-5">
              {/* Vùng kéo thả bên trái */}
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
                  jpg, png, webp — Tối đa 10MB
                </p>
              </div>

              {/* Vùng ảnh hiện tại bên phải */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface-container-high p-6 md:col-span-2">
                <p className="mb-3 text-sm font-semibold text-on-surface-variant">
                  {isLogo ? "Logo hiện tại" : "Ảnh bìa hiện tại"}
                </p>

                {isLogo ? (
                  /* Logo tròn */
                  <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-gray-300 bg-white shadow-sm flex items-center justify-center">
                    <img
                      alt="Logo hiện tại"
                      className="h-full w-full object-contain"
                      src={
                        isDeletedAction
                          ? "/logo.png"
                          : currentImageUrl || "/logo.png"
                      }
                    />
                  </div>
                ) : (
                  /* Banner chữ nhật */
                  <div className="h-20 w-full overflow-hidden rounded-2xl border border-gray-300 bg-slate-100 shadow-sm flex items-center justify-center">
                    {hasExistingImage && !isDeletedAction ? (
                      <img
                        alt="Ảnh bìa hiện tại"
                        className="h-full w-full object-cover"
                        src={currentImageUrl || undefined}
                      />
                    ) : (
                      <div className="text-[10px] text-outline">
                        Chưa có ảnh bìa
                      </div>
                    )}
                  </div>
                )}

                {hasExistingImage && !isDeletedAction && (
                  <BaseButton
                    variant="danger"
                    type="button"
                    onClick={handleDeleteClick}
                    startIcon={<Trash2 className="h-4 w-4" />}
                    className="mt-5 w-full text-xs"
                  >
                    Xóa ảnh này
                  </BaseButton>
                )}
              </div>
            </div>
          ) : (
            /* ===== STEP 2: Cắt ảnh (Crop) ===== */
            <div className="grid gap-6 md:grid-cols-5">
              {/* Vùng cắt ảnh */}
              <div className="flex flex-col md:col-span-3">
                <p className="mb-2 text-center text-sm font-semibold text-on-surface-variant">
                  Di chuyển & căn chỉnh vị trí ảnh
                </p>
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-border bg-surface-container">
                  {imageSrc && (
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={aspect}
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

              {/* Vùng xem trước kết quả cắt */}
              <div className="flex flex-col items-center md:col-span-2">
                <p className="mb-2 text-sm font-semibold text-on-surface-variant">
                  Ảnh xem trước
                </p>

                {isLogo ? (
                  /* Preview Logo */
                  <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-primary/20 bg-white flex items-center justify-center">
                    {croppedPreview ? (
                      <img
                        alt="Preview logo"
                        className="h-full w-full object-contain"
                        src={croppedPreview}
                      />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-on-surface-variant/40" />
                    )}
                  </div>
                ) : (
                  /* Preview Banner */
                  <div className="h-20 w-full overflow-hidden rounded-2xl border-2 border-primary/20 bg-slate-100 flex items-center justify-center">
                    {croppedPreview ? (
                      <img
                        alt="Preview banner"
                        className="h-full w-full object-cover"
                        src={croppedPreview}
                      />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-on-surface-variant/40" />
                    )}
                  </div>
                )}

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
                    className="flex-1 text-xs"
                  >
                    Đổi ảnh
                  </BaseButton>
                  <BaseButton
                    variant="danger"
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex-1 text-xs"
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

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 border-t border-border px-6 py-5 sm:px-8">
          <BaseButton
            type="button"
            onClick={handleConfirm}
            loading={isProcessing}
            disabled={isConfirmDisabled}
            className="min-w-40"
          >
            Lưu ảnh
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
