# IGO Document Generator

A simple, fully functional, professional web application designed for **IGO GROUP OF COMPANIES** to create, preview, manage, and download business invoices, labour salary bills, and service documents in both **print-ready PDF** and **genuine editable Microsoft Word (.docx)** formats.

The application layout is modeled directly on the official reference invoice: **"Mrs. Sukavya Deepak Site Weeding Labours Salary Invoice"**, preserving the company's identity, genuine logo, multi-box metadata grids, line-item tables, Indian currency formatting, legal declarations, and authorised signatory sections.

---

## 🌟 Key Features

### 1. Default Company Identity & Central Settings
* **Company Name:** `IGO GROUP OF COMPANIES`
* **Registered Address:** `VGP 2nd Street, ECR, opposite Oru Kerala Story, Uthandi, Chennai, Kanathur Reddykuppam, Tamil Nadu – 603112.`
* **Official Email:** `ceo@igogroups.com`
* **GSTIN:** `33AXPPN8050R1ZM`
* **Official Phone:** `+91 7397789803`
* **Genuine Company Logo:** Directly integrated genuine IGO logo with India map gradient and green leaves. Also provides custom logo upload and restore options.
* **Authorised Signatory Section:** Standard bottom-right signatory box (`For IGO Agric Products` / `For IGO GROUP OF COMPANIES`) with designation (`Authorised Signatory`) and optional signature image upload.
* **Standard Legal Declaration:** *"We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct."*
* **Company Settings Page:** Update company identity anytime. Settings persist and apply to all future documents while preserving historical snapshots on previously saved invoices.

### 2. Comprehensive Invoice Form
* **Section A: Invoice & Order Details**
  * Auto-suggests the next invoice number (e.g. `05` -> `06`) with smart numeric and prefix detection.
  * Invoice date picker.
  * Mode / terms of payment (Bank Transfer, NEFT/RTGS, UPI, Cheque, Cash, etc.).
  * Delivery note, Supplier reference, and Other reference.
  * Buyer's order number and order date.
  * Dispatch document number, Vehicle number, Dispatched through, and Destination.
  * Terms of delivery.
* **Section B: Customer Details (Billed To)**
  * Customer name, contact person / care-of (`C/o. Nagaraj`), street address, city, district, state, PIN code, phone, email, and GSTIN.
  * Instant auto-fill from saved client directory.
* **Section C: Work or Product Details Table**
  * Dynamic line items: Sl No., Work Description / Item, Date or Period (`22/09/2026`), Quantity/Count, Unit (`LABOURS`, `NOS`, `DAYS`, `KGS`, etc.), Rate (₹), and Amount (₹).
  * Add rows, remove rows, and duplicate rows.
  * Automatic real-time row amount calculations.
  * Subtotal calculation.
  * Optional discounts (fixed ₹ or percentage %).
  * Optional and configurable tax rules: Exempt/Non-GST, single GST %, or Intra-state CGST + SGST (taxes are NOT applied automatically when not applicable).
  * Optional additional charges (e.g., Transport, Handling) with customizable label.
  * Grand total in figures and Indian currency words (e.g. `INR FIVE THOUSAND RUPEES ONLY`).
* **Section D: Additional Information**
  * Remarks / Notes, supporting document references, and attachment details.

### 3. Live Split-Screen Document Preview
* Split-screen workspace: Left side is the editable form, right side is the live document preview.
* Stacks vertically on smaller screens and mobile devices.
* Updates reactively in real time with zero latency as any form field is edited.
* Realistic A4 sheet styling with authentic borders matching the reference invoice.
* Zoom in, Zoom out, Reset zoom, and Fullscreen Expanded Preview modal.
* Browser print shortcut (`window.print()`).

### 4. Professional PDF & Genuine Word (.docx) Generation
* **Download PDF:**
  * Clean vector layout using `jspdf`.
  * Preserves genuine company logo, borders, font weights, and alignments.
  * Automatic multi-page pagination with repeated table headers (`WORK DESCRIPTION (Contd.)`) when invoices have many items or long descriptions.
  * Text wrapping prevents overflow or clipping.
* **Download Word (.docx):**
  * Genuine editable `.docx` document generated using the `docx` library.
  * Native Word tables with cell borders, genuine logo embedded in `word/media`, customer block, item rows, declaration, and signatory section.
  * Compatible with Microsoft Word, LibreOffice, Google Docs, and WPS Office.
