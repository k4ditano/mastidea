'use client';

import { Idea } from '@/types';
import { exportToMarkdown, exportToPDF, downloadAsFile } from '@/lib/exportUtils';
import { FaFileCode, FaFilePdf } from 'react-icons/fa';

interface ExportButtonsProps {
  idea: Idea;
}

export default function ExportButtons({ idea }: ExportButtonsProps) {
  const handleExportMarkdown = () => {
    const markdown = exportToMarkdown(idea);
    const fileName = `${idea.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    downloadAsFile(markdown, fileName, 'text/markdown');
  };

  const handleExportPDF = () => {
    exportToPDF(idea);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={handleExportMarkdown}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
        title="Exportar como Markdown"
      >
        <FaFileCode className="w-4 h-4" />
        Markdown
      </button>
      
      <button
        onClick={handleExportPDF}
        className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-sm font-medium"
        title="Exportar como PDF"
      >
        <FaFilePdf className="w-4 h-4" />
        PDF
      </button>
    </div>
  );
}
