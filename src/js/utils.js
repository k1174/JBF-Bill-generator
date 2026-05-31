window.billHelpers = {
    getA4Layout() {
        return window.billConfig?.a4 || {
            widthMm: 210,
            heightMm: 297,
            marginMm: 15,
            logoWidthMm: 18,
            font: { brand: 14, docTitle: 10, docNumber: 11, label: 8, body: 9, customer: 10, tableHead: 8, tableBody: 9, total: 9, grandTotal: 11, notes: 8 },
            spacing: { lineMm: 4, sectionMm: 6, blockMm: 8 },
            table: { cellPaddingMm: 2, minRowHeightMm: 6, columns: { sr: 0.07, desc: 0.48, qty: 0.10, rate: 0.15, total: 0.20 } }
        };
    },

    formatDate(value) {
        if (!value) return '';
        const [year, month, day] = value.split('-');
        return `${day}/${month}/${year}`;
    },

    formatNumber(value) {
        return value > 0 ? value.toLocaleString('en-IN') : '';
    },

    numberToWords(num) {
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        if (num == 0) return 'Zero';
        if ((num = num.toString()).length > 9) return 'Overflow';
        const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return '';
        let str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
        str += (n[5] != 0) ? (str != '' ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
        return str.trim();
    },

    createDocumentPdf(app) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const L = this.getA4Layout();
        const { font: F, spacing: S, table: T } = L;

        const M = L.marginMm;
        const PAGE_W = L.widthMm;
        const PAGE_H = L.heightMm;
        const CONTENT_W = PAGE_W - M * 2;
        const RIGHT = PAGE_W - M;
        const BOTTOM = PAGE_H - M;
        const COL = T.columns;

        const subTotal = app.subTotal;
        const discountAmount = app.discountAmount;
        const taxAmount = app.taxAmount;
        const totalAmount = app.totalAmount;
        const totalLabel = app.grandTotalLabel || (app.documentType === 'Invoice' ? 'Amount due' : 'Estimated Total');

        const ensureSpace = (y, height) => {
            if (y + height > BOTTOM) {
                doc.addPage();
                return M;
            }
            return y;
        };

        const estimateTotalsHeight = () => {
            let h = S.sectionMm;
            h += S.lineMm;
            if (app.documentType === 'Invoice') h += S.lineMm * 2;
            if (app.documentType === 'Quotation' && app.validityDays) h += S.lineMm;
            h += S.sectionMm;
            return h;
        };

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(F.notes);
        const wordsText = `${app.labels.amountInWordsPrefix || 'Amount in words:'} ${this.numberToWords(Math.round(totalAmount))} Only`;
        const wordsLines = doc.splitTextToSize(wordsText, CONTENT_W);
        const footerHeight = estimateTotalsHeight() + wordsLines.length * S.lineMm + S.sectionMm;

        let y = M;

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(F.brand);
        doc.setTextColor(15, 23, 42);
        doc.text(app.brand.name || 'Jay Bhavani Furniture', M, y + 4);

        const img = document.getElementById('logoImg');
        const logoW = L.logoWidthMm;
        let logoBottom = y;
        if (img && img.naturalWidth > 0) {
            const logoH = logoW / (img.naturalWidth / img.naturalHeight);
            doc.addImage(img, 'PNG', RIGHT - logoW, y, logoW, logoH);
            logoBottom = y + logoH;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(F.notes);
        doc.setTextColor(100, 116, 139);
        const infoLines = [...(app.brand.addressLines || [])];
        if (app.brand.contactLine) infoLines.push(app.brand.contactLine);
        const addressTop = y + S.blockMm;
        doc.text(infoLines, M, addressTop);
        const addressBottom = addressTop + infoLines.length * S.lineMm;

        y = Math.max(addressBottom, logoBottom) + S.sectionMm;

        // Document title + number
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(F.docTitle);
        doc.setTextColor(15, 23, 42);
        doc.text(app.documentTitle, M, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(F.label);
        doc.setTextColor(148, 163, 184);
        doc.text(app.documentNumberLabel, RIGHT, y - 1.5, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(F.docNumber);
        doc.setTextColor(15, 23, 42);
        doc.text(app.displayDocumentNumber || app.autoDocumentNumber, RIGHT, y + 3, { align: 'right' });

        y += S.sectionMm;
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.4);
        doc.line(M, y, RIGHT, y);

        y += S.sectionMm;

        // Customer + date
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(F.label);
        doc.setTextColor(148, 163, 184);
        doc.text(app.customerLabel || 'Billed To', M, y);
        doc.text('Date of Issue', RIGHT, y, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(F.customer);
        doc.setTextColor(15, 23, 42);
        doc.text(app.customerName.toUpperCase(), M, y + S.lineMm + 1);
        doc.setFontSize(F.body);
        doc.text(this.formatDate(app.invoiceDate), RIGHT, y + S.lineMm + 1, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(F.body);
        doc.setTextColor(100, 116, 139);
        doc.text(app.customerAddr.toUpperCase(), M, y + S.lineMm * 2 + 2);

        y += S.blockMm + S.sectionMm;

        // Line items table
        const tableItems = app.items.filter(item => item.desc || item.qty > 0 || item.rate > 0);
        if (tableItems.length === 0) tableItems.push({ desc: '', qty: 0, rate: 0 });

        const rows = tableItems.map((item, index) => {
            const qty = Number(item.qty) || 0;
            const rate = Number(item.rate) || 0;
            const total = qty * rate;
            return [
                index + 1,
                item.desc || '',
                qty || '',
                rate > 0 ? rate.toLocaleString('en-IN') : '',
                total > 0 ? total.toLocaleString('en-IN') : ''
            ];
        });

        doc.autoTable({
            startY: y,
            margin: { left: M, right: M, top: M, bottom: M },
            tableWidth: CONTENT_W,
            head: [['Sr', 'Description', 'Qty', 'Rate', 'Total']],
            body: rows,
            theme: 'grid',
            showHead: 'everyPage',
            rowPageBreak: 'avoid',
            headStyles: {
                fillColor: [248, 250, 252],
                textColor: [100, 116, 139],
                fontStyle: 'bold',
                fontSize: F.tableHead,
                cellPadding: T.cellPaddingMm,
                lineWidth: 0.1,
                lineColor: [203, 213, 225]
            },
            styles: {
                fontSize: F.tableBody,
                cellPadding: T.cellPaddingMm,
                minCellHeight: T.minRowHeightMm,
                lineWidth: 0.1,
                lineColor: [226, 232, 240],
                textColor: [15, 23, 42],
                overflow: 'linebreak'
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: CONTENT_W * COL.sr },
                1: { fontStyle: 'bold', cellWidth: CONTENT_W * COL.desc },
                2: { halign: 'center', cellWidth: CONTENT_W * COL.qty },
                3: { halign: 'right', cellWidth: CONTENT_W * COL.rate },
                4: { halign: 'right', cellWidth: CONTENT_W * COL.total, fontStyle: 'bold' }
            }
        });

        // Totals + amount in words
        y = ensureSpace(doc.lastAutoTable.finalY + S.sectionMm, footerHeight);

        const totalsLeft = RIGHT - 70;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(F.body);
        doc.setTextColor(100, 116, 139);

        doc.text('Sub total', totalsLeft, y);
        doc.text('Rs. ' + subTotal.toLocaleString('en-IN'), RIGHT, y, { align: 'right' });
        y += S.lineMm + 1;

        if (app.documentType === 'Invoice') {
            doc.text(`Discount (${Number(app.discountRate) || 0}%)`, totalsLeft, y);
            doc.text('- Rs. ' + discountAmount.toLocaleString('en-IN'), RIGHT, y, { align: 'right' });
            y += S.lineMm + 1;
            doc.text(`Tax (${Number(app.taxRate) || 0}%)`, totalsLeft, y);
            doc.text('Rs. ' + taxAmount.toLocaleString('en-IN'), RIGHT, y, { align: 'right' });
            y += S.lineMm + 1;
        }

        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.3);
        doc.line(totalsLeft, y, RIGHT, y);
        y += S.lineMm + 1;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(F.total);
        doc.setTextColor(15, 23, 42);
        doc.text(totalLabel, totalsLeft, y);
        doc.setFontSize(F.grandTotal);
        doc.text('Rs. ' + totalAmount.toLocaleString('en-IN'), RIGHT, y, { align: 'right' });
        y += S.sectionMm;

        if (app.documentType === 'Quotation' && app.validityDays) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(F.notes);
            doc.setTextColor(100, 116, 139);
            doc.text('Offer valid until ' + this.formatDate(app.validUntilDate), totalsLeft, y);
            y += S.lineMm + 1;
        }

        y += S.sectionMm;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(F.notes);
        doc.setTextColor(148, 163, 184);
        doc.text(wordsLines, M, y);

        const slug = (app.customerName || 'document').replace(/\s+/g, '_');
        doc.save(`${app.documentType}_${slug}.pdf`);
    }
};
