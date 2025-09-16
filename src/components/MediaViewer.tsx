import React from 'react';
import { MediaItem } from '../types';
import { CLOSE_ICON, LEFT_ARROW_ICON, RIGHT_ARROW_ICON, DOWNLOAD_ICON, LINK_ICON, HEART_ICON, COMMENT_ICON, DELETE_ICON, EDIT_ICON } from '../constants';

interface MediaViewerProps {
  item: MediaItem;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDownloadClick: (id: string) => void;
  onDeleteItem: (id: string, url: string) => void;
  onEditItem: (item: MediaItem) => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ item, onClose, onNext, onPrev, onDownloadClick, onDeleteItem, onEditItem }) => {

  const handleDownloadClick = () => {
    onDownloadClick(item.id);
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to permanently delete "${item.title}"?`)) {
      onDeleteItem(item.id, item.url);
      onClose(); // Close the viewer after deletion
    }
  };

  const handleEditClick = () => {
    onEditItem(item);
  };

  return (
    <div 
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="relative w-full h-full max-w-6xl max-h-full bg-gray-900/50 backdrop-blur-md rounded-lg flex flex-col lg:flex-row overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Media Display */}
        <div className="relative flex-grow flex items-center justify-center bg-black lg:w-3/4">
          {item.type === 'image' ? (
            <img src={item.url} alt={item.title} className="max-h-full max-w-full object-contain" />
          ) : (
            <video src={item.url} controls autoPlay className="max-h-full max-w-full object-contain">
              Your browser does not support the video tag.
            </video>
          )}

          {/* Close Button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-white/20 transition-colors z-10">
            {CLOSE_ICON}
          </button>
        </div>

        {/* Sidebar for Info & Comments */}
        <div className="w-full lg:w-1/4 bg-gray-800/50 p-6 flex flex-col overflow-y-auto">
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold text-neon-cyan mb-2">{item.title}</h2>
            <p className="text-sm text-gray-400 mb-1">by {item.uploader}</p>
            <p className="text-xs text-gray-500 mb-4">{new Date(item.uploadDate).toLocaleString()}</p>
            <p className="text-gray-300 mb-6">{item.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-700 text-xs rounded-full">{tag}</span>
              ))}
            </div>

            <div className="flex space-x-4 mb-6">
               <button className="flex items-center space-x-1 text-gray-300 hover:text-red-500">{HEART_ICON} <span>{item.likes}</span></button>
               <button className="flex items-center space-x-1 text-gray-300 hover:text-neon-cyan">{COMMENT_ICON} <span>{item.comments.length}</span></button>
               {item.allowDownload && <a href={item.url} download onClick={handleDownloadClick} className="flex items-center space-x-1 text-gray-300 hover:text-neon-cyan">{DOWNLOAD_ICON} <span>{item.downloads}</span></a>}
               {item.externalLink && <a href={item.externalLink} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-gray-300 hover:text-neon-cyan">{LINK_ICON} <span>Visit</span></a>}
               <button onClick={handleEditClick} title="Edit" className="flex items-center space-x-1 text-gray-300 hover:text-blue-500">{EDIT_ICON} <span>Edit</span></button>
               <button onClick={handleDeleteClick} title="Delete" className="flex items-center space-x-1 text-gray-300 hover:text-red-500">{DELETE_ICON} <span>Delete</span></button>
            </div>
          </div>
          
          <div className="flex-grow border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold mb-4">Comments</h3>
            <div className="space-y-4">
              {item.comments.map(comment => (
                <div key={comment.id}>
                  <p className="font-bold text-sm text-gray-200">{comment.author}</p>
                  <p className="text-sm text-gray-400">{comment.text}</p>
                </div>
              ))}
              {item.comments.length === 0 && <p className="text-gray-500 text-sm">No comments yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-white/20 transition-colors z-10 hidden md:block">
        {LEFT_ARROW_ICON}
      </button>
      <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-white/20 transition-colors z-10 hidden md:block">
        {RIGHT_ARROW_ICON}
      </button>
    </div>
  );
};

export default MediaViewer;
