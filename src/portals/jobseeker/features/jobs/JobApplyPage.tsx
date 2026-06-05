"use client";

import {
  ArrowLeft,
  Banknote,
  Briefcase,
  CheckCircle,
  FileUp,
  MapPin,
  Send,
  Shield,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ROUTES } from "@/shared/constants/constants/routes";
import { useCvList } from "@/shared/hooks/data/useCvList";
import { useAuth } from "@/shared/hooks/ui/useAuthState";
import { showAppAlert, showErrorAlert } from "@/shared/lib/ui/alert";
import { getErrorDisplayMessage } from "@/shared/lib/errors/getErrorDisplayMessage";
import { createJobApplication } from "@/shared/services/application.service";
import { uploadCv } from "@/shared/services/cv.service";
import type { Job } from "@/shared/types/job";
import type { CvItem } from "@/shared/types/cv";
import { formatSalary } from "@/shared/lib/helpers/formatPrice.helper";
import { cn } from "@/shared/lib/utils/cn";
import { BaseField } from "@/shared/components/ui/BaseField";

interface JobApplyPageProps {
  job: Job;
}

function getCompanyLabel(job: Job): string {
  return job.company?.name ?? "Doanh nghiệp";
}

function formatJobType(job: Job): string {
  if (job.jobType === "full_time") return "Toàn thời gian";
  if (job.jobType === "part_time") return "Bán thời gian";
  return "Thực tập";
}

// ==================== SUB-COMPONENT 1: THÔNG TIN CÔNG TY & YÊU CẦU ====================
interface CompanyInfoAsideProps {
  job: Job;
}

function CompanyInfoAside({ job }: CompanyInfoAsideProps) {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const companyName = getCompanyLabel(job);

  return (
    <aside className="space-y-6 lg:col-span-4">
      <div className="rounded-[28px] bg-surface-container-highest/80 p-8 shadow-sm">
        <div className="mb-6">
          <img
            alt={job.title ?? "Công ty"}
            className="h-20 w-20 object-cover rounded-2xl"
            src={job.company?.logoUrl ?? "/logo.png"}
          />
          <h2 className="mt-4 text-xl font-bold text-on-surface leading-tight">
            {job.title}
          </h2>
          <p className="mt-1 font-semibold text-on-surface-variant">
            {companyName}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <span>
              {job.address ?? job.company?.address ?? "Đang cập nhật"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <Banknote className="h-5 w-5 text-primary shrink-0" />
            <span className="font-semibold text-primary">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <Briefcase className="h-5 w-5 text-primary shrink-0" />
            <span>{formatJobType(job)}</span>
          </div>
        </div>

        {job.shortDescription && (
          <div className="mt-8 border-t border-outline-variant pt-8">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Mô tả công việc ngắn gọn
            </h3>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {job.shortDescription}
            </p>
          </div>
        )}

        <div className="mt-8 border-t border-outline-variant pt-8">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Yêu cầu chính
          </h3>
          <ul className="space-y-3">
            {job.skills?.length ? (
              <>
                <p className="font-bold text-on-surface-variant text-sm">
                  Thành thạo:
                </p>
                {(showAllSkills ? job.skills : job.skills.slice(0, 5)).map(
                  (skill) => (
                    <li
                      className="flex items-start gap-2 text-sm text-on-surface-variant animate-in fade-in duration-200"
                      key={skill.id}
                    >
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                      <span>{skill.name}</span>
                    </li>
                  ),
                )}
                {job.skills.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllSkills(!showAllSkills)}
                    className="mt-1 text-xs font-bold text-primary hover:underline cursor-pointer text-left block"
                  >
                    {showAllSkills ? "Thu gọn" : "Xem thêm"}
                  </button>
                )}
              </>
            ) : null}
            {typeof job.experienceYears === "number" &&
              job.experienceYears > 0 && (
                <li className="text-sm text-on-surface-variant pt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <span>{job.experienceYears} năm kinh nghiệm</span>
                  </div>
                </li>
              )}
          </ul>
        </div>
      </div>
    </aside>
  );
}

// ==================== SUB-COMPONENT 2: CHỌN CV ỨNG TUYỂN (2 CỘT) ====================
interface CvSelectionSectionProps {
  cvList: CvItem[];
  selectedCvId: string;
  setSelectedCvId: (id: string) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isLoadingCvList: boolean;
}

