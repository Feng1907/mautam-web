/**
 * loiChuaController.js
 *
 * Nguồn dữ liệu (theo thứ tự ưu tiên):
 *  1. tgpsaigon.net — lịch Việt Nam chính thống, đầy đủ Đáp ca + Tung hô
 *  2. loichua.net HTML — fallback
 *  3. loichua.net JSON API — fallback cuối
 *
 * Cache in-memory 6h: 100 user cùng ngày chỉ cào nguồn 1 lần.
 */

const axios   = require('axios');
const cheerio = require('cheerio');

// ── Cache ─────────────────────────────────────────────────────────────────────
const CACHE     = new Map();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 giờ

const getCache = (key) => {
  const hit = CACHE.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > CACHE_TTL) { CACHE.delete(key); return null; }
  return hit.data;
};
const setCache = (key, data) => CACHE.set(key, { data, ts: Date.now() });

// ── HTTP client ───────────────────────────────────────────────────────────────
const http = axios.create({
  timeout: 15_000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      'Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.5',
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const toPlain = (html = '') =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

// Bọc lời Chúa Giêsu trong <span class="voice-jesus">
// Nhận dạng: chuỗi trong dấu ngoặc kép Việt "…" hoặc "…"
const markJesusWords = (text = '') =>
  text
    .replace(/"([^"]{5,})"/g,  '<span class="voice-jesus">"$1"</span>')
    .replace(/“([^”]{5,})”/g, '<span class="voice-jesus">“$1”</span>');

const pickKeyVerse = (plain = '') =>
  plain.split('\n').map(l => l.trim()).find(l => l.length >= 30) ?? '';

const detectColor = (text = '') => {
  const t = text.toLowerCase();
  if (/màu đỏ|áo đỏ|lễ tử đạo|lễ thánh hiệu|chúa thánh thần/.test(t)) return 'do';
  if (/màu tím|áo tím|mùa chay|mùa vọng/.test(t))  return 'tim';
  if (/màu trắng|áo trắng|mùa phục sinh|lễ đức mẹ|lễ các thánh/.test(t)) return 'trang';
  if (/màu hồng|áo hồng/.test(t)) return 'hong';
  return 'xanh';
};

// ── Section mapping ───────────────────────────────────────────────────────────
const SECTION_LABELS = {
  baidoc1: 'Bài Đọc 1',
  dapca:   'Đáp Ca',
  baidoc2: 'Bài Đọc 2',
  tunghoe: 'Tung Hô Tin Mừng',
  phucam:  'Phúc Âm',
};

const LABEL_PATTERNS = [
  { key: 'baidoc1', re: /bài\s*đọc\s*(1|i|một)/i },
  { key: 'dapca',   re: /đáp\s*ca|thánh\s*vịnh/i },
  { key: 'baidoc2', re: /bài\s*đọc\s*(2|ii|hai)/i },
  { key: 'tunghoe', re: /tung\s*hô|alleluia/i },
  { key: 'phucam',  re: /phúc\s*âm|tin\s*mừng/i },
];

const matchSection = (text = '') =>
  LABEL_PATTERNS.find(m => m.re.test(text))?.key ?? null;

// ── Romcal: lấy mùa + màu phụng vụ chính xác cho một ngày ──────────────────
// Cache romcal theo năm (mỗi năm chỉ build 1 lần)
const ROMCAL_YEAR_CACHE = new Map();

const COLOR_MAP = {
  WHITE: 'trang', GOLD: 'trang',
  RED:   'do',
  PURPLE:'tim',   VIOLET: 'tim',
  GREEN: 'xanh',
  ROSE:  'hong',
};

const SEASON_VI = {
  'Easter':        'Mùa Phục Sinh',
  'Ordinary Time': 'Mùa Thường Niên',
  'Advent':        'Mùa Vọng',
  'Christmas':     'Mùa Giáng Sinh',
  'Lent':          'Mùa Chay',
  'Holy Week':     'Tuần Thánh',
};

const getSeasonFromRomcal = async (isoDate) => {
  try {
    const [y] = isoDate.split('-');
    const year = parseInt(y, 10);

    if (!ROMCAL_YEAR_CACHE.has(year)) {
      const Romcal  = require('romcal');
      let calendar  = Romcal.calendarFor({ year, locale: 'vi' });
      if (calendar && typeof calendar.then === 'function') calendar = await calendar;
      ROMCAL_YEAR_CACHE.set(year, Object.values(calendar));
    }

    const entries = ROMCAL_YEAR_CACHE.get(year);
    // Tìm entry khớp ngày (moment là ISO string: YYYY-MM-DD...)
    const entry = entries.find(e => e?.moment?.slice(0, 10) === isoDate);
    if (!entry) return null;

    const colorKey  = (entry.data?.meta?.liturgicalColor?.key || 'GREEN').toUpperCase();
    const mauKey    = COLOR_MAP[colorKey] || 'xanh';
    const seasonEn  = entry.data?.season?.key || entry.data?.season || '';
    // Chuẩn hoá: romcal v1.x đôi khi trả về dạng "Ordinary Time" hoặc ORDINARY_TIME
    const seasonClean = String(seasonEn).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const seasonName  = SEASON_VI[seasonClean] || seasonClean || 'Mùa Thường Niên';

    return { mauKey, seasonName, colorKey };
  } catch {
    return null; // romcal lỗi → dùng heuristic text
  }
};

// ── Nguồn 1: tgpsaigon.net ───────────────────────────────────────────────────
// URL format: https://tgpsaigon.net/loi-chua/ngay-DD-MM-YYYY

const tgpsaigonUrl = (isoDate) => {
  const [y, m, d] = isoDate.split('-');
  return `https://tgpsaigon.net/loi-chua/ngay-${d}-${m}-${y}`;
};

const scrapeTGPSG = async (isoDate) => {
  const url = tgpsaigonUrl(isoDate);
  let html;
  try {
    const res = await http.get(url);
    if (res.status !== 200 || !res.data) return null;
    html = res.data;
  } catch {
    return null;
  }

  const $ = cheerio.load(html);

  // Tên ngày lễ — thường nằm trong h1 hoặc .field-name-title
  const name =
    $('h1.page-header, h1.title, .page-header h1, h1').first().text().trim() ||
    $('title').text().split(/[|\-–]/)[0].trim() ||
    `Lời Chúa ${isoDate}`;

  // Phát hiện màu phụng vụ từ toàn trang
  const bodyText = $('body').text();
  const mauKey   = detectColor(bodyText);

  // Vùng nội dung chính trên TGPSG
  const $content = $(
    '.field-name-body, .field-body, .node-content, .content, article .content, #content-area'
  ).first();
  const $root = $content.length ? $content : $('body');

  const sections = [];
  const seen = new Set();

  // Chiến lược 1: heading rõ ràng (h2, h3, strong in tiêu đề)
  $root.find('h2, h3, h4, strong, b, p > strong, p > b').each((_, el) => {
    const headText = $(el).text().trim();
    const key = matchSection(headText);
    if (!key || seen.has(key)) return;
    seen.add(key);

    // Trich dẫn (nguồn sách)
    let trich = '';
    const $sib = $(el).next();
    if ($sib.is('em, i') || $sib.find('em, i').length) {
      trich = ($sib.is('em, i') ? $sib : $sib.find('em, i').first()).text().trim();
    }
    // Thử tìm em trong cùng parent
    if (!trich) {
      const $emInParent = $(el).closest('p, div').find('em, i').first();
      if ($emInParent.length) trich = $emInParent.text().trim();
    }

    // Thu nội dung các thẻ block liền sau cho đến heading kế
    const bodyParts = [];
    let cur = $(el).parent().is('p, div') ? $(el).parent().next() : $(el).next();
    if (cur.is('em, i') && !trich) { trich = cur.text().trim(); cur = cur.next(); }
    let limit = 30; // tối đa 30 sibling để tránh vô hạn
    while (cur.length && limit-- > 0) {
      const tag = cur.prop('tagName')?.toLowerCase();
      if (['h2','h3','h4'].includes(tag)) break;
      const t = cur.text().trim();
      if (t && matchSection(t)) break;
      if (!cur.is('hr')) bodyParts.push($.html(cur));
      cur = cur.next();
    }

    const rawHtml  = bodyParts.join('');
    const plain    = toPlain(rawHtml);
    if (plain.length < 10) return;

    const richHtml = key === 'phucam' ? markJesusWords(plain) : plain;

    sections.push({ key, label: SECTION_LABELS[key], trich, noidung: plain, html: richHtml });
  });

  // Chiến lược 2: text-split fallback nếu không parse được heading
  if (sections.length === 0) {
    const allText = toPlain($root.html() || '');
    const parts   = allText.split(
      /(?=\n(?:BÀI ĐỌC|ĐÁP CA|THÁNH VỊNH|TUNG HÔ|ALLELUIA|PHÚC ÂM|TIN MỪNG))/i
    );
    parts.forEach(part => {
      const lines = part.split('\n').filter(Boolean);
      const key   = matchSection(lines[0] || '');
      if (!key || seen.has(key)) return;
      seen.add(key);
      const body = lines.slice(1).join('\n').trim();
      if (body.length < 10) return;
      sections.push({
        key,
        label:   SECTION_LABELS[key],
        trich:   '',
        noidung: body,
        html:    key === 'phucam' ? markJesusWords(body) : body,
      });
    });
  }

  if (sections.length === 0) return null;

  // Sắp xếp theo thứ tự đúng
  const ORDER = ['baidoc1','dapca','baidoc2','tunghoe','phucam'];
  sections.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));

  const phucam   = sections.find(s => s.key === 'phucam');
  const keyVerse = pickKeyVerse(phucam?.noidung || '');

  return {
    name,
    mauKey,
    sections,
    keyVerse,
    tinMungTen: phucam?.trich || '',
    sourceUrl:  url,
    source:     'tgpsaigon.net',
  };
};

