import { z } from "zod";

export const createReportSchema = z.object({
  title: z
    .string()
    .min(5, "Názov musí mať aspoň 5 znakov")
    .max(150, "Názov môže mať maximálne 150 znakov"),
  description: z
    .string()
    .min(10, "Popis musí mať aspoň 10 znakov")
    .max(2000, "Popis môže mať maximálne 2000 znakov"),
  categoryId: z.string().min(1, "Vyberte kategóriu"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  contactEmail: z.string().email("Neplatný email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
});

export const updateReportStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "UNDER_REVIEW",
    "ACCEPTED",
    "IN_PROGRESS",
    "RESOLVED",
    "REJECTED",
    "DUPLICATE",
  ]),
  note: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Neplatný email"),
  password: z.string().min(6, "Heslo musí mať aspoň 6 znakov"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Meno musí mať aspoň 2 znaky"),
  email: z.string().email("Neplatný email"),
  password: z.string().min(8, "Heslo musí mať aspoň 8 znakov"),
});

export const addUpdateSchema = z.object({
  content: z.string().min(1, "Správa nemôže byť prázdna").max(1000),
  isPublic: z.boolean().default(true),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export const categorySchema = z.object({
  name: z.string().min(2, "Názov musí mať aspoň 2 znaky").max(100),
  slug: z
    .string()
    .min(2, "Slug musí mať aspoň 2 znaky")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug môže obsahovať len malé písmená, čísla a pomlčky"),
  icon: z.string().min(1, "Ikona je povinná"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Neplatná farba (použite hex formát #RRGGBB)"),
  description: z.string().max(500).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).default(0),
});

export type AddUpdateInput = z.infer<typeof addUpdateSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
