/**
 * NotFound Page Tests
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import NotFound from '../../src/pages/NotFound';

// Mock window.history.back
const mockHistoryBack = jest.fn();

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <HelmetProvider>
      <MemoryRouter>{component}</MemoryRouter>
    </HelmetProvider>
  );
};

describe('NotFound Page', () => {
  beforeEach(() => {
    mockHistoryBack.mockClear();
    // Mock window.history.back
    Object.defineProperty(window, 'history', {
      value: { back: mockHistoryBack },
      writable: true,
      configurable: true,
    });
  });

  it('should render 404 heading', () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('should render page not found message', () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('should render description text', () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByText(/The page you're looking for doesn't exist/)).toBeInTheDocument();
  });

  it('should have a link to home page', () => {
    renderWithRouter(<NotFound />);
    const homeLink = screen.getByRole('link', { name: /go home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should have a link to browse page', () => {
    renderWithRouter(<NotFound />);
    const browseLink = screen.getByRole('link', { name: /browse food/i });
    expect(browseLink).toHaveAttribute('href', '/browse');
  });

  it('should have a go back button', () => {
    renderWithRouter(<NotFound />);
    const goBackButton = screen.getByRole('button', { name: /go back/i });
    expect(goBackButton).toBeInTheDocument();
  });

  it('should call history.back when go back button is clicked', () => {
    renderWithRouter(<NotFound />);
    const goBackButton = screen.getByRole('button', { name: /go back/i });
    fireEvent.click(goBackButton);
    expect(mockHistoryBack).toHaveBeenCalledTimes(1);
  });

  it('should render icons in navigation buttons', () => {
    renderWithRouter(<NotFound />);
    // Check that the links and button exist with their icons
    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse food/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });
});
