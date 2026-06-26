"use client";

import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Play,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import type { CareerCategory } from "@/shared/types/career-category";

interface SearchStatsDashboardProps {
  categories: CareerCategory[];
  totalJobs: number;
  locations?: string[]; // Kept for backward compatibility
}

const VIETNAM_PROVINCES = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Bình Dương",
  "Bắc Ninh",
  "Đồng Nai",
  "Hưng Yên",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Khánh Hòa",
  "Long An",
  "Quảng Ninh",
  "Bà Rịa - Vũng Tàu",
];

export function SearchStatsDashboard({
  categories = [],
  totalJobs = 0,
}: SearchStatsDashboardProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Current date formatted (DD/MM/YYYY)
  const [currentDateStr, setCurrentDateStr] = useState("25/06/2026");
  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    setCurrentDateStr(`${dd}/${mm}/${yyyy}`);
  }, []);

  // Calculate pages
  const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));
  const currentCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return categories.slice(start, start + itemsPerPage);
  }, [categories, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    if (selectedLocation) {
      params.set("address", selectedLocation);
    }
    router.push(`/jobs?${params.toString()}`);
  };

  // Mock a daily new job count based on total open jobs
  const newJobsCount = useMemo(() => {
    return Math.round(totalJobs * 0.08 + 15);
  }, [totalJobs]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#0a1e3f] via-[#103580] to-[#0f2954] px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-12">
      {/* Decorative light elements in background (TopCV style) */}
      <div className="absolute left-[-10%] top-[-30%] h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute right-[-5%] bottom-[-20%] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Title */}
        <h2 className="mb-6 text-center font-display text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl text-white drop-shadow-md">
          {categories.length > 0
            ? "FUSE - Tạo CV, Tìm việc làm, Tuyển dụng hiệu quả bằng AI"
            : "TopCV - Tạo CV, Tìm việc làm, Tuyển dụng hiệu quả"}
        </h2>

        {/* Search Bar Capsule */}
        <form
          onSubmit={handleSearch}
          className="relative mx-auto mb-8 flex w-full max-w-4xl flex-col gap-3 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row sm:items-center sm:rounded-full"
        >
          {/* Keyword Input */}
          <div className="relative flex flex-1 items-center">
            <Search className="absolute left-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Vị trí tuyển dụng, kỹ năng, tên công ty..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent py-3 pl-12 pr-10 font-sans text-sm text-gray-800 focus:outline-none placeholder:text-gray-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="hidden h-8 w-px bg-gray-200 sm:block" />

          {/* Location Dropdown */}
          <div className="relative flex w-full items-center sm:w-60">
            <MapPin className="absolute left-4 h-5 w-5 text-gray-400 pointer-events-none" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full appearance-none bg-transparent py-3 pl-12 pr-10 font-sans text-sm text-gray-800 focus:outline-none"
            >
              <option value="" className="text-gray-500">
                Tất cả địa điểm
              </option>
              {VIETNAM_PROVINCES.map((loc) => (
                <option key={loc} value={loc} className="text-gray-800">
                  {loc}
                </option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-500 h-0 w-0" />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#103580] px-8 py-3.5 font-sans text-sm font-bold text-white transition-all hover:bg-[#0b2760] active:scale-95 sm:rounded-full shrink-0 shadow-md"
          >
            <Search className="h-4 w-4" />
            Tìm kiếm
          </button>
        </form>

        {/* Dashboard Panels */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Cột trái: Ngành nghề danh mục phân trang */}
          <div className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-xl md:col-span-4 min-h-[340px]">
            <div>
              <h3 className="mb-3 font-display text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-[#103580]" /> Danh
                mục ngành nghề
              </h3>
              <div className="space-y-1">
                {currentCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/jobs?category=${category.slug}`}
                    className="group flex items-center justify-between rounded-xl px-3 py-2 text-left font-sans text-xs font-semibold text-gray-700 transition-all hover:bg-[#103580]/10 hover:text-[#103580]"
                  >
                    <span className="truncate pr-2">{category.name}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[#103580]" />
                  </Link>
                ))}

                {categories.length === 0 && (
                  <p className="py-8 text-center text-xs text-gray-400">
                    Chưa có danh mục hiển thị
                  </p>
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 font-medium">
                <span>
                  Trang <strong className="text-gray-800">{currentPage}</strong>{" "}
                  / {totalPages}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cột phải: Video/Promo Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c255c] via-[#103580] to-[#2563eb] p-6 shadow-xl md:col-span-8 flex flex-col justify-between min-h-[340px] text-white">
            {/* Background pattern lines */}
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
              <svg
                viewBox="0 0 100 100"
                className="h-full w-full stroke-white stroke-2 fill-none"
              >
                <path d="M10,0 L100,90 M30,0 L100,70 M50,0 L100,50" />
              </svg>
            </div>

            <div className="relative z-10 max-w-lg">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />{" "}
                Hệ sinh thái AI CV hàng đầu
              </span>
              <h3 className="mt-4 font-display text-2xl font-extrabold leading-tight text-white md:text-3xl">
                Tiếp lợi thế, nối thành công cùng FUSE AI
              </h3>
              <p className="mt-3 font-sans text-xs font-medium leading-relaxed text-white/80 md:text-sm">
                FUSE tích hợp trí tuệ nhân tạo đột phá để tự động trích xuất kỹ
                năng, đánh giá mức độ tương thích và đề xuất những việc làm tốt
                nhất dành riêng cho hồ sơ của bạn.
              </p>
            </div>

            <div className="relative z-10 mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/analysis"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 font-sans text-xs font-bold text-[#103580] shadow-md transition-all hover:scale-105 hover:bg-gray-100 active:scale-95 text-center"
              >
                Trải nghiệm AI CV ngay
              </Link>
            </div>
          </div>
        </div>

        {/* Market Statistics Capsule Bar */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#0c255c] border border-blue-900 px-6 py-4 shadow-lg md:flex-row md:rounded-full text-white">
          {/* Market status title */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ffcc] opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00ffcc]"></span>
            </span>
            <span className="font-sans text-xs font-bold text-blue-200">
              Thị trường tuyển dụng hôm nay:{" "}
              <strong className="text-white font-extrabold">
                {currentDateStr}
              </strong>
            </span>
          </div>

          {/* Core metrics */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs md:gap-10">
            <div>
              <span className="font-sans text-blue-200">
                Việc làm đang tuyển:{" "}
              </span>
              <strong className="font-display text-sm font-extrabold text-[#00ffcc]">
                {totalJobs.toLocaleString("vi-VN")}
              </strong>
            </div>
            <div className="hidden h-4 w-px bg-blue-800 sm:block" />
            <div>
              <span className="font-sans text-blue-200">
                Việc làm mới hôm nay:{" "}
              </span>
              <strong className="font-display text-sm font-extrabold text-[#00ffcc]">
                {newJobsCount.toLocaleString("vi-VN")}
              </strong>
            </div>
          </div>

          {/* AI Mascot Robot representation */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-blue-200">
              Hệ thống AI đang hoạt động
            </span>
            {/* Robot Mascot SVG */}
            <svg
              className="h-10 w-10 text-[#00ffcc]"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Robot Head */}
              <rect
                x="6"
                y="8"
                width="28"
                height="20"
                rx="6"
                fill="#0c255c"
                stroke="currentColor"
                strokeWidth="2"
              />
              {/* Ears */}
              <rect
                x="2"
                y="14"
                width="4"
                height="8"
                rx="2"
                fill="currentColor"
              />
              <rect
                x="34"
                y="14"
                width="4"
                height="8"
                rx="2"
                fill="currentColor"
              />
              {/* Antenna */}
              <line
                x1="20"
                y1="8"
                x2="20"
                y2="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="20" cy="3" r="2" fill="currentColor" />
              {/* Glowing Eyes */}
              <circle
                cx="14"
                cy="17"
                r="3"
                fill="#00ffcc"
                className="animate-pulse"
              />
              <circle
                cx="26"
                cy="17"
                r="3"
                fill="#00ffcc"
                className="animate-pulse"
              />
              {/* Smiling Mouth */}
              <path
                d="M16 23 C 18 25, 22 25, 24 23"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
