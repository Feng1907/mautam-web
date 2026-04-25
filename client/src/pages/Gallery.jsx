import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/AuthContext';
import {
  Upload, Download, Trash2, Filter, X, ChevronLeft, ChevronRight,
  ImageIcon, ZoomIn,
} from 'lucide-react';

// ─── Dữ liệu mẫu ─────────────────────────────────────────────────────────────
// Thay url bằng ảnh thực khi có. Hiện tại dùng ảnh placeholder có sẵn.
const INITIAL_PHOTOS = [
  { id: 1,  url: '/images/DAP_2149.jpg', title: 'Thánh lễ Phục Sinh 2025',   event: 'phuc-sinh', year: 2025, timestamp: '2025-04-20' },
  { id: 2,  url: '/images/DAP_2149.jpg', title: 'Rước Kiệu Phục Sinh',        event: 'phuc-sinh', year: 2025, timestamp: '2025-04-20' },
  { id: 3,  url: '/images/DAP_2149.jpg', title: 'Trại Hè Thiếu Nhi 2025',    event: 'trai-he',   year: 2025, timestamp: '2025-07-15' },
  { id: 4,  url: '/images/DAP_2149.jpg', title: 'Lửa Trại Đêm Hè',           event: 'trai-he',   year: 2025, timestamp: '2025-07-16' },
  { id: 5,  url: '/images/DAP_2149.jpg', title: 'Lễ Dâng Hoa Đức Mẹ',        event: 'dang-hoa',  year: 2025, timestamp: '2025-05-15' },
  { id: 6,  url: '/images/DAP_2149.jpg', title: 'Rước Kiệu Đức Mẹ',          event: 'dang-hoa',  year: 2025, timestamp: '2025-05-15' },
  { id: 7,  url: '/images/DAP_2149.jpg', title: 'Thánh Lễ Giáng Sinh 2024',  event: 'giang-sinh', year: 2024, timestamp: '2024-12-25' },
  { id: 8,  url: '/images/DAP_2149.jpg', title: 'Hang Đá Giáng Sinh',        event: 'giang-sinh', year: 2024, timestamp: '2024-12-24' },
  { id: 9,  url: '/images/DAP_2149.jpg', title: 'Trại Hè 2024',              event: 'trai-he',   year: 2024, timestamp: '2024-07-20' },
  { id: 10, url: '/images/DAP_2149.jpg', title: 'Bế Mạc Trại Hè 2024',      event: 'trai-he',   year: 2024, timestamp: '2024-07-22' },
  { id: 11, url: '/images/DAP_2149.jpg', title: 'Lễ Quan Thầy Anrê Phú Yên', event: 'le-quan-thay', year: 2024, timestamp: '2024-07-26' },
  { id: 12, url: '/images/DAP_2149.jpg', title: 'Sinh Hoạt Cuối Năm',        event: 'sinh-hoat', year: 2024, timestamp: '2024-12-15' },
];

const EVENTS = [
  { value: 'all',         label: { vi: 'Tất cả sự kiện', en: 'All events'       } },
  { value: 'phuc-sinh',   label: { vi: 'Phục Sinh',       en: 'Easter'           } },
  { value: 'giang-sinh',  label: { vi: 'Giáng Sinh',      en: 'Christmas'        } },
  { value: 'trai-he',     label: { vi: 'Trại Hè',         en: 'Summer Camp'      } },
  { value: 'dang-hoa',    label: { vi: 'Dâng Hoa',        en: 'Flower Offering'  } },
  { value: 'le-quan-thay',label: { vi: 'Lễ Quan Thầy',   en: 'Patron Feast'     } },
  { value: 'sinh-hoat',   label: { vi: 'Sinh Hoạt',       en: 'Activities'       } },
];

const YEARS = ['all', 2025, 2024, 2023];

