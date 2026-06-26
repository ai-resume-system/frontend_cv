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
  RefreshCw,
} from "lucide-react";
import { fetchJobMatch } from "@/shared/services/job.service";
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
import { Badge } from "@/shared/components/ui/Badge";

const MAX_FILE_SIZE_MB = 10;

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
  matchingScore: number;
  isMatchingLoading: boolean;
}

function CvSelectionSection({
  cvList,
  selectedCvId,
  setSelectedCvId,
  uploadedFile,
  setUploadedFile,
  fileInputRef,
  isLoadingCvList,
  matchingScore,
  isMatchingLoading,
}: CvSelectionSectionProps) {
  const [showCvModal, setShowCvModal] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      void showErrorAlert(`File CV không được vượt quá ${MAX_FILE_SIZE_MB}MB.`);
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
    const defaultCv = cvList.find((cv) => cv.isDefault) ?? cvList[0];
    if (defaultCv) {
      setSelectedCvId(defaultCv.id);
    } else {
      setSelectedCvId("");
    }
  }

  const selectedSystemCv =
    cvList.find((cv) => cv.id === selectedCvId) ??
    cvList.find((cv) => cv.isDefault) ??
    cvList[0];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-on-surface">Chọn CV ứng tuyển</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isLoadingCvList ? (
          <div className="col-span-full rounded-2xl bg-slate-50 border border-slate-200 p-5 text-sm text-slate-500 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-primary animate-spin mr-2" />
            Đang tải danh sách CV...
          </div>
        ) : (
          <>
            {/* Cột 1: CV trên hệ thống */}
            {selectedSystemCv ? (
              <label
                className="group relative cursor-pointer"
                onClick={() => {
                  setSelectedCvId(selectedSystemCv.id);
                  setUploadedFile(null);
                }}
              >
                <input
                  checked={selectedCvId === selectedSystemCv.id}
                  className="peer sr-only"
                  name="cv_selection"
                  type="radio"
                  value={selectedSystemCv.id}
                  onChange={() => {}}
                />
                <div
                  className={cn(
                    "flex h-full flex-col rounded-2xl border-2 bg-white p-5 transition-all duration-300",
                    selectedCvId === selectedSystemCv.id
                      ? "border-primary shadow-sm"
                      : "border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                        selectedCvId === selectedSystemCv.id
                          ? "border-primary bg-primary"
                          : "border-slate-350",
                      )}
                    >
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full bg-white transition-opacity",
                          selectedCvId === selectedSystemCv.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </div>

                    {/* Badge match score */}
                    <div className="shrink-0">
                      {isMatchingLoading &&
                      selectedCvId === selectedSystemCv.id ? (
                        <Badge className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                          <RefreshCw className="h-3 w-3 animate-spin" /> Đang
                          tính...
                        </Badge>
                      ) : selectedCvId === selectedSystemCv.id &&
                        matchingScore > 0 ? (
                        <Badge className="inline-flex items-center rounded-full bg-[#5af5b7]/15 border border-[#5af5b7]/40 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          Phù hợp {matchingScore}%
                        </Badge>
                      ) : (
                        <Badge className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                          {selectedCvId === selectedSystemCv.id
                            ? "Chưa có điểm"
                            : "Hệ thống"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2 overflow-hidden mb-3">
                    <div className="overflow-hidden">
                      <p
                        className="font-bold text-on-surface text-base truncate"
                        title={selectedSystemCv.title ?? "CV không tiêu đề"}
                      >
                        {selectedSystemCv.title ?? "CV không tiêu đề"}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {selectedSystemCv.createdAt &&
                          `Tải lên ${new Intl.DateTimeFormat("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }).format(new Date(selectedSystemCv.createdAt))}`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center w-full gap-2">
                    {selectedSystemCv.isDefault && (
                      <span className="inline-flex items-center rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-bold text-primary">
                        Mặc định
                      </span>
                    )}

                    {cvList.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCvModal(true);
                        }}
                        className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer select-none"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Đổi CV
                      </button>
                    )}
                  </div>
                </div>
              </label>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-transparent p-5 text-center text-sm text-on-surface-variant">
                Chưa có hồ sơ trong tài khoản
              </div>
            )}

            {/* Cột 2: Tải CV mới lên hoặc CV tạm đã tải lên */}
            {uploadedFile ? (
              <label
                key="uploaded-cv-radio"
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
                    "flex h-full flex-col rounded-2xl border-2 bg-white p-5 transition-all duration-300",
                    selectedCvId === "new_upload"
                      ? "border-primary shadow-sm"
                      : "border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                        selectedCvId === "new_upload"
                          ? "border-primary bg-primary"
                          : "border-slate-350",
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
                      className="rounded-full bg-red-50 hover:bg-red-100 border border-red-200 p-1 text-xs font-bold text-red-600 transition cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="overflow-hidden mr-2 mb-3">
                    <p
                      className="font-bold text-on-surface text-base truncate"
                      title={uploadedFile.name}
                    >
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="mt-auto">
                    <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      Hồ sơ tạm thời
                    </span>
                  </div>
                </div>
              </label>
            ) : (
              <label
                key="upload-cv-file"
                className="group relative cursor-pointer"
              >
                <input
                  accept=".pdf,.docx"
                  className="hidden"
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                />
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant bg-transparent p-5 text-center transition-all duration-300 hover:border-primary hover:bg-slate-50">
                  <FileUp className="mb-2 h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-bold text-on-surface">
                    Tải CV mới lên
                  </p>
                  <p className="mt-1 text-[10px] text-on-surface-variant">
                    PDF, DOCX (Max {MAX_FILE_SIZE_MB}MB)
                  </p>
                </div>
              </label>
            )}
          </>
        )}
      </div>

      {/* Modal chọn CV */}
      {showCvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">
                Chọn CV ứng tuyển
              </h3>
              <button
                type="button"
                onClick={() => setShowCvModal(false)}
                className="text-slate-400 hover:text-slate-655 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {cvList.map((cv) => (
                <button
                  key={cv.id}
                  type="button"
                  onClick={() => {
                    setSelectedCvId(cv.id);
                    setUploadedFile(null);
                    setShowCvModal(false);
                  }}
                  className={cn(
                    "w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 hover:bg-slate-50 cursor-pointer",
                    selectedCvId === cv.id
                      ? "border-primary bg-blue-50/10"
                      : "border-slate-200",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all mt-0.5",
                      selectedCvId === cv.id
                        ? "border-primary bg-primary"
                        : "border-slate-350",
                    )}
                  >
                    {selectedCvId === cv.id && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-850 text-sm leading-tight">
                      {cv.title || "CV không tiêu đề"}
                    </p>
                    <p className="text-[11px] text-slate-455 mt-1">
                      {cv.isDefault && (
                        <span className="font-bold text-primary mr-2">
                          Mặc định
                        </span>
                      )}
                      {cv.createdAt &&
                        `Tải lên ${new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(cv.createdAt))}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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

  // States for matching score integration
  const [matchingScore, setMatchingScore] = useState<number>(0);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);

  const [coverLetter, setCoverLetter] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cvToShow = cvList.find((cv) => cv.isDefault) ?? cvList[0];

  // Sắp xếp CV của user: đưa isDefault lên đầu
  const sortedCvList = [...cvList].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

  useEffect(() => {
    if (cvToShow && !selectedCvId && !uploadedFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCvId(cvToShow.id);
    }
  }, [cvToShow, selectedCvId, uploadedFile]);

  // Tải điểm match của CV được chọn
  useEffect(() => {
    if (selectedCvId && selectedCvId !== "new_upload") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMatchingLoading(true);
      fetchJobMatch(job.slug ?? job.id, selectedCvId)
        .then((res) => {
          setMatchingScore(res?.matchScore || 0);
        })
        .catch((err) => {
          console.error("Fetch job match failed in apply page:", err);
          setMatchingScore(0);
        })
        .finally(() => {
          setIsMatchingLoading(false);
        });
    } else {
      setMatchingScore(0);
    }
  }, [selectedCvId, job.slug, job.id]);

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
                cvList={sortedCvList}
                selectedCvId={selectedCvId}
                setSelectedCvId={setSelectedCvId}
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
                fileInputRef={fileInputRef}
                isLoadingCvList={isLoadingCvList}
                matchingScore={matchingScore}
                isMatchingLoading={isMatchingLoading}
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
