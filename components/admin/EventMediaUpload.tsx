"use client";
import { useState } from "react";
import { uploadMedia } from "@/lib/api-client";

export function EventMediaUpload({value,onChange,onBusy}:{value:string;onChange:(url:string,type:"image"|"video")=>void;onBusy:(busy:boolean)=>void}) {
 const [message,setMessage]=useState("");
 const [uploading,setUploading]=useState(false);
 async function upload(file:File|undefined) {
  if(!file)return;
  setMessage("");setUploading(true);onBusy(true);
  try {
   const video=["video/mp4","video/webm"].includes(file.type);
   if(!video && !["image/jpeg","image/png","image/webp","image/avif"].includes(file.type))throw new Error("Choose a JPEG, PNG, WebP, AVIF, MP4 or WebM file.");
   if(file.size>(video?50:25)*1024*1024)throw new Error(video?"Choose a video under 50 MB. Compress larger videos before uploading.":"Choose an image under 25 MB.");
   // Stored exactly as chosen (no re-encoding); the website sizes photos for each screen when shown.
   onChange(await uploadMedia("event-media",file),video?"video":"image");
   setMessage(video?"Video uploaded. Save the record to use it.":"Original photo uploaded at full quality. Save the record to use it.");
  }catch(error){setMessage(error instanceof Error?error.message:"Upload failed.");}
  finally{setUploading(false);onBusy(false);}
 }
 return <>
  <input aria-label="Media URL" value={value} onChange={e=>onChange(e.target.value,/\.(mp4|webm)(?:[?#]|$)/i.test(e.target.value)?"video":"image")} required/>
  <input aria-label="Upload photo or video" type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" disabled={uploading} onChange={e=>void upload(e.target.files?.[0])}/>
  <small>Photos: up to 25 MB, kept at full quality. MP4/WebM videos: up to 50 MB; compress before uploading. Add a transcript in the caption if the video contains speech.</small>
  {message && <span role="status">{message}</span>}
 </>;
}
