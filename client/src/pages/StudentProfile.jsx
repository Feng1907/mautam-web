import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueries, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { ChevronLeft, User, BookOpen, CalendarCheck, Cross, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import { SkeletonLine } from '../components/Skeleton';
import { useAuth } from '../store/AuthContext';

const SERIF = '"Playfair Display", "EB Garamond", Georgia, serif';
const SANS  = '"Be Vietnam Pro", "Inter", system-ui, sans-serif';

const NGANH_COLOR = {
  ChienNon: '#ec4899', AuNhi: '#22c55e', ThieuNhi: '#3b82f6',
  NghiaSi:  '#eab308', HiepSi: '#f97316',
};

const AVATAR_COLORS = [
  '#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316',
];
const avatarBg = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="flex flex-col gap-5 animate-pulse">
    <div className="h-8 w-32 rounded-lg bg-gray-100" />
    <div className="rounded-2xl border border-[#e5d5b5] bg-white p-6 flex gap-5">
      <div className="w-20 h-20 rounded-full bg-gray-200 shrink-0" />
      <div className="flex flex-col gap-3 flex-1">
        <SkeletonLine w="w-48" h="h-6" />
        <SkeletonLine w="w-32" h="h-4" />
        <div className="flex gap-2 mt-1">
          <SkeletonLine w="w-20" h="h-6" />
          <SkeletonLine w="w-20" h="h-6" />
        </div>
      </div>
    </div>
    <div className="rounded-2xl border border-[#e5d5b5] bg-white p-5 h-72 bg-gray-50" />
  </div>
);

// ── Grade tooltip ─────────────────────────────────────────────────────────────
const GradeTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ── Attendance tooltip ────────────────────────────────────────────────────────
const AttTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}%</p>
      ))}
    </div>
  );
};

// ── Build grade chart data from lichSu ───────────────────────────────────────
const buildGradeData = (lichSu) => {
  const rows = [];
  for (const nh of lichSu) {
    const label = nh.namHoc?.ten ?? '?';
    const gs = nh.grades ?? [];
    if (!gs.length) continue;
    let sum = 0, cnt = 0;
    gs.forEach(g => { if (g.diem != null) { sum += g.diem; cnt++; } });
    rows.push({ label, tb: cnt ? parseFloat((sum / cnt).toFixed(2)) : null });
  }
  return rows.reverse();
};

// ── Build attendance chart data ───────────────────────────────────────────────
const buildAttData = (lichSu) => {
  const rows = [];
  for (const nh of lichSu) {
    const label = nh.namHoc?.ten ?? '?';
    const cs = nh.chuyenCan ?? [];
    if (!cs.length) continue;
    const present = cs.filter(c => c.trangThai === 'present' || c.diemDanh === true).length;
    const rate = cs.length ? Math.round(present / cs.length * 100) : 0;
    rows.push({ label, rate });
  }
  return rows.reverse();
};

// ── Tab variants ──────────────────────────────────────────────────────────────
const tabV = {
  enter:  { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0,  transition: { duration: 0.2, ease: 'easeOut' } },
  exit:   { opacity: 0, y: -6, transition: { duration: 0.14 } },
};

const TABS = [
  { key: 'info',       label: 'Thông tin',  Icon: User          },
  { key: 'grades',     label: 'Điểm',       Icon: BookOpen      },
  { key: 'attend',     label: 'Chuyên cần', Icon: CalendarCheck  },
  { key: 'milestones', label: 'Cột mốc',    Icon: Cross         },
];