// ── Nguồn 2: loichua.net HTML ─────────────────────────────────────────────────
const loiChuaHtmlUrls = (isoDate) => {
  const [y, m, d] = isoDate.split('-');
  return [
    `https://www.loichua.net/loi-chua/${y}/${m}/${d}`,
    `https://loichua.net/loi-chua/${y}/${m}/${d}`,
  ];
};

const scrapeLoiChuaHtml = async (isoDate) => {
  let $, html, workingUrl;
  for (const url of loiChuaHtmlUrls(isoDate)) {
    try {
      const res = await http.get(url);
      if (res.status === 200 && res.data) { html = res.data; workingUrl = url; break; }
    } catch { /* try next */ }
  }
  if (!html) return null;

  $ = cheerio.load(html);

  const name =
    $('h1.entry-title, .entry-title, h1').first().text().trim() ||
    $('title').text().split(/[|\-–]/)[0].trim() ||
    `Lời Chúa ${isoDate}`;

  const mauKey = detectColor($('body').text());
  const $body  = $('.entry-content, .post-content, article .content, .field-body, #content').first();
  const $root  = $body.length ? $body : $('body');
  const sections = [];
  const seen     = new Set();

  $root.find('h1,h2,h3,h4,h5,strong,b').each((_, el) => {
    const headText = $(el).text().trim();
    const key = matchSection(headText);
    if (!key || seen.has(key)) return;
    seen.add(key);

    let trich = '';
    const $nextEl = $(el).next();
    if ($nextEl.is('em,i') || $nextEl.find('em,i').length) {
      trich = ($nextEl.is('em,i') ? $nextEl : $nextEl.find('em,i').first()).text().trim();
    }

    const bodyParts = [];
    let cur = $(el).next();
    if (cur.is('em,i') && !trich) { trich = cur.text().trim(); cur = cur.next(); }
    let limit = 30;
    while (cur.length && limit-- > 0) {
      if (cur.is('h1,h2,h3,h4,h5')) break;
      if (!cur.is('hr')) bodyParts.push($.html(cur));
      cur = cur.next();
    }

    const plain = toPlain(bodyParts.join(''));
    if (plain.length < 10) return;

    sections.push({
      key, label: SECTION_LABELS[key], trich,
      noidung: plain,
      html: key === 'phucam' ? markJesusWords(plain) : plain,
    });
  });

  if (sections.length === 0) return null;

  const ORDER = ['baidoc1','dapca','baidoc2','tunghoe','phucam'];
  sections.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));

  const phucam   = sections.find(s => s.key === 'phucam');
  const keyVerse = pickKeyVerse(phucam?.noidung || '');

  return {
    name, mauKey, sections, keyVerse,
    tinMungTen: phucam?.trich || '',
    sourceUrl: workingUrl,
    source: 'loichua.net (html)',
  };
};

