import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarCheck, CheckCircle2, GraduationCap, Loader2, UserRound, XCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';

const scoreTypeLabel = {
  mieng: 'Mieng',
  '15phut': '15 phut',
  '1tiet': '1 tiet',
};

const AttendanceChart = ({ summary }) => {
  const present = summary?.present || 0;
  const absent = summary?.absent || 0;
  const total = summary?.total || 0;
  const percentage = summary?.percentage || 0;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dash = total ? (percentage / 100) * circumference : 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="relative w-36 h-36 shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#fee2e2" strokeWidth="14" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#16a34a"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-gray-900">{percentage}%</span>
          <span className="text-xs font-semibold text-gray-400">chuyen can</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full">
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500">Tong buoi</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{present}</p>
          <p className="text-xs text-emerald-700">Co mat</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-center">
          <p className="text-2xl font-bold text-red-700">{absent}</p>
          <p className="text-xs text-red-700">Vang</p>
        </div>
      </div>
    </div>
  );
};

const LatestGrades = ({ grades }) => {
  const latest = useMemo(
    () => [...grades].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    [grades]
  );

  if (!latest.length) {
    return <p className="text-sm text-gray-400 py-8 text-center">Chua co diem nao duoc cap nhat.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="text-left px-4 py-3">Loai diem</th>
            <th className="text-center px-4 py-3">HK</th>
            <th className="text-center px-4 py-3">Diem</th>
            <th className="text-right px-4 py-3">Cap nhat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {latest.map((grade) => (
            <tr key={grade._id}>
              <td className="px-4 py-3 font-medium text-gray-800">{scoreTypeLabel[grade.loaiDiem] || grade.loaiDiem}</td>
              <td className="px-4 py-3 text-center text-gray-500">{grade.hocKy}</td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex min-w-10 justify-center rounded-full bg-amber-50 px-2 py-1 font-bold text-amber-700">
                  {Number(grade.diem).toFixed(1)}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-gray-400">
                {grade.createdAt ? new Date(grade.createdAt).toLocaleDateString('vi-VN') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const RecentPosts = ({ posts }) => {
  if (!posts.length) {
    return <p className="text-sm text-gray-400 py-8 text-center">Chua co thong bao moi.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <a
          key={post._id}
          href={`/tin-tuc/${post._id}`}
          className="block rounded-lg border border-gray-200 bg-white px-4 py-3 transition hover:border-amber-300 hover:bg-amber-50/40"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 line-clamp-1">{post.tieuDe}</p>
              {post.tomTat && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{post.tomTat}</p>}
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              post.loai === 'thongbaokhan' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {post.loai === 'thongbaokhan' ? 'Khan' : 'Moi'}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
};

const ParentDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [attendance, setAttendance] = useState(null);
  const [grades, setGrades] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadInitial = async () => {
      setLoading(true);
      setError('');
      try {
        const [studentRes, postRes] = await Promise.all([
          api.get('/parent/students'),
          api.get('/posts', { params: { limit: 5 } }),
        ]);
        if (cancelled) return;
        const list = studentRes.data.data || [];
        setStudents(list);
        setSelectedId(list[0]?._id || '');
        setPosts(postRes.data.data || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Khong tai duoc dashboard phu huynh');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadInitial();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    const loadStudentData = async () => {
      setDetailLoading(true);
      setError('');
      try {
        const [gradeRes, attendanceRes] = await Promise.all([
          api.get(`/parent/students/${selectedId}/grades`),
          api.get(`/parent/students/${selectedId}/attendance`),
        ]);
        if (cancelled) return;
        setGrades(gradeRes.data.data?.grades || []);
        setAttendance(attendanceRes.data.data || null);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Khong tai duoc du lieu cua doan sinh');
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };
    loadStudentData();
    return () => { cancelled = true; };
  }, [selectedId]);

  const selectedStudent = students.find((student) => student._id === selectedId);

  if (loading) {
    return (
      <main className="page-container max-w-6xl py-10">
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Dang tai dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="page-container max-w-6xl py-8">
      <Helmet>
        <title>Dashboard Phu Huynh | Mau Tam</title>
      </Helmet>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Phu huynh</p>
          <h1 className="mt-1 text-3xl font-black text-gray-900">Dashboard theo doi con em</h1>
        </div>

        {students.length > 0 && (
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
            Chon doan sinh
            <select className="input min-w-60" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.tenThanh} {student.hoTen}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {!students.length ? (
        <section className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <UserRound className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h2 className="text-lg font-bold text-gray-800">Chua co doan sinh lien ket</h2>
          <p className="mt-1 text-sm text-gray-500">Vui long lien he Ban quan tri de lien ket tai khoan phu huynh voi ho so con em.</p>
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <CalendarCheck className="h-5 w-5" />
                  <h2 className="text-lg font-bold text-gray-900">Bieu do chuyen can</h2>
                </div>
                {selectedStudent && (
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedStudent.tenThanh} {selectedStudent.hoTen}
                    {selectedStudent.lop?.tenLop ? ` - ${selectedStudent.lop.tenLop}` : ''}
                  </p>
                )}
              </div>
              {detailLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            </div>
            <AttendanceChart summary={attendance?.summary} />
            <div className="mt-5 grid gap-2 md:grid-cols-2">
              {(attendance?.records || []).slice(-4).reverse().map((record) => (
                <div key={record._id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                  <span className="font-medium text-gray-700">{new Date(record.date + 'T00:00:00').toLocaleDateString('vi-VN')}</span>
                  <span className={`inline-flex items-center gap-1 font-semibold ${record.present ? 'text-emerald-700' : 'text-red-700'}`}>
                    {record.present ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {record.present ? 'Co mat' : 'Vang'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-700" />
              <h2 className="text-lg font-bold text-gray-900">Thong bao moi</h2>
            </div>
            <RecentPosts posts={posts} />
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-3">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-bold text-gray-900">Bang diem gan nhat</h2>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Cap nhat tu giao ly vien</span>
            </div>
            <LatestGrades grades={grades} />
          </section>
        </div>
      )}
    </main>
  );
};

export default ParentDashboard;
