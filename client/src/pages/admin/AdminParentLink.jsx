import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Link2, Link2Off, Loader2, Plus, Search, Trash2, UserRound, X, XCircle } from 'lucide-react';
import api from '../../services/api';
import { formatClassName } from '../../utils/formatClassName';

const QUAN_HE_OPTIONS = ['Cha/Mẹ', 'Cha', 'Mẹ', 'Ông/Bà', 'Anh/Chị', 'Người giám hộ'];

const inputCls = 'w-full rounded border border-gray-300 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100';

const StatusBadge = ({ trangThai }) =>
  trangThai === 'active'
    ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200"><Link2 className="h-3 w-3" />Đang liên kết</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500 border border-gray-200"><Link2Off className="h-3 w-3" />Vô hiệu</span>;

// Autocomplete input dùng chung cho user và student
const AutocompleteInput = ({ placeholder, apiPath, extraParams = {}, displayFn, onSelect, value, onClear }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounce = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Khi extraParams thay đổi (ví dụ chọn lớp), reset kết quả cũ
  useEffect(() => {
    setResults([]);
    setOpen(false);
  }, [JSON.stringify(extraParams)]);

  const doSearch = useCallback((q) => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(apiPath, { params: { q, ...extraParams } });
        setResults(res.data.data || []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
  }, [apiPath, JSON.stringify(extraParams)]);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    if (value) onClear();
    if (!q.trim() && !Object.values(extraParams).some(Boolean)) { setResults([]); setOpen(false); return; }
    doSearch(q);
  };

  const handleSelect = (item) => {
    setQuery(displayFn(item));
    setResults([]);
    setOpen(false);
    onSelect(item);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    onClear();
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          className={`${inputCls} pl-9 pr-8`}
          placeholder={placeholder}
          value={value ? displayFn(value) : query}
          onChange={handleChange}
          readOnly={!!value}
        />
        {(value || query) && (
          <button type="button" onClick={handleClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          {searching && <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400"><Loader2 className="h-3.5 w-3.5 animate-spin" />Đang tìm...</div>}
          {!searching && results.length === 0 && <p className="px-4 py-3 text-sm text-gray-400">Không tìm thấy kết quả.</p>}
          {results.map((item) => (
            <button
              key={item._id}
              type="button"
              onMouseDown={() => handleSelect(item)}
              className="w-full border-b border-gray-50 px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 last:border-0"
            >
              <span className="font-medium text-gray-900">{displayFn(item)}</span>
              {item.email && <span className="ml-2 text-xs text-gray-400">{item.email}</span>}
              {item.lop?.tenLop && <span className="ml-2 text-xs text-gray-400">— {item.lop.tenLop}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateModal = ({ onClose, onCreated }) => {
  const [parent, setParent]     = useState(null);
  const [student, setStudent]   = useState(null);
  const [selectedLop, setSelectedLop] = useState('');
  const [lopList, setLopList]   = useState([]);
  const [quanHe, setQuanHe]     = useState('Cha/Mẹ');
  const [ghiChu, setGhiChu]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get('/classes').then((r) => setLopList(r.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parent || !student) return setError('Vui lòng chọn đủ phụ huynh và đoàn sinh.');
    setSaving(true);
    setError('');
    try {
      await api.post('/admin/parent-links', { parentId: parent._id, studentId: student._id, quanHe, ghiChu });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo liên kết thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-red-700" />
            <h2 className="font-bold text-gray-900">Thêm liên kết phụ huynh — đoàn sinh</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Tài khoản phụ huynh</label>
            <AutocompleteInput
              placeholder="Tìm tên hoặc email phụ huynh..."
              apiPath="/admin/parent-links/search-users"
              displayFn={(u) => u.hoTen}
              value={parent}
              onSelect={setParent}
              onClear={() => setParent(null)}
            />
            {parent && <p className="text-xs text-gray-400 pl-1">{parent.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Lọc theo lớp</label>
            <select
              className={`${inputCls} px-3`}
              value={selectedLop}
              onChange={(e) => { setSelectedLop(e.target.value); setStudent(null); }}
            >
              <option value="">— Tất cả lớp —</option>
              {lopList.map((l) => (
                <option key={l._id} value={l._id}>{formatClassName(l.tenLop)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Đoàn sinh</label>
            <AutocompleteInput
              placeholder={selectedLop ? 'Tìm tên trong lớp đã chọn...' : 'Chọn lớp hoặc gõ tên để tìm...'}
              apiPath="/admin/parent-links/search-students"
              extraParams={selectedLop ? { lopId: selectedLop } : {}}
              displayFn={(s) => `${s.tenThanh} ${s.hoTen}`}
              value={student}
              onSelect={setStudent}
              onClear={() => setStudent(null)}
            />
            {student?.lop?.tenLop && <p className="text-xs text-gray-400 pl-1">Lớp: {student.lop.tenLop}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Quan hệ</label>
            <select className="input" value={quanHe} onChange={(e) => setQuanHe(e.target.value)}>
              {QUAN_HE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Ghi chú (tuỳ chọn)</label>
            <input className="input" placeholder="Ghi chú thêm..." value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} maxLength={200} />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-700 py-2.5 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-50 transition"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Tạo liên kết
            </button>
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Huỷ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TABS = [
  { key: 'active',  label: 'Đang liên kết' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'inactive,rejected', label: 'Vô hiệu / Từ chối' },
];

const RejectModal = ({ link, onClose, onDone }) => {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/admin/parent-links/${link._id}`, { trangThai: 'rejected', rejectedReason: reason });
      onDone();
      onClose();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="font-bold text-gray-900 text-sm">Từ chối yêu cầu liên kết</h3>
          <button type="button" onClick={onClose}><X className="h-4 w-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-5">
          <p className="text-sm text-gray-600">
            Từ chối yêu cầu của <strong>{link.parent?.hoTen}</strong> liên kết với <strong>{link.student?.tenThanh} {link.student?.hoTen}</strong>?
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Lý do (tuỳ chọn)</label>
            <textarea className="input resize-none" rows={3} value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Nhập lý do từ chối để thông báo cho phụ huynh..." maxLength={200} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-700 py-2.5 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-50 transition">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Từ chối
            </button>
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Huỷ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminParentLink = () => {
  const [activeTab, setActiveTab]   = useState('active');
  const [links, setLinks]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [toggling, setToggling]     = useState(null);
  const [approving, setApproving]   = useState(null);
  const [syncing, setSyncing]       = useState(false);
  const [syncMsg, setSyncMsg]       = useState('');

  const handleSyncRoles = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await api.post('/admin/parent-links/sync-roles');
      setSyncMsg(res.data.message);
    } catch (err) {
      setSyncMsg(err.response?.data?.message || 'Đồng bộ thất bại.');
    } finally {
      setSyncing(false);
    }
  };

  // Lấy số lượng pending để hiện badge
  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await api.get('/admin/parent-links', { params: { status: 'pending', limit: 1 } });
      setPendingCount(res.data.total || 0);
    } catch { /* ignore */ }
  }, []);

  const LIMIT = 20;

  const fetchLinks = useCallback(async (q = search, p = page, tab = activeTab) => {
    setLoading(true);
    try {
      const status = tab === 'inactive,rejected' ? undefined : tab;
      const res = await api.get('/admin/parent-links', { params: { search: q, page: p, limit: LIMIT, status } });
      // filter locally for combined tab
      const data = tab === 'inactive,rejected'
        ? (res.data.data || []).filter(l => l.trangThai === 'inactive' || l.trangThai === 'rejected')
        : (res.data.data || []);
      setLinks(data);
      setTotal(res.data.total || 0);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [search, page, activeTab]);

  useEffect(() => { fetchLinks(); fetchPendingCount(); }, [fetchLinks, fetchPendingCount]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
    setSearch('');
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleApprove = async (link) => {
    setApproving(link._id);
    try {
      await api.patch(`/admin/parent-links/${link._id}`, { trangThai: 'active' });
      setLinks(prev => prev.filter(l => l._id !== link._id));
      setTotal(t => t - 1);
      setPendingCount(c => Math.max(0, c - 1));
    } catch { /* ignore */ }
    finally { setApproving(null); }
  };

  const handleToggle = async (link) => {
    setToggling(link._id);
    try {
      const next = link.trangThai === 'active' ? 'inactive' : 'active';
      await api.patch(`/admin/parent-links/${link._id}`, { trangThai: next });
      setLinks((prev) => prev.map((l) => l._id === link._id ? { ...l, trangThai: next } : l));
    } catch { /* ignore */ }
    finally { setToggling(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá liên kết này? Thao tác không thể hoàn tác.')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/parent-links/${id}`);
      setLinks((prev) => prev.filter((l) => l._id !== id));
      setTotal((t) => t - 1);
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Liên kết Phụ Huynh — Đoàn Sinh</h1>
          <p className="mt-0.5 text-sm text-gray-500">Quản lý tài khoản phụ huynh với hồ sơ đoàn sinh</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-800 transition"
          >
            <Plus className="h-4 w-4" />
            Thêm liên kết
          </button>
          <button
            type="button"
            onClick={handleSyncRoles}
            disabled={syncing}
            title="Cập nhật vai trò PARENT cho tất cả tài khoản đã được liên kết"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            Đồng bộ vai trò
          </button>
          {syncMsg && <p className="text-sm text-emerald-700 font-medium">{syncMsg}</p>}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const isPending = tab.key === 'pending';
          return (
            <button key={tab.key} type="button" onClick={() => handleTabChange(tab.key)}
              className={`relative flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                isActive ? 'bg-red-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}>
              {tab.label}
              {isPending && pendingCount > 0 && (
                <span className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  isActive ? 'bg-white/25 text-white' : 'bg-red-600 text-white'
                }`}>{pendingCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Thanh tìm kiếm + thống kê */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <input
            className={`${inputCls} pl-9`}
            placeholder="Tìm tên, email phụ huynh hoặc đoàn sinh..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <p className="text-sm text-gray-500 shrink-0">
          Tổng: <strong className="text-gray-800">{total}</strong> liên kết
        </p>
      </div>

      {/* Bảng danh sách */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Đang tải...
          </div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
            <UserRound className="h-8 w-8" />
            <p className="text-sm">{search ? 'Không tìm thấy kết quả.' : 'Chưa có liên kết nào.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-light">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">Phụ huynh</th>
                  <th className="px-4 py-3 text-left">Đoàn sinh</th>
                  <th className="px-4 py-3 text-left">Lớp</th>
                  <th className="px-4 py-3 text-left">Quan hệ</th>
                  {activeTab !== 'pending' && <th className="px-4 py-3 text-left">Trạng thái</th>}
                  <th className="px-4 py-3 text-left">{activeTab === 'pending' ? 'Gửi lúc' : 'Liên kết bởi'}</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {links.map((link) => (
                  <tr key={link._id} className={`transition-colors hover:bg-gray-50 ${link.trangThai === 'pending' ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{link.parent?.hoTen || '—'}</p>
                      <p className="text-xs text-gray-400">{link.parent?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-amber-600 font-medium">{link.student?.tenThanh}</p>
                      <p className="font-semibold text-gray-900">{link.student?.hoTen || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{link.student?.lop?.tenLop || <span className="text-gray-300 italic">Chưa có</span>}</td>
                    <td className="px-4 py-3 text-gray-600">{link.quanHe}</td>
                    {activeTab !== 'pending' && <td className="px-4 py-3"><StatusBadge trangThai={link.trangThai} /></td>}
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {activeTab === 'pending'
                        ? new Date(link.createdAt).toLocaleDateString('vi-VN')
                        : link.linkedBy?.hoTen || '—'}
                      {link.trangThai === 'rejected' && link.rejectedReason && (
                        <p className="mt-0.5 text-red-500">Lý do: {link.rejectedReason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {activeTab === 'pending' ? (
                          <>
                            <button type="button" title="Duyệt" onClick={() => handleApprove(link)}
                              disabled={approving === link._id}
                              className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50">
                              {approving === link._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                              Duyệt
                            </button>
                            <button type="button" title="Từ chối" onClick={() => setRejectTarget(link)}
                              className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition">
                              <XCircle className="h-3.5 w-3.5" />
                              Từ chối
                            </button>
                          </>
                        ) : (
                          <>
                        <button
                          type="button"
                          title={link.trangThai === 'active' ? 'Vô hiệu hoá' : 'Kích hoạt lại'}
                          onClick={() => handleToggle(link)}
                          disabled={toggling === link._id}
                          className={`rounded-lg p-1.5 transition ${link.trangThai === 'active' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                          {toggling === link._id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : link.trangThai === 'active' ? <Link2 className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          title="Xoá liên kết"
                          onClick={() => handleDelete(link._id)}
                          disabled={deleting === link._id}
                          className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 transition"
                        >
                          {deleting === link._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            ← Trước
          </button>
          <span className="text-sm text-gray-500">Trang {page} / {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Sau →
          </button>
        </div>
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { fetchLinks(search, 1); fetchPendingCount(); }}
        />
      )}

      {rejectTarget && (
        <RejectModal
          link={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onDone={() => {
            setLinks(prev => prev.filter(l => l._id !== rejectTarget._id));
            setTotal(t => t - 1);
            setPendingCount(c => Math.max(0, c - 1));
          }}
        />
      )}
    </div>
  );
};

export default AdminParentLink;
