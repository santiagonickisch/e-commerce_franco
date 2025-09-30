import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OfflineIndicator from '../OfflineIndicator';

// Mock de fetch
global.fetch = jest.fn();

describe('OfflineIndicator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('does not render when showIndicator is false', () => {
    render(<OfflineIndicator />);
    expect(screen.queryByText('Conexión restaurada')).not.toBeInTheDocument();
    expect(screen.queryByText('Sin conexión')).not.toBeInTheDocument();
  });

  it('shows offline indicator when connection is lost', async () => {
    render(<OfflineIndicator />);

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    fireEvent(window, new Event('offline'));

    await waitFor(() => {
      expect(screen.getByText('Sin conexión')).toBeInTheDocument();
      expect(screen.getByText('Algunas funciones pueden estar limitadas')).toBeInTheDocument();
    });
  });

  it('shows online indicator when connection is restored', async () => {
    render(<OfflineIndicator />);

    // First go offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
    fireEvent(window, new Event('offline'));

    await waitFor(() => {
      expect(screen.getByText('Sin conexión')).toBeInTheDocument();
    });

    // Then go online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    fireEvent(window, new Event('online'));

    await waitFor(() => {
      expect(screen.getByText('Conexión restaurada')).toBeInTheDocument();
      expect(screen.getByText('Ya puedes navegar normalmente')).toBeInTheDocument();
    });
  });

  it('hides indicator after 3 seconds when online', async () => {
    jest.useFakeTimers();
    render(<OfflineIndicator />);

    // Go online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    fireEvent(window, new Event('online'));

    await waitFor(() => {
      expect(screen.getByText('Conexión restaurada')).toBeInTheDocument();
    });

    // Fast-forward time
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.queryByText('Conexión restaurada')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('handles reconnect button click', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });

    render(<OfflineIndicator />);

    // Go offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
    fireEvent(window, new Event('offline'));

    await waitFor(() => {
      expect(screen.getByText('Sin conexión')).toBeInTheDocument();
    });

    // Click reconnect button
    const reconnectButton = screen.getByRole('button');
    fireEvent.click(reconnectButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/health');
  });

  it('handles reconnect failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<OfflineIndicator />);

    // Go offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
    fireEvent(window, new Event('offline'));

    await waitFor(() => {
      expect(screen.getByText('Sin conexión')).toBeInTheDocument();
    });

    // Click reconnect button
    const reconnectButton = screen.getByRole('button');
    fireEvent.click(reconnectButton);

    await waitFor(() => {
      expect(screen.getByText('Sin conexión')).toBeInTheDocument();
    });
  });

  it('shows reconnecting state during reconnect', async () => {
    global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<OfflineIndicator />);

    // Go offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
    fireEvent(window, new Event('offline'));

    await waitFor(() => {
      expect(screen.getByText('Sin conexión')).toBeInTheDocument();
    });

    // Click reconnect button
    const reconnectButton = screen.getByRole('button');
    fireEvent.click(reconnectButton);

    // Should show spinning icon
    expect(reconnectButton).toBeDisabled();
    expect(reconnectButton.querySelector('svg')).toHaveClass('animate-spin');
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(<OfflineIndicator />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('applies correct CSS classes for offline state', async () => {
    render(<OfflineIndicator />);

    // Go offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
    fireEvent(window, new Event('offline'));

    await waitFor(() => {
      const indicator = screen.getByText('Sin conexión').closest('div');
      expect(indicator).toHaveClass('bg-red-600');
    });
  });

  it('applies correct CSS classes for online state', async () => {
    render(<OfflineIndicator />);

    // Go online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    fireEvent(window, new Event('online'));

    await waitFor(() => {
      const indicator = screen.getByText('Conexión restaurada').closest('div');
      expect(indicator).toHaveClass('bg-green-600');
    });
  });
});
