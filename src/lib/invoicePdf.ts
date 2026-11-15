import { jsPDF } from 'jspdf';
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

  // Totals Summary Box (Right aligned)
  const summaryWidth = 78;
  const summaryX = pageWidth - margin - summaryWidth;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', summaryX, y);
  doc.setFont('courier', 'normal');
  doc.text(formatMoney(details.subtotalUsd), pageWidth - margin, y, { align: 'right' });
  y += 6;

  if (details.discountUsd > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(22, 163, 74);
    doc.text(`Discount${details.couponCode ? ` (${details.couponCode})` : ''}:`, summaryX, y);
    doc.setFont('courier', 'bold');
    doc.text(`- ${formatMoney(details.discountUsd)}`, pageWidth - margin, y, { align: 'right' });
    y += 6;
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Shipping & Bay Handling:', summaryX, y);
  doc.setFont('courier', 'normal');
  doc.text(details.shippingUsd > 0 ? formatMoney(details.shippingUsd) : '$0.00 USD (FREE)', pageWidth - margin, y, {
    align: 'right',
  });
  y += 6;

  doc.setFillColor(9, 13, 22);
  doc.roundedRect(summaryX - 4, y, summaryWidth + 4, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL PAID:', summaryX, y + 7.8);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(52, 211, 153);
  doc.text(formatMoney(details.totalUsd), pageWidth - margin - 2, y + 7.8, { align: 'right' });

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
