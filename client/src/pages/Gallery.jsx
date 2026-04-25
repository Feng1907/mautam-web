import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/AuthContext';
import {
  Upload, Download, Trash2, Filter, X,
  ChevronLeft, ChevronRight, ImageIcon, ZoomIn, Loader2,
} from 'lucide-react';
import { fetchPhotos, uploadPhoto, deletePhoto, formatBytes } from '../services/galleryService';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── Cấu hình sự kiện & năm ──────────────────────────────────────────────────
export const EVENTS = [
  { value: 'all',          label: { vi: 'Tất cả sự kiện',  en: 'All events'       } },
  { value: 'phuc-sinh',    label: { vi: 'Phục Sinh',        en: 'Easter'           } },
  { value: 'giang-sinh',   label: { vi: 'Giáng Sinh',       en: 'Christmas'        } },
  { value: 'trai-he',      label: { vi: 'Trại Hè',          en: 'Summer Camp'      } },
  { value: 'dang-hoa',     label: { vi: 'Dâng Hoa',         en: 'Flower Offering'  } },
  { value: 'le-quan-thay', label: { vi: 'Lễ Quan Thầy',    en: 'Patron Feast'     } },
  { value: 'sinh-hoat',    label: { vi: 'Sinh Hoạt',        en: 'Activities'       } },
];

const YEARS = [2026, 2025, 2024, 2023];

// ─── Dữ liệu fallback khi Firebase chưa cấu hình ─────────────────────────────
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