// ─── GalleryHeader ────────────────────────────────────────────────────────────
const GalleryHeader = ({ yearFilter, setYearFilter, eventFilter, setEventFilter, totalShown, totalAll }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'vi';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === 'vi' ? 'Thư Viện Ảnh' : 'Photo Gallery'}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {lang === 'vi'
            ? `Hiển thị ${totalShown} / ${totalAll} ảnh`
            : `Showing ${totalShown} of ${totalAll} photos`}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-gray-400 shrink-0" />
        {/* Năm */}
        <select
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer"
        >
          <option value="all">{lang === 'vi' ? 'Tất cả năm' : 'All years'}</option>
          {YEARS.filter(y => y !== 'all').map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {/* Sự kiện */}
        <select
          value={eventFilter}
          onChange={e => setEventFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer"
        >
          {EVENTS.map(ev => (
            <option key={ev.value} value={ev.value}>{ev.label[lang]}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ─── UploadZone ───────────────────────────────────────────────────────────────
const UploadZone = ({ onUpload }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => {
    if (!files?.length) return;
    setUploading(true);
    setProgress(0);
    // Simulate upload progress
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
          onUpload(files);
        }, 400);
      }
      setProgress(Math.min(p, 100));
    }, 120);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      className={[
        'border-2 border-dashed rounded-2xl p-6 text-center transition-all mb-6',
        dragOver ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-red-300',
      ].join(' ')}
    >
      <input ref={inputRef} type="file" multiple accept="image/*" className="hidden"
        onChange={e => handleFiles(e.target.files)} />

      {uploading ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">
            {lang === 'vi' ? 'Đang tải lên…' : 'Uploading…'} {Math.round(progress)}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <Upload size={28} className="text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-gray-500 mb-1">
            {lang === 'vi' ? 'Kéo thả ảnh vào đây' : 'Drag & drop photos here'}
          </p>
          <p className="text-xs text-gray-400 mb-3">
            {lang === 'vi' ? 'hoặc' : 'or'}
          </p>
          <button
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            <Upload size={14} />
            {lang === 'vi' ? 'Chọn ảnh' : 'Browse files'}
          </button>
        </>
      )}
    </div>
  );
};

