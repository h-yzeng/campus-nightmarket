import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { RequireAuth } from '../../src/routes';

// Mock Firebase config to avoid import.meta in tests
jest.mock('../../src/config/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}));

const renderWithRoutes = (element: React.ReactElement, initialPath = '/protected') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/protected" element={element} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('RequireAuth', () => {
  it('renders loading fallback while auth is loading', () => {
    renderWithRoutes(
      <RequireAuth user={null} loading>
        <div>Secret</div>
      </RequireAuth>
    );

    expect(screen.getAllByText(/loading page/i).length).toBeGreaterThan(0);
  });

  it('redirects unauthenticated users to login', () => {
    renderWithRoutes(
      <RequireAuth user={null} loading={false}>
        <div>Secret</div>
      </RequireAuth>
    );

    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    const fakeUser = { uid: '123' } as User;

    renderWithRoutes(
      <RequireAuth user={fakeUser} loading={false}>
        <div>Secret</div>
      </RequireAuth>
    );

    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});
