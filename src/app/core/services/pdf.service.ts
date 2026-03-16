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

    // "NEYMAR" grande — referencia base de ancho
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    const neymarText = 'NEYMAR';
    const neymarW = doc.getTextWidth(neymarText); // ancho real en mm

    // "COMERCIALIZADORA" escalada para ocupar exactamente el ancho de NEYMAR
    const comercText = 'COMERCIALIZADORA';
    doc.setFontSize(16); // medir primero en tamaño base
    const comercBaseW = doc.getTextWidth(comercText);
    const comercFontSize = Math.floor((neymarW / comercBaseW) * 16 * 10) / 10;

    // Dibujar "COMERCIALIZADORA" escalada
    doc.setFontSize(comercFontSize);
    doc.setTextColor(...this.BRAND_BLUE);
    doc.text(comercText, textX, currentY);

    // Dibujar "NEYMAR"
    currentY += 8.5;
    doc.setFontSize(28);
    doc.text(neymarText, textX, currentY);

    // "Pesca & Distribución" centrado bajo Neymar y en color #b45309 (oro marca)
    currentY += 4.5;
    const pescaText = 'Pesca & Distribución';
    doc.setFontSize(10);
    doc.setTextColor(...this.BRAND_GOLD);
    const pescaW = doc.getTextWidth(pescaText);
    const pescaX = textX + (neymarW - pescaW) / 2; // Centrado exacto
    doc.text(pescaText, pescaX, currentY);

    // ── Línea con curva lisa (elipse) y Slogan dorado ──
    const lineY = currentY + 2.5;

    const slogan = 'Del río a su mesa, frescura que se nota.';
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const sloganW = doc.getTextWidth(slogan);

    // Centramos línea y lema basados en el mayor ancho
    const lineW = Math.max(neymarW, sloganW + 4);
    const centerX = textX + neymarW / 2;

    // Línea gruesa en el centro y afilada en las puntas (dibujada como elipse fina en y)
    doc.setFillColor(...this.BRAND_BLUE);
    doc.ellipse(centerX, lineY, lineW / 2, 0.45, 'F');

    // Slogan en cursiva bajo la línea, también dorado y centrado
    const sloganY = lineY + 5.5;
    const sloganX = centerX - sloganW / 2; // Centrado exacto
    // "Del río a su mesa... tambien debe ser dorado"
    doc.setTextColor(...this.BRAND_BLUE);
    doc.text(slogan, sloganX, sloganY);

    // ── Datos de contacto (columna derecha) ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85); // Slate slate para visibilidad sobre blanco
    const empresa = config;
    const contactLines = [
      empresa?.nombre || 'Comercializadora Neymar',
      empresa?.nit ? `NIT: ${empresa.nit}` : 'NIT: —',
      empresa?.direccion || 'Avenida la Candelaria, Cra. 3 #20-29, Magangué',
      empresa?.telefono || '',
      empresa?.email || 'contacto@comercializadora-neymar.com',
    ].filter(Boolean);

    let lineContactY = 16;
    for (const line of contactLines) {
      doc.text(line, pageW - 14, lineContactY, { align: 'right' });
      lineContactY += 4.5;
    }

    return sloganY + 8; // Y de inicio del contenido
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
      'Cámara de Comercio Magangué · Matrícula 44760 · Comercio al por mayor y menor de pescados\nEsta factura se asimila en todos sus efectos a una letra de cambio (Art. 774 del Código de Comercio).';

    // Split text to handle multiple lines
    const pieLines = doc.splitTextToSize(pie, pageW - 28);
    const pieY = pieLines.length > 2 ? pageH - 14 : pageH - 12;
    doc.text(pieLines, 14, pieY);

    doc.text(`Página ${pageNum}`, pageW - 14, pageH - 7, { align: 'right' });
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
      doc.text(line, x, y + (index * 3), { align: 'center' });
    });
  }
}
