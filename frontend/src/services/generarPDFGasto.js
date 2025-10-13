import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import { calcularGastos, formatearMoneda, formatearFecha } from '../utils/gastoCalculator';

/**
 * Genera un PDF con las dos tablas de gastos
 * 
 * @param {Object} options - Opciones del PDF
 * @param {Object} options.gastoData - Datos del gasto individual
 * @param {Array} options.consignaciones - Array de consignaciones (opcional)
 * @param {Array} options.imagenes - Array de imágenes base64 (opcional)
 * @param {String} options.nombrePDF - Nombre del PDF a generar
 * @returns {Blob} Blob del PDF generado
 */
export const generarPDFGasto = async ({
  gastoData = {},
  consignaciones = [],
  imagenes = [],
  nombrePDF = 'Reporte_Gastos',
}) => {
  try {
    // Crear documento PDF
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Color tema
    const colorEncabezado = [33, 150, 243]; // Azul
    const colorTexto = [0, 0, 0];
    const colorFondo = [240, 248, 255];

    // ENCABEZADO
    doc.setFillColor(...colorEncabezado);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE GASTOS Y CONSIGNACIONES', pageWidth / 2, yPosition + 10, { align: 'center' });
    
    yPosition += 20;

    // Fecha de generación
    doc.setTextColor(...colorTexto);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${dayjs().format('DD/MM/YYYY HH:mm')}`, margin, yPosition);
    yPosition += 8;

    // TABLA 1: GASTOS SERVICIOS
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TABLA 1: GASTOS SERVICIOS', margin, yPosition);
    yPosition += 8;

    const tabla1Data = [
      ['Fecha', 'Categoría', 'Descripción', 'Valor'],
      [
        formatearFecha(gastoData?.fecha),
        gastoData?.categoria || 'N/A',
        gastoData?.descripcion || 'N/A',
        formatearMoneda(gastoData?.monto),
      ],
      ['', '', 'TOTAL', formatearMoneda(gastoData?.monto)],
    ];

    doc.autoTable({
      startY: yPosition,
      head: [tabla1Data[0]],
      body: tabla1Data.slice(1),
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: colorEncabezado,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        textColor: colorTexto,
      },
      alternateRowStyles: {
        fillColor: colorFondo,
      },
      columnStyles: {
        3: { halign: 'right' }, // Alinear valores a la derecha
      },
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // TABLA 2: BALANCE CONSIGNACIÓN Y GASTOS
    doc.setFont('helvetica', 'bold');
    doc.text('TABLA 2: BALANCE CONSIGNACIÓN Y GASTOS', margin, yPosition);
    yPosition += 8;

    // Calcular totales
    const calculos = calcularGastos(gastoData, consignaciones);

    const tabla2Data = [
      ['Concepto', 'Valor'],
      ['Total Consignado', formatearMoneda(calculos.totalConsignado)],
      ['Total Gastos', formatearMoneda(calculos.totalGastos)],
      ['', ''],
      ['Vueltas a Favor de ABRECAR', formatearMoneda(calculos.vueltasAFavorDeAbrecar)],
      ['Excedente a Favor de JG', formatearMoneda(calculos.excedenteAFavorDeJG)],
    ];

    doc.autoTable({
      startY: yPosition,
      head: [tabla2Data[0]],
      body: tabla2Data.slice(1),
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: colorEncabezado,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        textColor: colorTexto,
      },
      alternateRowStyles: {
        fillColor: colorFondo,
      },
      columnStyles: {
        1: { halign: 'right' },
      },
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // IMÁGENES (si hay)
    if (imagenes && imagenes.length > 0) {
      // Verificar si cabe en la página actual
      if (yPosition + 50 > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('ARCHIVOS ADJUNTOS', margin, yPosition);
      yPosition += 10;

      // Mostrar máximo 2 imágenes por página
      let imagenesEnPagina = 0;
      const maxImagenesPerPage = 2;

      imagenes.forEach((imagen, index) => {
        if (imagenesEnPagina >= maxImagenesPerPage) {
          doc.addPage();
          yPosition = margin;
          imagenesEnPagina = 0;
        }

        try {
          const imgWidth = (pageWidth - 3 * margin) / 2;
          const imgHeight = 60;
          const xPos = margin + (index % 2) * (imgWidth + margin);

          doc.addImage(imagen, 'JPEG', xPos, yPosition, imgWidth, imgHeight);

          if ((index + 1) % 2 === 0) {
            yPosition += imgHeight + 10;
          }

          imagenesEnPagina++;
        } catch (error) {
          console.error(`Error agregando imagen ${index}:`, error);
        }
      });
    }

    // Guardar PDF
    const nombreFinal = nombrePDF.endsWith('.pdf') ? nombrePDF : `${nombrePDF}.pdf`;
    doc.save(nombreFinal);

    // Retornar blob para posible envío al backend
    return doc.output('blob');
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
};