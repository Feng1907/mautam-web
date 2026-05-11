import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, ChevronDown, Users, ChevronRight } from 'lucide-react';
import BibleMap from '../components/BibleMap';
import IsraelMap from '../components/IsraelMap';
import CharacterCards from '../components/CharacterCards';
import NTCharacterCards from '../components/NTCharacterCards';
import ProphecyTable from '../components/ProphecyTable';

// ═══════════════════════════════════════════════════════════════════════════════
// DỮ LIỆU
// ═══════════════════════════════════════════════════════════════════════════════

const OT_MILESTONES = [
  {
    id: 'sang-the',
    label: 'Sáng thế',
    period: 'Thuở ban đầu',
    emoji: '🌅',
    accent: '#B8720A',
    borderColor: '#D4AF37',
    badgeLabel: 'Khai nguyên',
    badgeStyle: { background: 'rgba(180,120,20,0.25)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' },
    summary: 'Thiên Chúa dựng nên trời đất và con người theo hình ảnh Ngài. Tất cả đều tốt đẹp, nhưng con người đã phạm tội và xa lìa Thiên Chúa.',
    verse: '"Thuở ban đầu, Thiên Chúa sáng tạo trời đất." — St 1,1',
    detail: {
      title: 'Sáng thế & Nguyên tội',
      sections: [
        { heading: 'Thiên Chúa tạo dựng', body: 'Trong sáu ngày, Thiên Chúa dựng nên vũ trụ, ánh sáng, đất, trời, biển cả, muôn loài và sau cùng là con người — Adam và Eva. Ngài tạo dựng con người theo hình ảnh Ngài (Imago Dei) và thổi hơi sống vào mũi họ.' },
        { heading: 'Sa ngã & Nguyên tội', body: 'Adam và Eva bị cám dỗ bởi con rắn và ăn trái cây biết lành biết dữ. Tội bất tuân này phá vỡ tình hiệp thông với Thiên Chúa, mang đến đau khổ và cái chết cho nhân loại — đó là Nguyên tội.' },
        { heading: 'Lời hứa Nguyên Phúc Âm', body: 'Ngay sau khi sa ngã, Thiên Chúa hứa đặt sự thù ghét giữa con rắn và người phụ nữ, giữa dòng dõi nó và dòng dõi bà (St 3,15) — lời hứa đầu tiên về Đấng Cứu Thế.' },
      ],
      catechism: 'GLCG số 279–421: Thiên Chúa là Đấng Tạo Hóa; con người được tạo dựng để hiệp thông với Ngài.',
    },
  },
  {
    id: 'to-phu',
    label: 'Tổ phụ',
    period: '~2000–1700 TCN',
    emoji: '⛺',
    accent: '#8B5E3C',
    borderColor: '#CD853F',
    badgeLabel: 'Giao ước',
    badgeStyle: { background: 'rgba(139,94,60,0.25)', color: '#CD853F', border: '1px solid rgba(205,133,63,0.35)' },
    summary: 'Thiên Chúa kêu gọi Abraham, Isaac, Giacóp — lập Giao ước và tuyển chọn một dân riêng để qua họ chúc phúc cho muôn dân.',
    verse: '"Mọi gia tộc trên mặt đất sẽ được chúc phúc nhờ ngươi." — St 12,3',
    detail: {
      title: 'Các Tổ phụ & Giao ước',
      sections: [
        { heading: 'Abraham — Cha của đức tin', body: 'Thiên Chúa gọi Abraham ra khỏi Ur, hứa ban đất nước, dòng dõi đông như sao trời và chúc phúc cho muôn dân. Abraham tin và điều đó được kể là công chính cho ông (St 15,6).' },
        { heading: 'Isaac & Giacóp', body: 'Thiên Chúa đổi tên Giacóp thành Israel. Mười hai người con của ông trở thành mười hai chi tộc Israel — nền tảng của dân được tuyển chọn.' },
        { heading: 'Giao ước Sinai', body: '"Ta sẽ là Thiên Chúa của các ngươi và các ngươi sẽ là dân Ta." Đây là mối quan hệ tình yêu — không phải hợp đồng buôn bán.' },
      ],
      catechism: 'GLCG số 59–64: Thiên Chúa tuyển chọn Abraham, lập Israel làm dân riêng Ngài.',
    },
  },
  {
    id: 'xuat-hanh',
    label: 'Xuất hành',
    period: '~1250 TCN',
    emoji: '🔥',
    accent: '#1A5276',
    borderColor: '#4A90D9',
    badgeLabel: 'Giải phóng',
    badgeStyle: { background: 'rgba(26,82,118,0.3)', color: '#6AB4F5', border: '1px solid rgba(74,144,217,0.35)' },
    summary: 'Thiên Chúa giải phóng dân Israel khỏi ách nô lệ Ai Cập qua tay Môsê. Biến cố Vượt qua là hình bóng của ơn cứu độ trong Đức Kitô.',
    verse: '"Ta đã thấy cảnh khổ cực của dân Ta... Ta xuống giải thoát nó." — Xh 3,7–8',
    detail: {
      title: 'Xuất hành & Vượt qua',
      sections: [
        { heading: 'Môsê và bụi gai bốc lửa', body: 'Thiên Chúa hiện ra với Môsê trong bụi gai bốc lửa mà không cháy, mặc khải Danh Ngài: "Ta là Đấng Ta là" (YHWH) và sai ông giải phóng dân Israel khỏi tay Pharaô.' },
        { heading: 'Mười tai ương & Lễ Vượt Qua', body: 'Trong đêm Vượt Qua, máu chiên bôi lên cửa nhà giúp dân Israel thoát khỏi Thiên thần hủy diệt — hình bóng của Máu Đức Kitô cứu nhân loại.' },
        { heading: 'Vượt Biển Đỏ & Manna', body: 'Thiên Chúa rẽ đôi Biển Đỏ và nuôi dân bằng manna 40 năm — hình bóng của Bí tích Thánh Thể là Bánh từ trời.' },
      ],
      catechism: 'GLCG số 1093–1094: Xuất hành là hình bóng của phép Rửa tội và ơn giải thoát trong Đức Kitô.',
    },
  },
  {
    id: 'vuong-quoc',
    label: 'Vương quốc',
    period: '~1000–587 TCN',
    emoji: '👑',
    accent: '#5B2C8D',
    borderColor: '#9B59B6',
    badgeLabel: 'Vương triều',
    badgeStyle: { background: 'rgba(91,44,141,0.25)', color: '#C39BD3', border: '1px solid rgba(155,89,182,0.35)' },
    summary: 'Israel lập vương quốc dưới thời Saolê, Đavít, Salômôn. Thiên Chúa hứa với Đavít rằng Đấng Cứu Thế sẽ xuất phát từ dòng dõi ông.',
    verse: '"Ta sẽ lập dòng dõi ngươi đời đời." — 2Sm 7,12–13',
    detail: {
      title: 'Vương triều Đavít & Lời hứa',
      sections: [
        { heading: 'Vua Đavít — Người theo lòng Chúa', body: 'Đavít được Thiên Chúa tuyển từ người chăn chiên trở thành vua. Ông chinh phục Jerusalem và muốn xây Đền thờ. Thánh vịnh của ông vẫn là kinh nguyện của Hội Thánh ngàn năm sau.' },
        { heading: 'Giao ước Đavít', body: '"Ta sẽ lập dòng dõi ngươi... và vương triều ngươi sẽ kiên vững đến muôn đời." Lời hứa này là nền tảng cho niềm hy vọng về Đấng Mêsia từ dòng dõi Đavít.' },
        { heading: 'Salômôn & Đền thờ', body: 'Salômôn xây Đền thờ Jerusalem huy hoàng — nơi Thiên Chúa ngự giữa dân Ngài. Nhưng sau khi ông chết, vương quốc bị chia đôi.' },
      ],
      catechism: 'GLCG số 436, 559: Đức Giêsu là Đấng Mêsia — Đavít Mới, Vua muôn đời.',
    },
  },
  {
    id: 'luu-day',
    label: 'Lưu đày',
    period: '587–538 TCN',
    emoji: '🕯️',
    accent: '#4A5568',
    borderColor: '#78909C',
    badgeLabel: 'Thanh luyện',
    badgeStyle: { background: 'rgba(74,85,104,0.25)', color: '#9EB4C0', border: '1px solid rgba(120,144,156,0.35)' },
    summary: 'Israel bị lưu đày sang Babylon. Trong đau khổ, các ngôn sứ loan báo Đấng Tôi Tớ đau khổ và hứa hẹn về một Giao ước Mới.',
    verse: '"Ta sẽ đặt Luật Ta vào lòng họ, khắc vào tâm khảm họ." — Gr 31,33',
    detail: {
      title: 'Lưu đày & Ngôn sứ',
      sections: [
        { heading: 'Babylon lưu đày', body: 'Năm 587 TCN, Nabucôđônôsor phá hủy Jerusalem và Đền thờ, đưa dân Israel sang Babylon. Đây là biến cố đau thương nhất trong lịch sử Israel.' },
        { heading: 'Các ngôn sứ loan báo', body: 'Isaia loan báo về "Người Tôi Tớ đau khổ" sẽ gánh tội thiên hạ (Is 53); Giêrêmia hứa Giao ước Mới ghi vào lòng người.' },
        { heading: 'Trở về & Tái thiết', body: 'Năm 538 TCN, vua Ba Tư Kyrô cho dân Israel trở về. Họ xây lại Đền thờ và chờ đợi Đấng Mêsia đến thực hiện lời hứa của các ngôn sứ.' },
      ],
      catechism: 'GLCG số 762: Thiên Chúa dùng thử thách để thanh luyện và chuẩn bị dân Ngài đón Đấng Cứu Thế.',
    },
  },
  {
    id: 'hoi-huong',
    label: 'Hồi hương',
    period: '538–400 TCN',
    emoji: '🏛️',
    accent: '#2E7D32',
    borderColor: '#66BB6A',
    badgeLabel: 'Tái thiết',
    badgeStyle: { background: 'rgba(46,125,50,0.2)', color: '#81C784', border: '1px solid rgba(102,187,106,0.35)' },
    summary: 'Vua Ba Tư Kyrô cho dân Israel trở về. Họ xây lại Đền thờ và thành tường dưới thời Giêrubbabel, Esdra và Nêhêmia — rồi chờ đợi Đấng Mêsia.',
    verse: '"Ta là Kyrô, vua Ba Tư. Đức Chúa đã giao cho tôi xây dựng nhà Ngài tại Giêrusalem." — Esd 1,2',
    detail: {
      title: 'Hồi hương & Thời gian chờ đợi',
      sections: [
        { heading: 'Sắc lệnh Kyrô (538 TCN)', body: 'Thiên Chúa tác động qua vua Ba Tư Kyrô — người không biết Ngài — để cho dân Israel hồi hương. Esdra dẫn đầu đoàn trở về, mang theo bình thánh của Đền thờ.' },
        { heading: 'Xây dựng lại Đền thờ & Thành tường', body: 'Giêrubbabel tái thiết Đền thờ (Đền thờ Thứ hai), khánh thành năm 515 TCN. Nêhêmia xây lại tường thành Giêrusalem trong 52 ngày — kỳ tích dưới sự bảo trợ của Thiên Chúa.' },
        { heading: 'Thời gian thinh lặng & Chờ đợi', body: 'Sau Nêhêmia và Malaki (~400 TCN), Israel trải qua 400 năm không có ngôn sứ — thời "thinh lặng của Thiên Chúa". Dân chờ đợi Đấng Mêsia đến hoàn tất lời hứa.' },
      ],
      catechism: 'GLCG số 522: Dân Israel chờ đợi Đấng Mêsia — sự chờ đợi này là hành động của đức tin và đức cậy.',
    },
  },
];

