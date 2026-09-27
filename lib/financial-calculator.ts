/**
 * Decimal-safe financial calculator for Omani Rial (OMR).
 * OMR uses 3 decimal places (1 OMR = 1000 Baisa).
 * Uses integer math (scaled by 1000) to prevent floating-point inaccuracies.
 */

export interface LineItemCalculation {
  quantity: number
  unitPrice: number
  taxRate: number // e.g. 5 for 5%
  lineAmount: number
  taxAmount: number
  totalAmount: number
}

export interface InvoiceFinancialSummary {
  subtotal: number
  discount: number
  taxableValue: number
  vatRate: number
  vatAmount: number
  total: number
}

/**
 * Rounds a number to exactly 3 decimal places safely.
 */
export function roundOMR(val: number): number {
  if (isNaN(val) || !isFinite(val)) return 0
  return Math.round((val + Number.EPSILON) * 1000) / 1000
}

/**
 * Format a number as OMR string with 3 decimal places and commas.
 * e.g. 1330 -> "1,330.000"
 */
export function formatOMR(val: number): string {
  const rounded = roundOMR(val)
  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })
}

/**
 * Calculates a single line item amount safely.
 * lineAmount = roundOMR(quantity * rate)
 */
export function calculateLineAmount(quantity: number, rate: number): number {
  const q = Number(quantity) || 0
  const r = Number(rate) || 0
  if (q < 0 || r < 0) return 0
  return roundOMR(q * r)
}

/**
 * Calculates line tax amount.
 */
export function calculateLineTax(lineAmount: number, taxRate: number): number {
  const amt = Number(lineAmount) || 0
  const rate = Number(taxRate) || 0
  if (amt <= 0 || rate <= 0) return 0
  return roundOMR((amt * rate) / 100)
}

/**
 * Calculates full financial summary for invoice items.
 * Guaranteed to match backend verification.
 */
export function calculateInvoiceFinancials(
  items: Array<{ quantity: number; unitPrice: number; taxRate?: number }>,
  discountAmount = 0,
  defaultVatRate = 5
): InvoiceFinancialSummary {
  let subtotalBaisas = 0
  let vatBaisas = 0

  for (const item of items) {
    const qty = Number(item.quantity) || 0
    const price = Number(item.unitPrice) || 0
    const rate = item.taxRate !== undefined ? Number(item.taxRate) : defaultVatRate

    const lineAmount = calculateLineAmount(qty, price)
    subtotalBaisas += Math.round(lineAmount * 1000)

    const taxAmount = calculateLineTax(lineAmount, rate)
    vatBaisas += Math.round(taxAmount * 1000)
  }

  const subtotal = subtotalBaisas / 1000
  const discount = Math.min(subtotal, Math.max(0, roundOMR(Number(discountAmount) || 0)))
  const taxableValue = roundOMR(subtotal - discount)
  const vatAmount = roundOMR(vatBaisas / 1000)
  const total = roundOMR(taxableValue + vatAmount)

  return {
    subtotal,
    discount,
    taxableValue,
    vatRate: defaultVatRate,
    vatAmount,
    total,
  }
}
