import {mk,ok,lineOf,snip,fmt} from './util.js';
export function checkCSS(files){const o=[],css=files.filter(f=>f.ext==='css'&&f.text);
for(const f of css){const t=f.text;
if(f.size>2e5)o.push(mk('CSS','warning','confirmed','Very large stylesheet',`${fmt(f.size)}. Consider splitting or minifying.`,f.path));
let n=0;for(const m of t.matchAll(/(?:^|[;{\s])(?:min-)?width\s*:\s*(\d{3,4})px/g)){if(+m[1]>=500&&n++<3){const l=lineOf(t,m.index);o.push(mk('CSS','warning','heuristic','Possible responsive issue',`A fixed width of ${m[1]}px may exceed smaller viewports.`,f.path,l,snip(t,l)))}}
const c={};for(const m of t.matchAll(/(^|\})\s*([^{}@]+)\{/g)){const s=m[2].trim().replace(/\s+/g,' ');c[s]=(c[s]||0)+1}
const d=Object.entries(c).filter(x=>x[1]>1).slice(0,3);for(const[s,k]of d)o.push(mk('CSS','suggestion','heuristic','Duplicate-looking selector',`"${s.slice(0,60)}" is declared ${k} times. Review recommended.`,f.path));}
for(const f of files.filter(f=>/^html?$/.test(f.ext)&&f.text)){const k=(f.text.match(/\sstyle=["']/g)||[]).length;if(k>10)o.push(mk('CSS','suggestion','confirmed','Many inline styles',`${k} inline style attributes. Moving them to a stylesheet is easier to maintain.`,f.path))}
if(css.length&&!css.some(f=>/@media/.test(f.text)))o.push(mk('CSS','warning','heuristic','No media queries found','Possible responsive issue: nothing adapts to screen size in your stylesheets.'));
if(css.length){if(!o.some(x=>x.title.startsWith('Possible resp')))o.push(ok('CSS','No suspicious fixed widths'));if(css.some(f=>/@media/.test(f.text)))o.push(ok('CSS','Media queries detected'))}
return o}
