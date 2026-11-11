import { useState } from 'react';
import { BookOpen, FileText, ArrowRight, Search } from 'lucide-react';
import type { Deck, Flashcard, Sheet, Review, ReviewLog, Homework, StudyLink } from '../lib/db';
import { cardTypeNames } from '../lib/db';

export function SchemaView({decks,cards,sheets,onDeck,onCard,onSheet}:{decks:Deck[];cards:Flashcard[];sheets:Sheet[];onDeck:(id:string)=>void;onCard:(id:string)=>void;onSheet:(id:string)=>void}){
 const [query,setQuery]=useState(''),[expanded,setExpanded]=useState<string[]>([]);
 const toggle=(id:string)=>setExpanded(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
 return <section><div className="page-heading"><div><span className="eyebrow">STRUCTURE DES CONNAISSANCES</span><h1>Schéma</h1><p>Notions et flashcards regroupées par deck.</p></div></div><label className="search" style={{maxWidth:430}}><Search size={17}/><input placeholder="Filtrer les notions..." value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <div className="schema-list">{decks.filter(d=>(d.title+' '+cards.filter(c=>c.deckId===d.id).map(c=>c.front).join(' ')+' '+sheets.filter(s=>s.deckId===d.id).map(s=>s.title).join(' ')).toLowerCase().includes(query.toLowerCase())).map(d=>{const dc=cards.filter(c=>c.deckId===d.id),ds=sheets.filter(s=>s.deckId===d.id);const show=expanded.includes(d.id)||Boolean(query);return <div className="schema-deck" key={d.id}>
  <button className="schema-header" onClick={()=>toggle(d.id)} aria-expanded={show}><BookOpen size={18}/><strong>#{d.number??'—'} {d.title}</strong><span>{ds.length} fiches · {dc.length} cartes</span><span>{show?'−':'+'}</span></button>
  {show&&<div className="schema-content"><button className="btn secondary" style={{justifySelf:"start"}} onClick={()=>onDeck(d.id)}>Ouvrir le deck</button>{ds.map(s=><div className="schema-sheet" key={s.id}><button className="schema-title" onClick={()=>onSheet(s.id)}><FileText size={16}/> {s.title}</button>{dc.filter(c=>c.sheetId===s.id).map(c=><button className="schema-card" key={c.id} onClick={()=>onCard(c.id)}><ArrowRight size={14}/> #{c.number} · {c.front.replace(/<[^>]*>/g,' ').slice(0,115)}</button>)}</div>)}
  {dc.filter(c=>!c.sheetId||!ds.some(s=>s.id===c.sheetId)).map(c=><button className="schema-card" key={c.id} onClick={()=>onCard(c.id)}><ArrowRight size={14}/> #{c.number} · {c.front.replace(/<[^>]*>/g,' ').slice(0,115)}</button>)}
  {!ds.length&&!dc.length&&<p className="muted">Ce deck ne contient pas encore de notions.</p>}</div>}
 </div>})}</div>
 {sheets.some(s=>!s.deckId)&&<div className="panel"><h3>Fiches indépendantes</h3>{sheets.filter(s=>!s.deckId).map(s=><button className="schema-card" key={s.id} onClick={()=>onSheet(s.id)}><FileText size={14}/> {s.title}</button>)}</div>}</section>;
}
type Node={id:string;label:string;x:number;y:number;kind:'sheet'|'homework';targetId:string};
export function GraphView({cards,sheets,homeworks,links,onSheet,onHomework}:{cards:Flashcard[];sheets:Sheet[];homeworks:Homework[];links:StudyLink[];onSheet:(id:string)=>void;onHomework:(id:string)=>void}){
 const [query,setQuery]=useState(''),[limit,setLimit]=useState(50);
 const linkedIds=new Set<string>();
 for(const link of links){linkedIds.add(link.sourceId);if(link.targetType==='sheet')linkedIds.add(link.targetId);}
 for(const card of cards){if(card.sheetId)linkedIds.add(card.sheetId);}
 const matchingSheets=sheets.filter(s=>linkedIds.has(s.id)&&(!query||(s.title+' '+s.content+' '+s.tags.join(' ')).toLowerCase().includes(query.toLowerCase())));
 const matchingHomeworks=homeworks.filter(h=>!query||(h.title+' '+h.description).toLowerCase().includes(query.toLowerCase()));
 const shownSheets=matchingSheets.slice(0,limit),shownHomeworks=matchingHomeworks.slice(0,limit);
 const nodes:Node[]=[
  ...shownSheets.map((s,i)=>({id:'sheet:'+s.id,targetId:s.id,label:s.title,x:240,y:75+i*55,kind:'sheet' as const})),
  ...shownHomeworks.map((h,i)=>({id:'hw:'+h.id,targetId:h.id,label:h.title,x:670,y:75+i*55,kind:'homework' as const}))
 ];
 const byId=new Map(nodes.map(n=>[n.id,n]));
 const edges:{from:Node;to:Node;id:string}[]=[];
 for(const link of links){
  const from=byId.get('sheet:'+link.sourceId);
  const to=link.targetType==='sheet'?byId.get('sheet:'+link.targetId):link.targetType==='homework'?byId.get('hw:'+link.targetId):undefined;
  if(from&&to)edges.push({from,to,id:link.id});
 }
 const height=Math.max(280,70+Math.max(shownSheets.length,shownHomeworks.length)*55);
 const select=(n:Node)=>n.kind==='sheet'?onSheet(n.targetId):onHomework(n.targetId);
 return <section><div className="page-heading"><div><span className="eyebrow">RÉSEAU DE CONNAISSANCES</span><h1>Graphe</h1><p>Uniquement les fiches liées et les devoirs. Ouvre un nœud pour accéder à son contenu.</p></div></div>
 <label className="search" style={{maxWidth:440}}><Search size={16}/><input placeholder="Rechercher une fiche liée ou un devoir..." value={query} onChange={e=>{setQuery(e.target.value);setLimit(50);}}/></label>
 <div className="graph-legend"><span>■ Fiches liées ({matchingSheets.length})</span><span>● Devoirs ({matchingHomeworks.length})</span><small>Les vidéos et cartes liées se consultent dans chaque fiche.</small></div>
 <div className="graph-scroller"><svg viewBox={`0 0 940 ${height}`} width="940" height={height} role="group" aria-label="Graphe interactif des fiches reliées et devoirs">
  {edges.map(e=><line key={e.id} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} stroke="var(--muted)" opacity=".5" strokeWidth="1.6"/>)}
  {nodes.map(n=><g key={n.id} role="button" tabIndex={0} onClick={()=>select(n)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(n);}}} style={{cursor:'pointer'}}>
    <rect x={n.x-116} y={n.y-17} width="232" height="34" rx="7" stroke="var(--border)" fill={n.kind==='sheet'?'var(--panel2)':'var(--accent)'}/>
    <text x={n.x} y={n.y+4} fontSize="12" textAnchor="middle" fill={n.kind==='sheet'?'var(--text)':'var(--accent-text)'}>{(n.kind==='sheet'?'▣ ':'● ')+n.label.slice(0,30)}</text>
  </g>)}
 </svg></div>
 {(matchingSheets.length>limit||matchingHomeworks.length>limit)&&<button className="btn secondary" style={{marginTop:12}} onClick={()=>setLimit(x=>x+50)}>Afficher les nœuds suivants ({Math.max(matchingSheets.length-limit,matchingHomeworks.length-limit)} restants)</button>}
 {!nodes.length&&<div className="panel" style={{marginTop:16}}><p>Aucune relation à afficher. Relie des fiches, flashcards, vidéos ou devoirs depuis une fiche pour faire apparaître ce réseau.</p></div>}
 </section>;
}
export function GapsView({decks,cards,reviews,logs,onCard}:{decks:Deck[];cards:Flashcard[];reviews:Review[];logs:ReviewLog[];onCard:(id:string)=>void}){
 const map=new Map(reviews.map(r=>[r.cardId,r]));
 const gaps=cards.map(c=>{const l=logs.filter(x=>x.cardId===c.id).sort((a,b)=>b.reviewedAt-a.reviewedAt).slice(0,8);const failures=l.filter(x=>x.rating<=2).length;return {card:c,failures,total:l.length,lastRating:map.get(c.id)?.lastRating,interval:map.get(c.id)?.interval??0};}).filter(x=>x.failures>0||(x.lastRating!==null&&x.lastRating!==undefined&&x.lastRating<=2)).sort((a,b)=>b.failures-a.failures||a.interval-b.interval);
 return <section><div className="page-heading"><div><span className="eyebrow">POINTS À RENFORCER</span><h1>Lacunes</h1><p>Les cartes que tu as le plus souvent jugées difficiles.</p></div></div>
 <div className="stats-grid"><div className="metric"><strong>{gaps.length}</strong><span>Cartes à renforcer</span></div><div className="metric"><strong>{logs.filter(l=>l.rating<=2).length}</strong><span>Réponses difficiles</span></div><div className="metric"><strong>{cards.length}</strong><span>Cartes au total</span></div></div>
 <div className="gap-list">{gaps.map(({card,failures,total})=><button className="gap-item" key={card.id} onClick={()=>onCard(card.id)}><span className="gap-icon"><BookOpen size={18}/></span><span><strong>#{card.number} · {card.front.replace(/<[^>]*>/g,' ').slice(0,140)}</strong><small>{decks.find(d=>d.id===card.deckId)?.title??'Deck inconnu'} · {cardTypeNames[card.cardType??'basic']}</small></span><span className="gap-score">{failures}/{total} difficiles</span><ArrowRight size={17}/></button>)}</div>
 {!gaps.length&&<div className="panel"><h3>Aucune lacune détectée</h3><p>Les cartes évaluées « À revoir » ou « Difficile » apparaîtront ici.</p></div>}</section>;
}
