import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown } from 'lucide-react';

// ─── Dữ liệu Tiên tri & Ứng nghiệm ──────────────────────────────────────────
const PROPHECIES = [
  {
    id: 'bethlehem',
    category: 'Giáng sinh',
    ot: {
      ref: 'Mk 5,1',
      period: '~700 TCN',
      text: '"Phần ngươi, hỡi Bêlem Eprata, ngươi nhỏ bé nhất trong các thị tộc Giuđa — từ ngươi sẽ xuất hiện Đấng thống trị Israel."',
      prophet: 'Ngôn sứ Mikha',
    },
    nt: {
      ref: 'Lc 2,4–7',
      text: 'Giuse và Maria đi Bêlem theo lệnh kiểm tra dân số của hoàng đế Augustô. Đức Giêsu được sinh ra tại đây đúng như tiên báo.',
      note: 'Ứng nghiệm từng chữ, cách viết ~700 năm',
    },
  },
  {
    id: 'virgin',
    category: 'Nhập thể',
    ot: {
      ref: 'Is 7,14',
      period: '~735 TCN',
      text: '"Này đây trinh nữ sẽ thụ thai và sinh hạ một con trai, đặt tên là Emmanuel — nghĩa là Thiên Chúa ở cùng chúng ta."',
      prophet: 'Ngôn sứ Isaia',
    },
    nt: {
      ref: 'Mt 1,22–23',
      text: 'Đức Maria thụ thai bởi phép Chúa Thánh Thần khi chưa hề chung sống với Giuse. Thánh Matthêô trích dẫn trực tiếp Is 7,14 để xác nhận ứng nghiệm.',
      note: 'Thánh Matthêô nối thẳng với Is 7,14',
    },
  },
  {
    id: 'david',
    category: 'Dòng dõi Đavít',
    ot: {
      ref: '2Sm 7,12–13',
      period: '~1000 TCN',
      text: '"Ta sẽ lập dòng dõi ngươi sau khi ngươi qua đời... Ta sẽ củng cố vương quyền của nó đến muôn đời."',
      prophet: 'Thiên Chúa hứa với Đavít',
    },
    nt: {
      ref: 'Mt 1,1 · Lc 1,32',
      text: 'Gia phả Đức Giêsu: "Con cháu Đavít, con cháu Abraham." Sứ thần nói với Maria: "Thiên Chúa sẽ ban cho Người ngôi báu Đavít."',
      note: 'Ứng nghiệm qua gia phả và Lời sứ thần',
    },
  },
  {
    id: 'entry',
    category: 'Vào Giêrusalem',
    ot: {
      ref: 'Zk 9,9',
      period: '~520 TCN',
      text: '"Nào thiếu nữ Sion, hãy vui mừng hoan hỉ! Kìa Đức Vua của ngươi đang đến — khiêm tốn ngồi trên lưng lừa."',
      prophet: 'Ngôn sứ Giacaria',
    },
    nt: {
      ref: 'Mt 21,5 · Mc 11,1–10',
      text: 'Đức Giêsu cưỡi lừa con vào Giêrusalem. Dân chúng trải áo và lá trên đường, hô vang: "Hoan hô Con vua Đavít!"',
      note: 'Đức Giêsu chủ động chọn lừa để ứng nghiệm',
    },
  },
  {
    id: 'betrayal',
    category: 'Phản nộp · 30 đồng',
    ot: {
      ref: 'Zk 11,12–13',
      period: '~520 TCN',
      text: '"Họ đã cân trả cho tôi ba mươi đồng bạc... Tôi lấy ba mươi đồng bạc ấy ném vào nhà Thiên Chúa."',
      prophet: 'Ngôn sứ Giacaria',
    },
    nt: {
      ref: 'Mt 26,15 · Mt 27,3–10',
      text: 'Giuđa nhận đúng 30 đồng bạc để nộp Đức Giêsu. Sau đó hối hận, ném tiền lại vào Đền thờ. Dùng mua "thửa ruộng người thợ gốm".',
      note: 'Hai chi tiết riêng biệt — đều ứng nghiệm',
    },
  },
  {
    id: 'suffering',
    category: 'Tôi Tớ đau khổ',
    ot: {
      ref: 'Is 53,3–5',
      period: '~700 TCN',
      text: '"Người bị khinh khi và bị người ta ruồng bỏ... Người đã gánh lấy bệnh tật của ta, mang lấy đau khổ của ta... vì tội lỗi ta mà Người bị đâm thâu."',
      prophet: 'Ngôn sứ Isaia',
    },
    nt: {
      ref: 'Lc 23 · 1Pr 2,24',
      text: 'Cuộc khổ nạn ứng nghiệm từng chi tiết Is 53: bị khinh khi, ruồng bỏ, mang tội chúng ta, bị đâm thâu bởi đinh và lưỡi đòng.',
      note: 'Is 53 — mô tả khổ nạn chính xác nhất',
    },
  },
  {
    id: 'bones',
    category: 'Xương không bị bẻ',
    ot: {
      ref: 'Xh 12,46 · Tv 34,21',
      period: '~1250 TCN & Thánh vịnh',
      text: '"Các ngươi không được bẻ một xương nào của chiên." — Xh 12,46. "Người canh giữ mọi xương cốt của người công chính, không một chiếc xương nào bị bẻ gãy." — Tv 34,21',
      prophet: 'Luật về con chiên Vượt Qua',
    },
    nt: {
      ref: 'Ga 19,33–36',
      text: 'Binh lính đến bẻ chân những người bị đóng đinh. Khi đến Đức Giêsu, họ thấy Ngài đã chết, nên không bẻ chân Ngài. Gioan ghi: "để lời Kinh Thánh được ứng nghiệm."',
      note: 'Gioan chỉ rõ đây là ứng nghiệm Kinh Thánh',
    },
  },
  {
    id: 'resurrection',
    category: 'Phục sinh',
    ot: {
      ref: 'Tv 16,10',
      period: 'Thánh vịnh Đavít',
      text: '"Chúa không để tâm hồn con ở trong âm phủ, không cho kẻ hiếu trung thấy cảnh hư nát."',
      prophet: 'Thánh vịnh Đavít (Tv 16)',
    },
    nt: {
      ref: 'Cv 2,24–32',
      text: 'Phêrô giải thích tại Giêrusalem: Đavít không nói về chính mình vì ông đã chết và mộ còn đó. Ông nói tiên tri về Đấng Mêsia — "Người không bị bỏ trong cõi âm ty, xác thịt Người không hư nát."',
      note: 'Phêrô dùng Tv 16 để chứng minh Phục sinh',
    },
  },
  {
    id: 'new-covenant',
    category: 'Giao ước Mới',
    ot: {
      ref: 'Gr 31,31–33',
      period: '~580 TCN',
      text: '"Ta sẽ lập một giao ước mới với nhà Israel... Ta sẽ đặt Luật Ta vào lòng họ, khắc vào tâm khảm họ. Ta sẽ là Thiên Chúa của chúng và chúng sẽ là dân Ta."',
      prophet: 'Ngôn sứ Giêrêmia',
    },
    nt: {
      ref: 'Lc 22,20 · Hr 8,6–13',
      text: 'Tại Bữa Tiệc Ly: "Chén này là Giao ước Mới, lập bằng Máu Ta — Máu đổ ra vì anh em." Thư Do Thái trích Gr 31 để xác nhận Giao ước Mới đã đến trong Đức Kitô.',
      note: 'Hoàn tất lời Giêrêmia sau 580 năm chờ đợi',
    },
  },
];

