/**
 * loiChuaController.js
 *
 * Nguồn dữ liệu (theo thứ tự ưu tiên):
 *  1. tgpsaigon.net — lịch Việt Nam chính thống, đầy đủ Đáp ca + Tung hô
 *  2. loichua.net HTML — fallback (nếu còn sống)
 *  3. loichua.net JSON API — fallback cuối (nếu còn sống)
 *
 * Cache in-memory 6h: 100 user cùng ngày chỉ cào nguồn 1 lần.
 */

const axios   = require('axios');
const cheerio = require('cheerio');
const Romcal  = require('romcal');
const fs      = require('fs');
const path    = require('path');
const { logger } = require('../utils/logger');

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
  // baidoc2 phải đứng trước baidoc1 để "BÀI ĐỌC II" không bị khớp nhầm bởi regex baidoc1
  { key: 'baidoc2', re: /bài\s*đọc\s*(2|ii|hai)/i },
  // baidoc1: khớp cả "BÀI ĐỌC I", "BÀI ĐỌC 1", "BÀI ĐỌC MỘT", và "BÀI ĐỌC" trơn (ngày thường)
  { key: 'baidoc1', re: /bài\s*đọc(\s*(1|i(?!i)|một))?(?!\s*(2|ii|hai))/i },
  { key: 'dapca',   re: /đáp\s*ca|thánh\s*vịnh/i },
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
        let calendar  = Romcal.calendarFor({ year, locale: 'vi' });
      if (calendar && typeof calendar.then === 'function') calendar = await calendar;
      ROMCAL_YEAR_CACHE.set(year, Object.values(calendar));
    }

    const entries = ROMCAL_YEAR_CACHE.get(year);
    // Tìm entry khớp ngày (moment là ISO string: YYYY-MM-DD...)
    const allEntries = entries.filter(e => e?.moment?.slice(0, 10) === isoDate);
    
    // Ưu tiên các ngày lễ (SOLEMNITY, FEAST) hơn ngày thường (FERIA)
    const entry = allEntries.find(e => ['SOLEMNITY', 'FEAST', 'SUNDAY'].includes(e.type)) || allEntries[0];
    
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
// Cấu trúc mới (2026): bài viết theo slug dưới category loi-chua-hang-ngay
// Category: https://tgpsaigon.net/diem-tin/loi-chua-hang-ngay-10
// Date nằm trong .article-content-date: "Ngày DD/MM/YYYY"

const TGPSG_CATEGORY = 'https://tgpsaigon.net/diem-tin/loi-chua-hang-ngay-10';

