export function normalizedReference(value:string):string { return value.trim().toUpperCase() }
export function normalizedPaymentMethod(value:string):string {
 const methods:Record<string,string>={bank:'Bank transfer','bank transfer':'Bank transfer',cash:'Cash',cheque:'Cheque',card:'Card',other:'Other'}
 const method=methods[value.trim().toLowerCase()]
 if(!method)throw new Error('Valid payment method required')
 return method
}
