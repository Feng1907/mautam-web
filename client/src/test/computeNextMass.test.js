import { describe, it, expect } from 'vitest';

// Extracted from GioLe.jsx — pure function, no React needed
const computeNextMass = (isChaNhat, nowMins) => {
  const times = isChaNhat ? ['05:30', '09:00', '17:00', '18:30'] : ['05:30', '18:00'];
  for (const t of times) {
    const [h, m] = t.split(':').map(Number);
    const massMins = h * 60 + m;
    if (nowMins >= massMins && nowMins < massMins + 45) {
      return { time: t, ongoing: true };
    }
    if (massMins > nowMins) {
      const diff = massMins - nowMins;
      const hours = Math.floor(diff / 60);
      const mins  = diff % 60;
      return { time: t, ongoing: false, countdown: hours > 0 ? `${hours} giờ ${mins} phút` : `${mins} phút` };
    }
  }
  const diff = (24 * 60 - nowMins) + 5 * 60 + 30;
  const hours = Math.floor(diff / 60);
  const mins  = diff % 60;
  return { time: '05:30', ongoing: false, countdown: `${hours} giờ ${mins} phút`, tomorrow: true };
};

describe('computeNextMass', () => {
  it('trả về lễ kế tiếp vào ngày thường khi trước 05:30', () => {
    const result = computeNextMass(false, 4 * 60); // 04:00
    expect(result.time).toBe('05:30');
    expect(result.ongoing).toBe(false);
    expect(result.countdown).toMatch(/giờ|phút/);
  });

  it('trả về ongoing khi đang trong vòng 45 phút của lễ sáng', () => {
    const result = computeNextMass(false, 5 * 60 + 30 + 20); // 05:50
    expect(result.ongoing).toBe(true);
    expect(result.time).toBe('05:30');
  });

  it('trả về lễ chiều khi đã qua lễ sáng ngày thường', () => {
    const result = computeNextMass(false, 10 * 60); // 10:00
    expect(result.time).toBe('18:00');
    expect(result.ongoing).toBe(false);
  });

  it('trả về tomorrow khi đã qua tất cả lễ trong ngày', () => {
    const result = computeNextMass(false, 22 * 60); // 22:00
    expect(result.tomorrow).toBe(true);
    expect(result.time).toBe('05:30');
  });

  it('Chúa Nhật: lễ 09:00 khi 07:30', () => {
    const result = computeNextMass(true, 7 * 60 + 30); // 07:30
    expect(result.time).toBe('09:00');
    expect(result.ongoing).toBe(false);
  });

  it('Chúa Nhật: ongoing khi đang lễ 09:00', () => {
    const result = computeNextMass(true, 9 * 60 + 15); // 09:15
    expect(result.ongoing).toBe(true);
    expect(result.time).toBe('09:00');
  });

  it('đếm ngược chỉ phút khi < 1 giờ', () => {
    // 17:45 → lễ tiếp theo 18:30 Chúa Nhật → còn 45 phút, nhưng 17:45 trong window 17:00 lễ
    // 17:00 + 45 = 17:45 → ngưỡng ongoing. 17:46 → next = 18:30
    const result = computeNextMass(true, 17 * 60 + 46); // 17:46 Chúa Nhật
    expect(result.time).toBe('18:30');
    expect(result.countdown).toBe('44 phút');
  });
});
