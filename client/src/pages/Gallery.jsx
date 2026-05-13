import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/AuthContext';
import { DEFAULT_OG_IMAGE, toAbsoluteUrl, pageUrl } from '../utils/seo';
import {
  Upload, Download, Trash2, X,
  ChevronLeft, ChevronRight, ZoomIn, Loader2,
  Search, Filter,
} from 'lucide-react';
import { fetchPhotos, uploadPhoto, deletePhoto, formatBytes } from '../services/galleryService';
import LoadingSpinner from '../components/LoadingSpinner';

// ── Fonts / design tokens ─────────────────────────────────────────────────────
const SERIF = '"EB Garamond", Lora, Georgia, serif';
const SANS  = '"Inter", system-ui, sans-serif';

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
  const [photos,  setPhotos]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    fetchPhotos()
      .then(data => {
        if (data.length === 0) { setPhotos(MOCK_PHOTOS); setUseMock(true); }
        else                   { setPhotos(data); }
      })
      .catch(() => { setPhotos(MOCK_PHOTOS); setUseMock(true); })
      .finally(() => setLoading(false));
  }, []);

  const addPhoto    = (p)  => setPhotos(prev => [p, ...prev]);
  const removePhoto = (id) => setPhotos(prev => prev.filter(p => p.id !== id));

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
const UploadModal = ({ onClose, onUploaded }) => {
  const { i18n } = useTranslation();
  const lang     = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const inputRef = useRef(null);

  const [files,       setFiles]       = useState([]);
  const [previews,    setPreviews]    = useState([]);
  const [fileSizes,   setFileSizes]   = useState([]);
  const [title,       setTitle]       = useState('');
  const [event,       setEvent]       = useState('sinh-hoat');
  const [year,        setYear]        = useState(new Date().getFullYear());
  const [progress,    setProgress]    = useState(0);
  const [phase,       setPhase]       = useState('compress');
  const [currentFile, setCurrentFile] = useState(0);
  const [savedBytes,  setSavedBytes]  = useState(0);
  const [status,      setStatus]      = useState('idle');
  const [dragOver,    setDragOver]    = useState(false);
  const [errorMsg,    setErrorMsg]    = useState('');

  const handleFiles = (incoming) => {
    const arr = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return;
    setFiles(arr); setFileSizes(arr.map(f => f.size));
    setPreviews(arr.map(f => URL.createObjectURL(f)));
    if (!title) setTitle(arr[0].name.replace(/\.[^/.]+$/, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) return;
    setStatus('uploading'); setProgress(0); setCurrentFile(0); setSavedBytes(0); setErrorMsg('');
    try {
      const uploaded = []; let totalSaved = 0;
      for (let i = 0; i < files.length; i++) {
        setCurrentFile(i);
        const photo = await uploadPhoto({
          file:  files[i],
          title: files.length === 1 ? title : `${title} ${i + 1}`,
          event, year,
          onProgress: (pct, ph) => {
            setPhase(ph);
            const perFile = 100 / files.length;
            setProgress(Math.round(i * perFile + (pct / 100) * perFile));
          },
        });
        totalSaved += (photo.originalSize || 0) - (photo.compressedSize || 0);
        setSavedBytes(totalSaved);
        uploaded.push(photo);
      }
      setProgress(100); setStatus('done');
      uploaded.forEach(p => onUploaded(p));
      setTimeout(onClose, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg(lang === 'vi' ? 'Upload thất bại. Kiểm tra cấu hình Firebase và thử lại.' : 'Upload failed. Check Firebase config and try again.');
      setStatus('error');
    }
  };

  const totalOriginal = fileSizes.reduce((s, b) => s + b, 0);

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
        className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: '#fffcf9', border: '1px solid #e5d5b5' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: '#e5d5b5' }}
        >
          <div>
            <h2 className="font-bold text-[#3d1515]" style={{ fontFamily: SERIF }}>
              {lang === 'vi' ? 'Tải ảnh lên' : 'Upload Photos'}
            </h2>
            {files.length > 0 && (
              <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontFamily: SANS }}>
                {files.length} {lang === 'vi' ? 'ảnh' : 'photo(s)'} · {formatBytes(totalOriginal)}
                {' · '}
                <span className="text-emerald-600 font-semibold">
                  {lang === 'vi' ? 'Tự nén → ~500 KB/ảnh' : 'Auto-compress → ~500 KB each'}
                </span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" style={{ fontFamily: SANS }}>
          {/* Dropzone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => status === 'idle' && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${status !== 'idle' ? 'cursor-default' : 'cursor-pointer'} ${dragOver ? 'border-[#8B0000] bg-red-50/40' : 'border-[#e5d5b5] hover:border-[#D4AF37] hover:bg-amber-50/30'}`}
          >
            <input ref={inputRef} type="file" multiple accept="image/*" className="hidden"
              onChange={e => handleFiles(e.target.files)} />
            {previews.length > 0 ? (
              <div className="flex gap-2 flex-wrap justify-center">
                {previews.slice(0, 6).map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="" className="w-16 h-16 object-cover rounded-xl border-2 border-white shadow" />
                    <span className="absolute -bottom-1 -right-1 text-[9px] bg-gray-700 text-white px-1 rounded-full">
                      {formatBytes(fileSizes[i] || 0)}
                    </span>
                  </div>
                ))}
                {previews.length > 6 && (
                  <div className="w-16 h-16 rounded-xl bg-amber-50 flex items-center justify-center text-sm font-bold text-[#8B0000]">
                    +{previews.length - 6}
                  </div>
                )}
              </div>
            ) : (
              <>
                <span className="block text-3xl mb-2 opacity-30 select-none">✝</span>
                <p className="text-sm font-semibold text-[#5a1a1a]">
                  {lang === 'vi' ? 'Kéo & thả ảnh vào đây' : 'Drag & drop photos here'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === 'vi' ? 'hoặc nhấp để chọn' : 'or click to browse'}
                </p>
              </>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder={lang === 'vi' ? 'Tên ảnh / tiêu đề' : 'Photo title'}
              className="input rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <select value={event} onChange={e => setEvent(e.target.value)} className="input rounded-xl">
                {EVENTS.filter(ev => ev.value !== 'all').map(ev => (
                  <option key={ev.value} value={ev.value}>{ev.label[lang]}</option>
                ))}
              </select>
              <select value={year} onChange={e => setYear(Number(e.target.value))} className="input rounded-xl">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Progress */}
          {status === 'uploading' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin text-[#8B0000]" />
                  <span className="text-gray-600 font-medium">
                    {lang === 'vi'
                      ? phase === 'compress' ? `Đang nén ảnh ${currentFile + 1}/${files.length}…` : `Đang tải lên ${currentFile + 1}/${files.length}…`
                      : phase === 'compress' ? `Compressing ${currentFile + 1}/${files.length}…`   : `Uploading ${currentFile + 1}/${files.length}…`}
                  </span>
                </span>
                <span className="font-bold text-[#8B0000]">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-colors ${phase === 'compress' ? 'bg-[#D4AF37]' : 'bg-[#8B0000]'}`}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: 0.15 }}
                />
              </div>
              <div className="flex gap-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D4AF37] inline-block" />{lang === 'vi' ? 'Nén ảnh' : 'Compressing'}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8B0000] inline-block" />{lang === 'vi' ? 'Tải lên Firebase' : 'Uploading'}</span>
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-center">
              <p className="text-sm text-emerald-700 font-bold">
                {lang === 'vi' ? '✓ Tải lên thành công!' : '✓ Upload successful!'}
              </p>
              {savedBytes > 0 && (
                <p className="text-xs text-emerald-600 mt-0.5">
                  {lang === 'vi' ? `Đã tiết kiệm ${formatBytes(savedBytes)} dung lượng Firebase` : `Saved ${formatBytes(savedBytes)} of Firebase storage`}
                </p>
              )}
            </div>
          )}

          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{errorMsg}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              {lang === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!files.length || status === 'uploading' || status === 'done'}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition"
              style={{ background: 'linear-gradient(135deg, #8B0000, #c0392b)' }}
            >
              {status === 'uploading'
                ? <><Loader2 size={15} className="animate-spin" /> {lang === 'vi' ? 'Đang tải…' : 'Uploading…'}</>
                : <><Upload size={15} /> {lang === 'vi' ? 'Tải lên' : 'Upload'}</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ── Gallery Page ──────────────────────────────────────────────────────────────
const Gallery = () => {
  const { user }  = useAuth();
  const { i18n }  = useTranslation();
  const lang      = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const isAdmin   = user?.vaiTro === 'admin';

  const { photos, loading, useMock, addPhoto, removePhoto } = useGallery();

  const [yearFilter,  setYearFilter]  = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [search,      setSearch]      = useState('');
  const [showUpload,  setShowUpload]  = useState(false);
  const [lightbox,    setLightbox]    = useState({ open: false, index: 0 });

  const filtered = useMemo(() =>
    photos
      .filter(p => {
        const okYear  = yearFilter  === 'all' || String(p.year) === String(yearFilter);
        const okEvent = eventFilter === 'all' || p.event === eventFilter;
        const okSearch = !search.trim() || p.title?.toLowerCase().includes(search.toLowerCase());
        return okYear && okEvent && okSearch;
      }),
  [photos, yearFilter, eventFilter, search]);

  const openLightbox = useCallback((photo) => {
    const idx = filtered.findIndex(p => p.id === photo.id);
    setLightbox({ open: true, index: Math.max(0, idx) });
  }, [filtered]);

  if (loading) return <LoadingSpinner />;

  return (
    <>
    <Helmet>
      <title>Thư Viện Ảnh | Xứ Đoàn Anrê Phú Yên – Mẫu Tâm</title>
      <meta name="description" content="Thư viện ảnh sinh hoạt, lễ hội và các sự kiện của Xứ Đoàn Mẫu Tâm." />
      <meta property="og:title" content="Thư Viện Ảnh | Mẫu Tâm" />
      <meta property="og:description" content="Thư viện ảnh sinh hoạt, lễ hội và các sự kiện của Xứ Đoàn Mẫu Tâm." />
      <meta property="og:image" content={toAbsoluteUrl(DEFAULT_OG_IMAGE)} />
      <meta property="og:url" content={pageUrl('/thu-vien')} />
      <meta property="og:type" content="website" />
    </Helmet>
    <main
      className="flex-1 min-h-screen bg-page"
      style={{ fontFamily: SANS }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Mock data warning */}
        {useMock && (
          <div className="mb-5 rounded-2xl px-5 py-3 flex items-start gap-3 border"
               style={{ background: '#fef9ec', borderColor: '#e5d5b5' }}>
            <span className="text-[#D4AF37] text-lg shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-semibold text-[#5a1a1a]">
                {lang === 'vi' ? 'Chế độ xem thử — dữ liệu mẫu' : 'Preview mode — sample data'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'vi' ? 'Điền các biến VITE_FIREBASE_* vào .env để kết nối Firebase thật.' : 'Fill in VITE_FIREBASE_* vars in .env to connect real Firebase.'}
              </p>
            </div>
          </div>
        )}

        {/* ── Header: Tiêu đề + Search + Upload ── */}
        <div className="flex items-center gap-3 flex-wrap mb-5">
          <div className="shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]/70 mb-0.5">
              {lang === 'vi' ? 'Xứ Đoàn Anrê Phú Yên' : 'Parish Youth Group'}
            </p>
            <h1
              className="text-2xl font-bold text-[#3d1515] leading-tight"
              style={{ fontFamily: SERIF }}
            >
              {lang === 'vi' ? 'Thư Viện Ảnh' : 'Photo Gallery'}
            </h1>
          </div>

          {/* Search — flex-1, icon absolute, pl-10 tránh đè chữ */}
          <div className="relative flex-1 min-w-52">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: '#D4AF37' }}
            />
            <input
              className="w-full h-10 pl-10 pr-4 text-sm bg-white/80 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 outline-none transition"
              style={{
                borderRadius: '9999px',
                border: '1.5px solid #e5d5b5',
                fontFamily: SANS,
              }}
              onFocus={e => (e.target.style.borderColor = '#D4AF37')}
              onBlur={e  => (e.target.style.borderColor = '#e5d5b5')}
              placeholder={lang === 'vi' ? 'Tìm kiếm ảnh...' : 'Search photos...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Upload button (admin) */}
          {isAdmin && (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition shrink-0"
              style={{ background: 'linear-gradient(135deg, #8B0000, #c0392b)' }}
            >
              <Upload size={14} />
              {lang === 'vi' ? 'Tải ảnh lên' : 'Upload'}
            </button>
          )}
        </div>

        {/* ── Filter bar (pill style) ── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter size={14} className="text-gray-400 shrink-0" />

          {/* Year pills */}
          <div className="flex gap-1.5 flex-wrap">
            {[{ value: 'all', label: lang === 'vi' ? 'Tất cả năm' : 'All years' }, ...YEARS.map(y => ({ value: String(y), label: String(y) }))].map(opt => (
              <button
                key={opt.value}
                onClick={() => setYearFilter(opt.value)}
                className="text-xs px-3.5 py-1.5 rounded-full border font-medium transition-all"
                style={{
                  background: yearFilter === opt.value ? '#8B0000' : 'rgba(255,252,249,0.9)',
                  borderColor: yearFilter === opt.value ? '#8B0000' : '#e5d5b5',
                  color: yearFilter === opt.value ? 'white' : '#5a1a1a',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <span className="text-gray-300 text-sm select-none">|</span>

          {/* Event pills */}
          <div className="flex gap-1.5 flex-wrap">
            {EVENTS.map(ev => (
              <button
                key={ev.value}
                onClick={() => setEventFilter(ev.value)}
                className="text-xs px-3.5 py-1.5 rounded-full border font-medium transition-all"
                style={{
                  background: eventFilter === ev.value ? '#6e1a1a' : 'rgba(255,252,249,0.9)',
                  borderColor: eventFilter === ev.value ? '#6e1a1a' : '#e5d5b5',
                  color: eventFilter === ev.value ? 'white' : '#5a1a1a',
                }}
              >
                {ev.label[lang]}
              </button>
            ))}
          </div>

          {/* Count */}
          <span className="ml-auto text-xs text-gray-400 shrink-0" style={{ fontFamily: SANS }}>
            {lang === 'vi' ? `${filtered.length} / ${photos.length} ảnh` : `${filtered.length} / ${photos.length} photos`}
          </span>
        </div>

        {/* ── Grid ảnh ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <span className="text-6xl block mb-4 opacity-20 select-none">✝</span>
            <p className="text-gray-400 italic" style={{ fontFamily: SERIF }}>
              {lang === 'vi' ? 'Không có ảnh nào phù hợp.' : 'No photos match your filter.'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key="gallery-grid"
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((photo, idx) => (
                  <ImageCard
                    key={photo.id}
                    photo={photo}
                    index={idx}
                    isAdmin={isAdmin}
                    onDelete={removePhoto}
                    onOpen={openLightbox}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onUploaded={(p) => { addPhoto(p); setShowUpload(false); }}
          />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox.open && (
          <Lightbox
            photos={filtered}
            index={lightbox.index}
            onClose={() => setLightbox({ open: false, index: 0 })}
            onGoto={(i) => setLightbox(lb => ({ ...lb, index: i }))}
          />
        )}
      </AnimatePresence>
    </main>
    </>
  );
};

export default Gallery;
