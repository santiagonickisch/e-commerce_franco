import { renderHook, act } from '@testing-library/react';
import useServiceWorker from '../useServiceWorker';

// Mock de navigator.serviceWorker
const mockServiceWorker = {
  register: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  controller: null,
  ready: Promise.resolve({
    register: jest.fn()
  })
};

// Mock de navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock de window.addEventListener y removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
});
Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
});

// Mock de MessageChannel
global.MessageChannel = class MessageChannel {
  constructor() {
    this.port1 = {
      onmessage: null,
      postMessage: jest.fn()
    };
    this.port2 = {
      postMessage: jest.fn()
    };
  }
};

describe('useServiceWorker Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    navigator.serviceWorker = mockServiceWorker;
    navigator.onLine = true;
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.cacheSize).toBe(0);
  });

  it('registers service worker when available', async () => {
    const mockRegistration = {
      installing: null,
      waiting: null,
      active: {
        postMessage: jest.fn()
      },
      addEventListener: jest.fn()
    };

    mockServiceWorker.register.mockResolvedValue(mockRegistration);

    renderHook(() => useServiceWorker());

    expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js');
  });

  it('handles service worker registration error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockServiceWorker.register.mockRejectedValue(new Error('Registration failed'));

    renderHook(() => useServiceWorker());

    // Wait for async operation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error registrando Service Worker:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('handles online/offline events', () => {
    const { result } = renderHook(() => useServiceWorker());

    // Simulate going offline
    act(() => {
      navigator.onLine = false;
      const offlineHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'offline'
      )?.[1];
      if (offlineHandler) offlineHandler();
    });

    expect(result.current.isOnline).toBe(false);

    // Simulate going online
    act(() => {
      navigator.onLine = true;
      const onlineHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'online'
      )?.[1];
      if (onlineHandler) onlineHandler();
    });

    expect(result.current.isOnline).toBe(true);
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useServiceWorker());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('handles getCacheSize when service worker is not available', async () => {
    const { result } = renderHook(() => useServiceWorker());

    const size = await result.current.getCacheSize();
    expect(size).toBe(0);
  });

  it('handles clearCache when service worker is not available', async () => {
    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await result.current.clearCache();
    });

    // Should not throw error
    expect(result.current.cacheSize).toBe(0);
  });

  it('handles updateServiceWorker when no waiting service worker', () => {
    const { result } = renderHook(() => useServiceWorker());

    // Should not throw error
    result.current.updateServiceWorker();
  });

  it('handles syncInBackground when service worker is not available', () => {
    const { result } = renderHook(() => useServiceWorker());

    // Should not throw error
    result.current.syncInBackground();
  });

  it('handles sendNotification when permission is not granted', () => {
    // Mock Notification API
    global.Notification = {
      permission: 'denied',
      requestPermission: jest.fn()
    };

    const { result } = renderHook(() => useServiceWorker());

    // Should not throw error
    result.current.sendNotification('Test', 'Test message');
  });

  it('handles requestNotificationPermission', async () => {
    global.Notification = {
      permission: 'default',
      requestPermission: jest.fn().mockResolvedValue('granted')
    };

    const { result } = renderHook(() => useServiceWorker());

    const permission = await result.current.requestNotificationPermission();
    expect(permission).toBe(true);
    expect(global.Notification.requestPermission).toHaveBeenCalled();
  });
});
