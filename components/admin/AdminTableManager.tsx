"use client";
import Link from "next/link";
import { EventMediaUpload } from "./EventMediaUpload";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, uploadMedia } from "@/lib/api-client";
import { sections, slugFromTitle, localInput } from "@/lib/db/admin-fields";
import styles from "./AdminArea.module.css";

type Row = Record<string, string | number | boolean | null>;
export function AdminTableManager({ table }: { table: string }) {
  const config = sections[table];
  const [rows,setRows] = useState<Row[]>([]);
  const [categories,setCategories] = useState<{id:string;title:string}[]>([]);
  const [albums,setAlbums] = useState<{id:string;title:string}[]>([]);
  const [editor,setEditor] = useState<Row|null>(null);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [search,setSearch] = useState("");
  const [busy,setBusy] = useState(false);
  const [loading,setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await api<{rows:Row[];categories:{id:string;title:string}[];albums:{id:string;title:string}[]}>(`/api/admin/${table}`);
      setRows(result.rows);
      setCategories(result.categories);
      setAlbums(result.albums);
    } catch(e) { setError(e instanceof Error ? e.message : "Unable to load records."); }
    finally { setLoading(false); }
  },[table]);
  useEffect(()=>{ const frame=requestAnimationFrame(()=>void load()); return ()=>cancelAnimationFrame(frame); },[load]);
  function edit(row?: Row) {
    setError(""); setNotice("");
    const value: Row = row ? {...row} : {};
    for(const f of config.fields) {
      if(f.type==="datetime-local" && value[f.key]) value[f.key]=localInput(String(value[f.key]));
      else if(!row) value[f.key]=f.type==="checkbox"?false:f.type==="number"?(f.key==="capacity"?null:0):"";
    }
    if(!row && table==="executives") value.section="current";
    if(!row && table==="event_media") value.media_type="image";
    if(!row && table==="events") value.category="Community";
    if(!row && table==="newsletter_subscribers") {value.source="admin";value.active=true;}
    setEditor(value);
  }
  function change(key:string,value:Row[string]) {
    setEditor(current=>{
      if(!current) return current;
      const next={...current,[key]:value};
      if((key==="title" || key==="name") && "slug" in current && (!current.slug || current.slug===slugFromTitle(String(current[key])))) next.slug=slugFromTitle(String(value));
      return next;
    });
  }
  async function upload(file:File|undefined) {
    if(!file) return;
    setBusy(true);setError("");
    try {
      // The original file is stored exactly as chosen; the website sizes it for each screen when shown.
      if(!["image/jpeg","image/png","image/webp","image/avif"].includes(file.type) || file.size>50*1024*1024) throw new Error("Choose a JPEG, PNG, WebP or AVIF image under 50 MB.");
      change("image_url",await uploadMedia("site-media",file));
      setNotice("Original image uploaded at full quality. Save the record to use it.");
    } catch(e){setError(e instanceof Error?e.message:"Upload failed.");}finally{setBusy(false);}
  }
  async function save(event:FormEvent) {
    event.preventDefault();if(!editor) return;const formData=new FormData(event.currentTarget as HTMLFormElement);setBusy(true);setError("");setNotice("");
    try {
      const payload:Row={};
      for(const f of config.fields) {
        if(f.readOnly) continue;
        let value=(f.type==="datetime-local" ? formData.get(f.key) : editor[f.key]) as Row[string];
        if(f.required && !String(value??"").trim()) throw new Error(f.label+" is required.");
        if(f.type==="datetime-local") value=new Date(String(value)).toISOString();
        if(f.type==="number") { value=value===""||value==null?null:Number(value);if(value!==null && (!Number.isInteger(value)||(f.key==="capacity" && value<1))) throw new Error("Enter a valid "+f.label.toLowerCase()+"."); }
        if(f.type==="date" && !value) value=null;
        if(typeof value==="string") value=value.trim();
        if(f.key==="slug" && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(value))) throw new Error("Use lowercase letters, numbers and dashes for the slug.");
        if((f.key.endsWith("_url") || f.key==="cta_url") && value && !/^(https:\/\/|\/[^/])/.test(String(value))) throw new Error("Use a site path or HTTPS URL.");
        payload[f.key]=value??null;
      }
      if(table==="events" && new Date(String(payload.end_at))<new Date(String(payload.start_at))) throw new Error("The end must be after the start.");
      if(table==="event_media") payload.media_type=editor.media_type??"image";
      await api(editor.id!=null ? `/api/admin/${table}/${encodeURIComponent(String(editor.id))}` : `/api/admin/${table}`,{method:editor.id!=null?"PATCH":"POST",body:payload});
      setEditor(null);await load();setNotice("Saved. Published changes appear on the website on its next load.");
    }catch(e){setError(e instanceof Error?e.message:"Save failed.");}finally{setBusy(false);}
  }
  async function remove(row:Row) {
    if(!confirm("Permanently delete this record? "+(table==="gallery_albums"?"Its photos will also be removed from the gallery.":""))) return;
    setBusy(true);setError("");
    try {await api(`/api/admin/${table}/${encodeURIComponent(String(row.id))}`,{method:"DELETE"});await load();setNotice("Record deleted.");}
    catch(e){setError(e instanceof Error?e.message:"Delete failed.");}finally{setBusy(false);}
  }
  function exportCsv() {
    const keys=config.fields.map(f=>f.key);
    const cell=(value:unknown)=>'"'+String(value??"").replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
    const csv=[keys,...rows.map(r=>keys.map(k=>r[k]))].map(row=>row.map(cell).join(",")).join("\r\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=table+".csv";a.click();URL.revokeObjectURL(url);
  }
  const filtered=rows.filter(row=>Object.values(row).some(v=>String(v??"").toLowerCase().includes(search.toLowerCase())));
  const columns=config.fields.filter(f=>!["image","media","textarea","checkbox"].includes(f.type??"")).slice(0,3);
  return <section className={styles.shell}><div className={styles.content}>
    <Link className={styles.back} href="/admin">← Administration</Link>
    <div className={styles.managerHeader}><h1>{config.title}</h1>{config.create&&<button className={styles.primary} disabled={busy} onClick={()=>edit()}>Add {table==="gallery_photos"?"photo":"record"}</button>}</div>
    {error&&<p role="alert" className={styles.error}>{error}</p>}{notice&&<p role="status">{notice}</p>}
    {editor&&<form key={String(editor.id??"new")} className={styles.editor} onSubmit={save}><h2>{editor.id?"Edit":"Create"} {config.title.toLowerCase()}</h2>
      {config.fields.map(f=><label key={f.key}>{f.label}
        {f.type==="media"?<EventMediaUpload value={String(editor[f.key]??"")} onBusy={setBusy} onChange={(url,type)=>setEditor(current=>current?{...current,[f.key]:url,media_type:type}:current)}/>:
        f.key==="category" && table==="events"?<select value={String(editor[f.key]??"")} required onChange={e=>change(f.key,e.target.value)}>{[...new Set([String(editor[f.key]||"Community"),...categories.map(c=>c.title),"Community","Convention","Meeting","Cultural","Fundraiser"])].map(name=><option key={name}>{name}</option>)}</select>:
        f.type==="textarea"?<textarea value={String(editor[f.key]??"")} readOnly={f.readOnly} required={f.required} onChange={e=>change(f.key,e.target.value)}/>:
        f.type==="datetime-local"?<input name={f.key} type="datetime-local" defaultValue={String(editor[f.key]??"")} required={f.required}/>:f.type==="checkbox"?<input type="checkbox" checked={Boolean(editor[f.key])} onChange={e=>change(f.key,e.target.checked)}/>:
        f.type==="select"?<select value={String(editor[f.key]??"")} required={f.required} onChange={e=>change(f.key,e.target.value)}><option value="">Select…</option>{f.key==="category_id"?categories.map(c=><option key={c.id} value={c.id}>{c.title}</option>):f.key==="album_id"?albums.map(a=><option key={a.id} value={a.id}>{a.title}</option>):f.options?.map(v=><option key={v}>{v}</option>)}</select>:
        f.type==="image"?<><input aria-label="Image URL" type="text" value={String(editor[f.key]??"")} onChange={e=>change(f.key,e.target.value)}/><input aria-label="Upload image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={e=>void upload(e.target.files?.[0])}/>{editor[f.key]&&<a href={String(editor[f.key])} target="_blank" rel="noreferrer">Preview uploaded image</a>}</>:
        <input type={f.type??"text"} value={String(editor[f.key]??"")} required={f.required} readOnly={f.readOnly} onChange={e=>change(f.key,e.target.value)}/>}
      </label>)}
      <div className={styles.toolbar}><button type="submit" className={styles.primary} disabled={busy || config.fields.every(f=>f.readOnly)}>{busy?"Working…":"Save changes"}</button><button type="button" className={styles.secondary} disabled={busy} onClick={()=>setEditor(null)}>Cancel</button></div>
    </form>}
    <div className={styles.toolbar}><input aria-label="Search records" placeholder="Search records…" value={search} onChange={e=>setSearch(e.target.value)}/><button className={styles.secondary} onClick={exportCsv} disabled={!rows.length}>Export CSV</button></div>
    {loading?<p role="status">Loading…</p>:!filtered.length?<p className={styles.empty}>No records found.</p>:<div className={styles.tableScroll}><table className={styles.table}><thead><tr>{columns.map(f=><th key={f.key}>{f.label}</th>)}<th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map(row=><tr key={String(row.id)}>{columns.map(f=><td key={f.key}>{String(f.key==="category_id" ? categories.find(c=>c.id===row.category_id)?.title??row[f.key] : row[f.key]??"—").slice(0,120)}</td>)}<td>{row.published!==undefined?(row.published?"Published":"Draft"):row.active!==undefined?(row.active?"Active":"Inactive"):String(row.status??"—")}</td><td><div className={styles.rowActions}><button disabled={busy} onClick={()=>edit(row)}>{config.fields.every(f=>f.readOnly)?"View":"Edit"}</button>{config.remove&&<button disabled={busy} onClick={()=>void remove(row)}>Delete</button>}{row.slug&&["events","gallery_albums"].includes(table)&&<Link href={(table==="events"?"/events/":"/gallery/")+row.slug}>View page</Link>}</div></td></tr>)}</tbody></table></div>}
  </div></section>;
}
