"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ROUTES } from "@/shared/constants/constants/routes";
import { useCareerCategories } from "@/shared/hooks/data/useCareerCategories";
import { fetchSkills } from "@/shared/services/skill.service";
import type { SkillApiItem } from "@/shared/types/skill";

interface UseSearchOptions {
  initialKeyword?: string;
  initialAddress?: string;
  initialCategory?: string;
  initialSkillSlugs?: string[];
}

interface SkillNode extends SkillApiItem {
  children: SkillApiItem[];
}

const EMPTY_SKILL_SLUGS: string[] = [];

export function useSearch({
  initialKeyword = "",
  initialAddress = "",
  initialCategory = "",
  initialSkillSlugs = EMPTY_SKILL_SLUGS,
}: UseSearchOptions) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const initialSkillSlugsRef = useRef(initialSkillSlugs);
  const { categories, loading: categoriesLoading } = useCareerCategories({
    page: 1,
    limit: 1000,
  });

  const [keyword, setKeyword] = useState(initialKeyword);
  const [address, setAddress] = useState(initialAddress);
  const [category, setCategory] = useState(initialCategory);
  const [skillSlugs, setSkillSlugs] = useState<string[]>(initialSkillSlugs);
  const [allSkills, setAllSkills] = useState<SkillApiItem[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [draftCategory, setDraftCategory] = useState(initialCategory);
  const [draftSkillSlugs, setDraftSkillSlugs] =
    useState<string[]>(initialSkillSlugs);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeParentSkillId, setActiveParentSkillId] = useState<string | null>(
    null,
  );

  const initialSkillSlugsKey = useMemo(
    () => initialSkillSlugs.join(","),
    [initialSkillSlugs],
  );

  useEffect(() => {
    initialSkillSlugsRef.current = initialSkillSlugs;
  }, [initialSkillSlugs, initialSkillSlugsKey]);

  useEffect(() => {
    setKeyword(initialKeyword);
    setAddress(initialAddress);
    setCategory(initialCategory);
    setSkillSlugs([...initialSkillSlugsRef.current]);
    setDraftCategory(initialCategory);
    setDraftSkillSlugs([...initialSkillSlugsRef.current]);
  }, [initialAddress, initialCategory, initialKeyword, initialSkillSlugsKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadSkills() {
      try {
        setSkillsLoading(true);
        const { skills } = await fetchSkills({
          page: 1,
          limit: 500,
        });

        if (!cancelled) {
          setAllSkills(skills);
        }
      } finally {
        if (!cancelled) {
          setSkillsLoading(false);
        }
      }
    }

    void loadSkills();

    return () => {
      cancelled = true;
    };
  }, []);

  const closeCategoryPanel = useCallback(() => {
    setIsCategoryOpen(false);
    setSearchTerm("");
    setDraftCategory(category);
    setDraftSkillSlugs(skillSlugs);
  }, [category, skillSlugs]);

  useEffect(() => {
    if (!isCategoryOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        closeCategoryPanel();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeCategoryPanel, isCategoryOpen]);

  const searchLowercase = searchTerm.trim().toLowerCase();

  const categoryBySlug = useMemo(
    () => new Map(categories.map((item) => [item.slug, item])),
    [categories],
  );

  const skillsByCategory = useMemo(() => {
    const groupedSkills = new Map<string, SkillNode[]>();

    for (const skill of allSkills) {
      if (!skill.careerCategoryId || skill.parentId) {
        continue;
      }

      const categorySkills = groupedSkills.get(skill.careerCategoryId) ?? [];
      const children = allSkills.filter(
        (childSkill) => childSkill.parentId === skill.id,
      );

      categorySkills.push({
        ...skill,
        children,
      });
      groupedSkills.set(skill.careerCategoryId, categorySkills);
    }

    return groupedSkills;
  }, [allSkills]);

  const filteredCategories = useMemo(() => {
    if (!searchLowercase) {
      return categories;
    }

    return categories.filter((item) =>
      item.name.toLowerCase().includes(searchLowercase),
    );
  }, [categories, searchLowercase]);

  useEffect(() => {
    if (!filteredCategories.length) {
      setActiveCategoryId(null);
      return;
    }

    const preferredCategory =
      filteredCategories.find((item) => item.slug === draftCategory) ??
      filteredCategories[0];

    setActiveCategoryId(preferredCategory?.id ?? null);
  }, [draftCategory, filteredCategories]);

  const activeCategory = useMemo(
    () =>
      filteredCategories.find((item) => item.id === activeCategoryId) ??
      filteredCategories[0] ??
      null,
    [activeCategoryId, filteredCategories],
  );

  const activeSkills = useMemo(
    () =>
      activeCategory ? (skillsByCategory.get(activeCategory.id) ?? []) : [],
    [activeCategory, skillsByCategory],
  );

  useEffect(() => {
    if (!activeSkills.length) {
      setActiveParentSkillId(null);
      return;
    }

    const preferredParent =
      activeSkills.find((item) => draftSkillSlugs.includes(item.slug ?? "")) ??
      activeSkills[0];

    setActiveParentSkillId(preferredParent?.id ?? null);
  }, [activeSkills, draftSkillSlugs]);

  const activeParentSkill =
    activeSkills.find((item) => item.id === activeParentSkillId) ??
    activeSkills[0] ??
    null;

  const visibleParentSkills = useMemo(() => {
    if (!searchLowercase) {
      return activeSkills;
    }

    return activeSkills.filter((item) => {
      const parentMatch = item.name.toLowerCase().includes(searchLowercase);
      const childMatch = item.children.some((childSkill) =>
        childSkill.name.toLowerCase().includes(searchLowercase),
      );

      return parentMatch || childMatch;
    });
  }, [activeSkills, searchLowercase]);

  const visibleChildSkills = useMemo(() => {
    if (!activeParentSkill) {
      return [];
    }

    if (!searchLowercase) {
      return activeParentSkill.children;
    }

    return activeParentSkill.children.filter((item) =>
      item.name.toLowerCase().includes(searchLowercase),
    );
  }, [activeParentSkill, searchLowercase]);

  const selectedSkillItems = useMemo(() => {
    const selectedSlugs = new Set(skillSlugs);

    return allSkills.filter(
      (item) => item.slug && selectedSlugs.has(item.slug),
    );
  }, [allSkills, skillSlugs]);

  const categoryDisplayLabel = useMemo(() => {
    const parts: string[] = [];

    if (category) {
      parts.push(categoryBySlug.get(category)?.name ?? "Danh mục nghề");
    }

    if (selectedSkillItems.length) {
      parts.push(...selectedSkillItems.map((item) => item.name));
    }

    return parts.length ? parts.join(", ") : "Danh mục nghề";
  }, [category, categoryBySlug, selectedSkillItems]);

  const selectedFilterCount = Number(Boolean(category)) + skillSlugs.length;
  const selectedDraftCount =
    Number(Boolean(draftCategory)) + draftSkillSlugs.length;

  const toggleDraftSkill = useCallback((slug: string) => {
    setDraftSkillSlugs((currentState) =>
      currentState.includes(slug)
        ? currentState.filter((item) => item !== slug)
        : [...currentState, slug],
    );
  }, []);

  const applyDraftSelection = useCallback(() => {
    setCategory(draftCategory);
    setSkillSlugs(draftSkillSlugs);
    setIsCategoryOpen(false);
    setSearchTerm("");
  }, [draftCategory, draftSkillSlugs]);

  const resetDraftSelection = useCallback(() => {
    setDraftCategory("");
    setDraftSkillSlugs([]);
    setSearchTerm("");
  }, []);

  const openCategoryPanel = useCallback(() => {
    setDraftCategory(category);
    setDraftSkillSlugs(skillSlugs);
    setIsCategoryOpen((currentState) => !currentState);
  }, [category, skillSlugs]);

  const handleSearch = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      const searchParams = new URLSearchParams(
        searchParamsHook?.toString() ?? "",
      );

      if (keyword.trim()) {
        searchParams.set("q", keyword.trim());
      } else {
        searchParams.delete("q");
      }

      if (address.trim()) {
        searchParams.set("address", address.trim());
      } else {
        searchParams.delete("address");
      }

      if (category) {
        searchParams.set("careerCategorySlug", category);
        searchParams.set("category", category);
      } else {
        searchParams.delete("careerCategorySlug");
        searchParams.delete("category");
      }

      if (skillSlugs.length) {
        searchParams.set("skillSlugs", skillSlugs.join(","));
      } else {
        searchParams.delete("skillSlugs");
      }

      searchParams.delete("page");

      const query = searchParams.toString();
      router.push(query ? `${ROUTES.JOBS}?${query}` : ROUTES.JOBS);
    },
    [address, category, keyword, router, searchParamsHook, skillSlugs],
  );

  return {
    activeCategory,
    activeParentSkill,
    categoriesLoading,
    closeCategoryPanel,
    draftCategory,
    draftSkillSlugs,
    dropdownRef,
    filteredCategories,
    handleSearch,
    isCategoryOpen,
    keyword,
    openCategoryPanel,
    searchTerm,
    selectedDraftCount,
    selectedFilterCount,
    setActiveCategoryId,
    setActiveParentSkillId,
    setAddress,
    setDraftCategory,
    setKeyword,
    setSearchTerm,
    skillsLoading,
    skillSlugs,
    triggerRef,
    toggleDraftSkill,
    address,
    applyDraftSelection,
    category,
    categoryDisplayLabel,
    resetDraftSelection,
    visibleChildSkills,
    visibleParentSkills,
  };
}
