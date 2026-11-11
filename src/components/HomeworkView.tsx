import { useEffect, useState, type FormEvent } from 'react';
import { Plus, CalendarDays, Pencil, Trash2, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { saveHomework, deleteHomework, type Homework, type HomeworkStatus, type Deck, type Sheet, type StudyLink } from '../lib/db';

const labels:Record<HomeworkStatus,string>={todo:'À faire',doing:'En cours',done:'Terminé'};
const dateInput=(time:number|null)=>{if(!time)return '';const d=new Date(time),offset=d.getTimezoneOffset()*60000;return new Date(d.getTime()-offset).toISOString().slice(0,16);};
export function HomeworkView({homeworks,decks,sheets,links,focusId,onSheet}:{homeworks:Homework[];decks:Deck[];sheets:Sheet[];links:StudyLink[];focusId:string|null;onSheet:(id:string)=>void}){
 const [editing,setEditing]=useState<Homework|null>(null),[open,setOpen]=useState(false),[title,setTitle]=useState(''),[description,setDescription]=useState(''),[status,setStatus]=useState<HomeworkStatus>('todo'),[due,setDue]=useState(''),[deckId,setDeckId]=useState(''),[sheetIds,setSheetIds]=useState<string[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false),[filter,setFilter]=useState<'all'|HomeworkStatus>('all');
 const openForm=(hw?:Homework)=>{setEditing(hw??null);setTitle(hw?.title??'');setDescription(hw?.description??'');setStatus(hw?.status??'todo');setDue(dateInput(hw?.dueAt??null));setDeckId(hw?.deckId??'');setSheetIds(hw?links.filter(l=>l.targetType==='homework'&&l.targetId===hw.id).map(l=>l.sourceId):[]);setOpen(true);setError('');};
 useEffect(()=>{if(!focusId)return;const hw=homeworks.find(h=>h.id===focusId);if(hw)openForm(hw);},[focusId]);
 const save=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setError('');try{const dueAt=due?new Date(due).getTime():null;if(due&&(!Number.isFinite(dueAt)))throw Error('Échéance invalide.');await saveHomework({id:editing?.id,title,description,status,dueAt,deckId:deckId||null,sheetIds});setOpen(false);}catch(x){setError(x instanceof Error?x.message:'Impossible d’enregistrer.');}finally{setBusy(false);}};
 const remove=async(hw:Homework)=>{if(!window.confirm('Supprimer le devoir « '+hw.title+' » ? Les fiches seront conservées.'))return;try{await deleteHomework(hw.id);}catch(x){setError(x instanceof Error?x.message:'Impossible de supprimer.');}};
 const toggle=(id:string)=>setSheetIds(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
 const ordered=homeworks.filter(h=>filter==='all'||h.status===filter).slice().sort((a,b)=>(a.status==='done'?1:0)-(b.status==='done'?1:0)||(a.dueAt??Infinity)-(b.dueAt??Infinity));
 return <section>
  {open?<><button className="back" onClick={()=>setOpen(false)}><ArrowLeft size={16}/> Devoirs</button><h1>{editing?'Modifier le devoir':'Nouveau devoir'}</h1><form className="homework-form panel" onSubmit={e=>void save(e)}>
   <label>Titre<input required autoFocus maxLength={140} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex. Réviser les lois de Newton"/></label>
   <label>Description<textarea rows={5} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Consignes, ressources, notions à revoir..."/></label>
   <div className="homework-fields"><label>Date d’échéance<input type="datetime-local" value={due} onChange={e=>setDue(e.target.value)}/></label><label>Statut<select value={status} onChange={e=>setStatus(e.target.value as HomeworkStatus)}>{Object.entries(labels).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select></label><label>Deck (facultatif)<select value={deckId} onChange={e=>setDeckId(e.target.value)}><option value="">Aucun deck</option>{decks.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></label></div>
   <fieldset className="homework-sheet-picker"><legend>Fiches liées</legend>{sheets.length? <div className="homework-sheet-options">{sheets.map(s=><label key={s.id}><input type="checkbox" checked={sheetIds.includes(s.id)} onChange={()=>toggle(s.id)}/><FileText size={15}/>{s.title}</label>)}</div>:<p className="muted">Crée une fiche pour pouvoir la lier au devoir.</p>}</fieldset>
   {error&&<p className="warning" role="alert">{error}</p>}
   <div className="action-row"><button className="btn primary" disabled={busy||!title.trim()}>{busy?'Enregistrement…':'Enregistrer'}</button><button type="button" className="btn secondary" onClick={()=>setOpen(false)}>Annuler</button></div>
  </form></>:<><div className="page-heading"><div><span className="eyebrow">ORGANISATION</span><h1>Devoirs</h1><p>Échéances, progression et notions associées.</p></div><button className="btn primary" onClick={()=>openForm()}><Plus size={16}/> Nouveau devoir</button></div>
   <div className="homework-filters">{([['all','Tous'],['todo','À faire'],['doing','En cours'],['done','Terminés']] as const).map(([id,label])=><button key={id} className={'btn '+(filter===id?'primary':'secondary')} onClick={()=>setFilter(id)}>{label}</button>)}</div>
   {error&&<p className="warning" role="alert">{error}</p>}
   <div className="homework-list">{ordered.map(h=>{const related=links.filter(l=>l.targetType==='homework'&&l.targetId===h.id);const late=h.status!=='done'&&h.dueAt!==null&&h.dueAt<Date.now();return <article className="panel homework-card" key={h.id}>
    <div className="homework-title"><div><span className="eyebrow">DEVOIR #{h.number}</span><h3>{h.title}</h3></div><span className={'hw-status '+h.status}>{labels[h.status]}</span></div>
    {h.description&&<p className="muted">{h.description}</p>}
    <div className="homework-meta">{h.dueAt&&<span className={late?'late':''}><CalendarDays size={15}/> {new Date(h.dueAt).toLocaleString('fr-FR',{dateStyle:'medium',timeStyle:'short'})}{late?' · En retard':''}</span>}{h.deckId&&<span>Deck : {decks.find(d=>d.id===h.deckId)?.title??'Inconnu'}</span>}</div>
    {related.length>0&&<div className="homework-related">{related.map(l=><button key={l.id} onClick={()=>onSheet(l.sourceId)}><FileText size={14}/>{sheets.find(s=>s.id===l.sourceId)?.title??'Fiche'}</button>)}</div>}
    <div className="action-row"><button className="btn secondary" onClick={()=>openForm(h)}><Pencil size={14}/> Modifier</button>{h.status!=='done'&&<button className="btn secondary" onClick={()=>void saveHomework({id:h.id,title:h.title,description:h.description,dueAt:h.dueAt,status:'done',deckId:h.deckId,sheetIds:related.map(l=>l.sourceId)}).catch(x=>setError(String(x)))}><CheckCircle2 size={15}/> Terminer</button>}<button className="icon-button red" title="Supprimer" onClick={()=>void remove(h)}><Trash2 size={16}/></button></div>
   </article>;})}</div>{!ordered.length&&<div className="panel"><p className="muted">Aucun devoir dans cette catégorie.</p></div>}
  </>}
 </section>;
}
