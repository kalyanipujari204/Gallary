import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { CATEGORIES, CLOSE_ICON } from '../constants';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Pick<MediaItem, 'title' | 'description' | 'category' | 'tags' | 'externalLink' | 'allowDownload' | 'visibility'>>) => Promise<void>;
  item: MediaItem | null;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, item }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || '');
      setCategory(item.category);
      setTags(item.tags ? item.tags.join(', ') : '');
      setExternalLink(item.externalLink || '');
      setAllowDownload(item.allowDownload);
      setVisibility(item.visibility);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsSaving(true);
    const updatedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    try {
      await onSave(item.id, {
        title,
        description,
        category,
        tags: updatedTags,
        externalLink: externalLink || undefined,
        allowDownload,
        visibility,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save changes:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div 
        className="w-full max-w-lg bg-gray-800/80 backdrop-blur-lg rounded-xl border border-gray-700 text-white shadow-lg shadow-neon-cyan/20"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-display">Edit Media Details</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50" disabled={isSaving}>{CLOSE_ICON}</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
              <input 
                id="title" 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-neon-cyan focus:border-neon-cyan outline-none" 
                required 
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea 
                id="description" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Description" 
                className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-neon-cyan focus:border-neon-cyan outline-none h-24"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select 
                id="category" 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-neon-cyan focus:border-neon-cyan outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">Tags (comma-separated)</label>
              <input 
                id="tags" 
                type="text" 
                value={tags} 
                onChange={e => setTags(e.target.value)} 
                className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-neon-cyan focus:border-neon-cyan outline-none" 
              />
            </div>
            <div>
              <label htmlFor="externalLink" className="block text-sm font-medium text-gray-300 mb-1">External Link</label>
              <input 
                id="externalLink" 
                type="url" 
                value={externalLink} 
                onChange={e => setExternalLink(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-neon-cyan focus:border-neon-cyan outline-none" 
              />
            </div>
            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-300 mb-1">Visibility</label>
              <select 
                id="visibility" 
                value={visibility} 
                onChange={e => setVisibility(e.target.value as 'public' | 'private')} 
                className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-neon-cyan focus:border-neon-cyan outline-none"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="flex items-center pt-2">
              <input
                id="allowDownload"
                type="checkbox"
                checked={allowDownload}
                onChange={e => setAllowDownload(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-900/50 text-neon-cyan focus:ring-neon-cyan focus:ring-offset-gray-800"
              />
              <label htmlFor="allowDownload" className="ml-3 block text-sm text-gray-300">Allow downloads</label>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving} 
              className="px-6 py-2 bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-bold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;