const MILESTONE_CONFIG = {
  ruatoi:   { label: 'Rửa tội',           color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',     dot: '#0ea5e9' },
  ruocle:   { label: 'Rước lễ lần đầu',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: '#f59e0b' },
  themsucc: { label: 'Thêm sức',          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', dot: '#a855f7' },
  giaivai:  { label: 'Giải vạ',           color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: '#22c55e' },
  khac:     { label: 'Khác',              color: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300',   dot: '#9ca3af' },
};

// ── Page ──────────────────────────────────────────────────────────────────────
const StudentProfile = () => {
  const { lopId, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('info');
  const isGiaoly = user && ['admin', 'giaoly'].includes(user.vaiTro);

  const [milestoneForm, setMilestoneForm] = useState({ loai: 'ruocle', ngay: '', ghiChu: '' });
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  const milestonesQ = useQuery({
    queryKey: ['milestones', id],
    queryFn: () => api.get(`/milestones/${id}`).then(r => r.data.data),
    enabled: tab === 'milestones',
  });

  const addMilestone = useMutation({
    mutationFn: (data) => api.post('/milestones', { ...data, studentId: id }),
    onSuccess: () => {
      qc.invalidateQueries(['milestones', id]);
      setShowMilestoneForm(false);
      setMilestoneForm({ loai: 'ruocle', ngay: '', ghiChu: '' });
    },
  });

  const deleteMilestone = useMutation({
    mutationFn: (mid) => api.delete(`/milestones/${mid}`),
    onSuccess: () => qc.invalidateQueries(['milestones', id]),
  });

  const [studentQ, lichSuQ] = useQueries({
    queries: [
      {
        queryKey: ['student', id],
        queryFn:  () => api.get(`/students/${lopId}/${id}`).then(r => r.data.data),
        staleTime: 5 * 60 * 1000,
        retry: 3,
      },
      {
        queryKey: ['student-lichsu', id],
        queryFn:  () => api.get(`/students/${lopId}/${id}/lich-su`).then(r => r.data.data),
        staleTime: 5 * 60 * 1000,
        retry: 3,
      },
    ],
  });

  const student = studentQ.data;
  const lichSu  = lichSuQ.data ?? [];
  const loading = studentQ.isLoading;

  const gradeData = buildGradeData(lichSu);
  const attData   = buildAttData(lichSu);

  const nganh = student?.lop?.nhanh;
  const accentColor = NGANH_COLOR[nganh] ?? '#8B0000';

  if (loading) return <main className="flex-1 page-container max-w-3xl"><Skeleton /></main>;

  if (!student) return (
    <main className="flex-1 page-container max-w-3xl">
      <p className="text-center text-red-600 py-20">Không tìm thấy đoàn sinh.</p>
    </main>
  );

  const birthDate = student.ngaySinh
    ? new Date(student.ngaySinh).toLocaleDateString('vi-VN')
    : '—';

  const tenDay = [student.tenThanh, student.hoTen].filter(Boolean).join(' ');

  return (
    <main className="flex-1 page-container max-w-3xl" style={{ fontFamily: SANS }}>

      {/* Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-[#8B0000] hover:underline mb-5"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại
      </button>

      {/* ── Hero card ── */}
      <div className="rounded-2xl border border-[#e5d5b5] bg-white shadow-sm overflow-hidden mb-4">
        <div className="h-1.5" style={{ background: accentColor }} />
        <div className="px-6 py-5 flex gap-5 items-start flex-wrap">
          {/* Avatar */}
          {student.avatar ? (
            <img src={student.avatar} alt={student.hoTen}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md shrink-0 flex items-center justify-center text-white text-2xl font-black select-none"
              style={{ background: avatarBg(student.hoTen) }}>
              {student.hoTen?.charAt(0)?.toUpperCase()}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#3d1515] leading-tight" style={{ fontFamily: SERIF }}>
              {tenDay}
            </h1>
            {student.lop && (
              <p className="text-sm text-gray-500 mt-1">
                {student.lop.tenLop}
                {nganh && <span className="ml-2 text-xs font-semibold" style={{ color: accentColor }}>{nganh}</span>}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                student.gioiTinh === 'Nam'
                  ? 'bg-sky-50 border-sky-200 text-sky-700'
                  : 'bg-pink-50 border-pink-200 text-pink-700'
              }`}>
                {student.gioiTinh}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-100 bg-gray-50 text-gray-600">
                Sinh {birthDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-[#e5d5b5] mb-4 relative">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === key
                ? 'border-[#8B0000] text-[#8B0000]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} variants={tabV} initial="enter" animate="center" exit="exit">

          {/* ── Thông tin ── */}
          {tab === 'info' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoCard label="Họ tên" value={student.hoTen} />
              <InfoCard label="Tên thánh" value={student.tenThanh || '—'} />
              <InfoCard label="Giới tính" value={student.gioiTinh} />
              <InfoCard label="Ngày sinh" value={birthDate} />
              {student.phuHuynh?.hoTen && (
                <InfoCard label="Phụ huynh" value={student.phuHuynh.hoTen} />
              )}
              {student.phuHuynh?.soDienThoai && (
                <InfoCard label="SĐT phụ huynh" value={student.phuHuynh.soDienThoai} />
              )}
              {student.phuHuynh?.email && (
                <InfoCard label="Email phụ huynh" value={student.phuHuynh.email} />
              )}
              {student.lop && (
                <InfoCard label="Lớp" value={student.lop.tenLop} />
              )}
            </div>
          )}

          {/* ── Điểm ── */}
          {tab === 'grades' && (
            lichSuQ.isLoading ? (
              <div className="h-72 rounded-2xl bg-gray-100 animate-pulse" />
            ) : gradeData.length === 0 ? (
              <EmptyState text="Chưa có dữ liệu điểm" />
            ) : (
              <div className="rounded-2xl border border-[#e5d5b5] bg-white p-5">
                <p className="text-sm font-semibold text-[#3d1515] mb-4" style={{ fontFamily: SERIF }}>
                  Điểm trung bình theo năm học
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={gradeData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1e7d5" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <Tooltip content={<GradeTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="tb" name="Điểm TB"
                        stroke="#8B0000" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Per-year detail */}
                <div className="mt-5 flex flex-col gap-2">
                  {lichSu.map(nh => {
                    const gs = nh.grades ?? [];
                    if (!gs.length) return null;
                    const avg = gs.reduce((s, g) => s + (g.diem ?? 0), 0) / gs.length;
                    return (
                      <div key={nh.namHoc._id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-700">{nh.namHoc.ten}</p>
                        <span className="text-sm font-bold" style={{ color: '#8B0000' }}>
                          {avg.toFixed(1)} / 10
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* ── Chuyên cần ── */}
          {tab === 'attend' && (
            lichSuQ.isLoading ? (
              <div className="h-72 rounded-2xl bg-gray-100 animate-pulse" />
            ) : attData.length === 0 ? (
              <EmptyState text="Chưa có dữ liệu chuyên cần" />
            ) : (
              <div className="rounded-2xl border border-[#e5d5b5] bg-white p-5">
                <p className="text-sm font-semibold text-[#3d1515] mb-4" style={{ fontFamily: SERIF }}>
                  Tỉ lệ chuyên cần theo năm học (%)
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1e7d5" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#9ca3af"
                        tickFormatter={v => `${v}%`} />
                      <Tooltip content={<AttTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="rate" name="Có mặt" fill="#8B0000" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-5 flex flex-col gap-2">
                  {lichSu.map(nh => {
                    const cs = nh.chuyenCan ?? [];
                    if (!cs.length) return null;
                    const present = cs.filter(c => c.trangThai === 'present' || c.diemDanh === true).length;
                    const rate = cs.length ? Math.round(present / cs.length * 100) : 0;
                    return (
                      <div key={nh.namHoc._id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-700">{nh.namHoc.ten}</p>
                        <span className={`text-sm font-bold ${rate >= 75 ? 'text-emerald-700' : rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {present}/{cs.length} ({rate}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* ── Cột mốc ── */}
          {tab === 'milestones' && (
            <div className="space-y-4">
              {isGiaoly && (
                <div className="flex justify-end">
                  <button onClick={() => setShowMilestoneForm(s => !s)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-[#8B0000] hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 rounded-lg transition">
                    <Plus size={15} /> Thêm cột mốc
                  </button>
                </div>
              )}

              {showMilestoneForm && isGiaoly && (
                <div className="rounded-xl border-2 border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Loại cột mốc</label>
                      <select className="input" value={milestoneForm.loai}
                        onChange={e => setMilestoneForm(f => ({ ...f, loai: e.target.value }))}>
                        {Object.entries(MILESTONE_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Ngày <span className="text-red-500">*</span></label>
                      <input type="date" className="input" value={milestoneForm.ngay}
                        onChange={e => setMilestoneForm(f => ({ ...f, ngay: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Ghi chú</label>
                      <input className="input" placeholder="VD: Nhà thờ Giáo xứ Mẫu Tâm" maxLength={300}
                        value={milestoneForm.ghiChu}
                        onChange={e => setMilestoneForm(f => ({ ...f, ghiChu: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button disabled={!milestoneForm.ngay || addMilestone.isPending}
                      onClick={() => addMilestone.mutate(milestoneForm)}
                      className="flex items-center gap-1.5 btn-primary text-sm px-4 py-1.5 rounded-lg disabled:opacity-50">
                      {addMilestone.isPending ? '...' : 'Lưu'}
                    </button>
                    <button onClick={() => setShowMilestoneForm(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                      Hủy
                    </button>
                  </div>
                  {addMilestone.isError && (
                    <p className="text-xs text-red-500">{addMilestone.error?.response?.data?.message || 'Lỗi thêm cột mốc'}</p>
                  )}
                </div>
              )}

              {milestonesQ.isLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />)}
                </div>
              ) : !milestonesQ.data?.length ? (
                <EmptyState text="Chưa có cột mốc thiêng liêng nào được ghi nhận" />
              ) : (
                <div className="relative pl-6">
                  {/* vertical line */}
                  <div className="absolute left-2.5 top-3 bottom-3 w-px bg-[#e5d5b5] dark:bg-slate-700" />
                  <div className="space-y-4">
                    {milestonesQ.data.map(m => {
                      const cfg = MILESTONE_CONFIG[m.loai] || MILESTONE_CONFIG.khac;
                      return (
                        <div key={m._id} className="relative flex items-start gap-3">
                          <div className="absolute -left-6 mt-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 shrink-0"
                            style={{ background: cfg.dot }} />
                          <div className="flex-1 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                                  {new Date(m.ngay).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  {m.ghiBoi?.hoTen && ` · ghi bởi ${m.ghiBoi.hoTen}`}
                                </p>
                                {m.ghiChu && <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">{m.ghiChu}</p>}
                              </div>
                              {isGiaoly && (
                                <button onClick={() => deleteMilestone.mutate(m._id)}
                                  className="p-1 text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition shrink-0">
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </main>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const InfoCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value}</p>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-[#e5d5b5] bg-[#fffcf9]">
    <div className="text-3xl text-[#D4AF37] mb-3">✦</div>
    <p className="text-sm text-gray-500">{text}</p>
  </div>
);

export default StudentProfile;
