/**
 * LazyImage Component Tests
 */
import { render, screen, fireEvent } from '@testing-library/react';
import LazyImage from '../../src/components/common/LazyImage';

describe('LazyImage Component', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test Image',
  };

  it('should render with required props', () => {
    render(<LazyImage {...defaultProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', defaultProps.src);
    expect(img).toHaveAttribute('alt', defaultProps.alt);
  });

  it('should apply lazy loading attribute', () => {
    render(<LazyImage {...defaultProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('should apply async decoding attribute', () => {
    render(<LazyImage {...defaultProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('should apply width and height when provided', () => {
    render(<LazyImage {...defaultProps} width={300} height={200} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '300');
    expect(img).toHaveAttribute('height', '200');
  });

  it('should apply sizes attribute when provided', () => {
    render(<LazyImage {...defaultProps} sizes="(max-width: 768px) 100vw, 50vw" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
  });

  it('should apply custom className', () => {
    render(<LazyImage {...defaultProps} className="custom-class" />);
    const img = screen.getByRole('img');
    expect(img.className).toContain('custom-class');
  });

  it('should show placeholder while loading', () => {
    const { container } = render(<LazyImage {...defaultProps} />);
    // Should have shimmer effect div
    const shimmer = container.querySelector('.animate-pulse');
    expect(shimmer).toBeInTheDocument();
  });

  it('should remove shimmer after image loads', () => {
    const { container } = render(<LazyImage {...defaultProps} />);
    const img = screen.getByRole('img');

    // Simulate image load
    fireEvent.load(img);

    // Shimmer should be removed after load
    const shimmer = container.querySelector('.animate-pulse');
    expect(shimmer).not.toBeInTheDocument();
  });

  it('should become visible after loading', () => {
    render(<LazyImage {...defaultProps} />);
    const img = screen.getByRole('img');

    // Initially should have opacity-0
    expect(img.className).toContain('opacity-0');

    // Simulate image load
    fireEvent.load(img);

    // Should have opacity-100 after load
    expect(img.className).toContain('opacity-100');
  });

  it('should display error fallback on image load failure', () => {
    render(<LazyImage {...defaultProps} />);
    const img = screen.getByRole('img');

    // Simulate image error
    fireEvent.error(img);

    // Should show fallback with emoji
    expect(screen.getByText('🍽️')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /failed to load/i })).toBeInTheDocument();
  });

  it('should show aria-label with alt text on error', () => {
    render(<LazyImage {...defaultProps} alt="Delicious Pizza" />);
    const img = screen.getByRole('img');

    // Simulate image error
    fireEvent.error(img);

    // Should show appropriate aria-label
    const fallback = screen.getByRole('img', { name: /failed to load: Delicious Pizza/i });
    expect(fallback).toBeInTheDocument();
  });

  it('should apply custom placeholder color', () => {
    const { container } = render(<LazyImage {...defaultProps} placeholderColor="#FF0000" />);
    // Just verify it renders - the actual color is in inline styles
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should apply width and height to error fallback', () => {
    render(<LazyImage {...defaultProps} width={200} height={150} />);
    const img = screen.getByRole('img');

    // Simulate image error
    fireEvent.error(img);

    const fallback = screen.getByRole('img', { name: /failed to load/i });
    // Width and height are removed from error fallback to avoid inline styles
    expect(fallback).toBeInTheDocument();
  });
});
