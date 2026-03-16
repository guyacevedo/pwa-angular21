import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ConfiguracionService } from './configuracion.service';
import { Empresa } from '../models/empresa.model';
import { LOGO_BASE64 } from '../utils/logo-base64';

@Injectable({ providedIn: 'root' })
export class PdfService {
  private configService = inject(ConfiguracionService);

  // ────── Constantes de diseño ──────
  private readonly BRAND_BLUE = [0, 47, 108] as [number, number, number]; // #002F6C
  private readonly BRAND_GOLD = [180, 83, 9] as [number, number, number]; // #b45309
  private readonly BRAND_LIGHT = [248, 250, 252] as [number, number, number];

  // ────── Header universal ──────
  private drawHeader(doc: jsPDF, config: Empresa | null): number {
    const pageW = doc.internal.pageSize.getWidth();

    // ── Logo SVG / PNG ──
    const logoX = 0;
    const logoY = 0;
    const logoH = 50; // más grande
    const logoW = logoH * 1.47;
    doc.addImage(LOGO_BASE64, 'PNG', logoX, logoY, logoW, logoH);

    // ── Logo tipográfico (columna izquierda, muy junto al logo) ──
    const textX = logoX + 60; // pegado
    let currentY = logoY + 15;

    // Brand name large — reference width
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    const brandText = 'MY COMPANY';
    const brandW = doc.getTextWidth(brandText);

    // "COMPANY" scaled to match brand text width
    const headerText = 'COMPANY';
    doc.setFontSize(16);
    const headerBaseW = doc.getTextWidth(headerText);
    const headerFontSize = Math.floor((brandW / headerBaseW) * 16 * 10) / 10;

    // Draw header
    doc.setFontSize(headerFontSize);
    doc.setTextColor(...this.BRAND_BLUE);
    doc.text(headerText, textX, currentY);

    // Draw brand name
    currentY += 8.5;
    doc.setFontSize(28);
    doc.text(brandText, textX, currentY);

    // Tagline
    currentY += 4.5;
    const taglineText = 'Brand Tagline';
    doc.setFontSize(10);
    doc.setTextColor(...this.BRAND_GOLD);
    const taglineW = doc.getTextWidth(taglineText);
    const taglineX = textX + (brandW - taglineW) / 2;
    doc.text(taglineText, taglineX, currentY);

    // Decorative line and motto
    const lineY = currentY + 2.5;
    const motto = 'Your company motto here.';
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const mottoW = doc.getTextWidth(motto);

    const lineW = Math.max(brandW, mottoW + 4);
    const centerX = textX + brandW / 2;

    doc.setFillColor(...this.BRAND_BLUE);
    doc.ellipse(centerX, lineY, lineW / 2, 0.45, 'F');

    const mottoY = lineY + 5.5;
    const mottoX = centerX - mottoW / 2;
    doc.setTextColor(...this.BRAND_BLUE);
    doc.text(motto, mottoX, mottoY);

    // Contact information (right column)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const empresa = config;
    const contactLines = [
      empresa?.nombre || 'Company Name',
      empresa?.nit ? `NIT: ${empresa.nit}` : 'NIT: —',
      empresa?.direccion || 'Company Address',
      empresa?.telefono || '',
      empresa?.email || 'contact@example.com',
    ].filter(Boolean);

    let lineContactY = 16;
    for (const line of contactLines) {
      doc.text(line, pageW - 14, lineContactY, { align: 'right' });
      lineContactY += 4.5;
    }

    return mottoY + 8;
  }

  // ────── Footer universal ──────
  private drawFooter(doc: jsPDF, config: Empresa | null, pageNum: number) {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...this.BRAND_BLUE);
    doc.setLineWidth(0.4);
    doc.line(14, pageH - 18, pageW - 14, pageH - 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    const pie =
      config?.pieDePaginaFactura ||
      'Thank you for your business.\nThis document is equivalent to a bill of exchange (Article 774 of the Commercial Code).';

    // Split text to handle multiple lines
    const pieLines = doc.splitTextToSize(pie, pageW - 28);
    const pieY = pieLines.length > 2 ? pageH - 14 : pageH - 12;
    doc.text(pieLines, 14, pieY);

    doc.text(`Page ${pageNum}`, pageW - 14, pageH - 7, { align: 'right' });
  }

