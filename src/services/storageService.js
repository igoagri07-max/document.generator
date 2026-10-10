import {
  DEFAULT_COMPANY_SETTINGS,
  INITIAL_SAMPLE_INVOICE,
  INITIAL_CUSTOMERS
} from "../constants/defaultData";

const SETTINGS_KEY = "igo_company_settings";
const INVOICES_KEY = "igo_saved_invoices";
const CUSTOMERS_KEY = "igo_saved_customers";

function safeGet(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
    return false;
  }
}

export const storageService = {
  // --- Company Settings ---
  getCompanySettings() {
    const existing = safeGet(SETTINGS_KEY, null);
    if (!existing) {
      safeSet(SETTINGS_KEY, DEFAULT_COMPANY_SETTINGS);
      return { ...DEFAULT_COMPANY_SETTINGS };
    }
    return { ...DEFAULT_COMPANY_SETTINGS, ...existing };
  },

  saveCompanySettings(settings) {
    const updated = { ...settings, updatedAt: new Date().toISOString() };
    safeSet(SETTINGS_KEY, updated);
    return updated;
  },

  resetCompanySettings() {
    safeSet(SETTINGS_KEY, DEFAULT_COMPANY_SETTINGS);
    return { ...DEFAULT_COMPANY_SETTINGS };
  },

  // --- Invoices ---
  getInvoices() {
    const existing = safeGet(INVOICES_KEY, null);
    if (!existing) {
      safeSet(INVOICES_KEY, [INITIAL_SAMPLE_INVOICE]);
      return [INITIAL_SAMPLE_INVOICE];
    }
    return existing;
  },

  getInvoiceById(id) {
    const invoices = this.getInvoices();
    return invoices.find((inv) => inv.id === id) || null;
  },

  saveInvoice(invoice, companySettings) {
    const invoices = this.getInvoices();
    const now = new Date().toISOString();

    // Attach snapshot of current company settings if invoice doesn't have one
    const snapshot = invoice.companySnapshot || { ...(companySettings || this.getCompanySettings()) };

    const cleanInvoice = {
      ...invoice,
      companySnapshot: snapshot,
      updatedAt: now
    };

    const existingIndex = invoices.findIndex((inv) => inv.id === invoice.id);
    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...invoices];
      updatedList[existingIndex] = cleanInvoice;
    } else {
      cleanInvoice.createdAt = now;
      updatedList = [cleanInvoice, ...invoices];
    }

    safeSet(INVOICES_KEY, updatedList);

    // Also auto-save customer to customers directory if name is present
    if (cleanInvoice.customer && cleanInvoice.customer.name) {
      this.saveCustomer(cleanInvoice.customer);
    }

    return cleanInvoice;
  },

  deleteInvoice(id) {
    const invoices = this.getInvoices();
    const updated = invoices.filter((inv) => inv.id !== id);
    safeSet(INVOICES_KEY, updated);
    return true;
  },

  duplicateInvoice(id) {
    const target = this.getInvoiceById(id);
    if (!target) return null;

    const nextNumber = this.suggestNextInvoiceNumber();
    const now = new Date().toISOString();
    const todayStr = now.slice(0, 10);

    const duplicated = {
      ...JSON.parse(JSON.stringify(target)),
      id: "inv-" + Date.now(),
      invoiceNumber: nextNumber,
      invoiceDate: todayStr,
      createdAt: now,
      updatedAt: now
    };

    const invoices = this.getInvoices();
    safeSet(INVOICES_KEY, [duplicated, ...invoices]);
    return duplicated;
  },

  checkInvoiceNumberExists(number, excludeId = null) {
    if (!number) return false;
    const invoices = this.getInvoices();
    const trimmed = String(number).trim().toLowerCase();
    return invoices.some(
      (inv) => inv.id !== excludeId && String(inv.invoiceNumber).trim().toLowerCase() === trimmed
    );
  },

  suggestNextInvoiceNumber() {
    const invoices = this.getInvoices();
    if (!invoices.length) return "01";

    let maxNum = 0;
    let prefix = "";
    let padLength = 2;

    for (const inv of invoices) {
      const numStr = String(inv.invoiceNumber || "").trim();
      const match = numStr.match(/^(.*?)(\d+)$/);
      if (match) {
        const p = match[1];
        const digits = match[2];
        const val = parseInt(digits, 10);
        if (val > maxNum) {
          maxNum = val;
          prefix = p;
          padLength = digits.length;
        }
      }
    }

    const nextVal = maxNum + 1;
    return `${prefix}${String(nextVal).padStart(padLength, "0")}`;
  },

  // --- Customers Directory ---
  getCustomers() {
    const existing = safeGet(CUSTOMERS_KEY, null);
    if (!existing) {
      safeSet(CUSTOMERS_KEY, INITIAL_CUSTOMERS);
      return INITIAL_CUSTOMERS;
    }
    return existing;
  },

  saveCustomer(customer) {
    if (!customer || !customer.name || !customer.name.trim()) return;
    const customers = this.getCustomers();
    const trimmedName = customer.name.trim().toLowerCase();

    const existingIndex = customers.findIndex(
      (c) => (customer.id && c.id === customer.id) || c.name.trim().toLowerCase() === trimmedName
    );

    const cleanCust = {
      id: customer.id || "cust-" + Date.now(),
      name: customer.name.trim(),
      contactPerson: customer.contactPerson || "",
      address: customer.address || "",
      city: customer.city || "",
      district: customer.district || "",
      state: customer.state || "",
      pincode: customer.pincode || "",
      phone: customer.phone || "",
      email: customer.email || "",
      gstin: customer.gstin || "",
      updatedAt: new Date().toISOString()
    };

    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...customers];
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...cleanCust };
    } else {
      updatedList = [cleanCust, ...customers];
    }

    safeSet(CUSTOMERS_KEY, updatedList);
    return cleanCust;
  },

  deleteCustomer(id) {
    const customers = this.getCustomers();
    const updated = customers.filter((c) => c.id !== id);
    safeSet(CUSTOMERS_KEY, updated);
    return true;
  }
};
