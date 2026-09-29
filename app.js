import {loadEntries,scan,CATS} from './scanner.js';
import {fmt} from './util.js';
import * as DB from './storage.js';
import {exportHTML,exportJSON} from './report.js';
const $=s=>document.querySelector(s),e=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const S={view:'home',rep:null,hist:[],pend:null,filter:'all',q:'',cat:'',file:null,line:null,sel:[],step:0,cfg:{theme:'dark',html:1,css:1,js:1,assets:1,security:1,performance:1,...JSON.parse(localStorage.pd||'{}')}};
const STEPS=['Reading files','Checking structure','Inspecting HTML','Inspecting CSS','Inspecting JavaScript','Checking assets, security & performance','Generating report'];
const IC={critical:'🔴',warning:'🟠',suggestion:'🟡',passed:'🟢'},LB={critical:'Critical',warning:'Warning',suggestion:'Suggestion',passed:'Passed'};
const ago=d=>{const n=Math.floor((Date.now()-d)/864e5);return n<1?'Today':n<2?'Yesterday':n+' days ago'};
const tone=s=>s>=90?'Excellent':s>=75?'Good':s>=50?'Needs attention':'At risk',col=s=>s>=75?'var(--ok)':s>=50?'var(--warn)':'var(--bad)';
const ring=s=>`<div class=ring style="--p:${s};--c:${col(s)}"><b>${s}</b><small>/ 100</small></div>`;
const card=f=>`<article class="card ${f.sev} ${f.st||''}"><div class=hd><span>${IC[f.sev]} ${LB[f.sev]} · ${e(f.cat)}</span><em>${f.sev==='suggestion'?'Suggestion':f.kind==='heuristic'?'Heuristic':'Confirmed'}</em></div><h3>${e(f.title)}</h3>${f.file?`<p class=meta>${e(f.file)}${f.line?':'+f.line:''}</p>`:''}${f.snippet?`<code>${e(f.snippet)}</code>`:''}${f.why?`<p>${e(f.why)}</p>`:''}${f.sev==='passed'?'':`<div class=row>${f.file?`<button data-a=open data-i=${f.id}>Open file</button>`:''}<button class=g data-a=mark data-i=${f.id}>${f.st==='reviewed'?'Reviewed ✓':'Mark reviewed'}</button><button class=g data-a=ign data-i=${f.id}>${f.st==='ignored'?'Ignored':'Ignore'}</button></div>`}</article>`;
const list=()=>{const r=S.rep;if(!r)return'<p class=empty>Scan a project to see findings here.</p>';const q=S.q.toLowerCase(),a=r.findings.filter(f=>(S.filter==='all'||f.sev===S.filter)&&(!S.cat||f.cat===S.cat)&&(!q||(f.title+(f.file||'')+f.cat+f.why).toLowerCase().includes(q)));
return a.length?a.slice(0,60).map(card).join('')+(a.length>60?`<p class=empty>${a.length-60} more. Refine your search to narrow down.</p>`:''):'<p class=empty>No findings match.</p>'};
const V={
home(){const r=S.rep,p=S.pend;return`<header class=top><h1>Project Doctor</h1><p>Your project's health check</p></header>
${p?`<section class=panel><p class=meta>Project selected</p><h2>${e(p.name)}</h2><p>${p.entries.length} files · ${fmt(p.entries.reduce((a,x)=>a+(x.size||0),0))}</p><button class=cta data-a=start>Start scan</button></section>`
:`<button class=hero data-a=pick><span class=pulse></span><b>Scan Project</b><small>ZIP · Files</small></button><button class="g wide" data-a=dir>Choose a project folder</button>`}
${r?`<section class=panel><p class=meta>${e(r.name)} · ${new Date(r.date).toLocaleDateString()}</p><div class=score>${ring(r.score)}<div><h2>${tone(r.score)}</h2><p>${r.counts.passed} checks passed<br>${r.counts.warning} warnings<br>${r.counts.critical} critical</p></div></div>
<div class=cats>${CATS.map(c=>`<button data-a=cat data-c=${c}><i class=${r.cats[c]}>${{ok:'✓',warn:'⚠',bad:'✕'}[r.cats[c]]}</i>${c}</button>`).join('')}</div>
<p class=note>${r.counts.critical+r.counts.warning+r.counts.suggestion?`${r.counts.critical+r.counts.warning+r.counts.suggestion} things to check.`:'No issues detected by the available checks.'} The score follows simple documented rules and is not a measure of software quality.</p>
<div class=row><button data-a=exph>Export report</button><button class=g data-a=expj>JSON</button></div></section>
<section class=panel><h3>Statistics</h3><div class=stats><div><b>${r.stats.total}</b>files</div><div><b>${fmt(r.stats.size)}</b>total</div>${Object.entries(r.stats.types).map(([k,v])=>`<div><b>${v}</b>${k}</div>`).join('')}</div><h3>Largest files</h3>${r.stats.largest.map(l=>`<button class=fr data-a=file data-p="${e(l.path)}"><span>${e(l.path)}</span><em>${fmt(l.size)}</em></button>`).join('')}</section>`:''}
<h3 class=sec>Recent scans</h3>${S.hist.length?S.hist.slice(0,3).map(h=>`<div class=item><div><b>${e(h.name)}</b><small>${ago(h.date)}</small></div><span style="color:${col(h.score)}">${h.score} / 100</span></div>`).join(''):'<p class=empty>No scans saved yet.</p>'}`},
scan(){return`<header class=top><h1>Scanning project…</h1><p>Everything runs on this device.</p></header><section class=panel>${STEPS.map((s,i)=>`<div class="st ${i<S.step?'d':i===S.step?'c':''}"><i>${i<S.step?'✓':i===S.step?'●':'○'}</i>${s}</div>`).join('')}</section>`},
issues(){const f=(k,l)=>`<button class="tab ${S.filter===k?'on':''}" data-a=flt data-f=${k}>${l}</button>`;
return`<header class=top><h1>Issues</h1></header><div class=tabs>${f('all','All')}${f('critical','Critical')}${f('warning','Warnings')}${f('suggestion','Suggestions')}${f('passed','Passed')}</div>
<input id=q type=search placeholder="Search findings…" value="${e(S.q)}">${S.cat?`<button class="chip" data-a=nocat>${S.cat} ✕</button>`:''}<div id=list>${list()}</div>`},
files(){const r=S.rep;if(!r)return`<header class=top><h1>Files</h1></header><p class=empty>Scan a project to browse its files.</p>`;
if(S.file){const f=r.files?.find(x=>x.path===S.file);return`<header class=top><button class=g data-a=back>‹ Files</button><h2 class=path>${e(S.file)}</h2></header>${f?.text!=null?`<div class=code>${f.text.split('\n').slice(0,4000).map((t,i)=>`<div class="ln${i+1===S.line?' hit':''}" id=L${i+1}><i>${i+1}</i><span>${e(t)||' '}</span></div>`).join('')}</div>`:`<p class=empty>${f?`${fmt(f.size)} · preview not available for this file type.`:'File not found.'}</p>`}`}
let last=[];const rows=[...r.files].sort((a,b)=>a.path.localeCompare(b.path)).slice(0,500).map(f=>{const p=f.path.split('/'),d=p.slice(0,-1);let h='';d.forEach((s,i)=>{if(last[i]!==s){h+=`<div class=fd style="padding-left:${i*14+12}px">📁 ${e(s)}</div>`;last=d.slice(0,i+1)}});last=d;return h+`<button class=fr data-a=file data-p="${e(f.path)}" style="padding-left:${d.length*14+12}px"><span>📄 ${e(p.at(-1))}</span><em>${fmt(f.size)}</em></button>`}).join('');
return`<header class=top><h1>Files</h1><p>${r.files.length} files in ${e(r.name)}</p></header><div class=tree>${rows}</div>`},
scans(){const h=S.hist,pair=S.sel.map(id=>h.find(x=>x.id===id)).filter(Boolean).sort((a,b)=>a.date-b.date);
let cmp='';if(pair.length===2){const[a,b]=pair,d=b.score-a.score;cmp=`<section class=panel><h3>Before / after</h3><div class=cmp><div><small>Previous</small><b>${a.score}</b></div><div><small>Current</small><b>${b.score}</b></div></div><p class=delta style="color:${d>=0?'var(--ok)':'var(--bad)'}">${d>0?'+':''}${d} score change</p><p>Warnings ${a.counts.warning} → ${b.counts.warning}<br>Critical ${a.counts.critical} → ${b.counts.critical}<br>Suggestions ${a.counts.suggestion} → ${b.counts.suggestion}</p></section>`}
return`<header class=top><h1>Scans</h1><p>Tap two scans to compare.</p></header>${cmp}${h.length?h.map(x=>`<button class="item ${S.sel.includes(x.id)?'on':''}" data-a=sel data-id=${x.id}><div><b>${e(x.name)}</b><small>${new Date(x.date).toLocaleString()}</small></div><span style="color:${col(x.score)}">${x.score}</span></button>`).join(''):'<p class=empty>Saved scans appear here so you can track progress.</p>'}`},
settings(){const c=S.cfg,k=(n,l)=>`<label class=sw><input type=checkbox data-k=${n} ${c[n]?'checked':''}>${l}</label>`;
return`<header class=top><h1>Settings</h1></header><section class=panel><h3>Theme</h3><div class=row>${['dark','light','system'].map(t=>`<button class="${c.theme===t?'':'g'}" data-a=theme data-t=${t}>${t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div></section>
<section class=panel><h3>Scan options</h3>${k('html','Check HTML')}${k('css','Check CSS')}${k('js','Check JavaScript')}${k('assets','Check assets')}${k('security','Check security')}${k('performance','Check performance')}</section>
<section class=panel><h3>Storage</h3><button class=g data-a=clear>Clear scan history</button></section>
<section class=panel><h3>Privacy</h3><p>Project files never leave this browser. There are no uploads, no analytics and no external requests. Only findings and statistics are saved locally, never your source code.</p><h3>How the score works</h3><p>Starts at 100. Each critical finding −12 (max −60), each warning −4 (max −30), each suggestion −1 (max −10). Ignoring or reviewing an issue does not change it. Static checks cannot replace browser testing.</p></section>`}};
const render=()=>{document.documentElement.dataset.theme=S.cfg.theme;$('#main').innerHTML=V[S.view]();document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===S.view||(S.view==='scan'&&b.dataset.v==='home')));if(S.view==='files'&&S.line)document.getElementById('L'+S.line)?.scrollIntoView({block:'center'})};
const go=v=>{S.view=v;render();scrollTo(0,0)},save=()=>localStorage.pd=JSON.stringify(S.cfg);
const openFile=(p,l)=>{S.file=p;S.line=l||null;go('files')};
const run=async()=>{S.view='scan';S.step=0;render();try{const r=await scan(S.pend.entries,S.cfg,i=>{S.step=i;render()});r.name=S.pend.name;S.rep=r;S.pend=null;const{files,...rest}=r;await DB.saveScan(rest);S.hist=await DB.allScans()}catch(x){alert('Scan failed: '+x.message)}go('home')};
document.addEventListener('click',async ev=>{const t=ev.target.closest('[data-a],[data-v]');if(!t)return;const{a,v,i}=t.dataset,R=S.rep,f=R?.findings[+i];
if(v)return go(v);
if(a==='pick')$('#zip').click();else if(a==='dir')$('#dir').click();else if(a==='start')run();
else if(a==='open')openFile(f.file,f.line);
else if(a==='mark'||a==='ign'){const s=a==='mark'?'reviewed':'ignored';f.st=f.st===s?'':s;$('#list').innerHTML=list()}
else if(a==='flt'){S.filter=t.dataset.f;render()}else if(a==='cat'){S.cat=t.dataset.c;S.filter='all';go('issues')}else if(a==='nocat'){S.cat='';render()}
else if(a==='file')openFile(t.dataset.p);else if(a==='back'){S.file=null;S.line=null;render()}
else if(a==='sel'){const id=+t.dataset.id;S.sel=S.sel.includes(id)?S.sel.filter(x=>x!==id):[...S.sel.slice(-1),id];render()}
else if(a==='exph')exportHTML(R);else if(a==='expj')exportJSON(R);
else if(a==='theme'){S.cfg.theme=t.dataset.t;save();render()}
else if(a==='clear'&&confirm('Delete all saved scans?')){await DB.clearScans();S.hist=[];S.sel=[];render()}});
document.addEventListener('input',ev=>{if(ev.target.id==='q'){S.q=ev.target.value;$('#list').innerHTML=list()}});
document.addEventListener('change',async ev=>{const t=ev.target;if(t.dataset.k){S.cfg[t.dataset.k]=t.checked?1:0;save()}
if((t.id==='zip'||t.id==='dir')&&t.files.length){try{S.pend=await loadEntries(t.files);go('home')}catch(x){alert(x.message)}t.value=''}});
DB.allScans().then(h=>{S.hist=h;render()}).catch(()=>render());render();
