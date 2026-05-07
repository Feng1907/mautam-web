import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImagePlus, Trash2, Pencil, X, Loader2, Upload,
  Eye, EyeOff, Plus, AlertCircle, Newspaper, Bell, BellRing, LayoutGrid,
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// ── Constants ─────────────────────────────────────────────────────────────────
const SERIF = '"EB Garamond", Lora, Georgia, serif';
const SANS  = '"Inter", system-ui, sans-serif';

const LOAI_OPTIONS = [
  { value: 'tintuc',        label: 'Tin tức'          },
  { value: 'thongbao',      label: 'Thông báo'        },
  { value: 'thongbaokhan',  label: '🔔 Thông báo khẩn' },
];

const LOAI_LABEL = {
  tintuc:       { label: 'Tin tức',   pill: 'bg-sky-100 text-sky-700 border-sky-200'      },
  thongbao:     { label: 'Thông báo', pill: 'bg-gray-100 text-gray-600 border-gray-200'   },
  thongbaokhan: { label: '🔔 Khẩn',   pill: 'bg-red-100 text-red-700 border-red-200'      },
};

const FILTERS = [
  { value: '',             label: 'Tất cả',   Icon: LayoutGrid  },
  { value: 'tintuc',      label: 'Tin tức',   Icon: Newspaper   },
  { value: 'thongbao',    label: 'Thông báo', Icon: Bell        },
  { value: 'thongbaokhan',label: 'Khẩn',      Icon: BellRing    },
];

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB    = 2;
const MAX_DIM        = 1200;
const QUALITY        = 0.82;

const emptyForm = {
  tieuDe: '', tomTat: '', noiDung: '',
  loai: 'tintuc', anhDaiDien: '', daDang: false, hanHienThi: '',
};

// ── Watermark SVG ─────────────────────────────────────────────────────────────
const CrossWatermark = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.025]"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
  >
    <defs>
      <pattern id="admin-cross" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
        <rect x="40" y="16" width="10" height="58" rx="2.5" fill="#8B0000" />
        <rect x="22" y="30" width="46" height="10" rx="2.5" fill="#8B0000" />
        <circle cx="45" cy="12" r="4" fill="none" stroke="#8B0000" strokeWidth="2" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#admin-cross)" />
  </svg>
);

// ── Image compress ────────────────────────────────────────────────────────────
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        const r = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * r); height = Math.round(height * r);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        b => b ? resolve(b) : reject(new Error('Nén ảnh thất bại')),
        'image/jpeg', QUALITY,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Đọc file thất bại')); };
    img.src = url;
  });

