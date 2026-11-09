import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';
export function Markdown({value}:{value:string}){
 const html=useMemo(()=>{
  const parts=value.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  const rendered=parts.map(p=>{
   if(p.startsWith('$$')&&p.endsWith('$$'))return katex.renderToString(p.slice(2,-2),{displayMode:true,throwOnError:false,trust:false});
   if(p.startsWith('$')&&p.endsWith('$'))return katex.renderToString(p.slice(1,-1),{throwOnError:false,trust:false});
   return marked.parse(p,{async:false});
  }).join('');
  return DOMPurify.sanitize(rendered,{ADD_ATTR:['class','style','aria-hidden']});
 },[value]);
 return <div className="markdown" dangerouslySetInnerHTML={{__html:html}}/>;
}
