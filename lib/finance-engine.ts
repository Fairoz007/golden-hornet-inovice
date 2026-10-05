import type { Customer, InvoiceRecord } from './invoice-store'
export type PaymentTreatment = 'invoice' | 'partial' | 'advance' | 'unallocated' | 'account' | 'opening_balance' | 'other'
export interface Payment { id:string; customerId:string; date:string; amount:number; currency:string; method:string; treatment:PaymentTreatment; reference:string; bankReference?:string; chequeNumber?:string; description:string; notes?:string; attachment?:string; reversedAt?:string; reversalReason?:string; createdAt:number; legacy?:boolean }
export interface PaymentAllocation { id:string; paymentId:string; invoiceId?:string; transactionId?:string; amount:number; date:string; createdAt:number }
export type TransactionType = 'opening_balance' | 'credit_note' | 'debit_note' | 'adjustment' | 'refund' | 'reversal'
export interface FinancialTransaction { id:string; customerId:string; date:string; type:TransactionType; amount:number; description:string; reference:string; invoiceId?:string; vatAmount?:number; createdAt:number }
export interface Expense { id:string; date:string; amount:number; vatAmount:number; description:string; reference:string; category:string; createdAt:number }
export interface FinanceSnapshot { customers:Customer[]; invoices:InvoiceRecord[]; payments:Payment[]; allocations:PaymentAllocation[]; transactions:FinancialTransaction[]; expenses:Expense[] }
export const toBaisa = (n:number) => { if (!Number.isFinite(n) || !Number.isSafeInteger(Math.round(n*1000))) throw new Error('Invalid monetary amount'); return Math.round(n*1000) }
export const fromBaisa = (n:number) => n/1000
const today = () => new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Muscat'})
const posted = (i:InvoiceRecord,d:string) => i.status !== 'Draft' && i.status !== 'Cancelled' && i.invoiceDate <= d
const active = (p:Payment,d:string) => p.date <= d && (!p.reversedAt || p.reversedAt > d)
const sum = <T,>(rows:T[], get:(x:T)=>number) => rows.reduce((n,x)=>n+toBaisa(get(x)),0)
const indices = new WeakMap<FinanceSnapshot, Map<string, { paid: Map<string,number>; used: Map<string,number>; credits:Map<string,number>; debits:Map<string,number>; payments:Map<string,Payment>; invoices:Map<string,InvoiceRecord> }>>()
function index(s:FinanceSnapshot,date:string) {
 let dates=indices.get(s);if(!dates){dates=new Map();indices.set(s,dates)};const cached=dates.get(date);if(cached && Object.isFrozen(s))return cached
 const data={paid:new Map<string,number>(),used:new Map<string,number>(),credits:new Map<string,number>(),debits:new Map<string,number>(),payments:new Map(s.payments.map(p=>[p.id,p])),invoices:new Map(s.invoices.map(i=>[i.id,i]))}
 for(const a of s.allocations){const p=data.payments.get(a.paymentId);if(a.date>date||!p||!active(p,date))continue;data.used.set(p.id,(data.used.get(p.id)||0)+toBaisa(a.amount));const invoiceId=a.invoiceId||s.transactions.find(t=>t.id===a.transactionId)?.invoiceId;if(invoiceId)data.paid.set(invoiceId,(data.paid.get(invoiceId)||0)+toBaisa(a.amount))}
 for(const t of s.transactions){if(t.date>date||!t.invoiceId)continue;const map=t.type==='credit_note'||(t.type==='adjustment'&&t.amount<0)?data.credits:t.type==='debit_note'||(t.type==='adjustment'&&t.amount>0)?data.debits:null;if(map)map.set(t.invoiceId,(map.get(t.invoiceId)||0)+toBaisa(Math.abs(t.amount)))}
 dates.set(date,data);return data
}
export function invoiceBalance(s:FinanceSnapshot,id:string,asOf=today()):number {
 const data=index(s,asOf);const i=data.invoices.get(id); if(!i || !posted(i,asOf)) return 0
 return fromBaisa(Math.max(0,toBaisa(i.total)+(data.debits.get(id)||0)-(data.paid.get(id)||0)-(data.credits.get(id)||0)))
}
export function invoiceVatCollected(s:FinanceSnapshot,id:string,asOf=today()):number {
 const data=index(s,asOf);const invoice=data.invoices.get(id)
 if(!invoice||!posted(invoice,asOf))return 0
 // Allocate cash VAT proportionally over original taxable charges and posted debit notes.
 // Credits/legacy settlements do not invent collected cash or alter its original tax charge.
 const debits=s.transactions.filter(t=>t.invoiceId===id&&t.type==='debit_note'&&t.date<=asOf)
 const gross=toBaisa(invoice.total)+sum(debits,t=>t.amount)
 const vat=toBaisa(invoice.vatAmount)+sum(debits,t=>t.vatAmount||0)
 return fromBaisa(Math.round(vat*Math.min(1,(data.paid.get(id)||0)/Math.max(1,gross))))
}
export function paymentRemaining(s:FinanceSnapshot,p:Payment,asOf=today()):number { return active(p,asOf)?fromBaisa(toBaisa(p.amount)-(index(s,asOf).used.get(p.id)||0)):0 }
export interface LedgerEntry { id:string; date:string; reference:string; type:string; description:string; debit:number; credit:number; runningBalance:number; status:string }
export function customerLedger(s:FinanceSnapshot,id:string,asOf=today()):LedgerEntry[] {
 const rows:LedgerEntry[]=[]; const push=(r:Omit<LedgerEntry,'runningBalance'>)=>rows.push({...r,runningBalance:0})
 s.invoices.filter(i=>i.customerId===id&&posted(i,asOf)).forEach(i=>push({id:i.id,date:i.invoiceDate,reference:i.invoiceNumber,type:'Invoice',description:i.notes||'Invoice issued',debit:i.total,credit:0,status:'Posted'}))
 s.payments.filter(p=>p.customerId===id&&p.date<=asOf).forEach(p=>{push({id:p.id,date:p.date,reference:p.reference,type:p.treatment==='advance'?'Advance':'Payment',description:p.description,debit:0,credit:p.amount,status:p.reversedAt&&p.reversedAt<=asOf?'Reversed':'Posted'});if(p.reversedAt&&p.reversedAt<=asOf)push({id:p.id+'-reversal',date:p.reversedAt,reference:p.reference,type:'Reversal',description:p.reversalReason||'Payment reversed',debit:p.amount,credit:0,status:'Posted'})})
 s.transactions.filter(t=>t.customerId===id&&t.date<=asOf).forEach(t=>{const signed=(t.type==='credit_note'?-1:1)*toBaisa(t.amount);push({id:t.id,date:t.date,reference:t.reference,type:t.type.replaceAll('_',' '),description:t.description,debit:fromBaisa(Math.max(0,signed)),credit:fromBaisa(Math.max(0,-signed)),status:'Posted'})})
 s.allocations.filter(a=>a.date<=asOf&&index(s,asOf).payments.get(a.paymentId)?.customerId===id).forEach(a=>push({id:a.id,date:a.date,reference:a.invoiceId?s.invoices.find(i=>i.id===a.invoiceId)?.invoiceNumber||a.invoiceId:a.transactionId||'Account',type:'Payment Allocation',description:`Applied ${a.amount.toFixed(3)} OMR (transfer within customer account)`,debit:0,credit:0,status:'Posted'}))
 let balance=0;return rows.sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id)).map(r=>{balance+=toBaisa(r.debit)-toBaisa(r.credit);return {...r,runningBalance:fromBaisa(balance)}})
}
export function customerSummary(s:FinanceSnapshot,id:string,asOf=today()) {
 const invoices=s.invoices.filter(i=>i.customerId===id&&posted(i,asOf));const payments=s.payments.filter(p=>p.customerId===id&&active(p,asOf));const transactions=s.transactions.filter(t=>t.customerId===id&&t.date<=asOf)
 const totalRevenue=fromBaisa(sum(invoices,i=>i.taxableValue)-sum(transactions.filter(t=>t.type==='credit_note'),t=>t.amount-(t.vatAmount||0))+sum(transactions.filter(t=>t.type==='debit_note'),t=>t.amount-(t.vatAmount||0)))
 const totalInvoiced=fromBaisa(sum(invoices,i=>i.total)),totalPaid=fromBaisa(sum(payments,p=>p.amount)); const ledger=customerLedger(s,id,asOf); const currentAccountBalance=ledger.at(-1)?.runningBalance||0
 const totalOverdue=fromBaisa(sum(invoices.filter(i=>i.dueDate<asOf),i=>invoiceBalance(s,i.id,asOf)))
 const advanceBalance=fromBaisa(sum(payments.filter(p=>p.treatment==='advance'),p=>paymentRemaining(s,p,asOf)));const unallocatedPayment=fromBaisa(sum(payments.filter(p=>p.treatment!=='advance'),p=>paymentRemaining(s,p,asOf)))
 const totalOutstanding=fromBaisa(Math.max(0,toBaisa(currentAccountBalance)+toBaisa(advanceBalance)+toBaisa(unallocatedPayment)))
 const outputVat=fromBaisa(sum(invoices,i=>i.vatAmount)-sum(transactions.filter(t=>t.type==='credit_note'),t=>t.vatAmount||0)+sum(transactions.filter(t=>t.type==='debit_note'),t=>t.vatAmount||0));const vatCollected=fromBaisa(sum(invoices,i=>invoiceVatCollected(s,i.id,asOf)))
 return {totalRevenue,totalInvoiced,totalPaid,totalOutstanding,totalOverdue,advanceBalance,unallocatedPayment,creditBalance:Math.max(0,-currentAccountBalance),debitBalance:Math.max(0,currentAccountBalance),openingBalance:fromBaisa(sum(transactions.filter(t=>t.type==='opening_balance'),t=>t.amount)),currentAccountBalance,outputVat,vatCollected,lastInvoice:invoices.sort((a,b)=>b.invoiceDate.localeCompare(a.invoiceDate))[0],lastPayment:payments.sort((a,b)=>b.date.localeCompare(a.date))[0],averagePaymentTime:(()=>{const allocations=s.allocations.filter(a=>a.invoiceId&&a.date<=asOf&&index(s,asOf).payments.get(a.paymentId)?.customerId===id&&active(index(s,asOf).payments.get(a.paymentId)!,asOf));return allocations.length?Math.round(allocations.reduce((n,a)=>n+(new Date(a.date).getTime()-new Date(invoices.find(i=>i.id===a.invoiceId)?.invoiceDate||a.date).getTime())/86400000,0)/allocations.length):null})()}
}
/** Cash movement belongs to its event date, including reversals of earlier receipts. */
export function collectionsForPeriod(s:FinanceSnapshot,start:string,end:string):number {
 const receipts=sum(s.payments.filter(p=>p.date>=start&&p.date<=end),p=>p.amount)
 const reversals=sum(s.payments.filter(p=>p.reversedAt&&p.reversedAt>=start&&p.reversedAt<=end&&p.date<=end),p=>p.amount)
 return fromBaisa(receipts-reversals)
}
export function companySummary(s:FinanceSnapshot,asOf=today()) {
 const summaries=s.customers.map(c=>customerSummary(s,c.id,asOf));const total=(key:keyof typeof summaries[number])=>fromBaisa(summaries.reduce((n,x)=>n+toBaisa(Number(x[key])||0),0));const invoices=s.invoices.filter(i=>posted(i,asOf));const payments=s.payments.filter(p=>active(p,asOf));const expenses=s.expenses.filter(e=>e.date<=asOf);const totalExpenses=fromBaisa(sum(expenses,e=>e.amount));const totalRefunds=fromBaisa(sum(s.transactions.filter(t=>t.type==='refund'&&t.date<=asOf),t=>t.amount));const revenueFor=(prefix:string)=>fromBaisa(sum(invoices.filter(i=>i.invoiceDate.startsWith(prefix)),i=>i.taxableValue)-sum(s.transactions.filter(t=>t.date<=asOf&&t.date.startsWith(prefix)&&t.type==='credit_note'),t=>t.amount-(t.vatAmount||0))+sum(s.transactions.filter(t=>t.date<=asOf&&t.date.startsWith(prefix)&&t.type==='debit_note'),t=>t.amount-(t.vatAmount||0)))
 return {totalRevenue:total('totalRevenue'),revenueThisMonth:revenueFor(asOf.slice(0,7)),revenueThisYear:revenueFor(asOf.slice(0,4)),totalInvoiced:total('totalInvoiced'),totalPaymentsReceived:total('totalPaid'),totalPaid:total('totalPaid'),paymentsThisMonth:collectionsForPeriod(s,`${asOf.slice(0,7)}-01`,asOf),totalOutstanding:total('totalOutstanding'),totalOverdue:total('totalOverdue'),customerAdvances:total('advanceBalance'),advanceBalance:total('advanceBalance'),unallocatedPayments:total('unallocatedPayment'),unallocatedPayment:total('unallocatedPayment'),totalExpenses,totalRefunds,netPosition:fromBaisa(toBaisa(total('totalPaid'))-toBaisa(totalExpenses)-toBaisa(totalRefunds)),profit:null,outputVat:total('outputVat'),vatCollected:total('vatCollected'),vatPayable:fromBaisa(toBaisa(total('outputVat'))-sum(expenses,e=>e.vatAmount)),activeCustomers:s.customers.filter(c=>!c.accountStatus||c.accountStatus.toLowerCase()==="active").length,unpaidCustomers:summaries.filter(x=>x.totalOutstanding>0).length,overdueCustomers:summaries.filter(x=>x.totalOverdue>0).length}
}