// ── Upload Area ───────────────────────────────────────────────────────────────
const ImageUploadArea = ({ previewUrl, onFileSelect, onClear, uploading, uploadPct }) => {
  const inputRef = useRef(null);
  const [drag,    setDrag]    = useState(false);
  const [fileErr, setFileErr] = useState('');

  const validate = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) { setFileErr('Chỉ nhận JPG, PNG hoặc WebP.'); return false; }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) { setFileErr(`File phải nhỏ hơn ${MAX_SIZE_MB} MB.`); return false; }
    setFileErr(''); return true;
  };

  const handleChange = (e) => { const f = e.target.files?.[0]; if (f && validate(f)) onFileSelect(f); e.target.value = ''; };
  const handleDrop   = (e)  => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f && validate(f)) onFileSelect(f); };

  if (previewUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-[#e5d5b5]" style={{ aspectRatio: '16/7' }}>
        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
        {uploading && (
          <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
            <div className="w-44 h-1.5 bg-white/25 rounded-full overflow-hidden">
              <div className="h-full bg-[#D4AF37] rounded-full transition-all duration-300" style={{ width: `${uploadPct}%` }} />
            </div>
            <span className="text-white text-xs font-medium">{uploadPct}%</span>
          </div>
        )}
        {!uploading && (
          <button
            type="button" onClick={onClear}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 hover:bg-red-600 text-white transition"
            title="Xóa ảnh"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={`w-full flex flex-col items-center justify-center gap-2.5 py-10 px-4 rounded-xl border-2 border-dashed transition cursor-pointer ${
          drag ? 'border-[#8B0000] bg-red-50/50' : 'border-[#e5d5b5] bg-[#fffcf9]/60 hover:border-[#D4AF37] hover:bg-amber-50/40'
        }`}
      >
        <ImagePlus className={`w-8 h-8 ${drag ? 'text-[#8B0000]' : 'text-[#D4AF37]'}`} />
        <p className="text-sm font-medium text-[#5a1a1a]">Nhấp để chọn ảnh hoặc kéo thả vào đây</p>
        <p className="text-xs text-gray-400">JPG · PNG · WebP · tối đa {MAX_SIZE_MB} MB · tự động nén</p>
      </button>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleChange} />
      {fileErr && (
        <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{fileErr}
        </p>
      )}
    </div>
  );
};

// ── PostForm Modal ────────────────────────────────────────────────────────────
const PostForm = ({ initial, onSave, onCancel }) => {
  const [form,      setForm]      = useState(initial || emptyForm);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl,setPreviewUrl]= useState(initial?.anhDaiDien || '');
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  const isEdit = !!initial?._id;
  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFileSelect = (file) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    if (imageFile) URL.revokeObjectURL(previewUrl);
    setImageFile(null); setPreviewUrl(''); set('anhDaiDien', '');
  };

  const uploadToFirebase = async (file) => {
    const blob     = await compressImage(file);
    const fileName = `news_images/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const task     = uploadBytesResumable(ref(storage, fileName), blob, { contentType: 'image/jpeg' });
    setUploading(true); setUploadPct(0);
    return new Promise((resolve, reject) => {
      task.on('state_changed',
        snap => setUploadPct(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
        err  => { setUploading(false); reject(err); },
        async () => { setUploading(false); resolve(await getDownloadURL(task.snapshot.ref)); },
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const anhDaiDien = imageFile ? await uploadToFirebase(imageFile) : form.anhDaiDien;
      const payload = { ...form, anhDaiDien, hanHienThi: form.loai === 'thongbaokhan' && form.hanHienThi ? form.hanHienThi : null };
      const res = isEdit ? await api.put(`/posts/${initial._id}`, payload) : await api.post('/posts', payload);
      onSave(res.data.data);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Lưu thất bại');
    } finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center px-4 py-8 overflow-y-auto"
        style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', background: 'rgba(30,8,8,0.45)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="w-full max-w-2xl p-6 my-auto rounded-2xl shadow-2xl"
          style={{
            background: 'rgba(255,252,249,0.97)',
            border: '1px solid #e5d5b5',
            fontFamily: SANS,
          }}
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-[#8B0000] text-lg select-none">✝</span>
              <h2 className="text-lg font-bold text-[#3d1515]" style={{ fontFamily: SERIF }}>
                {isEdit ? 'Chỉnh sửa bài viết' : 'Đăng bài mới'}
              </h2>
            </div>
            <button type="button" onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2.5 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-medium text-[#5a1a1a] mb-1">Tiêu đề *</label>
              <input className="input rounded-xl" placeholder="Nhập tiêu đề bài viết..."
                value={form.tieuDe} onChange={e => set('tieuDe', e.target.value)} required autoFocus />
            </div>

            {/* Loại + Đăng ngay */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5a1a1a] mb-1">Loại bài</label>
                <select className="input rounded-xl" value={form.loai} onChange={e => set('loai', e.target.value)}>
                  {LOAI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col justify-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 accent-red-700"
                    checked={form.daDang} onChange={e => set('daDang', e.target.checked)} />
                  <span className="text-sm font-medium text-[#5a1a1a]">Đăng ngay</span>
                </label>
              </div>
            </div>

            {form.loai === 'thongbaokhan' && (
              <div>
                <label className="block text-sm font-medium text-[#5a1a1a] mb-1">
                  Hạn hiển thị <span className="text-gray-400 font-normal">(để trống = không giới hạn)</span>
                </label>
                <input type="datetime-local" className="input rounded-xl"
                  value={form.hanHienThi} onChange={e => set('hanHienThi', e.target.value)} />
              </div>
            )}

            {/* Tóm tắt */}
            <div>
              <label className="block text-sm font-medium text-[#5a1a1a] mb-1">
                Tóm tắt <span className="text-gray-400 font-normal">(hiển thị ở danh sách)</span>
              </label>
              <textarea className="input rounded-xl resize-none" rows={2}
                placeholder="Mô tả ngắn về bài viết..."
                value={form.tomTat} onChange={e => set('tomTat', e.target.value)} />
            </div>

            {/* Nội dung */}
            <div>
              <label className="block text-sm font-medium text-[#5a1a1a] mb-1">Nội dung *</label>
              <textarea className="input rounded-xl resize-y" rows={8}
                placeholder="Nội dung chi tiết... (hỗ trợ HTML cơ bản)"
                value={form.noiDung} onChange={e => set('noiDung', e.target.value)} required />
            </div>

            {/* Ảnh đại diện */}
            <div>
              <label className="block text-sm font-medium text-[#5a1a1a] mb-1.5">
                Ảnh đại diện <span className="text-gray-400 font-normal">(tuỳ chọn · tự động nén)</span>
              </label>
              <ImageUploadArea
                previewUrl={previewUrl}
                onFileSelect={handleFileSelect}
                onClear={handleClearImage}
                uploading={uploading}
                uploadPct={uploadPct}
              />
            </div>

            {/* Nút lưu */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit" disabled={saving || uploading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-base text-white transition disabled:opacity-50 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #8B0000 0%, #c0392b 100%)', fontFamily: SANS }}
              >
                {saving || uploading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />{uploading ? `Đang tải ảnh ${uploadPct}%...` : 'Đang lưu...'}</>
                  : <><Upload className="w-4 h-4" />{isEdit ? 'Cập nhật bài viết' : 'Đăng bài'}</>
                }
              </button>
              <button type="button" onClick={onCancel}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
                Huỷ
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Post Card (admin) ─────────────────────────────────────────────────────────
const AdminPostCard = ({ post, onEdit, onDelete, onToggle, deleting }) => {
  const cfg = LOAI_LABEL[post.loai] || LOAI_LABEL.tintuc;
  return (
    <div
      className="relative flex items-start gap-4 flex-wrap p-4 rounded-2xl border transition-all duration-200"
      style={{ background: 'rgba(255,252,249,0.9)', borderColor: '#e5d5b5' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5d5b5'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {post.anhDaiDien && (
        <img src={post.anhDaiDien} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#e5d5b5]" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cfg.pill}`}>{cfg.label}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${post.daDang ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {post.daDang ? 'Đã đăng' : 'Nháp'}
          </span>
          <span className="text-xs text-gray-400" style={{ fontFamily: SANS }}>
            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <h3 className="font-semibold text-[#3d1515] leading-snug" style={{ fontFamily: SERIF }}>{post.tieuDe}</h3>
        {post.tomTat && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1" style={{ fontFamily: SANS }}>{post.tomTat}</p>}
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <button onClick={onToggle}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition ${post.daDang ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}>
          {post.daDang ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {post.daDang ? 'Gỡ xuống' : 'Đăng lên'}
        </button>
        <button onClick={onEdit}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-medium transition">
          <Pencil className="w-3.5 h-3.5" />Sửa
        </button>
        <button onClick={onDelete} disabled={deleting}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium transition disabled:opacity-40">
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          {deleting ? '...' : 'Xoá'}
        </button>
      </div>
    </div>
  );
};

// ── Trang AdminPosts ──────────────────────────────────────────────────────────
const AdminPosts = () => {
  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState(null);
  const [loai,     setLoai]     = useState('');
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/posts', { params: { loai: loai || undefined, limit: 50 } })
      .then(r => setPosts(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loai]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const handleSave = (saved) => {
    setPosts(prev => {
      const idx = prev.findIndex(p => p._id === saved._id);
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
      return [saved, ...prev];
    });
    setForm(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá bài viết này?')) return;
    setDeleting(id);
    try { await api.delete(`/posts/${id}`); setPosts(prev => prev.filter(p => p._id !== id)); }
    catch { alert('Xoá thất bại.'); }
    finally { setDeleting(null); }
  };

  const handleTogglePublish = async (post) => {
    try {
      const res = await api.put(`/posts/${post._id}`, { daDang: !post.daDang });
      setPosts(prev => prev.map(p => p._id === post._id ? res.data.data : p));
    } catch { alert('Cập nhật thất bại.'); }
  };

  return (
    <div
      className="relative min-h-full"
      style={{ background: '#fdfbf7', fontFamily: SANS }}
    >
      <CrossWatermark />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-xl font-bold text-[#3d1515]" style={{ fontFamily: SERIF }}>
            Quản lý Bài viết
          </h2>
          <button
            onClick={() => setForm({})}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition"
            style={{ background: 'linear-gradient(135deg, #8B0000 0%, #c0392b 100%)' }}
          >
            <Plus className="w-4 h-4" />Đăng bài mới
          </button>
        </div>

        {/* Pill filter */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {FILTERS.map(({ value, label, Icon }) => {
            const active = loai === value;
            return (
              <button key={value} onClick={() => setLoai(value)}
                className={`flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-full border font-medium transition-all ${
                  active ? 'text-white border-[#8B0000] shadow-sm' : 'text-gray-600 border-[#e5d5b5] bg-white/70 hover:border-[#D4AF37]'
                }`}
                style={active ? { background: 'linear-gradient(135deg, #8B0000, #6e1a1a)' } : {}}
              >
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            );
          })}
        </div>

        {/* Danh sách */}
        {loading ? <LoadingSpinner /> : (
          posts.length === 0
            ? <p className="text-center text-gray-400 py-12 italic" style={{ fontFamily: SERIF }}>Chưa có bài viết nào.</p>
            : (
              <motion.div
                className="flex flex-col gap-3"
                initial="hidden" animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              >
                {posts.map(p => (
                  <motion.div key={p._id}
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } } }}
                  >
                    <AdminPostCard
                      post={p}
                      onEdit={() => setForm(p)}
                      onDelete={() => handleDelete(p._id)}
                      onToggle={() => handleTogglePublish(p)}
                      deleting={deleting === p._id}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )
        )}
      </div>

      {/* Modal */}
      {form !== null && (
        <PostForm
          initial={form._id ? form : null}
          onSave={handleSave}
          onCancel={() => setForm(null)}
        />
      )}
    </div>
  );
};

export default AdminPosts;
