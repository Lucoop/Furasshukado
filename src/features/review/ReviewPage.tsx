import { useState } from "react";
import { ArrowLeft, Check, RotateCcw, Sparkles } from "lucide-react";
import { sampleCards } from "../../data/mock-data";

type ReviewPageProps = { onExit: () => void };

export default function ReviewPage({ onExit }: ReviewPageProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const card = sampleCards[index];

  const answer = () => {
    if (index === sampleCards.length - 1) setFinished(true);
    else { setIndex((current) => current + 1); setRevealed(false); }
  };

  return (
    <main className="review-page">
      <div className="review-page-header"><button className="back-button" onClick={onExit}><ArrowLeft size={17} /> Quitter la session</button><span>{finished ? sampleCards.length : index + 1} / {sampleCards.length}</span></div>
      <div className="session-progress"><span style={{ width: `${finished ? 100 : ((index + 1) / sampleCards.length) * 100}%` }} /></div>
      {finished ? <section className="session-finished"><div className="finished-icon"><Check size={32} /></div><p className="eyebrow">SESSION TERMINÉE</p><h1>Bien joué !</h1><p className="muted">Tu viens de parcourir tes cartes de démonstration.</p><button className="button button-primary" onClick={onExit}>Retour au tableau de bord</button></section> : <section className="flashcard-stage"><div className="flashcard-large"><span className="question-label">{revealed ? "RÉPONSE" : "QUESTION"}</span><h1>{revealed ? card.back : card.front}</h1><p className="muted">{revealed ? "Prêt pour la prochaine carte ?" : "Essaie de retrouver la réponse dans ta mémoire."}</p><button className="reveal-button" onClick={() => setRevealed((value) => !value)}><RotateCcw size={16} /> {revealed ? "Revoir la question" : "Afficher la réponse"}</button></div>{revealed && <div className="answer-actions"><button onClick={answer} className="answer-again">Encore</button><button onClick={answer} className="answer-hard">Difficile</button><button onClick={answer} className="answer-good">Bien</button><button onClick={answer} className="answer-easy">Facile</button></div>}<div className="session-hint"><Sparkles size={15} /> Les cartes affichées sont des exemples de démonstration.</div></section>}
    </main>
  );
}