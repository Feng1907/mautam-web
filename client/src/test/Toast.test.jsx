import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { ToastProvider, useToast } from '../components/Toast';

// Helper component that fires toasts
const Trigger = ({ message, type }) => {
  const toast = useToast();
  return <button onClick={() => toast(message, type)}>fire</button>;
};

const renderWithToast = (message = 'Hello', type = 'info') =>
  render(
    <ToastProvider>
      <Trigger message={message} type={type} />
    </ToastProvider>
  );

describe('ToastProvider', () => {
  it('hiện toast khi gọi toast()', async () => {
    renderWithToast('Lưu thành công', 'success');
    await userEvent.click(screen.getByRole('button', { name: 'fire' }));
    expect(screen.getByText('Lưu thành công')).toBeInTheDocument();
  });

  it('container có role=status và aria-live=polite', () => {
    renderWithToast();
    const region = document.querySelector('[role="status"]');
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('đóng toast khi bấm nút X', async () => {
    renderWithToast('Có thể đóng', 'info');
    await userEvent.click(screen.getByRole('button', { name: 'fire' }));
    expect(screen.getByText('Có thể đóng')).toBeInTheDocument();

    // X button has no text label — select by its position after fire button
    const [, closeBtn] = screen.getAllByRole('button');
    await userEvent.click(closeBtn);
    // wait for framer-motion exit animation to complete
    await waitFor(() => expect(screen.queryByText('Có thể đóng')).not.toBeInTheDocument());
  });

  it('useToast ném lỗi nếu dùng ngoài ToastProvider', () => {
    const Bad = () => { useToast(); return null; };
    expect(() => render(<Bad />)).toThrow('useToast must be inside ToastProvider');
  });
});
