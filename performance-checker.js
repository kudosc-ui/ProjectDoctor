import {mk,ok,fmt} from './util.js';
export function checkPerf(files){const o=[],img=files.filter(f=>/^(png|jpe?g|gif|bmp|tiff?)$/.test(f.ext)&&f.size>5e5);
for(const f of img)o.push(mk('Performance','warning','confirmed','Large image',`${fmt(f.size)}. Compress it or convert to WebP/AVIF where appropriate.`,f.path));
for(const f of files)if(f.size>5e6&&!img.includes(f))o.push(mk('Performance','warning','confirmed','Very large file',`${fmt(f.size)}. Files this size slow down loading on mobile networks.`,f.path));
const js=files.filter(f=>/^m?js$/.test(f.ext)).reduce((a,f)=>a+f.size,0),css=files.filter(f=>f.ext==='css').reduce((a,f)=>a+f.size,0);
if(js>1e6)o.push(mk('Performance','warning','heuristic','Heavy JavaScript',`${fmt(js)} of scripts in total. Consider splitting or minifying.`));
if(css>3e5)o.push(mk('Performance','suggestion','heuristic','Heavy CSS',`${fmt(css)} of stylesheets in total.`));
if(!img.length)o.push(ok('Performance','No oversized images'));if(js<=1e6)o.push(ok('Performance','Reasonable JavaScript size'));
return o}
