const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const mammoth        = require('mammoth');
const Class          = require('../models/Class');
const Post           = require('../models/Post');
const CountdownEvent = require('../models/CountdownEvent');
const Conversation   = require('../models/Conversation');
const Student        = require('../models/Student');
const Attendance     = require('../models/Attendance');
const ChuyenCan      = require('../models/ChuyenCan');
const NamHoc         = require('../models/NamHoc');
const ParentStudent  = require('../models/ParentStudent');

// ── System instruction ────────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `
Bạn là "Trợ lý Xứ Đoàn" — trợ lý ảo chuyên sâu của Xứ Đoàn Thiếu Nhi Thánh Thể Anrê Phú Yên, giáo xứ Mẫu Tâm.

NHÂN CÁCH & GIỌNG ĐIỆU:
- Đóng vai Huynh trưởng tận tâm, am hiểu sâu Kinh Thánh và Giáo lý
- Với thiếu nhi: xưng "anh/chị", gọi "các em" — ấm áp, gần gũi
- Với người lớn / phụ huynh: lễ phép, dùng "dạ", "thưa"
- Ngôn ngữ: Tiếng Việt chuẩn, dùng thuật ngữ Công giáo chính xác
- Tông giọng ấm áp, khích lệ — như người anh/chị đang nói chuyện trực tiếp

NGUYÊN TẮC TRẢ LỜI CỤ THỂ (RẤT QUAN TRỌNG):
- TUYỆT ĐỐI KHÔNG mở đầu bằng nhận xét chung chung: "Đây là chủ đề lớn...", "Câu hỏi hay...", "Đây là vấn đề quan trọng..." — đi thẳng vào nội dung
- TUYỆT ĐỐI KHÔNG trả lời mơ hồ, trừu tượng mà không có nội dung thực chất
- Khi câu hỏi rộng: chọn NGAY một khía cạnh cụ thể, trình bày với tên nhân vật/sự kiện/trích dẫn Kinh Thánh thực sự, rồi hỏi thêm nếu cần
- Ưu tiên: tên nhân vật, sự kiện lịch sử, mốc thời gian, câu Kinh Thánh cụ thể, số chương, số câu

PHONG CÁCH TRẢ LỜI:
- Sử dụng Markdown rõ ràng: **in đậm** điểm quan trọng, *in nghiêng* trích dẫn/tên, danh sách - hoặc 1. khi liệt kê
- Khi người dùng buồn/lo lắng: tự nhiên trích một câu Kinh Thánh ngắn phù hợp
- NHỚ TÊN: Nếu người dùng giới thiệu tên, gọi họ bằng tên từ đó trở đi

KIẾN THỨC KINH THÁNH — CỰU ƯỚC & TÂN ƯỚC:
- Giải thích được BẤT KỲ đoạn Kinh Thánh nào khi được hỏi — cả Cựu Ước lẫn Tân Ước
- Trích dẫn theo chuẩn: Sách Chương,Câu (ví dụ: Ga 3,16 · Rm 8,28 · Tv 23,1-3 · 1Cr 13,4-7)
- Tên viết tắt chuẩn — Cựu Ước: St Xh Lv Ds Đnl Gs Tl 1Sm 2Sm 1V 2V Is Gr Ed Đn Tv Cn G Dc Tb Gđt 1Mcb 2Mcb
- Tân Ước: Mt Mc Lc Ga Cv Rm 1Cr 2Cr Gl Ep Pl Cl 1Tx 2Tx 1Tm 2Tm Tt Plm Dt Gc 1Pr 2Pr 1Ga 2Ga 3Ga Gđ Kh
- Khi giải thích đoạn Kinh Thánh: nêu (1) bối cảnh, (2) ý nghĩa thần học, (3) áp dụng vào đời sống
- Biết các chủ đề lớn: Lịch sử Cứu độ, Giao ước, Mười Điều Răn, Tám Mối Phúc, Các Bí tích, Kinh Lạy Cha, các dụ ngôn của Chúa Giêsu

