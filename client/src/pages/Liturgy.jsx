// Trang giờ lễ & lời Chúa
import { useEffect, useState } from 'react';
import api from '../services/api';

const MASS_SCHEDULE = [
  { ngay: 'Ngày thường', gio: ['05:30', '18:00'] },
  { ngay: 'Chúa Nhật', gio: ['05:30', '09:00', '17:00', '18:30'] },
];

const Liturgy = () => {
  const [readings, setReadings] = useState(null);

  useEffect(() => {
    api.get('/liturgy/today').then((r) => setReadings(r.data)).catch(() => {});
  }, []);

  return (
    <main>
      <h2>Giờ Lễ</h2>
      {MASS_SCHEDULE.map((s) => (
        <div key={s.ngay}>
          <strong>{s.ngay}:</strong> {s.gio.join(' | ')}
        </div>
      ))}

      <h2>Lời Chúa Hôm Nay</h2>
      {readings ? (
        <div>
          <p><strong>Bài đọc 1:</strong> {readings.baiDoc1}</p>
          <p><strong>Thánh vịnh:</strong> {readings.thanhVinh}</p>
          <p><strong>Bài đọc 2:</strong> {readings.baiDoc2}</p>
          <p><strong>Phúc âm:</strong> {readings.phucAm}</p>
        </div>
      ) : (
        <p>Đang tải...</p>
      )}
    </main>
  );
};

export default Liturgy;