const scrapeTGPSG = async (isoDate) => {
  // Bước 1: Lấy danh sách bài viết từ trang category
  logger.info(`[TGPSG] Fetching category: ${TGPSG_CATEGORY}`);
  let articleLinks;
  try {
    const catRes = await http.get(TGPSG_CATEGORY);
    logger.info(`[TGPSG] Category HTTP: ${catRes.status}, length: ${catRes.data?.length ?? 0}`);
    if (catRes.status !== 200 || !catRes.data) return null;
    const $cat = cheerio.load(catRes.data);
    const seenLinks = new Set();
    articleLinks = [];
    $cat('a[href^="/bai-viet/"]').each((_, e) => {
      const href = $cat(e).attr('href');
      if (href && !seenLinks.has(href)) { seenLinks.add(href); articleLinks.push(href); }
    });
    logger.info(`[TGPSG] Tìm được ${articleLinks.length} bài viết trên category`);
  } catch (err) {
    logger.info(`[TGPSG] Lỗi fetch category: ${err.message}`);
    return null;
  }
  if (!articleLinks || articleLinks.length === 0) return null;

  // Bước 2: Tìm bài viết khớp ngày qua .article-content-date = "Ngày DD/MM/YYYY"
  const [y, m, d] = isoDate.split('-');
  const targetDateText = `Ngày ${d}/${m}/${y}`;
  logger.info(`[TGPSG] Tìm bài có date: "${targetDateText}"`);

  let matchedUrl = null;
  let matchedHtml = null;
  let fallbackUrl = null;
  let fallbackHtml = null;
  let fallbackDate = null;

  for (const link of articleLinks.slice(0, 14)) {
    const artUrl = `https://tgpsaigon.net${link}`;
    logger.info(`[TGPSG] Kiểm tra: ${artUrl}`);
    try {
      const artRes = await http.get(artUrl);
      if (artRes.status !== 200 || !artRes.data) continue;
      const $art = cheerio.load(artRes.data);
      const artDate = $art('.article-content-date').text().trim();
      logger.info(`[TGPSG]   → date: "${artDate}"`);
      if (artDate === targetDateText) {
        matchedUrl = artUrl;
        matchedHtml = artRes.data;
        logger.info(`[TGPSG] Tìm thấy bài khớp!`);
        break;
      }
      // Giữ lại bài gần nhất làm fallback
      if (!fallbackHtml && artDate) {
        fallbackUrl = artUrl;
        fallbackHtml = artRes.data;
        fallbackDate = artDate;
      }
    } catch (err) {
      logger.info(`[TGPSG]   Lỗi fetch article: ${err.message}`);
    }
  }

  // Nếu không tìm thấy bài cho ngày yêu cầu, dùng bài gần nhất (thường xảy ra
  // khi bài hôm nay chưa được đăng, nhưng bài hôm qua / gần đây vẫn có thể dùng)
  if (!matchedHtml && fallbackHtml) {
    logger.info(`[TGPSG] Không có bài cho ${isoDate}, dùng bài gần nhất: ${fallbackDate}`);
    matchedHtml = fallbackHtml;
    matchedUrl  = fallbackUrl;
  }

  if (!matchedHtml) {
    logger.info(`[TGPSG] Không tìm thấy bài nào cho ngày ${isoDate}`);
    return null;
  }

  // Dump HTML ra debug/
  try {
    const debugDir = path.join(__dirname, '..', '..', 'debug');
    if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
    fs.writeFileSync(path.join(debugDir, `tgpsg-${isoDate}.html`), matchedHtml, 'utf8');
    logger.info(`[TGPSG] HTML dumped: debug/tgpsg-${isoDate}.html`);
  } catch (e) {
    logger.info(`[TGPSG] Không dump được HTML: ${e.message}`);
  }

  const $ = cheerio.load(matchedHtml);

  // Tên ngày lễ từ h1
  const name =
    $('h1').first().text().trim() ||
    $('title').text().split(/[|\-–]/)[0].trim() ||
    `Lời Chúa ${isoDate}`;

  const bodyText = $('body').text();
  const mauKey   = detectColor(bodyText);

  // Container nội dung chính: div.article-detail (cấu trúc TGPSG 2026)
  const $root = $('.article-detail').first().length
    ? $('.article-detail').first()
    : $('body');
  logger.info(`[TGPSG] $root: ${$root.prop('tagName')}.${$root.attr('class')?.split(' ')[0] ?? ''}`);

  const sections = [];
  const seenSec  = new Set();

  // TGPSG 2026 dùng <strong> cho tiêu đề: BÀI ĐỌC I, ĐÁP CA, Tin mừng
  $root.find('strong, b').each((_, el) => {
    const headText = $(el).text().trim();
    const key = matchSection(headText);
    if (!key || seenSec.has(key)) return;
    seenSec.add(key);

    // Trích dẫn sách: ưu tiên phần sau dấu : trong headText,
    // fallback: lấy text nằm ngoài <strong>/<b> trong cùng block (VD: "<strong>BÀI ĐỌC I</strong> (Cv 8, 26-40)")
    let trich = '';
    if (headText.includes(':')) {
      trich = headText.split(':').slice(1).join(':').trim();
    } else {
      const $par = $(el).parent();
      if ($par.length) {
        const parFull = $par.text().trim();
        const afterHead = parFull.slice(headText.length).replace(/^[\s:\-–—(]+/, '').replace(/\)+$/, '').trim();
        if (afterHead.length > 2 && afterHead.length < 80) trich = afterHead;
      }
    }

    // <strong> có thể nằm sâu trong <span><span><p> → tìm block ancestor gần nhất
    const bodyParts = [];
    const $blockAncestor = $(el).closest('p, div, li');
    let cur = $blockAncestor.length ? $blockAncestor.next() : $(el).next();
    let limit = 60;
    while (cur.length && limit-- > 0) {
      const tag = cur.prop('tagName')?.toLowerCase();
      if (['h1','h2','h3','h4'].includes(tag)) break;
      // Dừng khi gặp <p> chứa strong là section header tiếp theo
      if (tag === 'p' && matchSection(cur.find('strong, b').first().text())) break;
      // Dừng khi vào phần suy niệm
      if (tag === 'h2' && /suy\s*niệm/i.test(cur.text())) break;
      if (!cur.is('hr')) bodyParts.push($.html(cur));
      cur = cur.next();
    }

    const plain = toPlain(bodyParts.join(''));
    if (plain.length < 10) return;
    const richHtml = key === 'phucam' ? markJesusWords(plain) : plain;
    sections.push({ key, label: SECTION_LABELS[key], trich, noidung: plain, html: richHtml });
  });

  logger.info(`[TGPSG] Số sections: ${sections.length}, keys: [${sections.map(s=>s.key).join(', ')}]`);

  // Fallback text-split
  if (sections.length === 0) {
    logger.info(`[TGPSG] Thử fallback text-split...`);
    const allText = toPlain($root.html() || '');
    const parts   = allText.split(
      /(?=\n(?:BÀI ĐỌC|ĐÁP CA|THÁNH VỊNH|TUNG HÔ|ALLELUIA|PHÚC ÂM|TIN MỪNG))/i
    );
    parts.forEach(part => {
      const lines = part.split('\n').filter(Boolean);
      const key   = matchSection(lines[0] || '');
      if (!key || seenSec.has(key)) return;
      seenSec.add(key);
      const body = lines.slice(1).join('\n').trim();
      if (body.length < 10) return;
      sections.push({
        key, label: SECTION_LABELS[key], trich: '',
        noidung: body,
        html: key === 'phucam' ? markJesusWords(body) : body,
      });
    });
    logger.info(`[TGPSG] Fallback sections: ${sections.length}`);
  }

  if (sections.length === 0) return null;

  // Sắp xếp theo thứ tự đúng
  const ORDER = ['baidoc1','dapca','baidoc2','tunghoe','phucam'];
  sections.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));

  const phucam   = sections.find(s => s.key === 'phucam');
  const keyVerse = pickKeyVerse(phucam?.noidung || '');

  // Lấy date thực tế từ bài viết (có thể khác isoDate nếu dùng fallback)
  const $meta = cheerio.load(matchedHtml);
  const actualDateText = $meta('.article-content-date').text().trim();

  return {
    name,
    mauKey,
    sections,
    keyVerse,
    tinMungTen: phucam?.trich || '',
    sourceUrl:  matchedUrl,
    source:     'tgpsaigon.net',
    actualDate: actualDateText || null,
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
    logger.info(`[loichua.net HTML] Fetching: ${url}`);
    try {
      const res = await http.get(url);
      logger.info(`[loichua.net HTML] HTTP status: ${res.status}`);
      if (res.status === 200 && res.data) { html = res.data; workingUrl = url; break; }
    } catch (err) {
      logger.info(`[loichua.net HTML] Lỗi: ${err.message}`);
    }
  }
  // loichua.net đã chết: trả về redirect HTML 114 bytes về /lander
  if (!html || html.length < 500) {
    logger.info(`[loichua.net HTML] Trang trả về quá ngắn (${html?.length ?? 0} bytes) — có thể đã chết`);
    return null;
  }

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

  logger.info(`[loichua.net HTML] Số sections: ${sections.length}, keys: [${sections.map(s=>s.key).join(', ')}]`);
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
  const apiUrl = `https://www.loichua.net/api/daily?date=${isoDate}`;
  logger.info(`[loichua.net API] Fetching: ${apiUrl}`);
  const res = await http.get(apiUrl);
  const raw = res.data;
  // API đã chết: trả về HTML redirect thay vì JSON object
  if (!raw || typeof raw === 'string') {
    logger.info(`[loichua.net API] HTTP ${res.status}, nhận string (HTML?) thay vì JSON — API đã chết`);
    return null;
  }
  logger.info(`[loichua.net API] HTTP status: ${res.status}, keys: ${Object.keys(raw).join(', ')}`);


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
    const attemptedSources = [];

    // 1. TGPSG — nguồn chính
    logger.info(`[loiChua] Thử nguồn 1 (TGPSG) cho ngày: ${date}`);
    try {
      data = await scrapeTGPSG(date);
      attemptedSources.push({ source: 'tgpsaigon.net', sections: data?.sections?.length ?? 0, ok: !!data });
      logger.info(`[loiChua] TGPSG → sections=${data?.sections?.length ?? 'null'}`);
    } catch (err) {
      attemptedSources.push({ source: 'tgpsaigon.net', error: err.message, ok: false });
      logger.info(`[loiChua] TGPSG throw: ${err.message}`);
    }

    // 2. loichua.net HTML — fallback
    if (!data || data.sections.length === 0) {
      logger.info(`[loiChua] Thử nguồn 2 (loichua.net HTML)...`);
      try {
        data = await scrapeLoiChuaHtml(date);
        attemptedSources.push({ source: 'loichua.net (html)', sections: data?.sections?.length ?? 0, ok: !!data });
        logger.info(`[loiChua] loichua.net HTML → sections=${data?.sections?.length ?? 'null'}`);
      } catch (err) {
        attemptedSources.push({ source: 'loichua.net (html)', error: err.message, ok: false });
        logger.info(`[loiChua] loichua.net HTML throw: ${err.message}`);
      }
    }

    // 3. loichua.net API — fallback cuối
    if (!data || data.sections.length === 0) {
      logger.info(`[loiChua] Thử nguồn 3 (loichua.net API)...`);
      try {
        data = await fetchLoiChuaApi(date);
        attemptedSources.push({ source: 'loichua.net (api)', sections: data?.sections?.length ?? 0, ok: !!data });
        logger.info(`[loiChua] loichua.net API → sections=${data?.sections?.length ?? 'null'}`);
      } catch (err) {
        attemptedSources.push({ source: 'loichua.net (api)', error: err.message, ok: false });
        logger.info(`[loiChua] loichua.net API throw: ${err.message}`);
      }
    }

    if (!data) {
      logger.info(`[loiChua] TẤT CẢ nguồn đều thất bại cho ${date}:`, attemptedSources);
      return res.status(502).json({
        success: false,
        message: 'Không lấy được dữ liệu Lời Chúa. Vui lòng thử lại sau.',
        attemptedSources,
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
    logger.error('[loiChua]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