* Both downloads share the exact same validated invoice data and calculations.
* Clean filenames (e.g., `IGO_Invoice_05.pdf`, `IGO_Invoice_05.docx`).

### 5. Persistent Document & Customer Management
* **Saved Invoices Dashboard:**
  * Metrics banner: Total invoices, total billed amount, matching records.
  * Instant search by invoice number, customer name, or location.
  * Filter by date range (from / to).
  * Actions: View preview, Edit in workspace, Duplicate invoice with next number, Download PDF, Download Word, Delete with confirmation modal.
* **Customer Directory:**
  * Manage client contact records for instant one-click invoice creation.
* **Validation & Safety:**
  * Form validation requiring invoice number, date, customer name, and at least one valid item.
  * Duplicate invoice number detection with confirmation prompt.
  * Unsaved changes warning when switching tabs or closing the window.

---

## 🛠️ Technology Stack
* **Frontend:** React 19, JavaScript (ESM)
* **Build Tool:** Vite
* **Styling:** Custom corporate CSS design system (Navy `#1b365d` & IGO Green `#276749` / `#37a25e`)
* **Icons:** `lucide-react`
* **PDF Generation:** `jspdf`
* **Word Generation:** `docx`
* **File Downloads:** `file-saver` & native Blob URLs
* **Storage:** Modular LocalStorage repository (`storageService.js`) with clean data abstraction

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [npm](https://www.npmjs.com/)

### 1. Installation
Navigate to the project directory:
```bash
cd C:\Users\igoba\.gemini\antigravity\scratch\igo-document-generator
npm install
```

### 2. Run Locally in Development Mode
Start the Vite local development server:
```bash
npm run dev
```
Open your browser and navigate to the local URL (typically `http://localhost:5173`).

### 3. Production Build
To create an optimized production build:
```bash
npm run build
```
The compiled assets will be in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

### 4. Run Automated Test Suite
To execute the automated test suite verifying calculations, currency words, multi-page PDF generation, and Word DOCX generation:
```bash
node test_suite.js
```

---

## 📂 Project Architecture

```
igo-document-generator/
├── public/
│   ├── igo-logo.jpg              # Genuine IGO GROUP logo
│   └── igo-logo-extracted.jpg    # Extracted logo from reference PDF
├── src/
│   ├── components/
│   │   ├── Navbar.jsx            # Header navigation & quick download buttons
│   │   ├── InvoiceForm.jsx       # 4-section invoice & line-items form
│   │   ├── InvoicePreview.jsx    # Real-time A4 sheet invoice preview
│   │   ├── SavedInvoices.jsx     # Document management dashboard with search/filters
│   │   ├── CompanySettings.jsx   # Central company identity & signatory configuration
│   │   ├── CustomerDirectory.jsx # Client address book for instant auto-fill
│   │   ├── PreviewModal.jsx      # Fullscreen expanded inspection modal
│   │   ├── ConfirmModal.jsx      # Confirmation modal for delete/unsaved changes
│   │   └── Toast.jsx             # Notification toasts
│   ├── constants/
│   │   ├── defaultData.js        # Default settings, units, and reference invoice
│   │   └── logoBase64.js         # Base64 string of genuine IGO logo
│   ├── services/
│   │   └── storageService.js     # Persistent CRUD repository for invoices & settings
│   ├── utils/
│   │   ├── calculations.js       # Row amounts, subtotal, taxes, and totals
│   │   ├── numberToWords.js      # Indian numbering system currency words engine
│   │   ├── pdfGenerator.js       # jsPDF vector layout engine matching reference PDF
│   │   └── wordGenerator.js      # Genuine Microsoft Word docx builder
│   ├── App.jsx                   # Main application controller & state coordinator
│   ├── App.css                   # Responsive corporate styling
│   ├── index.css                 # Base resets
│   └── main.jsx                  # React application entry point
├── test_suite.js                 # Automated test runner (20 tests)
├── package.json
├── vite.config.js
└── README.md
```

---

## 📄 License & Attribution
Developed for **IGO GROUP OF COMPANIES** (India Green Organics / IGO Agric Products).
All rights reserved.

