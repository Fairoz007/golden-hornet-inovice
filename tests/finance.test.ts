import assert from 'node:assert/strict'
import {customerSummary,companySummary,customerLedger,invoiceBalance,toBaisa,collectionsForPeriod,type FinanceSnapshot} from '../lib/finance-engine'
import {calculateInvoiceFinancials} from '../lib/financial-calculator'
const date='2026-10-05'
const s:FinanceSnapshot={customers:[{id:'a',companyName:'A',address:'Oman',createdAt:0,updatedAt:0}],invoices:[],payments:[],allocations:[],transactions:[],expenses:[]}
const invoice=(id:string,total:number)=>s.invoices.push({id,customerId:'a',invoiceDate:'2026-10-01',dueDate:'2026-10-02',invoiceNumber:id,status:'Finalized',total,taxableValue:total/1.05,vatAmount:total-total/1.05} as any)
const pay=(id:string,amount:number,treatment:'advance'|'invoice'='invoice')=>s.payments.push({id,customerId:'a',date:'2026-10-02',amount,currency:'OMR',method:'Bank',treatment,reference:id,description:id,createdAt:0})
const allocate=(id:string,invoiceId:string,amount:number)=>s.allocations.push({id,paymentId:id.split(':')[0],invoiceId,amount,date:'2026-10-03',createdAt:0})
function reconcile(){const c=customerSummary(s,'a',date),company=companySummary(s,date);assert.equal(c.totalOutstanding,company.totalOutstanding);assert.equal(c.totalPaid,company.totalPaid);assert.equal(c.advanceBalance,company.advanceBalance);assert.equal(c.currentAccountBalance,customerLedger(s,'a',date).at(-1)?.runningBalance||0);assert.equal(toBaisa(c.totalOutstanding)-toBaisa(c.advanceBalance)-toBaisa(c.unallocatedPayment),toBaisa(c.currentAccountBalance))}
pay('advance',10000,'advance');assert.equal(customerSummary(s,'a',date).advanceBalance,10000);reconcile();console.log('A: no invoice advance')
invoice('i1',2000);pay('partial',500);allocate('partial:1','i1',500);assert.equal(invoiceBalance(s,'i1',date),1500);reconcile();console.log('B: partial payment')
invoice('i2',1500);invoice('i3',3000);pay('multi',3500);allocate('multi:1','i1',1500);allocate('multi:2','i2',1500);allocate('multi:3','i3',500);assert.equal(invoiceBalance(s,'i3',date),2500);reconcile();console.log('C: multi invoice allocation')
invoice('future',6500);allocate('advance:1','future',6500);assert.equal(customerSummary(s,'a',date).advanceBalance,3500);assert.equal(invoiceBalance(s,'future',date),0);reconcile();console.log('D: apply existing advance')
pay('full',2500);allocate('full:1','i3',2500);assert.equal(customerSummary(s,'a',date).totalOutstanding,0);reconcile();console.log('E: fully paid invoices')
invoice('credit',1000);s.transactions.push({id:'cn',customerId:'a',date:'2026-10-03',type:'credit_note',amount:250,reference:'CN',description:'Credit',invoiceId:'credit',createdAt:0});assert.equal(invoiceBalance(s,'credit',date),750);reconcile();console.log('F: credit note')
s.payments.find(p=>p.id==='full')!.reversedAt='2026-10-04';assert.equal(invoiceBalance(s,'i3',date),2500);assert.ok(customerLedger(s,'a',date).some(t=>t.type==='Reversal'));assert.equal(invoiceBalance(s,'i3','2026-10-03'),0);reconcile();console.log('G: dated reversal preserves history')
reconcile();console.log('H: mixed ledger/company/report reconciliation')
assert.equal(calculateInvoiceFinancials([{quantity:1,unitPrice:100,taxRate:5}],10).total,94.5)
assert.equal(calculateInvoiceFinancials([{quantity:1,unitPrice:100,taxRate:0}],0,0).total,100)
console.log('Discount VAT and zero VAT pass')
s.transactions.push({id:'general-credit',customerId:'a',date:'2026-10-05',type:'credit_note',amount:100,reference:'GC',description:'Account credit',createdAt:0});assert.equal(customerSummary(s,'a',date).totalOutstanding,3150);reconcile()
s.transactions.push({id:'linked-debit',customerId:'a',date:'2026-10-05',type:'debit_note',amount:50,invoiceId:'credit',reference:'DN',description:'Account debit',createdAt:0});assert.equal(invoiceBalance(s,'credit',date),800);assert.equal(customerSummary(s,'a',date).totalOutstanding,3200);reconcile()
assert.equal(customerSummary(s,'a','2026-10-03').totalOutstanding,750)
assert.equal(customerSummary(s,'a',date).vatCollected,customerSummary({...s,transactions:s.transactions.filter(t=>t.type!=='credit_note')},'a',date).vatCollected)
console.log('General credit, linked debit, as-of and cash-only VAT pass')
const overpaid:FinanceSnapshot={customers:s.customers,invoices:[{id:'settled',customerId:'a',invoiceDate:'2026-10-01',dueDate:'2026-10-02',invoiceNumber:'SET',status:'Finalized',total:105,taxableValue:100,vatAmount:5} as any],payments:[{id:'paid',customerId:'a',date:'2026-10-02',amount:105,currency:'OMR',method:'Bank',treatment:'invoice',reference:'P',description:'Full payment',createdAt:0}],allocations:[{id:'alloc',paymentId:'paid',invoiceId:'settled',amount:105,date:'2026-10-02',createdAt:0}],transactions:[{id:'credit-after-payment',customerId:'a',invoiceId:'settled',date:'2026-10-03',type:'credit_note',amount:21,vatAmount:1,reference:'CN',description:'Credit after cash settlement',createdAt:0}],expenses:[]}
assert.equal(customerSummary(overpaid,'a',date).currentAccountBalance,-21)
assert.equal(customerSummary(overpaid,'a',date).creditBalance,21)
assert.equal(customerSummary(overpaid,'a',date).totalOutstanding,0)
assert.equal(invoiceBalance(overpaid,'settled',date),0)
assert.equal(companySummary(overpaid,date).totalRevenue,80)
assert.equal(companySummary(overpaid,date).totalPaymentsReceived,105)
assert.equal(companySummary(overpaid,date).outputVat,4)
overpaid.transactions.push({id:'charge',customerId:'a',invoiceId:'settled',date:'2026-10-04',type:'debit_note',amount:10.5,vatAmount:.5,reference:'DN',description:'Additional taxable charge',createdAt:0})
assert.equal(companySummary(overpaid,date).totalRevenue,90)
assert.equal(companySummary(overpaid,date).outputVat,4.5)
assert.equal(customerSummary(overpaid,'a',date).creditBalance,10.5)
console.log('Post-settlement credit preserves cash, customer credit and net revenue; taxable debit reconciles')