function CvSelectionSection({
  cvList,
  selectedCvId,
  setSelectedCvId,
  uploadedFile,
  setUploadedFile,
  fileInputRef,
  isLoadingCvList,
}: CvSelectionSectionProps) {
  const cvToShow = cvList.find((cv) => cv.isDefault) ?? cvList[0];

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      void showErrorAlert("File CV không được vượt quá 10MB.");
      return;
    }

    setUploadedFile(file);
    setSelectedCvId("new_upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRemoveUploadedFile() {
    setUploadedFile(null);
    if (cvToShow) {
      setSelectedCvId(cvToShow.id);
    } else {
      setSelectedCvId("");
    }
  }

  return (
    <section>
      <h3 className="mb-6 text-xl font-bold text-on-surface">
        Chọn CV ứng tuyển
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isLoadingCvList ? (
          <div className="col-span-full rounded-2xl bg-surface-container-low p-5 text-sm text-on-surface-variant">
            Đang tải danh sách CV...
          </div>
        ) : (
          <>
            {cvToShow ? (
              <label
                className="group relative cursor-pointer"
                onClick={() => {
                  setSelectedCvId(cvToShow.id);
                  setUploadedFile(null);
                }}
              >
                <input
                  checked={selectedCvId === cvToShow.id}
                  className="peer sr-only"
                  name="cv_selection"
                  type="radio"
                  value={cvToShow.id}
                  onChange={() => {}}
                />
                <div
                  className={cn(
                    "flex h-full flex-col rounded-2xl border-2 bg-surface-container-low p-5 transition-all duration-300 group-hover:bg-surface-container-high",
                    selectedCvId === cvToShow.id
                      ? "border-primary bg-white shadow-sm"
                      : "border-transparent",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                        selectedCvId === cvToShow.id
                          ? "border-primary bg-primary"
                          : "border-outline-variant",
                      )}
                    >
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full bg-white transition-opacity",
                          selectedCvId === cvToShow.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </div>
                  </div>
                  <p className="mb-1 font-bold text-on-surface">
                    {cvToShow.title ?? "CV không tiêu đề"}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {cvToShow.createdAt &&
                      `Tải lên ${new Intl.DateTimeFormat("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(new Date(cvToShow.createdAt))}`}
                  </p>
                </div>
              </label>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-transparent p-5 text-center text-sm text-on-surface-variant">
                Chưa có hồ sơ trong tài khoản
              </div>
            )}

            {uploadedFile ? (
              <label
                className="group relative cursor-pointer"
                onClick={() => setSelectedCvId("new_upload")}
              >
                <input
                  checked={selectedCvId === "new_upload"}
                  className="peer sr-only"
                  name="cv_selection"
                  type="radio"
                  value="new_upload"
                  onChange={() => {}}
                />
                <div
                  className={cn(
                    "flex h-full flex-col rounded-2xl border-2 bg-surface-container-low p-5 transition-all duration-300 group-hover:bg-surface-container-high",
                    selectedCvId === "new_upload"
                      ? "border-primary bg-white shadow-sm"
                      : "border-transparent",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                        selectedCvId === "new_upload"
                          ? "border-primary bg-primary"
                          : "border-outline-variant",
                      )}
                    >
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full bg-white transition-opacity",
                          selectedCvId === "new_upload"
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveUploadedFile();
                      }}
                      className="rounded-full bg-error/10 p-1 text-xs font-bold text-error hover:bg-error/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p
                    className="mb-1 font-bold text-on-surface line-clamp-1"
                    title={uploadedFile.name}
                  >
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </label>
            ) : (
              <label className="group relative cursor-pointer">
                <input
                  accept=".pdf,.docx"
                  className="hidden"
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                />
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant bg-transparent p-5 text-center transition-all duration-300 hover:border-primary hover:bg-surface-container-low">
                  <FileUp className="mb-2 h-8 w-8 text-primary" />
                  <p className="text-sm font-bold text-on-surface">
                    Tải CV mới lên
                  </p>
                  <p className="mt-1 text-[10px] text-on-surface-variant">
                    PDF, DOCX (Max 10MB)
                  </p>
                </div>
              </label>
            )}
          </>
        )}
      </div>

      {selectedCvId && selectedCvId !== "new_upload" && cvToShow ? (
        <p className="mt-3 text-xs text-on-surface-variant">
          Đã chọn:{" "}
          <span className="font-semibold text-on-surface">
            {cvToShow.title ?? "CV không tiêu đề"}
          </span>
        </p>
      ) : uploadedFile ? (
        <p className="mt-3 text-xs text-on-surface-variant">
          Đã chọn:{" "}
          <span className="font-semibold text-on-surface">
            {uploadedFile.name} (Hồ sơ tạm)
          </span>
        </p>
      ) : null}
    </section>
  );
}

function SafetyNotice() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
          i
        </div>
        <div className="space-y-2.5 text-[11px] leading-relaxed text-slate-700">
          <h4 className="font-bold text-slate-800 text-xs">Lưu ý:</h4>
          <p>Hồ sơ sau khi ứng tuyển sẽ được lưu vào hệ thống</p>
        </div>
      </div>
    </section>
  );
}

