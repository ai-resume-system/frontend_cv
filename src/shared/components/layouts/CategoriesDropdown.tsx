"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import { ROUTES } from "@/shared/constants/constants/routes";
import { useCareerCategories } from "@/shared/hooks/data/useCareerCategories";
import { HOME_MESSAGES } from "@/shared/constants/constants/messages";

export function CategoriesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { categories, error, loading } = useCareerCategories({ limit: 10 });
  const t = HOME_MESSAGES;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative flex h-10 items-center">
      <button
        className="flex h-10 items-center gap-1 rounded-lg px-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span>{t.nav.jobs}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-50 mt-4 w-[min(88vw,720px)] overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          <div className="grid gap-x-6 gap-y-4 p-4 sm:grid-cols-2">
            {loading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <div
                    className="h-5 animate-pulse rounded bg-muted"
                    key={index}
                  />
                ))
              : categories.map((category) => (
                  <Link
                    className="group inline-flex items-center text-base font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    href={`${ROUTES.JOBS}?careerCategoryId=${category.id}`}
                    key={category.id}
                    onClick={() => setIsOpen(false)}
                  >
                    Việc làm {category.name}
                    <ArrowRight className="h-4 w-4 translate-x-0 opacity-0 transition-all duration-200 group-hover:translate-x-2 group-hover:opacity-100" />
                  </Link>
                ))}
          </div>

          {!loading && error ? (
            <p className="px-6 pb-4 text-sm text-muted-foreground">
              {t.categories.error}
            </p>
          ) : null}

          {!loading && !error && categories.length === 0 ? (
            <p className="px-6 pb-4 text-sm text-muted-foreground">
              {t.categories.empty}
            </p>
          ) : null}

          <div className="border-t border-border px-6 py-4">
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-all hover:gap-3 hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              href={ROUTES.JOBS}
              onClick={() => setIsOpen(false)}
            >
              {t.categories.viewMore}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
