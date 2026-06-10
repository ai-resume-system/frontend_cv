"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";

interface RenameModalProps {
  isOpen: boolean;
  cvId: string;
  initialTitle: string;
  onClose: () => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
}

export function RenameModal({
  isOpen,
  cvId,
  initialTitle,
  onClose,
  onRename,
}: RenameModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim() === initialTitle.trim()) {
      onClose();
      return;
    }
    setIsSubmitting(true);
    await onRename(cvId, title.trim());
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-100 flex flex-col"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Đổi tên hồ sơ</h3>
          <BaseButton
            variant="ghost"
            type="button"
            className="rounded-full p-1.5! text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </BaseButton>
        </div>

        <div className="py-5">
          <BaseField
            id="rename-cv-input"
            label="Tên hồ sơ mới"
            onChange={(e) => setTitle(e.target.value)}
            required
            value={title}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <BaseButton
            variant="secondary"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Hủy bỏ
          </BaseButton>

          <BaseButton
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-6 text-xs font-bold text-white shadow-md transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Lưu thay đổi</span>
          </BaseButton>
        </div>
      </form>
    </div>
  );
}
