import { renderHook, act, waitFor } from '@testing-library/react';
import useOptimizedQuery from '../useOptimizedQuery';

// Mock de axios
jest.mock('axios');
const axios = require('axios');

describe('useOptimizedQuery Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockClear();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useOptimizedQuery('/test'));

    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isStale).toBe(false);
  });

  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    axios.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useOptimizedQuery('/test'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles fetch errors', async () => {
    const mockError = new Error('Network error');
    axios.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useOptimizedQuery('/test'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.data).toBe(null);
  });

  it('retries on failure with exponential backoff', async () => {
    const mockError = new Error('Network error');
    axios.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useOptimizedQuery('/test', { retry: 2, retryDelay: 100 }));

    await act(async () => {
      await result.current.refetch();
    });

    // Should retry 2 times (initial + 2 retries)
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  it('caches data and returns cached data on subsequent calls', async () => {
    const mockData = { id: 1, name: 'Test' };
    axios.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useOptimizedQuery('/test', { cacheTime: 300000 }));

    // First call
    await act(async () => {
      await result.current.refetch();
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);

    // Second call should use cache
    await act(async () => {
      await result.current.refetch();
    });

    // Should not make another API call
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
  });

  it('handles debounced fetch', async () => {
    const mockData = { id: 1, name: 'Test' };
    axios.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useOptimizedQuery('/test', { debounceMs: 100 }));

    // Multiple rapid calls
    act(() => {
      result.current.debouncedFetch({ search: 'a' });
      result.current.debouncedFetch({ search: 'ab' });
      result.current.debouncedFetch({ search: 'abc' });
    });

    // Wait for debounce
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Should only make one API call
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('invalidates cache correctly', async () => {
    const mockData = { id: 1, name: 'Test' };
    axios.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useOptimizedQuery('/test'));

    // First call
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual(mockData);

    // Invalidate cache
    act(() => {
      result.current.invalidateCache();
    });

    expect(result.current.isStale).toBe(true);
  });

  it('handles disabled state', async () => {
    const { result } = renderHook(() => useOptimizedQuery('/test', { enabled: false }));

    await act(async () => {
      await result.current.refetch();
    });

    // Should not make API call when disabled
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('handles different cache times', async () => {
    const mockData = { id: 1, name: 'Test' };
    axios.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useOptimizedQuery('/test', { cacheTime: 100 }));

    // First call
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual(mockData);

    // Wait for cache to expire
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Second call should make new API call
    await act(async () => {
      await result.current.refetch();
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('handles loading state correctly', async () => {
    let resolvePromise;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    axios.get.mockReturnValue(promise);

    const { result } = renderHook(() => useOptimizedQuery('/test'));

    act(() => {
      result.current.refetch();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise({ data: { id: 1 } });
    });

    expect(result.current.loading).toBe(false);
  });

  it('cleans up timeouts on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const { unmount } = renderHook(() => useOptimizedQuery('/test'));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('handles different retry delays', async () => {
    const mockError = new Error('Network error');
    axios.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useOptimizedQuery('/test', { retry: 1, retryDelay: 200 }));

    await act(async () => {
      await result.current.refetch();
    });

    // Should retry with delay
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('handles stale data correctly', async () => {
    const mockData1 = { id: 1, name: 'Test 1' };
    const mockData2 = { id: 2, name: 'Test 2' };
    
    axios.get
      .mockResolvedValueOnce({ data: mockData1 })
      .mockResolvedValueOnce({ data: mockData2 });

    const { result } = renderHook(() => useOptimizedQuery('/test'));

    // First call
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual(mockData1);
    expect(result.current.isStale).toBe(false);

    // Invalidate cache
    act(() => {
      result.current.invalidateCache();
    });

    expect(result.current.isStale).toBe(true);

    // Second call
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual(mockData2);
    expect(result.current.isStale).toBe(false);
  });
});
