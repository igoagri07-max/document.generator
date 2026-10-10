import React from "react";
import {
  Download,
  FileDown,
  Printer,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";
import { calculateInvoiceTotals } from "../utils/calculations.js";
import { formatINR } from "../utils/numberToWords.js";

export default function InvoicePreview({
  invoice,
  companySettings,
  onDownloadPDF,
  onDownloadWord,
  onPrint,
  onExpand,
  zoom = 1,
  setZoom
}) {
  const company = invoice.companySnapshot || companySettings;
  const totals = calculateInvoiceTotals(invoice);

  const handleZoomIn = () => setZoom && setZoom((z) => Math.min(z + 0.1, 1.5));
  const handleZoomOut = () => setZoom && setZoom((z) => Math.max(z - 0.1, 0.6));
  const handleResetZoom = () => setZoom && setZoom(1);

  return (
    <div className="preview-container">
      {/* Top Preview Bar */}
      <div className="preview-toolbar">
        <div className="preview-toolbar-title">
          <span className="live-pill">LIVE PREVIEW</span>
          <span className="preview-doc-title">Invoice #{invoice.invoiceNumber || "--"}</span>
        </div>

        <div className="preview-toolbar-controls">
          {setZoom && (
            <div className="zoom-controls">
              <button
                type="button"
                className="btn-icon"
                onClick={handleZoomOut}
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="zoom-level">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                className="btn-icon"
                onClick={handleZoomIn}
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={handleResetZoom}
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          )}

          <div className="action-buttons-group">
            {onExpand && (
              <button
                type="button"
                className="btn-icon"
                onClick={onExpand}
                title="Expand Preview"
              >
                <Maximize2 size={16} />
              </button>
            )}

            {onPrint && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onPrint}
                title="Print Preview"
              >
                <Printer size={15} />
                <span>Print</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-pdf btn-sm"
              onClick={onDownloadPDF}
              title="Download PDF"
            >
              <FileDown size={15} />
              <span>PDF</span>
            </button>

            <button
              type="button"
              className="btn btn-word btn-sm"
              onClick={onDownloadWord}
              title="Download Word (.docx)"
            >
              <Download size={15} />
              <span>Word</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sheet Wrapper */}
      <div className="sheet-scroll-viewport">
        <div
          className="sheet-wrapper"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        >
          <div className="a4-document" id="printable-invoice">
            {/* Centered Document Title */}
            <div className="doc-main-title">Invoice</div>

            {/* Main Outer Box */}
            <div className="doc-outer-box">
              {/* SECTION 1: HEADER */}
              <div className="doc-row header-section">
                {/* Company Details (Left) */}
                <div className="doc-col company-info-col">
                  {company.logo && (
                    <div className="company-logo-wrap">
                      <img
                        src={company.logo}
                        alt={company.companyName}
                        className="company-logo-img"
                      />
                    </div>
                  )}
                  <div className="company-name">{company.companyName}</div>
                  <div className="company-address">{company.address}</div>
                  <div className="company-contact">Email: {company.email}</div>
                  {company.gstin && (
                    <div className="company-gstin">
                      <strong>GSTIN:</strong> {company.gstin}
                    </div>
                  )}
                </div>

                {/* Invoice Meta Grid (Right) */}
                <div className="doc-col meta-grid-col">
                  <div className="meta-grid">
                    <div className="meta-cell">
                      <span className="meta-label">Invoice No.</span>
                      <strong className="meta-val">{invoice.invoiceNumber || ""}</strong>
                    </div>
                    <div className="meta-cell">
                      <span className="meta-label">Dated</span>
                      <strong className="meta-val">{invoice.invoiceDate || ""}</strong>
                    </div>

                    <div className="meta-cell">
                      <span className="meta-label">Delivery Note</span>
                      <span className="meta-val">{invoice.deliveryNote || ""}</span>
                    </div>
                    <div className="meta-cell">
                      <span className="meta-label">Mode/Terms of Payment</span>
                      <strong className="meta-val">{invoice.paymentTerms || "Bank Transfer"}</strong>
                    </div>

                    <div className="meta-cell">
                      <span className="meta-label">Supplier's Ref.</span>
                      <span className="meta-val">{invoice.supplierRef || ""}</span>
                    </div>
                    <div className="meta-cell">
                      <span className="meta-label">Other Reference (s)</span>
                      <span className="meta-val">{invoice.otherReference || ""}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CUSTOMER & ORDER DETAILS */}
              <div className="doc-row customer-order-section">
                {/* Customer Details (Left) */}
                <div className="doc-col customer-info-col">
                  <div className="customer-to-header">
                    <strong>TO:</strong>
                  </div>
                  <div className="customer-details-body">
                    <div className="customer-name-bold">{invoice.customer?.name}</div>
                    {invoice.customer?.contactPerson &&
                      invoice.customer.contactPerson !== invoice.customer.name && (
                        <div>{invoice.customer.contactPerson}</div>
                      )}
                    {invoice.customer?.address && (
                      <div className="cust-addr-lines">{invoice.customer.address}</div>
                    )}
                    {(invoice.customer?.city ||
                      invoice.customer?.district ||
                      invoice.customer?.state) && (
                      <div>
                        {[
                          invoice.customer.city,
                          invoice.customer.district,
                          invoice.customer.state
                        ]
                          .filter(Boolean)
                          .join(", ")}
                        {invoice.customer?.pincode ? ` - ${invoice.customer.pincode}` : ""}
                      </div>
                    )}
                    {invoice.customer?.phone && (
                      <div>Phone: {invoice.customer.phone}</div>
                    )}
                    {invoice.customer?.gstin && (
                      <div className="customer-gstin">
                        <strong>GSTIN:</strong> {invoice.customer.gstin}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order & Dispatch Grid (Right) */}
                <div className="doc-col meta-grid-col">
                  <div className="meta-grid four-rows">
                    <div className="meta-cell">
                      <span className="meta-label">Buyer's Order No.</span>
                      <strong className="meta-val">{invoice.buyersOrderNo || ""}</strong>
                    </div>
                    <div className="meta-cell">
                      <span className="meta-label">Dated</span>
                      <strong className="meta-val">{invoice.orderDate || ""}</strong>
                    </div>

                    <div className="meta-cell">
                      <span className="meta-label">Dispatch Document No.</span>
                      <span className="meta-val">{invoice.dispatchDocNo || ""}</span>
                    </div>
                    <div className="meta-cell">
                      <span className="meta-label">Vehicle no:</span>
                      <strong className="meta-val">{invoice.vehicleNo || ""}</strong>
                    </div>

                    <div className="meta-cell">
                      <span className="meta-label">Dispatched through</span>
                      <span className="meta-val">{invoice.dispatchedThrough || ""}</span>
                    </div>
                    <div className="meta-cell">
                      <span className="meta-label">Destination</span>
                      <span className="meta-val">{invoice.destination || ""}</span>
                    </div>

                    <div className="meta-cell span-2">
                      <span className="meta-label">Terms of Delivery:</span>
                      <span className="meta-val inline-val">
                        {invoice.termsOfDelivery || ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ITEMS TABLE */}
              <div className="doc-items-table-wrap">
                <table className="doc-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: "8%" }}>Sl No.</th>
                      <th style={{ width: "52%" }}>WORK DESCRIPTION</th>
                      <th style={{ width: "20%" }}>COUNTS</th>
                      <th style={{ width: "20%" }}>AMOUNT<br />(IN RS )</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.calculatedItems.map((item, idx) => {
                      let desc = item.description || "";
                      if (item.datePeriod && !desc.includes(item.datePeriod)) {
                        desc += ` ( ${item.datePeriod} )`;
                      }

                      return (
                        <tr key={item.id || idx} className="item-row">
                          <td className="center bold">{item.slNo}</td>
                          <td className="center bold">{desc}</td>
                          <td className="center">
                            {item.quantity} {item.unit || "LABOURS"}
                          </td>
                          <td className="center">Rs. {formatINR(item.amount)} /-</td>
                        </tr>
                      );
                    })}

                    {/* Minimum blank spacer rows if few items */}
                    {totals.calculatedItems.length < 3 && (
                      <tr className="spacer-row">
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    )}

                    {/* Intermediate Breakdown if Discounts / Taxes / Charges exist */}
                    {(totals.discountAmount > 0 ||
                      totals.taxAmount > 0 ||
                      totals.additionalCharges > 0) && (
                      <>
                        <tr className="subtotal-row">
                          <td colSpan={2} className="right bold">SUBTOTAL</td>
                          <td className="center">&nbsp;</td>
                          <td className="center bold">Rs. {formatINR(totals.subtotal)} /-</td>
                        </tr>

                        {totals.discountAmount > 0 && (
                          <tr className="discount-row">
                            <td colSpan={3} className="right">Discount</td>
                            <td className="center text-red">
                              - Rs. {formatINR(totals.discountAmount)}
                            </td>
                          </tr>
                        )}

                        {totals.cgstAmount > 0 ? (
                          <>
                            <tr className="tax-row">
                              <td colSpan={3} className="right">
                                CGST ({invoice.taxRate / 2}%)
                              </td>
                              <td className="center">Rs. {formatINR(totals.cgstAmount)}</td>
                            </tr>
                            <tr className="tax-row">
                              <td colSpan={3} className="right">
                                SGST ({invoice.taxRate / 2}%)
                              </td>
                              <td className="center">Rs. {formatINR(totals.sgstAmount)}</td>
                            </tr>
                          </>
                        ) : totals.taxAmount > 0 ? (
                          <tr className="tax-row">
                            <td colSpan={3} className="right">
                              GST ({invoice.taxRate}%)
                            </td>
                            <td className="center">Rs. {formatINR(totals.taxAmount)}</td>
                          </tr>
                        ) : null}

                        {totals.additionalCharges > 0 && (
                          <tr className="charges-row">
                            <td colSpan={3} className="right">
                              {invoice.additionalChargesLabel || "Additional Charges"}
                            </td>
                            <td className="center">
                              Rs. {formatINR(totals.additionalCharges)}
                            </td>
                          </tr>
                        )}
                      </>
                    )}

                    {/* TOTAL ROW */}
                    <tr className="grand-total-row">
                      <td colSpan={2} className="center bold title-cell">
                        TOTAL
                      </td>
                      <td className="center bold count-cell">
                        {totals.totalCountLabel}
                      </td>
                      <td className="center bold amount-cell">
                        Rs. {formatINR(totals.grandTotal)}/-
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION 4: AMOUNT CHARGEABLE IN WORDS */}
              <div className="doc-words-section">
                <div className="words-label">Amount Chargeable(in words)</div>
                <div className="words-text">{totals.amountInWords}</div>
              </div>

              {/* SECTION 5: DECLARATION & SIGNATORY */}
              <div className="doc-row footer-declaration-section">
                {/* Declaration (Left) */}
                <div className="doc-col declaration-col">
                  <div className="declaration-heading">Declaration</div>
                  <div className="declaration-body">
                    {company.declaration ||
                      "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct."}
                  </div>
                  {invoice.notes && (
                    <div className="invoice-notes-block">
                      <em>Note: {invoice.notes}</em>
                    </div>
                  )}
                </div>

                {/* Authorised Signatory (Right) */}
                <div className="doc-col signatory-col">
                  <div className="for-entity">
                    {company.signatoryEntity || "For IGO GROUP OF COMPANIES"}
                  </div>
                  <div className="signature-area">
                    {company.signatureImage ? (
                      <img
                        src={company.signatureImage}
                        alt="Authorised Signature"
                        className="signature-img"
                      />
                    ) : (
                      <div className="signature-blank-space" />
                    )}
                  </div>
                  {company.signatoryName && (
                    <div className="signatory-name">{company.signatoryName}</div>
                  )}
                  <div className="authorised-signatory-label">
                    {company.signatoryDesignation || "Authorised Signatory"}
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Bottom Note */}
            {company.footerNote && company.footerNote.trim() && (
              <div className="computer-generated-note">
                {company.footerNote.trim()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
