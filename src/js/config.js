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
        customerName: 'Kamlesh Bhai',
        customerAddr: 'ERU CHAR RASTA',
        invoiceDate: new Date().toISOString().slice(0, 10),
        item: { desc: 'Dining table', qty: 2, rate: 12000 }
    },
    layout: {
        maxRows: 15
    },
    labels: {
        grandTotal: 'Grand total-A',
        amountInWordsPrefix: 'Amount in words:'
    }
};
