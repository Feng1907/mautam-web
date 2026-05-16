const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const mammoth        = require('mammoth');
const Class          = require('../models/Class');
const Post           = require('../models/Post');
const CountdownEvent = require('../models/CountdownEvent');

// ── System instruction chính ──────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `
Bạn là "Trợ lý Xứ Đoàn" — trợ lý ảo của Xứ Đoàn Thiếu Nhi Thánh Thể Anrê Phú Yên, giáo xứ Mẫu Tâm.

NHÂN CÁCH & GIỌNG ĐIỆU:
- Đóng vai Huynh trưởng tận tâm, am hiểu và khiêm nhường
- Với các em thiếu nhi: xưng "anh/chị", gọi "các em" thân thiện
- Với người lớn / phụ huynh: xưng lễ phép, dùng "dạ", "thưa"
- Ngôn ngữ: Tiếng Việt chuẩn, dùng thuật ngữ Công giáo chính xác
  (Thánh Lễ, Bí Tích, Ân Sủng, Phụng Vụ, Mùa Vọng, Mùa Chay, Mùa Phục Sinh…)
- Tông giọng **ấm áp, khích lệ, thân thiện** — như người anh/chị đang nói chuyện trực tiếp

PHONG CÁCH TRẢ LỜI:
- Sử dụng **Markdown** để trình bày rõ ràng:
  • Dùng **in đậm** cho các điểm quan trọng
  • Dùng *in nghiêng* cho trích dẫn hoặc tên kinh thánh
  • Dùng danh sách \`- \` hoặc \`1. \` khi liệt kê nhiều mục
- Khi người dùng buồn bã, lo lắng hoặc cần khích lệ: tự nhiên trích một câu Kinh Thánh ngắn phù hợp
  (ví dụ: *"Đừng sợ, vì Ta ở với ngươi" — Is 43,5* hoặc *"Mọi sự đều có thể đối với người tin" — Mc 9,23*)
- NHỚ TÊN: Nếu người dùng giới thiệu tên mình, hãy gọi họ bằng tên từ đó trở đi

KIẾN THỨC CỐ ĐỊNH:
- Kinh Thánh & Sách Giáo Lý Hội Thánh Công Giáo (CCC)
- **Giờ lễ**: Ngày thường 05:30, 18:00 · Chúa Nhật 05:30, 09:00, 17:00, 18:30
- **Ngành TNTT**: Chiên Non (6–8t) · Ấu Nhi (9–11t) · Thiếu Nhi (12–14t) · Nghĩa Sĩ (15–17t) · Hiệp Sĩ (18+)
- Khẩu hiệu TNTT: *"Sống Phúc Âm để phục vụ Thiên Chúa và Tổ Quốc"*
- Bổn mạng xứ đoàn: Thánh Anrê Phú Yên (26/07)

GUARDRAILS:
1. CHỈ trả lời: đức tin Công giáo, Giáo lý, Kinh Thánh, sinh hoạt xứ đoàn, giờ lễ, sự kiện, giáo dục đức tin.
2. Nếu câu hỏi KHÔNG liên quan: "Anh/Chị xin lỗi, anh/chị chỉ hỗ trợ các vấn đề về Giáo lý, Kinh Thánh hoặc sinh hoạt Xứ đoàn mình thôi nhé! 🙏"
3. KHÔNG thay thế Bí tích Giải Tội.
4. KHÔNG tư vấn y tế hoặc pháp lý.
5. Tối đa **250 từ** mỗi câu trả lời (có thể dài hơn khi xử lý tệp đính kèm).
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
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

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
    .replace(/[\u0300-\u036f]/g, '')
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

async function getDynamicContext() {
  if (_contextCache.data && Date.now() - _contextCache.ts < CACHE_TTL) return _contextCache.data;

  const [postsRes, eventsRes, classesRes] = await Promise.allSettled([
    Post.find({ daDang: true }).sort('-createdAt').limit(4).select('tieuDe createdAt loai').lean(),
    CountdownEvent.find({ active: true, date: { $gte: new Date() } }).sort('date').limit(4).select('name date icon').lean(),
    Class.find()
      .sort({ thuTu: 1 })
      .select('tenLop nhanh huynhTruong duTruong')
      .populate('huynhTruong', 'hoTen')
      .populate('duTruong', 'hoTen')
      .lean(),
  ]);

  const today  = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const posts  = postsRes.value  || [];
  const events = eventsRes.value || [];
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

  const ctx = `\n\nDỮ LIỆU THỰC TẾ XỨ ĐOÀN:\nHôm nay: ${today}\nTin tức mới:\n${
    posts.length ? posts.map(p => `• ${p.tieuDe} (${new Date(p.createdAt).toLocaleDateString('vi-VN')})`).join('\n') : '• Chưa có.'
  }\nSự kiện sắp tới:\n${
    events.length ? events.map(e => `• ${e.icon || '📅'} ${e.name}: ${new Date(e.date).toLocaleDateString('vi-VN')}`).join('\n') : '• Chưa có.'
  }\nNhan su phu trach lop:\n${classStaff}`;

  _contextCache = { data: ctx, ts: Date.now() };
  return ctx;
}

// ── Chuyển file buffer thành part cho Gemini ──────────────────────────────────
async function buildFilePart(file) {
  const mime = file.mimetype;

  // Ảnh & PDF: gửi trực tiếp qua inlineData (Gemini đọc native)
  if (mime.startsWith('image/') || mime === 'application/pdf') {
    return {
      inlineData: {
        mimeType: mime,
        data: file.buffer.toString('base64'),
      },
    };
  }

  // DOCX: dùng mammoth trích xuất text
  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer });
    return { text: `\n[📝 Nội dung tệp Word: "${file.originalname}"]\n${value.slice(0, 12000)}` };
  }

  // TXT: đọc thẳng
  if (mime === 'text/plain') {
    const text = file.buffer.toString('utf-8');
    return { text: `\n[📃 Nội dung tệp: "${file.originalname}"]\n${text.slice(0, 12000)}` };
  }

  return null;
}

// ── Handler ───────────────────────────────────────────────────────────────────
exports.chat = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ success: false, message: 'Trợ lý Xứ Đoàn chưa được kích hoạt. Liên hệ quản trị viên nhé!' });
  }

  try {
    // messages có thể là JSON string (khi gửi FormData) hoặc object (khi gửi JSON)
    const rawMessages = req.body.messages;
    let messages;
    try {
      messages = typeof rawMessages === 'string' ? JSON.parse(rawMessages) : rawMessages;
    } catch {
      return res.status(400).json({ success: false, message: 'Dữ liệu chat gửi lên không đúng định dạng JSON.' });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'messages là bắt buộc.' });
    }

    messages = messages
      .map((m) => ({
        role: m.role,
        parts: [{ text: String(m.parts?.[0]?.text || '').trim() }],
      }))
      .filter((m) =>
        (m.role === 'user' || m.role === 'model') &&
        m.parts[0].text.length > 0
      );

    const isValid = messages.every(m =>
      (m.role === 'user' || m.role === 'model') &&
      Array.isArray(m.parts) &&
      typeof m.parts[0]?.text === 'string'
    );
    if (messages.length === 0) {
      return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống.' });
    }
    if (!isValid) return res.status(400).json({ success: false, message: 'Định dạng messages không hợp lệ.' });

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      return res.status(400).json({ success: false, message: 'Tin nhắn cuối phải là của người dùng.' });
    }

    const deterministicAnswer = await answerClassStaffQuestion(lastMessage.parts[0].text);
    if (deterministicAnswer) {
      return res.json({ success: true, text: deterministicAnswer });
    }

    // ── Xử lý file đính kèm ──
    const hasFile = !!req.file;
    let filePart  = null;

    if (hasFile) {
      filePart = await buildFilePart(req.file);
      // File buffer đã được xử lý xong — memory sẽ tự giải phóng (không có disk file để xóa)
    }

    // ── Dynamic context + education mode ──
    const dynamicCtx     = await getDynamicContext();
    const educationExtra = hasFile ? EDUCATION_INSTRUCTION : '';

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION + dynamicCtx + educationExtra,
      generationConfig: {
        maxOutputTokens: hasFile ? 1200 : 600,  // cho phép dài hơn khi xử lý tệp
        temperature: 0.75,
        topP: 0.9,
      },
      safetySettings: SAFETY_SETTINGS,
    });

    const history     = messages.slice(0, -1).slice(-18);
    const chat        = model.startChat({ history });

    // ── Xây dựng parts cho tin nhắn cuối ──
    const parts = [...lastMessage.parts]; // copy text parts
    if (filePart) parts.push(filePart);

    const result = await chat.sendMessage(parts);
    const text   = result.response.text();

    res.json({ success: true, text });
  } catch (err) {
    console.error('[ChatController] Error:', err.message);

    if (err.message?.includes('SAFETY')) {
      return res.json({ success: true, text: 'Câu hỏi này anh/chị không thể trả lời. Mời hỏi về Giáo lý, Kinh Thánh hoặc sinh hoạt xứ đoàn nhé! 🙏' });
    }
    if (err.status === 429 || err.message?.includes('429')) {
      return res.status(429).json({ success: false, message: 'Trợ lý Xứ Đoàn đang bận. Vui lòng thử lại sau ít phút nhé! 🙏' });
    }
    if (err.status === 404 || err.message?.includes('404') || err.message?.includes('is not found')) {
      return res.status(503).json({ success: false, message: 'Model AI đang cấu hình không còn khả dụng. Vui lòng báo quản trị viên kiểm tra GEMINI_MODEL.' });
    }
    if (err.message?.includes('API key') || err.message?.includes('403') || err.message?.includes('401')) {
      return res.status(503).json({ success: false, message: 'Khoá Gemini API chưa hợp lệ hoặc chưa được cấp quyền. Vui lòng báo quản trị viên.' });
    }
    if (err.message?.includes('JSON')) {
      return res.status(400).json({ success: false, message: 'Dữ liệu gửi lên không hợp lệ.' });
    }

    res.status(500).json({ success: false, message: 'Trợ lý Xứ Đoàn đang gặp sự cố kỹ thuật. Thử lại sau nhé! 🙏' });
  }
};
