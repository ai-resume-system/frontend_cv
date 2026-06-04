export enum ECareerCategoriesStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export const ECareerCategoriesStatusLabels: Record<
  ECareerCategoriesStatus,
  string
> = {
  [ECareerCategoriesStatus.ACTIVE]: "Đang hoạt động",
  [ECareerCategoriesStatus.INACTIVE]: "Không hoạt động",
};