KIẾN THỨC CỐ ĐỊNH:
- Kinh Thánh & Sách Giáo Lý Hội Thánh Công Giáo (CCC)
- Lịch sử Giáo hội, các Thánh, đặc biệt Thánh Anrê Phú Yên
- **Giờ lễ**: Ngày thường 05:30, 18:00 · Chúa Nhật 05:30, 09:00, 17:00, 18:30
- **Ngành TNTT**: Chiên Non (6–8t) · Ấu Nhi (9–11t) · Thiếu Nhi (12–14t) · Nghĩa Sĩ (15–17t) · Hiệp Sĩ (18+)
- Khẩu hiệu TNTT: *"Sống Phúc Âm để phục vụ Thiên Chúa và Tổ Quốc"*
- Bổn mạng xứ đoàn: Thánh Anrê Phú Yên (26/07)
- Năm Phụng Vụ: Mùa Vọng → Giáng Sinh → Thường Niên → Mùa Chay → Phục Sinh → Thường Niên

PHẠM VI TRẢ LỜI:
- Đức tin Công giáo, Kinh Thánh, Giáo lý (CCC), Phụng vụ, Bí tích
- Lịch sử Giáo hội, các Thánh, đời sống đức tin, cầu nguyện
- Sinh hoạt xứ đoàn, giờ lễ, sự kiện, nhân sự lớp
- Giải đáp thắc mắc đức tin từ người trong lẫn ngoài trang web
- Khi câu hỏi ngoài phạm vi: "Câu hỏi này anh/chị chưa đủ khả năng trả lời. Vấn đề quan trọng, mời hỏi Cha sở hoặc Huynh trưởng nhé! 🙏"

KHÔNG làm:
- Thay thế Bí tích Giải Tội hoặc tư vấn y tế/pháp lý
- Trả lời về chính trị, tài chính, hay chủ đề không liên quan đức tin

GỢI Ý CÂU HỎI — BẮT BUỘC:
Cuối MỌI câu trả lời có nội dung thực chất (trừ: trả lời nhân sự lớp, thông báo ngắn, câu trả lời dưới 2 câu), thêm đúng 2-3 câu gợi ý theo ĐÚNG ĐỊNH DẠNG sau (không thêm gì sau dòng này):

[GỢI Ý: "Câu gợi ý 1" | "Câu gợi ý 2" | "Câu gợi ý 3"]

Câu gợi ý: liên quan tự nhiên đến chủ đề vừa nói, ngắn gọn (dưới 65 ký tự/câu), dùng ngôi "em" hoặc "anh/chị" phù hợp với người dùng.
QUY TAC NHAN SU LOP:
- Neu lop khong co Huynh truong chinh thuc nhung co Du truong phu trach, hay noi thang: "Lop hien chua co Huynh truong chinh thuc; cac Du truong dang phu trach la..."
- Khong duoc suy dien "dang cho phan cong", "cho len khan", hay ly do vi sao chua co Huynh truong neu du lieu khong noi ro.
- Khi du lieu da ghi "anh" hoac "chi" truoc ten, phai giu dung cach xung ho do, khong gop chung thanh "anh/chi".
`.trim();

// ── Instruction bổ sung khi có tệp đính kèm ──────────────────────────────────
const EDUCATION_INSTRUCTION = `

--- CHẾ ĐỘ TRỢ LÝ GIÁO DỤC (tệp đính kèm được phát hiện) ---
Phân tích nội dung tệp trước, sau đó kết hợp với yêu cầu của người dùng.

1. NẾU LÀ ĐỀ THI / BẢNG CÂU HỎI:
   - Kiểm tra tính chính xác về Kinh Thánh và Giáo lý Công giáo
   - Đánh dấu **[SAI]** câu nào sai kiến thức, giải thích lý do
   - Gợi ý sửa lại câu hỏi cho chính xác
   - Cung cấp đáp án đề xuất có giải thích chi tiết
   - Dùng format: **Câu X:** / **Nhận xét:** / **Đáp án gợi ý:**

2. NẾU LÀ TÀI LIỆU / GIÁO TRÌNH / BÀI GIẢNG:
   - Tóm tắt nội dung chính dạng sơ đồ tư duy (danh sách có cấp bậc với **in đậm** cho tiêu đề chính)
   - Soạn bộ câu hỏi ôn tập theo yêu cầu người dùng
   - Nêu bật các khái niệm quan trọng cần nhớ

