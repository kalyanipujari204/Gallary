import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { CATEGORIES } from '../constants';
import { CLOSE_ICON } from '../constants';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    item: Omit<MediaItem, 'id' | 'uploadDate' | 'likes' | 'comments' | 'downloads' | 'url' | 'thumbnailUrl'>,
    file: File
  ) => Promise<void>;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [activeTab, setActiveTab] = useState('device');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [externalLink, setExternalLink] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    // Cleanup object URLs on unmount to prevent memory leaks
    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
  }, [previews]);

  const processFiles = (newFiles: FileList | null) => {
    if (newFiles) {
      const selectedFiles = Array.from(newFiles);
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleRemoveFile = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent label click event
    
    // Revoke the object URL to free up memory
    URL.revokeObjectURL(previews[indexToRemove]);

    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setPreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };


  const resetState = () => {
    setFiles([]);
    previews.forEach(URL.revokeObjectURL);
    setPreviews([]);
    setDescription('');
    setExternalLink('');
    setCategory(CATEGORIES[0]);
    setUploadProgress(0);
    setIsUploading(false);
    setIsDragOver(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 && activeTab === 'device') {
      alert("Please select one or more files to upload.");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);

    const totalFiles = files.length;
    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      try {
        const newItem = {
            type: file.type.startsWith('video') ? 'video' : 'image' as 'image' | 'video',
            title: file.name.split('.').slice(0, -1).join('.'),
            description,
            uploader: 'CurrentUser', // Placeholder uploader
            category,
            tags: ['new', 'upload'],
            externalLink,
            allowDownload: true,
            visibility: 'public' as 'public' | 'private',
        };
        // The onUpload function is addItem from useSupabaseData which is async
        await onUpload(newItem, file);
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      } catch (error) {
          console.error(`Upload failed for file: ${file.name}`, error);
          alert(`Upload failed for ${file.name}. Please check the console for details.`);
          setIsUploading(false);
          return; // Stop on first error
      }
    }
    
    // Reset form and close modal after a short delay to show 100%
    setTimeout(() => {
      resetState();
      onClose();
    }, 500);
  };

  const handleClose = () => {
      if(isUploading) return;
      resetState();
      onClose();
  }


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div 
        className="w-full max-w-2xl bg-gray-800/80 backdrop-blur-lg rounded-xl border border-gray-700 text-white shadow-lg shadow-neon-magenta/20"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-display">Upload Media</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50" disabled={isUploading}>{CLOSE_ICON}</button>
        </div>
        <div className="p-6">
          <div className="flex border-b border-gray-700 mb-6">
            <button onClick={() => setActiveTab('device')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'device' ? 'text-neon-cyan border-b-2 border-neon-cyan' : 'text-gray-400'}`}>From Device</button>
            <button onClick={() => setActiveTab('url')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'url' ? 'text-neon-cyan border-b-2 border-neon-cyan' : 'text-gray-400'}`}>From URL (disabled)</button>
          </div>

          <form onSubmit={handleSubmit}>
            {activeTab === 'device' && (
              <div className="space-y-4">
                <label 
                    htmlFor="file-upload" 
                    className={`block w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer transition-colors ${isDragOver ? 'border-neon-cyan text-neon-cyan bg-gray-700/50' : 'hover:border-neon-cyan hover:text-neon-cyan'}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragEnter} // Use the same handler for over
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                  {previews.length > 0 ? (
                    <div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto mb-2 p-2 bg-gray-900/50 rounded-md">
                        {previews.map((previewSrc, index) => (
                          <div key={index} className="relative group">
                            <img src={previewSrc} alt={`preview ${index}`} className="w-full h-20 object-cover rounded"/>
                            <button 
                                onClick={(e) => handleRemoveFile(e, index)}
                                className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                aria-label="Remove file"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                        </div>
                        <span className="text-sm">{files.length} file{files.length > 1 ? 's' : ''} selected. Click to add more.</span>
                    </div>
                  ) : (
                    <span>Drag & drop files or click to select</span>
                  )}
                </label>
                <input id="file-upload" type="file" className="hidden" accept="image/jpeg,image/png,image/gif,video/mp4,video/webm" onChange={handleFileChange} multiple/>
              </div>
            )}
            
            {activeTab === 'url' && (
              <div className="space-y-2 text-gray-400">
                <p>Uploading from a URL is not yet supported in this version.</p>
              </div>
            )}
            
            <div className="mt-6 space-y-4">
                {files.length > 0 && <p className="text-sm text-gray-400 -mb-2">The details below will be applied to all {files.length} files.</p>}
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-neon-cyan focus:border-neon-cyan outline-none h-24"/>
                <input type="url" value={externalLink} onChange={e => setExternalLink(e.target.value)} placeholder="External Link (optional, e.g., https://example.com)" className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-neon-cyan focus:border-neon-cyan outline-none"/>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-neon-cyan focus:border-neon-cyan outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            
            {isUploading && (
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                    <div className="bg-gradient-to-r from-neon-cyan to-neon-magenta h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
            )}

            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={isUploading || activeTab === 'url' || files.length === 0} className="px-6 py-2 bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-bold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                {isUploading ? `Uploading... ${uploadProgress}%` : `Upload ${files.length > 0 ? files.length : ''} File${files.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;