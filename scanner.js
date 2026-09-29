import {checkHTML} from './html-checker.js';import {checkCSS} from './css-checker.js';import {checkJS} from './js-checker.js';
import {checkAssets} from './asset-checker.js';import {checkSecurity} from './security-checker.js';import {checkPerf} from './performance-checker.js';
import {mk,ok,ext} from './util.js';
export const CATS=['Structure','HTML','CSS','JavaScript','Assets','Performance','Security'];
const TEXT=/\.(html?|css|m?js|json|svg|xml|txt|md|env)$|(^|\/)\.env/i,SKIP=/(^|\/)(node_modules|\.git|__MACOSX)\//,tick=()=>new Promise(r=>setTimeout(r));
const W={critical:12,warning:4,suggestion:1};
export async function readZip(buf){const v=new DataView(buf),u=new Uint8Array(buf);let e=u.length-22;while(e>=0&&v.getUint32(e,true)!==0x06054b50)e--;if(e<0)throw Error('Not a valid ZIP file');
let n=v.getUint16(e+10,true),p=v.getUint32(e+16,true);const out=[];
for(let i=0;i<n;i++){const m=v.getUint16(p+10,true),cs=v.getUint32(p+20,true),us=v.getUint32(p+24,true),nl=v.getUint16(p+28,true),xl=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),off=v.getUint32(p+42,true);
const name=new TextDecoder().decode(u.subarray(p+46,p+46+nl));p+=46+nl+xl+cl;if(name.endsWith('/'))continue;
const s=off+30+v.getUint16(off+26,true)+v.getUint16(off+28,true);
out.push({path:name,size:us,get:async()=>{const d=u.subarray(s,s+cs);if(m===0)return d;return new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())}})}
return out}
export async function loadEntries(list){list=[...list];let out=[],name=list[0].name.replace(/\.zip$/i,'');
for(const f of list){if(/\.zip$/i.test(f.name)){const z=await readZip(await f.arrayBuffer());
if(new Set(z.map(x=>x.path.split('/')[0])).size===1&&z.every(x=>x.path.includes('/')))z.forEach(x=>x.path=x.path.split('/').slice(1).join('/'));out.push(...z)}
else{const rp=f.webkitRelativePath;if(rp)name=rp.split('/')[0];out.push({path:rp?rp.split('/').slice(1).join('/'):f.name,size:f.size,get:async()=>new Uint8Array(await f.arrayBuffer())})}}
out=out.filter(x=>x.path&&!SKIP.test(x.path));if(!out.length)throw Error('No project files found');
return{name:list.length>1&&!list[0].webkitRelativePath?'Selected files':name,entries:out}}
function structure(files){const o=[],has=p=>files.some(f=>f.path.toLowerCase()===p);
if(!has('index.html')&&files.some(f=>f.ext==='html'))o.push(mk('Structure','warning','heuristic','No index.html at project root','Most hosts serve index.html by default. Review recommended.'));else if(has('index.html'))o.push(ok('Structure','index.html found at root'));
const deep=files.filter(f=>f.path.split('/').length>7);if(deep.length)o.push(mk('Structure','suggestion','confirmed','Very deeply nested paths',`${deep.length} file(s) sit more than 6 folders deep.`,deep[0].path));
if(!files.some(f=>/^readme/i.test(f.path)))o.push(mk('Structure','suggestion','confirmed','No README','A README helps others (and future you) understand the project.'));
if(files.some(f=>/(^|\/)(thumbs\.db|\.ds_store)$/i.test(f.path)))o.push(mk('Structure','suggestion','confirmed','System files included','Files like .DS_Store or Thumbs.db can be removed.'));
return o}
export async function scan(entries,cfg,step){step(0);const files=[];let i=0;
for(const en of entries){const b=await en.get(),f={path:en.path,size:en.size||b.length,ext:ext(en.path)};
if(TEXT.test(en.path)&&f.size<1.5e6)f.text=new TextDecoder().decode(b);
if(f.size<25e6){let h=2166136261;for(let k=0;k<b.length;k++){h^=b[k];h=Math.imul(h,16777619)}f.hash=f.size+':'+(h>>>0)}
files.push(f);if(++i%20===0)await tick()}
const F=[];step(1);F.push(...structure(files));await tick();
step(2);if(cfg.html)F.push(...checkHTML(files));await tick();
step(3);if(cfg.css)F.push(...checkCSS(files));await tick();
step(4);if(cfg.js)F.push(...checkJS(files));await tick();
step(5);if(cfg.assets)F.push(...checkAssets(files));if(cfg.security)F.push(...checkSecurity(files));if(cfg.performance)F.push(...checkPerf(files));await tick();
step(6);const O={critical:0,warning:1,suggestion:2,passed:3};F.sort((a,b)=>O[a.sev]-O[b.sev]);F.forEach((f,k)=>f.id=k);
const counts={critical:0,warning:0,suggestion:0,passed:0};F.forEach(f=>counts[f.sev]++);
const score=Math.max(0,100-Math.min(60,counts.critical*W.critical)-Math.min(30,counts.warning*W.warning)-Math.min(10,counts.suggestion*W.suggestion));
const cats={};for(const c of CATS){const a=F.filter(f=>f.cat===c);cats[c]=a.some(f=>f.sev==='critical')?'bad':a.some(f=>f.sev==='warning')?'warn':'ok'}
const T={HTML:0,CSS:0,JavaScript:0,Images:0,Other:0};for(const f of files)T[/^html?$/.test(f.ext)?'HTML':f.ext==='css'?'CSS':/^m?js$/.test(f.ext)?'JavaScript':/^(png|jpe?g|gif|webp|avif|svg|ico|bmp)$/.test(f.ext)?'Images':'Other']++;
const stats={total:files.length,size:files.reduce((a,f)=>a+f.size,0),types:T,largest:[...files].sort((a,b)=>b.size-a.size).slice(0,5).map(f=>({path:f.path,size:f.size}))};
await tick();return{date:Date.now(),score,counts,cats,findings:F,stats,files}}
