'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

// Utility functions
function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function isImageFile(filename: string, type: string): boolean {
  return type.startsWith('image/');
}

interface FileUploadProps {
  onUpload: (files: UploadedFile[]) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  folder?: string;
  disabled?: boolean;
  className?: string;
  uploadedFiles?: UploadedFile[]; // Already uploaded files
  onRemoveFile?: (index: number) => void; // Function to remove uploaded file
}

interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export default function FileUpload({
  onUpload,
  onError,
  multiple = true,
  accept = 'image/*,.pdf',
  maxSize = 10 * 1024 * 1024, // 10MB
  folder = 'uploads',
  disabled = false,
  className = '',
  uploadedFiles = [],
  onRemoveFile,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const handleUpload = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || acceptedFiles.length === 0) return;

      setUploading(true);
      setProgress({});

      try {
        const formData = new FormData();
        acceptedFiles.forEach(file => {
          formData.append('files', file);
        });
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();

        if (data.success) {
          // Handle both single file and multiple files response
          const uploadedFileData = data.file ? [data.file] : data.files || [];

          if (replacingIndex !== null) {
            // Replace specific file
            const newFiles = [...uploadedFiles];
            newFiles[replacingIndex] = uploadedFileData[0];
            onUpload(newFiles);
          } else {
            // Add new files
            onUpload(uploadedFileData);
          }
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        onError?.(message);
        console.error('Upload error:', error);
      } finally {
        setUploading(false);
        setProgress({});
        setReplacingIndex(null);
      }
    },
    [disabled, folder, onUpload, onError, uploadedFiles, replacingIndex]
  );

  const handleReplaceFile = useCallback(
    (index: number) => {
      setReplacingIndex(index);
      // Trigger file selection
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          handleUpload(Array.from(files));
        }
      };
      input.click();
    },
    [accept, handleUpload]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop: handleUpload,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize,
    multiple,
    disabled: disabled || uploading,
  });

  const getIcon = () => {
    if (uploading) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      );
    }

    if (isDragActive && !isDragReject) {
      return (
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.1 }}
          className="w-12 h-12 text-green-500"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </motion.div>
      );
    }

    if (isDragReject) {
      return (
        <div className="w-12 h-12 text-red-500">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }

    return (
      <div className="w-12 h-12 text-gray-400">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
        </svg>
      </div>
    );
  };

  const getMessage = () => {
    if (uploading) return 'Uploading...';
    if (isDragActive && !isDragReject) return 'Drop files here';
    if (isDragReject) return 'File type not supported';
    return multiple
      ? 'Drop files here or click to browse'
      : 'Drop a file here or click to browse';
  };

  const getSubMessage = () => {
    if (uploading) return 'Please wait while your files are being uploaded';
    if (isDragReject) return `Accepted formats: images and PDFs up to ${formatFileSize(maxSize)}`;
    return `Accepted formats: images and PDFs up to ${formatFileSize(maxSize)}`;
  };

  return (
    <div className={`file-upload ${className}`}>
      {/* Display uploaded files first if any */}
      {uploadedFiles.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Files:</h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={`${file.url}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm group"
              >
                {/* Preview */}
                <div className="mb-3 relative">
                  {isImageFile(file.filename, file.type) ? (
                    <>
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="w-full h-32 object-cover rounded cursor-pointer"
                        onClick={() => window.open(file.url, '_blank')}
                      />
                      {/* Overlay buttons */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 rounded">
                        <button
                          onClick={() => handleReplaceFile(index)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                          title="Replace image"
                        >
                          Replace
                        </button>
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-800 transition-colors"
                          title="View full size"
                        >
                          View
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-500">PDF</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="text-sm">
                  <p className="font-medium text-gray-900 truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Remove Button */}
                {onRemoveFile && (
                  <button
                    onClick={() => onRemoveFile(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
                    title="Remove file"
                  >
                    ×
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive && !isDragReject ? 'border-green-500 bg-green-50' : ''}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${!isDragActive ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50' : ''}
          ${(disabled || uploading) ? 'opacity-50 cursor-not-allowed' : ''}
          ${replacingIndex !== null ? 'border-blue-500 bg-blue-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-3">
          {getIcon()}

          <div>
            <p className="text-lg font-medium text-gray-700 mb-1">
              {replacingIndex !== null ? `Replacing file ${replacingIndex + 1}...` : getMessage()}
            </p>
            <p className="text-sm text-gray-500">
              {getSubMessage()}
            </p>
          </div>
        </div>

        {uploading && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-lg"
          />
        )}
      </div>

      {/* Display rejected files */}
      {fileRejections && fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Rejected Files:
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                <span className="font-medium">{file.name}</span>
                <ul className="ml-4 text-xs">
                  {errors.map((error) => (
                    <li key={error.code}>• {error.message}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface FilePreviewProps {
  files: UploadedFile[];
  onRemove?: (index: number) => void;
  className?: string;
}

export function FilePreview({ files, onRemove, className = '' }: FilePreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className={`file-preview ${className}`}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file, index) => (
          <motion.div
            key={`${file.url}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            {/* Preview */}
            <div className="mb-3">
              {isImageFile(file.filename, file.type) ? (
                <img
                  src={file.url}
                  alt={file.filename}
                  className="w-full h-24 object-cover rounded"
                />
              ) : (
                <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500">PDF</p>
                  </div>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="text-sm">
              <p className="font-medium text-gray-900 truncate" title={file.filename}>
                {file.filename}
              </p>
              <p className="text-gray-500 text-xs">
                {formatFileSize(file.size)}
              </p>
            </div>

            {/* Remove Button */}
            {onRemove && (
              <button
                onClick={() => onRemove(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                title="Remove file"
              >
                ×
              </button>
            )}

            {/* View Button */}
            <button
              onClick={() => window.open(file.url, '_blank')}
              className="absolute top-2 right-2 w-6 h-6 bg-gray-800 bg-opacity-50 text-white rounded-full text-xs hover:bg-opacity-70 transition-colors"
              title="View file"
            >
              👁
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}