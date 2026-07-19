import React from 'react';
import { X, Download, Eye } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title?: string;
  allowDownload?: boolean;
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  title = "File Preview",
  allowDownload = false
}: FilePreviewModalProps) {
  if (!isOpen) return null;



  const downloadFile = async () => {
    const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;

      link.setAttribute('download', fileName);

      document.body.appendChild(link);

      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

    } catch (err) {
      console.error('Download error:', err);
      alert(`Failed to download file: ${err.message}`);
    }
  }


  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const previewUrl = fileUrl;
  
  
  
  ;
 const isPdf = fileUrl.toLowerCase().endsWith('.pdf');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-4xl max-h-screen overflow-hidden bg-white rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="flex items-center space-x-2 text-xl font-bold text-gray-900">
            <Eye className="w-5 h-5" />
            <span>{title}</span>
          </h2>
          <div className="flex items-center space-x-2">
            {allowDownload && (
              <button
                onClick={downloadFile}
                className="p-2 text-gray-600 transition-colors rounded-lg hover:text-gray-800 hover:bg-gray-100"
                title="Download File"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 transition-colors rounded-lg hover:text-gray-800 hover:bg-gray-100"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* File Container */}
        <div className="p-4 max-h-[80vh] overflow-auto">
          <div className="flex justify-center">
            {isPdf ? (
              <iframe
                src={fileUrl}
                width="100%"
                height="600px"
                className="border-0 rounded-lg shadow-lg"
                title="PDF Preview"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Receipt Preview"
                className="object-contain max-w-full max-h-full rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.png';
                  target.alt = 'Image not found';
                }}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Click outside the file or press the X button to close
            </p>
            <div className="flex space-x-2">
              {allowDownload && (
                <button
                  onClick={downloadFile}
                  className="flex items-center px-4 py-2 space-x-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}