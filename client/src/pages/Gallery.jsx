import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/AuthContext';
import { DEFAULT_OG_IMAGE, toAbsoluteUrl, pageUrl } from '../utils/seo';
import {
  Upload, Download, Trash2, X,
  ChevronLeft, ChevronRight, ZoomIn, Loader2,
  Search,
} from 'lucide-react';
import { fetchPhotos, uploadPhoto, deletePhoto, formatBytes } from '../services/galleryService';
import { CardGridSkeleton } from '../components/PageSkeleton';

// ── Fonts / design tokens ─────────────────────────────────────────────────────
const SERIF = '"Playfair Display", "EB Garamond", Lora, Georgia, serif';
const SANS = '"Be Vietnam Pro", "Inter", system-ui, sans-serif';

// ── Cấu hình sự kiện & năm ────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export const EVENTS = [
  { value: 'all',          label: { vi: 'Tất cả sự kiện',  en: 'All events'      } },
  { value: 'phuc-sinh',    label: { vi: 'Phục Sinh',        en: 'Easter'          } },
  { value: 'giang-sinh',   label: { vi: 'Giáng Sinh',       en: 'Christmas'       } },
  { value: 'trai-he',      label: { vi: 'Trại Hè',          en: 'Summer Camp'     } },
  { value: 'dang-hoa',     label: { vi: 'Dâng Hoa',         en: 'Flower Offering' } },
  { value: 'le-quan-thay', label: { vi: 'Lễ Quan Thầy',    en: 'Patron Feast'    } },
  { value: 'sinh-hoat',    label: { vi: 'Sinh Hoạt',        en: 'Activities'      } },
];

const YEARS = [2026, 2025, 2024, 2023];

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_PHOTOS = Array.from({ length: 12 }, (_, i) => ({
  id:          String(i + 1),
  url:         '/images/DAP_2149.jpg',
  title:       ['Thánh lễ Phục Sinh','Rước Kiệu','Trại Hè','Lửa Trại','Dâng Hoa',
                 'Lễ Quan Thầy','Giáng Sinh','Hang Đá','Sinh Hoạt','Khai Giảng',
                 'Bế Giảng','Cắm Trại'][i],
  event:       ['phuc-sinh','phuc-sinh','trai-he','trai-he','dang-hoa',
                 'le-quan-thay','giang-sinh','giang-sinh','sinh-hoat','sinh-hoat',
                 'sinh-hoat','trai-he'][i],
  year:        i < 6 ? 2025 : 2024,
  timestamp:   i < 6 ? '2025-04-20' : '2024-12-25',
  storagePath: null,
}));

// ── useGallery hook ───────────────────────────────────────────────────────────
const useGallery = () => {
  const qc = useQueryClient();

  const { data: fetchedPhotos, isLoading: loading } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => fetchPhotos().catch(() => MOCK_PHOTOS),
    staleTime:   10 * 60 * 1000,  // 10 phút — không refetch nếu data còn mới
    gcTime:      30 * 60 * 1000,  // 30 phút — giữ cache trong memory
    retry: 2,
  });

  const photos  = fetchedPhotos || [];
  const useMock = fetchedPhotos === MOCK_PHOTOS;

  const addPhoto    = (p)  => qc.setQueryData(['gallery'], prev => [p, ...(prev || [])]);
  const removePhoto = (id) => qc.setQueryData(['gallery'], prev => (prev || []).filter(p => p.id !== id));

  return { photos, loading, useMock, addPhoto, removePhoto };
};

// ── Placeholder Thánh Giá khi ảnh đang tải ───────────────────────────────────
const CrossPlaceholder = () => (
  <div
    className="absolute inset-0 flex items-center justify-center"
    style={{ background: 'linear-gradient(135deg, #fdf6e3, #f5e6c8)' }}
  >
    <span className="text-4xl opacity-20 select-none animate-pulse">✝</span>
  </div>
);

