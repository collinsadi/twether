import axios from 'axios';
import { ENVIRONMENT } from './environment';

export const twitterApi = axios.create({
  baseURL: 'https://api.twitterapi.io/twitter/tweet', // Twitter API v2 base URL
  headers: {
    'x-api-key': ENVIRONMENT.TWITTER.API_KEY,
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to ensure API key is always present
twitterApi.interceptors.request.use(
  (config) => {
    if (!ENVIRONMENT.TWITTER.API_KEY) {
      throw new Error('Twitter API key is not configured');
    }
    config.headers['x-api-key'] = ENVIRONMENT.TWITTER.API_KEY;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
twitterApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Twitter API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
); 