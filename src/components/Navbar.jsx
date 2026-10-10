import React from "react";
import {
  FileText,
  FolderOpen,
  Settings,
  Users,
  PlusCircle,
  Save,
  Download,
  FileDown,
  Printer
} from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  savedInvoicesCount,
  onNewInvoice,
  onSaveInvoice,
  onDownloadPDF,
  onDownloadWord,
  onPrint,
  isDirty,
  isGenerating
}) {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Area */}
        <div className="header-brand" onClick={() => setActiveTab("editor")}>
          <div className="logo-badge">
            <span className="logo-badge-prefix">IGO</span>
            <span className="logo-badge-text">DOCS</span>
          </div>
          <div className="brand-text">
            <h1 className="brand-title">IGO Document Generator</h1>
            <p className="brand-subtitle">IGO GROUP OF COMPANIES • Invoice & Billing Suite</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <button
            className={`nav-btn ${activeTab === "editor" ? "active" : ""}`}
            onClick={() => setActiveTab("editor")}
          >
            <FileText size={18} />
            <span>Invoice Editor</span>
            {isDirty && <span className="dirty-dot" title="Unsaved changes" />}
          </button>

          <button
            className={`nav-btn ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            <FolderOpen size={18} />
            <span>Saved Invoices</span>
            {savedInvoicesCount > 0 && (
              <span className="nav-badge">{savedInvoicesCount}</span>
            )}
          </button>

          <button
            className={`nav-btn ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            <Users size={18} />
            <span>Customer Directory</span>
          </button>

          <button
            className={`nav-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={18} />
            <span>Company Settings</span>
          </button>
        </nav>

        {/* Global Action Buttons */}
        <div className="header-actions">
          {activeTab === "editor" && (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onNewInvoice}
                title="Create a fresh blank invoice"
              >
                <PlusCircle size={16} />
                <span>New</span>
              </button>

              <button
                type="button"
                className={`btn btn-save btn-sm ${isDirty ? "pulse-subtle" : ""}`}
                onClick={onSaveInvoice}
                title="Save current invoice"
              >
                <Save size={16} />
                <span>{isDirty ? "Save*" : "Saved"}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onPrint}
                title="Print current invoice"
              >
                <Printer size={16} />
                <span>Print</span>
              </button>

              <button
                type="button"
                className="btn btn-pdf btn-sm"
                onClick={onDownloadPDF}
                disabled={isGenerating}
                title="Download print-ready PDF"
              >
                <FileDown size={16} />
                <span>PDF</span>
              </button>

              <button
                type="button"
                className="btn btn-word btn-sm"
                onClick={onDownloadWord}
                disabled={isGenerating}
                title="Download editable Microsoft Word .docx"
              >
                <Download size={16} />
                <span>Word</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
