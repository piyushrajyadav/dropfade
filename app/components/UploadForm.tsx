"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentTextIcon, ShareIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ExpiryOption } from '../types';

export default function UploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [text, setText] = useState('');
  const [expiry, setExpiry] = useState<ExpiryOption>('1h');
  const [uploadedCode, setUploadedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('expiry', expiry);

      console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      const response = await fetch('/api/upload/file', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Upload response:', data);
      
      if (!response.ok) throw new Error(data.message || 'Upload failed');

      setUploadedCode(data.code);
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  }, [expiry]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsUploading(true);
    try {
      console.log(`Uploading text of length: ${text.length}, expiry: ${expiry}`);
      
      const response = await fetch('/api/upload/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, expiry }),
      });

      const data = await response.json();
      console.log('Text upload response:', data);
      
      if (!response.ok) throw new Error(data.message || 'Text upload failed');

      setUploadedCode(data.code);
      toast.success('Text saved successfully!');
    } catch (error) {
      console.error('Text upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save text');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {uploadedCode ? (
        <div className="text-center p-8 bg-blue-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Your DropKey Code</h2>
          <div className="text-4xl font-mono bg-white p-4 rounded mb-4 border-2 border-blue-200">
            {uploadedCode}
          </div>
          
          {/* Copy buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <button
              onClick={() => {
                navigator.clipboard.writeText(uploadedCode);
                toast.success('Code copied to clipboard!');
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Copy Code
            </button>
            <button
              onClick={() => {
                const shareUrl = `${window.location.origin}/file/${uploadedCode}`;
                navigator.clipboard.writeText(shareUrl);
                toast.success('Link copied to clipboard!');
              }}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Copy Link
            </button>
            <button
              onClick={() => {
                setUploadedCode(null);
                setText('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Upload Another
            </button>
          </div>
          
          {/* Share section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center justify-center">
              <ShareIcon className="w-5 h-5 mr-2" />
              Share via
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
              {(() => {
                const shareUrl = `${window.location.origin}/file/${uploadedCode}`;
                const shareMessage = `I've shared ${activeTab === 'text' ? 'a message' : 'a file'} with you via DropKey. Access it here: ${shareUrl}`;
                const encodedShareMessage = encodeURIComponent(shareMessage);
                const encodedShareUrl = encodeURIComponent(shareUrl);
                
                return (
                  <>
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
                      href={`https://t.me/share/url?url=${encodedShareUrl}&text=${encodeURIComponent(`I've shared ${activeTab === 'text' ? 'a message' : 'a file'} with you via DropKey.`)}`}
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
                      href={`mailto:?subject=DropKey: I've shared ${activeTab === 'text' ? 'a message' : 'a file'} with you&body=${encodedShareMessage}`}
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
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('file')}
              className={`flex items-center px-4 py-2 font-medium text-sm rounded-t-md ${
                activeTab === 'file'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CloudArrowUpIcon className="w-5 h-5 mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center px-4 py-2 font-medium text-sm rounded-t-md ${
                activeTab === 'text'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Write Text
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeTab === 'file' ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
              >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  {isDragActive
                    ? 'Drop the file here'
                    : 'Drag &quot; &amp; &quot; drop a file here, or click to select'}
                </p>
                <p className="text-sm text-gray-500 mt-2">Max size: 5MB</p>
              </div>
            ) : (
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Write Something
                </h3>
                <form onSubmit={handleTextSubmit}>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-32 p-4 border rounded resize-none text-gray-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                    placeholder="Type your message here..."
                  />
                  <button
                    type="submit"
                    disabled={isUploading || !text.trim()}
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isUploading ? 'Saving...' : 'Save Text'}
                  </button>
                </form>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="mb-4">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Expires in:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExpiry('5m')}
                    className={`py-2 text-sm rounded ${
                      expiry === '5m'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    5 minutes
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiry('1h')}
                    className={`py-2 text-sm rounded ${
                      expiry === '1h'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    1 hour
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiry('1d')}
                    className={`py-2 text-sm rounded ${
                      expiry === '1d'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    1 day
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-blue-700">
                Your content will be automatically deleted after it&apos;s accessed or when it expires.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
