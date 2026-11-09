import { ArrowRight, ArrowUpRight, BookOpen, Check, Flame, Layers3, MoreHorizontal, Plus, Sparkles } from "lucide-react";
import { decks } from "../../data/mock-data";

type DashboardProps = {
  onStartReview: () => void;
  onOpenDecks: () => void;
};

export default function Dashboard({ onStartReview, onOpenDecks }: DashboardProps) {
  return (
    <div className="page-content">
      <header className="page-header">
        <div><p className="eyebrow">TON ESPACE D'APPRENTISSAGE</p><h1>Bonjour ! <span className="wave">✳</span></h1><p className="page-subtitle">Prêt à faire progresser tes connaissances ?</p></div>
        <button className="button button-primary"><Plus size={18} /> Nouveau deck</button>
      </header>

      <section className="stats-grid" aria-label="Résumé de l'activité">
        <article className="stat-card stat-purple"><span className="stat-icon"><Layers3 size={20} /></span><strong>12</strong><span>Decks créés</span><small><ArrowUpRight size={13} /> +2 ce mois</small></article>
        <article className="stat-card stat-blue"><span className="stat-icon"><BookOpen size={20} /></span><strong>248</strong><span>Cartes au total</span><small>Dans ta bibliothèque</small></article>
        <article className="stat-card stat-green"><span className="stat-icon"><Check size={20} /></span><strong>86<span className="stat-percent">%</span></strong><span>Taux de réussite</span><small>Sur les 30 derniers jours</small></article>
        <article className="stat-card stat-orange"><span className="stat-icon"><Flame size={20} /></span><strong>7</strong><span>Jours d'affilée</span><small>Continue comme ça !</small></article>
      </section>

      <section className="content-grid">
        <article className="panel decks-panel">
          <div className="panel-heading"><div><p className="eyebrow">TA BIBLIOTHÈQUE</p><h2>Mes decks</h2></div><button className="text-button" onClick={onOpenDecks}>Voir tout <ArrowRight size={16} /></button></div>
          <div className="deck-list">
            {decks.map((deck) => (
              <div className="deck-row" key={deck.id}>
                <div className={`deck-cover ${deck.tone}`}><span>{deck.cover}</span></div>
                <div className="deck-info"><strong>{deck.title}</strong><span>{deck.cards} cartes <i /> Révisé : {deck.lastReviewed}</span></div>
                <div className="deck-due">{deck.due} à revoir</div>
                <button className="icon-button" aria-label={`Options de ${deck.title}`}><MoreHorizontal size={19} /></button>
              </div>
            ))}
          </div>
          <button className="panel-footer" onClick={onOpenDecks}>Explorer tous mes decks <ArrowRight size={15} /></button>
        </article>

        <article className="panel review-card">
          <div className="review-top"><div><p className="eyebrow">C'EST LE BON MOMENT</p><h2>Session de révision</h2></div><span className="review-count">18 cartes</span></div>
          <div className="review-illustration"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="flashcard-illustration"><Sparkles size={22} /><span>あ</span><small>今日の言葉</small></div></div>
          <h3>Entretiens tes connaissances</h3><p className="muted centered">Quelques minutes suffisent pour renforcer ta mémoire.</p>
          <div className="review-progress"><span style={{ width: "68%" }} /></div><div className="progress-caption"><span>Ton objectif quotidien</span><strong>12 / 18</strong></div>
          <button className="button button-primary review-button" onClick={onStartReview}>Commencer à réviser <ArrowRight size={17} /></button>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">RÉGULARITÉ</p><h2>Ton activité</h2></div><span className="select-chip">7 derniers jours <ArrowRight size={13} /></span></div><div className="activity-chart"><div className="chart-y"><span>30</span><span>20</span><span>10</span><span>0</span></div><div className="chart-bars">{[38,62,48,82,57,72,92].map((height, i) => <div className="bar-column" key={i}><div className={i === 6 ? "bar today" : "bar"} style={{ height: `${height}%` }} /><span>{["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"][i]}</span></div>)}</div></div><div className="activity-legend"><span><i /> Cartes révisées</span><strong>142 cette semaine</strong></div></article>
        <article className="panel tip-panel"><div className="tip-icon"><Sparkles size={20} /></div><p className="eyebrow">LE CONSEIL DU JOUR</p><h2>La régularité avant l'intensité.</h2><p className="muted">Une petite session chaque jour aide à consolider tes souvenirs sur le long terme. Reviens demain pour garder ton rythme.</p><button className="text-button">Découvrir les méthodes <ArrowRight size={15} /></button></article>
      </section>
    </div>
  );
}