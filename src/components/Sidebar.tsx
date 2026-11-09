import { BookOpen, ChartNoAxesColumn, House, Layers3, Settings, Sun, Moon, Torus } from "lucide-react";

type Page = "Accueil" | "Mes decks" | "Révisions" | "Statistiques" | "Paramètres";

type SidebarProps = {
  activePage: Page;
  onNavigate: (page: Page) => void;
  dark: boolean;
  onToggleTheme: () => void;
};

const items = [
  { label: "Accueil" as const, icon: House },
  { label: "Mes decks" as const, icon: Layers3 },
  { label: "Révisions" as const, icon: BookOpen },
  { label: "Statistiques" as const, icon: ChartNoAxesColumn },
  { label: "Paramètres" as const, icon: Settings },
];

export default function Sidebar({ activePage, onNavigate, dark, onToggleTheme }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Torus size={31} strokeWidth={1.7} /></div>
        <div className="brand-name">Furasshukado</div>
        <p>Apprendre. Réviser. Progresser.</p>
      </div>
      <nav className="side-nav" aria-label="Navigation principale">
        {items.map(({ label, icon: Icon }) => (
          <button className={`nav-item ${activePage === label ? "active" : ""}`} key={label} onClick={() => onNavigate(label)}>
            <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="theme-toggle" onClick={onToggleTheme} aria-label="Changer le thème">
          <Sun size={17} className={!dark ? "selected" : ""} />
          <Moon size={17} className={dark ? "selected" : ""} />
        </button>
        <button className="profile">
          <span className="avatar">L</span>
          <span><strong>Mon espace</strong><small>Compte local</small></span>
          <span className="profile-dot" />
        </button>
      </div>
    </aside>
  );
}

export type { Page };