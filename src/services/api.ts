import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'YOUR_TMDB_API_KEY';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Image sizes
export const BACKDROP_SIZE = 'original';
export const POSTER_SIZE = 'w500';
export const PROFILE_SIZE = 'w185';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US'
  }
});

// YouTube search function
export const searchYouTubeMovie = async (title: string, year?: string) => {
  try {
    const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    
    // Check if YouTube API key is available
    if (!youtubeApiKey || youtubeApiKey === 'YOUR_YOUTUBE_API_KEY') {
      console.warn('YouTube API key not configured');
      return null;
    }

    const query = `${title} ${year || ''} full movie`;
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoDuration: 'long',
        maxResults: 5,
        key: youtubeApiKey
      }
    });
    
    // Filter results to find potential full movies (longer duration)
    const videos = response.data.items || [];
    if (videos.length > 0) {
      // Return the first result's video ID
      return videos[0].id.videoId;
    }
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        console.warn('YouTube API key is invalid or has insufficient permissions. Please check your API key configuration.');
      } else if (error.response?.status === 429) {
        console.warn('YouTube API quota exceeded. Please try again later.');
      } else {
        console.warn('YouTube API request failed:', error.response?.status, error.response?.statusText);
      }
    } else {
      console.warn('Error searching YouTube:', error);
    }
    return null;
  }
};

// API endpoints
export const fetchTrending = async (mediaType = 'all', timeWindow = 'week') => {
  const response = await api.get(`/trending/${mediaType}/${timeWindow}`);
  return response.data;
};

export const fetchMovies = async (category = 'popular', page = 1) => {
  const response = await api.get(`/movie/${category}`, {
    params: { page }
  });
  return response.data;
};

export const fetchTVShows = async (category = 'popular', page = 1) => {
  const response = await api.get(`/tv/${category}`, {
    params: { page }
  });
  return response.data;
};

export const fetchMovieDetails = async (id: string) => {
  const response = await api.get(`/movie/${id}`, {
    params: {
      append_to_response: 'videos,credits,similar,recommendations'
    }
  });
  return response.data;
};

export const fetchTVDetails = async (id: string) => {
  const response = await api.get(`/tv/${id}`, {
    params: {
      append_to_response: 'videos,credits,similar,recommendations'
    }
  });
  return response.data;
};

export const fetchPersonDetails = async (id: string) => {
  const response = await api.get(`/person/${id}`, {
    params: {
      append_to_response: 'movie_credits,tv_credits,images'
    }
  });
  return response.data;
};

export const searchContent = async (query: string, page = 1) => {
  const response = await api.get('/search/multi', {
    params: {
      query,
      page
    }
  });
  return response.data;
};

export const getImageUrl = (path: string | null, size = POSTER_SIZE) => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export default api;