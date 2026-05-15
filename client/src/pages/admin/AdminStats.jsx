import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, BarChart3, LineChart as LineChartIcon, UsersRound } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const SERIF = '"Playfair Display", "EB Garamond", Georgia, serif';
const SANS = '"Be Vietnam Pro", "Inter", system-ui, sans-serif';

const BRANCH_CFG = {
  ChienNon: { label: 'Chiên Non', color: '#ec4899' },
  AuNhi: { label: 'Ấu Nhi', color: '#22c55e' },
  ThieuNhi: { label: 'Thiếu Nhi', color: '#3b82f6' },
  NghiaSi: { label: 'Nghĩa Sĩ', color: '#eab308' },
  HiepSi: { label: 'Hiệp Sĩ', color: '#f97316' },
};

const BRANCH_KEYS = Object.keys(BRANCH_CFG);

const ChartPanel = ({ icon: Icon, title, subtitle, children }) => (
  <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: '#e5d5b5' }}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 text-[#3d1515]">
          <Icon className="h-5 w-5" />
          <h3 className="font-bold" style={{ fontFamily: SERIF }}>{title}</h3>
        </div>
        {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

const EmptyChart = ({ text }) => (
  <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
    {text}
  </div>
);

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-bold text-gray-800">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {BRANCH_CFG[item.dataKey]?.label || item.name}: {item.value}%
        </p>
      ))}
    </div>
  );
};

const ComparisonTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-bold text-gray-800">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {item.value} đoàn sinh
        </p>
      ))}
    </div>
  );
};

const AttentionStudents = ({ students }) => (
  <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: '#fecaca' }}>
    <div className="mb-4 flex items-center gap-2 text-red-700">
      <AlertTriangle className="h-5 w-5" />
      <h3 className="font-bold" style={{ fontFamily: SERIF }}>Đoàn sinh cần quan tâm</h3>
    </div>

    {!students.length ? (
      <p className="rounded-xl bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-700">
        Chưa phát hiện tỉ lệ vắng tăng đột ngột trong 3 tuần gần nhất.
      </p>
    ) : (
      <div className="overflow-hidden rounded-xl border border-red-100">
        <table className="w-full text-sm">
          <thead className="bg-red-50 text-left text-xs uppercase tracking-wide text-red-700">
            <tr>
              <th className="px-4 py-3">Đoàn sinh</th>
              <th className="px-4 py-3">Lớp</th>
              <th className="px-4 py-3 text-center">Vắng gần đây</th>
              <th className="px-4 py-3 text-right">Mức cảnh báo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-50">
            {students.map((student) => (
              <tr key={student.studentId} className="bg-white">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">
                    {student.tenThanh ? `${student.tenThanh} ` : ''}{student.hoTen}
                  </p>
                  <p className="text-xs text-gray-400">{student.reason}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{student.lop || '-'}</td>
                <td className="px-4 py-3 text-center font-bold text-red-700">
                  {student.recentAbsent}/3 tuần
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                    {student.recentAbsenceRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

const AdminStats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [trendMode, setTrendMode] = useState('week');

  useEffect(() => {
    let cancelled = false;

    const loadTrends = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/admin/stats/trends');
        if (!cancelled) setData(res.data.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Không tải được dữ liệu xu hướng.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTrends();
    return () => { cancelled = true; };
  }, []);

  const trendData = trendMode === 'month'
    ? data?.monthlyAttendanceByBranch || []
    : data?.weeklyAttendanceByBranch || [];

  const comparisonData = useMemo(
    () => (data?.enrollmentComparison || []).map((item) => ({
      ...item,
      label: item.label || BRANCH_CFG[item.nhanh]?.label || item.nhanh,
    })),
    [data]
  );

  const hasTrendData = trendData.some((row) => BRANCH_KEYS.some((key) => Number(row[key]) > 0));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-5" style={{ fontFamily: SANS }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#3d1515]" style={{ fontFamily: SERIF }}>
            Dashboard Thống kê
          </h2>
          <p className="text-xs text-gray-400">
            {data?.namHoc ? `Năm học ${data.namHoc.ten}` : 'Chưa có năm học đang hoạt động'}
          </p>
        </div>

        <div className="flex rounded-full border border-[#e5d5b5] bg-white p-1">
          {[
            { key: 'week', label: 'Tuần' },
            { key: 'month', label: 'Tháng' },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setTrendMode(option.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                trendMode === option.key ? 'bg-[#8B0000] text-white' : 'text-gray-500 hover:text-[#8B0000]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!data?.namHoc ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa có năm học đang hoạt động.
        </p>
      ) : (
        <>
          <ChartPanel
            icon={LineChartIcon}
            title="Xu hướng chuyên cần theo ngành"
            subtitle="Tỉ lệ có mặt được tổng hợp theo tuần hoặc tháng từ dữ liệu điểm danh."
          >
            {hasTrendData ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1e7d5" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<TrendTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {BRANCH_KEYS.map((key) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={BRANCH_CFG[key].label}
                        stroke={BRANCH_CFG[key].color}
                        strokeWidth={2.5}
                        dot={{ r: 2.5 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart text="Chưa có dữ liệu điểm danh để vẽ xu hướng." />
            )}
          </ChartPanel>

          <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <ChartPanel
              icon={BarChart3}
              title="So sánh sĩ số theo năm học"
              subtitle={`Hiện tại: ${data.namHoc?.ten || '-'} · Năm trước: ${data.previousNamHoc?.ten || 'chưa có'}`}
            >
              {comparisonData.length ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1e7d5" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <Tooltip content={<ComparisonTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="previous" name="Năm trước" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="current" name="Năm hiện tại" fill="#8B0000" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart text="Chưa có dữ liệu sĩ số để so sánh." />
              )}
            </ChartPanel>

            <ChartPanel
              icon={UsersRound}
              title="Tổng quan sĩ số"
              subtitle="Chênh lệch theo ngành so với năm học trước."
            >
              <div className="flex flex-col gap-2">
                {comparisonData.map((item) => {
                  const delta = item.current - item.previous;
                  return (
                    <div key={item.nhanh} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <div>
                        <p className="font-bold text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-400">
                          {item.previous} → {item.current} đoàn sinh
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        delta >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {delta >= 0 ? '+' : ''}{delta}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ChartPanel>
          </div>

          <AttentionStudents students={data.attentionStudents || []} />
        </>
      )}
    </div>
  );
};

export default AdminStats;
