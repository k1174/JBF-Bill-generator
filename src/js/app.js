document.addEventListener('alpine:init', () => {
    Alpine.data('billApp', () => {
        const config = window.billConfig || {};
        const brand = config.brand || {};
        const defaults = config.defaults || {};
        const labels = config.labels || {};
        const layout = config.layout || {};

        return {
            activeTab: 'edit',
            brand,
            labels,
            documentType: defaults.documentType || 'Invoice',
            documentNumber: defaults.documentNumber || '',
            documentNumberPrefix: defaults.documentNumberPrefix || { Invoice: 'INV', Quotation: 'QOT' },
            documentTypes: ['Invoice', 'Quotation'],
            discountRate: defaults.discountRate || 0,
            taxRate: defaults.taxRate || 0,
            validityDays: defaults.validityDays || 30,
            customerName: defaults.customerName || 'SUMAN BHAI',
            customerAddr: defaults.customerAddr || 'ERU CHAR RASTA',
            invoiceDate: defaults.invoiceDate || new Date().toISOString().slice(0, 10),
            items: [defaults.item || { desc: 'Dining table', qty: 2, rate: 12000 }],
            maxRows: layout.maxRows || 15,

            get autoDocumentNumber() {
                const prefix = this.documentNumberPrefix[this.documentType] || 'DOC';
                const timestamp = Date.now();
                const random = Math.floor(Math.random() * 10000);
                return `${prefix}-${random.toString().padStart(4, '0')}`;
            },

            get displayDocumentNumber() {
                return this.documentNumber || this.autoDocumentNumber;
            },

            get subTotal() {
                return this.items.reduce((sum, item) => {
                    const qty = Number(item.qty) || 0;
                    const rate = Number(item.rate) || 0;
                    return sum + qty * rate;
                }, 0);
            },

            get discountAmount() {
                return this.subTotal * (Number(this.discountRate) || 0) / 100;
            },

            get taxAmount() {
                return this.subTotal * (Number(this.taxRate) || 0) / 100;
            },

            get totalAmount() {
                return this.subTotal + this.taxAmount - this.discountAmount;
            },

            get validUntilDate() {
                if (!this.invoiceDate || !this.validityDays) return '';
                const date = new Date(this.invoiceDate);
                date.setDate(date.getDate() + Number(this.validityDays));
                return date.toISOString().slice(0, 10);
            },

            get documentTitle() {
                return this.documentType.toUpperCase();
            },

            get documentNumberLabel() {
                return this.documentType === 'Quotation' ? 'Quote No.' : 'Invoice No.';
            },

            get customerLabel() {
                return this.documentType === 'Quotation' ? 'Quoted To' : 'Billed To';
            },

            get visibleItems() {
                const rows = this.items.slice(0, this.maxRows);
                while (rows.length < this.maxRows) {
                    rows.push({ desc: '', qty: 0, rate: 0 });
                }
                return rows;
            },

            get grandTotalLabel() {
                return this.documentType === 'Quotation' ? 'Estimated Total' : 'Amount due';
            },

            get amountInWords() {
                return `${this.labels.amountInWordsPrefix || 'Amount in words:'} ${billHelpers.numberToWords(this.totalAmount)} Only`;
            },

            formatDate(value) {
                return billHelpers.formatDate(value);
            },

            formatNumber(value) {
                return billHelpers.formatNumber(value);
            },

            addItem() {
                this.items.push({ desc: '', qty: 0, rate: 0 });
            },

            removeItem(index) {
                this.items.splice(index, 1);
            },

            downloadPDF() {
                billHelpers.createDocumentPdf(this);
            }
        };
    });
});
