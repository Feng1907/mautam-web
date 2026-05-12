import { useState } from 'react';
import { Plus, Trash2, Shield } from 'lucide-react';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';

// ─── Initial data ─────────────────────────────────────────────────────────────
const MODULES = [
  { id: 'students',  label: 'Đoàn sinh',   icon: '👥' },
  { id: 'classes',   label: 'Lớp học',     icon: '📚' },
  { id: 'grades',    label: 'Bảng điểm',   icon: '📊' },
  { id: 'posts',     label: 'Tin tức',      icon: '📰' },
  { id: 'finance',   label: 'Tài chính',   icon: '💰' },
  { id: 'users',     label: 'Tài khoản',   icon: '👤' },
  { id: 'export',    label: 'Xuất dữ liệu',icon: '📤' },
  { id: 'audit',     label: 'Audit Logs',  icon: '🔍' },
];

const PERMS = [
  { id: 'view',    label: 'Xem',      color: 'text-sky-600 dark:text-sky-400' },
  { id: 'edit',    label: 'Sửa',      color: 'text-amber-600 dark:text-amber-400' },
  { id: 'delete',  label: 'Xóa',      color: 'text-red-600 dark:text-red-400' },
  { id: 'approve', label: 'Phê duyệt',color: 'text-purple-600 dark:text-purple-400' },
];

const buildDefaultMatrix = () =>
  Object.fromEntries(MODULES.map(m => [m.id, Object.fromEntries(PERMS.map(p => [p.id, false]))]));

const INITIAL_ROLES = [
  {
    id: 'admin', name: 'Admin', color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400', protected: true,
    matrix: Object.fromEntries(MODULES.map(m => [m.id, Object.fromEntries(PERMS.map(p => [p.id, true]))])),
  },
  {
    id: 'giaoly', name: 'Giáo lý viên', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400', protected: true,
    matrix: Object.fromEntries(MODULES.map(m => [m.id, {
      view: true, edit: ['students','grades','classes'].includes(m.id),
      delete: false, approve: false,
    }])),
  },
  {
    id: 'phuhuynh', name: 'Phụ huynh', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', protected: true,
    matrix: Object.fromEntries(MODULES.map(m => [m.id, {
      view: ['students','grades','posts'].includes(m.id), edit: false, delete: false, approve: false,
    }])),
  },
];

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle = ({ on, onChange, disabled }) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
    } ${on ? 'bg-red-600' : 'bg-gray-200 dark:bg-slate-600'}`}
  >
    <span className={`inline-block w-3.5 h-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-4' : 'translate-x-1'}`} />
  </button>
);

export default function AdminRBAC() {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [activeRole, setActiveRole] = useState('admin');
  const [newRoleName, setNewRoleName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const current = roles.find(r => r.id === activeRole);

  const togglePerm = (moduleId, permId) => {
    if (current?.protected) return;
    setRoles(prev => prev.map(r =>
      r.id !== activeRole ? r : {
        ...r,
        matrix: { ...r.matrix, [moduleId]: { ...r.matrix[moduleId], [permId]: !r.matrix[moduleId][permId] } },
      }
    ));
    toast('Quyền đã được cập nhật', 'success', 2000);
  };

  const addRole = () => {
    const name = newRoleName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    setRoles(prev => [...prev, {
      id, name, color: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300', protected: false,
      matrix: buildDefaultMatrix(),
    }]);
    setActiveRole(id);
    setNewRoleName('');
    setAdding(false);
    toast(`Đã tạo vai trò "${name}"`, 'success');
  };

  const deleteRole = () => {
    setRoles(prev => prev.filter(r => r.id !== deleteTarget));
    if (activeRole === deleteTarget) setActiveRole('admin');
    toast('Đã xóa vai trò', 'info');
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Shield size={20} className="text-red-600" />Phân quyền (RBAC)
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Quản lý vai trò và quyền truy cập từng module</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Role list */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 space-y-1 h-fit">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-300 dark:text-slate-600 px-2 pb-2">Vai trò</p>

          {roles.map(r => (
            <div key={r.id}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition ${activeRole === r.id ? 'bg-red-50 dark:bg-red-950/30' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
              onClick={() => setActiveRole(r.id)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${r.color}`}>{r.name[0]}</span>
                <span className={`text-sm font-semibold truncate ${activeRole === r.id ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-slate-300'}`}>{r.name}</span>
              </div>
              {!r.protected && (
                <button
                  onClick={e => { e.stopPropagation(); setDeleteTarget(r.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-300 hover:text-red-500 transition">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}

          {/* Add role */}
          {adding ? (
            <div className="pt-2 space-y-2">
              <input
                autoFocus value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addRole(); if (e.key === 'Escape') setAdding(false); }}
                placeholder="Tên vai trò..."
                className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-slate-700 dark:text-slate-200"
              />
              <div className="flex gap-2">
                <button onClick={addRole} className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition">Tạo</button>
                <button onClick={() => setAdding(false)} className="flex-1 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs font-bold rounded-lg transition">Huỷ</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition mt-1">
              <Plus size={14} />Tạo vai trò mới
            </button>
          )}
        </div>

        {/* Permission matrix */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${current?.color}`}>{current?.name}</span>
              {current?.protected && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400">Hệ thống</span>
              )}
            </div>
            {current?.protected && (
              <p className="text-xs text-gray-400">Vai trò hệ thống — không thể chỉnh sửa</p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60">
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 min-w-40">Module</th>
                  {PERMS.map(p => (
                    <th key={p.id} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-center min-w-24 ${p.color}`}>{p.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {MODULES.map(mod => (
                  <tr key={mod.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-700 dark:text-slate-300">
                      <span className="mr-2">{mod.icon}</span>{mod.label}
                    </td>
                    {PERMS.map(perm => (
                      <td key={perm.id} className="px-4 py-3.5 text-center">
                        <div className="flex justify-center">
                          <Toggle
                            on={current?.matrix[mod.id]?.[perm.id] ?? false}
                            onChange={() => togglePerm(mod.id, perm.id)}
                            disabled={current?.protected}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Xóa vai trò?"
        message={`Vai trò "${roles.find(r => r.id === deleteTarget)?.name}" sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa vai trò"
        onConfirm={deleteRole}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
