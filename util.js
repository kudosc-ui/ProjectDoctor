export const lineOf=(t,i)=>t.slice(0,i).split('\n').length;
export const mk=(cat,sev,kind,title,why,file,line,snippet)=>({cat,sev,kind,title,why,file,line,snippet});
export const ok=(cat,title,why='')=>mk(cat,'passed','confirmed',title,why);
export const fmt=b=>b>=1e6?(b/1e6).toFixed(1)+' MB':b>=1e3?Math.round(b/1e3)+' KB':b+' B';
export const snip=(t,l)=>(t.split('\n')[l-1]||'').trim().slice(0,160);
export const ext=p=>(p.split('.').pop()||'').toLowerCase();
export const lev=(a,b)=>{const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]};
export const near=(w,set,max=2)=>{let b=null,n=max+1;for(const x of set){if(x===w||Math.abs(x.length-w.length)>max)continue;const k=lev(w.toLowerCase(),x.toLowerCase());if(k<n){n=k;b=x}}return b};
