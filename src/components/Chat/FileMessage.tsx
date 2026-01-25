import React from 'react';
import { FileText, Download } from 'lucide-react';

interface FileMessageProps {
  fileName: string;
  fileSize?: number;
  mediaUrl: string;
}

export const FileMessage: React.FC<FileMessageProps> = ({ fileName, fileSize, mediaUrl }) => {
  const getFileExtension = (name: string) => {
    return name.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-600 rounded-lg p-3 max-w-xs">
      <div className="flex-shrink-0 bg-teal-100 dark:bg-teal-900 p-2 rounded">
        <FileText size={20} className="text-teal-600 dark:text-teal-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {fileName}
        </p>
        {fileSize && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(fileSize)}
          </p>
        )}
      </div>
      <button
        onClick={handleDownload}
        className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        title="Download file"
      >
        <Download size={18} className="text-teal-600 dark:text-teal-400" />
      </button>
    </div>
  );
};
