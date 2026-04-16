import Link from "next/link";
import { MapPin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 px-4">
      <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={14} className="text-blue-600" />
          <span>Bystrica Pain Points</span>
          <span className="text-slate-300">|</span>
          <span>Banská Bystrica</span>
        </div>

        <nav className="flex items-center gap-4 text-sm text-slate-500">
          <Link href="/how-it-works" className="hover:text-slate-700 transition-colors">
            Ako to funguje
          </Link>
          <Link href="/browse" className="hover:text-slate-700 transition-colors">
            Prehľad hlásení
          </Link>
        </nav>

        <div className="flex items-center gap-1 text-xs text-slate-400">
          Vytvorené s <Heart size={12} className="text-rose-400" /> pre lepšiu Bystricu
        </div>
      </div>
    </footer>
  );
}
