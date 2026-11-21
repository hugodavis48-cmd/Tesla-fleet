import { jsPDF, GState } from 'jspdf';
import QRCode from 'qrcode';
import {
  ServiceBooking,
  Transaction,
  TransactionInvoiceDetails,
  User,
} from '../types';

function formatMoney(amount: number): string {
  return `$${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USD`;
}

function inferCategoryLabel(tx: Transaction, details: TransactionInvoiceDetails): string {
  if (details.receiptCategory === 'shop_order') return 'Tesla Parts & Accessories Checkout';
  if (details.receiptCategory === 'service_booking') return 'Certified Service & Repair Scheduling';
  if (tx.type === 'deposit') return 'Vault Crypto Deposit Receipt';
  if (tx.type === 'investment_deposit') return 'Fleet Staking Allocation Receipt';
  if (tx.type === 'dividend_claim') return 'Yield Dividend Settlement Receipt';
  if (tx.type === 'rental_payment') return 'Executive Fleet Rental Receipt';
  if (tx.type === 'promotion_win' || tx.type === 'referral_credit') return 'Rewards & Referral Credit Receipt';
  return 'Official Platform Transaction Receipt';
}

function buildFallbackInvoiceDetails(
  tx: Transaction,
  user?: Partial<User> | null,
  booking?: ServiceBooking
): TransactionInvoiceDetails {
  if (tx.invoiceData) {
    return tx.invoiceData;
  }

  const isService = Boolean(booking) || (tx.type === 'service_payment' && !tx.description.toLowerCase().includes('store'));
  const isShop = tx.description.toLowerCase().includes('store') || tx.description.toLowerCase().includes('order');
  const receiptCategory: TransactionInvoiceDetails['receiptCategory'] = isShop
    ? 'shop_order'
    : isService
    ? 'service_booking'
    : tx.type === 'deposit'
    ? 'deposit'
    : tx.type === 'investment_deposit'
    ? 'investment'
    : 'reward';

  const cleanNumericSuffix = tx.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-8) || 'RECEIPT';
  const prefix = receiptCategory === 'shop_order' ? 'INV-SHOP' : receiptCategory === 'service_booking' ? 'INV-SRV' : 'INV-TRX';

  return {
    invoiceNumber: booking?.invoiceNumber || `${prefix}-${cleanNumericSuffix}`,
    receiptCategory,
    customerName: user?.name || 'Tesla Member',
    customerEmail: user?.email || 'member@apex-tesla.io',
    customerLocation: user?.location || booking?.location || 'Fremont, CA, USA',
    vehicleName: booking?.vehicleName,
    serviceMode: booking?.serviceMode,
    scheduledDate: booking?.scheduledDate,
    timeSlot: booking?.timeSlot,
    location: booking?.location,
    technicianNotes: booking?.technicianNotes,
    paymentMethod: booking?.paidWith || `Apex Vault (${tx.currency})`,
    subtotalUsd: tx.usdEquivalent,
    discountUsd: 0,
    shippingUsd: 0,
    totalUsd: tx.usdEquivalent,
    items: [
      {
        name: booking ? `${booking.serviceType} (${booking.vehicleName})` : tx.description,
        category: isShop ? 'Hardware & Upgrades' : isService ? 'Certified Service' : tx.currency,
        quantity: 1,
        unitPriceUsd: tx.usdEquivalent,
        lineTotalUsd: tx.usdEquivalent,
      },
    ],
  };
}

function isTransactionPaid(statusLabel: string): boolean {
  const s = (statusLabel || '').toLowerCase();
  if (!s) return false;
  if (s.includes('pending') || s.includes('failed') || s.includes('rejected') || s.includes('cancelled') || s.includes('unpaid')) {
    return false;
  }
  return ['completed', 'paid', 'approved', 'verified', 'settled', 'confirmed', 'ready', 'scheduled', 'in bay'].some((k) =>
    s.includes(k)
  );
}

