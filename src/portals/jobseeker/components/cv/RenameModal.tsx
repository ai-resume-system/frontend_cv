"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { BaseButton } from "@/shared/components/ui/BaseButton";

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
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-100 flex flex-col"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Đổi tên hồ sơ</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-5">
          <label
            htmlFor="rename-cv-input"
            className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2"
          >
            Tên hồ sơ mới
          </label>
          <input
            id="rename-cv-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-sm text-slate-800"
            required
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 shrink-0">
          <BaseButton
            onClick={onClose}
            className="rounded-full px-5 h-10 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold"
            disabled={isSubmitting}
          >
            Hủy bỏ
          </BaseButton>

          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-6 text-xs font-bold text-white shadow-md transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </form>
    </div>
  );
}
