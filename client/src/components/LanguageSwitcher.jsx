import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';

const LANGS = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', short: 'VI' },
  { code: 'en', label: 'English',    flag: '🇺🇸', short: 'EN' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGS.find(l => l.code === i18n.language) || LANGS[0];

  const switchTo = (code) => { i18n.changeLanguage(code); setOpen(false); };

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Chọn ngôn ngữ"
        className="flex items-center gap-1.5 h-8 px-2 rounded-lg transition-all duration-200 hover:bg-white/12 active:scale-95"
      >
        <span className="text-base leading-none select-none">{current.flag}</span>
        <span className="text-[12px] font-semibold text-white/75 tracking-wide hidden sm:block">
          {current.short}
        </span>
        <ChevronDown
          size={11}
          strokeWidth={2.5}
          className="text-white/40 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-1.5 w-40 rounded-xl overflow-hidden z-50"
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            {LANGS.map((lang, i) => {
              const active = lang.code === i18n.language;
              return (
                <button
                  key={lang.code}
                  onClick={() => switchTo(lang.code)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors
                    ${i > 0 ? 'border-t border-gray-100' : ''}
                    ${active
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span className={`flex-1 text-left ${active ? 'font-semibold' : 'font-medium'}`}>
                    {lang.label}
                  </span>
                  {active && (
                    <Check size={13} strokeWidth={2.5} className="text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
