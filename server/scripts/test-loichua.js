/**
 * test-loichua.js — chạy độc lập để debug scrape Lời Chúa
 * Cách dùng: node scripts/test-loichua.js
 */

const axios   = require('axios');
const cheerio = require('cheerio');
const fs      = require('fs');
const path    = require('path');

const TEST_DATES = [
  '2026-05-03', // Chúa Nhật vừa rồi
  '2026-05-05', // Hôm qua (Thứ Ba)
  '2026-05-06', // Hôm nay (Thứ Tư)
];

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

const LABEL_PATTERNS = [
  { key: 'baidoc1', re: /bài\s*đọc\s*(1|i|một)/i },
  { key: 'dapca',   re: /đáp\s*ca|thánh\s*vịnh/i },
  { key: 'baidoc2', re: /bài\s*đọc\s*(2|ii|hai)/i },
  { key: 'tunghoe', re: /tung\s*hô|alleluia/i },
  { key: 'phucam',  re: /phúc\s*âm|tin\s*mừng/i },
];
const matchSection = (text = '') =>
  LABEL_PATTERNS.find(m => m.re.test(text))?.key ?? null;

const debugDir = path.join(__dirname, '..', 'debug');
if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });

// ── TGPSG (cấu trúc 2026: category → bài viết theo date) ─────────────────────
const TGPSG_CATEGORY = 'https://tgpsaigon.net/diem-tin/loi-chua-hang-ngay-10';

const testTGPSG = async (isoDate) => {
  // Bước 1: lấy danh sách bài từ category
  console.log(`\n  [TGPSG] Fetching category: ${TGPSG_CATEGORY}`);
  let articleLinks;
  try {
    const catRes = await http.get(TGPSG_CATEGORY);
    console.log(`  [TGPSG] Category HTTP: ${catRes.status} | length: ${catRes.data?.length ?? 0}`);
    if (catRes.status !== 200) return { ok: false, reason: `Category HTTP ${catRes.status}` };
    const $cat = cheerio.load(catRes.data);
    const seenLinks = new Set();
    articleLinks = [];
    $cat('a[href^="/bai-viet/"]').each((_, e) => {
      const href = $cat(e).attr('href');
      if (href && !seenLinks.has(href)) { seenLinks.add(href); articleLinks.push(href); }
    });
    console.log(`  [TGPSG] Số bài viết: ${articleLinks.length} | đầu tiên: ${articleLinks[0] ?? 'N/A'}`);
  } catch (err) {
    console.log(`  [TGPSG] Lỗi fetch category: ${err.message}`);
    return { ok: false, reason: err.message };
  }

  if (!articleLinks?.length) return { ok: false, reason: 'Không có bài viết nào' };

  // Bước 2: tìm bài khớp ngày
  const [y, m, d] = isoDate.split('-');
  const targetDateText = `Ngày ${d}/${m}/${y}`;
  console.log(`  [TGPSG] Tìm bài có date: "${targetDateText}"`);

  for (const link of articleLinks.slice(0, 7)) {
    const artUrl = `https://tgpsaigon.net${link}`;
    try {
      const artRes = await http.get(artUrl);
      if (artRes.status !== 200) continue;
      const $ = cheerio.load(artRes.data);
      const artDate = $('.article-content-date').text().trim();
      console.log(`  [TGPSG]   ${link.slice(0, 55)} → "${artDate}"`);
      if (artDate === targetDateText) {
        // Dump HTML
        fs.writeFileSync(path.join(debugDir, `tgpsg-${isoDate}.html`), artRes.data, 'utf8');
        // Tìm sections trong .article-detail
        const $root = $('.article-detail').first().length ? $('.article-detail').first() : $('body');
        const foundKeys = [];
        $root.find('strong, b').each((_, el) => {
          const t = $(el).text().trim();
          const k = matchSection(t);
          if (k && !foundKeys.includes(k)) foundKeys.push(k);
        });
        const sectionTexts = $root.find('strong').map((_,e)=>$(e).text().trim()).get()
          .filter(t => t.length > 3 && t.length < 100).slice(0, 8);
        console.log(`  [TGPSG] MATCH! section keys: [${foundKeys.join(', ')}]`);
        console.log(`  [TGPSG] Strong texts: ${JSON.stringify(sectionTexts)}`);
        return { ok: true, foundKeys, url: artUrl };
      }
    } catch (err) {
      console.log(`  [TGPSG]   Lỗi fetch: ${err.message}`);
    }
  }
  return { ok: false, reason: `Không có bài cho "${targetDateText}" trong 7 bài đầu` };
};

