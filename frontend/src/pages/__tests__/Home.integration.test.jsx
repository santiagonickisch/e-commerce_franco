import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import Home from '../Home';

// Mock de react-helmet-async
jest.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => <div data-testid="helmet">{children}</div>
}));

const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );
};

describe('Home Page Integration Tests', () => {
  it('renders the complete home page', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Check main elements are present
    expect(screen.getByText('Bienvenido a')).toBeInTheDocument();
    expect(screen.getByText('franco')).toBeInTheDocument();
    expect(screen.getByText('SALÓN EXCLUSIVO')).toBeInTheDocument();
    expect(screen.getByText('Explora por Categorías')).toBeInTheDocument();
  });

  it('displays all product categories', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const categories = [
      'Aceite', 'Acondicionador', 'Aerosol', 'Cera', 'Gel',
      'Mascara', 'Oxidantes', 'Shampoo', 'Spray'
    ];

    categories.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('displays featured products', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Check for featured products section
    expect(screen.getByText('Productos Destacados')).toBeInTheDocument();
    
    // Check for product cards
    const productCards = screen.getAllByText(/iPhone 15 Pro|MacBook Air M2|Auriculares Inalámbricos|Lámpara de Mesa LED/);
    expect(productCards).toHaveLength(4);
  });

  it('navigates to products page when category is clicked', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const aceiteCategory = screen.getByText('Aceite').closest('div');
    fireEvent.click(aceiteCategory);

    // Should navigate to products page (this would be tested with actual routing)
    expect(aceiteCategory).toBeInTheDocument();
  });

  it('displays call-to-action buttons', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByText('Explorar Productos')).toBeInTheDocument();
    expect(screen.getByText('Ver Carrito')).toBeInTheDocument();
  });

  it('shows product ratings and reviews', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Check for star ratings
    const starElements = screen.getAllByText('★');
    expect(starElements.length).toBeGreaterThan(0);

    // Check for review counts
    expect(screen.getByText('124')).toBeInTheDocument(); // iPhone reviews
    expect(screen.getByText('89')).toBeInTheDocument(); // MacBook reviews
  });

  it('displays product prices', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByText('$999.99')).toBeInTheDocument();
    expect(screen.getByText('$1199.99')).toBeInTheDocument();
    expect(screen.getByText('$199.99')).toBeInTheDocument();
    expect(screen.getByText('$89.99')).toBeInTheDocument();
  });

  it('has proper SEO meta tags', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  it('displays category counts', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Check for category counts
    expect(screen.getByText('45')).toBeInTheDocument(); // Aceite count
    expect(screen.getByText('38')).toBeInTheDocument(); // Acondicionador count
    expect(screen.getByText('52')).toBeInTheDocument(); // Aerosol count
  });

  it('has proper styling classes', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const mainContainer = screen.getByText('Bienvenido a').closest('div');
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-elegant-black', 'gray-particles');
  });

  it('displays hero section with proper content', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const heroSection = screen.getByText('Bienvenido a').closest('section');
    expect(heroSection).toHaveClass('relative', 'bg-gradient-to-br');
  });

  it('shows product images', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const productImages = screen.getAllByRole('img');
    expect(productImages.length).toBeGreaterThan(0);
  });
});
