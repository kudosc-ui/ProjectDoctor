import {mk,ok,lineOf,snip,fmt} from './util.js';
export function checkJS(files){const o=[],js=files.filter(f=>/^m?js$/.test(f.ext)&&f.text&&!/\.min\./.test(f.path));
for(const f of files.filter(f=>/^m?js$/.test(f.ext)&&f.size>5e5))o.push(mk('JavaScript','warning','confirmed','Very large script',`${fmt(f.size)} of JavaScript. Consider splitting or minifying.`,f.path));
for(const f of js){const t=f.text,at=(sev,kind,title,why,i)=>{const l=lineOf(t,i);o.push(mk('JavaScript',sev,kind,title,why,f.path,l,snip(t,l)))};
if(f.ext==='js'&&!/^\s*(import|export)\s/m.test(t)&&!/\bawait\b/.test(t)){try{new Function(t)}catch(x){o.push(mk('JavaScript','warning','heuristic','Possible syntax error',String(x.message).slice(0,140),f.path))}}
let m=[...t.matchAll(/\bconsole\.(log|debug|warn|error)\(/g)];if(m.length)at('suggestion','confirmed',`${m.length} console statement${m.length>1?'s':''}`,'Remove debug output before publishing.',m[0].index);
m=[...t.matchAll(/\b(TODO|FIXME)\b/g)];if(m.length)at('suggestion','confirmed',`${m.length} TODO/FIXME marker${m.length>1?'s':''}`,'Unfinished work is noted in this file.',m[0].index);
m=t.match(/https?:\/\/(?!www\.w3\.org)[^\s'"`)]+/);if(m)at('suggestion','heuristic','Hardcoded URL',`Found ${m[0].slice(0,60)}. Consider moving URLs into configuration.`,m.index);}
if(js.length){if(!o.some(x=>x.title.startsWith('Possible syntax')))o.push(ok('JavaScript','No syntax errors detected','Checked with the browser parser where possible.'));if(!o.some(x=>x.title.startsWith('Very large')))o.push(ok('JavaScript','Reasonable script sizes'))}
return o}
