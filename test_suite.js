import { calculateInvoiceTotals } from "./src/utils/calculations.js";
import { numberToIndianWords, formatINR } from "./src/utils/numberToWords.js";
import { generateInvoicePDF } from "./src/utils/pdfGenerator.js";
import { generateInvoiceWord } from "./src/utils/wordGenerator.js";
import { DEFAULT_COMPANY_SETTINGS, INITIAL_SAMPLE_INVOICE } from "./src/constants/defaultData.js";
import { Packer } from "docx";
import fs from "fs";

console.log("==================================================");
console.log("  RUNNING IGO DOCUMENT GENERATOR TEST SUITE");
console.log("==================================================");

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failedCount++;
  }
}

// TEST 1: Reference Invoice (One work item: 10 LABOURS @ 500 = 5000)
console.log("\n--- TEST 1: Reference Invoice Calculations & Words ---");
const refTotals = calculateInvoiceTotals(INITIAL_SAMPLE_INVOICE);
assert(refTotals.subtotal === 5000, "Subtotal is exactly 5000");
assert(refTotals.grandTotal === 5000, "Grand total is exactly 5000");
assert(refTotals.totalCountLabel === "10 LABOURS", "Total count label is '10 LABOURS'");
assert(refTotals.amountInWords === "INR FIVE THOUSAND RUPEES ONLY", "Amount in words is 'INR FIVE THOUSAND RUPEES ONLY'");

// TEST 2: Indian Numbering System edge cases
console.log("\n--- TEST 2: Currency Words & Formatting ---");
assert(numberToIndianWords(0) === "INR ZERO RUPEES ONLY", "Zero rupees handled");
assert(numberToIndianWords(100000) === "INR ONE LAKH RUPEES ONLY", "1 Lakh handled correctly");
assert(numberToIndianWords(10000000) === "INR ONE CRORE RUPEES ONLY", "1 Crore handled correctly");
assert(numberToIndianWords(25430.75) === "INR TWENTY FIVE THOUSAND FOUR HUNDRED THIRTY RUPEES AND SEVENTY FIVE PAISE ONLY", "Paise handled correctly");
assert(formatINR(5000) === "5,000.00", "Indian currency comma formatting for 5000");
assert(formatINR(125000.5) === "1,25,000.50", "Indian currency comma formatting for 1.25 Lakhs");

// TEST 3: Multiple Line Items with discounts, taxes, and additional charges
console.log("\n--- TEST 3: Multi-item invoice with discount, GST, and transport ---");
const multiItemInvoice = {
  ...INITIAL_SAMPLE_INVOICE,
  invoiceNumber: "10",
  items: [
    { id: "1", slNo: 1, description: "Weeding labours", datePeriod: "2026-09-20", quantity: 10, unit: "LABOURS", rate: 500, amount: 5000 },
    { id: "2", slNo: 2, description: "Pruning & Trimming", datePeriod: "2026-09-21", quantity: 5, unit: "LABOURS", rate: 600, amount: 3000 },
    { id: "3", slNo: 3, description: "Organic Fertilizer Bags", datePeriod: "", quantity: 20, unit: "BAGS", rate: 350, amount: 7000 },
    { id: "4", slNo: 4, description: "Supervisor Daily Charge", datePeriod: "2026-09-20 to 2026-09-21", quantity: 2, unit: "DAYS", rate: 1200, amount: 2400 }
  ],
  discount: 400,
  discountType: "amount",
  taxRate: 18,
  taxType: "cgst_sgst",
  additionalCharges: 1000,
  additionalChargesLabel: "Transport & Fuel Charges"
};

const multiTotals = calculateInvoiceTotals(multiItemInvoice);
// Subtotal = 5000 + 3000 + 7000 + 2400 = 17400
assert(multiTotals.subtotal === 17400, "Multi-item subtotal is 17400");
// Taxable = 17400 - 400 = 17000
assert(multiTotals.taxableAmount === 17000, "Taxable amount after 400 discount is 17000");
// CGST 9% of 17000 = 1530, SGST 9% of 17000 = 1530, Total Tax = 3060
assert(multiTotals.cgstAmount === 1530, "CGST 9% is 1530");
assert(multiTotals.sgstAmount === 1530, "SGST 9% is 1530");
assert(multiTotals.taxAmount === 3060, "Total tax is 3060");
// Grand Total = 17000 + 3060 + 1000 = 21060
assert(multiTotals.grandTotal === 21060, "Grand total with tax and charges is 21060");
assert(multiTotals.amountInWords === "INR TWENTY ONE THOUSAND SIXTY RUPEES ONLY", "Grand total in words is accurate");

// TEST 4: Generate Multi-page PDF
console.log("\n--- TEST 4: Multi-page PDF generation (25 items) ---");
const longItemsInvoice = {
  ...INITIAL_SAMPLE_INVOICE,
  invoiceNumber: "99",
  items: Array.from({ length: 25 }, (_, i) => ({
    id: `item-${i + 1}`,
    slNo: i + 1,
    description: `Farm Maintenance Task #${i + 1} - Weeding, Soil aeration and organic mulching at North Block`,
    datePeriod: "22/09/2026",
    quantity: 4,
    unit: "LABOURS",
    rate: 500,
    amount: 2000
  }))
};

const longPdfDoc = generateInvoicePDF(longItemsInvoice, DEFAULT_COMPANY_SETTINGS);
const longPdfBytes = longPdfDoc.output("arraybuffer");
fs.writeFileSync("test_multipage.pdf", Buffer.from(longPdfBytes));
assert(longPdfBytes.byteLength > 15000, `Multi-page PDF generated (${longPdfBytes.byteLength} bytes)`);
const pageCount = longPdfDoc.getNumberOfPages();
assert(pageCount >= 2, `Multi-page PDF created ${pageCount} pages`);

// TEST 5: Word Document (.docx) Generation
console.log("\n--- TEST 5: Genuine Word Document Generation ---");
const wordDoc = await generateInvoiceWord(multiItemInvoice, DEFAULT_COMPANY_SETTINGS);
const wordBuffer = await Packer.toBuffer(wordDoc);
fs.writeFileSync("test_multi_item.docx", wordBuffer);
assert(wordBuffer.length > 10000, `Word document generated (${wordBuffer.length} bytes)`);

// Summary
console.log("\n==================================================");
console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("==================================================");

if (failedCount > 0) {
  process.exit(1);
}
