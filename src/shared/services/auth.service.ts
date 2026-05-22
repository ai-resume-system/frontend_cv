import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type {
  ForgotPasswordPayload,
  ILoginPayload,
  IRegisterJobSeekerPayload,
  IRegisterRecruiterPayload,
  IResponseLogin,
  ISendOtpPayload,
  IVerifyOtpPayload,
  VerifyOtpForgotPasswordResponseData,
} from "@/shared/types/auth";
import type { IResponseApiItem } from "@/shared/types/api";

type AuthActionResponse = IResponseApiItem<null>;
type VerifyOtpResponse = IResponseApiItem<null | VerifyOtpForgotPasswordResponseData>;

export async function login(payload: ILoginPayload): Promise<IResponseLogin> {
  const response = await apiService.post<
    IResponseApiItem<IResponseLogin>,
    ILoginPayload
  >(API_ROUTES.AUTH.LOGIN, payload);

  return response.data;
}

export function registerJobSeeker(
  payload: IRegisterJobSeekerPayload,
): Promise<AuthActionResponse> {
  return apiService.post<AuthActionResponse, IRegisterJobSeekerPayload>(
    API_ROUTES.AUTH.REGISTER_JOBSEEKER,
    payload,
  );
}

export function registerRecruiter(
  payload: IRegisterRecruiterPayload,
): Promise<AuthActionResponse> {
  return apiService.post<AuthActionResponse, IRegisterRecruiterPayload>(
    API_ROUTES.AUTH.REGISTER_RECRUITER,
    payload,
  );
}

export function sendOtp(payload: ISendOtpPayload): Promise<AuthActionResponse> {
  return apiService.post<AuthActionResponse, ISendOtpPayload>(
    API_ROUTES.AUTH.SEND_OTP,
    payload,
  );
}

export function verifyOtp(payload: IVerifyOtpPayload): Promise<VerifyOtpResponse> {
  return apiService.post<VerifyOtpResponse, IVerifyOtpPayload>(
    API_ROUTES.AUTH.VERIFY_OTP,
    payload,
  );
}

export function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<AuthActionResponse> {
  return apiService.post<AuthActionResponse, ForgotPasswordPayload>(
    API_ROUTES.AUTH.FORGOT_PASSWORD,
    payload,
  );
}
