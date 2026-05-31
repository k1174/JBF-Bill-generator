window.billHelpers = {
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
        const margin = 12;
        const pageWidth = 210;
        const rightEdge = pageWidth - margin;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(app.brand.name || 'New Jay Bhavani Furniture', margin, 15);

        doc.setFontSize(10);
        doc.text(app.documentTitle, rightEdge, 13, { align: 'right' });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        doc.text(app.documentNumberLabel + ': ' + (app.displayDocumentNumber || app.autoDocumentNumber), rightEdge, 18, { align: 'right' });

        const img = document.getElementById('logoImg');
        if (img && img.naturalWidth > 0) {
            const ratio = img.naturalWidth / img.naturalHeight;
            const w = 24;
            const h = w / ratio;
            doc.addImage(img, 'PNG', rightEdge - w, 8, w, h);
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100);
        const infoLines = [...(app.brand.addressLines || [])];
        if (app.brand.contactLine) infoLines.push(app.brand.contactLine);
        doc.text(infoLines, margin, 23);

        const headerBottom = 35;
        doc.setDrawColor(220);
        doc.setLineWidth(0.3);
        doc.line(margin, headerBottom, rightEdge, headerBottom);

        doc.setTextColor(0);
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('To:', margin, headerBottom + 6);
        doc.setFont(undefined, 'normal');
        doc.text(app.customerName.toUpperCase(), margin, headerBottom + 11);
        doc.setFontSize(8);
        doc.setTextColor(80);
        doc.text(app.customerAddr.toUpperCase(), margin, headerBottom + 15);

        doc.setTextColor(0);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text('Date: ' + this.formatDate(app.invoiceDate), rightEdge, headerBottom + 6, { align: 'right' });
        if (app.documentType === 'Quotation' && app.validityDays) {
            doc.text('Valid until: ' + this.formatDate(app.validUntilDate), rightEdge, headerBottom + 11, { align: 'right' });
        }

        const rows = app.items
            .filter(item => item.desc || item.qty > 0 || item.rate > 0)
            .map((item, index) => {
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
            startY: headerBottom + 22,
            head: [['Sr', 'Description', 'Qty', 'Rate', 'Total']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [245, 247, 250], textColor: [30, 41, 59], fontStyle: 'bold', lineWidth: 0.1, lineColor: [210, 210, 210], fontSize: 8, cellPadding: 2 },
            styles: { fontSize: 8, cellPadding: 2, lineColor: [220, 220, 220], lineWidth: 0.1, textColor: [0, 0, 0] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { fontStyle: 'bold', cellWidth: 72 },
                2: { halign: 'center', cellWidth: 16 },
                3: { halign: 'right', cellWidth: 28 },
                4: { halign: 'right', cellWidth: 28, fontStyle: 'bold' }
            }
        });

        const summaryStart = doc.lastAutoTable.finalY + 8;
        const summaryLeft = 135;
        const summaryRight = rightEdge;
        const subTotal = app.items.reduce((sum, item) => {
            const qty = Number(item.qty) || 0;
            const rate = Number(item.rate) || 0;
            return sum + qty * rate;
        }, 0);
        const discountAmount = subTotal * (Number(app.discountRate) || 0) / 100;
        const taxAmount = subTotal * (Number(app.taxRate) || 0) / 100;
        const totalAmount = subTotal + taxAmount - discountAmount;

        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        doc.text('Sub total', summaryLeft, summaryStart);
        doc.text('Rs. ' + subTotal.toLocaleString('en-IN'), summaryRight, summaryStart, { align: 'right' });

        let currentY = summaryStart + 4;
        if (app.documentType === 'Invoice') {
            doc.text(`Discount (${Number(app.discountRate) || 0}%)`, summaryLeft, currentY);
            doc.text('- Rs. ' + discountAmount.toLocaleString('en-IN'), summaryRight, currentY, { align: 'right' });
            currentY += 4;
            doc.text(`Tax (${Number(app.taxRate) || 0}%)`, summaryLeft, currentY);
            doc.text('Rs. ' + taxAmount.toLocaleString('en-IN'), summaryRight, currentY, { align: 'right' });
            currentY += 4;
        }

        doc.setLineWidth(0.2);
        doc.setDrawColor(200);
        doc.line(summaryLeft, currentY, summaryRight, currentY);
        currentY += 3;

        doc.setFont(undefined, 'bold');
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.text(app.documentType === 'Invoice' ? 'Amount due' : 'Estimated total', summaryLeft, currentY);
        doc.text('Rs. ' + totalAmount.toLocaleString('en-IN'), summaryRight, currentY, { align: 'right' });

        currentY += 7;
        doc.setFontSize(7);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(120);
        doc.text(`${app.labels.amountInWordsPrefix || 'Amount in words:'} ${this.numberToWords(totalAmount)} Only`, margin, currentY);

        currentY += 12;
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0);
        doc.text(app.brand.pdfSignatureLeft || "Receiver's Signature", margin, currentY);
        doc.text(app.brand.pdfSignatureRight || 'For, New Jay Bhavani Furniture', summaryRight, currentY, { align: 'right' });

        const slug = app.customerName.replace(/\s+/g, '_');
        doc.save(`${app.documentType}_${slug}.pdf`);
    }
};
