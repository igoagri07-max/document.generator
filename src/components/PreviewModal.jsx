import React, { useState } from "react";
import { X, FileDown, Download, Printer } from "lucide-react";
import InvoicePreview from "./InvoicePreview.jsx";

export default function PreviewModal({
  isOpen,
  onClose,
  invoice,
  companySettings,
  onDownloadPDF,
  onDownloadWord,
  onPrint
}) {
  const [zoom, setZoom] = useState(1.15);

  if (!isOpen) return null;

  return (
    <div className="preview-modal-backdrop" onClick={onClose}>
      <div className="preview-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <div className="flex items-center gap-2">
            <span className="live-pill">EXPANDED INSPECTION</span>
            <span className="modal-title">
              Invoice #{invoice.invoiceNumber || "--"} • {invoice.customer?.name || "Customer"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onPrint}
            >
              <Printer size={15} />
              <span>Print</span>
            </button>

            <button
              type="button"
              className="btn btn-pdf btn-sm"
              onClick={onDownloadPDF}
            >
              <FileDown size={15} />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              className="btn btn-word btn-sm"
              onClick={onDownloadWord}
            >
              <Download size={15} />
              <span>Download Word</span>
            </button>

            <button
              type="button"
              className="btn-icon close-modal-icon-btn"
              onClick={onClose}
              title="Close Fullscreen Preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="preview-modal-body">
          <InvoicePreview
            invoice={invoice}
            companySettings={companySettings}
            onDownloadPDF={onDownloadPDF}
            onDownloadWord={onDownloadWord}
            onPrint={onPrint}
            zoom={zoom}
            setZoom={setZoom}
          />
        </div>
      </div>
    </div>
  );
}
