"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import styles from "./MemberArea.module.css";
export function MemberRsvp({eventId,ended}:{eventId:string;ended:boolean}) {
 const [signedIn,setSignedIn]=useState(false),[going,setGoing]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState("");
 useEffect(()=>{let live=true;async function load(){try{const db=supabaseBrowser();const {data:{user}}=await db.auth.getUser();if(!live)return;setSignedIn(!!user);if(user){const result=await db.from("event_rsvps").select("status").eq("event_id",eventId).eq("user_id",user.id).maybeSingle();if(result.error)throw new Error(result.error.message);if(live)setGoing(result.data?.status==="going");}}catch{if(live)setError("Unable to load your response.");}finally{if(live)setLoading(false);}}void load();return()=>{live=false;};},[eventId]);
 async function respond(){setBusy(true);setError("");try{const {error}=await supabaseBrowser().rpc("set_rsvp",{p_event_id:eventId,p_going:!going});if(error)throw new Error(error.message);setGoing(!going);}catch(e){setError(e instanceof Error?e.message:"Unable to save your response.");}finally{setBusy(false);}}
 if(ended)return <p>This event has ended.</p>;
 if(loading)return <p role="status">Loading your response…</p>;
 if(!signedIn)return <Link href={"/login?next="+encodeURIComponent(typeof window==="undefined"?"/events":window.location.pathname)}>Sign in to RSVP</Link>;
 return <div><p role="status">{going?"You are attending this event.":"Reserve your place at this event."}</p>{error&&<p role="alert">{error}</p>}<button className={styles.primary} disabled={busy} onClick={()=>void respond()}>{busy?"Saving…":going?"Cancel my RSVP":"I’m attending"}</button></div>;
}
