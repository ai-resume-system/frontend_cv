import {
  EJobType,
  EJobTypeLabels,
  EJobEducationLevel,
  EJobEducationLevelLabels,
  EJobWorkArrangement,
  EJobWorkArrangementLabels,
} from "@/shared/constants/enums/job.enum";
import type { FetchJobsParams } from "@/shared/services/job.service";
import type { CareerCategory } from "@/shared/types/career-category";

export interface FilterOption<TValue extends string = string> {
  label: string;
  value: TValue;
}

export type JobFilterSortValue = "createdAt" | "updatedAt" | "salary";

export type JobFilterKey =
  | "address"
  | "category"
  | "experience"
  | "salary"
  | "jobType"
  | "educationLevel"
  | "workArrangement"
  | "q"
  | "sort";

export interface JobFilterState {
  address: string;
  category: string;
  experience: string;
  salary: string;
  jobType: string;
  educationLevel: string;
  workArrangement: string;
  q: string;
  sort: JobFilterSortValue;
}

export type HotJobFilterKey = "salary" | "address" | "experience" | "category";

export type JobFilterEmptyValues = Partial<Record<JobFilterKey, string>>;

export type JobFilterQueryBuilder<Key extends JobFilterKey = JobFilterKey> = (
  value: JobFilterState[Key],
  filters: JobFilterState,
) => Partial<FetchJobsParams>;

export const INITIAL_JOB_FILTER_STATE: JobFilterState = {
  address: "",
  category: "",
  experience: "",
  salary: "",
  jobType: "",
  educationLevel: "",
  workArrangement: "",
  q: "",
  sort: "createdAt",
};

export const HOT_JOB_FILTER_LABELS: Record<HotJobFilterKey, string> = {
  salary: "Mức lương",
  address: "Địa điểm",
  experience: "Kinh nghiệm",
  category: "Ngành nghề",
};

export const JOB_EXPERIENCE_OPTIONS: FilterOption[] = [
  { label: "Tất cả kinh nghiệm", value: "" },
  { label: "Chưa có kinh nghiệm", value: "fresher" },
  { label: "1 - 2 năm", value: "1-2" },
  { label: "3 - 4 năm", value: "3-4" },
  { label: "Trên 5 năm", value: "5-plus" },
];

export const JOB_SALARY_OPTIONS: FilterOption[] = [
  { label: "Tất cả mức lương", value: "" },
  { label: "Dưới 10 triệu", value: "under-10" },
  { label: "Từ 10 - 15 triệu", value: "10-15" },
  { label: "Từ 15 - 20 triệu", value: "15-20" },
  { label: "Từ 20 - 25 triệu", value: "20-25" },
  { label: "Từ 25 - 30 triệu", value: "25-30" },
  { label: "Trên 30 triệu", value: "over-30" },
];

export const JOB_TYPE_OPTIONS: FilterOption[] = [
  { label: "Tất cả loại hình", value: "" },
  { label: EJobTypeLabels[EJobType.FULL_TIME], value: EJobType.FULL_TIME },
  { label: EJobTypeLabels[EJobType.PART_TIME], value: EJobType.PART_TIME },
  { label: EJobTypeLabels[EJobType.INTERNSHIP], value: EJobType.INTERNSHIP },
];

export const JOB_EDUCATION_LEVEL_OPTIONS: FilterOption[] = [
  { label: "Tất cả trình độ", value: "" },
  {
    label: EJobEducationLevelLabels[EJobEducationLevel.NONE],
    value: EJobEducationLevel.NONE,
  },
  {
    label: EJobEducationLevelLabels[EJobEducationLevel.COLLEGE],
    value: EJobEducationLevel.COLLEGE,
  },
  {
    label: EJobEducationLevelLabels[EJobEducationLevel.UNIVERSITY],
    value: EJobEducationLevel.UNIVERSITY,
  },
  {
    label: EJobEducationLevelLabels[EJobEducationLevel.POSTGRADUATE],
    value: EJobEducationLevel.POSTGRADUATE,
  },
];

export const JOB_WORK_ARRANGEMENT_OPTIONS: FilterOption[] = [
  { label: "Tất cả hình thức", value: "" },
  {
    label: EJobWorkArrangementLabels[EJobWorkArrangement.ONSITE],
    value: EJobWorkArrangement.ONSITE,
  },
  {
    label: EJobWorkArrangementLabels[EJobWorkArrangement.HYBRID],
    value: EJobWorkArrangement.HYBRID,
  },
  {
    label: EJobWorkArrangementLabels[EJobWorkArrangement.REMOTE],
    value: EJobWorkArrangement.REMOTE,
  },
];

