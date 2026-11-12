"use client";
export default function AdminError({reset}:{reset:()=>void}) {return <section style={{padding:"4rem"}}><h1>Unable to open administration</h1><p>Please check your connection and try again.</p><button onClick={reset}>Try again</button></section>;}
