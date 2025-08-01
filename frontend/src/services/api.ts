const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Tweet {
  _id: string;
  twitterId?: string;
  tweetText: string;
  authorName: string;
  username: string;
  isVerified: boolean;
  verifiedType: string;
  profilePicture: string;
  tweetUrl: string;
  mediaPreviewUrl?: string;
  mediaType?: string;
  topics: string[];
  createdAt: string;
  createdAtDate: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalTweets: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TweetsResponse {
  success: boolean;
  message: string;
  data: {
    tweets: Tweet[];
    pagination: PaginationInfo;
  };
}

export interface TopicsResponse {
  success: boolean;
  message: string;
  data: string[];
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getTweets(page: number = 1, limit: number = 20, topic?: string): Promise<TweetsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (topic && topic !== 'all') {
      params.append('topic', topic);
    }

    return this.request<TweetsResponse>(`/api/tweets?${params.toString()}`);
  }

  async getTopics(): Promise<TopicsResponse> {
    return this.request<TopicsResponse>('/api/tweets/topics');
  }

  async fetchTweets(): Promise<{ success: boolean; message: string; data: Tweet[] }> {
    return this.request<{ success: boolean; message: string; data: Tweet[] }>('/api/tweets/fetch', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService(); 