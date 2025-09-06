import { useState, useEffect, useCallback } from 'react';
import { loadArticleState, saveArticleState, clearArticleState, getLastSaved } from '../utils/localStorage';
import type { ArticleData, ArticleState } from '../utils/localStorage';

export const useArticleState = () => {
  const [state, setState] = useState<ArticleState>(() => loadArticleState());
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(() => getLastSaved());

  // Debounced save function
  const [saveTimeout, setSaveTimeout] = useState<number | null>(null);

  const debouncedSave = useCallback((newState: ArticleState) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeout = setTimeout(() => {
      setIsAutoSaving(true);
      saveArticleState(newState);
      setLastSaved(new Date());
      setIsAutoSaving(false);
    }, 1000); // Save after 1 second of inactivity
    
    setSaveTimeout(timeout);
  }, [saveTimeout]);

  // Auto-save when state changes
  useEffect(() => {
    debouncedSave(state);
    
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [state, debouncedSave, saveTimeout]);

  // Update article data
  const updateArticleData = useCallback((updates: Partial<ArticleData>) => {
    setState(prev => ({
      ...prev,
      articleData: { ...prev.articleData, ...updates }
    }));
  }, []);

  // Update word count and reading time
  const updateWordCount = useCallback((content: string) => {
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(words / 200); // Assuming 200 words per minute
    
    setState(prev => ({
      ...prev,
      wordCount: words,
      readingTime
    }));
  }, []);

  // Update SEO metrics
  const updateSEOMetrics = useCallback((seoScore: number, seoKeywords: string[]) => {
    setState(prev => ({
      ...prev,
      seoScore,
      seoKeywords
    }));
  }, []);

  // Force save immediately
  const forceSave = useCallback(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    setIsAutoSaving(true);
    saveArticleState(state);
    setLastSaved(new Date());
    setIsAutoSaving(false);
  }, [state, saveTimeout]);

  // Clear all data
  const clearAll = useCallback(() => {
    clearArticleState();
    setState({
      articleData: {
        title: '',
        content: '',
        excerpt: '',
        tags: [],
        category: 'Technology',
        status: 'draft'
      },
      wordCount: 0,
      readingTime: 0,
      seoScore: 0,
      seoKeywords: [],
      lastSaved: null
    });
    setLastSaved(null);
  }, []);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    updateArticleData({ content: newContent });
    updateWordCount(newContent);
  }, [updateArticleData, updateWordCount]);

  // Handle title changes
  const handleTitleChange = useCallback((newTitle: string) => {
    updateArticleData({ title: newTitle });
  }, [updateArticleData]);

  return {
    state,
    isAutoSaving,
    lastSaved,
    updateArticleData,
    updateWordCount,
    updateSEOMetrics,
    handleContentChange,
    handleTitleChange,
    forceSave,
    clearAll
  };
};
