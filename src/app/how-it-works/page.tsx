import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";
import { MapPin, Camera, CheckCircle, Search, ThumbsUp, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

const steps = [
  {
    icon: Search,
    title: "Nájdite problém na mape",
    description: "Prehľadajte interaktívnu mapu mesta a zistite, či problém už nie je nahlásený.",
  },
  {
    icon: MapPin,
    title: "Označte polohu",
    description: "Kliknite na mapu alebo použite GPS pre presné určenie miesta problému.",
  },
  {
    icon: Camera,
    title: "Pridajte detaily a fotky",
    description: "Popíšte problém, vyberte kategóriu a pridajte fotografie pre lepšiu identifikáciu.",
  },
  {
    icon: CheckCircle,
    title: "Odošlite hlásenie",
    description: "Vaše hlásenie bude posúdené mestskými pracovníkmi a zaradené do riešenia.",
  },
  {
    icon: ThumbsUp,
    title: "Potvrďte existujúce hlásenia",
    description: "Ak problém už nahlásil niekto iný, potvrďte ho tlačidlom 'Mám rovnaký problém'.",
  },
  {
    icon: Shield,
    title: "Sledujte priebeh",
    description: "Sledujte stav riešenia a dostávajte aktualizácie o vašich hláseniach.",
  },
];

export default async function HowItWorksPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 bg-white">
        <div className="max-w-screen-md mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-800">Ako to funguje</h1>
            <p className="text-lg text-slate-500 mt-3 max-w-lg mx-auto">
              Nahlásenie problému vo vašom meste je jednoduché a zaberie menej ako minútu.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-5">
                <div className="shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <step.icon size={22} className="text-blue-600" />
                  </div>
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">
                      Krok {index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">{step.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-slate-50 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-slate-800">Často kladené otázky</h3>
            <div className="mt-6 space-y-4 text-left max-w-lg mx-auto">
              <div>
                <h4 className="font-medium text-slate-700">Musím sa registrovať?</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Nie, hlásenie je možné odoslať aj bez registrácie. Registrácia vám však umožní sledovať vaše hlásenia.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-700">Môžem nahlásiť anonymne?</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Áno, pri odoslaní hlásenia môžete zvoliť anonymný režim.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-700">Ako dlho trvá vyriešenie problému?</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Závisí od typu a závažnosti problému. Stav riešenia môžete sledovať priamo na mape.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
