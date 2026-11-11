import Dexie, { type EntityTable } from 'dexie';
import { createEmptyCard, fsrs, Rating, type Card as FsrsCard, type Grade } from 'ts-fsrs';
const scheduler=fsrs({request_retention:0.9,maximum_interval:36500,enable_short_term:true});

export type Deck = { id:string; title:string; description:string; color:string; folderId:string|null; tags?:string[]; number?:number; createdAt:number; updatedAt:number };
export type Folder = { id:string; name:string; createdAt:number };
export type CardType = 'basic'|'reverse'|'both'|'translation';
export type Flashcard = { id:string; deckId:string; front:string; back:string; tags?:string[]; cardType?:CardType; number?:number; sheetId?:string|null; sheetExcerpt?:string; reviewDirection?:'reverse'; createdAt:number; updatedAt:number };
export const cardTypeNames:Record<CardType,string>={basic:'Recto → verso',reverse:'Verso → recto',both:'Recto ↔ verso',translation:'Traduction'};
export function reviewKey(card:Flashcard){return card.reviewDirection==='reverse'?card.id+'::reverse':card.id;}
export function reviewVariants(cards:Flashcard[]):Flashcard[]{return cards.flatMap(c=>c.cardType==='both'?[{...c,cardType:'basic' as const},{...c,cardType:'reverse' as const,reviewDirection:'reverse' as const}]:[c]);}
export const normalizeTags=(input:string)=>[...new Set(input.split(/[,;]+/).map(s=>s.trim().toLowerCase()).filter(Boolean))].slice(0,24);
export type FsrsState = Omit<FsrsCard,'due'|'last_review'> & {due:number;last_review:number|null};
export type Review = { cardId:string; dueAt:number; interval:number; repetitions:number; lastRating:number|null; updatedAt:number; fsrs?:FsrsState };
export type Sheet = {id:string;number:number;deckId:string|null;title:string;content:string;tags:string[];createdAt:number;updatedAt:number};
export type HomeworkStatus='todo'|'doing'|'done';
export type Homework={id:string;number:number;title:string;description:string;dueAt:number|null;status:HomeworkStatus;deckId:string|null;createdAt:number;updatedAt:number};
export type StudyLink={id:string;sourceId:string;targetType:'sheet'|'card'|'homework'|'video';targetId:string;title?:string;url?:string;createdAt:number};
export type Sequence = {name:'deck'|'card'|'sheet'|'homework';value:number};
export type ReviewLog = { id:string; cardId:string; deckId:string; rating:number; reviewedAt:number };
export type Backup = { format:'furasshukado'; version:3; exportedAt:string; decks:Deck[]; folders:Folder[]; cards:Flashcard[]; reviews:Review[]; logs:ReviewLog[]; sheets:Sheet[]; homeworks:Homework[]; links:StudyLink[] };
class StudyDB extends Dexie {
 decks!:EntityTable<Deck,'id'>; folders!:EntityTable<Folder,'id'>; cards!:EntityTable<Flashcard,'id'>; reviews!:EntityTable<Review,'cardId'>; logs!:EntityTable<ReviewLog,'id'>; sheets!:EntityTable<Sheet,'id'>; sequences!:EntityTable<Sequence,'name'>; homeworks!:EntityTable<Homework,'id'>; links!:EntityTable<StudyLink,'id'>;
 constructor(){super('furasshukado');this.version(1).stores({decks:'id,folderId,updatedAt',folders:'id',cards:'id,deckId,updatedAt',reviews:'cardId,dueAt',logs:'id,cardId,deckId,reviewedAt'});
 this.version(2).stores({decks:'id,folderId,updatedAt,*tags',folders:'id',cards:'id,deckId,updatedAt,number,*tags',reviews:'cardId,dueAt',logs:'id,cardId,deckId,reviewedAt'}).upgrade(async tx=>{
  let next=1;await tx.table('cards').toCollection().modify((card:Flashcard)=>{card.number=next++;card.cardType=card.cardType??'basic';card.tags=card.tags??[];});
  await tx.table('decks').toCollection().modify((deck:Deck)=>{deck.tags=deck.tags??[];});
 });
 this.version(3).stores({decks:'id,folderId,updatedAt,number,*tags',folders:'id',cards:'id,deckId,updatedAt,number,sheetId,*tags',reviews:'cardId,dueAt',logs:'id,cardId,deckId,reviewedAt',sheets:'id,number,deckId,updatedAt,*tags'}).upgrade(async tx=>{let n=1;await tx.table('decks').toCollection().modify((deck:Deck)=>{deck.number=deck.number??n++;});});
 this.version(4).stores({decks:'id,folderId,updatedAt,number,*tags',folders:'id',cards:'id,deckId,updatedAt,number,sheetId,*tags',reviews:'cardId,dueAt',logs:'id,cardId,deckId,reviewedAt',sheets:'id,number,deckId,updatedAt,*tags',sequences:'name'}).upgrade(async tx=>{for(const [name,table] of [['deck','decks'],['card','cards'],['sheet','sheets']] as const){const last=await tx.table(table).orderBy('number').last() as {number?:number}|undefined;await tx.table('sequences').put({name,value:last?.number??0});}});
 this.version(5).stores({decks:'id,folderId,updatedAt,number,*tags',folders:'id',cards:'id,deckId,updatedAt,number,sheetId,*tags',reviews:'cardId,dueAt',logs:'id,cardId,deckId,reviewedAt',sheets:'id,number,deckId,updatedAt,*tags',sequences:'name',homeworks:'id,number,deckId,dueAt,status,updatedAt',links:'id,sourceId,targetType,targetId,[targetType+targetId]'});}
}
export const db=new StudyDB();
export const uid=()=>crypto.randomUUID();
export const now=()=>Date.now();
export async function claimNumber(name:Sequence['name']):Promise<number>{const row=await db.sequences.get(name);const table=name==='deck'?db.decks:name==='card'?db.cards:name==='sheet'?db.sheets:db.homeworks;const last=await table.orderBy('number').last();const next=Math.max(row?.value??0,last?.number??0)+1;await db.sequences.put({name,value:next});return next;}
export async function createDeck(title:string,description='',color='#ef9273',folderId:string|null=null,tags:string[]=[]){const t=title.trim();if(!t)throw Error('Le nom du deck est obligatoire.');return db.transaction('rw',db.decks,db.sequences,async()=>{const time=now(),number=await claimNumber('deck');const deck:Deck={id:uid(),number,title:t,description:description.trim(),color,folderId,tags,createdAt:time,updatedAt:time};await db.decks.add(deck);return deck;});}
export async function updateDeck(deck:Deck){if(!deck.title.trim())throw Error('Le nom du deck est obligatoire.');await db.decks.put({...deck,title:deck.title.trim(),updatedAt:now()});}
export async function deleteDeck(id:string){await db.transaction('rw',[db.decks,db.cards,db.reviews,db.logs,db.sheets,db.homeworks,db.links],async()=>{await db.sheets.where('deckId').equals(id).modify({deckId:null});await db.homeworks.where('deckId').equals(id).modify({deckId:null});const ids=(await db.cards.where('deckId').equals(id).primaryKeys()) as string[];await db.reviews.bulkDelete(ids.flatMap(x=>[x,x+'::reverse']));await db.logs.where('deckId').equals(id).delete();await db.cards.where('deckId').equals(id).delete();
 for(const cid of ids)await db.links.where('[targetType+targetId]').equals(['card',cid]).delete();
 await db.decks.delete(id);});}
