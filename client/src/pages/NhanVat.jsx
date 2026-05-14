import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CharacterCollection from '../components/CharacterCollection';

export default function NhanVat() {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: 'linear-gradient(180deg, #020609 0%, #050810 60%, #020609 100%)' }}
    >
      {/* Watermark cross */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-[0.018]" aria-hidden>
        <svg width="420" height="420" viewBox="0 0 100 100" fill="none">
          <rect x="44" y="5" width="12" height="90" rx="6" fill="#D4AF37" />
          <rect x="10" y="28" width="80" height="12" rx="6" fill="#D4AF37" />
        </svg>
      </div>

      {/* ── Header ── */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 pt-12 pb-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <Link
          to="/lich-su-cuu-do"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium mb-6 transition-colors hover:opacity-80"
          style={{ color: 'rgba(212,175,55,0.6)' }}
        >
          <ArrowLeft size={13} />
          Lịch sử Cứu độ
        </Link>

        <p className="text-[10px] uppercase tracking-[0.28em] mb-2" style={{ color: 'rgba(212,175,55,0.5)' }}>
          Giáo lý Xứ Đoàn · Anrê Phú Yên
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold mb-2 leading-tight"
          style={{
            fontFamily: '"Lexend", "Playfair Display", "EB Garamond", Georgia, serif',
            background: 'linear-gradient(135deg, #D4AF37 0%, #FFE566 45%, #CD853F 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Nhân vật tiêu biểu
        </h1>
        <p className="text-slate-500 max-w-lg text-sm leading-relaxed">
          9 nhân vật từ Abraham đến Thánh Phaolô — mỗi người là một mắt xích
          trong chuỗi Lịch sử Cứu độ của Thiên Chúa.
        </p>
      </motion.div>

      {/* ── CharacterCollection — 3×3 grid, filter, progress ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
        <CharacterCollection />
      </div>
    </div>
  );
}
