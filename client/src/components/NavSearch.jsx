/**
 * NavSearch — Thanh tìm kiếm thông minh trên Navbar
 * Tìm: navigation shortcuts + Posts + Classes + Students
 * Keyboard: ArrowUp/Down, Enter, Escape
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Newspaper, BookOpen, User, Navigation } from 'lucide-react';
import api from '../services/api';

// ── Navigation shortcuts (client-side, instant) ──────────────────────────────
const NAV_SHORTCUTS = [
  { keywords: ['giờ lễ','lịch lễ','lễ','giờ','misa','chúa nhật','sunday'], label: 'Giờ Lễ', to: '/gio-le', icon: '🕯️' },
  { keywords: ['tin tức','tin','thông báo','news','bài viết'], label: 'Tin Tức', to: '/tin-tuc', icon: '📰' },
  { keywords: ['thư viện','ảnh','gallery','hình','photo'], label: 'Thư Viện Ảnh', to: '/thu-vien', icon: '🖼️' },
  { keywords: ['lịch sử','cứu độ','kinh thánh','bible','lịch sử cứu'], label: 'Lịch Sử Cứu Độ', to: '/lich-su-cuu-do', icon: '📜' },
  { keywords: ['lớp','lớp học','đoàn sinh','nghĩa sĩ','hiệp sĩ','thiếu nhi','ấu nhi','chiên non'], label: 'Lớp Học', to: '/lop-hoc', icon: '📚' },
  { keywords: ['lời chúa','kinh thánh hôm nay','bài đọc'], label: 'Lời Chúa', to: '/loi-chua', icon: '✝️' },
  { keywords: ['nhân vật','thánh','tổ phụ','character'], label: 'Nhân Vật Kinh Thánh', to: '/nhan-vat', icon: '👤' },
];

function matchShortcuts(q) {
  if (!q) return [];
  const low = q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return NAV_SHORTCUTS.filter(s =>
    s.keywords.some(k => {
      const kn = k.normalize('NFD').replace(/[̀-ͯ]/g, '');
      return kn.includes(low) || low.includes(kn);
    })
  ).slice(0, 3);
}

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, ms) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return dv;
}

// ── NavSearch component ───────────────────────────────────────────────────────
export default function NavSearch() {
  const navigate  = useNavigate();
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState({ posts: [], classes: [], students: [] });
  const [loading, setLoading] = useState(false);
  const [active,  setActive]  = useState(-1); // keyboard focus index
  const inputRef  = useRef(null);
  const wrapRef   = useRef(null);
  const debouncedQ = useDebounce(query, 200);

  // Đóng khi click ngoài
  useEffect(() => {
    const h = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Fetch từ server khi query thay đổi
  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) {
      setResults({ posts: [], classes: [], students: [] });
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.get(`/search/global?q=${encodeURIComponent(debouncedQ)}`)
      .then(r => { if (!cancelled) setResults(r.data.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQ]);

  const shortcuts = matchShortcuts(query);

  // Flatten tất cả items để keyboard nav
  const allItems = [
    ...shortcuts.map(s => ({ type: 'nav', ...s })),
    ...results.posts.map(p => ({ type: 'post', label: p.tieuDe, to: `/tin-tuc/${p._id}`, sub: p.tomTat })),
    ...results.classes.map(c => ({ type: 'class', label: c.tenLop, to: `/lop-hoc`, sub: c.nhanh })),
    ...results.students.map(s => ({ type: 'student', label: `${s.tenThanh} ${s.hoTen}`, to: '/lop-hoc', sub: 'Đoàn sinh' })),
  ];

  const go = useCallback((to) => {
    setOpen(false);
    setQuery('');
    setActive(-1);
    navigate(to);
  }, [navigate]);

  const handleKey = (e) => {
    if (!open) return;
    if (e.key === 'Escape') { setOpen(false); setQuery(''); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, allItems.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && active >= 0 && allItems[active]) go(allItems[active].to);
  };

  const hasResults = shortcuts.length > 0 || results.posts.length > 0 || results.classes.length > 0 || results.students.length > 0;

  const typeIcon = (type) => {
    if (type === 'nav')     return <Navigation size={13} className="text-amber-400 shrink-0" />;
    if (type === 'post')    return <Newspaper  size={13} className="text-blue-400 shrink-0" />;
    if (type === 'class')   return <BookOpen   size={13} className="text-green-400 shrink-0" />;
    if (type === 'student') return <User       size={13} className="text-purple-400 shrink-0" />;
  };

  let itemIdx = 0;

  return (
    <div ref={wrapRef} className="relative">
      {/* Search trigger / input */}
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1.5 cursor-text transition-all"
        style={{
          background: open ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.10)',
          border: `1px solid ${open ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)'}`,
          width: open ? 220 : 160,
          transition: 'width 0.3s ease, background 0.2s, border 0.2s',
        }}
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
      >
        <Search size={14} className="text-white/60 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Tìm kiếm..."
          className="bg-transparent outline-none text-white text-sm placeholder-white/40 flex-1 min-w-0"
        />
        {query && (
          <button onClick={(e) => { e.stopPropagation(); setQuery(''); setActive(-1); inputRef.current?.focus(); }}>
            <X size={13} className="text-white/50 hover:text-white transition" />
          </button>
        )}
        {loading && (
          <div className="w-3 h-3 border-2 border-white/30 border-t-white/80 rounded-full animate-spin shrink-0" />
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && query.length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden shadow-2xl z-[300]"
            style={{
              width: 320,
              background: 'rgba(12,6,6,0.96)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {!hasResults && !loading && query.length >= 2 && (
              <p className="px-4 py-3 text-sm text-white/40 text-center">
                Không tìm thấy kết quả cho "<span className="text-white/60">{query}</span>"
              </p>
            )}

            {/* Navigation shortcuts */}
            {shortcuts.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-white/30">Điều hướng</p>
                {shortcuts.map(s => {
                  const idx = itemIdx++;
                  return (
                    <button key={s.to} onClick={() => go(s.to)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition"
                      style={{ background: active === idx ? 'rgba(255,255,255,0.08)' : 'transparent' }}
                      onMouseEnter={() => setActive(idx)}
                    >
                      <span className="text-base shrink-0">{s.icon}</span>
                      <span className="text-sm font-semibold text-white/90">{s.label}</span>
                      <Navigation size={11} className="ml-auto text-amber-400/60 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Posts */}
            {results.posts.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-white/30">Tin Tức</p>
                {results.posts.map(p => {
                  const idx = itemIdx++;
                  return (
                    <button key={p._id} onClick={() => go(`/tin-tuc/${p._id}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition"
                      style={{ background: active === idx ? 'rgba(255,255,255,0.08)' : 'transparent' }}
                      onMouseEnter={() => setActive(idx)}
                    >
                      {typeIcon('post')}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white/90 truncate">{p.tieuDe}</p>
                        {p.tomTat && <p className="text-[11px] text-white/35 truncate">{p.tomTat}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Classes */}
            {results.classes.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-white/30">Lớp Học</p>
                {results.classes.map(c => {
                  const idx = itemIdx++;
                  return (
                    <button key={c._id} onClick={() => go('/lop-hoc')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition"
                      style={{ background: active === idx ? 'rgba(255,255,255,0.08)' : 'transparent' }}
                      onMouseEnter={() => setActive(idx)}
                    >
                      {typeIcon('class')}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white/90 truncate">{c.tenLop}</p>
                        <p className="text-[11px] text-white/35">{c.nhanh}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Students */}
            {results.students.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-white/30">Đoàn Sinh</p>
                {results.students.map(s => {
                  const idx = itemIdx++;
                  return (
                    <button key={s._id} onClick={() => go('/lop-hoc')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition"
                      style={{ background: active === idx ? 'rgba(255,255,255,0.08)' : 'transparent' }}
                      onMouseEnter={() => setActive(idx)}
                    >
                      {typeIcon('student')}
                      <span className="text-sm text-white/90 truncate">{s.tenThanh} {s.hoTen}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="px-4 py-2 border-t border-white/5">
              <p className="text-[10px] text-white/20 text-center">↑↓ điều hướng · Enter chọn · Esc đóng</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