export async function saveCard(card:Partial<Flashcard>&{deckId:string;front:string;back:string}){
 if(!card.front.trim()||!card.back.trim())throw Error('Le recto et le verso sont obligatoires.');
 return db.transaction('rw',db.decks,db.cards,db.reviews,db.sequences,async()=>{
  if(!await db.decks.get(card.deckId))throw Error('Deck introuvable.');
  const time=now(),existing=card.id?await db.cards.get(card.id):undefined;
  const number=card.number??existing?.number??await claimNumber('card');
  const c:Flashcard={id:card.id??uid(),deckId:card.deckId,front:card.front.trim(),back:card.back.trim(),tags:card.tags??existing?.tags??[],cardType:card.cardType??existing?.cardType??'basic',number,sheetId:card.sheetId!==undefined?card.sheetId:existing?.sheetId??null,sheetExcerpt:card.sheetExcerpt??existing?.sheetExcerpt??'',createdAt:card.createdAt??existing?.createdAt??time,updatedAt:time};
  if(existing?.cardType==='both'&&c.cardType!=='both')await db.reviews.delete(c.id+'::reverse');
  await db.cards.put(c);return c;
 });
}
export async function deleteCard(id:string){await db.transaction('rw',[db.cards,db.reviews,db.logs,db.links],async()=>{await db.cards.delete(id);await db.reviews.bulkDelete([id,id+'::reverse']);await db.logs.where('cardId').equals(id).delete();await db.links.where('[targetType+targetId]').equals(['card',id]).delete();});}
export async function rateCard(card:Flashcard,rating:number){
 if(![1,2,3,4].includes(rating))throw Error('Note invalide');
 const key=reviewKey(card);const old=await db.reviews.get(key);const time=now();
 const previous:FsrsCard=old?.fsrs?{...old.fsrs,due:new Date(old.fsrs.due),last_review:old.fsrs.last_review?new Date(old.fsrs.last_review):undefined} as FsrsCard:createEmptyCard(new Date(time));
 const grade=[Rating.Again,Rating.Hard,Rating.Good,Rating.Easy][rating-1];
 const result=scheduler.next(previous,new Date(time),grade as Grade);
 const state:FsrsState={...result.card,due:result.card.due.getTime(),last_review:result.card.last_review?.getTime()??null};
 const interval=Math.max(0,Math.round((state.due-time)/86400_000));
 await db.transaction('rw',db.reviews,db.logs,async()=>{
  await db.reviews.put({cardId:key,dueAt:state.due,interval,repetitions:state.reps,lastRating:rating,updatedAt:time,fsrs:state});
  await db.logs.add({id:uid(),cardId:card.id,deckId:card.deckId,rating,reviewedAt:time});
 });
}
export async function saveSheet(input:{id?:string;deckId:string|null;title:string;content:string;tags:string[]}){
 const title=input.title.trim();if(!title)throw Error('Le titre de la fiche est obligatoire.');
 return db.transaction('rw',db.sheets,db.decks,db.sequences,async()=>{
  if(input.deckId&&!await db.decks.get(input.deckId))throw Error('Deck introuvable.');
  const existing=input.id?await db.sheets.get(input.id):undefined;
  const timestamp=now(),number=existing?.number??await claimNumber('sheet');
  const sheet:Sheet={id:input.id??uid(),number,deckId:input.deckId,title,content:input.content,tags:input.tags,createdAt:existing?.createdAt??timestamp,updatedAt:timestamp};
  await db.sheets.put(sheet);return sheet;
 });
}
export async function deleteSheet(id:string){await db.transaction('rw',[db.sheets,db.cards,db.links],async()=>{await db.cards.where('sheetId').equals(id).modify({sheetId:null,sheetExcerpt:''});await db.links.where('sourceId').equals(id).delete();await db.links.where('[targetType+targetId]').equals(['sheet',id]).delete();await db.sheets.delete(id);});}
export async function saveHomework(input:{id?:string;title:string;description:string;dueAt:number|null;status:HomeworkStatus;deckId:string|null;sheetIds:string[]}){
 const title=input.title.trim();if(!title)throw Error('Le titre du devoir est obligatoire.');
 if(!['todo','doing','done'].includes(input.status))throw Error('Statut du devoir invalide.');
 if(input.dueAt!==null&&!Number.isFinite(input.dueAt))throw Error('Date du devoir invalide.');
 return db.transaction('rw',[db.homeworks,db.sequences,db.links,db.sheets,db.decks],async()=>{
  if(input.deckId&&!await db.decks.get(input.deckId))throw Error('Deck introuvable.');
  const validSheets=await db.sheets.bulkGet(input.sheetIds);
  if(validSheets.some(x=>!x))throw Error('Fiche associée introuvable.');
  const previous=input.id?await db.homeworks.get(input.id):undefined;
  const stamp=now(),id=input.id??uid(),number=previous?.number??await claimNumber('homework');
  const record:Homework={id,number,title,description:input.description.trim(),dueAt:input.dueAt,status:input.status,deckId:input.deckId,createdAt:previous?.createdAt??stamp,updatedAt:stamp};
  await db.homeworks.put(record);
  await db.links.where('[targetType+targetId]').equals(['homework',id]).delete();
  await db.links.bulkAdd([...new Set(input.sheetIds)].map(sourceId=>({id:uid(),sourceId,targetType:'homework' as const,targetId:id,createdAt:stamp})));
  return record;
 });
}
export async function deleteHomework(id:string){await db.transaction('rw',[db.homeworks,db.links],async()=>{await db.links.where('[targetType+targetId]').equals(['homework',id]).delete();await db.homeworks.delete(id);});}
export async function createStudyLink(input:{sourceId:string;targetType:'sheet'|'card'|'video';targetId:string;title?:string;url?:string}){
 if(!await db.sheets.get(input.sourceId))throw Error('Fiche source introuvable.');
 if(input.targetType==='sheet'&&!await db.sheets.get(input.targetId))throw Error('Fiche cible introuvable.');
 if(input.targetType==='card'&&!await db.cards.get(input.targetId))throw Error('Flashcard cible introuvable.');
 if(input.targetType==='sheet'&&input.targetId===input.sourceId)throw Error('Une fiche ne peut pas se relier à elle-même.');
 if(input.targetType==='video'){let parsed:URL;try{parsed=new URL(input.url??input.targetId);}catch{throw Error('URL de vidéo invalide.');}if(!['https:','http:'].includes(parsed.protocol))throw Error('Utilise une URL HTTP(S).');input.targetId=parsed.href;input.url=parsed.href;}
 const duplicate=(await db.links.where('sourceId').equals(input.sourceId).toArray()).some(l=>l.targetType===input.targetType&&l.targetId===input.targetId);
 if(duplicate)throw Error('Ce lien existe déjà.');
 const link:StudyLink={id:uid(),sourceId:input.sourceId,targetType:input.targetType,targetId:input.targetId,title:input.title?.trim(),url:input.url,createdAt:now()};await db.links.add(link);return link;
}
export async function deleteStudyLink(id:string){await db.links.delete(id);}
export async function getDueCards(deckId?:string){const source=deckId?await db.cards.where('deckId').equals(deckId).toArray():await db.cards.toArray();const cards=reviewVariants(source);const reviews=await db.reviews.bulkGet(cards.map(reviewKey));const time=now();return cards.filter((_,i)=>!reviews[i]||reviews[i]!.dueAt<=time);}
export async function exportBackup():Promise<Backup>{const [decks,folders,cards,reviews,logs,sheets,homeworks,links]=await Promise.all([db.decks.toArray(),db.folders.toArray(),db.cards.toArray(),db.reviews.toArray(),db.logs.toArray(),db.sheets.toArray(),db.homeworks.toArray(),db.links.toArray()]);return{format:'furasshukado',version:3,exportedAt:new Date().toISOString(),decks,folders,cards,reviews,logs,sheets,homeworks,links};}
function validRows(x:unknown):x is Record<string,unknown>[] {return Array.isArray(x)&&x.every(y=>y!==null&&typeof y==='object'&&!Array.isArray(y));}
function restoreNumbers<T extends {number?:number}>(rows:T[],minimum:number):{rows:(T&{number:number})[];last:number}{
 const used=new Set<number>();let last=Math.max(minimum,...rows.map(r=>Number.isSafeInteger(r.number)&&Number(r.number)>0?Number(r.number):0));
 const numbered=rows.map(r=>{let n=r.number;if(!Number.isSafeInteger(n)||Number(n)<=0||used.has(Number(n))){n=++last;}const number=Number(n);used.add(number);return {...r,number};});
 return {rows:numbered,last};
}
export async function importBackup(data:unknown){
 if(!data||typeof data!=='object')throw Error('Fichier invalide');
 const b=data as Record<string,unknown>;
 if(b.format!=='furasshukado'||![1,2].includes(Number(b.version))||!validRows(b.decks)||!validRows(b.folders)||!validRows(b.cards)||!validRows(b.reviews)||!validRows(b.logs)||(b.version===2&&!validRows(b.sheets)))throw Error('Format de sauvegarde non reconnu.');
 const required=(rows:Record<string,unknown>[],fields:string[])=>rows.every(r=>fields.every(f=>typeof r[f]==='string'));
 if(!required(b.decks,['id','title'])||!required(b.cards,['id','deckId','front','back'])||!required(b.folders,['id','name'])||!required(b.reviews,['cardId'])||!required(b.logs,['id','cardId','deckId']))throw Error('Données de sauvegarde incorrectes.');
 const sheets=b.version===2?b.sheets as Sheet[]:[];
 if(!required(sheets,['id','title']))throw Error('Fiches incorrectes dans la sauvegarde.');
 const deckIds=new Set(b.decks.map(d=>d.id)),cardIds=new Set(b.cards.map(c=>c.id)),sheetIds=new Set(sheets.map(s=>s.id));
 if(b.cards.some(c=>!deckIds.has(c.deckId))||b.reviews.some(r=>!cardIds.has(String(r.cardId).replace(/::reverse$/,'')))||b.logs.some(l=>!cardIds.has(l.cardId)))throw Error('Références invalides dans la sauvegarde.');
 await db.transaction('rw',[db.decks,db.folders,db.cards,db.reviews,db.logs,db.sheets,db.sequences],async()=>{
  const existing=Object.fromEntries((await db.sequences.toArray()).map(c=>[c.name,c.value])) as Record<string,number>;
  const decks=restoreNumbers((b.decks as Deck[]).map(d=>({...d,tags:d.tags??[]})),existing.deck??0);
  const cards=restoreNumbers((b.cards as Flashcard[]).map(c=>({...c,tags:c.tags??[],cardType:c.cardType??'basic',sheetId:c.sheetId&&sheetIds.has(c.sheetId)?c.sheetId:null})),existing.card??0);
  const restoredSheets=restoreNumbers(sheets.map(f=>({...f,tags:f.tags??[],deckId:f.deckId&&deckIds.has(f.deckId)?f.deckId:null})),existing.sheet??0);
  await Promise.all([db.decks.clear(),db.folders.clear(),db.cards.clear(),db.reviews.clear(),db.logs.clear(),db.sheets.clear()]);
  await db.decks.bulkAdd(decks.rows);await db.folders.bulkAdd(b.folders as Folder[]);await db.cards.bulkAdd(cards.rows);await db.reviews.bulkAdd(b.reviews as Review[]);await db.logs.bulkAdd(b.logs as ReviewLog[]);await db.sheets.bulkAdd(restoredSheets.rows);
  await db.sequences.bulkPut([{name:'deck',value:decks.last},{name:'card',value:cards.last},{name:'sheet',value:restoredSheets.last}]);
 });
}
export function download(filename:string,text:string,mime='application/json'){const url=URL.createObjectURL(new Blob([text],{type:mime}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
