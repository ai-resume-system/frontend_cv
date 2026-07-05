"use client";

import { VIETNAM_PROVINCES } from "@/shared/constants/constants/viet-nam-provinces";
import {
  BriefcaseBusiness,
  Building2,
  Layers,
  MapPin,
  Search,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchStatsDashboardProps {
  totalJobs: number;
  stats: { label: string; value: string }[];
}

export function SearchStatsDashboard({
  stats = [],
}: SearchStatsDashboardProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

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

  const filteredStats = stats
    .filter(
      (stat) =>
        !stat.label.includes("Khu vực") && !stat.label.includes("Địa điểm"),
    )
    .slice(0, 3);

  return (
    <section className="relative bg-linear-to-r from-[#1e56c8] via-[#0c2e6b] to-[#081b3b] px-4 pt-12 pb-8 text-white sm:px-6 lg:px-8 lg:pt-15 lg:pb-15">
      {/* Background Decor Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Decorative light elements in background (TopCV style) */}
        <div className="absolute left-[-10%] top-[-30%] h-75 w-75 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute right-[-5%] bottom-[-20%] h-100 w-100 rounded-full bg-cyan-500/10 blur-[150px]" />

        {/* Decorative diagonal stripes like Image 3 & 4 */}
        <div className="absolute right-0 top-0 h-full w-[20%] opacity-15 hidden md:block">
          <svg
            viewBox="0 0 200 200"
            className="h-full w-full stroke-white stroke-10 stroke-linecap-round fill-none"
          >
            <path d="M60,-20 L240,160 M100,-20 L280,160 M140,-20 L320,160" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl text-white drop-shadow-md">
          FUSE - Tạo CV, Tìm việc làm, Tuyển dụng hiệu quả bằng AI
        </h2>

        {/* Search Bar Capsule */}
        <form
          onSubmit={handleSearch}
          className="relative mx-auto mb-12 flex w-full max-w-4xl flex-col gap-3 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row sm:items-center sm:rounded-full"
        >
          <div className="relative flex flex-1 items-center">
            <Search className="absolute left-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Vị trí tuyển dụng, tên công ty..."
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

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#103580] px-8 py-3.5 font-sans text-sm font-bold text-white transition-all hover:bg-[#0b2760] active:scale-95 sm:rounded-full shrink-0 shadow-md"
          >
            <Search className="h-4 w-4" />
            Tìm kiếm
          </button>
        </form>

        {/* Overlapping Stats Card */}
        <div className="relative z-20 mx-auto mt-8.5 -mb-16 px-4 sm:px-0 md:absolute md:left-0 md:right-0 md:top-45 md:translate-y-2 md:mt-0 md:mb-0">
          <div className="mx-auto max-w-5xl rounded-3xl bg-white py-4 px-5 md:py-6 md:px-8 shadow-xl border border-slate-100/80">
            <div className="grid grid-cols-3 gap-x-2 gap-y-4 md:gap-x-8 md:divide-x md:divide-slate-100">
              {filteredStats.map((stat, index) => {
                let IconComponent = BriefcaseBusiness;
                if (stat.label.includes("Doanh nghiệp"))
                  IconComponent = Building2;
                else if (stat.label.includes("Ngành nghề"))
                  IconComponent = Layers;
                else if (
                  stat.label.includes("Khu vực") ||
                  stat.label.includes("Địa điểm")
                )
                  IconComponent = MapPin;
                else if (stat.label.includes("Ứng viên")) IconComponent = Users;

                return (
                  <div
                    className="flex items-center gap-2.5 md:gap-4 text-left md:pl-8 first:pl-0 text-slate-800"
                    key={stat.label}
                  >
                    <IconComponent
                      className="h-7 w-7 md:h-10 md:w-10 text-[#103580] shrink-0"
                      strokeWidth={1.5}
                    />
                    <div className="min-w-0 space-y-1 text-left">
                      <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#103580] leading-none">
                        {stat.value}
                      </p>
                      <p className="text-[10px] md:text-xs font-semibold text-slate-500 truncate">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
