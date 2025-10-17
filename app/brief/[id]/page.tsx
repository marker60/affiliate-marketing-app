"use client";
import * as React from "react";
type Brief={id:string;title:string;created_at?:string};
async function fetchBrief(id:string){const r=await fetch(`/api/brief/${id}`,{cache:"no-store"});const j=await r.json();if(j?.ok===false) return {ok:false,error:j.error};const d:Brief=j?.item??j?.data??j;return d?.id?{ok:true,data:d}:{ok:false,error:"Brief not found"};}
async function saveBrief(id:string,title:string){const r=await fetch("/api/brief/save",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id,title})});return r.json();}
export default function Page({params}:{params:{id:string}}){
  const id=params.id;const[loading,setLoading]=React.useState(true);const[err,setErr]=React.useState<string|null>(null);
  const[b,setB]=React.useState<Brief|null>(null);const[t,setT]=React.useState("");const[saving,setSaving]=React.useState(false);const[msg,setMsg]=React.useState<string|null>(null);
  React.useEffect(()=>{let off=false;(async()=>{setLoading(true);const r=await fetchBrief(id);if(off)return;if(!r.ok){setErr(r.error||"Load failed");}else{setB(r.data!);setT(r.data!.title??"");}setLoading(false);})();return()=>{off=true};},[id]);
  const onSubmit=async(e:React.FormEvent)=>{e.preventDefault();setSaving(true);setErr(null);setMsg(null);const r=await saveBrief(id,t.trim());if(r?.ok){setMsg("Saved!");setB(x=>x?{...x,title:t.trim()}:x);setTimeout(()=>setMsg(null),1200);}else{setErr(r?.error||"Save failed");}setSaving(false);};
  return(<div className="max-w-2xl mx-auto p-6 space-y-6"><h1 className="text-2xl font-semibold">Brief</h1><p className="text-xs text-gray-500">ID: <span className="font-mono">{id}</span></p>
    {loading&&<div>Loading…</div>}{err&&<div className="text-red-600">Error: {err}</div>}
    {!loading&&!err&&b&&(<form onSubmit={onSubmit} className="space-y-4"><div className="space-y-2"><label className="text-sm font-medium">Title</label>
      <input className="w-full rounded-lg border px-3 py-2" value={t} onChange={e=>setT(e.target.value)} required maxLength={200}/>
      <p className="text-xs text-gray-500">Edit the title and click Save.</p></div>
      <div className="flex items-center gap-3"><button disabled={saving} className="rounded-lg px-4 py-2 border shadow-sm disabled:opacity-60">{saving?"Saving…":"Save"}</button>{msg&&<span className="text-green-600">{msg}</span>}</div></form>)}
  </div>);}
