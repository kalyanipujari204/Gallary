import { useState, useEffect, useCallback } from 'react';
import { MediaItem, SortOption, FilterOptions } from '../types';
import { CATEGORIES, TAGS } from '../constants';

const TOTAL_ITEMS = 100;
const PAGE_SIZE = 12;

const generateMockData = (count: number): MediaItem[] => {
  return Array.from({ length: count }, (_, i) => {
    const isVideo = Math.random() > 0.8;
    const randomDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    const randomImageHeight = Math.floor(Math.random() * 400) + 600; // 600px to 1000px
    const randomThumbHeight = Math.floor(randomImageHeight / 2);

    return {
      id: `item-${Date.now()}-${i}`,
      type: isVideo ? 'video' : 'image',
      url: isVideo ? `https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4` : `https://picsum.photos/seed/${i + 1}/800/${randomImageHeight}`,
      thumbnailUrl: `https://picsum.photos/seed/${i + 1}/400/${randomThumbHeight}`,
      title: `Futuristic Landscape ${i + 1}`,
      description: `A stunning view of a futuristic world, captured by an anonymous artist. The colors and composition are breathtaking. This is item number ${i+1}.`,
      uploader: `User${Math.floor(Math.random() * 100)}`,
      uploadDate: randomDate.toISOString(),
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      tags: [TAGS[Math.floor(Math.random() * TAGS.length)], TAGS[Math.floor(Math.random() * TAGS.length)]],
      externalLink: 'https://example.com',
      allowDownload: Math.random() > 0.3,
      visibility: 'public',
      likes: Math.floor(Math.random() * 2000),
      downloads: Math.floor(Math.random() * 5000),
      comments: Array.from({ length: Math.floor(Math.random() * 10) }, (_, j) => ({
        id: `comment-${i}-${j}`,
        author: `Commenter${j}`,
        text: `This is an amazing piece of art!`,
        timestamp: new Date().toISOString(),
        likes: Math.floor(Math.random() * 50),
      }))
    };
  });
};

let allMockData = generateMockData(TOTAL_ITEMS);
let filteredData = [...allMockData];

export const useMockData = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = useCallback((currentPage: number) => {
    setLoading(true);
    setTimeout(() => {
      const newItems = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
      setItems(prev => currentPage === 1 ? newItems : [...prev, ...newItems]);
      setHasMore(filteredData.length > currentPage * PAGE_SIZE);
      setLoading(false);
    }, 500);
  }, []);
  
  useEffect(() => {
    fetchItems(1);
  }, [fetchItems]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage);
  }, [page, fetchItems]);

  const resetAndFetch = () => {
    setPage(1);
    fetchItems(1);
  }

  const filterItems = (options: FilterOptions) => {
    let data = [...allMockData];
    if (options.search) {
        const query = options.search.toLowerCase();
        data = data.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.tags.some(tag => tag.toLowerCase().includes(query)) ||
            item.uploader.toLowerCase().includes(query)
        );
    }
    if (options.category && options.category !== 'All') {
        data = data.filter(item => item.category === options.category);
    }
    filteredData = data;
    resetAndFetch();
  };
  
  const sortItems = (sortOption: SortOption) => {
    let sortedData = [...filteredData];
    switch (sortOption) {
      case 'newest':
        sortedData.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        break;
      case 'most_liked':
        sortedData.sort((a, b) => b.likes - a.likes);
        break;
      case 'most_downloaded':
        sortedData.sort((a, b) => b.downloads - a.downloads);
        break;
    }
    filteredData = sortedData;
    resetAndFetch();
  };

  const addItem = (item: Omit<MediaItem, 'id' | 'uploadDate' | 'likes' | 'comments' | 'downloads'>) => {
    const newItem: MediaItem = {
      ...item,
      id: `new-item-${Date.now()}`,
      uploadDate: new Date().toISOString(),
      likes: 0,
      comments: [],
      downloads: 0,
    };
    allMockData.unshift(newItem); // Add to the master list
    filteredData.unshift(newItem); // Add to the currently filtered list
    
    // To reflect immediately, update the state
    setItems(prevItems => [newItem, ...prevItems]);
  };

  const incrementDownloads = (itemId: string) => {
    const updateItem = (item: MediaItem) => {
        if (item.id === itemId) {
            return { ...item, downloads: item.downloads + 1 };
        }
        return item;
    };

    allMockData = allMockData.map(updateItem);
    filteredData = filteredData.map(updateItem);
    setItems(prevItems => prevItems.map(updateItem));
  };

  return { items, loading, hasMore, loadMore, filterItems, sortItems, addItem, incrementDownloads };
};