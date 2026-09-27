/**
 * Helper to convert numeric OMR amounts into English words
 * Format: TOTAL RIYAL OMANI One Thousand Three Hundred Ninety Six and Baisas Five Hundred Only.
 */

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
]

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
]

function convertHundreds(num: number): string {
  const parts: string[] = []
  if (num >= 100) {
    parts.push(ONES[Math.floor(num / 100)] + " Hundred")
    num %= 100
  }
  if (num >= 20) {
    parts.push(TENS[Math.floor(num / 10)])
    num %= 10
  }
  if (num > 0) {
    parts.push(ONES[num])
  }
  return parts.join(" ")
}

export function numberToWords(n: number): string {
  if (n === 0) return "Zero"
  if (n < 0) return "Minus " + numberToWords(Math.abs(n))

  const parts: string[] = []
  const billions = Math.floor(n / 1_000_000_000)
  n %= 1_000_000_000
  const millions = Math.floor(n / 1_000_000)
  n %= 1_000_000
  const thousands = Math.floor(n / 1_000)
  n %= 1_000
  const hundreds = Math.floor(n)

  if (billions > 0) parts.push(convertHundreds(billions) + " Billion")
  if (millions > 0) parts.push(convertHundreds(millions) + " Million")
  if (thousands > 0) parts.push(convertHundreds(thousands) + " Thousand")
  if (hundreds > 0) parts.push(convertHundreds(hundreds))

  return parts.join(" ")
}

export function amountToWordsOMR(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return "TOTAL RIYAL OMANI Zero Only."
  }

  const rials = Math.floor(amount)
  const baisas = Math.round((amount - rials) * 1000)

  let text = "TOTAL RIYAL OMANI " + numberToWords(rials)

  if (baisas > 0) {
    text += " and Baisas " + numberToWords(baisas)
  }

  text += " Only."
  return text
}
