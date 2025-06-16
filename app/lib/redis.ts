import { FileMetadata } from '../types';

// Use a global variable to persist data across requests
declare global {
  let fileStore: Map<string, FileMetadata>;
}

// Initialize the global store if it doesn't exist
if (!(globalThis as any).fileStore) {
  (globalThis as any).fileStore = new Map<string, FileMetadata>();
}

// Helper function to get metadata
export async function getMetadata(code: string): Promise<FileMetadata | null> {
  console.log('Getting metadata for code:', code);
  console.log('Current store size:', (globalThis as any).fileStore.size);
  console.log('Available codes:', Array.from((globalThis as any).fileStore.keys()));
  
  const metadata = (globalThis as any).fileStore.get(code);
  if (!metadata) {
    console.log('No metadata found for code:', code);
    return null;
  }
  
  // Check if the file has expired
  if (Date.now() > metadata.expiresAt) {
    console.log('File has expired, removing from store');
    (globalThis as any).fileStore.delete(code);
    return null;
  }
  
  console.log('Found metadata:', metadata);
  return metadata;
}

// Helper function to set metadata
export async function setMetadata(code: string, metadata: FileMetadata): Promise<void> {
  console.log('Setting metadata for code:', code);
  console.log('Metadata to store:', metadata);
  
  // Ensure the metadata has all required fields
  const completeMetadata: FileMetadata = {
    ...metadata,
    hasDownloaded: metadata.hasDownloaded || false,
    expiresAt: metadata.expiresAt || Date.now() + 3600000, // Default 1 hour if not specified
  };
  
  (globalThis as any).fileStore.set(code, completeMetadata);
  console.log('Current store size after setting:', (globalThis as any).fileStore.size);
  console.log('Available codes:', Array.from((globalThis as any).fileStore.keys()));
}

// Helper function to delete metadata
export async function deleteMetadata(code: string): Promise<void> {
  console.log('Deleting metadata for code:', code);
  (globalThis as any).fileStore.delete(code);
  console.log('Current store size after deletion:', (globalThis as any).fileStore.size);
}

// Helper function to check if code exists
export async function codeExists(code: string): Promise<boolean> {
  console.log('Checking if code exists:', code);
  const exists = (globalThis as any).fileStore.has(code);
  console.log('Code exists:', exists);
  return exists;
}

// Helper function to mark a file as downloaded and delete it immediately
export async function markAsDownloaded(code: string): Promise<void> {
  console.log('Marking file as downloaded and deleting for code:', code);
  const metadata = (globalThis as any).fileStore.get(code);
  if (metadata) {
    // For single-use files, delete immediately after marking as downloaded
    (globalThis as any).fileStore.delete(code);
    console.log('File deleted after download/view');
  } else {
    console.log('No metadata found to mark as downloaded and delete');
  }
}

// Helper function to clean up expired files
export async function cleanupExpiredFiles(): Promise<void> {
  const now = Date.now();
  for (const [code, metadata] of (globalThis as any).fileStore.entries()) {
    if (now > metadata.expiresAt) {
      console.log('Cleaning up expired file:', code);
      (globalThis as any).fileStore.delete(code);
    }
  }
}

// Run cleanup every minute
if (process.env.NODE_ENV === 'development') {
  setInterval(cleanupExpiredFiles, 60000);
}

export { deleteMetadata as deleteFileMetadata, getMetadata as getFileMetadata };