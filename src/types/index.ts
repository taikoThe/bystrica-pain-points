import type {
  Report,
  Category,
  User,
  Attachment,
  ReportUpdate,
  Confirmation,
  AdminAction,
  ReportStatus,
  Severity,
} from "@prisma/client";

export type { Report, Category, User, Attachment, ReportUpdate, Confirmation, AdminAction, ReportStatus, Severity };

export type ReportWithRelations = Report & {
  category: Category;
  user: Pick<User, "id" | "name"> | null;
  attachments: Attachment[];
  updates: ReportUpdate[];
  confirmations: Confirmation[];
  _count?: {
    confirmations: number;
  };
};

export type ReportListItem = Report & {
  category: Category;
  _count: {
    confirmations: number;
    attachments: number;
  };
};

export type AdminReportDetail = Report & {
  category: Category;
  user: Pick<User, "id" | "name" | "email"> | null;
  attachments: Attachment[];
  updates: ReportUpdate[];
  confirmations: Confirmation[];
  adminActions: (AdminAction & {
    admin: Pick<User, "id" | "name">;
  })[];
  _count: {
    confirmations: number;
  };
};

export interface MapFilters {
  categories: string[];
  statuses: ReportStatus[];
  search: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MapMarkerData {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  categorySlug: string;
  categoryColor: string;
  categoryIcon: string;
  categoryName: string;
  confirmationCount: number;
  createdAt: string;
}
