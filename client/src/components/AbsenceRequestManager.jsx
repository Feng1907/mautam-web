import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import { useToast } from './Toast';

const STATUS_CFG = {
  pending:  { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700 border-amber-200'  },
  approved: { label: 'Đã duyệt',  cls: 'bg-green-50 text-green-700 border-green-200'  },
  rejected: { label: 'Từ chối',   cls: 'bg-red-50   text-red-700   border-red-200'    },
};

function RequestCard({ req, canEdit, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CFG[req.status] ?? STATUS_CFG.pending;

  return (
    <div className="rounded-xl border border-[#e5d5b5] bg-white p-4 space-y-2">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-semibold text-[#3d1515]">
            {req.student?.tenThanh ? `${req.student.tenThanh} ` : ''}{req.student?.hoTen ?? '—'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Phụ huynh: {req.parent?.hoTen ?? '—'} · Ngày: <strong>{req.date}</strong>
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${cfg.cls}`}>
          {cfg.label}
        </span>
      </div>

      <div>
        <p className={`text-sm text-gray-700 ${expanded ? '' : 'line-clamp-2'}`}>{req.reason}</p>
        {req.reason?.length > 100 && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs text-[#8B0000] mt-0.5 flex items-center gap-0.5"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" />Thu gọn</> : <><ChevronDown className="w-3 h-3" />Xem thêm</>}
          </button>
        )}
      </div>

      {canEdit && req.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onAction(req._id, 'approved')}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Duyệt
          </button>
          <button
            onClick={() => onAction(req._id, 'rejected')}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            <XCircle className="w-3.5 h-3.5" /> Từ chối
          </button>
        </div>
      )}
    </div>
  );
}

export default function AbsenceRequestManager({ lopId, canEdit }) {
  const [statusFilter, setStatusFilter] = useState('pending');
  const toast = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['absenceRequests', lopId, statusFilter],
    queryFn: () => api.get('/absence-requests', { params: { lopId, status: statusFilter } }).then(r => r.data.data),
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/absence-requests/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['absenceRequests', lopId] });
      toast('Đã cập nhật trạng thái đơn.', 'success');
    },
    onError: () => toast('Cập nhật thất bại. Vui lòng thử lại.', 'error'),
  });

  const handleAction = (id, status) => mutation.mutate({ id, status });

  const filters = [
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'all',     label: 'Tất cả'    },
  ];

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex gap-2">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition ${
              statusFilter === f.key
                ? 'bg-[#8B0000] text-white border-[#8B0000]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#8B0000] hover:text-[#8B0000]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
          <Clock className="w-10 h-10 opacity-40" />
          <p className="text-sm">Không có đơn nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map(req => (
            <RequestCard
              key={req._id}
              req={req}
              canEdit={canEdit}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
