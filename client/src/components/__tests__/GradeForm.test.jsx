import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GradeForm from '../GradeForm';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../ExportButton', () => ({
  default: () => <button type="button">Export</button>,
}));

const students = [
  {
    _id: 'student-1',
    tenThanh: 'Phero',
    hoTen: 'Nguyen Van An',
    gioiTinh: 'Nam',
    phuHuynh: { email: 'parent@example.com' },
  },
];

describe('GradeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    api.get.mockImplementation((url) => {
      if (url === '/grades/class-1') {
        return Promise.resolve({ data: { data: [] } });
      }

      if (url === '/chuyen-can/class-1') {
        return Promise.resolve({ data: { data: [] } });
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    api.post.mockResolvedValue({
      data: {
        data: {
          _id: 'grade-1',
          student: { _id: 'student-1' },
          loaiDiem: 'mieng',
          diem: 8,
        },
      },
    });
  });

  it('recalculates and displays TBM immediately after a new component score is entered', async () => {
    const user = userEvent.setup();

    render(<GradeForm lopId="class-1" students={students} canEdit />);

    const row = await screen.findByText('Nguyen Van An');
    await user.click(screen.getByTitle(/Th.*m.*i.*m/i));

    await user.type(screen.getByRole('spinbutton'), '8');
    await user.click(screen.getByRole('button', { name: /L.*u/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/grades', {
        student: 'student-1',
        lop: 'class-1',
        hocKy: 1,
        loaiDiem: 'mieng',
        diem: 8,
        ghiChu: '',
      });
    });

    await waitFor(() => {
      expect(within(row.closest('tr')).getAllByText('8.0').length).toBeGreaterThan(0);
    });
  });
});
