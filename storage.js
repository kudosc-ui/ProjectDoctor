const open=()=>new Promise((res,rej)=>{const r=indexedDB.open('projectdoctor',1);r.onupgradeneeded=()=>r.result.createObjectStore('scans',{keyPath:'id',autoIncrement:true});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const tx=async(m,f)=>{const d=await open();return new Promise((res,rej)=>{const q=f(d.transaction('scans',m).objectStore('scans'));q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})};
export const saveScan=r=>tx('readwrite',s=>s.add(r));
export const allScans=async()=>(await tx('readonly',s=>s.getAll())).sort((a,b)=>b.date-a.date);
export const clearScans=()=>tx('readwrite',s=>s.clear());