// ── Nguồn 3: loichua.net JSON API ─────────────────────────────────────────────
const fetchLoiChuaApi = async (isoDate) => {
  const res = await http.get(`https://www.loichua.net/api/daily?date=${isoDate}`);
  const raw = res.data;
  if (!raw) return null;

  const pick  = (a, b) => raw[a] || raw[b];
  const toSec = (key, label, src) => src ? {
    key, label,
    trich:   src.trich || src.title || '',
    noidung: src.noidung || src.text || '',
    html:    key === 'phucam'
      ? markJesusWords(src.noidung || src.text || '')
      : (src.noidung || src.text || ''),
  } : null;

  const sections = [
    toSec('baidoc1', 'Bài Đọc 1',        pick('baidoc1','reading1')),
    toSec('dapca',   'Đáp Ca',            pick('dapca',  'psalm')),
    toSec('baidoc2', 'Bài Đọc 2',        pick('baidoc2','reading2')),
    toSec('tunghoe', 'Tung Hô Tin Mừng', pick('tunghoe','alleluia')),
    toSec('phucam',  'Phúc Âm',          pick('phucam', 'gospel')),
  ].filter(s => s && (s.noidung || s.trich));

  const phucam   = sections.find(s => s.key === 'phucam');
  const keyVerse = pickKeyVerse(phucam?.noidung || '');

  return {
    name:       raw.name || raw.title || raw.liturgicalDay || 'Lời Chúa hôm nay',
    mauKey:     raw.color || 'xanh',
    sections,
    keyVerse,
    tinMungTen: phucam?.trich || '',
    sourceUrl:  `https://www.loichua.net/api/daily?date=${isoDate}`,
    source:     'loichua.net (api)',
  };
};

