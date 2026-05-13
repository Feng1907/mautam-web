import { createRequire } from 'node:module';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const require = createRequire(import.meta.url);
const nodemailer = require('nodemailer');
const sendEmail = require('../src/utils/sendEmail');

describe('sendEmail nodemailer mock', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.EMAIL_HOST = 'smtp.test.local';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'noreply@test.local';
    process.env.EMAIL_PASS = 'secret';
  });

  it('gui email thanh cong qua nodemailer transporter', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'ok-1' });
    const createTransport = vi
      .spyOn(nodemailer, 'createTransport')
      .mockReturnValue({ sendMail });

    await sendEmail({
      to: 'parent@test.local',
      subject: 'Thong bao',
      html: '<p>Xin chao</p>',
    });

    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.test.local',
      port: 587,
      secure: false,
      auth: {
        user: 'noreply@test.local',
        pass: 'secret',
      },
    });
    expect(sendMail).toHaveBeenCalledWith({
      from: '"Xứ Đoàn Mẫu Tâm" <noreply@test.local>',
      to: 'parent@test.local',
      subject: 'Thong bao',
      html: '<p>Xin chao</p>',
    });
  });

  it('noi loi khi nodemailer gui email that bai', async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error('SMTP down'));
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail });

    await expect(sendEmail({
      to: 'parent@test.local',
      subject: 'Thong bao',
      html: '<p>Xin chao</p>',
    })).rejects.toThrow('SMTP down');
  });
});
