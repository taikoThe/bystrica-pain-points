import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReportDetailPage } from "./ReportDetailPage";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params;

  const [report, user] = await Promise.all([
    prisma.report.findUnique({
      where: { id },
      include: {
        category: true,
        user: { select: { id: true, name: true } },
        attachments: true,
        updates: { where: { isPublic: true }, orderBy: { createdAt: "desc" } },
        confirmations: true,
        _count: { select: { confirmations: true } },
      },
    }),
    getCurrentUser(),
  ]);

  if (!report) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <ReportDetailPage report={report} userId={user?.id} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
