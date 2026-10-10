import { numberToIndianWords } from "./numberToWords.js";

export function calculateInvoiceTotals(invoice) {
  const items = invoice.items || [];

  // Calculate items with row amount
  let subtotal = 0;
  let totalQty = 0;
  let hasSameUnit = true;
  const firstUnit = items.length > 0 ? (items[0].unit || "").trim().toUpperCase() : "";

  const calculatedItems = items.map((item, index) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const amount = Math.round(qty * rate * 100) / 100;

    subtotal += amount;
    totalQty += qty;

    const unit = (item.unit || "").trim().toUpperCase();
    if (unit !== firstUnit) {
      hasSameUnit = false;
    }

    return {
      ...item,
      slNo: index + 1,
      quantity: qty,
      rate,
      amount
    };
  });

  // Discount
  const discountVal = parseFloat(invoice.discount) || 0;
  const discountAmount =
    invoice.discountType === "percent"
      ? Math.round((subtotal * discountVal) / 100 * 100) / 100
      : Math.min(subtotal, Math.max(0, discountVal));

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  // Tax
  const taxRate = parseFloat(invoice.taxRate) || 0;
  let taxAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (taxRate > 0 && invoice.taxType && invoice.taxType !== "none") {
    if (invoice.taxType === "cgst_sgst") {
      const halfRate = taxRate / 2;
      cgstAmount = Math.round((taxableAmount * halfRate) / 100 * 100) / 100;
      sgstAmount = Math.round((taxableAmount * halfRate) / 100 * 100) / 100;
      taxAmount = cgstAmount + sgstAmount;
    } else {
      taxAmount = Math.round((taxableAmount * taxRate) / 100 * 100) / 100;
      if (invoice.taxType === "igst") {
        igstAmount = taxAmount;
      }
    }
  }

  // Additional Charges
  const additionalCharges = parseFloat(invoice.additionalCharges) || 0;

  // Grand Total
  const grandTotal = Math.max(0, Math.round((taxableAmount + taxAmount + additionalCharges) * 100) / 100);

  // Amount in words
  const amountInWords = numberToIndianWords(grandTotal);

  // Quantity summary label (e.g., "10 LABOURS" or "10")
  const totalCountLabel =
    items.length > 0 && hasSameUnit && firstUnit
      ? `${totalQty} ${firstUnit}`
      : totalQty > 0
      ? `${totalQty}`
      : "";

  return {
    calculatedItems,
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    additionalCharges,
    grandTotal,
    totalQty,
    totalCountLabel,
    amountInWords
  };
}
