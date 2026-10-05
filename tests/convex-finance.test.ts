import assert from 'node:assert/strict'
import {addPayment,allocatePayment,reversePayment,addTransaction} from '../convex/finance'
const records=new Map<string,any>();let seq=0
const db={get:async(id:string)=>records.get(id)||null,insert:async(table:string,value:any)=>{const id=`${table}-${++seq}`;records.set(id,{...value,_id:id,_table:table});return id},patch:async(id:string,value:any)=>records.set(id,{...records.get(id),...value}),query:(table:string)=>{let rows=[...records.values()].filter(x=>x._table===table);const q:any={withIndex:(_name:string,fn:any)=>{const filter:any={eq:(key:string,value:any)=>{rows=rows.filter(r=>r[key]===value);return filter}};fn(filter);return q},collect:async()=>rows,first:async()=>rows[0]||null,unique:async()=>{assert.ok(rows.length<=1);return rows[0]||null}};return q}}
const invoke=(fn:any,args:any)=>fn._handler({db},args)
async function main(){
 const customer=await db.insert('customers',{companyName:'A'})
 const receipt=await invoke(addPayment,{customerId:customer,date:'2026-10-01',amountBaisa:10000000,currency:'OMR',method:'Bank',treatment:'advance',reference:'ADV-1',description:'Advance'})
 assert.equal(records.get(receipt).amountBaisa,10000000);assert.equal([...records.values()].filter(r=>r._table==='invoices').length,0)
 const invoice=await db.insert('invoices',{customerId:customer,invoiceDate:'2026-10-02',currency:'OMR',status:'Finalized',total:6500})
 await invoke(allocatePayment,{paymentId:receipt,date:'2026-10-03',allocations:[{invoiceId:invoice,amountBaisa:6500000}]})
 const allocated=[...records.values()].filter(r=>r._table==='paymentAllocations').reduce((s,r)=>s+r.amountBaisa,0)
 assert.equal(records.get(receipt).amountBaisa-allocated,3500000)
 await assert.rejects(()=>invoke(allocatePayment,{paymentId:receipt,date:'2026-10-03',allocations:[{invoiceId:invoice,amountBaisa:1}]}),/outstanding/)
 const other=await db.insert('customers',{companyName:'Other'})
 const otherInvoice=await db.insert('invoices',{customerId:other,invoiceDate:'2026-10-01',currency:'OMR',status:'Finalized',total:100})
 await assert.rejects(()=>invoke(allocatePayment,{paymentId:receipt,date:'2026-10-03',allocations:[{invoiceId:otherInvoice,amountBaisa:1}]}),/mismatch/)
 await assert.rejects(()=>invoke(addPayment,{customerId:customer,date:'2026-10-01',amountBaisa:1.1,currency:'OMR',method:'Bank',treatment:'other',reference:'FLOAT',description:'Bad'}),/integer/)
 await invoke(addTransaction,{customerId:customer,currency:'OMR',date:'2026-10-03',type:'debit_note',reference:'DN',description:'Charge',debitBaisa:100000,creditBaisa:0,invoiceId:invoice})
 await invoke(allocatePayment,{paymentId:receipt,date:'2026-10-03',allocations:[{invoiceId:invoice,amountBaisa:100000}]})
 await invoke(reversePayment,{paymentId:receipt,reason:'Bank reversed'})
 assert.ok(records.get(receipt).reversedAt);assert.equal([...records.values()].filter(r=>r._table==='paymentAllocations').length,2)
 await assert.rejects(()=>invoke(allocatePayment,{paymentId:receipt,date:'2026-10-03',allocations:[{invoiceId:invoice,amountBaisa:1}]}),/reversed/)
 console.log('Convex handlers: independent advance, future invoice allocation, caps, customer isolation, integer amounts, debit notes and audited reversal pass')
}
main().catch(e=>{console.error(e);process.exitCode=1})
