import { useMemo } from 'react';
import type { ReviewLog } from '../lib/db';
export function ReviewCalendar({logs}:{logs:ReviewLog[]}){
 const days=useMemo(()=>{const today=new Date();today.setHours(0,0,0,0);const counts=new Map<string,number>();for(const l of logs){const k=new Date(l.reviewedAt).toLocaleDateString('en-CA');counts.set(k,(counts.get(k)||0)+1);}const result:{date:Date;count:number;key:string}[]=[];for(let i=83;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);const key=d.toLocaleDateString('en-CA');result.push({date:d,count:counts.get(key)||0,key});}return result;},[logs]);
 const active=days.filter(d=>d.count>0).length;
 return <section className="panel calendar-panel"><div className="section-head"><div><h2>Activité de révision</h2><p>{active} jours actifs sur les 12 dernières semaines</p></div></div><div className="calendar-grid" aria-label="Calendrier des révisions">{days.map(d=><div key={d.key} className={'calendar-day '+(d.count===0?'':d.count<5?'lv1':d.count<15?'lv2':d.count<30?'lv3':'lv4')} title={d.date.toLocaleDateString('fr-FR')+' — '+d.count+' réponse(s)'} aria-label={d.date.toLocaleDateString('fr-FR')+' : '+d.count+' révisions'}/>)}</div><div className="calendar-legend"><span>Moins</span><i/><i className="lv1"/><i className="lv2"/><i className="lv3"/><i className="lv4"/><span>Plus</span></div></section>;
}
