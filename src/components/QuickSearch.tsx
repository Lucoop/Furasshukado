import { useEffect, useMemo, useState } from 'react';
import { Search, Layers, FileText, Plus, RotateCcw, Command } from 'lucide-react';
import type { Deck, Flashcard } from '../lib/db';
type Result={key:string;title:string;detail:string;action:()=>void;icon:'deck'|'card'|'action'};
export function QuickSearch({decks,cards,onDeck,onCard,onAdd,onReview}:{decks:Deck[];cards:Flashcard[];onDeck:(id:string)=>void;onCard:(id:string)=>void;onAdd:()=>void;onReview:()=>void}){
 const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[active,setActive]=useState(0);
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setOpen(v=>!v);}if(e.key==='Escape')setOpen(false);};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[]);
 const results=useMemo(()=>{
  const q=query.toLowerCase().trim();const matches=(s:string)=>!q||s.toLowerCase().includes(q);
  const actions:Result[]=[{key:'new',title:'Créer un deck',detail:'Action rapide',icon:'action',action:onAdd},{key:'review',title:'Commencer une révision',detail:'Action rapide',icon:'action',action:onReview}];
  const ds:Result[]=decks.filter(d=>matches(d.title+' '+(d.tags??[]).join(' '))).map(d=>({key:'d'+d.id,title:d.title,detail:'Deck · '+(d.tags??[]).join(', '),icon:'deck',action:()=>onDeck(d.id)}));
  const cs:Result[]=cards.filter(c=>matches(c.front+' '+c.back+' '+(c.tags??[]).join(' '))).slice(0,15).map(c=>({key:'c'+c.id,title:c.front.replace(/<[^>]*>/g,' ').slice(0,90),detail:'Flashcard #'+(c.number??'—'),icon:'card',action:()=>onCard(c.deckId)}));
  return [...actions.filter(a=>matches(a.title)),...ds,...cs].slice(0,25);
 },[query,decks,cards,onDeck,onCard,onAdd,onReview]);
 const choose=(item:Result)=>{item.action();setOpen(false);setQuery('');setActive(0);};
 return <><button className="command-trigger" onClick={()=>{setOpen(true);setActive(0);}} aria-label="Recherche rapide"><Search size={17}/><span>Rechercher un deck ou une carte...</span><kbd>Ctrl K</kbd></button>{open&&<div className="spotlight-overlay" onMouseDown={e=>{if(e.currentTarget===e.target)setOpen(false);}}><div className="spotlight" role="dialog" aria-modal="true" aria-label="Recherche rapide"><div className="spotlight-input"><Search size={22}/><input autoFocus placeholder="Rechercher une carte, un deck, une action..." value={query} onChange={e=>{setQuery(e.target.value);setActive(0);}} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setActive(n=>Math.min(n+1,results.length-1));}if(e.key==='ArrowUp'){e.preventDefault();setActive(n=>Math.max(0,n-1));}if(e.key==='Enter'&&results[active])choose(results[active]);}}/><button onClick={()=>setOpen(false)}><kbd>ESC</kbd></button></div><div className="spotlight-list">{results.length?results.map((r,i)=><button key={r.key} className={'spotlight-item '+(i===active?'highlighted':'')} onMouseEnter={()=>setActive(i)} onClick={()=>choose(r)}>{r.icon==='deck'?<Layers size={18}/>:r.icon==='card'?<FileText size={18}/>:r.key==='new'?<Plus size={18}/>:<RotateCcw size={18}/>}<span><strong>{r.title}</strong><small>{r.detail}</small></span></button>):<p className="muted" style={{padding:18}}>Aucun résultat.</p>}</div><div className="spotlight-foot"><Command size={14}/> Recherche dans tes decks et cartes · ↑↓ sélectionner · Entrée ouvrir</div></div></div>}</>;
}
