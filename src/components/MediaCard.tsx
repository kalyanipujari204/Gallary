import React, { useState } from 'react';
import { MediaItem } from '../types';
import { HEART_ICON, COMMENT_ICON, DOWNLOAD_ICON, LINK_ICON, PLAY_ICON, DELETE_ICON, EDIT_ICON } from '../constants';

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
  onDownloadClick: (id: string) => void;
  onDeleteItem: (id: string, url: string) => void;
  onEditItem: (item: MediaItem) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onClick, onDownloadClick, onDeleteItem, onEditItem }) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownloadClick(item.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)) {
      onDeleteItem(item.id, item.url);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditItem(item);
  };
  
  const formattedDate = new Date(item.uploadDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div 
      className="relative group rounded-lg overflow-hidden cursor-pointer shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-neon-cyan/30"
      onClick={onClick}
    >
      <img
        loading="lazy"
        src={item.thumbnailUrl}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:brightness-75"
      />
      
      {item.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {PLAY_ICON}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="font-bold text-lg truncate group-hover:text-neon-cyan">{item.title}</h3>
        <p className="text-sm text-gray-300">by {item.uploader}</p>
        <p className="text-xs text-gray-400">{formattedDate}</p>

        {/* Actions visible on hover */}
        <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={handleLikeClick} className={`p-2 rounded-full ${isLiked ? 'text-red-500 bg-white/20' : 'text-white bg-black/30'} backdrop-blur-sm hover:bg-white/30`}>
            {HEART_ICON}
          </button>
          <button className="p-2 rounded-full text-white bg-black/30 backdrop-blur-sm hover:bg-white/30">
            {COMMENT_ICON}
          </button>
          <button onClick={handleEditClick} title="Edit" className="p-2 rounded-full text-white bg-black/30 backdrop-blur-sm hover:bg-blue-500/50">
            {EDIT_ICON}
          </button>
          <button onClick={handleDeleteClick} title="Delete" className="p-2 rounded-full text-white bg-black/30 backdrop-blur-sm hover:bg-red-500/50">
            {DELETE_ICON}
          </button>
          {item.allowDownload && (
            <a href={item.url} download onClick={handleDownloadClick} className="py-2 pl-2 pr-3 rounded-full text-white bg-black/30 backdrop-blur-sm hover:bg-white/30 flex items-center space-x-1">
                {DOWNLOAD_ICON}
                <span className="text-xs">{item.downloads}</span>
            </a>
          )}
          {item.externalLink && (
            <a href={item.externalLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 rounded-full text-white bg-black/30 backdrop-blur-sm hover:bg-white/30">
                {LINK_ICON}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
