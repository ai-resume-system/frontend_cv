import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CompanyDetailPage } from "@/portals/jobseeker/features/company/CompanyDetailPage";
import { fetchCompanyBySlug } from "@/shared/services/company.service";

interface CompanyDetailRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CompanyDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const company = await fetchCompanyBySlug(slug);

    return {
      title: company.name ?? "Chi tiết công ty",
    };
  } catch {
    return {
      title: "Chi tiết công ty",
    };
  }
}

export default async function CompanyDetailRoute({
  params,
}: CompanyDetailRouteProps) {
  const { slug } = await params;
  try {
    const company = await fetchCompanyBySlug(slug);

    return <CompanyDetailPage company={company} />;
  } catch {
    notFound();
  }
}
