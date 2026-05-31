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

    createInvoicePdf(app) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text(app.brand.name || 'New Jay Bhavani Furniture', 15, 25);

        const img = document.getElementById('logoImg');
        if (img && img.naturalWidth > 0) {
            const ratio = img.naturalWidth / img.naturalHeight;
            const w = 25;
            const h = w / ratio;
            doc.addImage(img, 'PNG', 195 - w, 12, w, h);
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100);
        const infoLines = [...(app.brand.addressLines || [])];
        if (app.brand.contactLine) infoLines.push(app.brand.contactLine);
        doc.text(infoLines, 15, 32);

        doc.setDrawColor(30);
        doc.setLineWidth(0.5);
        doc.line(15, 48, 195, 48);

        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.text('To,', 15, 58);
        doc.setFont(undefined, 'bold');
        doc.text('Date', 165, 58);
        doc.setFont(undefined, 'normal');
        doc.text(this.formatDate(app.invoiceDate), 195, 58, { align: 'right' });

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(app.customerName.toUpperCase(), 15, 66);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(80);
        doc.text(app.customerAddr.toUpperCase(), 15, 72);

        const rows = app.visibleItems.map((item, index) => {
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
            startY: 82,
            head: [['Sr', 'Description', 'Qty', 'Rate', 'Total']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [245, 247, 250], textColor: [30, 41, 59], fontStyle: 'bold', lineWidth: 0.1, lineColor: [200, 200, 200] },
            styles: { fontSize: 10, cellPadding: 3, lineColor: [210, 215, 220], lineWidth: 0.1, textColor: [0, 0, 0] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 12 },
                1: { fontStyle: 'bold' },
                2: { halign: 'center', cellWidth: 15 },
                3: { halign: 'right', cellWidth: 25 },
                4: { halign: 'right', cellWidth: 35, fontStyle: 'bold' }
            }
        });

        const finalY = doc.lastAutoTable.finalY + 12;
        doc.setDrawColor(0);
        doc.setLineWidth(0.8);
        doc.line(15, finalY - 6, 195, finalY - 6);

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(100);
        doc.text(app.labels.grandTotal || 'Grand total-A', 140, finalY);

        doc.setFontSize(15);
        doc.setTextColor(0);
        doc.text('Rs. ' + app.grandTotal.toLocaleString('en-IN'), 195, finalY, { align: 'right' });

        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(120);
        doc.text(`${app.labels.amountInWordsPrefix || 'Amount in words:'} ${this.numberToWords(app.grandTotal)} Only`, 15, finalY + 12);

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0);
        doc.text(app.brand.pdfSignatureLeft || "Receiver's Signature", 15, finalY + 35);
        doc.text(app.brand.pdfSignatureRight || 'For, New Jay Bhavani Furniture', 195, finalY + 35, { align: 'right' });

        doc.save(`Bill_${app.customerName.replace(/\s+/g, '_')}.pdf`);
    }
};
