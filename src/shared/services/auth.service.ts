import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type {
  ApiResponse,
  AuthMessageResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from "@/shared/types/auth";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiService.post<ApiResponse<LoginResponse>, LoginPayload>(
    API_ROUTES.AUTH.LOGIN,
    payload,
  );

  return response.data;
}

export function registerJobSeeker(
  payload: RegisterPayload,
): Promise<AuthMessageResponse> {
  return apiService.post<AuthMessageResponse, RegisterPayload>(
    API_ROUTES.AUTH.REGISTER_JOBSEEKER,
    payload,
  );
}

export function registerRecruiter(
  payload: RegisterPayload,
): Promise<AuthMessageResponse> {
  return apiService.post<AuthMessageResponse, RegisterPayload>(
    API_ROUTES.AUTH.REGISTER_RECRUITER,
    payload,
  );
}
