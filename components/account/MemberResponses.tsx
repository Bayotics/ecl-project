"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {api} from "@/lib/api-client";
type Response={id:string;status:"going"|"cancelled";event:{slug:string;title:string}|null};
export function MemberResponses(){
 const [rows,setRows]=useState<Response[]>([]),[admin,setAdmin]=useState(false),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{let live=true;async function load(){try{const data=await api<{admin:boolean;responses:Response[]}>("/api/account/rsvps");
 if(live){setRows(data.responses);setAdmin(data.admin);}
 }catch{if(live)setError("Unable to load event responses.");}finally{if(live)setLoading(false);}}void load();return()=>{live=false;};},[]);
 return <section><h2>Your event responses</h2>{admin&&<p><Link href="/admin">Open administration dashboard →</Link></p>}{error&&<p role="alert">{error}</p>}{loading?<p>Loading…</p>:rows.length?<ul>{rows.map(r=><li key={r.id}>{r.event?<Link href={"/events/"+r.event.slug}>{r.event.title}</Link>:"Event no longer published"} — {r.status}</li>)}</ul>:<p>You haven’t responded to an event yet.</p>}</section>;
}
