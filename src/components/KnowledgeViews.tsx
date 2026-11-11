import { useState } from 'react';
import { BookOpen, FileText, ArrowRight, Network, Search } from 'lucide-react';
import type { Deck, Flashcard, Sheet, Review, ReviewLog } from '../lib/db';
import { cardTypeNames } from '../lib/db';

export function SchemaView({decks,cards,sheets,onDeck,onCard,onSheet}:{decks:Deck[];cards:Flashcard[];sheets:Sheet[];onDeck:(id:string)=>void;onCard:(id:string)=>void;onSheet:(id:string)=>void}){
 const [query,setQuery]=useState(''),[expanded,setExpanded]=useState<string[]>([]);
 const toggle=(id:string)=>setExpanded(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
 return <section><div className="page-heading"><div><span className="eyebrow">STRUCTURE DES CONNAISSANCES</span><h1>Schéma</h1><p>Notions et flashcards regroupées par deck.</p></div></div><label className="search" style={{maxWidth:430}}><Search size={17}/><input placeholder="Filtrer les notions..." value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <div className="schema-list">{decks.filter(d=>(d.title+' '+cards.filter(c=>c.deckId===d.id).map(c=>c.front).join(' ')+' '+sheets.filter(s=>s.deckId===d.id).map(s=>s.title).join(' ')).toLowerCase().includes(query.toLowerCase())).map(d=>{const dc=cards.filter(c=>c.deckId===d.id),ds=sheets.filter(s=>s.deckId===d.id);const show=expanded.includes(d.id)||Boolean(query);return <div className="schema-deck" key={d.id}>
  <button className="schema-header" onClick={()=>toggle(d.id)} aria-expanded={show}><BookOpen size={18}/><strong>#{d.number??'—'} {d.title}</strong><span>{ds.length} fiches · {dc.length} cartes</span><span>{show?'−':'+'}</span></button>
  {show&&<div className="schema-content">{ds.map(s=><div className="schema-sheet" key={s.id}><button className="schema-title" onClick={()=>onSheet(s.id)}><FileText size={16}/> {s.title}</button>{dc.filter(c=>c.sheetId===s.id).map(c=><button className="schema-card" key={c.id} onClick={()=>onCard(c.id)}><ArrowRight size={14}/> #{c.number} · {c.front.replace(/<[^>]*>/g,' ').slice(0,115)}</button>)}</div>)}
  {dc.filter(c=>!c.sheetId||!ds.some(s=>s.id===c.sheetId)).map(c=><button className="schema-card" key={c.id} onClick={()=>onCard(c.id)}><ArrowRight size={14}/> #{c.number} · {c.front.replace(/<[^>]*>/g,' ').slice(0,115)}</button>)}
  {!ds.length&&!dc.length&&<p className="muted">Ce deck ne contient pas encore de notions.</p>}</div>}
 </div>})}</div>
 {sheets.some(s=>!s.deckId)&&<div className="panel"><h3>Fiches indépendantes</h3>{sheets.filter(s=>!s.deckId).map(s=><button className="schema-card" key={s.id} onClick={()=>onSheet(s.id)}><FileText size={14}/> {s.title}</button>)}</div>}</section>;
}
type Node={id:string;label:string;x:number;y:number;kind:'deck'|'sheet'|'card';deckId?:string;cardId?:string;sheetId?:string};
export function GraphView({decks,cards,sheets,onDeck,onCard,onSheet}:{decks:Deck[];cards:Flashcard[];sheets:Sheet[];onDeck:(id:string)=>void;onCard:(id:string)=>void;onSheet:(id:string)=>void}){
 const [query,setQuery]=useState(''),[focusDeck,setFocusDeck]=useState<string|null>(null),[limit,setLimit]=useState(50);
 const activeDeck=decks.find(d=>d.id===focusDeck);
 const shownDecks=decks.filter(d=>!query||d.title.toLowerCase().includes(query.toLowerCase())||(d.tags??[]).some(t=>t.includes(query.toLowerCase())));
 const deckCards=cards.filter(c=>c.deckId===focusDeck&&(!query||(c.front+' '+c.back+' '+(c.tags??[]).join(' ')).toLowerCase().includes(query.toLowerCase())));
 const deckSheets=sheets.filter(s=>s.deckId===focusDeck&&(!query||(s.title+' '+s.content).toLowerCase().includes(query.toLowerCase())));
 const visibleCards=deckCards.slice(0,limit),visibleSheets=deckSheets.slice(0,limit);
 const nodes:Node[]=[];const edges:{a:string;b:string}[]=[];
 if(!activeDeck){nodes.push({id:'root',label:'Shuka',x:90,y:Math.max(80,shownDecks.length*33),kind:'deck'});shownDecks.forEach((d,i)=>{const key='d'+d.id;nodes.push({id:key,label:'#'+(d.number??'—')+' '+d.title,x:440,y:65+i*66,kind:'deck',deckId:d.id});edges.push({a:'root',b:key});});}
 else{
  const total=Math.max(visibleCards.length,visibleSheets.length,1),center=60+total*22;
  nodes.push({id:'d'+activeDeck.id,label:activeDeck.title,x:108,y:center,kind:'deck',deckId:activeDeck.id});
  visibleSheets.forEach((f,i)=>{const key='s'+f.id;nodes.push({id:key,label:f.title,x:390,y:60+i*48,kind:'sheet',sheetId:f.id});edges.push({a:'d'+activeDeck.id,b:key});});
  visibleCards.forEach((c,i)=>{const key='c'+c.id;nodes.push({id:key,label:'#'+(c.number??'—')+' '+c.front.replace(/<[^>]*>/g,' ').slice(0,23),x:740,y:60+i*44,kind:'card',cardId:c.id});const parent=c.sheetId&&nodes.some(n=>n.id==='s'+c.sheetId)?'s'+c.sheetId:'d'+activeDeck.id;edges.push({a:parent,b:key});});
 }
 const byId=new Map(nodes.map(n=>[n.id,n]));const height=Math.max(270,...nodes.map(n=>n.y+95));
 const select=(n:Node)=>{if(n.cardId)onCard(n.cardId);else if(n.sheetId)onSheet(n.sheetId);else if(n.deckId){setFocusDeck(n.deckId);setQuery('');setLimit(50);}};
 return <section><div className="page-heading"><div><span className="eyebrow">CARTE DE CONNAISSANCES</span><h1>Graphe</h1><p>Explore les relations entre les decks, fiches et flashcards, sans exclure les dernières cartes.</p></div></div>
 <div className="action-row" style={{marginBottom:14}}><button className="btn secondary" onClick={()=>{setFocusDeck(null);setQuery('');}}>Tous les decks</button>{activeDeck&&<><span style={{alignSelf:'center'}}>#{activeDeck.number} {activeDeck.title}</span><button className="btn secondary" onClick={()=>onDeck(activeDeck.id)}>Ouvrir le deck</button></>}</div>
 <label className="search" style={{maxWidth:430}}><Search size={16}/><input placeholder={activeDeck?'Filtrer cartes et fiches...':'Rechercher un deck...'} value={query} onChange={e=>{setQuery(e.target.value);setLimit(50);}}/></label>
 <div className="graph-legend"><span>● Deck</span><span>■ Fiche</span><span>○ Flashcard</span><small>{activeDeck?`${deckCards.length} carte(s), ${deckSheets.length} fiche(s) — chargement progressif`:`${shownDecks.length} deck(s) accessible(s)`}</small></div>
 <div className="graph-scroller"><svg viewBox={`0 0 950 ${height}`} width="950" height={height} role="img" aria-label="Graphe interactif des decks, fiches et cartes">
 {edges.map((e,i)=>{const a=byId.get(e.a),b=byId.get(e.b);return a&&b?<line key={i} x1={a.x+83} y1={a.y} x2={b.x-83} y2={b.y} stroke="var(--border)" strokeWidth="1.5"/>:null;})}
 {nodes.map(n=><g key={n.id} role={n.id==='root'?'img':'button'} tabIndex={n.id==='root'?-1:0} onClick={()=>select(n)} onKeyDown={e=>{if(e.key==='Enter')select(n);}} style={{cursor:n.id==='root'?'default':'pointer'}}><rect x={n.x-83} y={n.y-15} width="166" height="30" rx="7" fill={n.kind==='deck'?'var(--accent)':'var(--panel2)'} stroke="var(--border)"/><text x={n.x} y={n.y+4} textAnchor="middle" fill={n.kind==='deck'?'var(--accent-text)':'var(--text)'} fontSize="11">{n.label.slice(0,26)}</text></g>)}
 </svg></div>
 {activeDeck&&(deckCards.length>visibleCards.length||deckSheets.length>visibleSheets.length)&&<button className="btn secondary" style={{marginTop:16}} onClick={()=>setLimit(v=>v+50)}>Afficher la suite ({Math.max(deckCards.length-visibleCards.length,deckSheets.length-visibleSheets.length)} restantes)</button>}
 {!decks.length&&<p className="muted"><Network size={16}/> Crée des decks pour afficher le graphe.</p>}
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
