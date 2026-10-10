import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  UserCheck,
  Sparkles,
  Calculator,
  Info,
  Calendar,
  Building,
  Layers
} from "lucide-react";
import { COMMON_UNITS, PAYMENT_MODES } from "../constants/defaultData.js";
import { calculateInvoiceTotals } from "../utils/calculations.js";
import { formatINR } from "../utils/numberToWords.js";

export default function InvoiceForm({
  invoice,
  onChange,
  savedCustomers = [],
  onSuggestNextNumber,
  validationErrors = {}
}) {
  const [activeSection, setActiveSection] = useState("all");
  const totals = calculateInvoiceTotals(invoice);

  const updateField = (field, value) => {
    onChange({ ...invoice, [field]: value });
  };

  const updateCustomerField = (field, value) => {
    onChange({
      ...invoice,
      customer: {
        ...(invoice.customer || {}),
        [field]: value
      }
    });
  };

  const handleSelectCustomer = (e) => {
    const custId = e.target.value;
    if (!custId) return;
    const selected = savedCustomers.find((c) => c.id === custId);
    if (selected) {
      onChange({
        ...invoice,
        customer: { ...selected }
      });
    }
  };

  // Line items manipulation
  const handleItemChange = (index, field, value) => {
    const items = [...(invoice.items || [])];
    items[index] = { ...items[index], [field]: value };

    // Auto-calculate row amount
    if (field === "quantity" || field === "rate") {
      const q = field === "quantity" ? parseFloat(value) || 0 : parseFloat(items[index].quantity) || 0;
      const r = field === "rate" ? parseFloat(value) || 0 : parseFloat(items[index].rate) || 0;
      items[index].amount = Math.round(q * r * 100) / 100;
    }

    onChange({ ...invoice, items });
  };

  const handleAddItem = () => {
    const items = [...(invoice.items || [])];
    const nextSl = items.length + 1;
    items.push({
      id: "item-" + Date.now(),
      slNo: nextSl,
      description: "",
      datePeriod: "",
      quantity: 1,
      unit: items.length > 0 ? items[0].unit || "LABOURS" : "LABOURS",
      rate: 0,
      amount: 0
    });
    onChange({ ...invoice, items });
  };

  const handleRemoveItem = (index) => {
    const items = (invoice.items || []).filter((_, i) => i !== index);
    onChange({ ...invoice, items });
  };

  const handleDuplicateItem = (index) => {
    const items = [...(invoice.items || [])];
    const target = items[index];
    const cloned = {
      ...target,
      id: "item-" + Date.now(),
      slNo: items.length + 1
    };
    items.splice(index + 1, 0, cloned);
    onChange({ ...invoice, items });
  };

  return (
    <div className="invoice-form-wrapper">
      {/* Form Navigation Tabs */}
      <div className="form-section-tabs">
        <button
          type="button"
          className={`tab-pill ${activeSection === "all" ? "active" : ""}`}
          onClick={() => setActiveSection("all")}
        >
          <Layers size={14} />
          <span>All Sections</span>
        </button>
        <button
          type="button"
          className={`tab-pill ${activeSection === "details" ? "active" : ""}`}
          onClick={() => setActiveSection("details")}
        >
          <Calendar size={14} />
          <span>1. Invoice & Order</span>
        </button>
        <button
          type="button"
          className={`tab-pill ${activeSection === "customer" ? "active" : ""}`}
          onClick={() => setActiveSection("customer")}
        >
          <Building size={14} />
          <span>2. Customer</span>
        </button>
        <button
          type="button"
          className={`tab-pill ${activeSection === "items" ? "active" : ""}`}
          onClick={() => setActiveSection("items")}
        >
          <Calculator size={14} />
          <span>3. Line Items</span>
        </button>
        <button
          type="button"
          className={`tab-pill ${activeSection === "additional" ? "active" : ""}`}
          onClick={() => setActiveSection("additional")}
        >
          <Info size={14} />
          <span>4. Notes & Delivery</span>
        </button>
      </div>

      <div className="form-sections-container">
        {/* SECTION A: INVOICE & ORDER DETAILS */}
        {(activeSection === "all" || activeSection === "details") && (
          <div className="form-card">
            <div className="form-card-header">
              <div className="header-title-wrap">
                <span className="step-badge">1</span>
                <h3>Invoice & Order Details</h3>
              </div>
            </div>

            <div className="form-grid grid-3">
              {/* Invoice Number */}
              <div className="form-group">
                <div className="label-with-action">
                  <label htmlFor="invoiceNumber" className="required">
                    Invoice Number
                  </label>
                  {onSuggestNextNumber && (
                    <button
                      type="button"
                      className="text-action-btn"
                      onClick={onSuggestNextNumber}
                      title="Auto-suggest next invoice number"
                    >
                      <Sparkles size={12} />
                      <span>Suggest Next</span>
                    </button>
                  )}
                </div>
                <input
                  id="invoiceNumber"
                  type="text"
                  className={`form-input ${validationErrors.invoiceNumber ? "input-error" : ""}`}
                  value={invoice.invoiceNumber || ""}
                  onChange={(e) => updateField("invoiceNumber", e.target.value)}
                  placeholder="e.g. 05 or IGO-2026-001"
                />
                {validationErrors.invoiceNumber && (
                  <span className="error-text">{validationErrors.invoiceNumber}</span>
                )}
              </div>

              {/* Invoice Date */}
              <div className="form-group">
                <label htmlFor="invoiceDate" className="required">
                  Invoice Date
                </label>
                <input
                  id="invoiceDate"
                  type="date"
                  className={`form-input ${validationErrors.invoiceDate ? "input-error" : ""}`}
                  value={invoice.invoiceDate || ""}
                  onChange={(e) => updateField("invoiceDate", e.target.value)}
                />
                {validationErrors.invoiceDate && (
                  <span className="error-text">{validationErrors.invoiceDate}</span>
                )}
              </div>

              {/* Mode / Terms of Payment */}
              <div className="form-group">
                <label htmlFor="paymentTerms">Mode / Terms of Payment</label>
                <div className="input-with-datalist">
                  <input
                    id="paymentTerms"
                    type="text"
                    list="payment-modes-list"
                    className="form-input"
                    value={invoice.paymentTerms || ""}
                    onChange={(e) => updateField("paymentTerms", e.target.value)}
                    placeholder="e.g. Bank Transfer"
                  />
                  <datalist id="payment-modes-list">
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Delivery Note */}
              <div className="form-group">
                <label htmlFor="deliveryNote">Delivery Note</label>
                <input
                  id="deliveryNote"
                  type="text"
                  className="form-input"
                  value={invoice.deliveryNote || ""}
                  onChange={(e) => updateField("deliveryNote", e.target.value)}
                  placeholder="Optional delivery reference"
                />
              </div>

              {/* Supplier's Ref */}
              <div className="form-group">
                <label htmlFor="supplierRef">Supplier's Reference</label>
                <input
                  id="supplierRef"
                  type="text"
                  className="form-input"
                  value={invoice.supplierRef || ""}
                  onChange={(e) => updateField("supplierRef", e.target.value)}
                  placeholder="Supplier reference if any"
                />
              </div>

              {/* Other Reference */}
              <div className="form-group">
                <label htmlFor="otherReference">Other Reference(s)</label>
                <input
                  id="otherReference"
                  type="text"
                  className="form-input"
                  value={invoice.otherReference || ""}
                  onChange={(e) => updateField("otherReference", e.target.value)}
                  placeholder="PO ref / quotation ref"
                />
              </div>
            </div>

            {/* Sub-grid for Order & Dispatch */}
            <div className="sub-section-divider">
              <span>Dispatch & Transport Details</span>
            </div>

            <div className="form-grid grid-3">
              <div className="form-group">
                <label htmlFor="buyersOrderNo">Buyer's Order No.</label>
                <input
                  id="buyersOrderNo"
                  type="text"
                  className="form-input"
                  value={invoice.buyersOrderNo || ""}
                  onChange={(e) => updateField("buyersOrderNo", e.target.value)}
                  placeholder="e.g. PO-8921"
                />
              </div>

              <div className="form-group">
                <label htmlFor="orderDate">Order Date</label>
                <input
                  id="orderDate"
                  type="date"
                  className="form-input"
                  value={invoice.orderDate || ""}
                  onChange={(e) => updateField("orderDate", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dispatchDocNo">Dispatch Document No.</label>
                <input
                  id="dispatchDocNo"
                  type="text"
                  className="form-input"
                  value={invoice.dispatchDocNo || ""}
                  onChange={(e) => updateField("dispatchDocNo", e.target.value)}
                  placeholder="Challan / E-way bill no"
                />
              </div>

              <div className="form-group">
                <label htmlFor="vehicleNo">Vehicle No.</label>
                <input
                  id="vehicleNo"
                  type="text"
                  className="form-input"
                  value={invoice.vehicleNo || ""}
                  onChange={(e) => updateField("vehicleNo", e.target.value)}
                  placeholder="e.g. TN 09 AB 1234"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dispatchedThrough">Dispatched Through</label>
                <input
                  id="dispatchedThrough"
                  type="text"
                  className="form-input"
                  value={invoice.dispatchedThrough || ""}
                  onChange={(e) => updateField("dispatchedThrough", e.target.value)}
                  placeholder="e.g. Courier, Private Truck"
                />
              </div>

              <div className="form-group">
                <label htmlFor="destination">Destination</label>
                <input
                  id="destination"
                  type="text"
                  className="form-input"
                  value={invoice.destination || ""}
                  onChange={(e) => updateField("destination", e.target.value)}
                  placeholder="Delivery site location"
                />
              </div>

              <div className="form-group grid-span-3">
                <label htmlFor="termsOfDelivery">Terms of Delivery</label>
                <input
                  id="termsOfDelivery"
                  type="text"
                  className="form-input"
                  value={invoice.termsOfDelivery || ""}
                  onChange={(e) => updateField("termsOfDelivery", e.target.value)}
                  placeholder="e.g. Door delivery, At site, Ex-warehouse"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: CUSTOMER DETAILS */}
        {(activeSection === "all" || activeSection === "customer") && (
          <div className="form-card">
            <div className="form-card-header">
              <div className="header-title-wrap">
                <span className="step-badge">2</span>
                <h3>Customer (Billed To) Details</h3>
              </div>

              {savedCustomers.length > 0 && (
                <div className="customer-select-wrap">
                  <UserCheck size={14} className="text-muted" />
                  <select
                    className="customer-quick-select"
                    onChange={handleSelectCustomer}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Auto-fill from saved clients...
                    </option>
                    {savedCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.city ? `(${c.city})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="form-grid grid-2">
              <div className="form-group">
                <label htmlFor="customerName" className="required">
                  Customer / Business Name
                </label>
                <input
                  id="customerName"
                  type="text"
                  className={`form-input ${validationErrors.customerName ? "input-error" : ""}`}
                  value={invoice.customer?.name || ""}
                  onChange={(e) => updateCustomerField("name", e.target.value)}
                  placeholder="e.g. Mrs. Sukavya Deepak A V"
                />
                {validationErrors.customerName && (
                  <span className="error-text">{validationErrors.customerName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person / Care Of</label>
                <input
                  id="contactPerson"
                  type="text"
                  className="form-input"
                  value={invoice.customer?.contactPerson || ""}
                  onChange={(e) => updateCustomerField("contactPerson", e.target.value)}
                  placeholder="e.g. C/o. Nagaraj"
                />
              </div>

              <div className="form-group grid-span-2">
                <label htmlFor="customerAddress">Address / Landmark</label>
                <input
                  id="customerAddress"
                  type="text"
                  className="form-input"
                  value={invoice.customer?.address || ""}
                  onChange={(e) => updateCustomerField("address", e.target.value)}
                  placeholder="Door No, Street, Landmark (e.g. Nayanahalli Gate, Near Vinayaka School)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customerCity">City / Town</label>
                <input
                  id="customerCity"
                  type="text"
                  className="form-input"
                  value={invoice.customer?.city || ""}
                  onChange={(e) => updateCustomerField("city", e.target.value)}
                  placeholder="e.g. Chintamani"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customerDistrict">District</label>
                <input
                  id="customerDistrict"
                  type="text"
                  className="form-input"
                  value={invoice.customer?.district || ""}
                  onChange={(e) => updateCustomerField("district", e.target.value)}
                  placeholder="e.g. Chikkaballapur (dist)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customerState">State</label>
                <input
                  id="customerState"
                  type="text"
                  className="form-input"
                  value={invoice.customer?.state || ""}
                  onChange={(e) => updateCustomerField("state", e.target.value)}
                  placeholder="e.g. Karnataka / Tamil Nadu"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customerPin">PIN / Postal Code</label>
                <input
                  id="customerPin"
                  type="text"
                  className="form-input"
                  value={invoice.customer?.pincode || ""}
                  onChange={(e) => updateCustomerField("pincode", e.target.value)}
                  placeholder="e.g. 563 125"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customerPhone">Phone Number</label>
                <input
                  id="customerPhone"
                  type="tel"
                  className="form-input"
                  value={invoice.customer?.phone || ""}
                  onChange={(e) => updateCustomerField("phone", e.target.value)}
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customerGstin">GSTIN (if applicable)</label>
                <input
                  id="customerGstin"
                  type="text"
                  className="form-input"
                  value={invoice.customer?.gstin || ""}
                  onChange={(e) => updateCustomerField("gstin", e.target.value)}
                  placeholder="15-character GSTIN"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION C: WORK OR PRODUCT DETAILS */}
        {(activeSection === "all" || activeSection === "items") && (
          <div className="form-card">
            <div className="form-card-header">
              <div className="header-title-wrap">
                <span className="step-badge">3</span>
                <h3>Work or Product Details</h3>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAddItem}
              >
                <Plus size={16} />
                <span>Add Row</span>
              </button>
            </div>

            {validationErrors.items && (
              <div className="alert-banner alert-error" style={{ marginBottom: "14px" }}>
                {validationErrors.items}
              </div>
            )}

            {/* Items Table Form */}
            <div className="line-items-form-table-wrap">
              <table className="line-items-form-table">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "35%" }}>Work Description / Item</th>
                    <th style={{ width: "16%" }}>Date / Period</th>
                    <th style={{ width: "10%" }}>Qty / Count</th>
                    <th style={{ width: "12%" }}>Unit</th>
                    <th style={{ width: "12%" }}>Rate (₹)</th>
                    <th style={{ width: "10%" }}>Amount (₹)</th>
                    <th style={{ width: "8%" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="center bold text-muted">{index + 1}</td>
                      <td>
                        <input
                          type="text"
                          className="form-input table-cell-input"
                          value={item.description || ""}
                          onChange={(e) =>
                            handleItemChange(index, "description", e.target.value)
                          }
                          placeholder="e.g. WEEDING ( 22/09/2026 )"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input table-cell-input"
                          value={item.datePeriod || ""}
                          onChange={(e) =>
                            handleItemChange(index, "datePeriod", e.target.value)
                          }
                          placeholder="22/09/2026"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="form-input table-cell-input center"
                          value={item.quantity === 0 ? "0" : item.quantity || ""}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          list="common-units-list"
                          className="form-input table-cell-input center"
                          value={item.unit || "LABOURS"}
                          onChange={(e) =>
                            handleItemChange(index, "unit", e.target.value)
                          }
                        />
                        <datalist id="common-units-list">
                          {COMMON_UNITS.map((u) => (
                            <option key={u} value={u} />
                          ))}
                        </datalist>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="form-input table-cell-input center"
                          value={item.rate === 0 ? "0" : item.rate || ""}
                          onChange={(e) =>
                            handleItemChange(index, "rate", e.target.value)
                          }
                          placeholder="0.00"
                        />
                      </td>
                      <td className="center bold">
                        ₹{formatINR(item.amount || 0)}
                      </td>
                      <td className="center actions-cell">
                        <button
                          type="button"
                          className="icon-action-btn"
                          onClick={() => handleDuplicateItem(index)}
                          title="Duplicate item"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-action-btn delete-btn"
                          onClick={() => handleRemoveItem(index)}
                          disabled={invoice.items?.length <= 1}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Adjustments Grid */}
            <div className="calculations-panel">
              <div className="adjustments-col">
                <h4 className="subheading">Discounts, Taxes & Charges</h4>

                {/* Discount */}
                <div className="form-grid grid-2">
                  <div className="form-group">
                    <label>Discount</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="form-input"
                        value={invoice.discount || 0}
                        onChange={(e) => updateField("discount", e.target.value)}
                      />
                      <select
                        className="form-select"
                        style={{ width: "95px" }}
                        value={invoice.discountType || "amount"}
                        onChange={(e) => updateField("discountType", e.target.value)}
                      >
                        <option value="amount">₹ (Fixed)</option>
                        <option value="percent">% (Perc)</option>
                      </select>
                    </div>
                  </div>

                  {/* Tax Configuration */}
                  <div className="form-group">
                    <label>Taxation Mode</label>
                    <select
                      className="form-select"
                      value={invoice.taxType || "none"}
                      onChange={(e) => updateField("taxType", e.target.value)}
                    >
                      <option value="none">No Tax (Non-GST / Exempt)</option>
                      <option value="gst">Single GST %</option>
                      <option value="cgst_sgst">Intra-state CGST + SGST</option>
                      <option value="igst">Inter-state IGST</option>
                    </select>
                  </div>

                  {invoice.taxType && invoice.taxType !== "none" && (
                    <div className="form-group">
                      <label>Tax Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        className="form-input"
                        value={invoice.taxRate || 0}
                        onChange={(e) => updateField("taxRate", e.target.value)}
                        placeholder="e.g. 18 or 5"
                      />
                    </div>
                  )}

                  {/* Additional Charges */}
                  <div className="form-group">
                    <label>Additional Charges (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="form-input"
                      value={invoice.additionalCharges || 0}
                      onChange={(e) => updateField("additionalCharges", e.target.value)}
                    />
                  </div>

                  {invoice.additionalCharges > 0 && (
                    <div className="form-group grid-span-2">
                      <label>Additional Charges Label</label>
                      <input
                        type="text"
                        className="form-input"
                        value={invoice.additionalChargesLabel || "Additional Charges"}
                        onChange={(e) =>
                          updateField("additionalChargesLabel", e.target.value)
                        }
                        placeholder="e.g. Transport & Handling Charges"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Total Summary Card */}
              <div className="summary-breakdown-card">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <strong>₹{formatINR(totals.subtotal)}</strong>
                </div>

                {totals.discountAmount > 0 && (
                  <div className="summary-row text-red">
                    <span>Discount:</span>
                    <span>- ₹{formatINR(totals.discountAmount)}</span>
                  </div>
                )}

                {totals.cgstAmount > 0 ? (
                  <>
                    <div className="summary-row">
                      <span>CGST ({invoice.taxRate / 2}%):</span>
                      <span>₹{formatINR(totals.cgstAmount)}</span>
                    </div>
                    <div className="summary-row">
                      <span>SGST ({invoice.taxRate / 2}%):</span>
                      <span>₹{formatINR(totals.sgstAmount)}</span>
                    </div>
                  </>
                ) : totals.taxAmount > 0 ? (
                  <div className="summary-row">
                    <span>GST ({invoice.taxRate}%):</span>
                    <span>₹{formatINR(totals.taxAmount)}</span>
                  </div>
                ) : null}

                {totals.additionalCharges > 0 && (
                  <div className="summary-row">
                    <span>{invoice.additionalChargesLabel || "Extra Charges"}:</span>
                    <span>₹{formatINR(totals.additionalCharges)}</span>
                  </div>
                )}

                <div className="summary-row grand-total-line">
                  <span>Grand Total:</span>
                  <span className="grand-total-amount">
                    ₹{formatINR(totals.grandTotal)}
                  </span>
                </div>

                <div className="amount-in-words-box">
                  <div className="words-title">Amount in Words:</div>
                  <div className="words-content">{totals.amountInWords}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION D: ADDITIONAL INFORMATION & TERMS */}
        {(activeSection === "all" || activeSection === "additional") && (
          <div className="form-card">
            <div className="form-card-header">
              <div className="header-title-wrap">
                <span className="step-badge">4</span>
                <h3>Additional Information & Document References</h3>
              </div>
            </div>

            <div className="form-grid grid-2">
              <div className="form-group grid-span-2">
                <label htmlFor="notes">Remarks / Special Notes</label>
                <textarea
                  id="notes"
                  rows={2}
                  className="form-textarea"
                  value={invoice.notes || ""}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Optional remarks, payment bank info, or instructions"
                />
              </div>

              <div className="form-group">
                <label htmlFor="supportingDocRef">Supporting Document Reference</label>
                <input
                  id="supportingDocRef"
                  type="text"
                  className="form-input"
                  value={invoice.supportingDocRef || ""}
                  onChange={(e) => updateField("supportingDocRef", e.target.value)}
                  placeholder="e.g. Quotation ref QT-26-0001"
                />
              </div>

              <div className="form-group">
                <label htmlFor="attachmentDetails">Attachment Details</label>
                <input
                  id="attachmentDetails"
                  type="text"
                  className="form-input"
                  value={invoice.attachmentDetails || ""}
                  onChange={(e) => updateField("attachmentDetails", e.target.value)}
                  placeholder="e.g. Work log sheet attached"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
