import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type { IResponseApiItem } from "@/shared/types/api";
import type {
  ApplicationApiItem,
  CreateApplicationPayload,
} from "@/shared/types/application";

export async function createJobApplication(
  payload: CreateApplicationPayload,
): Promise<ApplicationApiItem> {
  const response = await apiService.post<
    IResponseApiItem<ApplicationApiItem>,
    CreateApplicationPayload
  >(API_ROUTES.APPLICATION.BASE, payload, {
    auth: true,
  });

  return response.data;
}
