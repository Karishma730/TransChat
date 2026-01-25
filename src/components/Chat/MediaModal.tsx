import React from 'react';
import { X, Download } from 'lucide-react';

interface MediaModalProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  fileName?: string;
  onClose: () => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  mediaUrl,
  mediaType,
  fileName,
  onClose,
}) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = mediaUrl;
    a.download = fileName || `media_${Date.now()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
        {mediaType === 'image' ? (
          <img
            src={mediaUrl}
            alt="Full size media"
            className="max-w-full max-h-[80vh] object-contain"
          />
        ) : (
          <video
            src={mediaUrl}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] object-contain"
          />
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          title="Close"
        >
          <X size={24} />
        </button>

        <button
          onClick={handleDownload}
          className="absolute bottom-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          title="Download"
        >
          <Download size={24} />
        </button>
      </div>
    </div>
  );
};
