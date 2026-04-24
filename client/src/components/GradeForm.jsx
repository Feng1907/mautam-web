import { useState } from 'react';

// loaiDiem: 'mieng' | '15phut' | '1tiet'
const GradeForm = ({ studentId, lopId, onSave }) => {
  const [form, setForm] = useState({ loaiDiem: 'mieng', diem: '', ghiChu: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ studentId, lopId, ...form, diem: Number(form.diem) });
    setForm({ loaiDiem: 'mieng', diem: '', ghiChu: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={form.loaiDiem}
        onChange={(e) => setForm({ ...form, loaiDiem: e.target.value })}
      >
        <option value="mieng">Miệng</option>
        <option value="15phut">15 phút</option>
        <option value="1tiet">1 tiết</option>
      </select>
      <input
        type="number"
        min={0}
        max={10}
        step={0.5}
        placeholder="Điểm (0-10)"
        value={form.diem}
        onChange={(e) => setForm({ ...form, diem: e.target.value })}
        required
      />
      <input
        placeholder="Ghi chú (tuỳ chọn)"
        value={form.ghiChu}
        onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
      />
      <button type="submit">Lưu điểm</button>
    </form>
  );
};

export default GradeForm;
