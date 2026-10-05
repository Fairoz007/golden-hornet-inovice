import assert from 'node:assert/strict'
import {ensureFinanceDemo} from '../lib/finance-demo'
import {financeStore} from '../lib/finance-store'
import {customerSummary,companySummary,customerLedger,toBaisa} from '../lib/finance-engine'
const storage=new Map<string,string>()
Object.assign(globalThis,{localStorage:{getItem:(key:string)=>storage.get(key)||null,setItem:(key:string,value:string)=>storage.set(key,value),removeItem:(key:string)=>storage.delete(key)},window:{addEventListener:()=>{},removeEventListener:()=>{}}})
ensureFinanceDemo()
const s=financeStore.getSnapshot()
const customer=s.customers.find(c=>c.companyName==='Demo — Muscat Future Projects LLC')!
assert.ok(customer)
assert.equal(s.invoices.filter(i=>i.customerId===customer.id).length,0)
assert.equal(customerSummary(s,customer.id).advanceBalance,10000)
assert.ok(s.payments.length>=40)
assert.equal(s.expenses.length,12)
assert.ok(s.payments.some(p=>p.reversedAt))
assert.ok(s.transactions.some(t=>t.reference==='DEMO-OPENING'))
const company=companySummary(s)
assert.equal(toBaisa(company.totalPaid),s.customers.reduce((n,c)=>n+toBaisa(customerSummary(s,c.id).totalPaid),0))
for(const c of s.customers){const rows=customerLedger(s,c.id);if(rows.length)assert.equal(rows[rows.length-1].runningBalance,customerSummary(s,c.id).currentAccountBalance)}
ensureFinanceDemo()
assert.equal(financeStore.getSnapshot().payments.length,s.payments.length)
// Simulate interrupted initialization: references prevent duplicate financial posts.
storage.delete('gh:finance-demo:v1')
ensureFinanceDemo()
assert.equal(financeStore.getSnapshot().payments.length,s.payments.length)
assert.equal(financeStore.getSnapshot().expenses.length,12)
console.log('Local dummy seed: invoice-free advance, financial reconciliation, reversal and repeat initialization pass')
