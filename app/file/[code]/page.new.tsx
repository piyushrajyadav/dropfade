"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileMetadata } from '../../types';
import { ShareIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ExpiredLinkMessage from '../../components/ExpiredLinkMessage';
import { use } from 'react';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function FilePage({ params }: PageProps) {
  const router = useRouter();
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);
  
  // Always define all hooks at the top level, regardless of conditions
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        console.log('Fetching metadata for code:', resolvedParams.code);
        const response = await fetch(`/api/file/${resolvedParams.code}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.message || 'Failed to fetch file metadata');
        }

        const data = await response.json();
        console.log('Received metadata:', data);
        setMetadata(data);
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch file metadata');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [resolvedParams.code]);

  // This effect handles auto-deletion of text content
  // It will only execute its logic if the conditions are met
  useEffect(() => {
    // Only proceed with the timer logic if we have text content
    if (!metadata || loading || error || metadata.type !== 'text') {
      return; // Early return if conditions aren't met
    }
    
    console.log('Setting up text content auto-deletion timer');
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/file/delete/${resolvedParams.code}`, { method: 'POST' });
        console.log('Text content deleted after viewing');
        setMetadata(null);
        setError('This message has been deleted after viewing.');
      } catch (err) {
        console.error('Error deleting text content:', err);
      }
    }, 5000);
    
    // Cleanup function
    return () => clearTimeout(timer);
  }, [metadata, loading, error, resolvedParams.code]);

  // Handle file downloads
  const handleDownload = async () => {
    if (!metadata) return;

    try {
      console.log('Starting file download...');
      const response = await fetch(metadata.url);
      if (!response.ok) throw new Error('Failed to download file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = metadata.originalName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Delete the file after download
      try {
        await fetch(`/api/file/delete/${resolvedParams.code}`, { method: 'POST' });
        console.log('File deleted after download');
        
        // Update UI to show file is no longer available
        setTimeout(() => {
          setMetadata(null);
          setError('This file has been accessed and is no longer available.');
        }, 1000);
      } catch (err) {
        console.error('Error deleting file after download:', err);
      }
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Failed to download file');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading file information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    // Check if the error is related to file access or expiration
    if (error.includes('expired') || error.includes('accessed') || error.includes('downloaded')) {
      return <ExpiredLinkMessage message={error} />;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // No metadata state
  if (!metadata) {
    return <ExpiredLinkMessage />;
  }

  // Text content display
  if (metadata.type === 'text') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-blue-500 text-4xl mb-4">💬</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Secure Text Message</h1>
            <p className="text-gray-600">Your message is shown below</p>
            <p className="text-xs text-red-500 mt-2">This message will be deleted after viewing</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
            <pre className="text-gray-900 font-mono whitespace-pre-wrap break-words text-lg leading-relaxed">{metadata.content || ''}</pre>
          </div>
          <button
            onClick={() => {
              if (metadata.content) {
                navigator.clipboard.writeText(metadata.content);
                toast.success('Text copied to clipboard!');
              }
            }}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Copy Text
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors mt-4 mb-6"
          >
            Return Home
          </button>
          
          {/* Share section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center justify-center">
              <ShareIcon className="w-5 h-5 mr-2" />
              Share via
            </h3>
            
            {(() => {
              const shareUrl = window.location.href;
              const shareMessage = `I've shared a text message with you via DropKey. Access it here: ${shareUrl}`;
              const encodedShareMessage = encodeURIComponent(shareMessage);
              const encodedShareUrl = encodeURIComponent(shareUrl);
              
              return (
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {/* WhatsApp */}
                  <a 
                    href={`https://wa.me/?text=${encodedShareMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 bg-[#25D366] text-white rounded-lg hover:bg-opacity-90 transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                  
                  {/* Telegram */}
                  <a 
                    href={`https://t.me/share/url?url=${encodedShareUrl}&text=I've shared a text message with you via DropKey.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 bg-[#0088cc] text-white rounded-lg hover:bg-opacity-90 transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.5 6.618-.5 6.618l-.012.04c-.44.397-.16.54-.427.413-.245-.117-3.648-2.154-4.12-2.427-.21-.122-.356-.233-.356-.36 0-.08.055-.145.21-.278.52-.457 4.443-3.948 4.61-4.087.092-.077.146-.154.085-.24-.06-.087-.197-.045-.285-.028-.146.03-2.493 1.536-7.04 4.517-.265.17-.499.254-.699.254-.233 0-.453-.087-.65-.26-.265-.233-.467-.46-.484-.67-.018-.21.161-.404.483-.59.898-.519 1.987-1.12 3.267-1.8 3.195-1.683 5.329-2.775 6.393-3.313a.915.915 0 0 1 .58-.167l.013.001z"/>
                    </svg>
                    Telegram
                  </a>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // File content display (default case)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-blue-500 text-4xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">File Ready</h1>
          <p className="text-gray-600">Your file is ready to download</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">File name:</span>
            <span className="text-gray-900 font-medium">{metadata.originalName}</span>
          </div>
          {metadata.size && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500">Size:</span>
              <span className="text-gray-900 font-medium">
                {(metadata.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Type:</span>
            <span className="text-gray-900 font-medium">{metadata.mimeType || 'Unknown'}</span>
          </div>
        </div>
        
        <button
          onClick={handleDownload}
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Download File
        </button>
        <button
          onClick={() => router.push('/')}
          className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors mt-4 mb-6"
        >
          Return Home
        </button>
        
        {/* Share section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-center">
            <ShareIcon className="w-5 h-5 mr-2" />
            Share via
          </h3>
          
          {(() => {
            const shareUrl = window.location.href;
            const shareMessage = `I've shared a file with you via DropKey. Access it here: ${shareUrl}`;
            const encodedShareMessage = encodeURIComponent(shareMessage);
            const encodedShareUrl = encodeURIComponent(shareUrl);
            
            return (
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {/* WhatsApp */}
                <a 
                  href={`https://wa.me/?text=${encodedShareMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-3 bg-[#25D366] text-white rounded-lg hover:bg-opacity-90 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                
                {/* Telegram */}
                <a 
                  href={`https://t.me/share/url?url=${encodedShareUrl}&text=I've shared a file with you via DropKey.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-3 bg-[#0088cc] text-white rounded-lg hover:bg-opacity-90 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.5 6.618-.5 6.618l-.012.04c-.44.397-.16.54-.427.413-.245-.117-3.648-2.154-4.12-2.427-.21-.122-.356-.233-.356-.36 0-.08.055-.145.21-.278.52-.457 4.443-3.948 4.61-4.087.092-.077.146-.154.085-.24-.06-.087-.197-.045-.285-.028-.146.03-2.493 1.536-7.04 4.517-.265.17-.499.254-.699.254-.233 0-.453-.087-.65-.26-.265-.233-.467-.46-.484-.67-.018-.21.161-.404.483-.59.898-.519 1.987-1.12 3.267-1.8 3.195-1.683 5.329-2.775 6.393-3.313a.915.915 0 0 1 .58-.167l.013.001z"/>
                  </svg>
                  Telegram
                </a>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