// ─── ImageCard ────────────────────────────────────────────────────────────────
const ImageCard = ({ photo, isAdmin, onDelete, onOpen }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const [hovered, setHovered] = useState(false);

  const handleDownload = (e) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = photo.title + '.jpg';
    a.click();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(lang === 'vi' ? `Xóa ảnh "${photo.title}"?` : `Delete "${photo.title}"?`)) {
      onDelete(photo.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.25 }}
      className="group relative rounded-2xl overflow-hidden bg-gray-100 cursor-pointer shadow-sm hover:shadow-lg transition-shadow"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(photo)}
    >
      {/* Image */}
      <div className="aspect-square">
        <img
          src={photo.url}
          alt={photo.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Overlay */}
      <div className={`absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`} />

      {/* Info bar bottom */}
      <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
        <p className="text-white text-xs font-semibold leading-tight truncate">{photo.title}</p>
        <p className="text-white/60 text-[10px] mt-0.5">{photo.timestamp}</p>
      </div>

      {/* Zoom icon center */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <ZoomIn size={18} className="text-white" />
        </div>
      </div>

      {/* Action buttons top-right */}
      <div
        className={`absolute top-2 right-2 flex gap-1.5 transition-all duration-300 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
        onClick={e => e.stopPropagation()}
      >
        {isAdmin ? (
          <button
            onClick={handleDelete}
            className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-md transition"
            title={lang === 'vi' ? 'Xóa ảnh' : 'Delete'}
          >
            <Trash2 size={13} className="text-white" />
          </button>
        ) : (
          <button
            onClick={handleDownload}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition"
            title={lang === 'vi' ? 'Tải về' : 'Download'}
          >
            <Download size={13} className="text-gray-700" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ photos, currentIndex, onClose, onPrev, onNext }) => {
  const photo = photos[currentIndex];
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'vi';

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = photo.title + '.jpg';
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0" onClick={e => e.stopPropagation()}>
        <div>
          <p className="text-white font-semibold text-sm">{photo.title}</p>
          <p className="text-white/50 text-xs mt-0.5">{currentIndex + 1} / {photos.length} · {photo.timestamp}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition"
          >
            <Download size={13} />
            {lang === 'vi' ? 'Tải về' : 'Download'}
          </button>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center px-4 relative" onClick={e => e.stopPropagation()}>
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="absolute left-2 sm:left-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 disabled:opacity-20 flex items-center justify-center text-white transition z-10"
        >
          <ChevronLeft size={22} />
        </button>

        <AnimatePresence mode="wait">
          <motion.img
            key={photo.id}
            src={photo.url}
            alt={photo.title}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
          />
        </AnimatePresence>

        <button
          onClick={onNext}
          disabled={currentIndex === photos.length - 1}
          className="absolute right-2 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 disabled:opacity-20 flex items-center justify-center text-white transition z-10"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Thumbnail strip */}
      <div className="shrink-0 px-4 py-3 flex gap-2 overflow-x-auto" onClick={e => e.stopPropagation()}>
        {photos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => { /* handled by parent */ onPrev(); onNext(); }}
            className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
              i === currentIndex ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'
            }`}
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
  const { user } = useAuth();
  const isAdmin = user?.vaiTro === 'admin';

  const [photos, setPhotos]           = useState(INITIAL_PHOTOS);
  const [yearFilter, setYearFilter]   = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [lightbox, setLightbox]       = useState({ open: false, index: 0 });

  // Lọc ảnh
  const filtered = photos.filter(p => {
    const matchYear  = yearFilter  === 'all' || String(p.year)  === String(yearFilter);
    const matchEvent = eventFilter === 'all' || p.event === eventFilter;
    return matchYear && matchEvent;
  });

  const openLightbox = useCallback((photo) => {
    const idx = filtered.findIndex(p => p.id === photo.id);
    setLightbox({ open: true, index: idx });
  }, [filtered]);

  const closeLightbox = () => setLightbox({ open: false, index: 0 });
  const prevPhoto = () => setLightbox(lb => ({ ...lb, index: Math.max(0, lb.index - 1) }));
  const nextPhoto = () => setLightbox(lb => ({ ...lb, index: Math.min(filtered.length - 1, lb.index + 1) }));

  // Keyboard navigation
  const handleKey = useCallback((e) => {
    if (!lightbox.open) return;
    if (e.key === 'ArrowLeft')  prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'Escape')     closeLightbox();
  }, [lightbox.open]);

  const deletePhoto = (id) => setPhotos(prev => prev.filter(p => p.id !== id));

  const handleUpload = (files) => {
    const newPhotos = Array.from(files).map((f, i) => ({
      id: Date.now() + i,
      url: URL.createObjectURL(f),
      title: f.name.replace(/\.[^/.]+$/, ''),
      event: eventFilter !== 'all' ? eventFilter : 'sinh-hoat',
      year: new Date().getFullYear(),
      timestamp: new Date().toISOString().slice(0, 10),
    }));
    setPhotos(prev => [...newPhotos, ...prev]);
  };

  return (
    <main className="flex-1 bg-gray-50 min-h-screen" onKeyDown={handleKey} tabIndex={-1}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <GalleryHeader
          yearFilter={yearFilter}   setYearFilter={setYearFilter}
          eventFilter={eventFilter} setEventFilter={setEventFilter}
          totalShown={filtered.length} totalAll={photos.length}
        />

        {/* Upload zone — admin only */}
        {isAdmin && <UploadZone onUpload={handleUpload} />}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ImageIcon size={48} className="text-gray-200 mb-4" strokeWidth={1} />
            <p className="text-gray-400 font-medium">Không có ảnh nào phù hợp.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <AnimatePresence>
              {filtered.map(photo => (
                <ImageCard
                  key={photo.id}
                  photo={photo}
                  isAdmin={isAdmin}
                  onDelete={deletePhoto}
                  onOpen={openLightbox}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox.open && (
          <Lightbox
            photos={filtered}
            currentIndex={lightbox.index}
            onClose={closeLightbox}
            onPrev={prevPhoto}
            onNext={nextPhoto}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default Gallery;