const useInView = ({ rootMargin = '360px 0px', threshold = 0.01 } = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return undefined;

    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { rootMargin, threshold });

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, rootMargin, threshold]);

  return [ref, inView];
};

// ── ImageCard ─────────────────────────────────────────────────────────────────
const ImageCard = ({ photo, index, isAdmin, onDelete, onOpen }) => {
  const { i18n } = useTranslation();
  const lang     = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const [deleting,  setDeleting]  = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [cardRef, shouldLoadImage] = useInView();

  const handleDownload = (e) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = photo.url; a.download = `${photo.title}.jpg`; a.target = '_blank'; a.click();
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(lang === 'vi' ? `Xóa ảnh "${photo.title}"?` : `Delete "${photo.title}"?`)) return;
    setDeleting(true);
    try   { await deletePhoto({ id: photo.id, storagePath: photo.storagePath }); onDelete(photo.id); }
    catch { setDeleting(false); alert(lang === 'vi' ? 'Xóa thất bại.' : 'Delete failed.'); }
  };

  return (
    <motion.div
      ref={cardRef}
      layout="position"
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.18 } }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300 border border-[#e5d5b5] hover:border-[#D4AF37] dark:border-slate-700"
      style={{ background: '#fffcf9', aspectRatio: '4/3' }}
      onClick={() => !deleting && onOpen(photo)}
    >
      {/* Placeholder cross khi chưa load */}
      {!imgLoaded && <CrossPlaceholder />}

      {shouldLoadImage && (
        <img
          src={photo.url}
          alt={photo.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <p
          className="text-white text-sm font-semibold leading-tight truncate"
          style={{ fontFamily: SERIF }}
        >
          {photo.title}
        </p>
        <p className="text-white/55 text-[11px] mt-0.5" style={{ fontFamily: SANS }}>
          {photo.timestamp}
        </p>
      </div>

      {/* Zoom icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <ZoomIn size={19} className="text-white" />
        </div>
      </div>

      {/* STT badge (admin only) */}
      {isAdmin && (
        <div
          className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
          style={{ background: 'rgba(139,0,0,0.85)', fontFamily: SANS }}
        >
          {index + 1}
        </div>
      )}

      {/* Action buttons */}
      <div
        className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300"
        onClick={e => e.stopPropagation()}
      >
        {isAdmin && (
          <button
            onClick={handleDelete} disabled={deleting}
            className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-50 flex items-center justify-center shadow-lg transition"
            title={lang === 'vi' ? 'Xóa ảnh' : 'Delete'}
          >
            {deleting ? <Loader2 size={12} className="text-white animate-spin" /> : <Trash2 size={13} className="text-white" />}
          </button>
        )}
        <button
          onClick={handleDownload}
          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition"
          title={lang === 'vi' ? 'Tải về' : 'Download'}
        >
          <Download size={13} className="text-gray-700" />
        </button>
      </div>
    </motion.div>
  );
};

// ── Lightbox ──────────────────────────────────────────────────────────────────
const Lightbox = ({ photos, index, onClose, onGoto }) => {
  const { i18n } = useTranslation();
  const lang     = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const photo    = photos[index];
  const thumbsRef = useRef(null);

  useEffect(() => {
    thumbsRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
  }, [index]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowLeft')  onGoto(Math.max(0, index - 1));
      if (e.key === 'ArrowRight') onGoto(Math.min(photos.length - 1, index + 1));
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [index, photos.length, onGoto, onClose]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.url; a.download = `${photo.title}.jpg`; a.target = '_blank'; a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-black/96 flex flex-col select-none"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div>
          <p className="text-white font-semibold text-sm" style={{ fontFamily: SERIF }}>{photo.title}</p>
          <p className="text-white/45 text-xs" style={{ fontFamily: SANS }}>{index + 1} / {photos.length} · {photo.timestamp}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition"
            style={{ fontFamily: SANS }}
          >
            <Download size={13} />
            {lang === 'vi' ? 'Tải về' : 'Download'}
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main image */}
      <div
        className="flex-1 flex items-center justify-center px-14 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => onGoto(index - 1)} disabled={index === 0}
          className="absolute left-3 sm:left-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 disabled:opacity-20 flex items-center justify-center text-white transition"
        >
          <ChevronLeft size={22} />
        </button>

        <AnimatePresence mode="wait">
          <motion.img
            key={photo.id}
            src={photo.url} alt={photo.title}
            loading="eager"
            decoding="async"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="max-h-[72vh] max-w-full object-contain rounded-2xl shadow-2xl"
          />
        </AnimatePresence>

        <button
          onClick={() => onGoto(index + 1)} disabled={index === photos.length - 1}
          className="absolute right-3 sm:right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 disabled:opacity-20 flex items-center justify-center text-white transition"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Thumbnails */}
      <div
        ref={thumbsRef}
        className="shrink-0 px-4 py-3 flex gap-2 overflow-x-auto"
        onClick={e => e.stopPropagation()}
      >
        {photos.map((p, i) => (
          <button
            key={p.id} onClick={() => onGoto(i)}
            className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === index ? 'border-[#D4AF37] opacity-100' : 'border-transparent opacity-40 hover:opacity-70'}`}
          >
            <img src={p.url} alt={p.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ── UploadModal ───────────────────────────────────────────────────────────────
const CONCURRENCY = 3;

const UploadModal = ({ onClose, onUploaded, defaultEvent, defaultYear }) => {
  const { i18n } = useTranslation();
  const lang     = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const inputRef    = useRef(null);
  const addMoreRef  = useRef(null);

  const [fileItems, setFileItems] = useState([]); // { id, file, preview, size, status, progress, error }
  const [title,     setTitle]     = useState('');
  const [event,     setEvent]     = useState(defaultEvent || 'sinh-hoat');
  const [year,      setYear]      = useState(defaultYear  || new Date().getFullYear());
  const [status,    setStatus]    = useState('idle'); // 'idle'|'uploading'|'done'|'partial'
  const [dragOver,  setDragOver]  = useState(false);

  const addFiles = (incoming) => {
    const arr = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return;
    setFileItems(prev => {
      if (!title && prev.length === 0) setTitle(arr[0].name.replace(/\.[^/.]+$/, ''));
      return [
        ...prev,
        ...arr.map(f => ({
          id: crypto.randomUUID(), file: f,
          preview: URL.createObjectURL(f), size: f.size,
          status: 'pending', progress: 0, error: '',
        })),
      ];
    });
  };

  const removeFile = (id) => setFileItems(prev => prev.filter(f => f.id !== id));

  const updateItem = useCallback((id, patch) =>
    setFileItems(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f)), []);

  const uploadOne = useCallback(async (item) => {
    updateItem(item.id, { status: 'compressing', progress: 0 });
    try {
      const photo = await uploadPhoto({
        file: item.file, title, event, year,
        onProgress: (pct, ph) => updateItem(item.id, {
          status: ph === 'compress' ? 'compressing' : 'uploading',
          progress: pct,
        }),
      });
      updateItem(item.id, { status: 'done', progress: 100 });
      onUploaded(photo);
      return true;
    } catch (err) {
      updateItem(item.id, { status: 'error', error: err?.message || 'Thất bại' });
      return false;
    }
  }, [title, event, year, onUploaded, updateItem]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const queue = fileItems.filter(f => f.status === 'pending' || f.status === 'error');
    if (!queue.length) return;
    setStatus('uploading');
    let successCount = 0;
    for (let i = 0; i < queue.length; i += CONCURRENCY) {
      const batch = queue.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map(uploadOne));
      successCount += results.filter(Boolean).length;
    }
    const finalStatus = successCount === queue.length ? 'done' : 'partial';
    setStatus(finalStatus);
    if (finalStatus === 'done') setTimeout(onClose, 2000);
  };

  const handleRetry = () => {
    setFileItems(prev => prev.map(f =>
      f.status === 'error' ? { ...f, status: 'pending', progress: 0, error: '' } : f
    ));
    setStatus('idle');
  };

  const totalSize    = fileItems.reduce((s, f) => s + f.size, 0);
  const doneCount    = fileItems.filter(f => f.status === 'done').length;
  const errorCount   = fileItems.filter(f => f.status === 'error').length;
  const pendingCount = fileItems.filter(f => f.status === 'pending').length;
  const isUploading  = status === 'uploading';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backdropFilter: 'blur(6px)', background: 'rgba(30,8,8,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', damping: 22 }}
        className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: '#fffcf9', border: '1px solid #e5d5b5' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: '#e5d5b5' }}>
          <div>
            <h2 className="font-bold text-[#3d1515]" style={{ fontFamily: SERIF }}>
              {lang === 'vi' ? 'Tải ảnh lên' : 'Upload Photos'}
            </h2>
            {fileItems.length > 0 && (
              <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontFamily: SANS }}>
                {fileItems.length} {lang === 'vi' ? 'ảnh' : 'photo(s)'} · {formatBytes(totalSize)}
                {' · '}
                <span className="text-emerald-600 font-semibold">
                  {lang === 'vi' ? 'Tự nén → ~500 KB/ảnh' : 'Auto-compress → ~500 KB each'}
                </span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1" style={{ fontFamily: SANS }}>
          {/* Dropzone — chỉ hiện khi chưa có ảnh */}
          {fileItems.length === 0 ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-[#8B0000] bg-red-50/40' : 'border-[#e5d5b5] hover:border-[#D4AF37] hover:bg-amber-50/30'}`}
            >
              <input ref={inputRef} type="file" multiple accept="image/*" className="hidden"
                onChange={e => addFiles(e.target.files)} />
              <span className="block text-3xl mb-2 opacity-30 select-none">✝</span>
              <p className="text-sm font-semibold text-[#5a1a1a]">
                {lang === 'vi' ? 'Kéo & thả ảnh vào đây' : 'Drag & drop photos here'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {lang === 'vi' ? 'hoặc nhấp để chọn nhiều ảnh' : 'or click to select multiple photos'}
              </p>
            </div>
          ) : (
            <>
              {/* Tổng progress khi đang upload */}
              {isUploading && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                  <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Loader2 size={11} className="animate-spin text-[#8B0000]" />
                      {lang === 'vi' ? `Đang xử lý song song (tối đa ${CONCURRENCY} ảnh)…` : `Uploading in parallel (up to ${CONCURRENCY} at once)…`}
                    </span>
                    <span className="font-bold text-[#8B0000]">{doneCount}/{fileItems.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#8B0000]"
                      animate={{ width: `${(doneCount / fileItems.length) * 100}%` }}
                      transition={{ ease: 'linear', duration: 0.2 }}
                    />
                  </div>
                </div>
              )}

              {/* Danh sách file */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <div
                  className="divide-y divide-gray-100 px-3"
                  style={{ maxHeight: '220px', overflowY: 'auto' }}
                >
                  {fileItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2.5 py-2 group">
                      <img src={item.preview} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-200" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{item.file.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.status === 'compressing' || item.status === 'uploading' ? (
                            <>
                              <span className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${item.status === 'compressing' ? 'bg-[#D4AF37]' : 'bg-[#8B0000]'}`} />
                              <div className="flex-1 bg-gray-100 rounded-full h-1 overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${item.status === 'compressing' ? 'bg-[#D4AF37]' : 'bg-[#8B0000]'}`}
                                  animate={{ width: `${item.progress}%` }}
                                  transition={{ ease: 'linear', duration: 0.1 }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400 shrink-0">{item.progress}%</span>
                            </>
                          ) : (
                            <>
                              {item.status === 'done' && <span className="text-emerald-500 text-xs">✓</span>}
                              {item.status === 'error' && <span className="text-red-500 text-xs">✕</span>}
                              {item.status === 'pending' && <span className="w-3 h-3 rounded-full border-2 border-gray-200 shrink-0" />}
                              <span className={`text-[10px] ${item.status === 'error' ? 'text-red-500' : item.status === 'done' ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {item.status === 'done'
                                  ? (lang === 'vi' ? 'Xong' : 'Done')
                                  : item.status === 'error'
                                    ? (item.error || (lang === 'vi' ? 'Lỗi' : 'Error'))
                                    : formatBytes(item.size)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Nút xóa — chỉ khi chưa upload */}
                      {!isUploading && item.status !== 'done' && (
                        <button type="button" onClick={() => removeFile(item.id)}
                          className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 shrink-0">
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Thêm ảnh */}
                {!isUploading && status !== 'done' && (
                  <div
                    className="border-t border-dashed border-gray-200 px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-amber-50/40 transition"
                    onClick={() => addMoreRef.current?.click()}
                  >
                    <input ref={addMoreRef} type="file" multiple accept="image/*" className="hidden"
                      onChange={e => addFiles(e.target.files)} />
                    <span className="w-6 h-6 rounded-full border-2 border-dashed border-[#D4AF37] flex items-center justify-center text-[#8B0000] text-sm font-bold">+</span>
                    <span className="text-xs text-gray-500">{lang === 'vi' ? 'Thêm ảnh' : 'Add more photos'}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Metadata */}
          <div className="space-y-3">
            {!defaultEvent && (
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder={lang === 'vi' ? 'Tiêu đề album' : 'Album title'}
                className="input rounded-xl" disabled={isUploading} />
            )}
            <div className="grid grid-cols-2 gap-3">
              <select value={event} onChange={e => setEvent(e.target.value)} className="input rounded-xl" disabled={isUploading}>
                {EVENTS.filter(ev => ev.value !== 'all').map(ev => (
                  <option key={ev.value} value={ev.value}>{ev.label[lang]}</option>
                ))}
              </select>
              <select value={year} onChange={e => setYear(Number(e.target.value))} className="input rounded-xl" disabled={isUploading}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Kết quả */}
          {status === 'done' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-center">
              <p className="text-sm text-emerald-700 font-bold">
                ✓ {lang === 'vi' ? `Đã tải lên ${doneCount} ảnh thành công!` : `${doneCount} photo(s) uploaded!`}
              </p>
              <p className="text-xs text-emerald-500 mt-0.5">{lang === 'vi' ? 'Tự đóng sau 2 giây…' : 'Closing in 2 seconds…'}</p>
            </div>
          )}

          {status === 'partial' && errorCount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
              <p className="text-sm text-orange-700 font-semibold">
                {lang === 'vi'
                  ? `${doneCount} ảnh thành công, ${errorCount} ảnh thất bại`
                  : `${doneCount} succeeded, ${errorCount} failed`}
              </p>
              <button type="button" onClick={handleRetry}
                className="mt-2 text-xs font-semibold text-[#8B0000] underline underline-offset-2">
                {lang === 'vi' ? 'Thử lại ảnh lỗi' : 'Retry failed photos'}
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={isUploading}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition">
              {lang === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
            {status === 'partial' ? (
              <button type="button" onClick={handleRetry}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition"
                style={{ background: 'linear-gradient(135deg, #8B0000, #c0392b)' }}>
                {lang === 'vi' ? 'Thử lại' : 'Retry'}
              </button>
            ) : (
              <button type="submit"
                disabled={!fileItems.length || isUploading || status === 'done' || pendingCount === 0}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition"
                style={{ background: 'linear-gradient(135deg, #8B0000, #c0392b)' }}>
                {isUploading
                  ? <><Loader2 size={15} className="animate-spin" /> {lang === 'vi' ? 'Đang tải…' : 'Uploading…'}</>
                  : <><Upload size={15} /> {lang === 'vi' ? `Tải lên (${fileItems.length})` : `Upload (${fileItems.length})`}</>}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ── Album Card ────────────────────────────────────────────────────────────────
const AlbumCard = ({ album, lang, onClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const eventCfg = EVENTS.find(e => e.value === album.event);
  const label = eventCfg ? eventCfg.label[lang] : album.event;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#e5d5b5] dark:border-slate-700 shadow-sm group-hover:shadow-xl group-hover:border-[#D4AF37] transition-all duration-300"
           style={{ aspectRatio: '4/3' }}>
        {/* Cover image */}
        {album.cover ? (
          <>
            {/* Blurred background để fill khoảng trống khi ảnh dọc */}
            <img src={album.cover} alt="" aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60" />
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #fdf6e3, #f5e6c8)' }}>
                <span className="text-4xl opacity-20 select-none">✝</span>
              </div>
            )}
            <img src={album.cover} alt={label} loading="lazy"
              onLoad={() => setImgLoaded(true)}
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #3d1515, #6b0000)' }}>
            <span className="text-5xl opacity-20 select-none text-white">✝</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Photo count badge */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
          {album.count} ảnh
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-bold text-base leading-tight" style={{ fontFamily: SERIF }}>
            {label}
          </p>
          <p className="text-white/60 text-xs mt-0.5">{album.year}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ── Gallery Page ──────────────────────────────────────────────────────────────
const Gallery = () => {
  const { user }  = useAuth();
  const { i18n }  = useTranslation();
  const lang      = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const isAdmin   = user?.vaiTro === 'admin';

  const { photos, loading, addPhoto, removePhoto } = useGallery();

  const [selectedAlbum, setSelectedAlbum] = useState(null); // { event, year }
  const [showUpload,    setShowUpload]     = useState(false);
  const [lightbox,      setLightbox]       = useState({ open: false, index: 0 });
  const [search,        setSearch]         = useState('');

  // Tạo danh sách album từ photos
  const albums = useMemo(() => {
    const map = {};
    for (const p of photos) {
      const key = `${p.event}__${p.year}`;
      if (!map[key]) map[key] = { event: p.event, year: p.year, cover: p.url, count: 0 };
      map[key].count++;
    }
    return Object.values(map).sort((a, b) => b.year - a.year || a.event.localeCompare(b.event));
  }, [photos]);

  // Ảnh trong album đang chọn
  const albumPhotos = useMemo(() => {
    if (!selectedAlbum) return [];
    return photos.filter(p =>
      p.event === selectedAlbum.event &&
      String(p.year) === String(selectedAlbum.year) &&
      (!search.trim() || p.title?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [photos, selectedAlbum, search]);

  const openLightbox = useCallback((photo) => {
    const idx = albumPhotos.findIndex(p => p.id === photo.id);
    setLightbox({ open: true, index: Math.max(0, idx) });
  }, [albumPhotos]);

  if (loading) return <div className="page-container py-8"><CardGridSkeleton count={8} ratio="4/3" /></div>;

  const eventLabel = selectedAlbum
    ? (EVENTS.find(e => e.value === selectedAlbum.event)?.label[lang] || selectedAlbum.event)
    : null;

  return (
    <>
    <Helmet>
      <title>Thư Viện Ảnh | Xứ Đoàn Anrê Phú Yên – Mẫu Tâm</title>
      <meta name="description" content="Thư viện ảnh sinh hoạt, lễ hội và các sự kiện của Xứ Đoàn Mẫu Tâm." />
      <meta property="og:title" content="Thư Viện Ảnh | Mẫu Tâm" />
      <meta property="og:image" content={toAbsoluteUrl(DEFAULT_OG_IMAGE)} />
      <meta property="og:url" content={pageUrl('/thu-vien')} />
      <meta property="og:type" content="website" />
    </Helmet>
    <main className="flex-1 min-h-screen bg-page" style={{ fontFamily: SANS }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <div className="shrink-0 flex-1">
            {selectedAlbum ? (
              <div className="flex items-center gap-3">
                <button onClick={() => { setSelectedAlbum(null); setSearch(''); }}
                  className="flex items-center gap-1.5 text-sm text-[#8B0000] dark:text-red-400 hover:underline font-medium">
                  <ChevronLeft size={16} /> {lang === 'vi' ? 'Tất cả album' : 'All albums'}
                </button>
                <span className="text-gray-300">·</span>
                <h1 className="text-xl font-bold text-[#3d1515] dark:text-slate-100" style={{ fontFamily: SERIF }}>
                  {eventLabel} {selectedAlbum.year}
                </h1>
                <span className="text-xs text-gray-400">{albumPhotos.length} ảnh</span>
              </div>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]/70 mb-0.5">
                  {lang === 'vi' ? 'Xứ Đoàn Anrê Phú Yên' : 'Parish Youth Group'}
                </p>
                <h1 className="text-2xl font-bold text-[#3d1515] dark:text-slate-100 leading-tight" style={{ fontFamily: SERIF }}>
                  {lang === 'vi' ? 'Thư Viện Ảnh' : 'Photo Gallery'}
                </h1>
              </>
            )}
          </div>

          {/* Search (chỉ hiện trong album) */}
          {selectedAlbum && (
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#D4AF37]" />
              <input
                className="w-full h-10 pl-10 pr-4 text-sm bg-white/80 dark:bg-slate-800 dark:text-slate-100 outline-none transition rounded-full border border-[#e5d5b5]"
                placeholder={lang === 'vi' ? 'Tìm trong album...' : 'Search album...'}
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}

          {isAdmin && (
            <button onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition shrink-0"
              style={{ background: 'linear-gradient(135deg, #8B0000, #c0392b)' }}>
              <Upload size={14} /> {lang === 'vi' ? 'Tải ảnh lên' : 'Upload'}
            </button>
          )}
        </div>

        {/* Album grid */}
        {!selectedAlbum && (
          albums.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <span className="text-6xl block mb-4 opacity-20 select-none">📷</span>
              <p className="text-gray-400 italic" style={{ fontFamily: SERIF }}>
                {lang === 'vi' ? 'Chưa có album nào.' : 'No albums yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {albums.map(album => (
                <AlbumCard
                  key={`${album.event}__${album.year}`}
                  album={album}
                  lang={lang}
                  onClick={() => setSelectedAlbum({ event: album.event, year: album.year })}
                />
              ))}
            </div>
          )
        )}

        {/* Album detail — photo grid */}
        {selectedAlbum && (
          albumPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <span className="text-6xl block mb-4 opacity-20 select-none">✝</span>
              <p className="text-gray-400 italic">{lang === 'vi' ? 'Không có ảnh nào.' : 'No photos.'}</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {albumPhotos.map((photo, idx) => (
                  <ImageCard key={photo.id} photo={photo} index={idx}
                    isAdmin={isAdmin} onDelete={removePhoto} onOpen={openLightbox} />
                ))}
              </motion.div>
            </AnimatePresence>
          )
        )}
      </div>

      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onUploaded={(p) => { addPhoto(p); setShowUpload(false); }}
            defaultEvent={selectedAlbum?.event}
            defaultYear={selectedAlbum?.year}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox.open && (
          <Lightbox photos={albumPhotos} index={lightbox.index}
            onClose={() => setLightbox({ open: false, index: 0 })}
            onGoto={(i) => setLightbox(lb => ({ ...lb, index: i }))} />
        )}
      </AnimatePresence>
    </main>
    </>
  );
};

export default Gallery;
