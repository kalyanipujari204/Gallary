import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { MediaItem, SortOption, FilterOptions } from '../types';

const PAGE_SIZE = 12;

const fromSupabase = (data: any): MediaItem => {
    if (!data) return {} as MediaItem;
    return {
        id: data.id,
        type: data.type,
        url: data.url,
        thumbnailUrl: data.thumbnail_url || data.url,
        title: data.title,
        description: data.description,
        uploader: data.uploader,
        uploadDate: data.created_at,
        category: data.category,
        tags: data.tags,
        externalLink: data.external_link,
        allowDownload: data.allow_download,
        visibility: data.visibility,
        likes: data.likes,
        comments: data.comments || [],
        downloads: data.downloads,
    };
};

export const useSupabaseData = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOption>('newest');

  const fetchItems = useCallback(async (currentPage: number, currentFilters: FilterOptions, currentSort: SortOption) => {
    setLoading(true);

    let query = supabase
      .from('media_items')
      .select('*', { count: 'exact' });

    if (currentFilters.search) {
      const queryStr = `%${currentFilters.search}%`;
      // Split search by space to handle multi-word tag searches
      const searchTerms = currentFilters.search.split(' ').filter(Boolean);
      const orConditions = [
        `title.ilike.${queryStr}`,
        `uploader.ilike.${queryStr}`,
        // Create a condition for each search term to match against the tags array
        ...searchTerms.map(term => `tags.cs.{${term}}`)
      ];
      query = query.or(orConditions.join(','));
    }
    if (currentFilters.category && currentFilters.category !== 'All') {
      query = query.eq('category', currentFilters.category);
    }
    
    switch (currentSort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'most_liked':
        query = query.order('likes', { ascending: false });
        break;
      case 'most_downloaded':
        query = query.order('downloads', { ascending: false });
        break;
    }

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    query = query.range(startIndex, startIndex + PAGE_SIZE - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching data:', error.message || error);
      setLoading(false);
      return;
    }

    const newItems = data.map(fromSupabase);

    setItems(prev => {
        const updatedItems = currentPage === 1 ? newItems : [...prev, ...newItems];
        if (count !== null) {
          setHasMore(updatedItems.length < count);
        } else {
          setHasMore(newItems.length === PAGE_SIZE);
        }
        return updatedItems;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems(1, filters, sort);
  }, [fetchItems, filters, sort]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage, filters, sort);
  }, [page, filters, sort, loading, hasMore, fetchItems]);

  const resetAndFetch = (newFilters: FilterOptions, newSort: SortOption) => {
    setPage(1);
    setItems([]);
    fetchItems(1, newFilters, newSort);
  };
  
  const filterItems = (newFilterOptions: FilterOptions) => {
    const newFilters = { ...filters, ...newFilterOptions };
    setFilters(newFilters);
  };
  
  const sortItems = (newSortOption: SortOption) => {
    setSort(newSortOption);
  };

  const addItem = async (
    item: Omit<MediaItem, 'id' | 'uploadDate' | 'likes' | 'comments' | 'downloads' | 'url' | 'thumbnailUrl'>,
    file: File
  ): Promise<void> => {
    if (!file) {
      console.error("No file provided for upload.");
      return Promise.reject(new Error("No file provided."));
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError.message || uploadError);
      return Promise.reject(uploadError);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
      
    if (!publicUrl) {
        const urlError = new Error("Could not get public URL for uploaded file.");
        console.error(urlError);
        return Promise.reject(urlError);
    }

    const newItemData = {
      type: item.type,
      url: publicUrl,
      thumbnail_url: publicUrl,
      title: item.title,
      description: item.description,
      uploader: item.uploader,
      category: item.category,
      tags: item.tags,
      external_link: item.externalLink,
      allow_download: item.allowDownload,
      visibility: item.visibility,
    };
    
    const { data: insertedData, error: insertError } = await supabase
      .from('media_items')
      .insert(newItemData)
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting media item:', insertError.message || insertError);
      return Promise.reject(insertError);
    }

    const newItem = fromSupabase(insertedData);
    setItems(prevItems => [newItem, ...prevItems]);
  };

  const incrementDownloads = async (itemId: string) => {
    // Optimistically update the UI for a snappy user experience.
    setItems(prevItems => prevItems.map(item => 
        item.id === itemId ? { ...item, downloads: item.downloads + 1 } : item
    ));

    // Call the atomic RPC function in the database.
    const { error } = await supabase.rpc('increment_downloads', {
      item_id: itemId
    });

    // If the database call fails, log the error and revert the optimistic update.
    if (error) {
        console.error('Error incrementing downloads:', error.message || error);
        setItems(prevItems => prevItems.map(item => 
            item.id === itemId ? { ...item, downloads: item.downloads - 1 } : item
        ));
    }
  };

  const deleteItem = async (itemId: string, itemUrl: string) => {
    try {
      // 1. Delete from storage by robustly parsing the file path from the full URL
      const bucketName = 'media';
      const pathSegment = `/${bucketName}/`;
      const pathIndex = itemUrl.indexOf(pathSegment);
      
      if (pathIndex === -1) {
        const errorMessage = "Could not determine file path from URL. The URL format may be unexpected.";
        console.error(errorMessage, { itemUrl });
        alert(errorMessage);
        return; // Stop the deletion process
      }
      
      const filePath = decodeURIComponent(itemUrl.substring(pathIndex + pathSegment.length));

      if (!filePath) {
        throw new Error("Could not determine file path from URL.");
      }

      const { error: storageError } = await supabase.storage.from('media').remove([filePath]);

      if (storageError) {
        // Log the error but continue to attempt DB record deletion.
        // The file might be already deleted or there could be a permissions issue.
        // The main goal for the user is removing the item from the gallery view.
        console.error('Error deleting file from storage:', storageError.message);
        alert(`Could not delete file from storage. It may have already been removed. Continuing to delete database record.\nError: ${storageError.message}`);
      }

      // 2. Delete from database
      const { error: dbError } = await supabase.from('media_items').delete().eq('id', itemId);
      
      if (dbError) {
        console.error('Error deleting item from database:', dbError.message);
        alert(`Failed to delete item from the database. Please check your permissions (RLS policies) and try again.\nError: ${dbError.message}`);
        return; // Stop if DB deletion fails, as the item would remain visible otherwise.
      }

      // 3. Update local state on success
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error('An unexpected error occurred during deletion:', e);
      alert(`An unexpected error occurred during deletion: ${errorMessage}`);
    }
  };

  const updateItem = async (itemId: string, updates: Partial<Pick<MediaItem, 'title' | 'description' | 'category' | 'tags' | 'externalLink' | 'allowDownload' | 'visibility'>>) => {
    // Map camelCase keys from the app to snake_case keys for the Supabase database.
    const supabaseUpdates: { [key: string]: any } = {};
    if (updates.title !== undefined) supabaseUpdates.title = updates.title;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.category !== undefined) supabaseUpdates.category = updates.category;
    if (updates.tags !== undefined) supabaseUpdates.tags = updates.tags;
    if (updates.externalLink !== undefined) supabaseUpdates.external_link = updates.externalLink;
    if (updates.allowDownload !== undefined) supabaseUpdates.allow_download = updates.allowDownload;
    if (updates.visibility !== undefined) supabaseUpdates.visibility = updates.visibility;

    const { data, error } = await supabase
        .from('media_items')
        .update(supabaseUpdates)
        .eq('id', itemId)
        .select()
        .single();

    if (error) {
        console.error('Error updating item:', error.message);
        throw error;
    }

    if (data) {
        const updatedItem = fromSupabase(data);
        setItems(prevItems => prevItems.map(item => (item.id === itemId ? updatedItem : item)));
    }
  };

  return { items, loading, hasMore, loadMore, filterItems, sortItems, addItem, incrementDownloads, deleteItem, updateItem };
};
