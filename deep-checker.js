import {mk,ok,lineOf,snip,near} from './util.js';
const VOID=/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/,OPT=/^(p|li|td|th|tr|thead|tbody|tfoot|option|dt|dd|html|body|head|colgroup)$/;
const AF=Object.getPrototypeOf(async function(){}).constructor,blank=s=>s.replace(/[^\n]/g,' ');
const rel=(f,r)=>{const b=f.split('/').slice(0,-1);for(const s of r.split('/')){if(s==='..')b.pop();else if(s!=='.')b.push(s)}return b.join('/')};
const ex=f=>{const s=new Set(),t=f.text||'';for(const m of t.matchAll(/export\s+(?:async\s+)?(?:const|let|var|function\*?|class)\s+([\w$]+)/g))s.add(m[1]);
for(const m of t.matchAll(/export\s*\{([^}]*)\}/g))m[1].split(',').forEach(x=>{x=x.trim().split(/\s+as\s+/).pop();x&&s.add(x)});if(/export\s+default\b/.test(t))s.add('default');return s};
const strip=t=>t.replace(/\bimport\s[^;'"]*?from\s*['"][^'"]+['"]\s*;?/g,blank).replace(/\bimport\s*['"][^'"]+['"]\s*;?/g,blank)
.replace(/\bexport\s*\{[^}]*\}(\s*from\s*['"][^'"]+['"])?\s*;?/g,blank).replace(/\bexport\s+default\s+/g,'void ').replace(/\bexport\s+(?=(?:async\s+)?(?:function|class|const|let|var)\b)/g,'').replace(/\bimport\.meta\b/g,'({})');
function locate(t){const st=[],q={')':'(',']':'[','}':'{'},n=t.length;let i=0;while(i<n){const c=t[i],d=t[i+1];
if(c==='/'&&d==='/'){while(i<n&&t[i]!=='\n')i++;continue}
if(c==='/'&&d==='*'){const e=t.indexOf('*/',i+2);if(e<0)return[i,'a comment is never closed'];i=e+2;continue}
if(c==='"'||c==="'"||c==='`'){let j=i+1;while(j<n&&t[j]!==c&&(c==='`'||t[j]!=='\n')){if(t[j]==='\\')j++;j++}if(t[j]!==c)return[i,'a string is never closed'];i=j+1;continue}
if('([{'.includes(c))st.push([c,i]);else if(')]}'.includes(c)){const s=st.pop();if(!s||s[0]!==q[c])return[i,`unexpected "${c}"`]}i++}
return st.length?[st.at(-1)[1],`"${st.at(-1)[0]}" is never closed`]:null}
export function checkDeep(files){const o=[],T=f=>f.text!=null,isH=f=>/^html?$/.test(f.ext),pages=files.filter(f=>isH(f)&&T(f));
const put=(f,cat,sev,kind,title,why,i)=>{const l=i==null?null:lineOf(f.text,i);o.push(mk(cat,sev,kind,title,why,f.path,l,l?snip(f.text,l):''))};
for(const f of files)if(/^(html?|css|m?js|json|svg)$/.test(f.ext)&&(f.size===0||(T(f)&&!f.text.trim())))o.push(mk('Structure','warning','confirmed','Empty file','This file has no content, so it does nothing (or shows a blank page).',f.path));
for(const f of files.filter(f=>/^(json|webmanifest)$/.test(f.ext)&&T(f)&&f.text.trim())){try{JSON.parse(f.text)}catch(x){const m=/position (\d+)/.exec(x.message),n=/line (\d+)/.exec(x.message),l=n?+n[1]:m?lineOf(f.text,+m[1]):null;o.push(mk('Structure','critical','confirmed','Invalid JSON',String(x.message).slice(0,140),f.path,l,l?snip(f.text,l):''))}}
const ids=new Set();
for(const f of files.filter(T)){const t=f.text;if(isH(f)||/^m?js$/.test(f.ext))for(const m of t.matchAll(/\bid\s*=\s*["']?([\w-]+)/gi))ids.add(m[1]);for(const m of t.matchAll(/\.id\s*=\s*["']([^"']+)/g))ids.add(m[1])}
for(const f of pages){const t=f.text,H=(sev,k,ti,w,i)=>put(f,'HTML',sev,k,ti,w,i);
const vis=t.replace(/<(script|style)\b[\s\S]*?<\/\1\s*>|<!--[\s\S]*?-->/gi,'').replace(/<[^>]*>/g,'').trim();
if(t.trim()&&!vis&&!/<(script|img|video|canvas|iframe|svg|object|embed)\b/i.test(t))H('critical','heuristic','Page will look blank','No visible text, media or script was found in this page.');
if(t.trim()&&!/^\s*<!doctype html/i.test(t))H('warning','confirmed','Missing <!doctype html>','Without it browsers switch to quirks mode and layout can break.',0);
const c=t.lastIndexOf('<!--');if(c>=0&&t.indexOf('-->',c)<0)H('critical','confirmed','Comment is never closed','Everything after this point is hidden from the browser.',c);
const st=[],re=/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<(\/?)([a-z][\w:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/gi;
for(const m of t.matchAll(re)){if(!m[3])continue;const n=m[3].toLowerCase(),i=m.index;
if(m[2]){const k=st.map(x=>x.n).lastIndexOf(n);if(k<0){if(!VOID.test(n)&&n!=='p')H('warning','confirmed',`Stray closing </${n}>`,'There is no matching opening tag for this.',i)}
else for(const x of st.splice(k).slice(1))if(!OPT.test(x.n))H('warning','confirmed',`<${x.n}> is never closed`,`It was closed implicitly by </${n}> on line ${lineOf(t,i)}, which can break the layout.`,x.i)}
else if(!VOID.test(n)&&!/\/\s*$/.test(m[4]))st.push({n,i})}
for(const x of st)if(!OPT.test(x.n))H('warning','confirmed',`<${x.n}> is never closed`,'The closing tag is missing.',x.i);
for(const m of t.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)){const h=m[0].match(/\bhref\s*=\s*["']([^"']*)/i),tx=m[1].replace(/<[^>]+>/g,'').trim();
if(h&&/^\s*javascript:/i.test(h[1]))H('warning','confirmed','javascript: link','This link has no real destination. Use a button instead.',m.index);
if(!tx&&!/aria-label|<img|<svg|title=/i.test(m[0]))H('warning','confirmed','Link with no text','Visitors and screen readers see an empty, unclickable-looking link.',m.index)}
for(const m of t.matchAll(/\bhref\s*=\s*["']#([^"']+)/gi))if(m[1]!=='top'&&!new Set([...t.matchAll(/\b(?:id|name)\s*=\s*["']([^"']+)/gi)].map(x=>x[1])).has(m[1]))H('warning','confirmed',`Anchor #${m[1]} has no target`,'Nothing on this page has that id, so the link does nothing.',m.index);
for(const m of t.matchAll(/<(img|script|iframe|link|source)\b[^>]*\b(?:src|href)\s*=\s*(["'])\s*\2[^>]*>/gi))H('critical','confirmed',`Empty ${m[1]} source`,'The attribute is blank, so nothing loads (or the page reloads itself).',m.index);
for(const m of t.matchAll(/<label\b[^>]*\bfor\s*=\s*["']([^"']+)/gi))if(!ids.has(m[1]))H('warning','confirmed',`Label points to missing id "${m[1]}"`,'Clicking this label will not focus any field.',m.index);
for(const m of t.matchAll(/<button\b[^>]*>\s*<\/button>/gi))if(!/aria-label|title=/i.test(m[0]))H('warning','confirmed','Button with no label','This button has no text and no aria-label.',m.index);
for(const m of t.matchAll(/<a\b[^>]*target\s*=\s*["']_blank["'][^>]*>/gi))if(!/rel\s*=/.test(m[0]))H('suggestion','confirmed','New-tab link without rel="noopener"','Add rel="noopener" so the opened page cannot control this one.',m.index);
const h1=[...t.matchAll(/<h1\b/gi)];if(h1.length>1)H('suggestion','confirmed','More than one <h1>',`${h1.length} main headings found. Pages normally have one.`,h1[1].index)}
for(const f of files.filter(f=>f.ext==='css'&&T(f)&&f.text.trim())){const t=f.text.replace(/\/\*[\s\S]*?\*\/|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g,blank),st=[];let bad=0;
for(let i=0;i<t.length;i++){if(t[i]==='{')st.push(i);else if(t[i]==='}'&&!st.pop()){put(f,'CSS','critical','confirmed','Extra closing brace }','Rules after this point may be ignored by the browser.',i);bad=1;break}}
if(!bad&&st.length)put(f,'CSS','critical','confirmed','Missing closing brace }','This block is never closed, so the rules after it are lost.',st.at(-1));
const e=/[^{}]+\{\s*\}/.exec(t);if(e)put(f,'CSS','suggestion','confirmed','Empty CSS rule','This rule has no declarations.',e.index+e[0].search(/\S/))}
const js=files.filter(f=>/^m?js$/.test(f.ext)&&!/\.min\./.test(f.path)&&T(f));let bad=0;
for(const f of js){const t=f.text;
try{new AF(strip(t))}catch(x){bad++;const L=locate(t),l=L&&lineOf(t,L[0]);o.push(mk('JavaScript','critical','confirmed','Syntax error',String(x.message).slice(0,120)+(L?`. Nearest problem: ${L[1]}.`:''),f.path,l||null,l?snip(t,l):''))}
for(const m of t.matchAll(/\bimport\b\s*([\w$]+)?\s*,?\s*(?:\{([^}]*)\})?\s*(?:\*\s*as\s*[\w$]+\s*)?from\s*['"](\.{1,2}\/[^'"]+)['"]/g)){
const p=rel(f.path,m[3]),g=files.find(x=>x.path===p)||files.find(x=>x.path===p+'.js');
if(!g){put(f,'JavaScript','critical','confirmed','Import points to a missing file',`${m[3]} does not exist, so this script will fail to load.`,m.index);continue}
const E=ex(g);if(m[1]&&!E.has('default'))put(f,'JavaScript','critical','confirmed','Default import has no default export',`${g.path} does not export a default value.`,m.index);
for(let n of(m[2]||'').split(',')){n=n.trim().split(/\s+as\s+/)[0];if(n&&!E.has(n))put(f,'JavaScript','critical','confirmed',`"${n}" is not exported by ${g.path}`,'The import will throw at load time and the page will stay blank.',m.index)}}
if(pages.length)for(const m of t.matchAll(/getElementById\(\s*["']([^"']+)["']\s*\)|querySelector\(\s*["']#([\w-]+)["']\s*\)/g)){const id=m[1]||m[2];if(!ids.has(id))put(f,'JavaScript','warning','heuristic',`Script looks for #${id}, which is not in any HTML file`,'If nothing creates this element later, the script will hit null and stop.'+((g=>g?` Did you mean #${g}?`:'')(near(id,ids,2))),m.index)}}
if(js.length&&!bad)o.push(ok('JavaScript','No syntax errors detected','Every script compiled with the browser parser.'));
return o}