// ── Route handler ─────────────────────────────────────────────────────────────
exports.getLoiChua = async (req, res) => {
  try {
    let { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      date = new Date().toISOString().slice(0, 10);
    }

    const cached = getCache(date);
    if (cached) return res.json({ success: true, cached: true, data: cached });

    let data = null;

    // 1. TGPSG — nguồn chính
    try { data = await scrapeTGPSG(date); } catch { /* ignore */ }

    // 2. loichua.net HTML — fallback
    if (!data || data.sections.length === 0) {
      try { data = await scrapeLoiChuaHtml(date); } catch { /* ignore */ }
    }

    // 3. loichua.net API — fallback cuối
    if (!data || data.sections.length === 0) {
      try { data = await fetchLoiChuaApi(date); } catch { /* ignore */ }
    }

    if (!data) {
      return res.status(502).json({
        success: false,
        message: 'Không lấy được dữ liệu Lời Chúa. Vui lòng thử lại sau.',
      });
    }

    // Enrich với mùa phụng vụ từ romcal (chính xác hơn heuristic text)
    const season = await getSeasonFromRomcal(date);
    if (season) {
      data.mauKey     = season.mauKey;
      data.seasonName = season.seasonName;
    } else {
      // Fallback: map mauKey → tên mùa hiển thị
      const FALLBACK_SEASON = {
        do: 'Màu Đỏ', tim: 'Màu Tím', trang: 'Màu Trắng', hong: 'Màu Hồng', xanh: 'Mùa Thường Niên',
      };
      data.seasonName = FALLBACK_SEASON[data.mauKey] || 'Mùa Thường Niên';
    }

    setCache(date, data);
    res.json({ success: true, cached: false, data });
  } catch (err) {
    console.error('[loiChua]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
