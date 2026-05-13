import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RouteGuard from '../RouteGuard';
import { useAuth } from '../../store/AuthContext';

vi.mock('../../store/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../LoadingSpinner', () => ({
  default: () => <div>Loading...</div>,
}));

const renderProtectedRoute = () =>
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/admin"
          element={
            <RouteGuard roles={['admin']}>
              <div>Admin content</div>
            </RouteGuard>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe('RouteGuard', () => {
  it('redirects unauthenticated users to the login route', async () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    renderProtectedRoute();

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });

  it('redirects authenticated users without the required role to the home route', async () => {
    useAuth.mockReturnValue({
      user: { _id: 'user-1', vaiTro: 'giaoLyVien' },
      loading: false,
    });

    renderProtectedRoute();

    expect(await screen.findByText('Home page')).toBeInTheDocument();
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });
});
