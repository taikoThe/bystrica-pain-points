"use client";

import Link from "next/link";
import { api } from "@/lib/api-path";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { MapPin, Menu, X, User, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface HeaderProps {
  user?: { id: string; name: string | null; role: string } | null;
}

const navLinks = [
  { href: "/", label: "Mapa" },
  { href: "/browse", label: "Prehľad" },
  { href: "/how-it-works", label: "Ako to funguje" },
];

export function Header({ user }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(api("/api/auth/logout"), { method: "POST" });
    router.refresh();
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-14 items-center justify-between px-4 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition-colors">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <MapPin size={18} className="text-white" />
          </div>
          <span className="hidden sm:inline text-sm">{APP_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <LayoutDashboard size={14} className="mr-1.5" />
                Admin
              </Button>
            </Link>
          )}

          {user ? (
            <>
              <Link href="/my-reports">
                <Button variant="ghost" size="sm">
                  <User size={14} className="mr-1.5" />
                  <span className="hidden sm:inline">{user.name || "Moje hlásenia"}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={14} className="mr-1.5" />
                <span className="hidden sm:inline">Odhlásiť</span>
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                <LogIn size={14} className="mr-1.5" />
                <span className="hidden sm:inline">Prihlásiť</span>
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm font-medium",
                pathname === link.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Admin panel
            </Link>
          )}
          {user && (
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Odhlásiť sa
            </button>
          )}
        </div>
      )}
    </header>
  );
}
