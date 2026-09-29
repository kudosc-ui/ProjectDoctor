import {mk,ok,lineOf,snip,ext} from './util.js';
const res=(from,ref)=>{try{ref=decodeURI(ref.split(/[?#]/)[0])}catch{return null}
if(!ref||/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref))return null;const b=ref[0]==='/'?[]:from.split('/').slice(0,-1);
for(const s of ref.split('/')){if(s==='..')b.pop();else if(s&&s!=='.')b.push(s)}return b.join('/')};
export function checkAssets(files){const o=[],set=new Set(files.map(f=>f.path));let bad=0;
const chk=(f,ref,i)=>{const p=res(f.path,ref);if(p&&!set.has(p)&&!set.has(p+'/index.html')&&bad++<30){const l=lineOf(f.text,i);o.push(mk('Assets','critical','confirmed','Missing file',`${f.path} references ${ref} but the file could not be found.`,f.path,l,snip(f.text,l)))}};
for(const f of files.filter(f=>f.text)){
if(/^html?$/.test(f.ext))for(const m of f.text.matchAll(/<(img|script|link|source|video|audio|iframe)\b[^>]*>/gi)){const a=m[0].match(/\b(?:src|href)=["']([^"']+)["']/i);if(a)chk(f,a[1],m.index)}
if(f.ext==='css')for(const m of f.text.matchAll(/url\(\s*['"]?([^'")]+)/g))chk(f,m[1],m.index)}
if(!bad&&files.some(f=>/^html?$/.test(f.ext)))o.push(ok('Assets','All local references resolved','Every local src/href/url() points to an existing file.'));
const names={};for(const f of files){const n=f.path.split('/').pop();(names[n]??=[]).push(f.path)}
for(const[n,p]of Object.entries(names))if(p.length>1&&!/^(index\.html|\.gitkeep|readme\.md|package\.json|\.gitignore)$/i.test(n)&&o.length<80)o.push(mk('Assets','suggestion','heuristic','Duplicate filenames',`${p.slice(0,3).join(', ')} share the name ${n}.`,p[0]));
const h={};for(const f of files){if(f.hash&&f.size>200)(h[f.hash]??=[]).push(f)}
for(const g of Object.values(h))if(g.length>1)o.push(mk('Assets','suggestion','confirmed','Possible duplicate files',`${g.slice(0,3).map(x=>x.path).join(' and ')} have identical content.`,g[0].path));
for(const f of files)if(/^(bmp|tiff?|psd|ai|raw)$/.test(f.ext))o.push(mk('Assets','warning','confirmed','Unsupported web format',`.${f.ext} files do not display in browsers. Convert to PNG, JPG, WebP or AVIF.`,f.path));
const all=files.filter(f=>f.text).map(f=>f.text).join('\n').toLowerCase();let u=0;
for(const f of files){const n=f.path.split('/').pop().toLowerCase();if(/^(png|jpe?g|gif|webp|avif|svg|css|js|mjs)$/.test(f.ext)&&!/^html?$/.test(f.ext)&&!all.includes(n)&&u++<10)o.push(mk('Assets','suggestion','heuristic','Unused-looking file','No file mentions this name. It may be unused, or loaded dynamically. Review recommended.',f.path))}
return o}
