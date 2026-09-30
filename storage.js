const K='pd_scans_v2',MAX=12;
const read=()=>{try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}};
export const allScans=async()=>read().sort((a,b)=>b.date-a.date);
export const saveScan=async r=>{let a=[{...r,id:Date.now()},...read()].slice(0,MAX);
while(a.length){try{localStorage.setItem(K,JSON.stringify(a));return}catch{if(a.length===1)throw Error('Device storage is full. Clear old scans in Settings.');a.pop()}}};
export const clearScans=async()=>localStorage.removeItem(K);
