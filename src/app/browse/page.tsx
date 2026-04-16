import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BrowseClient } from "./BrowseClient";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const [reports, categories, user] = await Promise.all([
    prisma.report.findMany({
      include: {
        category: true,
        _count: { select: { confirmations: true, attachments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    getCurrentUser(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 bg-slate-50">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Prehľad hlásení</h1>
            <p className="text-sm text-slate-500 mt-1">
              Prehľadajte všetky nahlásené problémy v meste
            </p>
          </div>
          <BrowseClient reports={reports} categories={categories} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
