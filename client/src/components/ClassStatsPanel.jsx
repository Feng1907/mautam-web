import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, Users, AlertTriangle, BookOpen } from 'lucide-react';
import api from '../services/api';

const LOAI_DIEM_LABEL = { mieng: 'Miệng', '15phut': '15 phút', '1tiet': '1 tiết' };
const BAND_COLORS = { '8-10': '#15803d', '6-7': '#2563eb', '4-5': '#d97706', '0-3': '#dc2626' };

function PercentBar({ value, color = '#8B0000', label }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0 text-gray-500">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="w-10 text-right font-semibold" style={{ color }}>{value}%</span>
    </div>
  );
}

function StatCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-[#e5d5b5] bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-[#8B0000]" />
        <h3 className="text-sm font-bold text-[#3d1515]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function ClassStatsPanel({ lopId }) {
  const [hkGrade, setHkGrade] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['class-stats', lopId],
    queryFn: () => api.get(`/classes/${lopId}/stats`).then(r => r.data.data),
    staleTime: 2 * 60_000,
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />)}
    </div>
  );

  if (!data) return null;

  const { soHocSinh, soNam, soNu, totalSessions, attendanceRate, lowAttendance, gradeList, chuyenCan } = data;

  const attColor = attendanceRate >= 80 ? '#15803d' : attendanceRate >= 60 ? '#d97706' : '#dc2626';

  const gradesByKey = {};
  gradeList.forEach(g => { gradesByKey[`${g.loaiDiem}_hk${g.hocKy}`] = g; });

  const BANDS = ['8-10', '6-7', '4-5', '0-3'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Card 1 — Tổng quan */}
      <StatCard icon={Users} title="Tổng quan">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-2xl font-bold text-[#8B0000]">{soHocSinh}</p>
            <p className="text-xs text-gray-500 mt-0.5">Đoàn sinh</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-sm font-semibold text-[#3d1515]">{soNam}♂ / {soNu}♀</p>
            <p className="text-xs text-gray-500 mt-0.5">Nam / Nữ</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: attColor }}>{attendanceRate}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Chuyên cần</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-2xl font-bold text-[#3d1515]">{totalSessions}</p>
            <p className="text-xs text-gray-500 mt-0.5">Buổi sinh hoạt</p>
          </div>
        </div>
        {(chuyenCan.hk1Avg !== null || chuyenCan.hk2Avg !== null) && (
          <div className="mt-3 flex gap-2">
            {chuyenCan.hk1Avg !== null && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                Chuyên cần HK1: {chuyenCan.hk1Avg}
              </span>
            )}
            {chuyenCan.hk2Avg !== null && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-semibold">
                Chuyên cần HK2: {chuyenCan.hk2Avg}
              </span>
            )}
          </div>
        )}
      </StatCard>

      {/* Card 2 — Phân bố điểm */}
      <StatCard icon={BookOpen} title="Phân bố điểm">
        <div className="flex gap-2 mb-3">
          {[1, 2].map(hk => (
            <button key={hk}
              onClick={() => setHkGrade(hk)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${
                hkGrade === hk ? 'bg-[#8B0000] text-white border-[#8B0000]' : 'text-gray-600 border-gray-200 hover:border-[#8B0000]'
              }`}
            >
              HK{hk}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {Object.entries(LOAI_DIEM_LABEL).map(([key, label]) => {
            const g = gradesByKey[`${key}_hk${hkGrade}`];
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#3d1515]">{label}</span>
                  {g ? (
                    <span className="text-xs text-gray-500">TB: <strong className="text-[#8B0000]">{g.avg}</strong> ({g.count} điểm)</span>
                  ) : (
                    <span className="text-xs text-gray-300">Chưa có dữ liệu</span>
                  )}
                </div>
                {g && (
                  <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-gray-100">
                    {BANDS.map(band => {
                      const pct = g.count > 0 ? Math.round((g.dist[band] / g.count) * 100) : 0;
                      return pct > 0 ? (
                        <div key={band} style={{ width: `${pct}%`, background: BAND_COLORS[band] }}
                          title={`${band}: ${g.dist[band]} (${pct}%)`}
                        />
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-3 flex-wrap">
          {BANDS.map(b => (
            <span key={b} className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: BAND_COLORS[b] }} />
              {b}
            </span>
          ))}
        </div>
      </StatCard>

      {/* Card 3 — Chuyên cần */}
      <StatCard icon={BarChart2} title="Chuyên cần theo đoàn sinh">
        {lowAttendance.length === 0 ? (
          <p className="text-sm text-green-700 text-center py-4">
            🎉 Tất cả đoàn sinh đều đạt tỷ lệ ≥ 70%
          </p>
        ) : (
          <div className="space-y-2">
            {lowAttendance.slice(0, 8).map(s => (
              <PercentBar
                key={s._id}
                label={s.tenThanh ? `${s.tenThanh} ${s.hoTen.split(' ').pop()}` : s.hoTen.split(' ').pop()}
                value={s.rate}
                color={s.rate >= 60 ? '#d97706' : '#dc2626'}
              />
            ))}
            {lowAttendance.length > 8 && (
              <p className="text-xs text-gray-400 text-center pt-1">... và {lowAttendance.length - 8} em khác</p>
            )}
          </div>
        )}
      </StatCard>

      {/* Card 4 — Cần chú ý */}
      <StatCard icon={AlertTriangle} title="Học sinh cần chú ý (< 70% chuyên cần)">
        {lowAttendance.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Không có</p>
        ) : (
          <div className="space-y-1.5">
            {lowAttendance.map(s => (
              <div key={s._id} className="flex items-center justify-between text-sm">
                <span className="text-[#3d1515]">
                  {s.tenThanh ? `${s.tenThanh} ` : ''}{s.hoTen}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  s.rate < 50 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {s.rate}%
                </span>
              </div>
            ))}
          </div>
        )}
      </StatCard>
    </div>
  );
}
