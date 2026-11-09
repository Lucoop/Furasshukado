import { useEffect, useState } from "react";
import Sidebar, { type Page } from "./components/Sidebar";
import Dashboard from "./features/dashboard/Dashboard";
import ReviewPage from "./features/review/ReviewPage";
import { BookOpen, Layers3, Settings, ChartNoAxesColumn, Plus } from "lucide-react";

const THEME_STORAGE_KEY = "furasshukado:theme";

function getInitialTheme(): boolean {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === null ? true : savedTheme === "dark";
  } catch {
    // Keep dark mode as the default when browser storage is unavailable.
    return true;
  }
}

export default function App() {
  const [activePage, setActivePage] = useState<Page>("Accueil");
  const [dark, setDark] = useState<boolean>(getInitialTheme);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      // The theme still works for the current session if storage is unavailable.
    }
  }, [dark]);

  if (reviewing) return <div className={dark ? "app-shell dark" : "app-shell"}><ReviewPage onExit={() => setReviewing(false)} /></div>;

  return (
    <div className={dark ? "app-shell dark" : "app-shell"}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} dark={dark} onToggleTheme={() => setDark((value) => !value)} />
      <main className="main-area">
        {activePage === "Accueil" ? <Dashboard onStartReview={() => setReviewing(true)} onOpenDecks={() => setActivePage("Mes decks")} /> : <PlaceholderPage page={activePage} onBack={() => setActivePage("Accueil")} />}
      </main>
    </div>
  );
}

function PlaceholderPage({ page, onBack }: { page: Page; onBack: () => void }) {
  const descriptions: Record<Page, string> = {
    "Accueil": "Ton espace d'apprentissage.",
    "Mes decks": "Retrouve et organise toutes tes collections de cartes.",
    "Révisions": "Entretiens tes connaissances avec des sessions régulières.",
    "Statistiques": "Suis tes progrès et tes habitudes d'apprentissage.",
    "Paramètres": "Personnalise ton expérience Furasshukado.",
  };
  const icons = { "Accueil": Layers3, "Mes decks": BookOpen, "Révisions": BookOpen, "Statistiques": ChartNoAxesColumn, "Paramètres": Settings };
  const Icon = icons[page];
  return <div className="placeholder-page"><div className="placeholder-icon"><Icon size={28} /></div><p className="eyebrow">FURASSHUKADO</p><h1>{page}</h1><p className="muted">{descriptions[page]}</p><div className="placeholder-note"><Plus size={17} /> Cette section sera construite dans une prochaine étape.</div><button className="button button-primary" onClick={onBack}>Retour à l'accueil</button></div>;
}
