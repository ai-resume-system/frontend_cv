"use client";

import {
  FileText,
  KeyRound,
  Pen,
  RotateCcw,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";
import { useAvatarRefreshOnError } from "@/shared/hooks/data/useAvatarRefreshOnError";

import { AvatarUploadModal } from "./AvatarUploadModal";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { useProfileForm } from "./useProfileForm";
import { JOBSEEKER_ROUTES } from "@/shared/constants/constants/routes";
import Link from "next/link";

type SidebarTab = "personal" | "security" | "cv";

const SIDEBAR_ITEMS: Array<{
  key: SidebarTab;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    key: "personal",
    label: "Thông tin cá nhân",
    icon: <User className="h-5 w-5" />,
  },
  {
    key: "security",
    label: "Bảo mật",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    key: "cv",
    label: "Quản lý hồ sơ",
    icon: <FileText className="h-5 w-5" />,
  },
];

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<SidebarTab>("personal");
  const [isAvatarUploadOpen, setIsAvatarUploadOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const isClickScrolling = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasChangePasswordQuery =
    searchParams.get("modal") === "change-password";
  const isModalVisible = isChangePasswordOpen || hasChangePasswordQuery;
  const personalSectionRef = useRef<HTMLElement>(null);
  const securitySectionRef = useRef<HTMLElement>(null);
  const cvSectionRef = useRef<HTMLElement>(null);

  const {
    form,
    getVisibleError,
    handleFieldBlur,
    handleSubmit,
    isLoading,
    isSubmitting,
    refreshUser,
    resetForm,
    user,
    updateField,
  } = useProfileForm();

  const avatarUrl = user?.profile?.avatarUrl || "/user-default.png";
  const { handleError: handleAvatarError } = useAvatarRefreshOnError({
    src: user?.profile?.avatarUrl ?? null,
    onRefresh: refreshUser,
  });

  useEffect(() => {
    const sections: Array<[SidebarTab, HTMLElement | null]> = [
      ["personal", personalSectionRef.current],
      ["security", securitySectionRef.current],
      ["cv", cvSectionRef.current],
    ];
    const elements = sections
      .map(([, element]) => element)
      .filter(Boolean) as Element[];

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) {
          return;
        }

        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const key = sections.find(
            ([, element]) => element === entry.target,
          )?.[0];

          if (key) {
            setActiveTab(key);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [cvSectionRef, personalSectionRef, securitySectionRef]);

  function openChangePasswordModal() {
    setIsChangePasswordOpen(true);
  }

  function closeChangePasswordModal() {
    setIsChangePasswordOpen(false);

    if (hasChangePasswordQuery) {
      router.replace(pathname, { scroll: false });
    }
  }

  const handleSidebarClick = useCallback(
    (key: SidebarTab) => {
      setActiveTab(key);
      isClickScrolling.current = true;

      const element =
        key === "personal"
          ? personalSectionRef.current
          : key === "security"
            ? securitySectionRef.current
            : cvSectionRef.current;
      if (!element) {
        return;
      }

      const targetY =
        element.getBoundingClientRect().top + window.scrollY - 112;
      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = Math.min(1000, Math.max(400, Math.abs(distance) * 0.8));
      let startTime: number | null = null;

      function easeInOutCubic(value: number) {
        return value < 0.5
          ? 4 * value * value * value
          : 1 - Math.pow(-2 * value + 2, 3) / 2;
      }

      function step(timestamp: number) {
        if (!startTime) {
          startTime = timestamp;
        }

        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        window.scrollTo(0, startY + distance * eased);

        if (progress < 1) {
          requestAnimationFrame(step);
          return;
        }

        isClickScrolling.current = false;
      }

      requestAnimationFrame(step);
    },
    [cvSectionRef, personalSectionRef, securitySectionRef],
  );

  if (isLoading && !user) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="space-y-4">
          <div className="h-4 w-40 animate-pulse rounded-full bg-surface-container" />
          <div className="h-10 w-80 animate-pulse rounded-xl bg-surface-container" />
        </div>
        <div className="mt-10 flex gap-10">
          <div className="hidden w-64 space-y-2 lg:block">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-12 animate-pulse rounded-lg bg-surface-container"
              />
            ))}
          </div>
          <div className="flex-1 space-y-6">
            <div className="h-64 animate-pulse rounded-xl bg-surface-container" />
            <div className="h-48 animate-pulse rounded-xl bg-surface-container" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="rounded-xl bg-surface-container-lowest p-8 shadow-sm">
          <h2 className="font-headline text-2xl font-semibold text-on-surface">
            Bạn chưa đăng nhập
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-on-surface-variant">
            Vui lòng đăng nhập để xem và cập nhật thông tin cá nhân.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="w-full lg:sticky lg:top-24 lg:w-64 lg:self-start">
            <nav className="relative rounded-xl border border-muted-foreground/20 bg-surface-container-high p-1">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = activeTab === item.key;

                return (
                  <button
                    key={item.key}
                    className={`relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-300 ease-out ${
                      isActive
                        ? "bg-surface-container-lowest font-bold text-primary shadow-sm"
                        : "font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                    onClick={() => handleSidebarClick(item.key)}
                    type="button"
                  >
                    <span
                      className={`transition-transform duration-300 ease-out ${
                        isActive ? "scale-110" : "scale-100"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex-1 space-y-10">
            <section
              ref={personalSectionRef}
              className="scroll-mt-28 rounded-xl border-2 border-muted-foreground/20 bg-surface-container-lowest p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-col xl:gap-6 xl:flex-row xl:items-start">
                <div className="xl:w-[280px] xl:shrink-0 flex flex-col items-center text-center p-6">
                  <div className="relative shrink-0">
                    <img
                      alt="Ảnh đại diện"
                      className="h-32 w-32 rounded-full border-4 border-gray-300 object-cover shadow-md"
                      onError={
                        user.profile?.avatarUrl ? handleAvatarError : undefined
                      }
                      src={avatarUrl}
                    />
                    <button
                      className="absolute bottom-1 right-1 rounded-full bg-secondary-container p-2 text-on-primary shadow-lg transition-all hover:scale-110"
                      onClick={() => setIsAvatarUploadOpen(true)}
                      type="button"
                    >
                      <Pen className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-1 hidden xl:flex xl:flex-col">
                    <p className="text-on-surface-variant">
                      Chào mừng bạn trở lại,
                    </p>
                    <p className="text-xl font-semibold text-on-surface">
                      {form.fullName || "Người dùng"}
                    </p>
                  </div>
                </div>

                <form
                  className="flex-1"
                  id="profile-form"
                  noValidate
                  onSubmit={handleSubmit}
                >
                  <div className="hidden xl:flex xl:flex-col xl:mb-4">
                    <h2 className="font-display text-xl font-bold text-on-surface">
                      Thông tin cá nhân
                    </h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      <span className="text-red-500">(*)</span> Các thông tin
                      bắt buộc
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <BaseField
                      error={getVisibleError("fullName")}
                      id="profileFullName"
                      label="Họ và tên"
                      onBlur={() => handleFieldBlur("fullName")}
                      onChange={(event) =>
                        updateField("fullName", event.target.value)
                      }
                      placeholder="Nhập họ và tên"
                      required
                      value={form.fullName}
                    />

                    <BaseField
                      error={getVisibleError("phone")}
                      id="profilePhone"
                      label="Số điện thoại"
                      onBlur={() => handleFieldBlur("phone")}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      placeholder="Nhập số điện thoại"
                      value={form.phone}
                    />

                    <div className="col-span-1 md:col-span-2">
                      <BaseField
                        id="profileEmail"
                        inputClassName="cursor-not-allowed bg-surface-container text-on-surface-variant"
                        label="Email cá nhân"
                        readOnly
                        value={form.email}
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <BaseField
                        as="textarea"
                        id="profileBio"
                        inputClassName="h-32 resize-none"
                        label="Giới thiệu bản thân (Bio)"
                        onChange={(event) =>
                          updateField("bio", event.target.value)
                        }
                        placeholder="Viết ngắn gọn về kinh nghiệm, định hướng hoặc thế mạnh của bạn."
                        value={form.bio}
                      />
                    </div>

                    <p className="flex xl:hidden xl:flex-col text-sm text-on-surface-variant gap-2">
                      <span className="text-red-500">(*)</span> Các thông tin
                      bắt buộc
                    </p>

                    <div className="col-span-1 flex justify-end gap-4 md:col-span-2">
                      <BaseButton
                        onClick={resetForm}
                        startIcon={<RotateCcw className="h-4 w-4" />}
                        type="button"
                        variant="secondary"
                      >
                        Hủy bỏ
                      </BaseButton>
                      <BaseButton
                        loading={isSubmitting}
                        startIcon={<Save className="h-4 w-4" />}
                        type="submit"
                      >
                        Lưu thay đổi
                      </BaseButton>
                    </div>
                  </div>
                </form>
              </div>
            </section>

            <section
              ref={securitySectionRef}
              className="scroll-mt-28 rounded-xl border-2 border-muted-foreground/20 bg-surface-container-lowest p-8 shadow-sm"
            >
              <div className="mb-8 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-on-surface">
                  Bảo mật và đăng nhập
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-xl bg-surface-container-high p-6 transition-colors duration-200 hover:bg-surface-container md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="mb-1 font-bold text-on-surface">Mật khẩu</h3>
                    <p className="text-sm text-on-surface-variant">
                      Cập nhật mật khẩu định kỳ để bảo vệ tài khoản.
                    </p>
                  </div>
                  <BaseButton
                    onClick={openChangePasswordModal}
                    startIcon={<KeyRound className="h-4 w-4" />}
                    type="button"
                    variant="secondary"
                  >
                    Đổi mật khẩu
                  </BaseButton>
                </div>
              </div>
            </section>

            <section
              ref={cvSectionRef}
              className="scroll-mt-28 rounded-xl border-2 border-muted-foreground/20 bg-surface-container-lowest p-8 shadow-sm"
            >
              <div className="flex flex-col gap-4 duration-200 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-xl font-bold text-on-surface">
                      Quản lý hồ sơ
                    </h2>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Tải lên, xem và quản lý các hồ sơ của bạn.{" "}
                    <Link
                      className="text-primary underline hover:opacity-80"
                      href={JOBSEEKER_ROUTES.CV}
                    >
                      Mở trang quản lý hồ sơ
                    </Link>
                  </p>
                </div>
                <Link
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-muted-foreground/30 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                  href={JOBSEEKER_ROUTES.CV}
                >
                  <FileText className="h-4 w-4" />
                  Quản lý hồ sơ của bạn
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
      <AvatarUploadModal
        currentAvatarUrl={avatarUrl}
        isOpen={isAvatarUploadOpen}
        onClose={() => setIsAvatarUploadOpen(false)}
        onUploaded={() => void refreshUser()}
      />
      <ChangePasswordModal
        isOpen={isModalVisible}
        onClose={closeChangePasswordModal}
      />
    </>
  );
}
