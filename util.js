export const lineOf=(t,i)=>t.slice(0,i).split('\n').length;
export const mk=(cat,sev,kind,title,why,file,line,snippet)=>({cat,sev,kind,title,why,file,line,snippet});
export const ok=(cat,title,why='')=>mk(cat,'passed','confirmed',title,why);
export const fmt=b=>b>=1e6?(b/1e6).toFixed(1)+' MB':b>=1e3?Math.round(b/1e3)+' KB':b+' B';
export const snip=(t,l)=>(t.split('\n')[l-1]||'').trim().slice(0,160);
export const ext=p=>(p.split('.').pop()||'').toLowerCase();