const NT_MILESTONES = [
  {
    id: 'nhap-the',
    label: 'Nhập thể',
    period: '~4 TCN · Bêlem',
    emoji: '⭐',
    accent: '#B8860B',
    borderColor: '#FFD700',
    badgeLabel: 'Ngôi Lời nhập thể',
    badgeStyle: { background: 'rgba(184,134,11,0.2)', color: '#FFE566', border: '1px solid rgba(255,215,0,0.35)' },
    summary: 'Ngôi Hai Thiên Chúa được thụ thai bởi phép Chúa Thánh Thần và sinh ra bởi Đức Trinh Nữ Maria. Thiên Chúa trở thành người phàm để cứu chuộc nhân loại.',
    verse: '"Ngôi Lời đã trở nên người phàm và cư ngụ giữa chúng ta." — Ga 1,14',
    detail: {
      title: 'Nhập thể & Thơ ấu',
      sections: [
        { heading: 'Truyền tin & Cưu mang', body: 'Sứ thần Gabriel hiện ra với Đức Maria tại Nadarét: "Kính mừng Maria, đầy ơn phúc!" Đức Maria thưa: "Này tôi là tôi tớ Chúa." Từ đó Ngôi Lời được cưu mang trong lòng Đức Trinh Nữ.' },
        { heading: 'Giáng sinh tại Bêlem', body: 'Không có chỗ trong quán trọ — Đức Giêsu sinh ra trong máng cỏ, được các mục đồng và các nhà đạo sĩ phương Đông tôn thờ. Hài Nhi ấy là Đấng Cứu Thế, là Chúa, là Đức Kitô.' },
        { heading: '30 năm tại Nadarét', body: 'Đức Giêsu sống ẩn dật 30 năm trong gia đình thánh: lao động, vâng phục, cầu nguyện. Cuộc sống bình thường này dạy ta: mọi việc bình thường đều có thể nên thánh.' },
      ],
      catechism: 'GLCG số 456–483: Ngôi Lời nhập thể để cứu chúng ta, làm gương mẫu thánh thiện và làm cho chúng ta thông phần bản tính Thiên Chúa.',
    },
  },
  {
    id: 'su-vu',
    label: 'Sứ vụ công khai',
    period: '~27–30 sau CN · Galilê',
    emoji: '✨',
    accent: '#0E6655',
    borderColor: '#48C9B0',
    badgeLabel: 'Tin Mừng Nước Trời',
    badgeStyle: { background: 'rgba(14,102,85,0.2)', color: '#76D7C4', border: '1px solid rgba(72,201,176,0.35)' },
    summary: 'Đức Giêsu chịu phép rửa tại sông Jordan, rao giảng Tin Mừng Nước Trời, chữa lành kẻ đau yếu, xua trừ ma quỷ và gọi các tông đồ từ những ngư phủ vô danh.',
    verse: '"Thời kỳ đã mãn, Nước Thiên Chúa đã đến gần." — Mc 1,15',
    detail: {
      title: 'Sứ vụ tại Galilê & Giudê',
      sections: [
        { heading: 'Phép rửa & Cám dỗ', body: 'Gioan Tẩy Giả làm phép rửa cho Đức Giêsu tại sông Jordan. Tiếng từ trời: "Đây là Con yêu dấu của Ta." Ngài bị Thánh Thần dẫn vào sa mạc 40 ngày, chiến thắng ba cơn cám dỗ của Satan.' },
        { heading: 'Gọi Nhóm Mười Hai', body: 'Đức Giêsu gọi 12 tông đồ — ngư phủ, người thu thuế — "Hãy theo Ta, Ta sẽ làm cho các anh thành những kẻ lưới người." Nhóm Mười Hai là nền tảng của Hội Thánh tông truyền.' },
        { heading: 'Bài giảng & Phép lạ', body: 'Bài giảng Tám Mối Phúc (Mt 5), biến nước thành rượu tại Cana, nhân bánh nuôi 5.000 người, chữa người mù, người phong cùi, phục sinh con trai bà góa Naim...' },
      ],
      catechism: 'GLCG số 535–560: Toàn bộ cuộc đời Đức Giêsu là mầu nhiệm cứu độ.',
    },
  },
  {
    id: 'kho-nan',
    label: 'Tử nạn & Phục sinh',
    period: '~30 sau CN · Giêrusalem',
    emoji: '✝️',
    accent: '#922B21',
    borderColor: '#E74C3C',
    badgeLabel: 'Mầu nhiệm Vượt Qua',
    badgeStyle: { background: 'rgba(146,43,33,0.2)', color: '#F1948A', border: '1px solid rgba(231,76,60,0.35)' },
    summary: 'Đức Giêsu chịu chết trên thập giá để đền tội nhân loại — Lễ Vượt Qua đích thật. Ngày thứ ba, Ngài sống lại từ cõi chết, chiến thắng tội lỗi và sự chết.',
    verse: '"Lạy Cha, xin tha cho họ, vì họ không biết việc họ làm." — Lc 23,34',
    detail: {
      title: 'Cuộc Khổ nạn & Phục sinh',
      sections: [
        { heading: 'Bữa Tiệc Ly', body: 'Trong đêm trước khi chịu nạn, Đức Giêsu lập Bí tích Thánh Thể: "Đây là Mình Ta — đây là Máu Ta." Ngài rửa chân cho các tông đồ, dạy yêu thương như Ngài đã yêu.' },
        { heading: 'Thập giá', body: 'Bị bắt, xử án, chịu đánh đòn, đội mão gai và vác thập giá lên đồi Calvê. Bị đóng đinh cùng hai tên trộm. Từ trên thập giá Ngài tha thứ và trao Mẹ Maria cho Gioan — trao cho Hội Thánh.' },
        { heading: 'Phục sinh', body: 'Ngày thứ nhất trong tuần, ngôi mộ trống rỗng. Đức Giêsu hiện ra với Maria Mácđala, với hai môn đệ trên đường Emmaus, với Nhóm Mười Một. Ngài đã chiến thắng tử thần — đây là nền tảng của đức tin Kitô giáo.' },
      ],
      catechism: 'GLCG số 599–655: Thập giá và Phục sinh là trung tâm của ơn Cứu độ và của đức tin Kitô giáo.',
    },
  },
  {
    id: 'hien-xuong',
    label: 'Hiện xuống & Hội Thánh',
    period: '~30 sau CN · Jerusalem',
    emoji: '🕊️',
    accent: '#7D3C98',
    borderColor: '#AF7AC5',
    badgeLabel: 'Hội Thánh sơ khai',
    badgeStyle: { background: 'rgba(125,60,152,0.2)', color: '#D2B4DE', border: '1px solid rgba(175,122,197,0.35)' },
    summary: 'Mười ngày sau khi Chúa lên trời, Chúa Thánh Thần hiện xuống trên các tông đồ tại Phòng Tiệc Ly. Hội Thánh được khai sinh và bắt đầu sứ vụ loan báo Tin Mừng cho muôn dân.',
    verse: '"Anh em sẽ nhận được sức mạnh của Thánh Thần... và làm chứng nhân cho Ta." — Cv 1,8',
    detail: {
      title: 'Lễ Ngũ Tuần & Hội Thánh',
      sections: [
        { heading: 'Chúa Thánh Thần hiện xuống', body: 'Ngày Lễ Ngũ Tuần, tiếng gió mạnh và lưỡi lửa xuất hiện. Các tông đồ được đầy Thánh Thần, nói các thứ tiếng. Phêrô rao giảng và 3.000 người được rửa tội trong một ngày.' },
        { heading: 'Hội Thánh sơ khai', body: 'Các tín hữu đầu tiên chuyên cần: nghe giảng, hiệp thông, bẻ bánh và cầu nguyện. Họ bán tài sản, chia sẻ cho nhau theo nhu cầu. Đây là mẫu mực của đời sống Kitô hữu.' },
        { heading: 'Phaolô & Loan Tin Mừng', body: 'Sau khi Stephanô tử đạo, Hội Thánh lan rộng. Phaolô — từ kẻ bách hại thành tông đồ — thực hiện 3 chuyến truyền giáo, đem Tin Mừng đến tận Hy Lạp và Rôma.' },
      ],
      catechism: 'GLCG số 731–747: Chúa Thánh Thần là "Linh hồn" của Hội Thánh và sức mạnh của ơn Cứu độ.',
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// THEME CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const THEMES = {
  ot: {
    id: 'ot',
    label: 'CỰU ƯỚC',
    sublabel: '5 giai đoạn · Từ Sáng thế đến Lưu đày',
    icon: '📜',
    pageBg: 'linear-gradient(180deg, #0a0806 0%, #100e0a 50%, #0c0a07 100%)',
    spineLine: 'linear-gradient(180deg, transparent 0%, #C8860A44 15%, #C8860A44 85%, transparent 100%)',
    tabActive: { background: 'linear-gradient(135deg, #3a2508, #1e1205)', border: '1px solid #D4AF3755', color: '#D4AF37' },
    tabGlow: '#C8860A',
    badgeEra: { label: 'Cựu Ước', bg: 'rgba(180,120,20,0.2)', color: '#C8860A', border: '1px solid rgba(200,134,10,0.3)' },
    watermarkOpacity: 0.02,
    watermarkColor: '#C8860A',
  },
  nt: {
    id: 'nt',
    label: 'TÂN ƯỚC',
    sublabel: '4 giai đoạn · Từ Nhập thể đến Hội Thánh',
    icon: '✝',
    pageBg: 'linear-gradient(180deg, #07080a 0%, #0c0e12 50%, #090a0c 100%)',
    spineLine: 'linear-gradient(180deg, transparent 0%, #FFD70044 15%, #FFD70044 85%, transparent 100%)',
    tabActive: { background: 'linear-gradient(135deg, #2a2008, #141008)', border: '1px solid #FFD70055', color: '#FFE566' },
    tabGlow: '#FFD700',
    badgeEra: { label: 'Tân Ước', bg: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.35)' },
    watermarkOpacity: 0.025,
    watermarkColor: '#FFD700',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL CHI TIẾT
// ═══════════════════════════════════════════════════════════════════════════════

const DetailModal = ({ milestone, onClose }) => {
  if (!milestone) return null;
  const { detail, emoji, accent, borderColor } = milestone;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #1a1208 0%, #0f0d0a 100%)', border: `1px solid ${borderColor}40` }}
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center gap-3 px-6 py-4 rounded-t-2xl"
            style={{ background: `${accent}22`, borderBottom: `1px solid ${borderColor}30` }}>
            <span className="text-3xl">{emoji}</span>
            <h2 className="flex-1 font-bold text-lg leading-tight"
              style={{ fontFamily: '"EB Garamond", Georgia, serif', color: borderColor }}>
              {detail.title}
            </h2>
            <button onClick={onClose}
              className="shrink-0 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition">
              <X size={18} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-5">
            {detail.sections.map((s, i) => (
              <div key={i}>
                <h3 className="font-semibold mb-1.5" style={{ color: borderColor, fontFamily: '"EB Garamond", Georgia, serif', fontSize: '1rem' }}>
                  {s.heading}
                </h3>
                <p className="text-white/72 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
            <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
              style={{ background: `${accent}14`, border: `1px solid ${borderColor}22` }}>
              <BookOpen size={14} className="shrink-0 mt-0.5" style={{ color: borderColor }} />
              <p className="text-xs leading-relaxed" style={{ color: `${borderColor}cc` }}>{detail.catechism}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MILESTONE CARD & TIMELINE ITEM
// ═══════════════════════════════════════════════════════════════════════════════

const MilestoneCard = ({ milestone, onOpen, mobile, theme }) => {
  const { label, period, summary, verse, accent, borderColor, badgeLabel, badgeStyle } = milestone;
  const era = theme.badgeEra;
  return (
    <motion.button
      onClick={() => onOpen(milestone)}
      className={`group/card w-full text-left rounded-2xl p-4 md:p-5 shadow-xl ${mobile ? '' : 'max-w-sm'}`}
      style={{ background: 'rgba(12,10,7,0.85)', backdropFilter: 'blur(14px)', border: `1px solid ${borderColor}30`, boxShadow: `0 4px 24px ${accent}18` }}
      whileHover={{ scale: 1.02, boxShadow: `0 8px 36px ${accent}35`, borderColor: `${borderColor}70` }}
      transition={{ duration: 0.18 }}
    >
      {/* Badges */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
          style={era}>
          {era.label}
        </span>
        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
          style={badgeStyle}>
          {badgeLabel}
        </span>
      </div>
      {/* Title */}
      <h3 className="font-bold mb-2 leading-tight"
        style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: '1.15rem', color: borderColor }}>
        {label}
      </h3>
      {/* Period */}
      <p className="text-[11px] mb-2" style={{ color: `${accent}99` }}>{period}</p>
      {/* Summary */}
      <p className="text-white/60 text-sm leading-relaxed mb-3">{summary}</p>
      {/* Verse */}
      <p className="text-xs italic leading-relaxed border-l-2 pl-2.5"
        style={{ color: `${borderColor}88`, borderColor: `${borderColor}45` }}>
        {verse}
      </p>
      {/* CTA */}
      <div className="flex items-center gap-1.5 mt-3 text-xs font-medium opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"
        style={{ color: borderColor }}>
        <BookOpen size={12} />
        <span>Xem bài giáo lý</span>
      </div>
    </motion.button>
  );
};

const TimelineItem = ({ milestone, index, onOpen, theme }) => {
  const isRight = index % 2 === 0;
  return (
    <motion.div
      className="relative flex items-start"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Desktop layout */}
      <div className={`hidden md:flex w-full ${isRight ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className="w-[calc(50%-28px)] flex justify-end pr-6">
          {isRight && <MilestoneCard milestone={milestone} onOpen={onOpen} theme={theme} />}
        </div>
        <div className="flex flex-col items-center shrink-0 w-14">
          <motion.button
            onClick={() => onOpen(milestone)}
            className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full text-xl border-2 shadow-lg"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${milestone.accent}dd, ${milestone.accent}77)`,
              borderColor: milestone.borderColor,
              boxShadow: `0 0 18px ${milestone.accent}50`,
            }}
            whileHover={{ scale: 1.14 }}
            whileTap={{ scale: 0.94 }}
          >
            {milestone.emoji}
          </motion.button>
        </div>
        <div className="w-[calc(50%-28px)] flex justify-start pl-6">
          {!isRight && <MilestoneCard milestone={milestone} onOpen={onOpen} theme={theme} />}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex md:hidden w-full gap-4">
        <div className="flex flex-col items-center shrink-0">
          <motion.button
            onClick={() => onOpen(milestone)}
            className="flex items-center justify-center w-11 h-11 rounded-full text-base border-2 shadow-md"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${milestone.accent}dd, ${milestone.accent}77)`,
              borderColor: milestone.borderColor,
              boxShadow: `0 0 12px ${milestone.accent}42`,
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
          >
            {milestone.emoji}
          </motion.button>
        </div>
        <div className="flex-1 pb-4">
          <MilestoneCard milestone={milestone} onOpen={onOpen} mobile theme={theme} />
        </div>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB SELECTOR
// ═══════════════════════════════════════════════════════════════════════════════

const TabSelector = ({ activeTab, onSwitch }) => (
  <div
    className="relative z-10 max-w-2xl mx-auto px-4 pb-8"
    role="tablist"
    aria-label="Phân kỳ lịch sử"
  >
    {/* Connecting bridge label */}
    <div className="flex items-center gap-3 mb-5 justify-center">
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.2))' }} />
      <p className="text-[10px] uppercase tracking-[0.25em] text-white/25">Chọn thời kỳ</p>
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.2))' }} />
    </div>

    <div
      className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {Object.values(THEMES).map(theme => {
        const isActive = activeTab === theme.id;
        return (
          <motion.button
            key={theme.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSwitch(theme.id)}
            className="relative flex flex-col items-center gap-1.5 px-4 py-4 rounded-xl transition-all duration-300 overflow-hidden"
            style={isActive ? theme.tabActive : { background: 'transparent', border: '1px solid transparent', color: 'rgba(255,255,255,0.35)' }}
            whileHover={!isActive ? { background: 'rgba(255,255,255,0.04)' } : {}}
            whileTap={{ scale: 0.97 }}
          >
            {/* Glow behind active tab */}
            {isActive && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${theme.tabGlow}18, transparent)` }}
                layoutId="tabGlow"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            <span className="text-2xl">{theme.icon}</span>
            <span
              className="font-bold text-sm tracking-[0.12em] leading-tight"
              style={{
                fontFamily: '"EB Garamond", Georgia, serif',
                color: isActive ? theme.tabActive.color : 'rgba(255,255,255,0.4)',
              }}
            >
              {theme.label}
            </span>
            <span className="text-[10px] text-center leading-snug" style={{ color: isActive ? `${theme.tabActive.color}88` : 'rgba(255,255,255,0.22)' }}>
              {theme.sublabel}
            </span>

            {/* Active underline indicator */}
            {isActive && (
              <motion.div
                className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                style={{ background: theme.tabGlow }}
                layoutId="tabLine"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// TAB CONTENT — OT
// ═══════════════════════════════════════════════════════════════════════════════

const OTContent = ({ onOpen, theme }) => (
  <div className="space-y-10">
    {/* BibleMap */}
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full" style={{ background: '#D4AF37' }} />
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D4AF3788' }}>
          Địa lý Kinh Thánh · Cận Đông cổ đại
        </p>
      </div>
      <BibleMap />
    </div>

    {/* Character Cards */}
    <CharacterCards />

    {/* Divider */}
    <div className="flex items-center gap-4">
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #C8860A33)' }} />
      <span className="text-xs text-white/25 uppercase tracking-widest">Dòng thời gian</span>
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #C8860A33)' }} />
    </div>

    {/* Timeline */}
    <div className="relative">
      {/* Spine */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 inset-y-0 w-px" style={{ background: theme.spineLine }} />
      <div className="md:hidden absolute left-6.5 inset-y-0 w-px" style={{ background: theme.spineLine }} />

      <div className="relative flex flex-col gap-10 md:gap-14">
        {OT_MILESTONES.map((m, i) => (
          <TimelineItem key={m.id} milestone={m} index={i} onOpen={onOpen} theme={theme} />
        ))}
      </div>

      {/* End marker */}
      <motion.div className="flex justify-center mt-14"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2"
            style={{ borderColor: '#C8860A', background: '#1a1005', boxShadow: '0 0 20px #C8860A44' }}>
            ✦
          </div>
          <p className="text-[10px] text-white/25 tracking-widest uppercase">Chờ đợi Đấng Cứu Thế</p>
        </div>
      </motion.div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// TAB CONTENT — NT
// ═══════════════════════════════════════════════════════════════════════════════

const NTContent = ({ onOpen, theme }) => (
  <div className="space-y-10">
    {/* IsraelMap */}
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full" style={{ background: '#FFD700' }} />
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#FFD70088' }}>
          Israel thời Tân Ước · Ba miền thánh địa
        </p>
      </div>
      <IsraelMap />
    </div>

    {/* NT Character Cards */}
    <NTCharacterCards />

    {/* Divider */}
    <div className="flex items-center gap-4">
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #FFD70033)' }} />
      <span className="text-xs text-white/25 uppercase tracking-widest">Dòng thời gian</span>
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #FFD70033)' }} />
    </div>

    {/* Timeline */}
    <div className="relative">
      {/* Spine */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 inset-y-0 w-px" style={{ background: theme.spineLine }} />
      <div className="md:hidden absolute left-6.5 inset-y-0 w-px" style={{ background: theme.spineLine }} />

      <div className="relative flex flex-col gap-10 md:gap-14">
        {NT_MILESTONES.map((m, i) => (
          <TimelineItem key={m.id} milestone={m} index={i} onOpen={onOpen} theme={theme} />
        ))}
      </div>

      {/* End marker */}
      <motion.div className="flex justify-center mt-14"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2"
            style={{ borderColor: '#FFD700', background: '#12100a', boxShadow: '0 0 28px #FFD70055' }}>
            ✝
          </div>
          <p className="text-[10px] text-white/30 tracking-widest uppercase">Maranatha · Lạy Chúa Giêsu, xin hãy đến!</p>
        </div>
      </motion.div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '6%' : '-6%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-4%' : '4%', opacity: 0 }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function LichSuCuuDo() {
  const [activeTab, setActiveTab] = useState('ot');
  const [direction, setDirection] = useState(1);
  const [selected, setSelected] = useState(null);
  const prevTab = useRef('ot');

  const theme = THEMES[activeTab];

  const handleSwitch = (tab) => {
    if (tab === activeTab) return;
    const tabOrder = { ot: 0, nt: 1 };
    setDirection(tabOrder[tab] > tabOrder[prevTab.current] ? 1 : -1);
    prevTab.current = tab;
    setActiveTab(tab);
    setSelected(null);
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-x-hidden"
      animate={{ background: theme.pageBg }}
      transition={{ duration: 0.7 }}
    >
      {/* Watermark cross — color shifts with theme */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
        animate={{ opacity: theme.watermarkOpacity }}
        transition={{ duration: 0.6 }}
        aria-hidden
      >
        <svg width="480" height="480" viewBox="0 0 100 100" fill="none">
          <rect x="44" y="5" width="12" height="90" rx="6" fill={theme.watermarkColor} />
          <rect x="10" y="28" width="80" height="12" rx="6" fill={theme.watermarkColor} />
        </svg>
      </motion.div>

      {/* ── Hero ── */}
      <motion.section
        className="relative z-10 text-center px-4 pt-14 pb-8"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
      >
        <p className="text-[10px] font-semibold tracking-[0.28em] uppercase mb-3"
          style={{ color: 'rgba(212,175,55,0.6)' }}>
          Giáo lý Xứ Đoàn · Anrê Phú Yên
        </p>
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight"
          style={{
            fontFamily: '"EB Garamond", Georgia, serif',
            background: 'linear-gradient(135deg, #D4AF37 0%, #ffe566 50%, #C8860A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Lịch sử Cứu độ
        </h1>
        <p className="text-white/45 max-w-lg mx-auto text-sm leading-relaxed">
          Hành trình Thiên Chúa yêu thương tìm kiếm con người — từ thuở tạo dựng đến Đức Giêsu Kitô và Hội Thánh.
        </p>

        {/* Scroll cue */}
        <motion.div className="flex justify-center mt-6"
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}>
          <ChevronDown size={20} style={{ color: '#D4AF3750' }} />
        </motion.div>
      </motion.section>

      {/* ── Tab Selector ── */}
      <TabSelector activeTab={activeTab} onSwitch={handleSwitch} />

      {/* ── Era label banner ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + '-banner'}
          className="relative z-10 max-w-4xl mx-auto px-4 mb-8"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl"
            style={{
              background: `${theme.tabGlow}10`,
              border: `1px solid ${theme.tabGlow}25`,
            }}
          >
            <span className="text-xl">{theme.icon}</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.tabGlow }}>
                {theme.label}
              </p>
              <p className="text-[11px]" style={{ color: `${theme.tabGlow}77` }}>
                {theme.sublabel}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Main Tab Content with Slide ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-20 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {activeTab === 'ot' ? (
            <motion.div
              key="ot"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              <OTContent onOpen={setSelected} theme={theme} />
            </motion.div>
          ) : (
            <motion.div
              key="nt"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              <NTContent onOpen={setSelected} theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Prophecy & Fulfillment — bridges both testaments ── */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 pb-20"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
      >
        {/* CTA → trang Nhân vật */}
        <motion.div
          className="mb-10 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45 }}
          style={{ background: 'linear-gradient(135deg, #1e1508 0%, #120e05 100%)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-5 py-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <Users size={22} style={{ color: '#D4AF37' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base mb-0.5" style={{ fontFamily: '"Lexend", "EB Garamond", Georgia, serif', color: '#D4AF37' }}>
                Danh sách Nhân vật tiêu biểu
              </h3>
              <p className="text-white/45 text-sm leading-snug">
                9 nhân vật chi tiết: tên gọi, biến cố, vai trò, bài học ghi nhớ và từ khóa hình ảnh minh họa.
              </p>
            </div>
            <Link
              to="/nhan-vat"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all duration-200 hover:scale-105"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', color: '#D4AF37' }}
            >
              Khám phá
              <ChevronRight size={15} />
            </Link>
          </div>
        </motion.div>

        {/* Divider before section */}
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.2))' }} />
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.18)' }}
          >
            <span className="text-sm">📜</span>
            <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#D4AF3799' }}>
              Cựu Ước ↔ Tân Ước
            </span>
            <span className="text-sm">✝</span>
          </div>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.2))' }} />
        </div>

        <ProphecyTable />
      </motion.div>

      {/* ── Modal ── */}
      <DetailModal milestone={selected} onClose={() => setSelected(null)} />
    </motion.div>
  );
}
