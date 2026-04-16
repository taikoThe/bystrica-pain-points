import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReportList } from "@/components/reports/ReportList";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MyReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const reports = await prisma.report.findMany({
    where: { userId: user.id },
    include: {
      category: true,
      _count: { select: { confirmations: true, attachments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 bg-slate-50">
        <div className="max-w-screen-lg mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Moje hlásenia</h1>
              <p className="text-sm text-slate-500 mt-1">
                Prehľad vašich nahlásených problémov
              </p>
            </div>
            <Link href="/report/new">
              <Button>
                <Plus size={16} className="mr-1.5" />
                Nové hlásenie
              </Button>
            </Link>
          </div>

          {reports.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Zatiaľ žiadne hlásenia"
              description="Ešte ste nenahlásili žiadny problém. Začnite kliknutím na tlačidlo nižšie."
              action={
                <Link href="/report/new">
                  <Button>
                    <Plus size={16} className="mr-1.5" />
                    Nahlásiť problém
                  </Button>
                </Link>
              }
            />
          ) : (
            <ReportList reports={reports} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
