import { mutation, query } from './_generated/server'
import { normalizedReference, normalizedPaymentMethod } from '../lib/finance-validation'
import { v } from 'convex/values'

function amount(value: number, positive = true) {
  if (!Number.isSafeInteger(value) || (positive ? value <= 0 : value < 0)) throw new Error('Amount must be integer baisa and within the permitted range')
  return value
}
function date(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(value).toISOString().slice(0,10) !== value) throw new Error('Invalid financial date')
}
async function account(ctx: any, customerId: any, currency: string) {
  if (!(await ctx.db.get(customerId))) throw new Error('Customer not found')
  if (currency !== 'OMR') throw new Error('Only OMR is supported; currency conversion requires an explicit exchange-rate policy')
  const existing = await ctx.db.query('customerAccounts').withIndex('by_customer_currency', (q: any) => q.eq('customerId', customerId).eq('currency', currency)).unique()
  return existing?._id ?? await ctx.db.insert('customerAccounts', {customerId, currency, createdAt: Date.now()})
}
async function audit(ctx: any, id: string, action: string, description: string) {
  await ctx.db.insert('auditLogs', { timestamp: Date.now(), action, entityType: 'finance', entityId: id, description })
}
async function allocate(ctx: any, paymentId: any, allocations: any[], allocationDate: string) {
  date(allocationDate)
  const payment = await ctx.db.get(paymentId)
  if (!payment || payment.reversedAt) throw new Error('Payment unavailable or reversed')
  if (allocationDate > new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Muscat'})) throw new Error('Allocation cannot be future dated')
  if (allocationDate < payment.date) throw new Error('Allocation cannot predate receipt')
  const previous = await ctx.db.query('paymentAllocations').withIndex('by_payment', (q: any) => q.eq('paymentId',paymentId)).collect()
  let remaining = payment.amountBaisa - previous.reduce((sum: number,a: any) => sum+a.amountBaisa,0)
  for (const entry of allocations) {
    amount(entry.amountBaisa)
    if (entry.amountBaisa > remaining) throw new Error('Allocations exceed receipt balance')
    if (!!entry.invoiceId === !!entry.transactionId) throw new Error('Choose exactly one invoice or opening/debit transaction')
    if (entry.invoiceId) {
      const invoice = await ctx.db.get(entry.invoiceId)
      if (!invoice || !['Finalized','Partially Paid','Paid'].includes(invoice.status) || invoice.customerId !== String(payment.customerId) || invoice.currency !== payment.currency) throw new Error('Invoice/customer/currency mismatch or invoice not posted')
      if (allocationDate < invoice.invoiceDate) throw new Error('Allocation cannot predate invoice')
      const allRows = await ctx.db.query('paymentAllocations').collect()
      const rows=[];for(const row of allRows){const linked=row.transactionId?await ctx.db.get(row.transactionId):null;if(row.invoiceId===entry.invoiceId||linked?.invoiceId===entry.invoiceId)rows.push(row)}
      let used=0
      for (const row of rows) { const receipt=await ctx.db.get(row.paymentId); if (receipt && !receipt.reversedAt) used+=row.amountBaisa }
      const transactions = await ctx.db.query('financialTransactions').withIndex('by_customer',(q:any)=>q.eq('customerId',payment.customerId)).collect()
      const credit=transactions.filter((t:any)=>t.invoiceId===entry.invoiceId).reduce((s:number,t:any)=>s+t.creditBaisa-t.debitBaisa,0)
      if (entry.amountBaisa > Math.round(invoice.total*1000)-used-credit) throw new Error('Allocation exceeds invoice outstanding')
    } else {
      const target=await ctx.db.get(entry.transactionId)
      if (!target || target.customerId!==payment.customerId || target.currency!==payment.currency || !['opening_balance','debit_note','adjustment','refund'].includes(target.type) || target.debitBaisa<=0 || allocationDate<target.date) throw new Error('Invalid account allocation target')
      if(target.invoiceId)throw new Error('Allocate invoice-linked debits through their invoice')
      const rows=await ctx.db.query('paymentAllocations').collect()
      let used=0
      for(const row of rows.filter((r:any)=>r.transactionId===entry.transactionId)){const receipt=await ctx.db.get(row.paymentId);if(receipt&&!receipt.reversedAt)used+=row.amountBaisa}
      const reversals=await ctx.db.query('financialTransactions').collect()
      if(reversals.some((t:any)=>t.reversesId===entry.transactionId)||entry.amountBaisa>target.debitBaisa-target.creditBaisa-used)throw new Error('Allocation exceeds account debit balance')
    }
    await ctx.db.insert('paymentAllocations',{...entry,paymentId,customerId:payment.customerId,date:allocationDate,createdAt:Date.now()})
    remaining -= entry.amountBaisa
  }
  await audit(ctx,paymentId,'PAYMENT_ALLOCATED','Receipt allocated without creating an additional cash or revenue entry')
}
const allocation = v.object({invoiceId:v.optional(v.id('invoices')),transactionId:v.optional(v.id('financialTransactions')),amountBaisa:v.number()})
export const addPayment=mutation({args:{customerId:v.id('customers'),date:v.string(),amountBaisa:v.number(),currency:v.string(),method:v.string(),treatment:v.string(),reference:v.string(),bankReference:v.optional(v.string()),chequeNumber:v.optional(v.string()),description:v.string(),notes:v.optional(v.string()),attachmentId:v.optional(v.id('_storage')),allocations:v.optional(v.array(allocation))},handler:async(ctx,args)=>{
  amount(args.amountBaisa);date(args.date)
  if(args.date>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Muscat'}))throw new Error('Receipt cannot be future dated')
  if(!['invoice','partial','advance','unallocated','account','opening_balance','other'].includes(args.treatment))throw new Error('Invalid treatment')
  if(!args.reference.trim()||!args.method.trim())throw new Error('Reference and payment method required')
  const existingPayments=await ctx.db.query('payments').withIndex('by_customer',q=>q.eq('customerId',args.customerId)).collect();if(existingPayments.some(p=>normalizedReference(p.reference)===normalizedReference(args.reference)))throw new Error('Duplicate payment reference')
  const method=normalizedPaymentMethod(args.method);if(method==='Cheque'&&!args.chequeNumber?.trim())throw new Error('Cheque number required')
  if(['invoice','partial'].includes(args.treatment)&&!args.allocations?.some(a=>a.invoiceId&&a.amountBaisa>0))throw new Error('Invoice or partial treatment requires an invoice allocation')
  if(args.treatment==='opening_balance'){let found=false;for(const a of args.allocations||[]){if(a.transactionId&&a.amountBaisa>0){const t=await ctx.db.get(a.transactionId);if(t?.type==='opening_balance')found=true}}if(!found)throw new Error('Opening balance treatment requires an opening balance allocation')}
  const accountId=await account(ctx,args.customerId,args.currency)
  const {allocations,...data}=args
  const id=await ctx.db.insert('payments',{...data,reference:normalizedReference(data.reference),method,accountId,createdAt:Date.now()})
  if(allocations?.length)await allocate(ctx,id,allocations,args.date)
  await audit(ctx,id,'PAYMENT_RECEIVED',`Received ${args.amountBaisa/1000} OMR for customer ${args.customerId}`)
  return id
}})
export const allocatePayment=mutation({args:{paymentId:v.id('payments'),date:v.string(),allocations:v.array(allocation)},handler:async(ctx,args)=>{await allocate(ctx,args.paymentId,args.allocations,args.date);return args.paymentId}})
export const reversePayment=mutation({args:{paymentId:v.id('payments'),reason:v.string()},handler:async(ctx,args)=>{const p=await ctx.db.get(args.paymentId);if(!p||p.reversedAt)throw new Error('Payment unavailable or already reversed');if(!args.reason.trim())throw new Error('Reversal reason required');await ctx.db.patch(args.paymentId,{reversedAt:Date.now(),reversalReason:args.reason});await audit(ctx,args.paymentId,'PAYMENT_REVERSED',args.reason);return args.paymentId}})
export const addTransaction=mutation({args:{customerId:v.id('customers'),currency:v.string(),date:v.string(),type:v.string(),reference:v.string(),description:v.string(),debitBaisa:v.number(),creditBaisa:v.number(),vatBaisa:v.optional(v.number()),invoiceId:v.optional(v.id('invoices'))},handler:async(ctx,args)=>{
  date(args.date);amount(args.debitBaisa,false);amount(args.creditBaisa,false)
  if(!['opening_balance','credit_note','debit_note','adjustment','refund'].includes(args.type)|| (!!args.debitBaisa===!!args.creditBaisa))throw new Error('Choose a supported transaction with exactly one positive debit or credit')
  if(args.type==='credit_note'&&!args.creditBaisa||['debit_note','refund'].includes(args.type)&&!args.debitBaisa)throw new Error('Invalid transaction direction')
  if(args.vatBaisa!==undefined){amount(args.vatBaisa,false);if(args.vatBaisa>Math.max(args.debitBaisa,args.creditBaisa))throw new Error('VAT exceeds note amount')}
  if(args.invoiceId){
    const i=await ctx.db.get(args.invoiceId)
    if(!i||i.customerId!==String(args.customerId)||i.currency!==args.currency||!['Paid','Partially Paid','Finalized'].includes(i.status)||args.date<i.invoiceDate)throw new Error('Invalid linked invoice')
    if(!['credit_note','debit_note','adjustment'].includes(args.type))throw new Error('Only notes and adjustments may link directly to an invoice')
    const entries=await ctx.db.query('financialTransactions').withIndex('by_customer',q=>q.eq('customerId',args.customerId)).collect()
    const credited=entries.filter(t=>t.invoiceId===args.invoiceId).reduce((sum,t)=>sum+t.creditBaisa-t.debitBaisa,0)
    if(args.type==='credit_note'&&args.creditBaisa>Math.round(i.total*1000)-credited)throw new Error('Credit notes exceed invoice value')
  }
  if(!args.reference.trim())throw new Error('Reference required');const previous=await ctx.db.query('financialTransactions').withIndex('by_customer',q=>q.eq('customerId',args.customerId)).collect();if(previous.some(t=>t.type===args.type&&normalizedReference(t.reference)===normalizedReference(args.reference)))throw new Error('Duplicate customer transaction reference')
  const accountId=await account(ctx,args.customerId,args.currency)
  const id=await ctx.db.insert('financialTransactions',{...args,reference:normalizedReference(args.reference),accountId,createdAt:Date.now()});await audit(ctx,id,'TRANSACTION_POSTED',args.description);return id
}})
export const reverseTransaction=mutation({args:{id:v.id('financialTransactions'),date:v.string(),reason:v.string()},handler:async(ctx,args)=>{date(args.date);const t=await ctx.db.get(args.id);if(!t||t.reversesId||args.date<t.date||!args.reason.trim())throw new Error('Invalid reversal');const allocations=await ctx.db.query('paymentAllocations').collect();for(const a of allocations.filter(a=>a.transactionId===args.id)){const receipt=await ctx.db.get(a.paymentId);if(receipt&&!receipt.reversedAt)throw new Error('Reverse allocated receipts before reversing this debit')}const all=await ctx.db.query('financialTransactions').collect();if(all.some(r=>r.reversesId===args.id))throw new Error('Already reversed');const id=await ctx.db.insert('financialTransactions',{accountId:t.accountId,customerId:t.customerId,currency:t.currency,date:args.date,type:'reversal',reference:`REV-${t.reference}`,description:args.reason,debitBaisa:t.creditBaisa,creditBaisa:t.debitBaisa,vatBaisa:t.vatBaisa,invoiceId:t.invoiceId,reversesId:args.id,createdAt:Date.now()});await audit(ctx,id,'TRANSACTION_REVERSED',args.reason);return id}})
export const addExpense=mutation({args:{date:v.string(),reference:v.string(),description:v.string(),currency:v.string(),amountBaisa:v.number(),inputVatBaisa:v.number()},handler:async(ctx,args)=>{date(args.date);amount(args.amountBaisa);amount(args.inputVatBaisa,false);if(args.currency!=='OMR'||args.inputVatBaisa>args.amountBaisa)throw new Error('Invalid expense');const id=await ctx.db.insert('expenses',{...args,createdAt:Date.now()});await audit(ctx,id,'EXPENSE_POSTED',args.description);return id}})
export const snapshot=query({args:{},handler:async(ctx)=>{const [customers,invoices,accounts,payments,allocations,transactions,expenses]=await Promise.all([ctx.db.query('customers').collect(),ctx.db.query('invoices').collect(),ctx.db.query('customerAccounts').collect(),ctx.db.query('payments').collect(),ctx.db.query('paymentAllocations').collect(),ctx.db.query('financialTransactions').collect(),ctx.db.query('expenses').collect()]);return{customers,invoices,accounts,payments,allocations,transactions,expenses}}})
