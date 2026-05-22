"use client";

import {
  FileText,
  KeyRound,
  Pen,
  RotateCcw,
  Save,
  Shield,
  ShieldCheck,
  User,
  User2,
  UserRound,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Footer } from "@/shared/components/layouts/Footer";
import { Header } from "@/shared/components/layouts/Header";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";

import { AvatarUploadModal } from "./AvatarUploadModal";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { useProfileForm } from "./useProfileForm";

const SIDEBAR_TABS = ["personal", "security", "cv"] as const;
type SidebarTab = (typeof SIDEBAR_TABS)[number];

const SIDEBAR_ITEMS: {
  key: SidebarTab;
  label: string;
  icon: React.ReactNode;
}[] = [
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
    label: "Quản lý CV",
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

  const sectionRefs = {
    personal: useRef<HTMLFormElement>(null),
    security: useRef<HTMLElement>(null),
    cv: useRef<HTMLElement>(null),
  };

  const {
    form,
    getVisibleError,
    handleFieldBlur,
    handleSubmit,
    isLoading,
    isSubmitting,
    resetForm,
    user,
    updateField,
  } = useProfileForm();

  useEffect(() => {
    const elements = SIDEBAR_TABS.map((key) => sectionRefs[key].current).filter(
      Boolean,
    ) as Element[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = SIDEBAR_TABS.find(
              (k) => sectionRefs[k].current === entry.target,
            );
            if (key) setActiveTab(key);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [user]);

  function openChangePasswordModal() {
    setIsChangePasswordOpen(true);
  }

  function closeChangePasswordModal() {
    setIsChangePasswordOpen(false);
    if (hasChangePasswordQuery) {
      router.replace(pathname, { scroll: false });
    }
  }

  const handleSidebarClick = useCallback((key: SidebarTab) => {
    setActiveTab(key);
    isClickScrolling.current = true;

    const el = sectionRefs[key].current;
    if (!el) return;

    const targetY = el.getBoundingClientRect().top + window.scrollY - 112;
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = Math.min(1000, Math.max(400, Math.abs(distance) * 0.8));
    let startTime: number | null = null;

    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        isClickScrolling.current = false;
      }
    }

    requestAnimationFrame(step);
  }, []);

  if (isLoading && !user) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="mx-auto max-w-7xl px-8 py-12">
          <div className="space-y-4">
            <div className="h-4 w-40 animate-pulse rounded-full bg-surface-container" />
            <div className="h-10 w-80 animate-pulse rounded-xl bg-surface-container" />
          </div>
          <div className="mt-10 flex gap-10">
            <div className="hidden w-64 space-y-2 lg:block">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
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
        <Footer />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
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
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Sidebar - sticky with smooth active indicator */}
          <aside className="w-full lg:sticky lg:top-24 lg:w-64 lg:self-start">
            <nav className="relative rounded-xl bg-surface-container-high border border-muted-foreground/20 p-1">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-300 ease-out ${
                      isActive
                        ? "bg-surface-container-lowest font-bold text-primary shadow-sm"
                        : "font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                    onClick={() => handleSidebarClick(item.key)}
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

          {/* Main Content */}
          <div className="flex-1 space-y-10">
            {/* Section: Personal Info */}
            <form
              ref={sectionRefs.personal}
              className="scroll-mt-28 rounded-xl bg-surface-container-lowest border-2 border-muted-foreground/20 p-8 shadow-sm transition-shadow duration-300 hover:shadow-md"
              noValidate
              onSubmit={handleSubmit}
              id="profile-form"
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-4 font-display text-xl font-bold text-on-surface">
                    <User className="h-5 w-5 text-primary" />
                    Cài đặt thông tin cá nhân
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-3">
                    Cập nhật ảnh đại diện và chi tiết hồ sơ cá nhân của bạn. ({" "}
                    <span className="text-red-500">(*)</span> Các thông tin bắt
                    buộc )
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-10 md:flex-row">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="group relative">
                    {form.avatarUrl ? (
                      <img
                        alt="Avatar"
                        className="h-32 w-32 rounded-full border-4 border-surface-container-low object-cover transition-transform duration-300"
                        src={form.avatarUrl ?? "/user-default.png"}
                      />
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-full border-3 border-primary/50 bg-surface-container transition-transform duration-300">
                        <UserRound className="h-16 w-16 text-on-surface-variant" />
                      </div>
                    )}
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-secondary-container p-2 text-on-primary shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                      onClick={() => setIsAvatarUploadOpen(true)}
                    >
                      <Pen className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-md text-center text-outline">
                    Chào mừng bạn,
                    <br />
                    <span className="font-semibold text-on-surface">
                      {form.fullName}
                    </span>
                  </p>
                </div>

                {/* Form Fields */}
                <div className="flex flex-1 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="col-span-1">
                    <BaseField
                      error={getVisibleError("fullName")}
                      id="profileFullName"
                      label="Họ và tên"
                      placeholder="Nhập họ và tên"
                      value={form.fullName}
                      onBlur={() => handleFieldBlur("fullName")}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <BaseField
                      error={getVisibleError("phone")}
                      id="profilePhone"
                      label="Số điện thoại"
                      placeholder="Nhập số điện thoại"
                      value={form.phone}
                      onBlur={() => handleFieldBlur("phone")}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>

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
                      label="Giới thiệu bản thân (Bio)"
                      placeholder="Viết ngắn gọn về kinh nghiệm, định hướng hoặc thế mạnh của bạn."
                      value={form.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      inputClassName="resize-none h-32"
                    />
                  </div>

                  {/* Action Bar */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex justify-end gap-4">
                      <BaseButton
                        variant="secondary"
                        type="button"
                        onClick={resetForm}
                        startIcon={<RotateCcw className="h-4 w-4" />}
                      >
                        Hủy bỏ
                      </BaseButton>
                      <BaseButton
                        type="submit"
                        form="profile-form"
                        loading={isSubmitting}
                        startIcon={<Save className="h-4 w-4" />}
                      >
                        Lưu thay đổi
                      </BaseButton>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Section: Security */}
            <section
              ref={sectionRefs.security}
              className="scroll-mt-28 rounded-xl bg-surface-container-lowest border-2 border-muted-foreground/20 p-8 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="mb-8 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-on-surface">
                  Bảo mật &amp; Đăng nhập
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
                    variant="secondary"
                    type="button"
                    onClick={openChangePasswordModal}
                    startIcon={<KeyRound className="h-4 w-4" />}
                  >
                    Đổi mật khẩu
                  </BaseButton>
                </div>
              </div>
            </section>

            {/* Section: CV Management placeholder */}
            <section
              ref={sectionRefs.cv}
              className="scroll-mt-28 rounded-xl bg-surface-container-lowest border-2 border-muted-foreground/20 p-8 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="mb-4 flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-on-surface">
                  Quản lý CV
                </h2>
              </div>
              <p className="text-sm text-on-surface-variant">
                Tính năng đang được phát triển.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
      <AvatarUploadModal
        isOpen={isAvatarUploadOpen}
        onClose={() => setIsAvatarUploadOpen(false)}
        onUploaded={(url) => updateField("avatarUrl", url)}
        currentAvatarUrl={form.avatarUrl}
      />
      <ChangePasswordModal
        isOpen={isModalVisible}
        onClose={closeChangePasswordModal}
      />
    </main>
  );
}
