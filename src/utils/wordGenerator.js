import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun
} from "docx";
import fileSaver from "file-saver";
const saveAs = fileSaver?.saveAs || fileSaver;
import { calculateInvoiceTotals } from "./calculations.js";
import { formatINR } from "./numberToWords.js";

function base64ToUint8Array(dataUrl) {
  try {
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer;
  } catch (e) {
    console.error("Error converting base64 image for Word doc:", e);
    return null;
  }
}

const borderSingle = {
  style: BorderStyle.SINGLE,
  size: 6,
  color: "000000"
};

const cellBordersAll = {
  top: borderSingle,
  bottom: borderSingle,
  left: borderSingle,
  right: borderSingle
};

const cellMarginsStandard = {
  top: 100,
  bottom: 100,
  left: 120,
  right: 120
};

export async function generateInvoiceWord(invoice, companySettings) {
  const company = invoice.companySnapshot || companySettings;
  const totals = calculateInvoiceTotals(invoice);

  const PAGE_WIDTH_DXA = 10000;
  const LEFT_COL_DXA = 5800; // ~58%
  const RIGHT_COL_DXA = 4200; // ~42%
  const HALF_RIGHT_DXA = 2100;

  // -----------------------------------------------------------
  // 1. TOP HEADER TABLE: Company (Left) & Invoice Meta (Right)
  // -----------------------------------------------------------
  const companyChildren = [];

  // Genuine Logo
  if (company.logo) {
    const logoBytes = base64ToUint8Array(company.logo);
    if (logoBytes) {
      companyChildren.push(
        new Paragraph({
          children: [
            new ImageRun({
              type: company.logo.includes("image/png") ? "png" : "jpg",
              data: logoBytes,
              transformation: { width: 130, height: 50 }
            })
          ],
          spacing: { after: 100 }
        })
      );
    }
  }

  // Company Name
  companyChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: company.companyName || "IGO GROUP OF COMPANIES",
          bold: true,
          size: 20,
          font: "Arial"
        })
      ],
      spacing: { after: 60 }
    })
  );

  // Address
  companyChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: company.address || "",
          size: 16,
          font: "Arial"
        })
      ],
      spacing: { after: 60 }
    })
  );

  // Email & GSTIN
  companyChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Email: ", bold: true, size: 16, font: "Arial" }),
        new TextRun({ text: company.email || "", size: 16, font: "Arial" })
      ],
      spacing: { after: 40 }
    })
  );

  if (company.gstin) {
    companyChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: "GSTIN: ", bold: true, size: 16, font: "Arial" }),
          new TextRun({ text: company.gstin, bold: true, size: 16, font: "Arial" })
        ],
        spacing: { after: 40 }
      })
    );
  }

  // Header Table (Nested inside document)
  const headerTable = new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          // Left cell: Company details
          new TableCell({
            width: { size: LEFT_COL_DXA, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: cellMarginsStandard,
            children: companyChildren
          }),
          // Right cell: Nested 3-row grid
          new TableCell({
            width: { size: RIGHT_COL_DXA, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: [
              new Table({
                width: { size: RIGHT_COL_DXA, type: WidthType.DXA },
                rows: [
                  // Row 1: Invoice No & Dated
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: HALF_RIGHT_DXA, type: WidthType.DXA },
                        borders: cellBordersAll,
                        margins: cellMarginsStandard,
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Invoice No.", size: 15, font: "Arial" })]
                          }),
                          new Paragraph({
                            children: [new TextRun({ text: String(invoice.invoiceNumber || ""), bold: true, size: 18, font: "Arial" })]
                          })
                        ]
                      }),
                      new TableCell({
                        width: { size: HALF_RIGHT_DXA, type: WidthType.DXA },
                        borders: cellBordersAll,
                        margins: cellMarginsStandard,
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Dated", size: 15, font: "Arial" })]
                          }),
                          new Paragraph({
                            children: [new TextRun({ text: String(invoice.invoiceDate || ""), bold: true, size: 17, font: "Arial" })]
                          })
                        ]
                      })
                    ]
                  }),
                  // Row 2: Delivery Note & Mode/Terms of Payment
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: HALF_RIGHT_DXA, type: WidthType.DXA },
                        borders: cellBordersAll,
                        margins: cellMarginsStandard,
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Delivery Note", size: 15, font: "Arial" })]
                          }),
                          new Paragraph({
                            children: [new TextRun({ text: String(invoice.deliveryNote || "-"), size: 15, font: "Arial" })]
                          })
                        ]
                      }),
                      new TableCell({
                        width: { size: HALF_RIGHT_DXA, type: WidthType.DXA },
                        borders: cellBordersAll,
                        margins: cellMarginsStandard,
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Mode/Terms of Payment", size: 15, font: "Arial" })]
                          }),
                          new Paragraph({
                            children: [new TextRun({ text: String(invoice.paymentTerms || "Bank Transfer"), bold: true, size: 16, font: "Arial" })]
                          })
                        ]
                      })
                    ]
                  }),
                  // Row 3: Supplier's Ref & Other Reference(s)
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: HALF_RIGHT_DXA, type: WidthType.DXA },
                        borders: cellBordersAll,
                        margins: cellMarginsStandard,
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Supplier's Ref.", size: 15, font: "Arial" })]
                          }),
                          new Paragraph({
                            children: [new TextRun({ text: String(invoice.supplierRef || "-"), size: 15, font: "Arial" })]
                          })
                        ]
                      }),
                      new TableCell({
                        width: { size: HALF_RIGHT_DXA, type: WidthType.DXA },
                        borders: cellBordersAll,
                        margins: cellMarginsStandard,
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Other Reference (s)", size: 15, font: "Arial" })]
                          }),
                          new Paragraph({
                            children: [new TextRun({ text: String(invoice.otherReference || "-"), size: 15, font: "Arial" })]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // -----------------------------------------------------------
  // 2. MIDDLE TABLE: Customer (Left) & Order/Dispatch (Right)
  // -----------------------------------------------------------
  const cust = invoice.customer || {};
  const custChildren = [
    new Paragraph({
      children: [
        new TextRun({ text: "TO:", bold: true, size: 17, font: "Arial" }),
        new TextRun({ text: "   " + (cust.name || "Customer Name"), bold: true, size: 18, font: "Arial" })
      ],
      spacing: { after: 60 }
    })
  ];

  if (cust.contactPerson) {
    custChildren.push(
      new Paragraph({
        children: [new TextRun({ text: cust.contactPerson, size: 16, font: "Arial" })],
        spacing: { after: 40 }
      })
    );
  }

  if (cust.address) {
    custChildren.push(
      new Paragraph({
        children: [new TextRun({ text: cust.address, size: 16, font: "Arial" })],
        spacing: { after: 40 }
      })
    );
  }

  const loc = [cust.city, cust.district, cust.state].filter(Boolean).join(", ");
  if (loc) {
    const locWithPin = cust.pincode ? `${loc} - ${cust.pincode}` : loc;
    custChildren.push(
      new Paragraph({
        children: [new TextRun({ text: locWithPin, size: 16, font: "Arial" })],
        spacing: { after: 40 }
      })
    );
  }

  if (cust.phone) {
    custChildren.push(
      new Paragraph({
        children: [new TextRun({ text: `Phone: ${cust.phone}`, size: 16, font: "Arial" })],
        spacing: { after: 40 }
      })
    );
  }

  if (cust.gstin) {
    custChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: "GSTIN: ", bold: true, size: 16, font: "Arial" }),
          new TextRun({ text: cust.gstin, bold: true, size: 16, font: "Arial" })
        ],
        spacing: { after: 40 }
      })
    );
  }

  const customerAndOrderTable = new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          // Left: Customer details
          new TableCell({
            width: { size: LEFT_COL_DXA, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: cellMarginsStandard,
            children: custChildren
          }),
          // Right: Order and dispatch details
          new TableCell({
            width: { size: RIGHT_COL_DXA, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: [
              new Table({
                width: { size: RIGHT_COL_DXA, type: WidthType.DXA },
                rows: [
                  // Row 1: Buyer's Order No & Dated
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: HALF_RIGHT_DXA, type: WidthType.DXA },
                        borders: cellBordersAll,
                        margins: cellMarginsStandard,
                        children: [
                          new Paragraph({ children: [new TextRun({ text: "Buyer's Order No.", size: 15, font: "Arial" })] }),
                          new Paragraph({ children: [new TextRun({ text: String(invoice.buyersOrderNo || "-"), bold: true, size: 15, font: "Arial" })] })
                        ]
                      }),
                      new TableCell({
                        width: { size: HALF_RIGHT_DXA, type: WidthType.DXA },
                        borders: cellBordersAll,
                        margins: cellMarginsStandard,
                        children: [
                          new Paragraph({ children: [new TextRun({ text: "Dated", size: 15, font: "Arial" })] }),
                          new Paragraph({ children: [new TextRun({ text: String(invoice.orderDate || "-"), bold: true, size: 15, font: "Arial" })] })
                        ]
                      })
                    ]
                  }),
                  // Row 2: Dispatch Document No & Vehicle No
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: HALF_RIGHT_DXA, type: WidthType.DXA },
                        borders: cellBordersAll,
                        margins: cellMarginsStandard,
                        children: [
                          new Paragraph({ children: [new TextRun({ text: "Dispatch Document No.", size: 15, font: "Arial" })] }),
                          new Paragraph({ children: [new TextRun({ text: String(invoice.dispatchDocNo || "-"), size: 15, font: "Arial" })] })
                        ]
                      }),
                      new TableCell({
                        width: { size: HALF_RIGHT_DXA, type: WidthType.DXA },
                        borders: cellBordersAll,
                        margins: cellMarginsStandard,
                        children: [
                          new Paragraph({ children: [new TextRun({ text: "Vehicle no:", size: 15, font: "Arial" })] }),
                          new Paragraph({ children: [new TextRun({ text: String(invoice.vehicleNo || "-"), bold: true, size: 15, font: "Arial" })] })
                        ]
                      })
                    ]
                  }),
                  // Row 3: Dispatched through & Destination
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: HALF_RIGHT_DXA, type: WidthType.DXA },
                        borders: cellBordersAll,
                        margins: cellMarginsStandard,
                        children: [
                          new Paragraph({ children: [new TextRun({ text: "Dispatched through", size: 15, font: "Arial" })] }),
                          new Paragraph({ children: [new TextRun({ text: String(invoice.dispatchedThrough || "-"), size: 15, font: "Arial" })] })
                        ]
                      }),
                      new TableCell({
                        width: { size: HALF_RIGHT_DXA, type: WidthType.DXA },
                        borders: cellBordersAll,
                        margins: cellMarginsStandard,
                        children: [
                          new Paragraph({ children: [new TextRun({ text: "Destination", size: 15, font: "Arial" })] }),
                          new Paragraph({ children: [new TextRun({ text: String(invoice.destination || "-"), size: 15, font: "Arial" })] })
                        ]
                      })
                    ]
                  }),
                  // Row 4: Terms of Delivery
                  new TableRow({
                    children: [
                      new TableCell({
                        columnSpan: 2,
                        width: { size: RIGHT_COL_DXA, type: WidthType.DXA },
                        borders: cellBordersAll,
                        margins: cellMarginsStandard,
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Terms of Delivery: ", size: 15, font: "Arial" }),
                              new TextRun({ text: String(invoice.termsOfDelivery || "-"), size: 15, font: "Arial" })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // -----------------------------------------------------------
  // 3. ITEMS TABLE
  // -----------------------------------------------------------
  const COL_SL = 800;
  const COL_DESC = 5200;
  const COL_COUNTS = 2000;
  const COL_AMT = 2000;

  const tableRows = [];

  // Table Header Row
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: COL_SL, type: WidthType.DXA },
          borders: cellBordersAll,
          margins: cellMarginsStandard,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Sl No.", bold: true, size: 16, font: "Arial" })]
            })
          ]
        }),
        new TableCell({
          width: { size: COL_DESC, type: WidthType.DXA },
          borders: cellBordersAll,
          margins: cellMarginsStandard,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "WORK DESCRIPTION", bold: true, size: 16, font: "Arial" })]
            })
          ]
        }),
        new TableCell({
          width: { size: COL_COUNTS, type: WidthType.DXA },
          borders: cellBordersAll,
          margins: cellMarginsStandard,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "COUNTS", bold: true, size: 16, font: "Arial" })]
            })
          ]
        }),
        new TableCell({
          width: { size: COL_AMT, type: WidthType.DXA },
          borders: cellBordersAll,
          margins: cellMarginsStandard,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "AMOUNT (IN RS )", bold: true, size: 16, font: "Arial" })]
            })
          ]
        })
      ]
    })
  );

  // Line items
  totals.calculatedItems.forEach((item, index) => {
    let descText = item.description || "";
    if (item.datePeriod && !descText.includes(item.datePeriod)) {
      descText += ` ( ${item.datePeriod} )`;
    }

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: COL_SL, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: cellMarginsStandard,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: String(index + 1), bold: true, size: 16, font: "Arial" })]
              })
            ]
          }),
          new TableCell({
            width: { size: COL_DESC, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: cellMarginsStandard,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: descText, bold: true, size: 16, font: "Arial" })]
              })
            ]
          }),
          new TableCell({
            width: { size: COL_COUNTS, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: cellMarginsStandard,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${item.quantity} ${item.unit || "LABOURS"}`.trim(),
                    size: 16,
                    font: "Arial"
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: COL_AMT, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: cellMarginsStandard,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Rs. ${formatINR(item.amount)} /-`,
                    size: 16,
                    font: "Arial"
                  })
                ]
              })
            ]
          })
        ]
      })
    );
  });

  // Optional: Tax and discount rows if present
  if (totals.discountAmount > 0 || totals.taxAmount > 0 || totals.additionalCharges > 0) {
    // Subtotal Row
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            width: { size: COL_SL + COL_DESC, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: cellMarginsStandard,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "SUBTOTAL", bold: true, size: 16, font: "Arial" })]
              })
            ]
          }),
          new TableCell({
            width: { size: COL_COUNTS, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: cellMarginsStandard,
            children: [new Paragraph({ text: "" })]
          }),
          new TableCell({
            width: { size: COL_AMT, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: cellMarginsStandard,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `Rs. ${formatINR(totals.subtotal)} /-`, bold: true, size: 16, font: "Arial" })]
              })
            ]
          })
        ]
      })
    );

    if (totals.discountAmount > 0) {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              width: { size: COL_SL + COL_DESC + COL_COUNTS, type: WidthType.DXA },
              borders: cellBordersAll,
              margins: cellMarginsStandard,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: "Discount", size: 15, font: "Arial" })]
                })
              ]
            }),
            new TableCell({
              width: { size: COL_AMT, type: WidthType.DXA },
              borders: cellBordersAll,
              margins: cellMarginsStandard,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: `- Rs. ${formatINR(totals.discountAmount)}`, size: 15, font: "Arial" })]
                })
              ]
            })
          ]
        })
      );
    }

    if (totals.cgstAmount > 0) {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              width: { size: COL_SL + COL_DESC + COL_COUNTS, type: WidthType.DXA },
              borders: cellBordersAll,
              margins: cellMarginsStandard,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: `CGST (${invoice.taxRate / 2}%)`, size: 15, font: "Arial" })]
                })
              ]
            }),
            new TableCell({
              width: { size: COL_AMT, type: WidthType.DXA },
              borders: cellBordersAll,
              margins: cellMarginsStandard,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: `Rs. ${formatINR(totals.cgstAmount)}`, size: 15, font: "Arial" })]
                })
              ]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              width: { size: COL_SL + COL_DESC + COL_COUNTS, type: WidthType.DXA },
              borders: cellBordersAll,
              margins: cellMarginsStandard,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: `SGST (${invoice.taxRate / 2}%)`, size: 15, font: "Arial" })]
                })
              ]
            }),
            new TableCell({
              width: { size: COL_AMT, type: WidthType.DXA },
              borders: cellBordersAll,
              margins: cellMarginsStandard,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: `Rs. ${formatINR(totals.sgstAmount)}`, size: 15, font: "Arial" })]
                })
              ]
            })
          ]
        })
      );
    } else if (totals.taxAmount > 0) {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              width: { size: COL_SL + COL_DESC + COL_COUNTS, type: WidthType.DXA },
              borders: cellBordersAll,
              margins: cellMarginsStandard,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: `GST (${invoice.taxRate}%)`, size: 15, font: "Arial" })]
                })
              ]
            }),
            new TableCell({
              width: { size: COL_AMT, type: WidthType.DXA },
              borders: cellBordersAll,
              margins: cellMarginsStandard,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: `Rs. ${formatINR(totals.taxAmount)}`, size: 15, font: "Arial" })]
                })
              ]
            })
          ]
        })
      );
    }

    if (totals.additionalCharges > 0) {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              width: { size: COL_SL + COL_DESC + COL_COUNTS, type: WidthType.DXA },
              borders: cellBordersAll,
              margins: cellMarginsStandard,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: invoice.additionalChargesLabel || "Additional Charges", size: 15, font: "Arial" })]
                })
              ]
            }),
            new TableCell({
              width: { size: COL_AMT, type: WidthType.DXA },
              borders: cellBordersAll,
              margins: cellMarginsStandard,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: `Rs. ${formatINR(totals.additionalCharges)}`, size: 15, font: "Arial" })]
                })
              ]
            })
          ]
        })
      );
    }
  }

  // TOTAL Row
  tableRows.push(
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: COL_SL + COL_DESC, type: WidthType.DXA },
          borders: cellBordersAll,
          margins: cellMarginsStandard,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "TOTAL", bold: true, size: 18, font: "Arial" })]
            })
          ]
        }),
        new TableCell({
          width: { size: COL_COUNTS, type: WidthType.DXA },
          borders: cellBordersAll,
          margins: cellMarginsStandard,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: totals.totalCountLabel || "",
                  size: 16,
                  font: "Arial"
                })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: COL_AMT, type: WidthType.DXA },
          borders: cellBordersAll,
          margins: cellMarginsStandard,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Rs. ${formatINR(totals.grandTotal)}/-`,
                  bold: true,
                  size: 18,
                  font: "Arial"
                })
              ]
            })
          ]
        })
      ]
    })
  );

  const itemsTable = new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    rows: tableRows
  });

  // -----------------------------------------------------------
  // 4. AMOUNT IN WORDS TABLE
  // -----------------------------------------------------------
  const amountWordsTable = new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: cellMarginsStandard,
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Amount Chargeable(in words)", size: 14, font: "Arial" })],
                spacing: { after: 30 }
              }),
              new Paragraph({
                children: [new TextRun({ text: totals.amountInWords, bold: true, size: 17, font: "Arial" })]
              })
            ]
          })
        ]
      })
    ]
  });

  // -----------------------------------------------------------
  // 5. DECLARATION & SIGNATORY TABLE
  // -----------------------------------------------------------
  const declChildren = [
    new Paragraph({
      children: [new TextRun({ text: "Declaration", bold: true, underline: {}, size: 15, font: "Arial" })],
      spacing: { after: 40 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: company.declaration || "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
          size: 14,
          font: "Arial"
        })
      ]
    })
  ];

  if (invoice.notes) {
    declChildren.push(
      new Paragraph({
        children: [new TextRun({ text: `Note: ${invoice.notes}`, italics: true, size: 14, font: "Arial" })],
        spacing: { before: 60 }
      })
    );
  }

  const signatoryChildren = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: company.signatoryEntity || "For IGO GROUP OF COMPANIES",
          bold: true,
          size: 16,
          font: "Arial"
        })
      ],
      spacing: { after: 120 }
    })
  ];

  if (company.signatureImage) {
    const sigBytes = base64ToUint8Array(company.signatureImage);
    if (sigBytes) {
      signatoryChildren.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new ImageRun({
              type: "png",
              data: sigBytes,
              transformation: { width: 100, height: 40 }
            })
          ],
          spacing: { after: 80 }
        })
      );
    }
  } else {
    // Add empty space for physical signature
    signatoryChildren.push(
      new Paragraph({
        text: "",
        spacing: { after: 360 }
      })
    );
  }

  if (company.signatoryName) {
    signatoryChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: company.signatoryName, size: 15, font: "Arial" })],
        spacing: { after: 30 }
      })
    );
  }

  signatoryChildren.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: company.signatoryDesignation || "Authorised Signatory",
          size: 16,
          font: "Arial"
        })
      ]
    })
  );

  const footerTable = new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: LEFT_COL_DXA, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: cellMarginsStandard,
            children: declChildren
          }),
          new TableCell({
            width: { size: RIGHT_COL_DXA, type: WidthType.DXA },
            borders: cellBordersAll,
            margins: cellMarginsStandard,
            children: signatoryChildren
          })
        ]
      })
    ]
  });

  // -----------------------------------------------------------
  // ASSEMBLE DOCUMENT
  // -----------------------------------------------------------
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 567, // ~10mm
              bottom: 567,
              left: 567,
              right: 567
            }
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Invoice",
                bold: true,
                size: 26,
                font: "Arial"
              })
            ],
            spacing: { after: 120 }
          }),
          headerTable,
          customerAndOrderTable,
          itemsTable,
          amountWordsTable,
          footerTable,
          ...(company.footerNote && company.footerNote.trim()
            ? [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: company.footerNote.trim(),
                      size: 14,
                      font: "Arial",
                      color: "555555"
                    })
                  ],
                  spacing: { before: 180 }
                })
              ]
            : [])
        ]
      }
    ]
  });

  return doc;
}

export async function downloadInvoiceWord(invoice, companySettings) {
  const doc = await generateInvoiceWord(invoice, companySettings);
  const blob = await Packer.toBlob(doc);
  const safeNumber = (invoice.invoiceNumber || "01").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `IGO_Invoice_${safeNumber}.docx`;

  if (typeof window !== "undefined" && window.document) {
    try {
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      return filename;
    } catch (e) {
      console.warn("Direct blob download failed, falling back to saveAs:", e);
    }
  }

  if (typeof saveAs === "function") {
    saveAs(blob, filename);
  }
  return filename;
}
