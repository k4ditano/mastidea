import { Idea, EXPANSION_TYPE_LABELS } from '@/types';
import jsPDF from 'jspdf';

/**
 * Exporta una idea completa a formato Markdown
 */
export function exportToMarkdown(idea: Idea): string {
  const lines: string[] = [];
  
  // Título
  lines.push(`# ${idea.title}\n`);
  
  // Metadata
  lines.push(`**Estado:** ${idea.status === 'ACTIVE' ? 'Activa' : 'Completada'}`);
  lines.push(`**Fecha de creación:** ${new Date(idea.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}\n`);
  
  // Tags
  if (idea.tags && idea.tags.length > 0) {
    lines.push(`**Tags:** ${idea.tags.map(ideaTag => `\`${ideaTag.tag.name}\``).join(', ')}\n`);
  }
  
  // Contenido principal
  lines.push(`## Descripción\n`);
  lines.push(`${idea.content}\n`);
  
  // Expansiones
  if (idea.expansions && idea.expansions.length > 0) {
    lines.push(`## Desarrollo de la Idea\n`);
    
    idea.expansions.forEach((expansion, index) => {
      const typeInfo = EXPANSION_TYPE_LABELS[expansion.type];
      const typeLabel = `${typeInfo.emoji} ${typeInfo.label}`;
      
      lines.push(`### ${index + 1}. ${typeLabel}`);
      
      if (expansion.userMessage) {
        lines.push(`**Pregunta:** ${expansion.userMessage}`);
      }
      
      lines.push(`\n${expansion.content}\n`);
      
      lines.push(`*Fecha: ${new Date(expansion.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}*\n`);
    });
  }
  
  // Footer
  lines.push(`---\n`);
  lines.push(`*Exportado desde Mastidea el ${new Date().toLocaleDateString('es-ES')}*`);
  
  return lines.join('\n');
}

/**
 * Exporta una idea completa a PDF
 */
export function exportToPDF(idea: Idea): void {
  const doc = new jsPDF();
  
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  
  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(idea.title, maxWidth);
  doc.text(titleLines, margin, yPos);
  yPos += titleLines.length * 10 + 5;
  
  // Metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  
  const statusText = `Estado: ${idea.status === 'ACTIVE' ? 'Activa' : 'Completada'}`;
  doc.text(statusText, margin, yPos);
  yPos += 6;
  
  const dateText = `Fecha: ${new Date(idea.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`;
  doc.text(dateText, margin, yPos);
  yPos += 10;
  
  // Tags
  if (idea.tags && idea.tags.length > 0) {
    const tagsText = `Tags: ${idea.tags.map(ideaTag => ideaTag.tag.name).join(', ')}`;
    doc.text(tagsText, margin, yPos);
    yPos += 10;
  }
  
  // Línea separadora
  doc.setDrawColor(200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  // Descripción
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Descripción', margin, yPos);
  yPos += 8;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const contentLines = doc.splitTextToSize(idea.content, maxWidth);
  contentLines.forEach((line: string) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });
  yPos += 5;
  
  // Expansiones
  if (idea.expansions && idea.expansions.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Desarrollo de la Idea', margin, yPos);
    yPos += 10;
    
    idea.expansions.forEach((expansion, index) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      // Tipo de expansión
      const typeInfo = EXPANSION_TYPE_LABELS[expansion.type];
      const typeLabel = `${typeInfo.emoji} ${typeInfo.label}`;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${typeLabel}`, margin, yPos);
      yPos += 7;
      
      // Pregunta del usuario si existe
      if (expansion.userMessage) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100);
        const questionLines = doc.splitTextToSize(`Pregunta: ${expansion.userMessage}`, maxWidth);
        questionLines.forEach((line: string) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, margin, yPos);
          yPos += 5;
        });
        yPos += 2;
      }
      
      // Contenido de la expansión
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      const expLines = doc.splitTextToSize(expansion.content, maxWidth);
      expLines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      
      // Fecha
      doc.setFontSize(8);
      doc.setTextColor(150);
      const expDate = new Date(expansion.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Fecha: ${expDate}`, margin, yPos);
      yPos += 10;
    });
  }
  
  // Footer en todas las páginas
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Exportado desde Mastidea - ${new Date().toLocaleDateString('es-ES')}`,
      margin,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin - 30,
      doc.internal.pageSize.getHeight() - 10
    );
  }
  
  // Descargar
  const fileName = `${idea.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  doc.save(fileName);
}

/**
 * Descarga un string como archivo
 */
export function downloadAsFile(content: string, filename: string, type: string = 'text/markdown'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