function drawQrVerificationBox(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  invoiceNumber: string,
  txHash: string,
  totalUsd: number,
  statusLabel: string,
  paid: boolean
): void {
  const boxHeight = 33;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(x, y, width, boxHeight, 2, 2, 'FD');

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://apex-tesla.io';
  const verifyPayload = `${origin}/?tab=dashboard&verify=${encodeURIComponent(invoiceNumber)}&tx=${encodeURIComponent(
    txHash
  )}&amount=${Number(totalUsd || 0).toFixed(2)}&status=${paid ? 'PAID' : 'PENDING'}`;

  const qrOuterSize = 27;
  const qrX = x + 3;
  const qrY = y + 3;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(qrX, qrY, qrOuterSize, qrOuterSize, 1.5, 1.5, 'FD');

  try {
    const qr = QRCode.create(verifyPayload, { errorCorrectionLevel: 'M' });
    const count = qr.modules.size;
    const data = qr.modules.data;
    const quietZone = 1.8;
    const cellSize = (qrOuterSize - quietZone * 2) / count;

    doc.setFillColor(15, 23, 42);
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (data[row * count + col]) {
          doc.rect(qrX + quietZone + col * cellSize, qrY + quietZone + row * cellSize, cellSize + 0.05, cellSize + 0.05, 'F');
        }
      }
    }
  } catch {
    doc.setFont('courier', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text('QR SEAL', qrX + qrOuterSize / 2, qrY + qrOuterSize / 2, { align: 'center' });
  }

  const infoX = qrX + qrOuterSize + 3.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('QUICK VERIFICATION QR', infoX, y + 7.5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(invoiceNumber.slice(0, 22), infoX, y + 13);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  const shortTx = txHash.length > 20 ? `${txHash.slice(0, 10)}...${txHash.slice(-6)}` : txHash;
  doc.text(`TX: ${shortTx}`, infoX, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  if (paid) {
    doc.setTextColor(5, 150, 105);
    doc.text('STATUS: PAID · VERIFIED', infoX, y + 23.5);
  } else {
    doc.setTextColor(217, 119, 6);
    doc.text(`STATUS: ${statusLabel.toUpperCase().slice(0, 18)}`, infoX, y + 23.5);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Scan code to verify settlement', infoX, y + 28.5);
}

function drawPaidWatermark(doc: jsPDF, invoiceNumber: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalPages = doc.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.saveGraphicsState();
    doc.setGState(new GState({ opacity: 0.11 }));

    const cx = pageWidth / 2;
    const cy = pageHeight * 0.56;

    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(76);
    doc.text('PAID', cx, cy, {
      align: 'center',
      baseline: 'middle',
      angle: 35,
    });

    doc.setGState(new GState({ opacity: 0.16 }));
    doc.setFontSize(11);
    doc.setTextColor(5, 150, 105);
    doc.text(`VERIFIED SETTLEMENT · ${invoiceNumber}`, cx + 8, cy + 20, {
      align: 'center',
      baseline: 'middle',
      angle: 35,
    });

    doc.restoreGraphicsState();
  }
}

function renderPdfInvoiceDocument(
  invoiceNumber: string,
  issuedAt: string,
  txHash: string,
  statusLabel: string,
  details: TransactionInvoiceDetails,
  categoryTitle: string,
  filename: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const paid = isTransactionPaid(statusLabel);
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header band
  doc.setFillColor(9, 13, 22);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 42, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('APEX TESLA HUB', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Certified EV Performance, Autonomous Fleet & Storefront Division', margin, 24.5);
  doc.text('3500 Deer Creek Rd, Palo Alto / Fremont Hub, CA · billing@apex-tesla.io', margin, 29.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(248, 113, 113);
  doc.text('OFFICIAL TAX INVOICE & RECEIPT', pageWidth - margin, 17, { align: 'right' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`#${invoiceNumber}`, pageWidth - margin, 24, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Issued: ${issuedAt}`, pageWidth - margin, 29.5, { align: 'right' });
  doc.text(`Status: ${statusLabel.toUpperCase()}`, pageWidth - margin, 34.5, { align: 'right' });

  let y = 54;

  // Billed To & Payment Metadata cards
  const colGap = 8;
  const boxW = (contentWidth - colGap) / 2;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, boxW, 34, 2, 2, 'FD');
  doc.roundedRect(margin + boxW + colGap, y, boxW, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO CUSTOMER', margin + 4, y + 6.5);
  doc.text('SETTLEMENT & AUDIT DETAILS', margin + boxW + colGap + 4, y + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(details.customerName.slice(0, 38), margin + 4, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(details.customerEmail.slice(0, 42), margin + 4, y + 18.5);
  doc.text((details.customerLocation || 'United States').slice(0, 42), margin + 4, y + 24);
  doc.text(categoryTitle.slice(0, 44), margin + 4, y + 29.5);

  const rightX = margin + boxW + colGap + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(details.paymentMethod.slice(0, 38), rightX, y + 13);

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`TX Ref: ${txHash.slice(0, 32)}`, rightX, y + 18.5);
  if (details.couponCode) {
    doc.text(`Promo Code Applied: ${details.couponCode}`, rightX, y + 24);
  } else {
    doc.text(`Verification: Cryptographically Sealed`, rightX, y + 24);
  }
  doc.text(`Settlement Status: ${statusLabel.toUpperCase()}`, rightX, y + 29.5);

  y += 42;

  // Optional Service Scheduling Work Order section
  if (details.vehicleName || details.scheduledDate || details.serviceMode) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(185, 28, 28);
    doc.text('CERTIFIED SERVICE SCHEDULING & DISPATCH RECORD', margin + 4, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`Vehicle: ${details.vehicleName || 'Tesla Registered Fleet'}`, margin + 4, y + 13);
    doc.text(
      `Appointment: ${details.scheduledDate || 'Scheduled'} ${details.timeSlot ? `@ ${details.timeSlot}` : ''}`,
      margin + contentWidth / 2,
      y + 13
    );
    doc.text(`Dispatch Mode: ${details.serviceMode || 'Apex Center Bay'}`, margin + 4, y + 18.5);
    doc.text(`Facility: ${(details.location || 'Apex Technology Center').slice(0, 42)}`, margin + contentWidth / 2, y + 18.5);

    if (details.technicianNotes) {
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Tech Notes: ${details.technicianNotes.slice(0, 92)}`, margin + 4, y + 24.5);
    }

    y += 35;
  }

  // Line-items Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPTION / ITEM', margin + 4, y + 6);
  doc.text('QTY', margin + contentWidth * 0.62, y + 6, { align: 'right' });
  doc.text('UNIT PRICE', margin + contentWidth * 0.80, y + 6, { align: 'right' });
  doc.text('AMOUNT', margin + contentWidth - 4, y + 6, { align: 'right' });

  y += 9;

  const items = details.items.length > 0
    ? details.items
    : [
        {
          name: categoryTitle,
          quantity: 1,
          unitPriceUsd: details.totalUsd,
          lineTotalUsd: details.totalUsd,
        },
      ];

  items.forEach((item, index) => {
    const rowHeight = item.category ? 12 : 9.5;
    if (y + rowHeight > 250) {
      doc.addPage();
      y = 20;
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(item.name.slice(0, 56), margin + 4, y + 5.5);

    if (item.category) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(item.category.slice(0, 50), margin + 4, y + 9.8);
    }

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(String(item.quantity), margin + contentWidth * 0.62, y + 6, { align: 'right' });
    doc.text(formatMoney(item.unitPriceUsd), margin + contentWidth * 0.80, y + 6, { align: 'right' });
    doc.setFont('courier', 'bold');
    doc.text(formatMoney(item.lineTotalUsd), margin + contentWidth - 4, y + 6, { align: 'right' });

    y += rowHeight;
  });

  y += 8;
  if (y + 38 > 256) {
    doc.addPage();
    y = 22;
  }

  // Left: Cryptographic Verification QR Block | Right: Totals Summary Box
  const qrBoxWidth = 92;
  drawQrVerificationBox(
    doc,
    margin,
    y,
    qrBoxWidth,
    invoiceNumber,
    txHash,
    details.totalUsd,
    statusLabel,
    paid
  );

  const summaryWidth = 78;
  const summaryX = pageWidth - margin - summaryWidth;
  let summaryY = y + 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', summaryX, summaryY);
  doc.setFont('courier', 'normal');
  doc.text(formatMoney(details.subtotalUsd), pageWidth - margin, summaryY, { align: 'right' });
  summaryY += 6;

  if (details.discountUsd > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(22, 163, 74);
    doc.text(`Discount${details.couponCode ? ` (${details.couponCode})` : ''}:`, summaryX, summaryY);
    doc.setFont('courier', 'bold');
    doc.text(`- ${formatMoney(details.discountUsd)}`, pageWidth - margin, summaryY, { align: 'right' });
    summaryY += 6;
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Shipping & Bay Handling:', summaryX, summaryY);
  doc.setFont('courier', 'normal');
  doc.text(details.shippingUsd > 0 ? formatMoney(details.shippingUsd) : '$0.00 USD (FREE)', pageWidth - margin, summaryY, {
    align: 'right',
  });
  summaryY += 6;

  doc.setFillColor(9, 13, 22);
  doc.roundedRect(summaryX - 4, summaryY, summaryWidth + 4, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(paid ? 'TOTAL PAID:' : 'TOTAL DUE:', summaryX, summaryY + 7.8);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(paid ? 52 : 251, paid ? 211 : 191, paid ? 153 : 36);
  doc.text(formatMoney(details.totalUsd), pageWidth - margin - 2, summaryY + 7.8, { align: 'right' });

  // Warranty & Legal Footer
  const footerY = 268;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Apex Tesla Hub 2-Year Warranty & Fitment Guarantee', margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This electronic tax invoice and settlement receipt is issued automatically upon verified Vault or On-Chain confirmation.',
    margin,
    footerY + 4.5
  );
  doc.text(
    `Generated automatically by Apex Tesla Hub Billing Engine · Reference: ${invoiceNumber}`,
    margin,
    footerY + 9
  );

  // Diagonal PAID rubber-stamp watermark overlay when settlement succeeded
  if (paid) {
    drawPaidWatermark(doc, invoiceNumber);
  }

  doc.save(filename);
}

export function downloadTransactionInvoicePdf(
  tx: Transaction,
  user?: Partial<User> | null,
  relatedBooking?: ServiceBooking
): string {
  const details = buildFallbackInvoiceDetails(tx, user, relatedBooking);
  const categoryTitle = inferCategoryLabel(tx, details);
  const safeFileBase = details.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safeFileBase}.pdf`;

  renderPdfInvoiceDocument(
    details.invoiceNumber,
    tx.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 16),
    tx.txHash,
    tx.status,
    details,
    categoryTitle,
    filename
  );

  return filename;
}

export function downloadServiceInvoicePdf(
  booking: ServiceBooking,
  user?: Partial<User> | null,
  relatedTx?: Transaction
): string {
  const invoiceNumber =
    booking.invoiceNumber || `INV-SRV-${booking.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-8)}`;

  const details: TransactionInvoiceDetails = relatedTx?.invoiceData || {
    invoiceNumber,
    receiptCategory: 'service_booking',
    customerName: user?.name || 'Tesla Owner',
    customerEmail: user?.email || 'member@apex-tesla.io',
    customerLocation: user?.location || booking.location,
    vehicleName: booking.vehicleName,
    serviceMode: booking.serviceMode,
    scheduledDate: booking.scheduledDate,
    timeSlot: booking.timeSlot,
    location: booking.location,
    technicianNotes: booking.technicianNotes,
    paymentMethod: booking.paidWith || 'Apex Dashboard Vault',
    subtotalUsd: booking.totalCostUsd,
    discountUsd: 0,
    shippingUsd: 0,
    totalUsd: booking.totalCostUsd,
    items: [
      {
        name: `${booking.serviceType}`,
        category: `${booking.vehicleName} · ${booking.serviceMode}`,
        quantity: 1,
        unitPriceUsd: booking.totalCostUsd,
        lineTotalUsd: booking.totalCostUsd,
      },
    ],
  };

  const filename = `${invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  renderPdfInvoiceDocument(
    invoiceNumber,
    `${booking.scheduledDate} ${booking.timeSlot}`,
    relatedTx?.txHash || `SRV-${booking.id.toUpperCase()}`,
    booking.status === 'Ready for Pickup / Complete' ? 'Paid · Completed' : `Paid · ${booking.status}`,
    details,
    'Certified Service & Repair Work Order Invoice',
    filename
  );

  return filename;
}
