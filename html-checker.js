import {mk,ok,lineOf,snip} from './util.js';
export function checkHTML(files){const o=[],pages=files.filter(f=>/^html?$/.test(f.ext)&&f.text);
for(const f of pages){const t=f.text,add=(sev,kind,title,why,i)=>{const l=i==null?null:lineOf(t,i);o.push(mk('HTML',sev,kind,title,why,f.path,l,l&&snip(t,l)))};
if(!/<title[^>]*>\s*\S/i.test(t))add('warning','confirmed','Missing <title>','Pages need a title for tabs, bookmarks and search results.');
if(!/<meta[^>]+name=["']viewport/i.test(t))add('warning','confirmed','Missing viewport meta tag','Without it, phones render the page as a zoomed-out desktop layout.');
if(!/<html[^>]+lang=/i.test(t))add('suggestion','confirmed','Missing lang attribute','A lang attribute helps screen readers and translation tools.');
for(const m of t.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi))add('warning','confirmed','Image without alt attribute','Screen readers cannot describe this image.',m.index);
const seen={};for(const m of t.matchAll(/\sid=["']([^"']+)["']/g)){if(seen[m[1]])add('warning','confirmed',`Duplicate ID "${m[1]}"`,'IDs must be unique; scripts and anchors may target the wrong element.',m.index);seen[m[1]]=1}
for(const m of t.matchAll(/<a\b(?![^>]*\bhref=["'][^"'#][^"']*["'])[^>]*>/gi))add('suggestion','heuristic','Possible empty link','This link has no real destination. Review recommended.',m.index);
const opens=(t.match(/<div\b/gi)||[]).length,cl=(t.match(/<\/div>/gi)||[]).length;
if(opens!==cl)add('warning','heuristic','Malformed-looking markup',`Found ${opens} <div> tags but ${cl} closing tags. Review recommended.`);}
if(pages.length){const h=s=>o.some(x=>x.title.startsWith(s));
if(!h('Missing viewport'))o.push(ok('HTML','Responsive viewport detected','Your HTML contains a viewport meta tag.'));
if(!h('Missing <title'))o.push(ok('HTML','Page titles present'));
if(!h('Image without alt'))o.push(ok('HTML','No images missing alt text'));}
return o}
