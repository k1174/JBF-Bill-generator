window.billConfig = {
    brand: {
        name: 'Jay Bhavani Furniture',
        addressLines: [
            'Shop no. 5, Sai complex, Sitaram nagar, Eru char rasta,',
            'Abrama Road, Navsari - 396450'
        ],
        contactLine: 'Contact : 98252 98696 | jbf01nvs@gmail.com',
        logoPath: 'src/assets/logo.png',
        pdfSignatureLeft: "Receiver's Signature",
        pdfSignatureRight: 'For, Jay Bhavani Furniture'
    },
    defaults: {
        documentType: 'Invoice',
        documentNumberPrefix: { Invoice: 'INV', Quotation: 'QOT' },
        documentNumber: '',
        discountRate: 0,
        taxRate: 5,
        validityDays: 30,
        customerName: 'Kamlesh Bhai',
        customerAddr: 'ERU CHAR RASTA',
        invoiceDate: new Date().toISOString().slice(0, 10),
        item: { desc: 'Dining table', qty: 2, rate: 12000 }
    },
    labels: {
        grandTotal: 'Grand Total',
        amountInWordsPrefix: 'Amount in words:'
    },
    // ISO A4 (210 × 297 mm) — shared by preview and PDF
    a4: {
        widthMm: 210,
        heightMm: 297,
        marginMm: 15,
        logoWidthMm: 18,
        font: {
            brand: 14,
            docTitle: 10,
            docNumber: 11,
            label: 8,
            body: 9,
            customer: 10,
            tableHead: 8,
            tableBody: 9,
            total: 9,
            grandTotal: 11,
            notes: 8
        },
        spacing: {
            lineMm: 4,
            sectionMm: 6,
            blockMm: 8
        },
        table: {
            cellPaddingMm: 2,
            minRowHeightMm: 6,
            columns: { sr: 0.07, desc: 0.48, qty: 0.10, rate: 0.15, total: 0.20 }
        }
    }
};
