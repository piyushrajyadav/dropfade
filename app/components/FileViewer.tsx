"use client";

import { useState, useEffect } from 'react';
import { getMetadata, markAsDownloaded } from '../lib/redis';
import { FileMetadata } from '../types';
import toast from 'react-hot-toast';
import { ShareIcon } from '@heroicons/react/24/outline';

interface FileViewerProps {
  code: string;
}

export default function FileViewer({ code }: FileViewerProps) {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await getMetadata(code);
        if (!data) {
          setError('File not found. The code may be incorrect or expired.');
          return;
        }
        setMetadata(data);
      } catch (err) {
        setError('Failed to load file information. Please try again.');
        console.error('Error fetching metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [code]);

  const handleDownload = async () => {
    if (!metadata) return;

    try {
      // Download the file first
      const response = await fetch(metadata.url);
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = metadata.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Mark as downloaded and delete immediately
      await markAsDownloaded(code);
      toast.success('File downloaded successfully. This link is now expired.');
      
      // Update UI to show file is no longer available
      setMetadata(null);
      setError('This file has been accessed and is no longer available.');
      
    } catch (err) {
      toast.error('Failed to download file. Please try again.');
      console.error('Download error:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading file information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!metadata) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            {metadata.filename}
          </h2>
          <p className="text-sm text-gray-500">
            {metadata.type === 'file' ? 'File' : 'Text Message'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            Expires: {new Date(metadata.expiresAt).toLocaleString()}
          </p>
          {metadata.hasDownloaded && (
            <p className="text-sm text-yellow-600 mt-1">
              This file has been downloaded
            </p>
          )}
        </div>
      </div>

      {metadata.type === 'text' ? (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <pre className="text-gray-900 font-mono whitespace-pre-wrap break-words">{metadata.content || ''}</pre>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="w-16 h-16 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">
            {metadata.filename} {metadata.size ? `(${Math.round(metadata.size / 1024)} KB)` : ''}
          </p>
        </div>
      )}

      <div className="flex justify-center space-x-4 mb-6">
        {metadata.type === 'file' ? (
          <>
            {metadata.mimeType === 'application/pdf' && (
              <>
                <button
                  onClick={() => window.open(metadata.url, '_blank')}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  View PDF
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download PDF
                </button>
              </>
            )}
            {metadata.mimeType !== 'application/pdf' && (
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download File
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={async () => {
                if (metadata.content) {
                  const textWindow = window.open('', '_blank');
                  if (textWindow) {
                    textWindow.document.write(`
                      <html>
                        <head>
                          <title>Text Message</title>
                          <style>
                            body {
                              font-family: monospace;
                              white-space: pre-wrap;
                              padding: 20px;
                              background: #f9fafb;
                              color: #111827;
                            }
                          </style>
                        </head>
                        <body>${metadata.content}</body>
                      </html>
                    `);
                    textWindow.document.close();
                  }
                  
                  // Mark as viewed and delete immediately
                  await markAsDownloaded(code);
                  toast.success('Text viewed. This link is now expired.');
                  
                  // Update UI to show text is no longer available
                  setMetadata(null);
                  setError('This text has been accessed and is no longer available.');
                }
              }}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Text
            </button>
            <button
              onClick={async () => {
                if (metadata.content) {
                  navigator.clipboard.writeText(metadata.content);
                  toast.success('Text copied to clipboard! This link is now expired.');
                  
                  // Mark as accessed and delete immediately
                  await markAsDownloaded(code);
                  
                  // Update UI to show text is no longer available
                  setMetadata(null);
                  setError('This text has been accessed and is no longer available.');
                }
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Copy Text
            </button>
          </>
        )}
      </div>
      
      {/* Share section */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center justify-center">
          <ShareIcon className="w-5 h-5 mr-2" />
          Share via
        </h3>
        
        {(() => {
          const shareUrl = `${window.location.origin}/file/${code}`;
          const shareMessage = `I've shared ${metadata.type === 'text' ? 'a message' : 'a file'} with you via DropKey. Access it here: ${shareUrl}`;
          const encodedShareMessage = encodeURIComponent(shareMessage);
          const encodedShareUrl = encodeURIComponent(shareUrl);
          
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
              {/* WhatsApp */}
              <a 
                href={`https://wa.me/?text=${encodedShareMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-3 bg-[#25D366] text-white rounded-lg hover:bg-opacity-90 transition-all"
              >
                <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              
              {/* Telegram */}
              <a 
                href={`https://t.me/share/url?url=${encodedShareUrl}&text=${encodeURIComponent(`I've shared ${metadata.type === 'text' ? 'a message' : 'a file'} with you via DropKey.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-3 bg-[#0088cc] text-white rounded-lg hover:bg-opacity-90 transition-all"
              >
                <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.5 6.618-.5 6.618l-.012.04c-.44.397-.16.54-.427.413-.245-.117-3.648-2.154-4.12-2.427-.21-.122-.356-.233-.356-.36 0-.08.055-.145.21-.278.52-.457 4.443-3.948 4.61-4.087.092-.077.146-.154.085-.24-.06-.087-.197-.045-.285-.028-.146.03-2.493 1.536-7.04 4.517-.265.17-.499.254-.699.254-.233 0-.453-.087-.65-.26-.265-.233-.467-.46-.484-.67-.018-.21.161-.404.483-.59.898-.519 1.987-1.12 3.267-1.8 3.195-1.683 5.329-2.775 6.393-3.313a.915.915 0 0 1 .58-.167l.013.001z"/>
                </svg>
                Telegram
              </a>
              
              {/* Email */}
              <a 
                href={`mailto:?subject=DropKey: I've shared ${metadata.type === 'text' ? 'a message' : 'a file'} with you&body=${encodedShareMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-3 bg-[#EA4335] text-white rounded-lg hover:bg-opacity-90 transition-all"
              >
                <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Email
              </a>
              
              {/* SMS */}
              <a 
                href={`sms:?body=${encodedShareMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-3 bg-[#5BC236] text-white rounded-lg hover:bg-opacity-90 transition-all"
              >
                <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm8 0h2v2h-2zm-4 0h2v2h-2z"/>
                </svg>
                SMS
              </a>
            </div>
          );
        })()}
      </div>
    </div>
  );
}