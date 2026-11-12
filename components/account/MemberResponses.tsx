"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabaseBrowser} from "@/lib/supabase/client";
import type {Rsvp,Event} from "@/lib/supabase/types";
export function MemberResponses(){
 const [rows,setRows]=useState<(Rsvp&{event?:Event})[]>([]),[admin,setAdmin]=useState(false),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{let live=true;async function load(){try{const db=supabaseBrowser();const {data:{user}}=await db.auth.getUser();if(!user)return;
 const [responses,events,role]=await Promise.all([db.from("event_rsvps").select("*").eq("user_id",user.id).order("created_at",{ascending:false}),db.from("events").select("*").eq("published",true),db.rpc("is_admin")]);
 if(responses.error||events.error)throw new Error("Unable to load event responses.");
 if(live){setRows((responses.data??[]).map(r=>({...r,event:events.data?.find(e=>e.id===r.event_id)})));setAdmin(role.data===true);}
 }catch{if(live)setError("Unable to load event responses.");}finally{if(live)setLoading(false);}}void load();return()=>{live=false;};},[]);
 return <section><h2>Your event responses</h2>{admin&&<p><Link href="/admin">Open administration dashboard →</Link></p>}{error&&<p role="alert">{error}</p>}{loading?<p>Loading…</p>:rows.length?<ul>{rows.map(r=><li key={r.id}>{r.event?<Link href={"/events/"+r.event.slug}>{r.event.title}</Link>:"Event no longer published"} — {r.status}</li>)}</ul>:<p>You haven’t responded to an event yet.</p>}</section>;
}
