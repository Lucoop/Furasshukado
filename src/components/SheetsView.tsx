import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, ArrowLeft, Search, FileText } from 'lucide-react';
import { db, saveSheet, deleteSheet, normalizeTags, type Sheet, type Deck, type Flashcard } from '../lib/db';
import { Markdown } from '../lib/markdown';

export function SheetsView({sheets,decks,cards,onOpenDeck}:{sheets:Sheet[];decks:Deck[];cards:Flashcard[];onOpenDeck:(id:string)=>void}){
 const [editing,setEditing]=useState<Sheet|null>(null),[creating,setCreating]=useState(false),[query,setQuery]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [title,setTitle]=useState(''),[content,setContent]=useState(''),[deckId,setDeckId]=useState(''),[tags,setTags]=useState('');
 const open=(sheet?:Sheet)=>{setEditing(sheet??null);setCreating(true);setError('');setTitle(sheet?.title??'');setContent(sheet?.content??'');setDeckId(sheet?.deckId??'');setTags((sheet?.tags??[]).join(', '));};
 async function save(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{await saveSheet({id:editing?.id,deckId:deckId||null,title,content,tags:normalizeTags(tags)});setCreating(false);}catch(x){setError(x instanceof Error?x.message:'Enregistrement impossible.');}finally{setBusy(false);}}
 async function remove(sheet:Sheet){if(!confirm('Supprimer cette fiche ? Les flashcards seront conservées, mais dissociées.'))return;try{await deleteSheet(sheet.id);}catch(x){setError(x instanceof Error?x.message:'Suppression impossible.');}}
 const filtered=sheets.filter(s=>(s.title+' '+s.content+' '+(s.tags??[]).join(' ')).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>b.updatedAt-a.updatedAt);
 if(creating)return <section className="sheet-editor">
  <button className="back" onClick={()=>setCreating(false)}><ArrowLeft size={16}/> Toutes les fiches</button>
  <h1>{editing?'Modifier une fiche':'Nouvelle fiche'}</h1>
  <form className="sheet-form" onSubmit={e=>void save(e)}>
   <div className="sheet-meta-fields"><label>Titre<input required autoFocus maxLength={140} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nom de la notion"/></label><label>Deck associé (facultatif)<select value={deckId} onChange={e=>setDeckId(e.target.value)}><option value="">Aucun deck</option>{decks.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></label><label>Tags<input value={tags} onChange={e=>setTags(e.target.value)} placeholder="physique, formules"/></label></div>
   <div className="sheet-editor-columns"><label>Contenu Markdown<textarea rows={16} value={content} onChange={e=>setContent(e.target.value)} placeholder="Écris tes notes, définitions et formules LaTeX..."/></label><div className="sheet-preview"><strong>Aperçu</strong><Markdown value={content||'*Écris pour afficher l’aperçu.*'}/></div></div>
   {error&&<p role="alert" className="warning">{error}</p>}
   <div className="action-row"><button className="btn primary" disabled={busy||!title.trim()}>{busy?'Enregistrement…':'Enregistrer'}</button><button type="button" className="btn secondary" onClick={()=>setCreating(false)}>Annuler</button></div>
  </form>
 </section>;
 return <section><div className="page-heading"><div><span className="eyebrow">NOTIONS ET COURS</span><h1>Fiches</h1><p>Écris une notion une fois, relie-la à tes flashcards.</p></div><button className="btn primary" onClick={()=>open()}><Plus size={16}/> Nouvelle fiche</button></div>
 <label className="search" style={{maxWidth:460,marginBottom:20}}><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher une fiche..."/></label>
 {error&&<p className="warning" role="alert">{error}</p>}
 <div className="sheet-grid">{filtered.map(s=>{const related=cards.filter(c=>c.sheetId===s.id);return <article className="panel sheet-tile" key={s.id}>
  <div className="sheet-tile-top"><FileText size={21}/><small>Fiche #{s.number}</small></div><h3>{s.title}</h3><p>{decks.find(d=>d.id===s.deckId)?.title??'Indépendante'} · {related.length} carte(s) liée(s)</p><div className="sheet-sample"><Markdown value={s.content.slice(0,240)||'*Fiche vide*'}/></div>
  <div className="tags">{(s.tags??[]).map(t=><span className="tag" key={t}>#{t}</span>)}</div>
  <div className="action-row"><button className="btn secondary" onClick={()=>open(s)}><Pencil size={14}/> Ouvrir</button>{s.deckId&&<button className="btn secondary" onClick={()=>onOpenDeck(s.deckId!)}>Deck</button>}<button className="icon-button red" aria-label="Supprimer la fiche" onClick={()=>void remove(s)}><Trash2 size={16}/></button></div>
 </article>;})}</div>{!filtered.length&&<p className="muted">{sheets.length?'Aucune fiche ne correspond à la recherche.':'Pas encore de fiches : crée ta première notion.'}</p>}
 </section>;
}
