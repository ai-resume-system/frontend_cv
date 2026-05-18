import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type {
  AuthUser,
  ILoginPayload,
  IRegisterJobSeekerPayload,
  IRegisterRecruiterPayload,
  IResponseLogin,
  ISendOtpPayload,
  IVerifyOtpPayload,
} from "@/shared/types/auth";
import type { IResponseApiItem } from "@/shared/types/api";

export async function login(payload: ILoginPayload): Promise<IResponseLogin> {
  const response = await apiService.post<
    IResponseApiItem<IResponseLogin>,
    ILoginPayload
  >(API_ROUTES.AUTH.LOGIN, payload);

  console.log("login:", response);

  return response.data;
}

export function registerJobSeeker(
  payload: IRegisterJobSeekerPayload,
): Promise<IResponseApiItem<AuthUser>> {
  return apiService.post<IResponseApiItem<AuthUser>, IRegisterJobSeekerPayload>(
    API_ROUTES.AUTH.REGISTER_JOBSEEKER,
    payload,
  );
}

export function registerRecruiter(
  payload: IRegisterRecruiterPayload,
): Promise<IResponseApiItem<AuthUser>> {
  return apiService.post<IResponseApiItem<AuthUser>, IRegisterRecruiterPayload>(
    API_ROUTES.AUTH.REGISTER_RECRUITER,
    payload,
  );
}

export function sendOtp(
  payload: ISendOtpPayload,
): Promise<IResponseApiItem<AuthUser>> {
  return apiService.post<IResponseApiItem<AuthUser>, ISendOtpPayload>(
    API_ROUTES.AUTH.SEND_OTP,
    payload,
  );
}

export function verifyOtp(
  payload: IVerifyOtpPayload,
): Promise<IResponseApiItem<AuthUser>> {
  return apiService.post<IResponseApiItem<AuthUser>, IVerifyOtpPayload>(
    API_ROUTES.AUTH.VERIFY_OTP,
    payload,
  );
}