// ─── useGallery hook ──────────────────────────────────────────────────────────
const useGallery = () => {
  const [photos,  setPhotos]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    fetchPhotos()
      .then(data => {
        if (data.length === 0) {
          // Firestore rỗng — dùng mock để trình bày
          setPhotos(MOCK_PHOTOS);
          setUseMock(true);
        } else {
          setPhotos(data);
        }
      })
      .catch(() => {
        // Firebase chưa cấu hình — fallback mock
        setPhotos(MOCK_PHOTOS);
        setUseMock(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const addPhoto  = (p) => setPhotos(prev => [p, ...prev]);
  const removePhoto = (id) => setPhotos(prev => prev.filter(p => p.id !== id));

  return { photos, loading, useMock, addPhoto, removePhoto };
};

// ─── GalleryHeader ────────────────────────────────────────────────────────────
const GalleryHeader = ({ yearFilter, setYearFilter, eventFilter, setEventFilter, totalShown, totalAll }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'vi';

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-0.5">
          {lang === 'vi' ? 'Xứ Đoàn Anrê Phú Yên' : 'Parish Youth Group'}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === 'vi' ? 'Thư Viện Ảnh' : 'Photo Gallery'}
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {lang === 'vi'
            ? `Hiển thị ${totalShown} / ${totalAll} ảnh`
            : `Showing ${totalShown} of ${totalAll} photos`}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-gray-400 shrink-0" />
        <select
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer shadow-sm"
        >
          <option value="all">{lang === 'vi' ? 'Tất cả năm' : 'All years'}</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={eventFilter}
          onChange={e => setEventFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer shadow-sm"
        >
          {EVENTS.map(ev => (
            <option key={ev.value} value={ev.value}>{ev.label[lang]}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ─── UploadModal ──────────────────────────────────────────────────────────────
const UploadModal = ({ onClose, onUploaded }) => {
  const { i18n } = useTranslation();
  const lang     = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const inputRef = useRef(null);

  const [files,       setFiles]       = useState([]);
  const [previews,    setPreviews]    = useState([]);
  const [fileSizes,   setFileSizes]   = useState([]); // dung lượng gốc từng file
  const [title,       setTitle]       = useState('');
  const [event,       setEvent]       = useState('sinh-hoat');
  const [year,        setYear]        = useState(new Date().getFullYear());
  const [progress,    setProgress]    = useState(0);
  const [phase,       setPhase]       = useState('compress'); // 'compress' | 'upload'
  const [currentFile, setCurrentFile] = useState(0);         // index file đang xử lý
  const [savedBytes,  setSavedBytes]  = useState(0);         // tổng dung lượng đã tiết kiệm
  const [status,      setStatus]      = useState('idle');     // idle | uploading | done | error
  const [dragOver,    setDragOver]    = useState(false);
  const [errorMsg,    setErrorMsg]    = useState('');

  const handleFiles = (incoming) => {
    const arr = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return;
    setFiles(arr);
    setFileSizes(arr.map(f => f.size));
    setPreviews(arr.map(f => URL.createObjectURL(f)));
    if (!title) setTitle(arr[0].name.replace(/\.[^/.]+$/, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) return;
    setStatus('uploading');
    setProgress(0);
    setCurrentFile(0);
    setSavedBytes(0);
    setErrorMsg('');

    try {
      const uploaded = [];
      let totalSaved = 0;

      for (let i = 0; i < files.length; i++) {
        setCurrentFile(i);
        const photo = await uploadPhoto({
          file:  files[i],
          title: files.length === 1 ? title : `${title} ${i + 1}`,
          event,
          year,
          onProgress: (pct, ph) => {
            setPhase(ph);
            // Tính progress tổng: mỗi file chiếm 100/n phần
            const perFile = 100 / files.length;
            setProgress(Math.round(i * perFile + (pct / 100) * perFile));
          },
        });
        totalSaved += (photo.originalSize || 0) - (photo.compressedSize || 0);
        setSavedBytes(totalSaved);
        uploaded.push(photo);
      }

      setProgress(100);
      setStatus('done');
      uploaded.forEach(p => onUploaded(p));
      setTimeout(onClose, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg(lang === 'vi'
        ? 'Upload thất bại. Kiểm tra cấu hình Firebase và thử lại.'
        : 'Upload failed. Check Firebase config and try again.');
      setStatus('error');
    }
  };

  const totalOriginal = fileSizes.reduce((s, b) => s + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', damping: 22 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-800">
              {lang === 'vi' ? 'Tải ảnh lên' : 'Upload Photos'}
            </h2>
            {files.length > 0 && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                {files.length} {lang === 'vi' ? 'ảnh' : 'photo(s)'} · {formatBytes(totalOriginal)}
                {' · '}
                <span className="text-green-600 font-semibold">
                  {lang === 'vi' ? 'Sẽ tự nén → ~500 KB/ảnh' : 'Auto-compress → ~500 KB each'}
                </span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => status === 'idle' && inputRef.current?.click()}
            className={[
              'border-2 border-dashed rounded-2xl p-5 text-center transition-all',
              status !== 'idle' ? 'cursor-default' : 'cursor-pointer',
              dragOver ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-red-300 hover:bg-gray-50',
            ].join(' ')}
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
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                    +{previews.length - 6}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Upload size={28} className="text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm font-semibold text-gray-500">
                  {lang === 'vi' ? 'Kéo & thả ảnh vào đây' : 'Drag & drop photos here'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === 'vi' ? 'hoặc click để chọn' : 'or click to browse'}
                </p>
              </>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={lang === 'vi' ? 'Tên ảnh / tiêu đề' : 'Photo title'}
              className="input"
            />
            <div className="grid grid-cols-2 gap-3">
              <select value={event} onChange={e => setEvent(e.target.value)} className="input">
                {EVENTS.filter(ev => ev.value !== 'all').map(ev => (
                  <option key={ev.value} value={ev.value}>{ev.label[lang]}</option>
                ))}
              </select>
              <select value={year} onChange={e => setYear(Number(e.target.value))} className="input">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Progress — 2 giai đoạn: nén + upload */}
          {status === 'uploading' && (
            <div className="space-y-2">
              {/* Phase label */}
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin text-red-500" />
                  <span className="text-gray-600 font-medium">
                    {lang === 'vi'
                      ? phase === 'compress'
                        ? `Đang nén ảnh ${currentFile + 1}/${files.length}…`
                        : `Đang tải lên ${currentFile + 1}/${files.length}…`
                      : phase === 'compress'
                        ? `Compressing ${currentFile + 1}/${files.length}…`
                        : `Uploading ${currentFile + 1}/${files.length}…`}
                  </span>
                </span>
                <span className="font-bold text-red-600">{progress}%</span>
              </div>

              {/* Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-colors ${phase === 'compress' ? 'bg-amber-400' : 'bg-red-500'}`}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: 0.15 }}
                />
              </div>

              {/* Phase legend */}
              <div className="flex gap-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  {lang === 'vi' ? 'Nén ảnh' : 'Compressing'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  {lang === 'vi' ? 'Tải lên Firebase' : 'Uploading'}
                </span>
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
              <p className="text-sm text-green-700 font-bold">
                {lang === 'vi' ? '✓ Tải lên thành công!' : '✓ Upload successful!'}
              </p>
              {savedBytes > 0 && (
                <p className="text-xs text-green-600 mt-0.5">
                  {lang === 'vi'
                    ? `Đã tiết kiệm ${formatBytes(savedBytes)} dung lượng Firebase`
                    : `Saved ${formatBytes(savedBytes)} of Firebase storage`}
                </p>
              )}
            </div>
          )}

          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {errorMsg}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 btn-ghost rounded-xl py-2.5">
              {lang === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!files.length || status === 'uploading' || status === 'done'}
              className="flex-1 btn-primary rounded-xl py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
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

// ─── ImageCard ────────────────────────────────────────────────────────────────
const ImageCard = ({ photo, isAdmin, onDelete, onOpen }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const [deleting, setDeleting] = useState(false);

  const handleDownload = (e) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `${photo.title}.jpg`;
    a.target = '_blank';
    a.click();
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const msg = lang === 'vi' ? `Xóa ảnh "${photo.title}"?` : `Delete "${photo.title}"?`;
    if (!window.confirm(msg)) return;
    setDeleting(true);
    try {
      await deletePhoto({ id: photo.id, storagePath: photo.storagePath });
      onDelete(photo.id);
    } catch {
      setDeleting(false);
      alert(lang === 'vi' ? 'Xóa thất bại.' : 'Delete failed.');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: deleting ? 0 : 1, scale: deleting ? 0.85 : 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.22 }}
      className="group relative rounded-2xl overflow-hidden bg-gray-100 cursor-pointer aspect-square shadow-sm hover:shadow-xl transition-shadow"
      onClick={() => onOpen(photo)}
    >
      <img
        src={photo.url}
        alt={photo.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <p className="text-white text-xs font-semibold leading-tight truncate">{photo.title}</p>
        <p className="text-white/55 text-[10px] mt-0.5">{photo.timestamp}</p>
      </div>

      {/* Zoom hint */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <ZoomIn size={18} className="text-white" />
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300"
        onClick={e => e.stopPropagation()}
      >
        {isAdmin ? (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-50 flex items-center justify-center shadow-lg transition"
            title={lang === 'vi' ? 'Xóa ảnh' : 'Delete'}
          >
            {deleting ? <Loader2 size={12} className="text-white animate-spin" /> : <Trash2 size={13} className="text-white" />}
          </button>
        ) : (
          <button
            onClick={handleDownload}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition"
            title={lang === 'vi' ? 'Tải về' : 'Download'}
          >
            <Download size={13} className="text-gray-700" />
          </button>
        )}
      </div>

      {/* Admin download button (thêm ngoài delete) */}
      {isAdmin && (
        <div
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={handleDownload}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg transition"
            title={lang === 'vi' ? 'Tải về' : 'Download'}
          >
            <Download size={13} className="text-gray-700" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ photos, index, onClose, onGoto }) => {
  const { i18n } = useTranslation();
  const lang  = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const photo = photos[index];
  const thumbsRef = useRef(null);

  // Scroll thumbnail vào view
  useEffect(() => {
    thumbsRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
  }, [index]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  onGoto(Math.max(0, index - 1));
      if (e.key === 'ArrowRight') onGoto(Math.min(photos.length - 1, index + 1));
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index, photos.length, onGoto, onClose]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `${photo.title}.jpg`;
    a.target = '_blank';
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/96 flex flex-col select-none"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div>
          <p className="text-white font-semibold text-sm">{photo.title}</p>
          <p className="text-white/45 text-xs">{index + 1} / {photos.length} · {photo.timestamp}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition"
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
          onClick={() => onGoto(index - 1)}
          disabled={index === 0}
          className="absolute left-3 sm:left-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 disabled:opacity-20 flex items-center justify-center text-white transition"
        >
          <ChevronLeft size={22} />
        </button>

        <AnimatePresence mode="wait">
          <motion.img
            key={photo.id}
            src={photo.url}
            alt={photo.title}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="max-h-[72vh] max-w-full object-contain rounded-2xl shadow-2xl"
          />
        </AnimatePresence>

        <button
          onClick={() => onGoto(index + 1)}
          disabled={index === photos.length - 1}
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
            key={p.id}
            onClick={() => onGoto(i)}
            className={[
              'shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all',
              i === index ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70',
            ].join(' ')}
          >
            <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Gallery Page ─────────────────────────────────────────────────────────────
const Gallery = () => {
  const { user }  = useAuth();
  const { i18n }  = useTranslation();
  const lang      = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const isAdmin   = user?.vaiTro === 'admin';

  const { photos, loading, useMock, addPhoto, removePhoto } = useGallery();

  const [yearFilter,    setYearFilter]    = useState('all');
  const [eventFilter,   setEventFilter]   = useState('all');
  const [showUpload,    setShowUpload]    = useState(false);
  const [lightbox,      setLightbox]      = useState({ open: false, index: 0 });

  // Filter
  const filtered = photos.filter(p => {
    const okYear  = yearFilter  === 'all' || String(p.year)  === String(yearFilter);
    const okEvent = eventFilter === 'all' || p.event === eventFilter;
    return okYear && okEvent;
  });

  const openLightbox = useCallback((photo) => {
    const idx = filtered.findIndex(p => p.id === photo.id);
    setLightbox({ open: true, index: Math.max(0, idx) });
  }, [filtered]);

  if (loading) return <LoadingSpinner />;

  return (
    <main className="flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Mock data warning */}
        {useMock && (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-start gap-3">
            <span className="text-amber-500 text-lg shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {lang === 'vi' ? 'Chế độ xem thử — dữ liệu mẫu' : 'Preview mode — sample data'}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {lang === 'vi'
                  ? 'Điền các biến VITE_FIREBASE_* vào .env để kết nối Firebase thật.'
                  : 'Fill in VITE_FIREBASE_* vars in .env to connect real Firebase.'}
              </p>
            </div>
          </div>
        )}

        <GalleryHeader
          yearFilter={yearFilter}   setYearFilter={setYearFilter}
          eventFilter={eventFilter} setEventFilter={setEventFilter}
          totalShown={filtered.length} totalAll={photos.length}
        />

        {/* Admin toolbar */}
        {isAdmin && (
          <div className="flex items-center justify-between mb-5 bg-white rounded-2xl border border-gray-100 px-5 py-3 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">
              {lang === 'vi' ? 'Khu vực quản trị' : 'Admin area'}
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary flex items-center gap-2 rounded-xl py-2 px-4"
            >
              <Upload size={14} />
              {lang === 'vi' ? 'Tải ảnh lên' : 'Upload photos'}
            </button>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <ImageIcon size={52} className="text-gray-200 mb-4" strokeWidth={1} />
            <p className="text-gray-400 font-semibold">
              {lang === 'vi' ? 'Không có ảnh nào phù hợp.' : 'No photos match your filter.'}
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          >
            <AnimatePresence>
              {filtered.map(photo => (
                <ImageCard
                  key={photo.id}
                  photo={photo}
                  isAdmin={isAdmin}
                  onDelete={removePhoto}
                  onOpen={openLightbox}
                />
              ))}
            </AnimatePresence>
          </motion.div>
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
  );
};

export default Gallery;
