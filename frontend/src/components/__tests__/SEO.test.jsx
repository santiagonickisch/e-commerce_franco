import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SEO from '../SEO';

// Mock de react-helmet-async
jest.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => <div data-testid="helmet">{children}</div>
}));

describe('SEO Component', () => {
  it('renders with default props', () => {
    render(<SEO />);
    const helmet = document.querySelector('[data-testid="helmet"]');
    expect(helmet).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<SEO title="Custom Title" />);
    const helmet = document.querySelector('[data-testid="helmet"]');
    expect(helmet).toBeInTheDocument();
  });

  it('renders with custom description', () => {
    render(<SEO description="Custom description" />);
    const helmet = document.querySelector('[data-testid="helmet"]');
    expect(helmet).toBeInTheDocument();
  });

  it('renders with custom keywords', () => {
    render(<SEO keywords="custom, keywords" />);
    const helmet = document.querySelector('[data-testid="helmet"]');
    expect(helmet).toBeInTheDocument();
  });

  it('renders with custom image', () => {
    render(<SEO image="/custom-image.jpg" />);
    const helmet = document.querySelector('[data-testid="helmet"]');
    expect(helmet).toBeInTheDocument();
  });

  it('renders with custom URL', () => {
    render(<SEO url="/custom-page" />);
    const helmet = document.querySelector('[data-testid="helmet"]');
    expect(helmet).toBeInTheDocument();
  });

  it('renders with custom type', () => {
    render(<SEO type="article" />);
    const helmet = document.querySelector('[data-testid="helmet"]');
    expect(helmet).toBeInTheDocument();
  });

  it('renders with structured data', () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Test Organization"
    };

    render(<SEO structuredData={structuredData} />);
    const helmet = document.querySelector('[data-testid="helmet"]');
    expect(helmet).toBeInTheDocument();
  });

  it('handles full URL for image', () => {
    render(<SEO image="https://example.com/image.jpg" />);
    const helmet = document.querySelector('[data-testid="helmet"]');
    expect(helmet).toBeInTheDocument();
  });

  it('handles relative URL for image', () => {
    render(<SEO image="/relative-image.jpg" />);
    const helmet = document.querySelector('[data-testid="helmet"]');
    expect(helmet).toBeInTheDocument();
  });

  it('renders with all props', () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Test Product"
    };

    render(
      <SEO
        title="Test Title"
        description="Test description"
        keywords="test, keywords"
        image="/test-image.jpg"
        url="/test-page"
        type="product"
        structuredData={structuredData}
      />
    );

    const helmet = document.querySelector('[data-testid="helmet"]');
    expect(helmet).toBeInTheDocument();
  });
});
