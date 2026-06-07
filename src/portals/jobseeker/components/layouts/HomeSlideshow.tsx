"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ROUTES } from "@/shared/constants/constants/routes";
import { cn } from "@/shared/lib/utils/cn";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    title: "Tìm việc dễ dàng",
    subtitle:
      "Kết nối với các công ty uy tín và tìm được công việc phù hợp với bạn",
    ctaText: "Khám phá ngay",
    ctaLink: ROUTES.JOBS,
    image: "/search-job.png",
  },
  {
    id: 2,
    title: "AI phân tích hồ sơ của bạn",
    subtitle:
      "Nhận điểm phân tích phù hợp và gợi ý cải thiện từ trí tuệ nhân tạo",
    ctaText: "Phân tích ngay",
    ctaLink: ROUTES.JOB_SEEKER_ANALYSIS,
    image: "/chatbot-ai.webp",
  },
  {
    id: 3,
    title: "Nhà tuyển dụng tìm ứng viên",
    subtitle: "Ưu tiên ứng viên theo điểm AI phù hợp chính xác nhất",
    ctaText: "Đăng tin tuyển dụng",
    ctaLink: ROUTES.RECRUITER_REGISTER,
    image: "/recruite-ai.webp",
  },
];

export function HomeSlideshow() {
  const [current, setCurrent] = useState(0);
  const slides = defaultSlides;

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [goNext]);

  const slide = slides[current];

  return (
    <section className="relative h-[500px] w-full overflow-hidden bg-secondary">
      <div className="absolute inset-0 transition-opacity duration-1000">
        <Image
          alt={slide.title}
          className="object-cover"
          fill
          priority
          src={slide.image}
        />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center px-8 py-20 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold drop-shadow-lg md:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90 drop-shadow-md md:text-xl">
            {slide.subtitle}
          </p>
          <Link
            className="mt-8 flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-primary-hover"
            href={slide.ctaLink}
          >
            {slide.ctaText}
            <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((item, index) => (
          <button
            aria-label={`Chuyển đến slide ${item.id}`}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === current ? "w-8 bg-white" : "w-2 bg-white/40",
            )}
            key={item.id}
            onClick={() => goTo(index)}
            type="button"
          />
        ))}
      </div>

      <button
        aria-label="Slide trước"
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-foreground/30 p-3 text-white transition-colors hover:bg-foreground/50"
        onClick={goPrev}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="h-6 w-6" />
      </button>
      <button
        aria-label="Slide tiếp theo"
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-foreground/30 p-3 text-white transition-colors hover:bg-foreground/50"
        onClick={goNext}
        type="button"
      >
        <ChevronRight aria-hidden="true" className="h-6 w-6" />
      </button>
    </section>
  );
}
