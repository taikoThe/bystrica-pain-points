import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { reports: true } },
    },
  });

  return <CategoriesClient categories={categories} />;
}
