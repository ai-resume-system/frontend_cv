import type { Metadata } from "next";

import { FavoritesPage } from "@/shared/features/jobs/FavoritesPage";

export const metadata: Metadata = {
  title: "Yêu thích",
};

export default function FavoritesRoute() {
  return <FavoritesPage />;
}