export const JOB_SORT_OPTIONS: FilterOption<JobFilterSortValue>[] = [
  { label: "Ngày đăng", value: "createdAt" },
  { label: "Ngày cập nhật", value: "updatedAt" },
  { label: "Lương cao đến thấp", value: "salary" },
];

export const JOB_FILTER_SEARCH_PARAM_KEYS: Record<JobFilterKey, string> = {
  address: "address",
  category: "category",
  experience: "experience",
  salary: "salary",
  jobType: "jobType",
  educationLevel: "educationLevel",
  workArrangement: "workArrangement",
  q: "q",
  sort: "sort",
};

export const DEFAULT_JOB_FILTER_EMPTY_VALUES: Record<JobFilterKey, string> = {
  address: "",
  category: "",
  experience: "",
  salary: "",
  jobType: "",
  educationLevel: "",
  workArrangement: "",
  q: "",
  sort: "createdAt",
};

export const JOB_FILTER_QUERY_BUILDERS: Record<
  JobFilterKey,
  JobFilterQueryBuilder
> = {
  address: (value) => ({
    address: value || undefined,
  }),
  category: (value) => ({
    careerCategorySlug: value || undefined,
  }),
  experience: (value) => {
    switch (value) {
      case "fresher":
        return {
          experienceYearsMin: 0,
          experienceYearsMax: 0,
        };
      case "1-2":
        return {
          experienceYearsMin: 1,
          experienceYearsMax: 2,
        };
      case "3-4":
        return {
          experienceYearsMin: 3,
          experienceYearsMax: 4,
        };
      case "5-plus":
        return {
          experienceYearsMin: 5,
        };
      default:
        return {};
    }
  },
  salary: (value) => {
    switch (value) {
      case "under-10":
        return {
          salaryMax: 10000000,
        };
      case "10-15":
        return {
          salaryMin: 10000000,
          salaryMax: 15000000,
        };
      case "15-20":
        return {
          salaryMin: 15000000,
          salaryMax: 20000000,
        };
      case "20-25":
        return {
          salaryMin: 20000000,
          salaryMax: 25000000,
        };
      case "25-30":
        return {
          salaryMin: 25000000,
          salaryMax: 30000000,
        };
      case "over-30":
        return {
          salaryMin: 30000000,
        };
      default:
        return {};
    }
  },
  jobType: (value) => ({
    jobType: value || undefined,
  }),
  educationLevel: (value) => ({
    educationLevel: value || undefined,
  }),
  workArrangement: (value) => ({
    workArrangement: value || undefined,
  }),
  q: (value) => ({
    q: value.trim() || undefined,
  }),
  sort: (value) => {
    if (value === "salary") {
      return {
        sortBy: "salaryMax",
        sortOrder: "DESC",
      };
    }
    if (value === "updatedAt") {
      return {
        sortBy: "updatedAt",
        sortOrder: "DESC",
      };
    }
    return {
      sortBy: "createdAt",
      sortOrder: "DESC",
    };
  },
};

export function buildCategoryFilterOptions(
  categories: CareerCategory[],
  {
    includeAll = false,
    allLabel = "Tất cả",
    emptyValue = "",
  }: {
    includeAll?: boolean;
    allLabel?: string;
    emptyValue?: string;
  } = {},
): FilterOption[] {
  const options = categories
    .filter((category) => category.slug)
    .map((category) => ({
      label: category.name,
      value: category.slug ?? "",
    }));

  return includeAll
    ? [{ label: allLabel, value: emptyValue }, ...options]
    : options;
}

export function mapFilterOptionsEmptyValue<TValue extends string>(
  options: FilterOption<TValue>[],
  emptyValue: string,
): FilterOption[] {
  return options.map((option, index) =>
    index === 0
      ? {
          ...option,
          value: emptyValue,
        }
      : option,
  );
}

export function isDefaultFilterValue(
  key: JobFilterKey,
  value: string,
  emptyValues: JobFilterEmptyValues = {},
): boolean {
  return value === (emptyValues[key] ?? DEFAULT_JOB_FILTER_EMPTY_VALUES[key]);
}

export function omitEmptyFilterValues(
  filters: JobFilterState,
  emptyValues: JobFilterEmptyValues = {},
): Partial<JobFilterState> {
  const entries = (Object.entries(filters) as Array<[JobFilterKey, string]>)
    .filter(([key, value]) => !isDefaultFilterValue(key, value, emptyValues))
    .map(([key, value]) => [key, value]);

  return Object.fromEntries(entries) as Partial<JobFilterState>;
}
