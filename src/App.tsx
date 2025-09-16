import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import ContactCard from './components/ContactCard';
import FilterControls from './components/FilterControls';
import UploadModal from './components/UploadModal';
import MediaViewer from './components/MediaViewer';
import EditModal from './components/EditModal';
import { useTheme } from './hooks/useTheme';
import { useSupabaseData } from './hooks/useSupabaseData';
import { MediaItem, SortOption } from './types';
import { UPLOAD_ICON } from './constants';

const App: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  const { 
    items, 
    loading, 
    hasMore, 
    loadMore,
    filterItems,
    sortItems,
    addItem,
    incrementDownloads,
    deleteItem,
    updateItem
  } = useSupabaseData();
  
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const isEditModalOpen = !!editingItem;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  const handleOpenMedia = (item: MediaItem) => {
    const itemIndex = items.findIndex(i => i.id === item.id);
    setSelectedMedia(item);
    setCurrentIndex(itemIndex);
  };

  const handleCloseMedia = useCallback(() => {
    setSelectedMedia(null);
  }, []);
  
  const handleNext = useCallback(() => {
    if (items.length === 0) return;
    const nextIndex = (currentIndex + 1) % items.length;
    setCurrentIndex(nextIndex);
    setSelectedMedia(items[nextIndex]);
  }, [currentIndex, items]);
  
  const handlePrev = useCallback(() => {
    if (items.length === 0) return;
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    setCurrentIndex(prevIndex);
    setSelectedMedia(items[prevIndex]);
  }, [currentIndex, items]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedMedia) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') handleCloseMedia();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMedia, handleNext, handlePrev, handleCloseMedia]);

  
  const handleSort = (sortOption: SortOption) => {
    sortItems(sortOption);
  };

  const handleOpenEditModal = (item: MediaItem) => {
    setEditingItem(item);
  };
  
  const handleCloseEditModal = () => {
    setEditingItem(null);
  };
  
  const handleSaveEdit = async (id: string, updates: Partial<Pick<MediaItem, 'title' | 'description' | 'category' | 'tags' | 'externalLink' | 'allowDownload' | 'visibility'>>) => {
    await updateItem(id, updates);
    // Also update the selectedMedia if it's the one being edited
    if (selectedMedia && selectedMedia.id === id) {
        const updatedItem = { ...selectedMedia, ...updates };
        setSelectedMedia(updatedItem);
    }
    handleCloseEditModal();
  };
  
  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900`}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <ContactCard />
          <FilterControls onSort={handleSort} />
        </div>
        <Gallery items={items} onCardClick={handleOpenMedia} lastItemRef={lastItemElementRef} onDownloadClick={incrementDownloads} onDeleteItem={deleteItem} onEditItem={handleOpenEditModal} />
        {loading && <p className="text-center py-4 text-neon-cyan">Loading more...</p>}
        {!hasMore && <p className="text-center py-4 text-gray-500">You've reached the end.</p>}
      </main>
      <Footer />
      
      {/* Floating Upload Button */}
      <button
        onClick={() => setUploadModalOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-neon-cyan to-neon-magenta text-white p-4 rounded-full shadow-lg shadow-neon-cyan/50 hover:scale-110 transition-transform duration-300 z-50 animate-pulse"
        aria-label="Open upload menu"
      >
        {UPLOAD_ICON}
      </button>

      <UploadModal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} onUpload={addItem}/>

      <EditModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        item={editingItem}
        onSave={handleSaveEdit}
      />

      {selectedMedia && (
        <MediaViewer
          item={selectedMedia}
          onClose={handleCloseMedia}
          onNext={handleNext}
          onPrev={handlePrev}
          onDownloadClick={incrementDownloads}
          onDeleteItem={deleteItem}
          onEditItem={handleOpenEditModal}
        />
      )}
    </div>
  );
};

export default App;