const cash:FinanceSnapshot={customers:[s.customers[0]],invoices:[],payments:[{id:'september-receipt',customerId:'a',date:'2026-09-20',amount:100,currency:'OMR',method:'Bank',treatment:'advance',reference:'SEP',description:'September receipt reversed in October',createdAt:0,reversedAt:'2026-10-03'}],allocations:[],transactions:[],expenses:[]}
assert.equal(companySummary(cash,'2026-09-30').paymentsThisMonth,100)
assert.equal(companySummary(cash,'2026-10-05').paymentsThisMonth,-100)
assert.equal(companySummary(cash,'2026-10-05').totalPaid,0)
assert.equal(collectionsForPeriod(cash,'2026-01-01','2026-10-05'),0)
assert.equal(customerLedger(cash,'a','2026-09-30').at(-1)?.runningBalance,-100)
assert.equal(customerLedger(cash,'a','2026-10-05').at(-1)?.runningBalance,0)
cash.payments.push({id:'october-receipt',customerId:'a',date:'2026-10-04',amount:50,currency:'OMR',method:'Bank',treatment:'advance',reference:'OCT',description:'October receipt',createdAt:0})
cash.transactions.push({id:'refund',customerId:'a',date:'2026-10-05',type:'refund',amount:20,description:'Cash refund',reference:'REF',createdAt:0})
cash.expenses.push({id:'cost',date:'2026-10-05',amount:5,vatAmount:0,description:'Expense',reference:'EXP',category:'General',createdAt:0})
assert.equal(companySummary(cash,'2026-10-05').paymentsThisMonth,-50)
assert.equal(companySummary(cash,'2026-10-05').netPosition,25)
assert.equal(companySummary(cash,'2026-10-05').totalRefunds,20)
assert.equal(toBaisa(companySummary(cash,'2026-09-30').paymentsThisMonth)+toBaisa(companySummary(cash,'2026-10-05').paymentsThisMonth),toBaisa(companySummary(cash,'2026-10-05').totalPaid))
assert.equal(companySummary(cash,'2026-10-04').netPosition,50)
console.log('Dated monthly cash reversals, ledger and net cash after refunds reconcile')

const statuses={...cash,customers:[{...cash.customers[0],accountStatus:'Inactive'}]}
assert.equal(companySummary(statuses,'2026-10-05').activeCustomers,0)
assert.equal(companySummary(statuses,'2026-10-05').totalPaid,50)
console.log('Inactive customer excludes active count while retaining financial history')
const linkedTarget:FinanceSnapshot={...overpaid,transactions:[{id:'linked-charge',customerId:'a',invoiceId:'settled',date:'2026-10-03',type:'debit_note',amount:10.5,vatAmount:.5,reference:'DN',description:'Extra charge',createdAt:0}],payments:[...overpaid.payments,{id:'charge-payment',customerId:'a',date:'2026-10-04',amount:10.5,currency:'OMR',method:'Cash',treatment:'account',reference:'DN-PAY',description:'Historical direct debit allocation',createdAt:0}],allocations:[...overpaid.allocations,{id:'charge-allocation',paymentId:'charge-payment',transactionId:'linked-charge',amount:10.5,date:'2026-10-04',createdAt:0}]}
assert.equal(invoiceBalance(linkedTarget,'settled',date),0)
assert.equal(customerSummary(linkedTarget,'a',date).totalOutstanding,0)
console.log('Historical invoice-linked debit target allocation settles invoice and account together')
assert.equal(customerSummary(linkedTarget,'a',date).vatCollected,5.5)
assert.equal(companySummary(linkedTarget,date).vatCollected,5.5)
const noCashLegacy:FinanceSnapshot={...linkedTarget,payments:[],allocations:[],transactions:[{id:'legacy',customerId:'a',invoiceId:'settled',date:'2026-10-01',type:'adjustment',amount:-105,reference:'LEGACY',description:'Settlement evidence without cash date',createdAt:0}]}
assert.equal(customerSummary(noCashLegacy,'a',date).vatCollected,0)
console.log('Taxable debit VAT collection and legacy noncash settlement VAT reconcile')
