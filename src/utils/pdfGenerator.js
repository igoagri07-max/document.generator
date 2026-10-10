import { jsPDF } from "jspdf";
import { calculateInvoiceTotals } from "./calculations.js";
import { formatINR } from "./numberToWords.js";

/**
 * Generates an authentic, professional PDF matching the reference invoice
 * "Mrs. Sukavya Deepak Site Weeding Labours Salary Invoice"
 */
export function generateInvoicePDF(invoice, companySettings) {
  const company = invoice.companySnapshot || companySettings;
  const totals = calculateInvoiceTotals(invoice);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 210;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2; // 190mm
  const leftColWidth = 114; // 60%
  const rightColWidth = 76; // 40%

  // Top Title: "Invoice"
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Invoice", pageWidth / 2, 14, { align: "center" });

  let curY = 17;

  // Outer border starts at curY
  // We'll draw sections with crisp lines

  // -------------------------------------------------------------
  // SECTION 1: HEADER (Company details on left, Invoice details grid on right)
  // -------------------------------------------------------------
  const headerHeight = 44;

  // Box outline for Section 1
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(margin, curY, contentWidth, headerHeight);

  // Vertical line separating Left (Company) and Right (Invoice meta)
  doc.line(margin + leftColWidth, curY, margin + leftColWidth, curY + headerHeight);

  // --- Left Column: Company Info & Genuine Logo ---
  if (company.logo) {
    try {
      const format = company.logo.includes("image/png") ? "PNG" : "JPEG";
      const props = doc.getImageProperties(company.logo);
      const aspect = props.width / props.height;
      const maxW = 42;
      const maxH = 14;
      let w = maxW;
      let h = w / aspect;
      if (h > maxH) {
        h = maxH;
        w = h * aspect;
      }
      doc.addImage(company.logo, format, margin + 3, curY + 2, w, h);
    } catch (e) {
      console.warn("Could not render logo in PDF:", e);
    }
  }

  const compTextY = curY + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(company.companyName || "IGO GROUP OF COMPANIES", margin + 3, compTextY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const addressLines = doc.splitTextToSize(
    company.address || "",
    leftColWidth - 8
  );
  doc.text(addressLines, margin + 3, compTextY + 4.5);

  const afterAddrY = compTextY + 4.5 + addressLines.length * 3.2;
  doc.text(`Email: ${company.email || ""}`, margin + 3, afterAddrY);
  if (company.gstin) {
    doc.setFont("helvetica", "bold");
    doc.text(`GSTIN: ${company.gstin}`, margin + 3, afterAddrY + 3.5);
    doc.setFont("helvetica", "normal");
  }

  // --- Right Column: Invoice Meta Grid (3 rows) ---
  const rowH1 = headerHeight / 3; // ~14.66mm
  const rightMidX = margin + leftColWidth + rightColWidth / 2;

  // Horizontal divider 1
  doc.line(margin + leftColWidth, curY + rowH1, margin + contentWidth, curY + rowH1);
  // Horizontal divider 2
  doc.line(margin + leftColWidth, curY + rowH1 * 2, margin + contentWidth, curY + rowH1 * 2);

  // Vertical divider between two halves of right box
  doc.line(rightMidX, curY, rightMidX, curY + headerHeight);

  // Row 1: Invoice No & Dated
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Invoice No.", margin + leftColWidth + 2, curY + 4);
  doc.setFont("helvetica", "bold");
  doc.text(String(invoice.invoiceNumber || ""), margin + leftColWidth + 20, curY + 4);

  doc.setFont("helvetica", "normal");
  doc.text("Dated", rightMidX + 2, curY + 4);
  doc.setFont("helvetica", "bold");
  doc.text(String(invoice.invoiceDate || ""), rightMidX + 2, curY + 8.5);

  // Row 2: Delivery Note & Mode/Terms of Payment
  doc.setFont("helvetica", "normal");
  doc.text("Delivery Note", margin + leftColWidth + 2, curY + rowH1 + 4);
  if (invoice.deliveryNote) {
    doc.text(String(invoice.deliveryNote), margin + leftColWidth + 2, curY + rowH1 + 8.5);
  }

  doc.text("Mode/Terms of Payment", rightMidX + 2, curY + rowH1 + 4);
  doc.setFont("helvetica", "bold");
  doc.text(String(invoice.paymentTerms || "Bank Transfer"), rightMidX + 2, curY + rowH1 + 8.5);

  // Row 3: Supplier's Ref & Other Reference(s)
  doc.setFont("helvetica", "normal");
  doc.text("Supplier's Ref.", margin + leftColWidth + 2, curY + rowH1 * 2 + 4);
  if (invoice.supplierRef) {
    doc.text(String(invoice.supplierRef), margin + leftColWidth + 2, curY + rowH1 * 2 + 8.5);
  }

  doc.text("Other Reference (s)", rightMidX + 2, curY + rowH1 * 2 + 4);
  if (invoice.otherReference) {
    doc.text(String(invoice.otherReference), rightMidX + 2, curY + rowH1 * 2 + 8.5);
  }

  curY += headerHeight;

  // -------------------------------------------------------------
  // SECTION 2: CUSTOMER & ORDER / DISPATCH DETAILS
  // -------------------------------------------------------------
  const sec2Height = 44;
  doc.rect(margin, curY, contentWidth, sec2Height);
  doc.line(margin + leftColWidth, curY, margin + leftColWidth, curY + sec2Height);

  // Left side: TO (Customer)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("TO:", margin + 3, curY + 5);

  const cust = invoice.customer || {};
  doc.setFontSize(8.5);
  doc.text(cust.name || "Customer Name", margin + 18, curY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  let custY = curY + 9.5;

  if (cust.contactPerson && cust.contactPerson !== cust.name) {
    doc.text(cust.contactPerson, margin + 18, custY);
    custY += 3.8;
  }

  if (cust.address) {
    const custAddrLines = doc.splitTextToSize(cust.address, leftColWidth - 22);
    doc.text(custAddrLines, margin + 18, custY);
    custY += custAddrLines.length * 3.8;
  }

  const cityDistState = [cust.city, cust.district, cust.state].filter(Boolean).join(", ");
  if (cityDistState) {
    const fullLoc = cust.pincode ? `${cityDistState} - ${cust.pincode}` : cityDistState;
    doc.text(fullLoc, margin + 18, custY);
    custY += 3.8;
  }

  if (cust.phone) {
    doc.text(`Phone: ${cust.phone}`, margin + 18, custY);
    custY += 3.8;
  }
  if (cust.gstin) {
    doc.setFont("helvetica", "bold");
    doc.text(`GSTIN: ${cust.gstin}`, margin + 18, custY);
    doc.setFont("helvetica", "normal");
  }

  // Right side: Order & Dispatch Details (4 rows)
  const rowH2 = sec2Height / 4; // 11mm per row

  // Row 1 divider
  doc.line(margin + leftColWidth, curY + rowH2, margin + contentWidth, curY + rowH2);
  // Row 2 divider
  doc.line(margin + leftColWidth, curY + rowH2 * 2, margin + contentWidth, curY + rowH2 * 2);
  // Row 3 divider
  doc.line(margin + leftColWidth, curY + rowH2 * 3, margin + contentWidth, curY + rowH2 * 3);

  // Vertical split for first 3 rows
  doc.line(rightMidX, curY, rightMidX, curY + rowH2 * 3);

  // Row 1: Buyer's Order No & Dated
  doc.setFontSize(7.2);
  doc.text("Buyer's Order No.", margin + leftColWidth + 2, curY + 3.8);
  if (invoice.buyersOrderNo) {
    doc.setFont("helvetica", "bold");
    doc.text(String(invoice.buyersOrderNo), margin + leftColWidth + 2, curY + 8);
    doc.setFont("helvetica", "normal");
  }

  doc.text("Dated", rightMidX + 2, curY + 3.8);
  if (invoice.orderDate) {
    doc.setFont("helvetica", "bold");
    doc.text(String(invoice.orderDate), rightMidX + 2, curY + 8);
    doc.setFont("helvetica", "normal");
  }

  // Row 2: Dispatch Document No. & Vehicle no:
  doc.text("Dispatch Document No.", margin + leftColWidth + 2, curY + rowH2 + 3.8);
  if (invoice.dispatchDocNo) {
    doc.text(String(invoice.dispatchDocNo), margin + leftColWidth + 2, curY + rowH2 + 8);
  }

  doc.text("Vehicle no:", rightMidX + 2, curY + rowH2 + 3.8);
  if (invoice.vehicleNo) {
    doc.setFont("helvetica", "bold");
    doc.text(String(invoice.vehicleNo), rightMidX + 2, curY + rowH2 + 8);
    doc.setFont("helvetica", "normal");
  }

  // Row 3: Dispatched through & Destination
  doc.text("Dispatched through", margin + leftColWidth + 2, curY + rowH2 * 2 + 3.8);
  if (invoice.dispatchedThrough) {
    doc.text(String(invoice.dispatchedThrough), margin + leftColWidth + 2, curY + rowH2 * 2 + 8);
  }

  doc.text("Destination", rightMidX + 2, curY + rowH2 * 2 + 3.8);
  if (invoice.destination) {
    doc.text(String(invoice.destination), rightMidX + 2, curY + rowH2 * 2 + 8);
  }

  // Row 4: Terms of Delivery (spans both)
  doc.text("Terms of Delivery", margin + leftColWidth + 2, curY + rowH2 * 3 + 3.8);
  if (invoice.termsOfDelivery) {
    doc.text(String(invoice.termsOfDelivery), margin + leftColWidth + 30, curY + rowH2 * 3 + 3.8);
  }

  curY += sec2Height;

  // -------------------------------------------------------------
  // SECTION 3: ITEMS TABLE
  // Columns: Sl No. (15mm) | WORK DESCRIPTION (100mm) | COUNTS (38mm) | AMOUNT (IN RS ) (37mm)
  // -------------------------------------------------------------
  const colW = {
    slNo: 14,
    desc: 98,
    counts: 39,
    amount: 39
  };

  const x0 = margin;
  const x1 = x0 + colW.slNo;
  const x2 = x1 + colW.desc;
  const x3 = x2 + colW.counts;
  const x4 = margin + contentWidth;

  const tableHeaderH = 9;
  doc.rect(x0, curY, contentWidth, tableHeaderH);

  // Column vertical dividers for header
  doc.line(x1, curY, x1, curY + tableHeaderH);
  doc.line(x2, curY, x2, curY + tableHeaderH);
  doc.line(x3, curY, x3, curY + tableHeaderH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Sl No.", x0 + colW.slNo / 2, curY + 6, { align: "center" });
  doc.text("WORK DESCRIPTION", x1 + colW.desc / 2, curY + 6, { align: "center" });
  doc.text("COUNTS", x2 + colW.counts / 2, curY + 6, { align: "center" });
  doc.text("AMOUNT\n(IN RS )", x3 + colW.amount / 2, curY + 4, { align: "center" });

  curY += tableHeaderH;

  // Items rows with pagination support
  let currentSegmentStartY = curY;
  const minTableHeight = 45;
  const maxTableYBeforeBreak = 240;

  totals.calculatedItems.forEach((item, index) => {
    let descText = item.description || "";
    if (item.datePeriod && !descText.includes(item.datePeriod)) {
      descText += ` ( ${item.datePeriod} )`;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const descLines = doc.splitTextToSize(descText, colW.desc - 6);
    const itemH = Math.max(9, descLines.length * 4.2 + 3);

    // Check if we need a page break before drawing this item
    if (curY + itemH > maxTableYBeforeBreak) {
      // Draw outer borders for the current page items segment
      doc.line(x0, currentSegmentStartY, x0, curY);
      doc.line(x1, currentSegmentStartY, x1, curY);
      doc.line(x2, currentSegmentStartY, x2, curY);
      doc.line(x3, currentSegmentStartY, x3, curY);
      doc.line(x4, currentSegmentStartY, x4, curY);

      // Page break
      doc.addPage();
      curY = 20;

      // Repeat Table Header on subsequent page
      doc.rect(x0, curY, contentWidth, tableHeaderH);
      doc.line(x1, curY, x1, curY + tableHeaderH);
      doc.line(x2, curY, x2, curY + tableHeaderH);
      doc.line(x3, curY, x3, curY + tableHeaderH);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("Sl No.", x0 + colW.slNo / 2, curY + 6, { align: "center" });
      doc.text("WORK DESCRIPTION (Contd.)", x1 + colW.desc / 2, curY + 6, { align: "center" });
      doc.text("COUNTS", x2 + colW.counts / 2, curY + 6, { align: "center" });
      doc.text("AMOUNT\n(IN RS )", x3 + colW.amount / 2, curY + 4, { align: "center" });

      curY += tableHeaderH;
      currentSegmentStartY = curY;
    }

    // Row bottom border
    doc.line(x0, curY + itemH, x4, curY + itemH);

    // Vertical middle positioning for single-line cells
    const textMidY = curY + (itemH / 2) + 1.2;

    // Sl No
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(String(index + 1), x0 + colW.slNo / 2, textMidY, { align: "center" });

    // Description
    if (descLines.length === 1) {
      doc.text(descLines[0], x1 + colW.desc / 2, textMidY, { align: "center" });
    } else {
      doc.text(descLines, x1 + 3, curY + 4.5);
    }

    // Counts / Quantity with unit
    doc.setFont("helvetica", "normal");
    const countText = `${item.quantity} ${item.unit || "LABOURS"}`.trim();
    doc.text(countText, x2 + colW.counts / 2, textMidY, { align: "center" });

    // Amount
    const amtText = `Rs. ${formatINR(item.amount)} /-`;
    doc.text(amtText, x3 + colW.amount / 2, textMidY, { align: "center" });

    curY += itemH;
  });

  // Ensure minimum table space if single page and few rows
  if (doc.getNumberOfPages() === 1 && curY - currentSegmentStartY < minTableHeight) {
    const emptyH = minTableHeight - (curY - currentSegmentStartY);
    curY += emptyH;
    doc.line(x0, curY, x4, curY);
  }

  // Draw vertical dividers across the current page items segment
  doc.line(x0, currentSegmentStartY, x0, curY);
  doc.line(x1, currentSegmentStartY, x1, curY);
  doc.line(x2, currentSegmentStartY, x2, curY);
  doc.line(x3, currentSegmentStartY, x3, curY);
  doc.line(x4, currentSegmentStartY, x4, curY);

  // Subtotal / Intermediate rows if tax/charges exist
  if (totals.discountAmount > 0 || totals.taxAmount > 0 || totals.additionalCharges > 0) {
    const subH = 6.5;
    // Subtotal Row
    doc.line(x0, curY + subH, x4, curY + subH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("SUBTOTAL", x1 + colW.desc / 2, curY + 4.5, { align: "center" });
    doc.text(`Rs. ${formatINR(totals.subtotal)} /-`, x3 + colW.amount / 2, curY + 4.5, { align: "center" });
    doc.line(x0, curY, x0, curY + subH);
    doc.line(x1, curY, x1, curY + subH);
    doc.line(x3, curY, x3, curY + subH);
    doc.line(x4, curY, x4, curY + subH);
    curY += subH;

    // Discount
    if (totals.discountAmount > 0) {
      doc.line(x0, curY + subH, x4, curY + subH);
      doc.setFont("helvetica", "normal");
      doc.text("Discount", x1 + 4, curY + 4.5);
      doc.text(`- Rs. ${formatINR(totals.discountAmount)}`, x3 + colW.amount / 2, curY + 4.5, { align: "center" });
      doc.line(x0, curY, x0, curY + subH);
      doc.line(x1, curY, x1, curY + subH);
      doc.line(x3, curY, x3, curY + subH);
      doc.line(x4, curY, x4, curY + subH);
      curY += subH;
    }

    // Taxes
    if (totals.cgstAmount > 0) {
      doc.line(x0, curY + subH, x4, curY + subH);
      doc.setFont("helvetica", "normal");
      doc.text(`CGST (${invoice.taxRate / 2}%)`, x1 + 4, curY + 4.5);
      doc.text(`Rs. ${formatINR(totals.cgstAmount)}`, x3 + colW.amount / 2, curY + 4.5, { align: "center" });
      doc.line(x0, curY, x0, curY + subH);
      doc.line(x1, curY, x1, curY + subH);
      doc.line(x3, curY, x3, curY + subH);
      doc.line(x4, curY, x4, curY + subH);
      curY += subH;

      doc.line(x0, curY + subH, x4, curY + subH);
      doc.text(`SGST (${invoice.taxRate / 2}%)`, x1 + 4, curY + 4.5);
      doc.text(`Rs. ${formatINR(totals.sgstAmount)}`, x3 + colW.amount / 2, curY + 4.5, { align: "center" });
      doc.line(x0, curY, x0, curY + subH);
      doc.line(x1, curY, x1, curY + subH);
      doc.line(x3, curY, x3, curY + subH);
      doc.line(x4, curY, x4, curY + subH);
      curY += subH;
    } else if (totals.taxAmount > 0) {
      doc.line(x0, curY + subH, x4, curY + subH);
      doc.setFont("helvetica", "normal");
      doc.text(`GST (${invoice.taxRate}%)`, x1 + 4, curY + 4.5);
      doc.text(`Rs. ${formatINR(totals.taxAmount)}`, x3 + colW.amount / 2, curY + 4.5, { align: "center" });
      doc.line(x0, curY, x0, curY + subH);
      doc.line(x1, curY, x1, curY + subH);
      doc.line(x3, curY, x3, curY + subH);
      doc.line(x4, curY, x4, curY + subH);
      curY += subH;
    }

    // Additional Charges
    if (totals.additionalCharges > 0) {
      doc.line(x0, curY + subH, x4, curY + subH);
      doc.setFont("helvetica", "normal");
      doc.text(invoice.additionalChargesLabel || "Additional Charges", x1 + 4, curY + 4.5);
      doc.text(`Rs. ${formatINR(totals.additionalCharges)}`, x3 + colW.amount / 2, curY + 4.5, { align: "center" });
      doc.line(x0, curY, x0, curY + subH);
      doc.line(x1, curY, x1, curY + subH);
      doc.line(x3, curY, x3, curY + subH);
      doc.line(x4, curY, x4, curY + subH);
      curY += subH;
    }
  }

  // TOTAL Row (Matches reference PDF: "TOTAL" | count | amount)
  const totalRowH = 8;
  doc.rect(x0, curY, contentWidth, totalRowH);
  doc.line(x2, curY, x2, curY + totalRowH);
  doc.line(x3, curY, x3, curY + totalRowH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("TOTAL", x1 + colW.desc / 2, curY + 5.5, { align: "center" });
  if (totals.totalCountLabel) {
    doc.text(totals.totalCountLabel, x2 + colW.counts / 2, curY + 5.5, { align: "center" });
  }
  doc.text(`Rs. ${formatINR(totals.grandTotal)}/-`, x3 + colW.amount / 2, curY + 5.5, { align: "center" });

  curY += totalRowH;

  // -------------------------------------------------------------
  // SECTION 4: AMOUNT CHARGEABLE IN WORDS
  // -------------------------------------------------------------
  const wordsRowH = 12;
  doc.rect(x0, curY, contentWidth, wordsRowH);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.text("Amount Chargeable(in words)", x0 + 2, curY + 3.8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(totals.amountInWords, x0 + 2, curY + 8.5);

  curY += wordsRowH;

  // -------------------------------------------------------------
  // SECTION 5: DECLARATION & AUTHORISED SIGNATORY
  // -------------------------------------------------------------
  const footerSecH = 25;
  doc.rect(x0, curY, contentWidth, footerSecH);
  doc.line(margin + leftColWidth, curY, margin + leftColWidth, curY + footerSecH);

  // Left side: Declaration
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Declaration", x0 + 2, curY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  const declText = company.declaration || "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.";
  const declLines = doc.splitTextToSize(declText, leftColWidth - 6);
  doc.text(declLines, x0 + 2, curY + 8);

  // Notes if available
  if (invoice.notes) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(6.8);
    const notesLines = doc.splitTextToSize(`Note: ${invoice.notes}`, leftColWidth - 6);
    doc.text(notesLines, x0 + 2, curY + 18);
  }

  // Right side: Signatory
  const signatoryRightX = margin + contentWidth - 3;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  const signatoryEntity = company.signatoryEntity || "For IGO GROUP OF COMPANIES";
  doc.text(signatoryEntity, signatoryRightX, curY + 4, { align: "right" });

  // Optional signature image
  if (company.signatureImage) {
    try {
      doc.addImage(company.signatureImage, "PNG", margin + leftColWidth + 15, curY + 6, 30, 10);
    } catch (e) {
      console.warn("Could not render signature in PDF:", e);
    }
  }

  // Signatory name if specified
  if (company.signatoryName) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.text(company.signatoryName, signatoryRightX, curY + 18, { align: "right" });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const designation = company.signatoryDesignation || "Authorised Signatory";
  doc.text(designation, signatoryRightX, curY + 22, { align: "right" });

  curY += footerSecH;

  // Optional bottom note (only if explicitly set by user)
  if (company.footerNote && company.footerNote.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(company.footerNote.trim(), pageWidth / 2, curY + 6, { align: "center" });
  }

  return doc;
}

export function downloadInvoicePDF(invoice, companySettings) {
  const doc = generateInvoicePDF(invoice, companySettings);
  const safeNumber = (invoice.invoiceNumber || "01").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `IGO_Invoice_${safeNumber}.pdf`;
  doc.save(filename);
  return filename;
}
