import { useState, useCallback } from 'react';
import { searchMemories, generateInsightFromMemories } from '../services/openai';
import { memoryStore } from '../services/memoryStore';

export const useMemorySearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchInsight, setSearchInsight] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchInsight('');
      return;
    }

    setIsSearching(true);

    try {
      const allMemories = memoryStore.getAll();
      const results = await searchMemories(query, allMemories);
      
      setSearchResults(results);

      if (results.length > 0) {
        const insight = await generateInsightFromMemories(results, query);
        setSearchInsight(insight);
      } else {
        setSearchInsight('没有找到相关记忆。');
      }

    } catch (error) {
      console.error('Search error:', error);
      setSearchInsight('搜索时遇到问题，请稍后再试。');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchInsight('');
  }, []);

  return {
    searchResults,
    searchInsight,
    isSearching,
    search,
    clearSearch
  };
};
