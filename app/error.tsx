"use client";
import Link from "next/link";
export default function ContentError({reset}:{reset:()=>void}) {
 return <section style={{padding:"6rem 1.5rem",maxWidth:"48rem",margin:"auto"}}><h1>We couldn’t load this page.</h1><p>The club’s content service is temporarily unavailable. Please try again shortly.</p><button type="button" onClick={reset}>Try again</button> · <Link href="/contact">Contact the club</Link></section>;
}
