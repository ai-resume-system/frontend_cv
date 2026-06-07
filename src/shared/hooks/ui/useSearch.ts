"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ROUTES } from "@/shared/constants/constants/routes";
import { getErrorDisplayMessage } from "@/shared/lib/errors/getErrorDisplayMessage";
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

interface SearchSuggestion {
  type: "category" | "skill-parent" | "skill-child";
  id: string;
  name: string;
  slug?: string;
  parentName?: string;
  categoryName?: string;
  categorySlug?: string;
}

interface CategoryOption {
  id: string;
  slug: string;
}

const EMPTY_SKILL_SLUGS: string[] = [];

function removeVietnameseTones(str: string): string {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|R|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

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
  const [skillsError, setSkillsError] = useState("");
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
        setSkillsError("");
        const { skills } = await fetchSkills({
          page: 1,
          limit: 500,
        });

        if (!cancelled) {
          setAllSkills(skills);
        }
      } catch (error) {
        if (!cancelled) {
          setAllSkills([]);
          setSkillsError(
            getErrorDisplayMessage(
              error,
              "Không thể tải danh sách nghề và kỹ năng. Vui lòng thử lại sau.",
            ),
          );
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
  const searchNormalized = removeVietnameseTones(searchTerm.trim());

  const categoryBySlug = useMemo(
    () => new Map(categories.map((item) => [item.slug, item])),
    [categories],
  );

  const skillsByCategory = useMemo(() => {
    const groupedSkills = new Map<string, SkillNode[]>();

    for (const skill of allSkills) {
      if (!skill.careerCategoryId) {
        continue;
      }

      const categorySkills = groupedSkills.get(skill.careerCategoryId) ?? [];

      categorySkills.push({
        ...skill,
        children: skill.children ?? [],
      });
      groupedSkills.set(skill.careerCategoryId, categorySkills);
    }

    return groupedSkills;
  }, [allSkills]);

  const flatSkills = useMemo(() => {
    const flattenedSkills: SkillApiItem[] = [];

    for (const parentSkill of allSkills) {
      flattenedSkills.push({
        ...parentSkill,
        children: undefined,
      });

      for (const childSkill of parentSkill.children ?? []) {
        flattenedSkills.push(childSkill);
      }
    }

    return flattenedSkills;
  }, [allSkills]);

  const filteredCategories = useMemo(() => {
    if (!searchLowercase) {
      return categories;
    }

    return categories.filter((item) =>
      removeVietnameseTones(item.name).includes(searchNormalized),
    );
  }, [categories, searchLowercase, searchNormalized]);

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
      const parentMatch = removeVietnameseTones(item.name).includes(
        searchNormalized,
      );
      const childMatch = item.children.some((childSkill) =>
        removeVietnameseTones(childSkill.name).includes(searchNormalized),
      );

      return parentMatch || childMatch;
    });
  }, [activeSkills, searchLowercase, searchNormalized]);

  const visibleChildSkills = useMemo(() => {
    if (!activeParentSkill) {
      return [];
    }

    if (!searchLowercase) {
      return activeParentSkill.children;
    }

    return activeParentSkill.children.filter((item) =>
      removeVietnameseTones(item.name).includes(searchNormalized),
    );
  }, [activeParentSkill, searchLowercase, searchNormalized]);

  const selectedSkillItems = useMemo(() => {
    const selectedSlugs = new Set(skillSlugs);

    return flatSkills.filter(
      (item) => item.slug && selectedSlugs.has(item.slug),
    );
  }, [flatSkills, skillSlugs]);

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

  const getDescendantSkillSlugs = useCallback((skill: SkillNode): string[] => {
    const nextSlugs = new Set<string>();

    if (skill.slug) {
      nextSlugs.add(skill.slug);
    }

    for (const childSkill of skill.children) {
      if (childSkill.slug) {
        nextSlugs.add(childSkill.slug);
      }
    }

    return Array.from(nextSlugs);
  }, []);

  const getCategorySkillSlugs = useCallback(
    (categoryId: string): string[] => {
      const nextSlugs = new Set<string>();
      const categorySkills = skillsByCategory.get(categoryId) ?? [];

      for (const skill of categorySkills) {
        for (const slug of getDescendantSkillSlugs(skill)) {
          nextSlugs.add(slug);
        }
      }

      return Array.from(nextSlugs);
    },
    [getDescendantSkillSlugs, skillsByCategory],
  );

  const areAllSlugsSelected = useCallback(
    (requiredSlugs: string[], selectedSlugs: string[]) =>
      requiredSlugs.length > 0 &&
      requiredSlugs.every((slug) => selectedSlugs.includes(slug)),
    [],
  );

  const isCategoryFullySelected = useCallback(
    (categoryId: string, selectedSlugs: string[]) =>
      areAllSlugsSelected(getCategorySkillSlugs(categoryId), selectedSlugs),
    [areAllSlugsSelected, getCategorySkillSlugs],
  );

  const isParentSkillFullySelected = useCallback(
    (skill: SkillNode, selectedSlugs: string[]) =>
      areAllSlugsSelected(getDescendantSkillSlugs(skill), selectedSlugs),
    [areAllSlugsSelected, getDescendantSkillSlugs],
  );

  const selectedDraftCategoryCount = useMemo(() => {
    if (!draftCategory) {
      return 0;
    }

    const draftCategoryItem = categories.find((item) => item.slug === draftCategory);

    if (!draftCategoryItem) {
      return 0;
    }

    return isCategoryFullySelected(draftCategoryItem.id, draftSkillSlugs) ? 1 : 0;
  }, [categories, draftCategory, draftSkillSlugs, isCategoryFullySelected]);

  const selectedFilterCategoryCount = useMemo(() => {
    if (!category) {
      return 0;
    }

    const categoryItem = categories.find((item) => item.slug === category);

    if (!categoryItem) {
      return 0;
    }

    return isCategoryFullySelected(categoryItem.id, skillSlugs) ? 1 : 0;
  }, [categories, category, isCategoryFullySelected, skillSlugs]);

  const selectedFilterCount = selectedFilterCategoryCount + skillSlugs.length;
  const selectedDraftCount = selectedDraftCategoryCount + draftSkillSlugs.length;

  const toggleDraftCategory = useCallback(
    (nextCategory: CategoryOption) => {
      const categorySkillSlugs = getCategorySkillSlugs(nextCategory.id);

      setDraftCategory((currentCategory) => {
        const isSameCategory = currentCategory === nextCategory.slug;

        setDraftSkillSlugs((currentSkillSlugs) => {
          const hasAllCategorySlugs = categorySkillSlugs.every((slug) =>
            currentSkillSlugs.includes(slug),
          );

          if (isSameCategory && hasAllCategorySlugs) {
            return [];
          }

          return categorySkillSlugs;
        });

        return isSameCategory ? "" : nextCategory.slug;
      });

      setActiveCategoryId(nextCategory.id);
    },
    [getCategorySkillSlugs],
  );

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

  const toggleDraftParentSkill = useCallback(
    (skill: SkillNode) => {
      const relatedSlugs = getDescendantSkillSlugs(skill);

      setDraftSkillSlugs((currentSkillSlugs) => {
        const hasAllRelatedSlugs = relatedSlugs.every((slug) =>
          currentSkillSlugs.includes(slug),
        );

        if (hasAllRelatedSlugs) {
          return currentSkillSlugs.filter((slug) => !relatedSlugs.includes(slug));
        }

        return Array.from(new Set([...currentSkillSlugs, ...relatedSlugs]));
      });

      if (activeCategory?.slug) {
        setDraftCategory(activeCategory.slug);
      }
      setActiveParentSkillId(skill.id);
    },
    [activeCategory?.slug, getDescendantSkillSlugs],
  );

  const searchSuggestions = useMemo(() => {
    if (!searchLowercase) {
      return [];
    }

    const suggestions: SearchSuggestion[] = [];

    // 1. Tìm các category khớp
    for (const cat of categories) {
      const catNormalized = removeVietnameseTones(cat.name);
      if (catNormalized.includes(searchNormalized)) {
        suggestions.push({
          type: "category",
          id: cat.id,
          name: cat.name,
          slug: cat.slug ?? undefined,
        });
      }
    }

    const catMap = new Map(
      categories.map((item) => [item.id, { name: item.name, slug: item.slug }]),
    );

    // 2. Tìm các kĩ năng khớp
    for (const parentSkill of allSkills) {
      const categoryInfo = parentSkill.careerCategoryId
        ? catMap.get(parentSkill.careerCategoryId)
        : undefined;
      const parentNormalized = removeVietnameseTones(parentSkill.name);

      if (parentNormalized.includes(searchNormalized)) {
        suggestions.push({
          type: "skill-parent",
          id: parentSkill.id,
          name: parentSkill.name,
          slug: parentSkill.slug ?? undefined,
          categoryName: categoryInfo?.name ?? undefined,
          categorySlug: categoryInfo?.slug ?? undefined,
        });
      }

      for (const childSkill of parentSkill.children ?? []) {
        const childNormalized = removeVietnameseTones(childSkill.name);

        if (childNormalized.includes(searchNormalized)) {
          suggestions.push({
            type: "skill-child",
            id: childSkill.id,
            name: childSkill.name,
            slug: childSkill.slug ?? undefined,
            parentName: parentSkill.name,
            categoryName: categoryInfo?.name ?? undefined,
            categorySlug: categoryInfo?.slug ?? undefined,
          });
        }
      }
    }

    return suggestions.slice(0, 15);
  }, [allSkills, categories, searchLowercase, searchNormalized]);

  const handleSelectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    let finalCategory = category;
    let finalSkillSlugs = [...skillSlugs];

    if (suggestion.type === "category") {
      finalCategory = suggestion.slug ?? "";
      setCategory(finalCategory);
      setDraftCategory(finalCategory);
      const nextCategory = categories.find((item) => item.slug === finalCategory);
      finalSkillSlugs = nextCategory
        ? getCategorySkillSlugs(nextCategory.id)
        : [];
      setSkillSlugs(finalSkillSlugs);
      setDraftSkillSlugs(finalSkillSlugs);
    } else if (suggestion.type === "skill-parent") {
      finalCategory = suggestion.categorySlug ?? "";
      setCategory(finalCategory);
      setDraftCategory(finalCategory);
      const parentSkill = allSkills.find((item) => item.id === suggestion.id);

      if (parentSkill) {
        finalSkillSlugs = getDescendantSkillSlugs({
          ...parentSkill,
          children: parentSkill.children ?? [],
        });
        setSkillSlugs(finalSkillSlugs);
        setDraftSkillSlugs(finalSkillSlugs);
      }
    } else if (suggestion.type === "skill-child") {
      finalCategory = suggestion.categorySlug ?? "";
      setCategory(finalCategory);
      setDraftCategory(finalCategory);

      if (suggestion.slug) {
        if (!finalSkillSlugs.includes(suggestion.slug)) {
          finalSkillSlugs.push(suggestion.slug);
        }
        setSkillSlugs(finalSkillSlugs);
        setDraftSkillSlugs(finalSkillSlugs);
      }
    }

    setSearchTerm("");
    setIsCategoryOpen(false); // Đóng panel luôn

    // Tự động kích hoạt hành vi search lên URL (Click ăn ngay)
    const searchParams = new URLSearchParams(searchParamsHook?.toString() ?? "");
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

    if (finalCategory) {
      searchParams.set("careerCategorySlug", finalCategory);
      searchParams.set("category", finalCategory);
    } else {
      searchParams.delete("careerCategorySlug");
      searchParams.delete("category");
    }

    if (finalSkillSlugs.length) {
      searchParams.set("skillSlugs", finalSkillSlugs.join(","));
    } else {
      searchParams.delete("skillSlugs");
    }

    searchParams.delete("page");

    const query = searchParams.toString();
    router.push(query ? `${ROUTES.JOBS}?${query}` : ROUTES.JOBS);
  }, [address, allSkills, categories, category, getCategorySkillSlugs, getDescendantSkillSlugs, keyword, router, searchParamsHook, skillSlugs]);

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
    isCategoryFullySelected,
    isParentSkillFullySelected,
    setActiveCategoryId,
    setActiveParentSkillId,
    setAddress,
    toggleDraftCategory,
    toggleDraftParentSkill,
    setDraftCategory,
    setKeyword,
    setSearchTerm,
    skillsLoading,
    skillsError,
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
    searchSuggestions,
    handleSelectSuggestion,
    allSkills: flatSkills,
  };
}
