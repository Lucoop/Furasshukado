import { useState } from 'react';
import { inspectAnki, commitAnki, type AnkiPreview } from '../lib/anki-import';

export function AnkiImporter() {
 const [preview,setPreview]=useState<AnkiPreview|null>(null);
 const [filename,setFilename]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 async function load(file:File) {
  setBusy(true);setError('');setSuccess('');setPreview(null);setFilename(file.name);
  try {setPreview(await inspectAnki(file));}
  catch(e){setError(e instanceof Error?e.message:'Import impossible.');}
  finally{setBusy(false);}
 }
 async function confirm() {
  if(!preview)return;
  setBusy(true);setError('');
  try {const result=await commitAnki(preview);setSuccess(result.decks+' deck(s) créé(s), '+result.cards+' carte(s) importée(s), '+result.skipped+' doublon(s) ignoré(s).');setPreview(null);}
  catch(e){setError(e instanceof Error?e.message:'Import impossible.');}
  finally{setBusy(false);}
 }
 return <div className="panel settings-panel">
  <h2>Importer une collection Anki</h2>
  <p>Importe un fichier .colpkg ou .apkg directement dans ton navigateur. Tes decks existants sont conservés.</p>
  <label className="btn secondary file-label" style={{display:'inline-flex',cursor:'pointer'}}>
   {busy?'Analyse en cours…':'Choisir un fichier Anki'}
   <input type="file" accept=".colpkg,.apkg" disabled={busy} hidden onChange={e=>{const file=e.target.files?.[0];if(file)void load(file);e.target.value='';}}/>
  </label>
  {error&&<p role="alert" style={{color:'#ef7777'}}>{error}</p>}
  {success&&<p role="status">{success}</p>}
  {preview&&<div style={{marginTop:16}}>
   <h3>Aperçu : {filename}</h3>
   <p>{preview.decks.length} deck(s), {preview.totalCards} carte(s), {preview.mediaCount} média(s) pris en charge.</p>
   <ul>{preview.decks.map(d=><li key={d.id}>{d.name} — {d.cards.length} carte(s)</li>)}</ul>
   {preview.warnings.map((w,i)=><p key={i} className="warning">{w}</p>)}
   <div className="action-row">
    <button className="btn primary" disabled={busy||!preview.totalCards} onClick={()=>void confirm()}>{busy?'Import en cours…':'Confirmer l’import'}</button>
    <button className="btn secondary" disabled={busy} onClick={()=>setPreview(null)}>Annuler</button>
   </div>
  </div>}
 </div>;
}
