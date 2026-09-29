import {mk,ok,lineOf} from './util.js';
const P=[[/AKIA[0-9A-Z]{16}/g,'critical','Possible AWS access key'],[/AIza[0-9A-Za-z_\-]{35}/g,'critical','Possible Google API key'],[/gh[pous]_[A-Za-z0-9]{36,}/g,'critical','Possible GitHub token'],[/\bsk-[A-Za-z0-9_\-]{20,}/g,'critical','Possible secret API key'],[/-----BEGIN [A-Z ]*PRIVATE KEY-----/g,'critical','Possible private key'],[/(?:api[_-]?key|secret|token|passw(?:or)?d|auth)["']?\s*[:=]\s*["']([^"'\s]{8,})["']/gi,'warning','Possible exposed credential']];
const mask=s=>s.length<10?'••••':s.slice(0,3)+'••••••'+s.slice(-2);
export function checkSecurity(files){const o=[];
for(const f of files){if(/(^|\/)\.env(\.|$)/.test(f.path))o.push(mk('Security','critical','confirmed','Environment file in project','.env files often hold credentials and should not be published.',f.path));
if(!f.text)continue;const t=f.text;
for(const[re,sev,title]of P){for(const m of t.matchAll(re)){if(o.length>40)break;const v=m[1]||m[0],l=lineOf(t,m.index);
if(/^(your|xxx|example|changeme|placeholder|\$\{|<)/i.test(v))continue;
o.push(mk('Security',sev,'heuristic',title,'This value appears to resemble a credential and should be reviewed.',f.path,l,(t.split('\n')[l-1]||'').replace(v,mask(v)).trim().slice(0,160)))}}}
if(!o.length)o.push(ok('Security','No obvious credential-like strings detected','Pattern checks only; this is not a full security audit.'));
return o}
