import { unzipSync, strFromU8 } from 'fflate';
import { decompress } from 'fzstd';
import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { db, now, type Deck, type Flashcard } from './db';

type AnkiDeck = { id: string; name: string; cards: Flashcard[] };
export type AnkiPreview = { decks: AnkiDeck[]; warnings: string[]; mediaCount: number; totalCards: number };
const LIMIT = 250 * 1024 * 1024;
const MAX_MEDIA = 12 * 1024 * 1024;
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const decode = (x: Uint8Array) => strFromU8(x);
const toBase64 = (bytes: Uint8Array) => { let s=''; for(let i=0;i<bytes.length;i+=8192) s+=String.fromCharCode(...bytes.subarray(i,i+8192)); return btoa(s); };
const mediaType = (name:string) => { const ext=name.split('.').pop()?.toLowerCase(); return ({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',mp3:'audio/mpeg',ogg:'audio/ogg',wav:'audio/wav',m4a:'audio/mp4',mp4:'video/mp4'} as Record<string,string>)[ext??'']??''; };
function convertMedia(html:string, media:Map<string,string>) {
  return html.replace(/(<img\b[^>]*?\bsrc\s*=\s*["'])([^"']+)(["'][^>]*>)/gi,(_m,a:string,src:string,z:string)=>a+(media.get(src)||esc(src))+z)
    .replace(/\[sound:([^\]]+)\]/gi,(_m,name:string)=>{const url=media.get(name);return url?'<audio controls preload="none" src="'+url+'"></audio>':'[Audio manquant : '+esc(name)+']';});
}
function cloze(text:string,ord:number,answer:boolean){return text.replace(/\{\{c(\d+)::([\s\S]*?)(?:::([\s\S]*?))?\}\}/g,(_all,num:string,value:string,hint?:string)=>{if(Number(num)!==ord+1)return value;return answer?'<strong>'+value+'</strong>':'<strong>['+(hint||'…')+']</strong>';});}
function render(template:string,fields:Record<string,string>,ord:number,answer:boolean,front=''){
 let out=template.replace(/\{\{FrontSide\}\}/gi,front);
 out=out.replace(/\{\{#([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,(_all,key:string,body:string)=>fields[key.trim()]?body:'');
 out=out.replace(/\{\{\^([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,(_all,key:string,body:string)=>fields[key.trim()]?'':body);
 out=out.replace(/\{\{([^}]+)\}\}/g,(_all,raw:string)=>{const parts=raw.split(':');const field=parts.pop()!.trim();const val=fields[field]??'';const modifier=parts.join(':').toLowerCase();if(modifier.includes('cloze'))return cloze(val,ord,answer);if(modifier.includes('type'))return '';if(modifier.includes('text'))return val.replace(/<[^>]*>/g,'');return val;});
 return out;
}
export async function inspectAnki(file:File):Promise<AnkiPreview>{
 if(!/\.(colpkg|apkg)$/i.test(file.name))throw Error('Choisis un fichier .colpkg ou .apkg.');
 if(file.size>LIMIT)throw Error('Archive trop volumineuse (limite : 250 Mo).');
 const archive=unzipSync(new Uint8Array(await file.arrayBuffer()));
 const name=['collection.anki21b','collection.anki21','collection.anki2'].find(k=>archive[k]);
 if(!name)throw Error('Aucune collection Anki reconnue dans cette archive.');
 let bytes=archive[name];
 if(name.endsWith('21b')){try{bytes=decompress(bytes);}catch{throw Error('Impossible de décompresser la collection Anki récente.');}}
 if(bytes.length>LIMIT)throw Error('Base Anki décompressée trop volumineuse.');
 const SQL=await initSqlJs({locateFile:()=>sqlWasmUrl});
 let sql:InstanceType<typeof SQL.Database>|undefined;
 try {
  sql=new SQL.Database(bytes);
  const rows=(q:string)=>{const res=sql!.exec(q);return res.length?res[0].values.map(v=>Object.fromEntries(res[0].columns.map((k,i)=>[k,v[i]]))):[];};
  const col=rows('SELECT decks, models FROM col LIMIT 1')[0];
  if(!col)throw Error('Métadonnées de collection Anki introuvables.');
  const deckMeta=JSON.parse(String(col.decks)) as Record<string,{name:string}>;
  const models=JSON.parse(String(col.models)) as Record<string,{type?:number;flds:{name:string}[];tmpls:{qfmt:string;afmt:string}[]}>;
  const notes=new Map(rows('SELECT id, mid, flds FROM notes').map(n=>[String(n.id),n]));
  const warnings:string[]=[];
  const media=new Map<string,string>();
  if(archive.media){try{const index=JSON.parse(decode(archive.media)) as Record<string,string>;for(const [key,filename] of Object.entries(index)){
   const blob=archive[key];const mime=mediaType(filename);
   if(!blob||!mime)continue;
   if(blob.length>MAX_MEDIA){warnings.push('Média ignoré (plus de 12 Mo) : '+filename);continue;}
   media.set(filename,'data:'+mime+';base64,'+toBase64(blob));
  }}catch{warnings.push('Index des médias illisible : médias ignorés.');}}
  const decks=new Map<string,AnkiDeck>();
  let skipped=0;
  for(const c of rows('SELECT id, nid, did, ord FROM cards')){
   const note=notes.get(String(c.nid));if(!note){skipped++;continue;}
   const model=models[String(note.mid)];if(!model){skipped++;continue;}
   const fields=Object.fromEntries(model.flds.map((f,i)=>[f.name,String(note.flds).split('\x1f')[i]??'']));
   const ord=Number(c.ord);
   const template=model.tmpls[model.type===1?0:ord];if(!template){skipped++;continue;}
   const front=render(template.qfmt,fields,ord,false);
   const back=render(template.afmt,fields,ord,true,front);
   if(!front.trim()||!back.trim()){skipped++;continue;}
   const deckId=String(c.did);const title=(deckMeta[deckId]?.name||'Deck Anki sans nom').replace(/::/g,' / ');
   if(!decks.has(deckId))decks.set(deckId,{id:deckId,name:title,cards:[]});
   const timestamp=now();
   decks.get(deckId)!.cards.push({id:'anki:'+c.id,deckId:'',front:convertMedia(front,media),back:convertMedia(back,media),createdAt:timestamp,updatedAt:timestamp});
  }
  if(skipped)warnings.push(skipped+' carte(s) ignorée(s) : modèle ou contenu non pris en charge.');
  warnings.push('Les modèles Anki personnalisés sont convertis au mieux ; le CSS et l’historique des révisions ne sont pas importés.');
  const result=[...decks.values()];return {decks:result,warnings,mediaCount:media.size,totalCards:result.reduce((s,d)=>s+d.cards.length,0)};
 } catch(e){if(e instanceof Error)throw e;throw Error('Collection Anki invalide ou non prise en charge.');}finally{sql?.close();}
}
export async function commitAnki(preview:AnkiPreview):Promise<{decks:number;cards:number;skipped:number}>{
 let addedDecks=0,addedCards=0,skipped=0;
 await db.transaction('rw',db.decks,db.cards,async()=>{
  for(const source of preview.decks){
   const id='anki-deck:'+source.id;
   const existing=await db.decks.get(id);
   if(!existing){const time=now();const deck:Deck={id,title:source.name,description:'Importé depuis Anki',color:'#8b9cfa',folderId:null,createdAt:time,updatedAt:time};await db.decks.add(deck);addedDecks++;}
   for(const card of source.cards){if(await db.cards.get(card.id)){skipped++;continue;}await db.cards.add({...card,deckId:id});addedCards++;}
  }
 });
 return {decks:addedDecks,cards:addedCards,skipped};
}
