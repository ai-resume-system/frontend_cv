import type { Metadata } from "next";

import { FavouritesPage } from "@/portals/jobseeker/features/favourites/FavouritesPage";

export const metadata: Metadata = {
  title: "Yêu thích",
};

export default function FavouritesRoute() {
  return <FavouritesPage />;
}