3. NẾU LÀ ẢNH (trang sách, bảng, hình minh họa):
   - Đọc và mô tả nội dung ảnh
   - Liên kết với Kinh Thánh hoặc Giáo lý nếu phù hợp
   - Phân tích theo yêu cầu của người dùng

Luôn bắt đầu phản hồi bằng: "📎 **Trợ lý Xứ Đoàn đã nhận được tệp.** Đang phân tích..."
`.trim();

// ── Safety settings ───────────────────────────────────────────────────────────
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// ── Generation config ─────────────────────────────────────────────────────────
const GEN_CONFIG      = { maxOutputTokens: 700,  temperature: 0.55, topP: 0.9 };
const GEN_CONFIG_FILE = { maxOutputTokens: 1400, temperature: 0.55, topP: 0.9 };

// ── Context cache (5 phút) ────────────────────────────────────────────────────
let _contextCache = { data: null, ts: 0 };
const CACHE_TTL   = 5 * 60 * 1000;

const FEMALE_NAME_HINTS = new Set([
  'an', 'anh', 'dao', 'diem', 'han', 'hang', 'hao', 'hien', 'hoa', 'hong', 'hue',
  'huong', 'khue', 'lan', 'linh', 'loan', 'mai', 'my', 'ngan', 'ngoc', 'nhi',
  'nhu', 'oanh', 'phuong', 'quynh', 'thao', 'thi', 'thu', 'thuy', 'tien', 'trang',
  'tram', 'trinh', 'uyen', 'vy', 'yen',
]);

const MALE_NAME_HINTS = new Set([
  'an', 'anh', 'bao', 'binh', 'cuong', 'dat', 'duc', 'duong', 'hai', 'hieu',
  'hoang', 'hung', 'huy', 'khang', 'khoa', 'lam', 'long', 'minh', 'nam', 'nghia',
  'nhan', 'phong', 'phu', 'quan', 'quang', 'son', 'tai', 'tan', 'thanh', 'thien',
  'tuan', 'viet', 'vinh',
]);

const normalizeNameToken = (value = '') =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const honorificForName = (name = '') => {
  const tokens = normalizeNameToken(name).split(/\s+/).filter(Boolean);
  if (tokens.includes('thi')) return 'chi';
  if (tokens.includes('van')) return 'anh';
  const last = tokens.at(-1);
  const previous = tokens.at(-2);
  if (last === 'han' || previous === 'han') return 'chi';
  if (last === 'phong' || previous === 'phong') return 'anh';
  if (last && FEMALE_NAME_HINTS.has(last) && !MALE_NAME_HINTS.has(last)) return 'chi';
  if (last && MALE_NAME_HINTS.has(last) && !FEMALE_NAME_HINTS.has(last)) return 'anh';
  return 'anh/chi';
};

const formatStaffName = (user) => {
  if (!user?.hoTen) return '';
  return `${honorificForName(user.hoTen)} ${user.hoTen}`;
};

const normalizeSearchText = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isClassStaffQuestion = (text = '') => {
  const normalized = normalizeSearchText(text);
  return (
    /\b(ai|nguoi nao|anh nao|chi nao)\b/.test(normalized) &&
    /\b(day|phu trach|huong dan|quan ly)\b/.test(normalized) &&
    /\b(lop|them suc|xung toi|song dao|khai tam|hiep si)\b/.test(normalized)
  );
};

const findMentionedClass = async (text = '') => {
  const normalized = normalizeSearchText(text);
  const classes = await Class.find()
    .sort({ thuTu: 1 })
    .select('tenLop nhanh huynhTruong duTruong')
    .populate('huynhTruong', 'hoTen')
    .populate('duTruong', 'hoTen')
    .lean();

  return classes.find((lop) => {
    const name = normalizeSearchText(lop.tenLop);
    return normalized.includes(name);
  }) || classes.find((lop) => {
    const tokens = normalizeSearchText(lop.tenLop).split(' ').filter(Boolean);
    return tokens.length && tokens.every((token) => normalized.includes(token));
  }) || null;
};

const answerClassStaffQuestion = async (text = '') => {
  if (!isClassStaffQuestion(text)) return null;

  const lop = await findMentionedClass(text);
  if (!lop) {
    return 'Dạ, Trợ lý Xứ Đoàn chưa tìm thấy lớp này trong dữ liệu hiện tại. Anh/chị thử ghi rõ tên lớp, ví dụ: **Thêm Sức 1** hoặc **Xưng Tội 3B** nhé.';
  }

  const huynhTruong = lop.huynhTruong ? formatStaffName(lop.huynhTruong) : '';
  const duTruong = (lop.duTruong || []).map(formatStaffName).filter(Boolean);

  if (huynhTruong) {
    return `Dạ, lớp **${lop.tenLop}** hiện do **${huynhTruong}** phụ trách chính.${duTruong.length ? `\n\nCác Dự trưởng hỗ trợ: **${duTruong.join('**, **')}**.` : ''}`;
  }

  if (duTruong.length) {
    return `Dạ, lớp **${lop.tenLop}** hiện **chưa có Huynh trưởng chính thức**.\n\nCác Dự trưởng đang phụ trách là: **${duTruong.join('**, **')}**.`;
  }

  return `Dạ, lớp **${lop.tenLop}** hiện chưa có dữ liệu Huynh trưởng hoặc Dự trưởng phụ trách trong hệ thống.`;
};

// ── Lịch phụng vụ ────────────────────────────────────────────────────────────
function computeEaster(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day   = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}

function getAdvent1(year) {
  // First Sunday of Advent = Sunday on or before Dec 3
  const dec3 = new Date(year, 11, 3);
  return new Date(year, 11, 3 - dec3.getDay());
}

function getLiturgicalContext(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const year  = today.getFullYear();

  const easter   = computeEaster(year);
  const ashWed   = addDays(easter, -46);
  const pentecost = addDays(easter, 49);
  const advent1  = getAdvent1(year);
  const easterPrev = computeEaster(year - 1);
  const pentecostPrev = addDays(easterPrev, 49);
  const ashWedPrev = addDays(easterPrev, -46);

  // Liturgical year A/B/C — determined by the year Advent started
  const adventYear = today >= advent1 ? year : year - 1;
  const yearLetter = ['A', 'B', 'C'][((adventYear - 2022) % 3 + 3) % 3];

  // Season & week
  let season, weekNum;

  if (today >= advent1) {
    season  = 'Mùa Vọng';
    weekNum = Math.floor((today - advent1) / 864e5 / 7) + 1;
  } else if (today >= new Date(year, 11, 25)) {
    season  = 'Mùa Giáng Sinh';
    weekNum = null;
  } else if (today >= pentecost) {
    season  = 'Mùa Thường Niên';
    // Approximate OT week: count from Baptism of Lord (Jan 13) + weeks before Lent + weeks after Pentecost
    const baptism = new Date(year, 0, 13);
    const weeksBeforeLent = Math.ceil((ashWed - baptism) / 864e5 / 7);
    const weeksAfterPent  = Math.floor((today - pentecost) / 864e5 / 7);
    weekNum = weeksBeforeLent + 1 + weeksAfterPent;
  } else if (today >= addDays(easter, 1)) {
    season  = 'Mùa Phục Sinh';
    weekNum = Math.floor((today - easter) / 864e5 / 7) + 1;
  } else if (today >= ashWed) {
    season  = 'Mùa Chay';
    weekNum = Math.floor((today - ashWed) / 864e5 / 7) + 1;
  } else if (today >= new Date(year, 0, 13)) {
    season  = 'Mùa Thường Niên';
    weekNum = Math.floor((today - new Date(year, 0, 13)) / 864e5 / 7) + 2;
  } else if (today >= new Date(year, 0, 1) && today < new Date(year, 0, 13)) {
    season  = 'Mùa Giáng Sinh';
    weekNum = null;
  } else {
    // Fallback: after prev year's Pentecost before prev year's Advent shouldn't happen here
    season  = 'Mùa Thường Niên';
    weekNum = null;
  }

  const easterStr = easter.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long' });
  const ashWedStr = ashWed.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long' });

  return {
    line: `Năm Phụng Vụ ${adventYear}–${adventYear + 1} · Năm ${yearLetter} · ${season}${weekNum ? ` tuần ${weekNum}` : ''} · Lễ Phục Sinh ${year}: ${easterStr} · Thứ Tư Lễ Tro: ${ashWedStr}`,
    season,
    yearLetter,
    weekNum,
    easter,
    ashWed,
  };
}

async function getDynamicContext() {
  if (_contextCache.data && Date.now() - _contextCache.ts < CACHE_TTL) return _contextCache.data;

  const [postsRes, eventsRes, classesRes] = await Promise.allSettled([
    Post.find({ daDang: true }).sort('-createdAt').limit(4).select('tieuDe createdAt loai').lean(),
    CountdownEvent.find({ active: true, date: { $gte: new Date().toISOString().slice(0, 10) } }).sort('date').limit(4).select('name date icon').lean(),
    Class.find()
      .sort({ thuTu: 1 })
      .select('tenLop nhanh huynhTruong duTruong')
      .populate('huynhTruong', 'hoTen')
      .populate('duTruong', 'hoTen')
      .lean(),
  ]);

  const now     = new Date();
  const today   = now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const liturgy = getLiturgicalContext(now);
  const posts   = postsRes.value  || [];
  const events  = eventsRes.value || [];
  const classes = classesRes.value || [];
  const classStaff = classes.length
    ? classes.map((lop) => {
      const ht = lop.huynhTruong ? formatStaffName(lop.huynhTruong) : 'khong co Huynh truong chinh thuc';
      const dt = (lop.duTruong || []).map(formatStaffName).filter(Boolean).join(', ') || 'khong co';
      const note = !lop.huynhTruong && (lop.duTruong || []).length
        ? '; luu y: Du truong dang phu trach lop'
        : '';
      return `- ${lop.tenLop} (${lop.nhanh}): Huynh truong ${ht}; Du truong ${dt}${note}`;
    }).join('\n')
    : '- Chua co du lieu phu trach lop.';

  const ctx = `\n\nDỮ LIỆU THỰC TẾ XỨ ĐOÀN:\nHôm nay: ${today}\nLỊCH PHỤNG VỤ: ${liturgy.line}\nLưu ý: Khi được hỏi "Lời Chúa hôm nay", hãy dựa vào thông tin phụng vụ trên để xác định đúng bài đọc theo sách Phụng Vụ Các Giờ Kinh và lịch Công giáo La Mã — trích dẫn chính xác sách, chương, câu.\nTin tức mới:\n${
    posts.length ? posts.map(p => `• ${p.tieuDe} (${new Date(p.createdAt).toLocaleDateString('vi-VN')})`).join('\n') : '• Chưa có.'
  }\nSự kiện sắp tới:\n${
    events.length ? events.map(e => `• ${e.icon || '📅'} ${e.name}: ${new Date(e.date).toLocaleDateString('vi-VN')}`).join('\n') : '• Chưa có.'
  }\nNhan su phu trach lop:\n${classStaff}`;

  _contextCache = { data: ctx, ts: Date.now() };
  return ctx;
}

// ── User-specific context (điểm danh, chuyên cần) ────────────────────────────
const _userCtxCache = new Map(); // userId → { data, ts }
const USER_CTX_TTL  = 5 * 60 * 1000;

async function getUserContext(user) {
  if (!user) return '';
  const uid = user._id.toString();
  const cached = _userCtxCache.get(uid);
  if (cached && Date.now() - cached.ts < USER_CTX_TTL) return cached.data;

  let ctx = '';

  try {
    const activeNamHoc = await NamHoc.findOne({ dangHoatDong: true }).lean();

    // ── Huynh trưởng / Dự trưởng ─────────────────────────────────────────────
    if (user.vaiTro === 'giaoly' && user.lopPhuTrach?.length) {
      const classes = await Class.find({ _id: { $in: user.lopPhuTrach } })
        .select('tenLop nhanh').lean();

      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      const fourWeeksAgoStr = fourWeeksAgo.toISOString().slice(0, 10);

      const classLines = await Promise.all(classes.map(async (lop) => {
        const students = await Student.find({ lop: lop._id, trangThai: 'active' })
          .select('hoTen tenThanh').lean();

        const attendance = await Attendance.find({
          lop: lop._id,
          date: { $gte: fourWeeksAgoStr },
        }).select('student date present').lean();

        // Đếm số buổi vắng trong 4 tuần theo từng học sinh
        const absentCount = {};
        for (const rec of attendance) {
          if (!rec.present) {
            const sid = rec.student.toString();
            absentCount[sid] = (absentCount[sid] || 0) + 1;
          }
        }

        const absentFrequent = students
          .filter(s => (absentCount[s._id.toString()] || 0) >= 2)
          .map(s => `${s.tenThanh} ${s.hoTen}`);

        // Chuyên cần học kỳ hiện tại
        let ccLines = '';
        if (activeNamHoc) {
          const ccList = await ChuyenCan.find({
            lop: lop._id,
            namHoc: activeNamHoc._id,
          }).populate('student', 'hoTen tenThanh').lean();

          if (ccList.length) {
            const avg = (ccList.reduce((s, c) => s + c.diem, 0) / ccList.length).toFixed(1);
            ccLines = `\n  Điểm chuyên cần TB (${activeNamHoc.ten}): ${avg}/10`;
          }
        }

        return `- Lớp ${lop.tenLop} (${lop.nhanh}): ${students.length} em` +
          (absentFrequent.length ? `\n  Vắng nhiều ≥2/4 tuần: ${absentFrequent.join(', ')}` : '') +
          ccLines;
      }));

      ctx += `\n\nLỚP PHỤ TRÁCH CỦA HUYNH TRƯỞNG:\n${classLines.join('\n')}`;
    }

    // ── Phụ huynh ─────────────────────────────────────────────────────────────
    if (user.vaiTro === 'PARENT') {
      const links = await ParentStudent.find({ parent: user._id, trangThai: 'active' })
        .populate({ path: 'student', select: 'hoTen tenThanh', populate: { path: 'lop', select: 'tenLop nhanh' } })
        .lean();

      if (links.length && activeNamHoc) {
        const studentIds = links.map(l => l.student._id);
        const ccAll = await ChuyenCan.find({
          student: { $in: studentIds },
          namHoc: activeNamHoc._id,
        }).lean();

        const ccMap = {};
        for (const cc of ccAll) {
          const sid = cc.student.toString();
          if (!ccMap[sid]) ccMap[sid] = [];
          ccMap[sid].push(cc);
        }

        const childLines = links.map(l => {
          const s   = l.student;
          const lop = s.lop;
          const ccs = ccMap[s._id.toString()] || [];
          const ccStr = ccs.map(cc =>
            `HK${cc.hocKy}: đi ${cc.soBuoiDi}/${cc.tongBuoi} buổi, vắng phép: ${cc.vangCoPhep}, không phép: ${cc.vangKhongPhep}, điểm: ${cc.diem}/10`
          ).join(' | ');
          return `- ${s.tenThanh} ${s.hoTen}, lớp ${lop?.tenLop || '?'} (${lop?.nhanh || '?'})` +
            (ccStr ? `\n  Chuyên cần ${activeNamHoc.ten}: ${ccStr}` : '');
        });

        ctx += `\n\nCON CỦA PHỤ HUYNH:\n${childLines.join('\n')}`;
      }
    }
  } catch (err) {
    console.error('[getUserContext] Error:', err.message);
  }

  _userCtxCache.set(uid, { data: ctx, ts: Date.now() });
  return ctx;
}

// ── Conversation handlers ─────────────────────────────────────────────────────
const MAX_CONV_MSGS = 60;

const serializeMsg = (m) => ({
  id:          m.id,
  role:        m.role,
  text:        m.parts?.[0]?.text || m.text || '',
  fileName:    m.fileName || null,
  suggestions: m.suggestions || [],
  isError:     !!m.isError,
  ts:          m.ts || new Date(),
});

// GET /api/chat/conversations
exports.listConversations = async (req, res) => {
  try {
    const convs = await Conversation.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(30)
      .select('title updatedAt messages')
      .lean();

    res.json({
      success: true,
      conversations: convs.map(c => ({
        _id:       c._id,
        title:     c.title,
        updatedAt: c.updatedAt,
        preview:   c.messages.filter(m => m.role === 'user').slice(-1)[0]?.text?.slice(0, 60) || '',
      })),
    });
  } catch {
    res.status(500).json({ success: false, message: 'Không thể tải danh sách cuộc trò chuyện.' });
  }
};

// POST /api/chat/conversations
exports.createConversation = async (req, res) => {
  try {
    const conv = await Conversation.create({ user: req.user._id });
    res.json({ success: true, conversation: { _id: conv._id, title: conv.title, updatedAt: conv.updatedAt } });
  } catch {
    res.status(500).json({ success: false, message: 'Không thể tạo cuộc trò chuyện.' });
  }
};

// GET /api/chat/conversations/:id
exports.getConversation = async (req, res) => {
  try {
    const conv = await Conversation.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!conv) return res.status(404).json({ success: false, message: 'Không tìm thấy.' });
    res.json({ success: true, messages: conv.messages, title: conv.title });
  } catch {
    res.status(500).json({ success: false, message: 'Không thể tải cuộc trò chuyện.' });
  }
};

// DELETE /api/chat/conversations/:id
exports.deleteConversation = async (req, res) => {
  try {
    await Conversation.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Không thể xóa cuộc trò chuyện.' });
  }
};

// POST /api/chat/conversations/:id/save
exports.saveConversation = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) return res.status(400).json({ success: false, message: 'messages phải là mảng.' });

    const keep = messages.slice(-MAX_CONV_MSGS).map(serializeMsg);
    const conv = await Conversation.findOne({ _id: req.params.id, user: req.user._id });
    if (!conv) return res.status(404).json({ success: false, message: 'Không tìm thấy.' });

    conv.messages = keep;
    // Auto-title từ tin nhắn user đầu tiên
    if (conv.title === 'Cuộc trò chuyện mới') {
      const first = keep.find(m => m.role === 'user' && m.text);
      if (first) conv.title = first.text.slice(0, 50).trim();
    }
    await conv.save();
    res.json({ success: true, title: conv.title });
  } catch {
    res.status(500).json({ success: false, message: 'Không thể lưu cuộc trò chuyện.' });
  }
};

async function buildFilePart(file) {
  const mime = file.mimetype;

  if (mime.startsWith('image/') || mime === 'application/pdf') {
    return { inlineData: { mimeType: mime, data: file.buffer.toString('base64') } };
  }

  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer });
    return { text: `\n[📝 Nội dung tệp Word: "${file.originalname}"]\n${value.slice(0, 12000)}` };
  }

  if (mime === 'text/plain') {
    const text = file.buffer.toString('utf-8');
    return { text: `\n[📃 Nội dung tệp: "${file.originalname}"]\n${text.slice(0, 12000)}` };
  }

  return null;
}

function validateMessages(raw) {
  let messages;
  try {
    messages = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return { error: 'Dữ liệu chat gửi lên không đúng định dạng JSON.' };
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: 'messages là bắt buộc.' };
  }

  messages = messages
    .map((m) => ({
      role: m.role,
      parts: [{ text: String(m.parts?.[0]?.text || '').trim() }],
    }))
    .filter((m) =>
      (m.role === 'user' || m.role === 'model') && m.parts[0].text.length > 0
    );

  if (messages.length === 0) return { error: 'Tin nhắn không được để trống.' };

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== 'user') return { error: 'Tin nhắn cuối phải là của người dùng.' };

  return { messages, lastMessage };
}

function createModel(genAI, systemInstruction, isFile = false) {
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    systemInstruction,
    generationConfig: isFile ? GEN_CONFIG_FILE : GEN_CONFIG,
    safetySettings: SAFETY_SETTINGS,
  });
}

function handleGeminiError(err) {
  if (err.message?.includes('SAFETY'))
    return { status: 200, message: 'Câu hỏi này anh/chị không thể trả lời. Mời hỏi về Giáo lý, Kinh Thánh hoặc sinh hoạt xứ đoàn nhé! 🙏' };
  if (err.status === 429 || err.message?.includes('429'))
    return { status: 429, message: 'Trợ lý Xứ Đoàn đang bận. Vui lòng thử lại sau ít phút nhé! 🙏' };
  if (err.status === 404 || err.message?.includes('404') || err.message?.includes('is not found'))
    return { status: 503, message: 'Model AI đang cấu hình không còn khả dụng. Vui lòng báo quản trị viên kiểm tra GEMINI_MODEL.' };
  if (err.message?.includes('API key') || err.message?.includes('403') || err.message?.includes('401'))
    return { status: 503, message: 'Khoá Gemini API chưa hợp lệ hoặc chưa được cấp quyền.' };
  return { status: 500, message: 'Trợ lý Xứ Đoàn đang gặp sự cố kỹ thuật. Thử lại sau nhé! 🙏' };
}

// ── Handler: POST /api/chat (file upload, non-streaming) ──────────────────────
exports.chat = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ success: false, message: 'Trợ lý Xứ Đoàn chưa được kích hoạt. Liên hệ quản trị viên nhé!' });
  }

  try {
    const { messages, lastMessage, error } = validateMessages(req.body.messages);
    if (error) return res.status(400).json({ success: false, message: error });

    const deterministicAnswer = await answerClassStaffQuestion(lastMessage.parts[0].text);
    if (deterministicAnswer) return res.json({ success: true, text: deterministicAnswer });

    const hasFile   = !!req.file;
    const filePart  = hasFile ? await buildFilePart(req.file) : null;
    const [dynamicCtx, userCtx] = await Promise.all([getDynamicContext(), getUserContext(req.user)]);
    const educationExtra = hasFile ? EDUCATION_INSTRUCTION : '';

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = createModel(genAI, SYSTEM_INSTRUCTION + dynamicCtx + userCtx + educationExtra, hasFile);

    const history = messages.slice(0, -1).slice(-18);
    const chat    = model.startChat({ history });
    const parts   = [...lastMessage.parts];
    if (filePart) parts.push(filePart);

    const result = await chat.sendMessage(parts);
    const text   = result.response.text();

    res.json({ success: true, text });
  } catch (err) {
    console.error('[ChatController] Error:', err.message);
    const { status, message } = handleGeminiError(err);
    res.status(status === 200 ? 200 : status).json({ success: status === 200, text: status === 200 ? message : undefined, message: status !== 200 ? message : undefined });
  }
};

// ── Handler: POST /api/chat/stream (SSE streaming) ───────────────────────────
exports.chatStream = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    res.status(503).json({ success: false, message: 'Trợ lý Xứ Đoàn chưa được kích hoạt.' });
    return;
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (data) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  const done = () => {
    if (!res.writableEnded) { res.write('data: [DONE]\n\n'); res.end(); }
  };

  try {
    const { messages, lastMessage, error } = validateMessages(req.body.messages);
    if (error) { sendEvent({ error }); done(); return; }

    const deterministicAnswer = await answerClassStaffQuestion(lastMessage.parts[0].text);
    if (deterministicAnswer) { sendEvent({ text: deterministicAnswer }); done(); return; }

    const [dynamicCtx, userCtx] = await Promise.all([getDynamicContext(), getUserContext(req.user)]);
    const genAI      = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model      = createModel(genAI, SYSTEM_INSTRUCTION + dynamicCtx + userCtx);

    const history = messages.slice(0, -1).slice(-18);
    const chat    = model.startChat({ history });

    req.on('close', () => { res.end(); });

    const result = await chat.sendMessageStream(lastMessage.parts);

    for await (const chunk of result.stream) {
      if (res.writableEnded) break;
      const text = chunk.text();
      if (text) sendEvent({ text });
    }

    done();
  } catch (err) {
    console.error('[ChatStream] Error:', err.message);
    const { message } = handleGeminiError(err);
    sendEvent({ error: message });
    done();
  }
};
