import { useState } from 'react';
import { BookOpen, FileText, ArrowRight, Network, Search } from 'lucide-react';
import type { Deck, Flashcard, Sheet, Review, ReviewLog } from '../lib/db';
import { cardTypeNames } from '../lib/db';

export function SchemaView({decks,cards,sheets,onDeck}:{decks:Deck[];cards:Flashcard[];sheets:Sheet[];onDeck:(id:string)=>void}){
 const [query,setQuery]=useState(''),[expanded,setExpanded]=useState<string[]>([]);
 const toggle=(id:string)=>setExpanded(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
 return <section><div className="page-heading"><div><span className="eyebrow">STRUCTURE DES CONNAISSANCES</span><h1>Schéma</h1><p>Notions et flashcards regroupées par deck.</p></div></div><label className="search" style={{maxWidth:430}}><Search size={17}/><input placeholder="Filtrer les notions..." value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <div className="schema-list">{decks.filter(d=>(d.title+' '+cards.filter(c=>c.deckId===d.id).map(c=>c.front).join(' ')+' '+sheets.filter(s=>s.deckId===d.id).map(s=>s.title).join(' ')).toLowerCase().includes(query.toLowerCase())).map(d=>{const dc=cards.filter(c=>c.deckId===d.id),ds=sheets.filter(s=>s.deckId===d.id);const show=expanded.includes(d.id)||Boolean(query);return <div className="schema-deck" key={d.id}>
  <button className="schema-header" onClick={()=>toggle(d.id)} aria-expanded={show}><BookOpen size={18}/><strong>#{d.number??'—'} {d.title}</strong><span>{ds.length} fiches · {dc.length} cartes</span><span>{show?'−':'+'}</span></button>
  {show&&<div className="schema-content">{ds.map(s=><div className="schema-sheet" key={s.id}><span className="schema-title"><FileText size={16}/> {s.title}</span>{dc.filter(c=>c.sheetId===s.id).map(c=><button className="schema-card" key={c.id} onClick={()=>onDeck(d.id)}><ArrowRight size={14}/> #{c.number} · {c.front.replace(/<[^>]*>/g,' ').slice(0,115)}</button>)}</div>)}
  {dc.filter(c=>!c.sheetId||!ds.some(s=>s.id===c.sheetId)).map(c=><button className="schema-card" key={c.id} onClick={()=>onDeck(d.id)}><ArrowRight size={14}/> #{c.number} · {c.front.replace(/<[^>]*>/g,' ').slice(0,115)}</button>)}
  {!ds.length&&!dc.length&&<p className="muted">Ce deck ne contient pas encore de notions.</p>}</div>}
 </div>})}</div>
 {sheets.some(s=>!s.deckId)&&<div className="panel"><h3>Fiches indépendantes</h3>{sheets.filter(s=>!s.deckId).map(s=><p key={s.id}><FileText size={14}/> {s.title}</p>)}</div>}</section>;
}
type Node={id:string;label:string;x:number;y:number;kind:'deck'|'sheet'|'card';deckId?:string};
export function GraphView({decks,cards,sheets,onDeck}:{decks:Deck[];cards:Flashcard[];sheets:Sheet[];onDeck:(id:string)=>void}){
 const [query,setQuery]=useState('');
 const selectedDecks=decks.filter(d=>d.title.toLowerCase().includes(query.toLowerCase())||!query).slice(0,12);
 const nodes:Node[]=[];const edges:{a:string;b:string}[]=[];
 selectedDecks.forEach((d,i)=>{const y=74+i*135;nodes.push({id:'d'+d.id,label:d.title,x:135,y,kind:'deck',deckId:d.id});
  sheets.filter(s=>s.deckId===d.id).slice(0,4).forEach((s,j)=>{const sid='s'+s.id;nodes.push({id:sid,label:s.title,x:385,y:y-35+j*27,kind:'sheet',deckId:d.id});edges.push({a:'d'+d.id,b:sid});});
  cards.filter(c=>c.deckId===d.id).slice(0,7).forEach((c,j)=>{const id='c'+c.id;nodes.push({id,label:'#'+(c.number??'')+' '+c.front.replace(/<[^>]*>/g,' ').slice(0,24),x:690,y:y-45+j*19,kind:'card',deckId:d.id});edges.push({a:'d'+d.id,b:id});if(c.sheetId&&nodes.some(n=>n.id==='s'+c.sheetId))edges.push({a:'s'+c.sheetId,b:id});});
 });
 const byId=new Map(nodes.map(n=>[n.id,n]));
 const height=Math.max(300,selectedDecks.length*135+100);
 return <section><div className="page-heading"><div><span className="eyebrow">CARTE DE CONNAISSANCES</span><h1>Graphe</h1><p>Vue interactive des liens entre decks, fiches et cartes.</p></div></div>
 <label className="search" style={{maxWidth:430}}><Search size={16}/><input placeholder="Filtrer les decks..." value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <div className="graph-legend"><span>● Deck</span><span>■ Fiche</span><span>○ Flashcard</span><small>Vue limitée à 12 decks, 4 fiches et 7 cartes par deck pour rester lisible.</small></div>
 <div className="graph-scroller"><svg viewBox={`0 0 950 ${height}`} width="950" height={height} role="img" aria-label="Graphe des decks, fiches et flashcards">
  {edges.map((e,i)=>{const a=byId.get(e.a),b=byId.get(e.b);return a&&b?<line key={i} x1={a.x+70} y1={a.y} x2={b.x-70} y2={b.y} stroke="var(--border)" strokeWidth="1.6"/>:null;})}
  {nodes.map(n=><g key={n.id} role="button" tabIndex={0} onClick={()=>n.deckId&&onDeck(n.deckId)} onKeyDown={e=>{if(e.key==='Enter'&&n.deckId)onDeck(n.deckId);}} style={{cursor:'pointer'}}>
   <rect x={n.x-84} y={n.y-14} width="168" height="29" rx="7" fill={n.kind==='deck'?'var(--accent)':'var(--panel2)'} stroke="var(--border)"/>
   <text x={n.x} y={n.y+4} textAnchor="middle" fill={n.kind==='deck'?'var(--accent-text)':'var(--text)'} fontSize="11">{n.label.slice(0,27)}</text>
  </g>)}
 </svg></div>{!decks.length&&<p className="muted"><Network size={16}/> Crée des decks pour afficher le graphe.</p>}</section>;
}
export function GapsView({decks,cards,reviews,logs,onDeck}:{decks:Deck[];cards:Flashcard[];reviews:Review[];logs:ReviewLog[];onDeck:(id:string)=>void}){
 const map=new Map(reviews.map(r=>[r.cardId,r]));
 const gaps=cards.map(c=>{const l=logs.filter(x=>x.cardId===c.id).sort((a,b)=>b.reviewedAt-a.reviewedAt).slice(0,8);const failures=l.filter(x=>x.rating<=2).length;return {card:c,failures,total:l.length,lastRating:map.get(c.id)?.lastRating,interval:map.get(c.id)?.interval??0};}).filter(x=>x.failures>0||(x.lastRating!==null&&x.lastRating!==undefined&&x.lastRating<=2)).sort((a,b)=>b.failures-a.failures||a.interval-b.interval);
 return <section><div className="page-heading"><div><span className="eyebrow">POINTS À RENFORCER</span><h1>Lacunes</h1><p>Les cartes que tu as le plus souvent jugées difficiles.</p></div></div>
 <div className="stats-grid"><div className="metric"><strong>{gaps.length}</strong><span>Cartes à renforcer</span></div><div className="metric"><strong>{logs.filter(l=>l.rating<=2).length}</strong><span>Réponses difficiles</span></div><div className="metric"><strong>{cards.length}</strong><span>Cartes au total</span></div></div>
 <div className="gap-list">{gaps.map(({card,failures,total})=><button className="gap-item" key={card.id} onClick={()=>onDeck(card.deckId)}><span className="gap-icon"><BookOpen size={18}/></span><span><strong>#{card.number} · {card.front.replace(/<[^>]*>/g,' ').slice(0,140)}</strong><small>{decks.find(d=>d.id===card.deckId)?.title??'Deck inconnu'} · {cardTypeNames[card.cardType??'basic']}</small></span><span className="gap-score">{failures}/{total} difficiles</span><ArrowRight size={17}/></button>)}</div>
 {!gaps.length&&<div className="panel"><h3>Aucune lacune détectée</h3><p>Les cartes évaluées « À revoir » ou « Difficile » apparaîtront ici.</p></div>}</section>;
}
