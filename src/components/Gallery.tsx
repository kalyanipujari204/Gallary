import React from 'react';
import MediaCard from './MediaCard';
import { MediaItem } from '../types';

interface GalleryProps {
  items: MediaItem[];
  onCardClick: (item: MediaItem) => void;
  lastItemRef: (node: HTMLDivElement | null) => void;
  onDownloadClick: (id: string) => void;
  onDeleteItem: (id: string, url: string) => void;
  onEditItem: (item: MediaItem) => void;
}

const Gallery: React.FC<GalleryProps> = ({ items, onCardClick, lastItemRef, onDownloadClick, onDeleteItem, onEditItem }) => {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6">
      {items.map((item, index) => (
        <div
          ref={items.length === index + 1 ? lastItemRef : null}
          key={item.id}
          className="mb-4 md:mb-6 break-inside-avoid"
        >
          <MediaCard item={item} onClick={() => onCardClick(item)} onDownloadClick={onDownloadClick} onDeleteItem={onDeleteItem} onEditItem={onEditItem} />
        </div>
      ))}
    </div>
  );
};

export default Gallery;
