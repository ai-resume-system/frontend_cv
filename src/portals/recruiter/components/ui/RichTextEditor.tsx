"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Import động ReactQuill Snow để tránh lỗi Window undefined lúc SSR
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-40 w-full animate-pulse rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-xs text-on-surface-variant">
      Đang tải trình soạn thảo văn bản...
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "link",
];

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  return (
    <div
      className={`quill-editor-wrapper rounded-2xl overflow-hidden border border-outline-variant/35 bg-white focus-within:border-primary transition duration-150 ${className}`}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={quillModules}
        formats={quillFormats}
        placeholder={placeholder ?? "Nhập mô tả chi tiết tại đây..."}
        className="text-sm text-on-surface"
      />

      {/* Một chút CSS override để Quill nhìn hiện đại hơn */}
      <style jsx global>{`
        .quill-editor-wrapper .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
          background-color: #f8fafc;
          padding: 8px 12px;
        }
        .quill-editor-wrapper .ql-container.ql-snow {
          border: none;
          min-height: 180px;
          max-height: 360px;
          overflow-y: auto;
          font-family: inherit;
        }
        .quill-editor-wrapper .ql-editor {
          padding: 12px 16px;
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .quill-editor-wrapper .ql-editor.ql-blank::before {
          left: 16px;
          right: 16px;
          font-style: normal;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
