import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

// Generic API hook interface
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface ApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showErrorAlert?: boolean;
}

// Generic API hook
export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: ApiOptions = {}
): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { immediate = true, onSuccess, onError, showErrorAlert = true } = options;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      setData(result);
      onSuccess?.(result);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      
      if (showErrorAlert && __DEV__) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showErrorAlert]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Mutation hook for API calls that modify data
interface MutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useMutation<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: ApiOptions = {}
): MutationState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { onSuccess, onError, showErrorAlert = true } = options;

  const mutate = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      
      if (showErrorAlert) {
        Alert.alert('Error', errorMessage);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showErrorAlert]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}

// Paginated API hook
interface PaginatedApiState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function usePaginatedApi<T>(
  apiFunction: (page: number, size: number) => Promise<{
    content: T[];
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
  }>,
  pageSize: number = 20,
  options: ApiOptions = {}
): PaginatedApiState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const { immediate = true, onSuccess, onError, showErrorAlert = true } = options;

  const loadData = useCallback(async (page: number, reset: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(page, pageSize);
      
      if (reset) {
        setData(result.content);
      } else {
        setData(prev => [...prev, ...result.content]);
      }
      
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setHasMore(result.hasNext);
      
      onSuccess?.(result);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      
      if (showErrorAlert) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunction, pageSize, onSuccess, onError, showErrorAlert]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadData(currentPage + 1, false);
  }, [hasMore, loading, currentPage, loadData]);

  const refresh = useCallback(async () => {
    setCurrentPage(0);
    setHasMore(true);
    await loadData(0, true);
  }, [loadData]);

  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(0);
    setTotalPages(0);
    setHasMore(true);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      loadData(0, true);
    }
  }, [immediate, loadData]);

  return {
    data,
    loading,
    error,
    hasMore,
    currentPage,
    totalPages,
    loadMore,
    refresh,
    reset,
  };
}

// Debounced API hook for search
export function useDebouncedApi<T>(
  apiFunction: (query: string) => Promise<T>,
  delay: number = 300,
  options: ApiOptions = {}
): ApiState<T> & { setQuery: (query: string) => void } {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  const debouncedApiFunction = useCallback(() => {
    if (!debouncedQuery) return Promise.resolve(null as T);
    return apiFunction(debouncedQuery);
  }, [apiFunction, debouncedQuery]);

  const apiState = useApi(debouncedApiFunction, {
    ...options,
    immediate: false,
  });

  // Fetch data when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      apiState.refetch();
    }
  }, [debouncedQuery, apiState]);

  return {
    ...apiState,
    setQuery,
  };
}

// Cache hook for API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();

export function useCachedApi<T>(
  apiFunction: () => Promise<T>,
  cacheKey: string,
  cacheTime: number = 5 * 60 * 1000, // 5 minutes
  options: ApiOptions = {}
): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { immediate = true, onSuccess, onError, showErrorAlert = true } = options;

  const fetchData = useCallback(async () => {
    // Check cache first
    const cachedData = apiCache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
      setData(cachedData.data);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      setData(result);
      
      // Cache the result
      apiCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
      
      onSuccess?.(result);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      
      if (showErrorAlert) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunction, cacheKey, cacheTime, onSuccess, onError, showErrorAlert]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Clear cache utility
export const clearApiCache = (key?: string) => {
  if (key) {
    apiCache.delete(key);
  } else {
    apiCache.clear();
  }
}; 