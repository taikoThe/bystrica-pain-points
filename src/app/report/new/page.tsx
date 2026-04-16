import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { ReportForm } from "@/components/reports/ReportForm";
import { Suspense } from "react";
import { NewReportContent } from "./NewReportContent";

export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const [categories, user] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    getCurrentUser(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={user} />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Nahlásiť problém</h1>
            <p className="text-sm text-slate-500 mt-1">
              Pomôžte zlepšiť naše mesto nahlásením problému
            </p>
          </div>
          <Suspense fallback={<div>Načítavanie...</div>}>
            <NewReportContent categories={categories} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
