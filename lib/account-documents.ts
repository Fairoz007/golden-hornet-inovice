"use client"

import { invoiceStore } from "./invoice-store"

export type CustomerRecordKind = "Contacts" | "Projects" | "Documents" | "Notes" | "Quotations" | "Proforma Invoices" | "Delivery Orders" | "Purchase Orders / Client POs"
export interface CustomerRecord { id: string; customerId: string; kind: CustomerRecordKind; title: string; reference: string; description: string; date: string; url?: string; email?: string; phone?: string; status: string; parentRecordId?: string; payload?: object; createdAt: number }
export interface CustomerProfile { customerCode?: string; crNumber?: string; customerType?: string; contactPerson?: string; paymentTerms?: string; creditLimit?: number; accountStatus?: string }
export interface AccountActivity { id: string; customerId: string; timestamp: number; description: string; action: string }
const KEY = "gh_customer_workspace_v1"
type Data = { records: CustomerRecord[]; profiles: Record<string, CustomerProfile>; activities: AccountActivity[]; invoiceProjects: Record<string,string>; invoiceSourceDocuments: Record<string,string> }
function read(): Data {
 const empty:Data={records:[],profiles:{},activities:[],invoiceProjects:{},invoiceSourceDocuments:{}}
 if(typeof window==="undefined")return empty
 const raw=localStorage.getItem(KEY);if(!raw)return empty
 const data=JSON.parse(raw);return {...empty,...data,invoiceProjects:data.invoiceProjects||{},invoiceSourceDocuments:data.invoiceSourceDocuments||{}}
}

const listeners = new Set<() => void>()
function write(data: Data) { localStorage.setItem(KEY, JSON.stringify(data)); listeners.forEach(fn => fn()) }
export const accountDocuments = {
  getInvoiceSource: (invoiceId:string) => {const state=read();return state.records.find(r=>r.id===state.invoiceSourceDocuments[invoiceId])},
  getDocumentChain: (recordId:string) => {const state=read();const result:CustomerRecord[]=[];const visited=new Set<string>();let record=state.records.find(r=>r.id===recordId);while(record&&!visited.has(record.id)){visited.add(record.id);result.unshift(record);record=state.records.find(r=>r.id===record?.parentRecordId)}return result},
  assignInvoiceSource(customerId:string,invoiceId:string,recordId:string) {const state=read();const invoice=invoiceStore.getInvoiceById(invoiceId);if(!invoice||invoice.customerId!==customerId)throw new Error("Invoice does not belong to this customer.");const source=state.records.find(r=>r.id===recordId&&r.customerId===customerId&&["Quotations","Proforma Invoices","Purchase Orders / Client POs"].includes(r.kind));if(recordId&&!source)throw new Error("Select a quotation, proforma or client PO belonging to this customer.");if(recordId)state.invoiceSourceDocuments[invoiceId]=recordId;else delete state.invoiceSourceDocuments[invoiceId];state.activities.push({id:crypto.randomUUID(),customerId,timestamp:Date.now(),description:`Invoice ${invoice.invoiceNumber} source document: ${source?.reference||source?.title||"Unassigned"}.`,action:"INVOICE_SOURCE_ASSIGNED"});write(state)},
  getAllRecords: () => read().records,
  getProjectAssignments: () => ({...read().invoiceProjects}),
  getInvoiceProject: (invoiceId: string) => {const state=read();return state.records.find(r=>r.id===state.invoiceProjects[invoiceId]&&r.kind==="Projects")},
  assignInvoiceProject(customerId:string, invoiceId:string, projectId:string) {const state=read();const invoice=invoiceStore.getInvoiceById(invoiceId);if(!invoice||invoice.customerId!==customerId)throw new Error("Invoice does not belong to this customer.");const project=state.records.find(r=>r.id===projectId&&r.customerId===customerId&&r.kind==="Projects");if(projectId&&!project)throw new Error("Select a project belonging to this customer.");if(projectId)state.invoiceProjects[invoiceId]=projectId;else delete state.invoiceProjects[invoiceId];state.activities.push({id:crypto.randomUUID(),customerId,timestamp:Date.now(),description:`Invoice ${invoice.invoiceNumber} project assignment: ${project?.title||"Unassigned"}.`,action:"INVOICE_PROJECT_ASSIGNED"});write(state)},
  getRecords: (id: string) => read().records.filter(r => r.customerId === id),
  getProfile: (id: string) => read().profiles[id] || {},
  getActivity: (id: string) => read().activities.filter(r => r.customerId === id),
  subscribe(fn: () => void) { listeners.add(fn); const handler = (event: StorageEvent) => { if(event.key === KEY) fn() }; window.addEventListener("storage", handler); return () => {listeners.delete(fn);window.removeEventListener("storage",handler)} },
  addRecord(data: Omit<CustomerRecord,"id"|"createdAt">) { const state = read();if(data.parentRecordId&&!state.records.some(r=>r.id===data.parentRecordId&&r.customerId===data.customerId&&["Quotations","Proforma Invoices","Purchase Orders / Client POs"].includes(r.kind)))throw new Error("Parent document must be a quotation, proforma or client PO for this customer."); const now=Date.now(); const record={...data,id:crypto.randomUUID(),createdAt:now}; state.records.push(record); state.activities.push({id:crypto.randomUUID(),customerId:data.customerId,timestamp:now,description:`${data.kind}: ${data.title} added (${data.reference}).`,action:"RECORD_CREATED"});write(state);return record },
  saveProfile(id: string, profile: CustomerProfile) { const state=read();state.profiles[id]=profile;state.activities.push({id:crypto.randomUUID(),customerId:id,timestamp:Date.now(),description:"Customer account details updated.",action:"PROFILE_UPDATED"});write(state) }
}