const CATEGORY_COLORS = {
  'Giáng sinh': '#CD853F',
  'Nhập thể': '#D4AF37',
  'Dòng dõi Đavít': '#9B59B6',
  'Vào Giêrusalem': '#27AE60',
  'Phản nộp · 30 đồng': '#E74C3C',
  'Tôi Tớ đau khổ': '#95A5A6',
  'Xương không bị bẻ': '#3498DB',
  'Phục sinh': '#F39C12',
  'Giao ước Mới': '#1ABC9C',
};

// ─── Single row ───────────────────────────────────────────────────────────────
const ProphecyRow = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  const catColor = CATEGORY_COLORS[item.category] ?? '#D4AF37';

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(12,10,7,0.75)',
        border: `1px solid ${open ? catColor + '40' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: open ? `0 4px 24px ${catColor}14` : 'none',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.38, delay: index * 0.04 }}
    >
      {/* Row header — click to expand */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
        style={{ background: open ? `${catColor}08` : 'transparent' }}
        onClick={() => setOpen(o => !o)}
      >
        {/* Category badge */}
        <span
          className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:block"
          style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}30`, minWidth: 100, textAlign: 'center' }}
        >
          {item.category}
        </span>

        {/* Preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="sm:hidden text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${catColor}18`, color: catColor }}>
              {item.category}
            </span>
            <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {item.ot.prophet}
            </span>
            <ArrowRight size={11} style={{ color: `${catColor}66` }} />
            <span className="text-[11px] font-semibold" style={{ color: catColor }}>
              {item.nt.ref}
            </span>
          </div>
          {!open && (
            <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1 pr-4">{item.ot.text}</p>
          )}
        </div>

        {/* Expand icon */}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={15} style={{ color: open ? catColor : 'rgba(255,255,255,0.25)' }} />
        </motion.div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Desktop: side-by-side | Mobile: stacked */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
              style={{ borderTop: `1px solid ${catColor}20`, divideColor: `${catColor}15` }}
            >
              {/* OT column */}
              <div className="px-4 py-4" style={{ borderRight: 'none' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                    style={{ background: 'rgba(180,120,20,0.25)', color: '#D4AF37' }}>
                    📜
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#D4AF3799' }}>
                    CỰU ƯỚC
                  </span>
                  <span className="text-[9px] text-white/25 ml-auto">{item.ot.period}</span>
                </div>
                <p className="text-[11px] font-semibold mb-1" style={{ color: '#D4AF37cc' }}>
                  {item.ot.ref} · {item.ot.prophet}
                </p>
                <p className="text-white/65 text-[12px] leading-relaxed italic">{item.ot.text}</p>
              </div>

              {/* NT column */}
              <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                    style={{ background: `${catColor}22`, color: catColor }}>
                    ✝
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: `${catColor}aa` }}>
                    TÂN ƯỚC · ỨNG NGHIỆM
                  </span>
                </div>
                <p className="text-[11px] font-semibold mb-1" style={{ color: `${catColor}cc` }}>
                  {item.nt.ref}
                </p>
                <p className="text-white/65 text-[12px] leading-relaxed mb-3">{item.nt.text}</p>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} style={{ color: catColor }} />
                  <span className="text-[11px] font-medium" style={{ color: catColor }}>
                    {item.nt.note}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ProphecyTable() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? PROPHECIES : PROPHECIES.slice(0, 5);

  return (
    <section>
      {/* Section header */}
      <div className="text-center mb-8">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/25 mb-2">Cầu nối hai thời đại</p>
        <h2
          className="text-2xl sm:text-3xl font-bold mb-3"
          style={{
            fontFamily: '"Lexend", "EB Garamond", Georgia, serif',
            background: 'linear-gradient(135deg, #D4AF37 0%, #FFE566 40%, #CD853F 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Lời Tiên Tri & Sự Ứng Nghiệm
        </h2>
        <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
          {PROPHECIES.length} lời tiên tri trong Cựu Ước được viết hàng trăm năm trước
          Đức Giêsu — và ứng nghiệm chính xác trong Tân Ước.
        </p>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#D4AF37' }} />
            <span className="text-[11px] text-white/40">Cựu Ước (lời hứa)</span>
          </div>
          <ArrowRight size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#4ade80' }} />
            <span className="text-[11px] text-white/40">Tân Ước (hoàn tất)</span>
          </div>
        </div>
      </div>

      {/* Row: column headers on desktop */}
      <div className="hidden md:grid grid-cols-2 gap-px mb-2 px-4">
        <div className="flex items-center gap-2">
          <BookOpen size={12} style={{ color: '#D4AF3777' }} />
          <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#D4AF3766' }}>
            Lời tiên tri · Cựu Ước
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px]">✝</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Sự ứng nghiệm · Tân Ước
          </span>
        </div>
      </div>

      {/* Prophecy rows */}
      <div className="space-y-2">
        {visible.map((item, i) => (
          <ProphecyRow key={item.id} item={item} index={i} />
        ))}
      </div>

      {/* Show more/less */}
      {PROPHECIES.length > 5 && (
        <motion.div className="flex justify-center mt-5">
          <button
            onClick={() => setShowAll(v => !v)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.2)',
              color: '#D4AF37',
            }}
          >
            <motion.div animate={{ rotate: showAll ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={15} />
            </motion.div>
            {showAll ? `Ẩn bớt` : `Xem thêm ${PROPHECIES.length - 5} lời tiên tri`}
          </button>
        </motion.div>
      )}
    </section>
  );
}