// ==================== COMPONENT CHÍNH ====================
export function JobApplyPage({ job }: JobApplyPageProps) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { cvList, isLoading: isLoadingCvList } = useCvList();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);

  const [coverLetter, setCoverLetter] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cvToShow = cvList.find((cv) => cv.isDefault) ?? cvList[0];

  useEffect(() => {
    if (cvToShow && !selectedCvId && !uploadedFile) {
      setSelectedCvId(cvToShow.id);
    }
  }, [cvToShow, selectedCvId, uploadedFile]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace(ROUTES.JOB_SEEKER_LOGIN);
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  // Điền thông tin cá nhân từ tài khoản của người dùng khi được click chủ động
  function handleUseAccountInfo() {
    if (!user) return;
    setFullName(user.profile?.fullName || "");
    setContactPhone(user.phone || "");
    setContactEmail(user.email || "");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedCvId) {
      void showErrorAlert(
        "Bạn cần chọn hoặc tải lên một CV trước khi ứng tuyển.",
      );
      return;
    }

    if (!fullName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      void showErrorAlert(
        "Vui lòng điền đầy đủ họ tên, email và số điện thoại.",
      );
      return;
    }

    setIsSubmitting(true);
    let finalCvId = selectedCvId;

    // Tiến hành upload file ngầm nếu chọn file mới tải lên
    if (selectedCvId === "new_upload" && uploadedFile) {
      try {
        const newCv = await uploadCv(uploadedFile);
        finalCvId = newCv.id;
      } catch (error) {
        void showErrorAlert(
          getErrorDisplayMessage(
            error,
            "Tải lên CV mới thất bại. Vui lòng thử lại.",
          ),
        );
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await createJobApplication({
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        coverLetter: coverLetter.trim() || undefined,
        cvId: finalCvId,
        fullName: fullName.trim(),
        jobId: job.id,
      });

      await showAppAlert({
        title: "Ứng tuyển thành công",
        text: "Hồ sơ của bạn đã được gửi tới nhà tuyển dụng.",
      });

      router.push(ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug ?? job.id));
    } catch (error) {
      void showErrorAlert(
        getErrorDisplayMessage(error, "Không thể ứng tuyển công việc này."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="bg-surface px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href={ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug ?? job.id)}
          className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest">
            Quay lại chi tiết công việc
          </span>
        </Link>

        <h1 className="mb-5 text-2xl font-bold tracking-tight sm:text-3xl">
          Ứng tuyển vị trí
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Cột thông tin công ty */}
          <CompanyInfoAside job={job} />

          {/* Cột thông tin ứng tuyển */}
          <div className="rounded-[28px] bg-white p-8 shadow-md border border-gray-300 lg:col-span-8">
            <form className="space-y-8" onSubmit={handleSubmit}>
              <CvSelectionSection
                cvList={cvList}
                selectedCvId={selectedCvId}
                setSelectedCvId={setSelectedCvId}
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
                fileInputRef={fileInputRef}
                isLoadingCvList={isLoadingCvList}
              />

              <section className="border-t border-outline-variant pt-8">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-xs font-bold tracking-widest text-on-surface-variant">
                    Vui lòng nhập đủ thông tin liên hệ
                    <span className="text-error">
                      {" "}
                      (* là thông tin bắt buộc)
                    </span>
                  </h3>
                  {user && (
                    <button
                      type="button"
                      onClick={handleUseAccountInfo}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer select-none"
                    >
                      <User className="h-3.5 w-3.5" />
                      Sử dụng thông tin cá nhân
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <BaseField
                    id="fullName"
                    label="Họ và tên"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    required
                    value={fullName || ""}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                  <BaseField
                    id="contactPhone"
                    label="Số điện thoại"
                    type="tel"
                    placeholder="+84 908 123 456"
                    required
                    value={contactPhone || ""}
                    onChange={(event) => setContactPhone(event.target.value)}
                  />
                  <BaseField
                    id="contactEmail"
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    required
                    value={contactEmail || ""}
                    onChange={(event) => setContactEmail(event.target.value)}
                    wrapperClassName="md:col-span-2"
                  />
                  <BaseField
                    as="textarea"
                    id="coverLetter"
                    label="Thư giới thiệu"
                    placeholder="Chia sẻ thêm về kinh nghiệm và lý do bạn phù hợp với vị trí này..."
                    rows={5}
                    value={coverLetter || ""}
                    onChange={(event) => setCoverLetter(event.target.value)}
                    wrapperClassName="md:col-span-2"
                    inputClassName="resize-y min-h-28"
                  />
                </div>
              </section>

              <div className="space-y-6">
                <SafetyNotice />

                <div className="flex w-full items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsAgreed(!isAgreed)}
                    className="flex items-start gap-3 text-left text-sm text-on-surface-variant hover:text-on-surface cursor-pointer select-none transition-colors group"
                  >
                    <div className="mt-0.5 shrink-0">
                      {isAgreed ? (
                        <ShieldCheck className="h-5 w-5 text-green-500 fill-green-50 animate-in zoom-in duration-150" />
                      ) : (
                        <Shield className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm leading-relaxed">
                      Tôi đã đọc và đồng ý với{" "}
                      <Link
                        href={ROUTES.JOB_SEEKER_PRIVACY}
                        target="_blank"
                        className="font-semibold text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Chính sách bảo mật
                      </Link>
                      .
                    </span>
                  </button>
                  <button
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-10 py-4 text-base font-bold text-white shadow-lg transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto cursor-pointer"
                    disabled={isSubmitting || !isAgreed}
                    type="submit"
                  >
                    <Send className="h-5 w-5" />
                    {isSubmitting ? "Đang gửi hồ sơ..." : "Xác nhận ứng tuyển"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
