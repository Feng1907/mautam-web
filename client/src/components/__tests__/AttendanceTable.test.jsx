import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AttendanceTable from '../AttendanceTable';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
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
    phuHuynh: { email: 'parent@example.com' },
  },
];

describe('AttendanceTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    api.get.mockImplementation((url) => {
      if (url === '/namhoc') {
        return Promise.resolve({
          data: {
            data: [
              {
                _id: 'year-1',
                ten: '2026',
                dangHoatDong: true,
                ngayBatDau: '2026-01-01',
                ngayKetThuc: '2026-01-31',
              },
            ],
          },
        });
      }

      if (url === '/attendance/sundays') {
        return Promise.resolve({
          data: { data: ['2026-01-04', '2026-01-11'] },
        });
      }

      if (url === '/attendance/class-1') {
        return Promise.resolve({
          data: {
            data: [
              { student: 'student-1', date: '2026-01-04', present: true },
            ],
          },
        });
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    api.post.mockResolvedValue({ data: { success: true } });
  });

  it('toggles an absent day to present and updates the attendance percentage', async () => {
    const user = userEvent.setup();

    render(<AttendanceTable lopId="class-1" students={students} canEdit />);

    expect(await screen.findByText('50%')).toBeInTheDocument();

    await user.click(screen.getByTitle(/V.*ng/i));

    expect(api.post).toHaveBeenCalledWith('/attendance', {
      studentId: 'student-1',
      lopId: 'class-1',
      date: '2026-01-11',
      present: true,
      namHocId: 'year-1',
    });

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });
});
