import { DEFAULT_LOGO_BASE64 } from "./logoBase64.js";

export const DEFAULT_COMPANY_SETTINGS = {
  companyName: "IGO GROUP OF COMPANIES",
  address: "VGP 2nd Street, ECR, opposite Oru Kerala Story, Uthandi, Chennai, Kanathur Reddykuppam, Tamil Nadu – 603112.",
  email: "ceo@igogroups.com",
  gstin: "33AXPPN8050R1ZM",
  phone: "+91 7397789803",
  logo: DEFAULT_LOGO_BASE64,
  signatoryEntity: "For IGO Agric Products",
  signatoryDesignation: "Authorised Signatory",
  signatoryName: "",
  signatureImage: "",
  declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
  footerNote: ""
};

export const INITIAL_SAMPLE_INVOICE = {
  id: "inv-ref-05",
  invoiceNumber: "05",
  invoiceDate: "2026-09-22",
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
    id: "cust-sukavya-01",
    name: "Mrs. Sukavya Deepak A V",
    contactPerson: "C/o. Nagaraj",
    address: "C/o. Nagaraj, Nayanahalli Gate, Near Vinayaka School",
    city: "Chintamani",
    district: "Chikkaballapur (dist)",
    state: "Karnataka",
    pincode: "563 125",
    phone: "",
    email: "",
    gstin: ""
  },
  items: [
    {
      id: "item-sample-1",
      slNo: 1,
      description: "WEEDING ( 22/09/2026 )",
      datePeriod: "22/09/2026",
      quantity: 10,
      unit: "LABOURS",
      rate: 500,
      amount: 5000
    }
  ],
  discount: 0,
  taxRate: 0,
  taxType: "none", // none, gst (overall), or cgst_sgst
  additionalCharges: 0,
  additionalChargesLabel: "Additional Charges",
  notes: "",
  supportingDocRef: "",
  attachmentDetails: "",
  companySnapshot: { ...DEFAULT_COMPANY_SETTINGS },
  createdAt: "2026-09-22T10:00:00.000Z",
  updatedAt: "2026-09-22T10:00:00.000Z"
};

export const INITIAL_CUSTOMERS = [
  {
    id: "cust-sukavya-01",
    name: "Mrs. Sukavya Deepak A V",
    contactPerson: "C/o. Nagaraj",
    address: "C/o. Nagaraj, Nayanahalli Gate, Near Vinayaka School",
    city: "Chintamani",
    district: "Chikkaballapur (dist)",
    state: "Karnataka",
    pincode: "563 125",
    phone: "",
    email: "",
    gstin: ""
  },
  {
    id: "cust-valluvam-02",
    name: "Valluvam Oil Industries",
    contactPerson: "Production Manager",
    address: "Plot 14, SIDCO Industrial Estate",
    city: "Chennai",
    district: "Kanchipuram",
    state: "Tamil Nadu",
    pincode: "600 096",
    phone: "+91 9840012345",
    email: "procurement@valluvam.com",
    gstin: "33AABCV1234F1Z8"
  }
];

export const COMMON_UNITS = [
  "LABOURS",
  "NOS",
  "DAYS",
  "HOURS",
  "KGS",
  "LITRES",
  "BAGS",
  "BOXES",
  "ACRES",
  "MONTHS",
  "UNITS"
];

export const PAYMENT_MODES = [
  "Bank Transfer",
  "NEFT / RTGS",
  "IMPS",
  "UPI / GPay",
  "Cheque",
  "Cash",
  "Credit - 15 Days",
  "Credit - 30 Days"
];
