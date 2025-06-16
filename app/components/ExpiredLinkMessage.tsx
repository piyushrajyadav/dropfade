import React from 'react';
import { useRouter } from 'next/navigation';

interface ExpiredLinkMessageProps {
  message?: string;
}

const ExpiredLinkMessage: React.FC<ExpiredLinkMessageProps> = ({ 
  message = 'This link has expired or has already been accessed.'
}) => {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="text-red-500 text-5xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Link Expired</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <p className="text-gray-500 text-sm mb-8">
          For security reasons, DropKey links can only be accessed once and are automatically deleted after viewing.
        </p>
        <button
          onClick={() => router.push('/')}
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create New Share
        </button>
      </div>
    </div>
  );
};

export default ExpiredLinkMessage;
