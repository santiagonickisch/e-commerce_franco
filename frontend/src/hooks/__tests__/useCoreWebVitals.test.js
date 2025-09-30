import { renderHook } from '@testing-library/react';
import useCoreWebVitals from '../useCoreWebVitals';

// Mock de PerformanceObserver
const mockPerformanceObserver = jest.fn();
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

mockPerformanceObserver.mockImplementation((callback) => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
  callback
}));

global.PerformanceObserver = mockPerformanceObserver;

// Mock de window.gtag
global.gtag = jest.fn();

// Mock de console methods
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('useCoreWebVitals Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('initializes and sets up performance observers', () => {
    renderHook(() => useCoreWebVitals());

    // Should create observers for different metrics
    expect(mockPerformanceObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { entryTypes: ['largest-contentful-paint'] }
    );
    expect(mockPerformanceObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { entryTypes: ['first-input'] }
    );
    expect(mockPerformanceObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { entryTypes: ['layout-shift'] }
    );
    expect(mockPerformanceObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { entryTypes: ['paint'] }
    );
  });

  it('handles LCP measurement', () => {
    renderHook(() => useCoreWebVitals());

    // Get the LCP observer callback
    const lcpObserverCall = mockPerformanceObserver.mock.calls.find(
      call => call[1]?.entryTypes?.includes('largest-contentful-paint')
    );
    const lcpCallback = lcpObserverCall[0];

    // Mock LCP entry
    const mockLCPEntry = {
      startTime: 1500
    };

    // Call the callback
    lcpCallback([mockLCPEntry]);

    expect(consoleSpy).toHaveBeenCalledWith('LCP:', 1500);
    expect(global.gtag).toHaveBeenCalledWith('event', 'web_vitals', {
      name: 'LCP',
      value: 1500,
      event_category: 'Web Vitals'
    });
  });

  it('handles FID measurement', () => {
    renderHook(() => useCoreWebVitals());

    // Get the FID observer callback
    const fidObserverCall = mockPerformanceObserver.mock.calls.find(
      call => call[1]?.entryTypes?.includes('first-input')
    );
    const fidCallback = fidObserverCall[0];

    // Mock FID entry
    const mockFIDEntry = {
      startTime: 100,
      processingStart: 150
    };

    // Call the callback
    fidCallback([mockFIDEntry]);

    expect(consoleSpy).toHaveBeenCalledWith('FID:', 50);
    expect(global.gtag).toHaveBeenCalledWith('event', 'web_vitals', {
      name: 'FID',
      value: 50,
      event_category: 'Web Vitals'
    });
  });

  it('handles CLS measurement', () => {
    renderHook(() => useCoreWebVitals());

    // Get the CLS observer callback
    const clsObserverCall = mockPerformanceObserver.mock.calls.find(
      call => call[1]?.entryTypes?.includes('layout-shift')
    );
    const clsCallback = clsObserverCall[0];

    // Mock CLS entry
    const mockCLSEntry = {
      value: 0.1,
      hadRecentInput: false
    };

    // Call the callback
    clsCallback([mockCLSEntry]);

    expect(consoleSpy).toHaveBeenCalledWith('CLS:', 0.1);
    expect(global.gtag).toHaveBeenCalledWith('event', 'web_vitals', {
      name: 'CLS',
      value: 100,
      event_category: 'Web Vitals'
    });
  });

  it('handles FCP measurement', () => {
    renderHook(() => useCoreWebVitals());

    // Get the FCP observer callback
    const fcpObserverCall = mockPerformanceObserver.mock.calls.find(
      call => call[1]?.entryTypes?.includes('paint')
    );
    const fcpCallback = fcpObserverCall[0];

    // Mock FCP entry
    const mockFCPEntry = {
      name: 'first-contentful-paint',
      startTime: 800
    };

    // Call the callback
    fcpCallback([mockFCPEntry]);

    expect(consoleSpy).toHaveBeenCalledWith('FCP:', 800);
    expect(global.gtag).toHaveBeenCalledWith('event', 'web_vitals', {
      name: 'FCP',
      value: 800,
      event_category: 'Web Vitals'
    });
  });

  it('handles multiple CLS entries', () => {
    renderHook(() => useCoreWebVitals());

    // Get the CLS observer callback
    const clsObserverCall = mockPerformanceObserver.mock.calls.find(
      call => call[1]?.entryTypes?.includes('layout-shift')
    );
    const clsCallback = clsObserverCall[0];

    // Mock multiple CLS entries
    const mockCLSEntries = [
      { value: 0.1, hadRecentInput: false },
      { value: 0.05, hadRecentInput: false }
    ];

    // Call the callback with multiple entries
    clsCallback(mockCLSEntries);

    expect(consoleSpy).toHaveBeenCalledWith('CLS:', 0.15);
    expect(global.gtag).toHaveBeenCalledWith('event', 'web_vitals', {
      name: 'CLS',
      value: 150,
      event_category: 'Web Vitals'
    });
  });

  it('ignores CLS entries with recent input', () => {
    renderHook(() => useCoreWebVitals());

    // Get the CLS observer callback
    const clsObserverCall = mockPerformanceObserver.mock.calls.find(
      call => call[1]?.entryTypes?.includes('layout-shift')
    );
    const clsCallback = clsObserverCall[0];

    // Mock CLS entry with recent input
    const mockCLSEntry = {
      value: 0.1,
      hadRecentInput: true
    };

    // Call the callback
    clsCallback([mockCLSEntry]);

    // Should not log or send to gtag
    expect(consoleSpy).not.toHaveBeenCalledWith('CLS:', 0.1);
    expect(global.gtag).not.toHaveBeenCalledWith('event', 'web_vitals', {
      name: 'CLS',
      value: 100,
      event_category: 'Web Vitals'
    });
  });

  it('handles cleanup on unmount', () => {
    const { unmount } = renderHook(() => useCoreWebVitals());

    unmount();

    // Should disconnect all observers
    expect(mockDisconnect).toHaveBeenCalledTimes(4); // LCP, FID, CLS, FCP
  });

  it('handles PerformanceObserver not available', () => {
    const originalPerformanceObserver = global.PerformanceObserver;
    delete global.PerformanceObserver;

    // Should not throw error
    expect(() => {
      renderHook(() => useCoreWebVitals());
    }).not.toThrow();

    // Restore
    global.PerformanceObserver = originalPerformanceObserver;
  });
});
