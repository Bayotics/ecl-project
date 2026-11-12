import { notFound } from "next/navigation";
import { AdminTableManager } from "@/components/admin/AdminTableManager";
import { sections } from "@/lib/supabase/admin-fields";
export default async function AdminTablePage({ params }: { params: Promise<{table:string}> }) { const {table}=await params;if(!Object.hasOwn(sections,table))notFound();return <AdminTableManager key={table} table={table}/>; }
