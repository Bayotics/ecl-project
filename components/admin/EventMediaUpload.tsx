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
   if(!video && !["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("Choose a JPEG, PNG, WebP, MP4 or WebM file.");
   if(file.size>(video?50:20)*1024*1024)throw new Error(video?"Choose a video under 50 MB. Compress larger videos before uploading.":"Choose an image under 20 MB.");
   let payload:Blob=file;
   if(!video) {
    const bitmap=await createImageBitmap(file);const scale=Math.min(1,2000/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement("canvas");canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
    const context=canvas.getContext("2d");if(!context)throw new Error("Image conversion is unavailable.");
    context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    payload=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Image conversion failed.")),"image/webp",.82));
   }
   onChange(await uploadMedia("event-media",payload),video?"video":"image");
   setMessage(video?"Video uploaded. Save the record to use it.":"Photo optimized and uploaded. Save the record to use it.");
  }catch(error){setMessage(error instanceof Error?error.message:"Upload failed.");}
  finally{setUploading(false);onBusy(false);}
 }
 return <>
  <input aria-label="Media URL" value={value} onChange={e=>onChange(e.target.value,/\.(mp4|webm)(?:[?#]|$)/i.test(e.target.value)?"video":"image")} required/>
  <input aria-label="Upload photo or video" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" disabled={uploading} onChange={e=>void upload(e.target.files?.[0])}/>
  <small>Photos: up to 20 MB, optimized automatically. MP4/WebM videos: up to 50 MB; compress before uploading. Add a transcript in the caption if the video contains speech.</small>
  {message && <span role="status">{message}</span>}
 </>;
}
