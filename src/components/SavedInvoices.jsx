import React, { useState, useMemo } from "react";
import {
  Search,
  PlusCircle,
  Eye,
  Edit3,
  Copy,
  Trash2,
  FileDown,
  Download,
  FileText,
  IndianRupee,
  Layers
} from "lucide-react";
import { formatINR } from "../utils/numberToWords.js";
import { calculateInvoiceTotals } from "../utils/calculations.js";

export default function SavedInvoices({
  invoices = [],
  onNewInvoice,
  onEditInvoice,
  onViewInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onDownloadPDF,
  onDownloadWord
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
        (inv.customer?.name && inv.customer.name.toLowerCase().includes(q)) ||
        (inv.customer?.city && inv.customer.city.toLowerCase().includes(q));

      const matchStart = !startDate || (inv.invoiceDate && inv.invoiceDate >= startDate);
      const matchEnd = !endDate || (inv.invoiceDate && inv.invoiceDate <= endDate);

      return matchSearch && matchStart && matchEnd;
    });
  }, [invoices, searchTerm, startDate, endDate]);

  // Aggregate stats
  const totalBilled = useMemo(() => {
    return filteredInvoices.reduce((acc, inv) => {
      const totals = calculateInvoiceTotals(inv);
      return acc + (totals.grandTotal || 0);
    }, 0);
  }, [filteredInvoices]);

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="saved-invoices-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Document Management</h2>
          <p className="page-subtitle">
            Manage, duplicate, search, and export previously generated invoices
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNewInvoice}
        >
          <PlusCircle size={16} />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="metrics-banner">
        <div className="metric-card">
          <div className="metric-icon-wrap navy">
            <FileText size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Documents</span>
            <span className="metric-value">{invoices.length}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap emerald">
            <IndianRupee size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Billed (Visible)</span>
            <span className="metric-value">₹{formatINR(totalBilled)}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap purple">
            <Layers size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Matching Records</span>
            <span className="metric-value">{filteredInvoices.length}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="filters-card">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by invoice number, customer name, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
            >
              ×
            </button>
          )}
        </div>

        <div className="date-filter-group">
          <div className="date-input-wrap">
            <label>From:</label>
            <input
              type="date"
              className="date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="date-input-wrap">
            <label>To:</label>
            <input
              type="date"
              className="date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {(searchTerm || startDate || endDate) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Invoices List / Table */}
      {filteredInvoices.length === 0 ? (
        <div className="empty-state-box">
          <FileText size={48} className="empty-icon text-muted" />
          <h3>No invoices found</h3>
          <p>
            {invoices.length === 0
              ? "You haven't saved any invoices yet. Create your first invoice now!"
              : "No invoices match the current search filters."}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={invoices.length === 0 ? onNewInvoice : clearFilters}
          >
            {invoices.length === 0 ? "Create New Invoice" : "Reset Filters"}
          </button>
        </div>
      ) : (
        <div className="invoices-table-card">
          <table className="invoices-table">
            <thead>
              <tr>
                <th style={{ width: "12%" }}>Invoice No.</th>
                <th style={{ width: "12%" }}>Date</th>
                <th style={{ width: "26%" }}>Customer Name</th>
                <th style={{ width: "18%" }}>Summary / Items</th>
                <th style={{ width: "14%" }} className="right">Grand Total</th>
                <th style={{ width: "18%" }} className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => {
                const totals = calculateInvoiceTotals(inv);
                const itemsCount = inv.items?.length || 0;
                const firstItemDesc =
                  itemsCount > 0 ? inv.items[0].description : "No items";

                return (
                  <tr key={inv.id} className="invoice-row">
                    <td>
                      <span className="invoice-badge">
                        #{inv.invoiceNumber || "--"}
                      </span>
                    </td>
                    <td>{inv.invoiceDate || "--"}</td>
                    <td>
                      <div className="customer-cell-wrap">
                        <strong className="customer-cell-name">
                          {inv.customer?.name || "Unnamed Customer"}
                        </strong>
                        {inv.customer?.city && (
                          <span className="customer-cell-sub">
                            {inv.customer.city}
                            {inv.customer.state ? `, ${inv.customer.state}` : ""}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="items-summary-wrap">
                        <span className="items-count-badge">
                          {itemsCount} {itemsCount === 1 ? "item" : "items"}
                        </span>
                        <span className="items-desc-preview" title={firstItemDesc}>
                          {firstItemDesc}
                        </span>
                      </div>
                    </td>
                    <td className="right bold font-numeric">
                      ₹{formatINR(totals.grandTotal)}
                    </td>
                    <td className="center">
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className="btn-icon-table"
                          onClick={() => onViewInvoice(inv)}
                          title="View / Live Preview"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon-table"
                          onClick={() => onEditInvoice(inv)}
                          title="Edit Invoice"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon-table"
                          onClick={() => onDuplicateInvoice(inv.id)}
                          title="Duplicate Invoice"
                        >
                          <Copy size={16} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon-table btn-pdf-table"
                          onClick={() => onDownloadPDF(inv)}
                          title="Download PDF"
                        >
                          <FileDown size={16} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon-table btn-word-table"
                          onClick={() => onDownloadWord(inv)}
                          title="Download Word (.docx)"
                        >
                          <Download size={16} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon-table delete-table-btn"
                          onClick={() => onDeleteInvoice(inv.id, inv.invoiceNumber)}
                          title="Delete Invoice"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
