import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bystrica Pain Points — Hlásenie problémov v meste",
  description:
    "Nahlasujte a sledujte problémy vo vašom meste. Výtlky, nefunkčné osvetlenie, nelegálne skládky a ďalšie problémy na interaktívnej mape.",
  openGraph: {
    title: "Bystrica Pain Points",
    description: "Nahlasujte problémy v Banskej Bystrici na interaktívnej mape",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
