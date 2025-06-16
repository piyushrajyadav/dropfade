"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
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

  if (uploadedCode) {
    return (
      <div className="text-center p-8 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Your DropKey Code</h2>
        <div className="text-4xl font-mono bg-white p-4 rounded mb-4 border-2 border-blue-200">
          {uploadedCode}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
              navigator.clipboard.writeText(`${window.location.origin}/file/${uploadedCode}`);
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
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
          >
            Upload Another
          </button>
        </div>
      </div>
    );
  }

  return (
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
                className="w-full h-32 p-2 border rounded resize-none"
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
  );
} 