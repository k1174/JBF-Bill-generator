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
            customerName: defaults.customerName || 'SUMAN BHAI',
            customerAddr: defaults.customerAddr || 'ERU CHAR RASTA',
            invoiceDate: defaults.invoiceDate || new Date().toISOString().slice(0, 10),
            items: [defaults.item || { desc: 'Dining table', qty: 2, rate: 12000 }],
            maxRows: layout.maxRows || 15,

            get visibleItems() {
                const rows = this.items.slice(0, this.maxRows);
                while (rows.length < this.maxRows) {
                    rows.push({ desc: '', qty: 0, rate: 0 });
                }
                return rows;
            },

            get grandTotal() {
                return this.items.reduce((sum, item) => {
                    const qty = Number(item.qty) || 0;
                    const rate = Number(item.rate) || 0;
                    return sum + qty * rate;
                }, 0);
            },

            get amountInWords() {
                return `${this.labels.amountInWordsPrefix || 'Amount in words:'} ${billHelpers.numberToWords(this.grandTotal)} Only`;
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
                billHelpers.createInvoicePdf(this);
            }
        };
    });
});
