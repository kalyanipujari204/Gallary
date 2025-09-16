export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  uploader: string;
  uploadDate: string;
  category: string;
  tags: string[];
  externalLink?: string;
  allowDownload: boolean;
  visibility: 'public' | 'private';
  likes: number;
  comments: Comment[];
  downloads: number;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

export type SortOption = 'newest' | 'most_liked' | 'most_downloaded';

export type FilterOptions = {
    search?: string;
    category?: string;
};
