import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar.jsx";
import InvoiceForm from "./components/InvoiceForm.jsx";
import InvoicePreview from "./components/InvoicePreview.jsx";
import SavedInvoices from "./components/SavedInvoices.jsx";
import CompanySettings from "./components/CompanySettings.jsx";
import CustomerDirectory from "./components/CustomerDirectory.jsx";
import PreviewModal from "./components/PreviewModal.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";
import Toast from "./components/Toast.jsx";

import { storageService } from "./services/storageService.js";
import { downloadInvoicePDF } from "./utils/pdfGenerator.js";
import { downloadInvoiceWord } from "./utils/wordGenerator.js";
import { INITIAL_SAMPLE_INVOICE } from "./constants/defaultData.js";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("editor");
  const [companySettings, setCompanySettings] = useState(() =>
    storageService.getCompanySettings()
  );
  const [invoices, setInvoices] = useState(() => storageService.getInvoices());
  const [customers, setCustomers] = useState(() =>
    storageService.getCustomers()
  );

  // Current active invoice in the editor
  const [currentInvoice, setCurrentInvoice] = useState(() => {
    const list = storageService.getInvoices();
    return list.length > 0 ? { ...list[0] } : { ...INITIAL_SAMPLE_INVOICE };
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [isExpandedPreview, setIsExpandedPreview] = useState(false);

  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    confirmVariant: "danger",
    onConfirm: () => {}
  });
  const [validationErrors, setValidationErrors] = useState({});

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  // Sync invoices and customers from storage
  const reloadInvoices = useCallback(() => {
    setInvoices(storageService.getInvoices());
  }, []);

  const reloadCustomers = useCallback(() => {
    setCustomers(storageService.getCustomers());
  }, []);

  // Invoice change handler
  const handleInvoiceChange = (updated) => {
    setCurrentInvoice(updated);
    setIsDirty(true);
    // Clear validation errors on field update
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors({});
    }
  };

  // Validation
  const validateInvoice = (inv) => {
    const errors = {};
    if (!inv.invoiceNumber || !inv.invoiceNumber.trim()) {
      errors.invoiceNumber = "Invoice number is required";
    }
    if (!inv.invoiceDate || !inv.invoiceDate.trim()) {
      errors.invoiceDate = "Invoice date is required";
    }
    if (!inv.customer?.name || !inv.customer.name.trim()) {
      errors.customerName = "Customer name is required";
    }

    const items = inv.items || [];
    if (!items.length) {
      errors.items = "Please add at least one line item";
    } else {
      const hasValidItem = items.some(
        (it) => it.description && it.description.trim() && Number(it.quantity) > 0
      );
      if (!hasValidItem) {
        errors.items =
          "At least one item must have a valid description and quantity > 0";
      }
    }

    return errors;
  };

  // Auto-suggest next invoice number
  const handleSuggestNextNumber = () => {
    const nextNum = storageService.suggestNextInvoiceNumber();
    handleInvoiceChange({ ...currentInvoice, invoiceNumber: nextNum });
    showToast(`Suggested next invoice number: #${nextNum}`, "success");
  };

  // Create New Invoice
  const startNewInvoice = () => {
    const nextNum = storageService.suggestNextInvoiceNumber();
    const todayStr = new Date().toISOString().slice(0, 10);

    const blankInvoice = {
      id: "inv-" + Date.now(),
      invoiceNumber: nextNum,
      invoiceDate: todayStr,
      deliveryNote: "",
      paymentTerms: "Bank Transfer",
      supplierRef: "",
      otherReference: "",
      buyersOrderNo: "",
      orderDate: "",
      dispatchDocNo: "",
      vehicleNo: "",
      dispatchedThrough: "",
      destination: "",
      termsOfDelivery: "",
      customer: {
        id: "",
        name: "",
        contactPerson: "",
        address: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
        phone: "",
        email: "",
        gstin: ""
      },
      items: [
        {
          id: "item-" + Date.now(),
          slNo: 1,
          description: "",
          datePeriod: "",
          quantity: 1,
          unit: "LABOURS",
          rate: 0,
          amount: 0
        }
      ],
      discount: 0,
      taxRate: 0,
      taxType: "none",
      additionalCharges: 0,
      additionalChargesLabel: "Additional Charges",
      notes: "",
      supportingDocRef: "",
      attachmentDetails: "",
      companySnapshot: { ...companySettings },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentInvoice(blankInvoice);
    setIsDirty(false);
    setValidationErrors({});
    setActiveTab("editor");
    showToast(`New blank invoice initialized (#${nextNum})`, "success");
  };

  const handleNewInvoiceClick = () => {
    if (isDirty) {
      setConfirmModal({
        isOpen: true,
        title: "Discard unsaved changes?",
        message:
          "You have unsaved edits in the current invoice. Are you sure you want to create a new invoice and discard these changes?",
        confirmLabel: "Discard & Create New",
        confirmVariant: "danger",
        onConfirm: () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          startNewInvoice();
        }
      });
    } else {
      startNewInvoice();
    }
  };

  // Save Invoice
  const performSave = (inv) => {
    const saved = storageService.saveInvoice(inv, companySettings);
    setCurrentInvoice(saved);
    setIsDirty(false);
    reloadInvoices();
    reloadCustomers();
    showToast(`Invoice #${saved.invoiceNumber} saved successfully!`, "success");
  };

  const handleSaveInvoice = () => {
    const errors = validateInvoice(currentInvoice);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast("Please fill in all required fields before saving.", "error");
      return;
    }

    // Check for duplicate invoice number
    const isDuplicate = storageService.checkInvoiceNumberExists(
      currentInvoice.invoiceNumber,
      currentInvoice.id
    );

    if (isDuplicate) {
      setConfirmModal({
        isOpen: true,
        title: "Duplicate Invoice Number Detected",
        message: `An invoice with number "#${currentInvoice.invoiceNumber}" already exists in your saved documents. Do you want to proceed and save with this invoice number?`,
        confirmLabel: "Yes, Save Anyway",
        confirmVariant: "warning",
        onConfirm: () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          performSave(currentInvoice);
        }
      });
    } else {
      performSave(currentInvoice);
    }
  };

  // Edit Invoice from list
  const handleEditInvoice = (inv) => {
    if (isDirty) {
      setConfirmModal({
        isOpen: true,
        title: "Unsaved Changes",
        message:
          "You have unsaved changes in the editor. Do you want to discard them and load this invoice?",
        confirmLabel: "Discard & Open",
        confirmVariant: "danger",
        onConfirm: () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setCurrentInvoice({ ...inv });
          setIsDirty(false);
          setActiveTab("editor");
        }
      });
    } else {
      setCurrentInvoice({ ...inv });
      setIsDirty(false);
      setActiveTab("editor");
    }
  };

  // View Invoice in expanded preview
  const handleViewInvoice = (inv) => {
    setCurrentInvoice({ ...inv });
    setIsExpandedPreview(true);
  };

  // Duplicate Invoice
  const handleDuplicateInvoice = (id) => {
    const duplicated = storageService.duplicateInvoice(id);
    if (duplicated) {
      reloadInvoices();
      setCurrentInvoice(duplicated);
      setIsDirty(false);
      setActiveTab("editor");
      showToast(
        `Duplicated as Invoice #${duplicated.invoiceNumber}!`,
        "success"
      );
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = (id, number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Invoice?",
      message: `Are you sure you want to permanently delete Invoice #${number}? This action cannot be undone.`,
      confirmLabel: "Delete Permanently",
      confirmVariant: "danger",
      onConfirm: () => {
        storageService.deleteInvoice(id);
        reloadInvoices();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`Invoice #${number} deleted.`, "info");

        // If deleted current invoice, switch to another
        if (currentInvoice.id === id) {
          const remaining = storageService.getInvoices();
          if (remaining.length > 0) {
            setCurrentInvoice({ ...remaining[0] });
          } else {
            startNewInvoice();
          }
        }
      }
    });
  };

  // Download PDF
  const handleDownloadPDF = async (targetInvoice = null) => {
    const inv = targetInvoice || currentInvoice;
    const errors = validateInvoice(inv);
    if (Object.keys(errors).length > 0 && !targetInvoice) {
      setValidationErrors(errors);
      showToast("Please resolve validation errors before downloading.", "error");
      return;
    }

    try {
      setIsGenerating(true);
      const filename = downloadInvoicePDF(inv, companySettings);
      showToast(`Downloaded ${filename}`, "success");
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Word
  const handleDownloadWord = async (targetInvoice = null) => {
    const inv = targetInvoice || currentInvoice;
    const errors = validateInvoice(inv);
    if (Object.keys(errors).length > 0 && !targetInvoice) {
      setValidationErrors(errors);
      showToast("Please resolve validation errors before downloading.", "error");
      return;
    }

    try {
      setIsGenerating(true);
      const filename = await downloadInvoiceWord(inv, companySettings);
      showToast(`Downloaded ${filename}`, "success");
    } catch (err) {
      console.error("Word generation failed:", err);
      showToast("Failed to generate Word document. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Company Settings
  const handleSaveSettings = (newSettings) => {
    const saved = storageService.saveCompanySettings(newSettings);
    setCompanySettings(saved);
    showToast("Company settings updated successfully!", "success");
  };

  const handleResetSettings = () => {
    setConfirmModal({
      isOpen: true,
      title: "Reset Company Settings?",
      message:
        "This will restore the original IGO GROUP OF COMPANIES default identity, logo, and declaration.",
      confirmLabel: "Reset to Defaults",
      confirmVariant: "danger",
      onConfirm: () => {
        const reset = storageService.resetCompanySettings();
        setCompanySettings(reset);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast("Settings reset to default IGO identity.", "info");
      }
    });
  };

  // Customer Directory
  const handleSaveCustomer = (cust) => {
    storageService.saveCustomer(cust);
    reloadCustomers();
    showToast(`Customer "${cust.name}" saved!`, "success");
  };

  const handleDeleteCustomer = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Customer?",
      message: `Are you sure you want to delete "${name}" from your customer directory?`,
      confirmLabel: "Delete Customer",
      confirmVariant: "danger",
      onConfirm: () => {
        storageService.deleteCustomer(id);
        reloadCustomers();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`Customer "${name}" removed.`, "info");
      }
    });
  };

  const handleCreateInvoiceForCustomer = (cust) => {
    const nextNum = storageService.suggestNextInvoiceNumber();
    const todayStr = new Date().toISOString().slice(0, 10);

    const newInv = {
      id: "inv-" + Date.now(),
      invoiceNumber: nextNum,
      invoiceDate: todayStr,
      deliveryNote: "",
      paymentTerms: "Bank Transfer",
      supplierRef: "",
      otherReference: "",
      buyersOrderNo: "",
      orderDate: "",
      dispatchDocNo: "",
      vehicleNo: "",
      dispatchedThrough: "",
      destination: cust.city || "",
      termsOfDelivery: "",
      customer: { ...cust },
      items: [
        {
          id: "item-" + Date.now(),
          slNo: 1,
          description: "",
          datePeriod: "",
          quantity: 1,
          unit: "LABOURS",
          rate: 0,
          amount: 0
        }
      ],
      discount: 0,
      taxRate: 0,
      taxType: "none",
      additionalCharges: 0,
      additionalChargesLabel: "Additional Charges",
      notes: "",
      supportingDocRef: "",
      attachmentDetails: "",
      companySnapshot: { ...companySettings },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentInvoice(newInv);
    setIsDirty(false);
    setActiveTab("editor");
    showToast(`New invoice created for ${cust.name}`, "success");
  };

  // Warning when leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <div className="app-root">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (isDirty && activeTab === "editor" && tab !== "editor") {
            setConfirmModal({
              isOpen: true,
              title: "Unsaved Changes",
              message:
                "You have unsaved edits in the invoice editor. Do you want to leave anyway?",
              confirmLabel: "Leave Editor",
              confirmVariant: "danger",
              onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                setActiveTab(tab);
              }
            });
          } else {
            setActiveTab(tab);
          }
        }}
        savedInvoicesCount={invoices.length}
        onNewInvoice={handleNewInvoiceClick}
        onSaveInvoice={handleSaveInvoice}
        onDownloadPDF={() => handleDownloadPDF()}
        onDownloadWord={() => handleDownloadWord()}
        onPrint={handlePrint}
        isDirty={isDirty}
        isGenerating={isGenerating}
      />

      {/* Main Content Area */}
      <main className="app-main-content">
        {activeTab === "editor" && (
          <div className="split-workspace">
            {/* Left Column: Form */}
            <div className="workspace-pane form-pane">
              <InvoiceForm
                invoice={currentInvoice}
                onChange={handleInvoiceChange}
                savedCustomers={customers}
                onSuggestNextNumber={handleSuggestNextNumber}
                validationErrors={validationErrors}
              />
            </div>

            {/* Right Column: Live Document Preview */}
            <div className="workspace-pane preview-pane">
              <InvoicePreview
                invoice={currentInvoice}
                companySettings={companySettings}
                onDownloadPDF={() => handleDownloadPDF()}
                onDownloadWord={() => handleDownloadWord()}
                onPrint={handlePrint}
                onExpand={() => setIsExpandedPreview(true)}
                zoom={previewZoom}
                setZoom={setPreviewZoom}
              />
            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <div className="page-container">
            <SavedInvoices
              invoices={invoices}
              onNewInvoice={handleNewInvoiceClick}
              onEditInvoice={handleEditInvoice}
              onViewInvoice={handleViewInvoice}
              onDuplicateInvoice={handleDuplicateInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onDownloadPDF={(inv) => handleDownloadPDF(inv)}
              onDownloadWord={(inv) => handleDownloadWord(inv)}
            />
          </div>
        )}

        {activeTab === "customers" && (
          <div className="page-container">
            <CustomerDirectory
              customers={customers}
              onSaveCustomer={handleSaveCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onCreateInvoiceForCustomer={handleCreateInvoiceForCustomer}
            />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="page-container">
            <CompanySettings
              settings={companySettings}
              onSaveSettings={handleSaveSettings}
              onResetSettings={handleResetSettings}
            />
          </div>
        )}
      </main>

      {/* Fullscreen Expanded Preview Modal */}
      <PreviewModal
        isOpen={isExpandedPreview}
        onClose={() => setIsExpandedPreview(false)}
        invoice={currentInvoice}
        companySettings={companySettings}
        onDownloadPDF={() => handleDownloadPDF()}
        onDownloadWord={() => handleDownloadWord()}
        onPrint={handlePrint}
      />

      {/* Confirmation Dialog Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Notification Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
