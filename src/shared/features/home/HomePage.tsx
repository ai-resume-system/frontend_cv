import { Phone } from "lucide-react";
import Link from "next/link";

import { Header } from "@/shared/components/layouts/Header";
import { Footer } from "@/shared/components/layouts/Footer";
import { HOME_MESSAGES } from "@/shared/constants/constants/messages";
import { CategoryCard } from "@/shared/components/layouts/CategoryCard";
import { HomeSlideshow } from "@/shared/components/layouts/HomeSlideshow";
import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import { FloatingFavoriteButton } from "./FloatingFavoriteButton";
import { HotJobsSection } from "./HotJobsSection";

export default function HomePage() {
  const t = HOME_MESSAGES;

  return (
    <main className="min-h-screen bg-background text-foreground custom-scrollbar">
      <Header />
      <FloatingFavoriteButton />
      <HomeSlideshow />

      <section className="bg-surface px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {t.stats.map((stat) => (
            <div
              className="rounded-xl border border-border bg-muted px-5 py-6 text-center shadow-sm transition-transform hover:-translate-y-1"
              key={stat.label}
            >
              <p className="mb-1 text-4xl font-extrabold text-primary">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <HotJobsSection />

      <section className="bg-muted px-8 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-12 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t.partners.title}
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale md:gap-20">
            {t.partners.logos.map((logo) => (
              <span className="text-2xl font-bold" key={logo}>
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-8 py-24">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8">
              <div className="mb-10 flex items-center justify-between">
                <h4 className="text-lg font-bold">{t.market.title}</h4>
                <span className="rounded-full bg-ai px-3 py-1 text-xs font-bold text-warning">
                  {t.market.badge}
                </span>
              </div>
              <div className="flex h-48 items-end gap-3">
                {t.market.chart.map((height, index) => (
                  <div
                    className="flex-1 rounded-t-lg bg-secondary-soft"
                    key={index}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-6 flex justify-between pt-6 text-xs font-bold uppercase text-muted-foreground">
                {t.market.chartLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-primary">
              {t.market.label}
            </span>
            <h2 className="mb-6 text-4xl font-extrabold leading-tight">
              {t.market.heading}
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              {t.market.description}
            </p>
            <div className="space-y-4">
              {t.market.insights.map((insight) => (
                <div className="flex items-center gap-4" key={insight.text}>
                  <div className={`h-2 w-2 rounded-full ${insight.color}`} />
                  <p className="font-medium">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold text-foreground">
              {t.categories.title}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {t.categories.items.map((cat) => (
              <CategoryCard icon={cat.icon} key={cat.label} label={cat.label} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="relative mx-auto overflow-hidden bg-primary px-6 py-12 sm:px-8 md:px-10 md:py-16">
          <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-extrabold text-white">
                Bạn cần tư vấn nghề nghiệp?
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Trao đổi với chuyên gia tư vấn để nhận định hướng cá nhân hóa
                cho bước đi nghề nghiệp tiếp theo.
              </p>
            </div>
            <Link
              className="flex items-center gap-4 rounded-2xl bg-surface px-10 py-5 text-2xl font-semibold text-primary transition-transform hover:scale-105"
              href={`tel:${INFOMATION_WEB.PHONE}`}
            >
              <Phone aria-hidden="true" className="h-6 w-6" />
              {INFOMATION_WEB.PHONE}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
