// localStorage utilities for article state management

export interface ArticleData {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'scheduled';
  publishDate?: string;
  seoTitle?: string;
  metaDescription?: string;
}

export interface ArticleState {
  articleData: ArticleData;
  wordCount: number;
  readingTime: number;
  seoScore: number;
  seoKeywords: string[];
  lastSaved: string | null;
}

const STORAGE_KEYS = {
  ARTICLE_DATA: 'genio_article_data',
  ARTICLE_STATE: 'genio_article_state',
  LAST_SAVED: 'genio_last_saved'
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
  }
  return defaultValue;
};

export const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

export const loadArticleState = (): ArticleState => {
  const defaultState: ArticleState = {
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
  };

  return loadFromStorage(STORAGE_KEYS.ARTICLE_STATE, defaultState);
};

export const saveArticleState = (state: ArticleState): void => {
  saveToStorage(STORAGE_KEYS.ARTICLE_STATE, state);
  saveToStorage(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
};

export const clearArticleState = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export const getLastSaved = (): Date | null => {
  const saved = loadFromStorage(STORAGE_KEYS.LAST_SAVED, null);
  return saved ? new Date(saved) : null;
};
