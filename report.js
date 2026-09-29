import {fmt} from './util.js';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const dl=(n,t,m)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:m}));a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1e3)};
const slug=r=>'project-doctor-'+r.name.replace(/\W+/g,'-');
export const exportJSON=r=>{const{files,...x}=r;dl(slug(r)+'.json',JSON.stringify(x,null,2),'application/json')};
export const exportHTML=r=>{const f=r.findings.filter(x=>x.sev!=='passed'),c=r.counts;
dl(slug(r)+'.html',`<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>${esc(r.name)} · Project Doctor report</title><style>body{font:15px/1.5 system-ui;max-width:760px;margin:auto;padding:24px;color:#111}h1{margin:0}.s{font-size:48px;font-weight:700}li{margin:8px 0}code{background:#eee;padding:1px 5px;border-radius:4px}small{color:#666}</style>
<h1>${esc(r.name)}</h1><small>${new Date(r.date).toLocaleString()}</small><p class=s>${r.score}/100</p>
<p>${c.critical} critical · ${c.warning} warnings · ${c.suggestion} suggestions · ${c.passed} checks passed</p>
<h2>Statistics</h2><p>${r.stats.total} files, ${fmt(r.stats.size)}. ${Object.entries(r.stats.types).map(([k,v])=>k+': '+v).join(', ')}</p>
<h2>Findings</h2><ol>${f.map(x=>`<li><b>${esc(x.sev)}</b> (${x.sev==='suggestion'?'suggestion':x.kind}) ${esc(x.title)}<br><small>${esc(x.file||'')}${x.line?':'+x.line:''}</small><br>${esc(x.why)}${x.snippet?`<br><code>${esc(x.snippet)}</code>`:''}</li>`).join('')}</ol>
<h2>Recommendations</h2><ul>${[...new Set(f.filter(x=>x.sev!=='critical').map(x=>x.title.replace(/\d+/g,'N')))].slice(0,12).map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
<p><small>Generated locally by Project Doctor. Static analysis cannot replace browser or runtime testing. "No issues detected" means only that the available checks found nothing.</small></p>`,'text/html')};
