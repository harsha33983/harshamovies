interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
  filters?: {
    type?: string;
    year?: string;
    genre?: string;
  };
}

class SearchHistoryService {
  private readonly STORAGE_KEY = 'searchHistory';
  private readonly MAX_HISTORY_ITEMS = 100;

  // Add a search to history
  addToHistory(query: string, resultsCount: number, filters?: any): void {
    if (!query.trim()) return;

    const history = this.getHistory();
    
    // Remove existing entry with same query and filters to avoid duplicates
    const filteredHistory = history.filter(item => 
      !(item.query.toLowerCase() === query.toLowerCase() && 
        JSON.stringify(item.filters) === JSON.stringify(filters))
    );

    const newItem: SearchHistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      query: query.trim(),
      timestamp: new Date(),
      resultsCount,
      filters: filters || {}
    };

    // Add to beginning and limit to MAX_HISTORY_ITEMS
    const updatedHistory = [newItem, ...filteredHistory].slice(0, this.MAX_HISTORY_ITEMS);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
  }

  // Get search history
  getHistory(): SearchHistoryItem[] {
    try {
      const history = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      return history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      console.error('Error parsing search history:', error);
      return [];
    }
  }

  // Remove specific item from history
  removeFromHistory(id: string): void {
    const history = this.getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
  }

  // Clear all history
  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get popular searches (most frequent)
  getPopularSearches(limit: number = 10): Array<{ query: string; count: number }> {
    const history = this.getHistory();
    const queryCount: { [key: string]: number } = {};
    
    history.forEach(item => {
      const normalizedQuery = item.query.toLowerCase();
      queryCount[normalizedQuery] = (queryCount[normalizedQuery] || 0) + 1;
    });
    
    return Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  // Get recent unique searches
  getRecentUniqueSearches(limit: number = 10): string[] {
    const history = this.getHistory();
    const uniqueQueries = new Set<string>();
    const recentQueries: string[] = [];
    
    for (const item of history) {
      const normalizedQuery = item.query.toLowerCase();
      if (!uniqueQueries.has(normalizedQuery) && recentQueries.length < limit) {
        uniqueQueries.add(normalizedQuery);
        recentQueries.push(item.query);
      }
    }
    
    return recentQueries;
  }

  // Search within history
  searchHistory(searchTerm: string): SearchHistoryItem[] {
    const history = this.getHistory();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return history.filter(item => 
      item.query.toLowerCase().includes(lowerSearchTerm)
    );
  }

  // Get search statistics
  getSearchStats(): {
    totalSearches: number;
    uniqueQueries: number;
    averageResultsPerSearch: number;
    mostPopularQuery: string | null;
  } {
    const history = this.getHistory();
    const uniqueQueries = new Set(history.map(item => item.query.toLowerCase()));
    const totalResults = history.reduce((sum, item) => sum + item.resultsCount, 0);
    const popularSearches = this.getPopularSearches(1);
    
    return {
      totalSearches: history.length,
      uniqueQueries: uniqueQueries.size,
      averageResultsPerSearch: history.length > 0 ? Math.round(totalResults / history.length) : 0,
      mostPopularQuery: popularSearches.length > 0 ? popularSearches[0].query : null
    };
  }
}

export const searchHistoryService = new SearchHistoryService();
export default searchHistoryService;