// ── loichua.net HTML ───────────────────────────────────────────────────────────
const testLoiChuaHtml = async (isoDate) => {
  const [y, m, d] = isoDate.split('-');
  const url = `https://www.loichua.net/loi-chua/${y}/${m}/${d}`;
  console.log(`\n  [loichua.net HTML] URL: ${url}`);

  try {
    const res = await http.get(url);
    console.log(`  [loichua.net HTML] HTTP: ${res.status} | length: ${res.data?.length ?? 0}`);
    if (res.status !== 200 || !res.data || res.data.length < 500) {
      return { ok: false, reason: `HTTP ${res.status} hoặc response quá ngắn (${res.data?.length ?? 0} bytes)` };
    }
    const $ = cheerio.load(res.data);
    const foundKeys = [];
    $('h1,h2,h3,h4,h5,strong,b').each((_, el) => {
      const t = $(el).text().trim();
      const k = matchSection(t);
      if (k && !foundKeys.includes(k)) foundKeys.push(k);
    });
    console.log(`  [loichua.net HTML] Section keys: [${foundKeys.join(', ')}]`);
    return { ok: true, foundKeys };
  } catch (err) {
    console.log(`  [loichua.net HTML] Lỗi: ${err.message}`);
    return { ok: false, reason: err.message };
  }
};

// ── loichua.net API ────────────────────────────────────────────────────────────
const testLoiChuaApi = async (isoDate) => {
  const url = `https://www.loichua.net/api/daily?date=${isoDate}`;
  console.log(`\n  [loichua.net API] URL: ${url}`);

  try {
    const res = await http.get(url);
    console.log(`  [loichua.net API] HTTP: ${res.status} | type: ${typeof res.data}`);
    if (res.status !== 200 || !res.data) return { ok: false, reason: `HTTP ${res.status}` };
    if (typeof res.data === 'string') {
      return { ok: false, reason: `Trả về HTML/string thay vì JSON — API đã chết` };
    }
    const keys = Object.keys(res.data);
    console.log(`  [loichua.net API] Keys: ${JSON.stringify(keys.slice(0, 10))}`);
    return { ok: true, keys };
  } catch (err) {
    console.log(`  [loichua.net API] Lỗi: ${err.message}`);
    return { ok: false, reason: err.message };
  }
};

// ── Main ───────────────────────────────────────────────────────────────────────
const main = async () => {
  console.log('='.repeat(60));
  console.log('TEST LOI CHUA SCRAPER (cấu trúc 2026)');
  console.log('='.repeat(60));

  for (const date of TEST_DATES) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`Ngày: ${date}`);
    console.log('─'.repeat(50));

    const tgpsg  = await testTGPSG(date);
    const lcHtml = await testLoiChuaHtml(date);
    const lcApi  = await testLoiChuaApi(date);

    console.log(`\n  TỔNG KẾT ${date}:`);
    console.log(`    TGPSG       : ${tgpsg.ok  ? `✓ sections=[${tgpsg.foundKeys?.join(',')}]`  : `✗ ${tgpsg.reason}`}`);
    console.log(`    loichua HTML: ${lcHtml.ok ? `✓ sections=[${lcHtml.foundKeys?.join(',')}]` : `✗ ${lcHtml.reason}`}`);
    console.log(`    loichua API : ${lcApi.ok  ? `✓ keys=[${lcApi.keys?.join(',')}]`           : `✗ ${lcApi.reason}`}`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`HTML dump ở: ${debugDir}`);
};

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