  // ────── Sección de badge de estado ──────
  private drawBadge(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    color: [number, number, number],
  ) {
    doc.setFillColor(...color);
    doc.roundedRect(x, y - 4, 36, 6, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(text.toUpperCase(), x + 18, y, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }

  // ────── Bloque de información (2 columnas) ──────
  private drawInfoBloc(
    doc: jsPDF,
    startY: number,
    izq: string[][],
    der: string[][],
    titulo: string,
  ): number {
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(...this.BRAND_LIGHT);
    doc.roundedRect(14, startY, pageW - 28, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...this.BRAND_BLUE);
    doc.text(titulo.toUpperCase(), 17, startY + 4.2);

    let y = startY + 10;
    const leftX = 17;
    const rightX = pageW / 2 + 4;

    const maxRows = Math.max(izq.length, der.length);
    for (let i = 0; i < maxRows; i++) {
      if (izq[i]) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(80, 80, 80);
        doc.text(izq[i][0] + ':', leftX, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(izq[i][1] || '', leftX + 40, y);
      }
      if (der[i]) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(80, 80, 80);
        doc.text(der[i][0] + ':', rightX, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(der[i][1] || '', rightX + 40, y);
      }
      y += 5.5;
    }
    return y + 4;
  }

  private fmt(n: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(n);
  }

  private fmtDate(d: Date | string | number | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // ════════════════════════════════════════════════
  // 1. Factura A4
  // ════════════════════════════════════════════════
  generarFacturaA4(): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const config = this.configService.config();
    let y = this.drawHeader(doc, config);

    const pageW = doc.internal.pageSize.getWidth();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...this.BRAND_BLUE);
    doc.text(`FACTURA`, 14, y + 6);

    const estadoColor = [22, 163, 74] as [number, number, number];
    this.drawBadge(doc, 'VÁLIDA', pageW - 40, y + 6, estadoColor);
    y += 14;

    // Info
    y = this.drawInfoBloc(
      doc,
      y,
      [['Fecha', this.fmtDate(new Date())]],
      [['Observación', '—']],
      'Datos de la Factura',
    );

    // Items
    const items = Array.of({
      producto: {
        nombre: 'Producto 1',
        especie: 'Especie 1',
        talla: 'Talla 1',
      },
      observacion: 'Observacion 1',
      minGramos: 0,
      maxGramos: 0,
      precio: 100,
      subtotal: 100,
    });

    if (items.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Producto', 'Observación', 'Rango (gramos)', 'Precio Kg.']],
        body: items.map((i) => {
          const rangoG =
            i.minGramos > 0 || i.maxGramos > 0 ? `${i.minGramos} - ${i.maxGramos} gramos` : '—';
          return [i.producto.nombre, i.observacion || '—', rangoG, `${this.fmt(i.precio)}/kg`];
        }),
        theme: 'striped',
        headStyles: { fillColor: this.BRAND_BLUE, fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        margin: { left: 14, right: 14 },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
    }

    // Totales eliminados por petición del usuario

    this.drawFooter(doc, config, 1);
    doc.save(`Factura-${this.fmtDate(new Date())}.pdf`);
  }

  // ════════════════════════════════════════════════
  // 2. Ticket 48mm
  // ════════════════════════════════════════════════
  generarTicket48mm(): void {
    const doc = new jsPDF({ unit: 'mm', format: [48, 297] });
    const config = this.configService.config();
    const margin = 2;
    const pageW = 48;

    let y = 4;

    const logoW = 20;
    const logoH = logoW / 1.47;
    doc.addImage(LOGO_BASE64, 'PNG', (pageW - logoW) / 2, y, logoW, logoH);
    y += logoH + 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...this.BRAND_BLUE);
    doc.text('COMERCIALIZADORA NEYMAR', pageW / 2, y, { align: 'center' });
    y += 3;
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`NIT: ${config?.nit || '—'}`, pageW / 2, y, { align: 'center' });
    y += 2.5;
    doc.text(config?.telefono || '—', pageW / 2, y, { align: 'center' });
    y += 3;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, pageW - margin, y);
    doc.setLineDashPattern([], 0);
    y += 3;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    this.drawCenteredText(doc, `TICKET`, pageW / 2, y, pageW - 4);
    y += 3.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`Fecha: ${this.fmtDate(new Date())}`, margin, y);
    y += 3;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, pageW - margin, y);
    doc.setLineDashPattern([], 0);
    y += 3;

    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCTO                             PRECIO', margin, y);
    y += 3;
    doc.setFont('helvetica', 'normal');

    const items = Array.of({
      precio: 100,
      producto: {
        nombre: 'Producto 1',
      },
      minGramos: 0,
      maxGramos: 0,
      observacion: '',
    });
    items.forEach((item) => {
      const price = `${this.fmt(item.precio)}/kg`;
      const nombreSplit = doc.splitTextToSize(item.producto.nombre, 35);

      doc.text(nombreSplit[0], margin, y);
      doc.text(price, pageW - margin, y, { align: 'right' });
      y += 2.5;

      if (nombreSplit.length > 1) {
        for (let i = 1; i < nombreSplit.length; i++) {
          doc.text(nombreSplit[i], margin, y);
          y += 2.5;
        }
      }

      if (item.minGramos > 0 || item.maxGramos > 0) {
        doc.setFontSize(5.5);
        doc.setTextColor(80, 80, 80);
        doc.text(`Rango: ${item.minGramos} - ${item.maxGramos} gramos`, margin, y);
        doc.setFontSize(6);
        doc.setTextColor(0, 0, 0);
        y += 2.5;
      }

      if (item.observacion) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(5);
        const obsSplit = doc.splitTextToSize(`* ${item.observacion}`, pageW - margin * 2);
        doc.text(obsSplit, margin, y);
        y += obsSplit.length * 2;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
      }
      y += 1;
    });

    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, pageW - margin, y);
    doc.setLineDashPattern([], 0);
    y += 3;

    // Totales eliminados por petición del usuario

    doc.setFontSize(5);
    doc.setFont('helvetica', 'italic');
    doc.text('Sujeto a cambios.', pageW / 2, y, { align: 'center' });

    doc.save(`Ticket-48mm-${this.fmtDate(new Date())}.pdf`);
  }

  private drawCenteredText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number): void {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      doc.text(line, x, y + index * 3, { align: 'center' });
    });
  }
}
