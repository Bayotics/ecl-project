"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Me } from "@/lib/api-client";
import styles from "./MemberArea.module.css";
export function MemberRsvp({eventId,ended}:{eventId:string;ended:boolean}) {
 const [signedIn,setSignedIn]=useState(false),[going,setGoing]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState("");
 useEffect(()=>{let live=true;async function load(){try{const {user}=await api<Me>("/api/auth/me");if(!live)return;setSignedIn(!!user);if(user){const result=await api<{going:boolean}>("/api/account/rsvp?event="+encodeURIComponent(eventId));if(live)setGoing(result.going);}}catch{if(live)setError("Unable to load your response.");}finally{if(live)setLoading(false);}}void load();return()=>{live=false;};},[eventId]);
 async function respond(){setBusy(true);setError("");try{const result=await api<{going:boolean}>("/api/account/rsvp",{body:{eventId,going:!going}});setGoing(result.going);}catch(e){setError(e instanceof Error?e.message:"Unable to save your response.");}finally{setBusy(false);}}
 if(ended)return <p>This event has ended.</p>;
 if(loading)return <p role="status">Loading your response…</p>;
 if(!signedIn)return <Link href={"/login?next="+encodeURIComponent(typeof window==="undefined"?"/events":window.location.pathname)}>Sign in to RSVP</Link>;
 return <div><p role="status">{going?"You are attending this event.":"Reserve your place at this event."}</p>{error&&<p role="alert">{error}</p>}<button className={styles.primary} disabled={busy} onClick={()=>void respond()}>{busy?"Saving…":going?"Cancel my RSVP":"I’m attending"}</button></div>;
}
