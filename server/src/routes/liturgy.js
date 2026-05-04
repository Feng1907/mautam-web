const express = require('express');
const router  = express.Router();

// ── Ánh xạ màu romcal (UPPERCASE string) → mauKey ────────────────────────────
const COLOR_MAP = {
  WHITE:  'trang',
  GOLD:   'trang',
  RED:    'do',
  PURPLE: 'tim',
  VIOLET: 'tim',
  GREEN:  'xanh',
  ROSE:   'hong',
  BLACK:  'den',
};

// ── Ánh xạ type string romcal v1.x → cap badge ───────────────────────────────
// romcal trả về: SOLEMNITY, SUNDAY, FEAST, MEMORIAL, OPT_MEMORIAL,
//                FERIA, TRIDUUM, HOLY_WEEK, COMMEMORATION
const TYPE_TO_CAP = {
  TRIDUUM:      'dai',    // Tam Nhật Thánh = ĐẠI LỄ
  SOLEMNITY:    'trong',  // Lễ Trọng
  HOLY_WEEK:    'trong',
  SUNDAY:       'trong',  // Chúa Nhật luôn là Lễ Trọng
  FEAST:        'kinh',   // Lễ Kính
  MEMORIAL:     'nho',    // Lễ Nhớ
  OPT_MEMORIAL: undefined,
  FERIA:        undefined,
  COMMEMORATION:undefined,
};

// ── Bảng chữ số La Mã ─────────────────────────────────────────────────────────
const ROMAN = [
  '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
  'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX',
  'XXXI', 'XXXII', 'XXXIII', 'XXXIV',
];
const toRoman = (n) => ROMAN[n] || String(n);

// ── Bảng dịch tên mùa Phụng vụ → tiếng Việt ─────────────────────────────────
const SEASON_VI = {
  'Easter':        'Mùa Phục Sinh',
  'Ordinary Time': 'Mùa Thường Niên',
  'Advent':        'Mùa Vọng',
  'Christmas':     'Mùa Giáng Sinh',
  'Lent':          'Mùa Chay',
  'Holy Week':     'Tuần Thánh',
};

// Ngày trong tuần từ định dạng romcal (locale vi)
const WEEKDAY_TITLE = {
  'thứ hai': 'Thứ Hai',
  'thứ ba':  'Thứ Ba',
  'thứ tư':  'Thứ Tư',
  'thứ năm': 'Thứ Năm',
  'thứ sáu': 'Thứ Sáu',
  'thứ bảy': 'Thứ Bảy',
};

// ── Bảng dịch tên lễ Anh → Việt ──────────────────────────────────────────────
const VI_LOOKUP = {
  // Tháng 1
  'Mary, Mother of God':                                'Đức Maria, Mẹ Thiên Chúa',
  'The Epiphany of the Lord':                           'Lễ Hiển Linh',
  'The Baptism of the Lord':                            'Lễ Chúa Giêsu Chịu Phép Rửa',
  // Tháng 2
  'The Presentation of the Lord':                       'Lễ Dâng Chúa Vào Đền Thánh',
  // Tháng 3
  'Saint Joseph, Husband of Mary':                      'Thánh Giuse, Bạn trăm năm Đức Maria',
  'The Annunciation of the Lord':                       'Lễ Truyền Tin',
  // Tháng 4 – Tuần Thánh
  'Palm Sunday of the Passion of the Lord':             'Lễ Lá',
  'Holy Thursday':                                      'Thứ Năm Tuần Thánh',
  'Good Friday':                                        'Thứ Sáu Tuần Thánh',
  'Holy Saturday':                                      'Thứ Bảy Tuần Thánh',
  'Easter Sunday':                                      'ĐẠI LỄ PHỤC SINH',
  // Tháng 5
  'Saint Joseph the Worker':                            'Thánh Giuse Thợ',
  'Saint Athanasius, Bishop and Doctor':                'Thánh Athanasiô, Giám mục Tiến sĩ',
  'Saints Philip and James, Apostles':                  'Thánh Philipphê và Giacôbê, Tông đồ',
  'Saints Nereus and Achilleus, Martyrs/Saint Pancras, Martyr': 'Thánh Nêrêô, Akhilêô và Pancratiô, Tử đạo',
  'Our Lady of Fatima':                                 'Đức Mẹ Fatima',
  'Saint Matthias, Apostle':                            'Thánh Matthia, Tông đồ',
  'Ascension of the Lord':                              'Lễ Chúa Giêsu Lên Trời',
  'Saint John I, Pope and Martyr':                      'Thánh Gioan I, Giáo hoàng Tử đạo',
  'Saint Bernardine of Siena, Priest':                  'Thánh Bênađinô Siêna, Linh mục',
  'Saint Christopher Magallanes and Companions, Martyrs': 'Thánh Cristôphê Magallanê và bạn tử đạo',
  'Saint Rita of Cascia':                               'Thánh Rita Cascia',
  'Pentecost Sunday':                                   'Lễ Chúa Thánh Thần Hiện Xuống',
  'Mary, Mother of The Church':                         'Đức Maria, Mẹ Hội Thánh',
  'Saint Philip Neri, Priest':                          'Thánh Philipphê Nêri, Linh mục',
  'Saint Augustine of Canterbury, Bishop':              'Thánh Augustinô Cantêbury, Giám mục',
  'Visitation of the Blessed Virgin Mary':              'Đức Mẹ Thăm Viếng',
  // Tháng 6
  'Trinity Sunday':                                     'Lễ Chúa Ba Ngôi',
  'The Most Holy Body and Blood of Christ':             'Lễ Mình Máu Thánh Chúa',
  'The Most Sacred Heart of Jesus':                     'Lễ Thánh Tâm Chúa Giêsu',
  'The Immaculate Heart of the Blessed Virgin Mary':    'Trái Tim Vẹn Sạch Đức Mẹ',
  'The Nativity of Saint John the Baptist':             'Sinh Nhật Thánh Gioan Tẩy Giả',
  'Saints Peter and Paul, Apostles':                    'Thánh Phêrô và Phaolô, Tông đồ',
  // Tháng 7
  'Saint Thomas, Apostle':                              'Thánh Tôma, Tông đồ',
  'Saint James, Apostle':                               'Thánh Giacôbê, Tông đồ',
  // Tháng 8
  'The Transfiguration of the Lord':                    'Lễ Chúa Hiển Dung',
  'The Assumption of the Blessed Virgin Mary':          'Lễ Đức Mẹ Lên Trời',
  'Saint Bartholomew, Apostle':                         'Thánh Bartôlômêô, Tông đồ',
  // Tháng 9
  'The Nativity of the Blessed Virgin Mary':            'Sinh Nhật Đức Mẹ',
  'The Exaltation of the Holy Cross':                   'Suy Tôn Thánh Giá',
  // Tháng 10
  'Saint Francis of Assisi':                            'Thánh Phanxicô Assisi',
  'Our Lady of the Rosary':                             'Đức Mẹ Mân Côi',
  // Tháng 11
  'All Saints':                                         'Lễ Các Thánh',
  'The Commemoration of All the Faithful Departed':     'Lễ Cầu Hồn',
  'Our Lord Jesus Christ, King of the Universe':        'Lễ Chúa Kitô Vua',
  // Tháng 12
  'The Immaculate Conception of the Blessed Virgin Mary': 'Lễ Đức Mẹ Vô Nhiễm',
  'Christmas Day':                                      'Lễ Giáng Sinh',
};

// ── Dịch tên lễ Anh → Việt ───────────────────────────────────────────────────
const translateName = (name = '', type = '') => {
  // 1. Lookup chính xác
  if (VI_LOOKUP[name]) return VI_LOOKUP[name];

  // 2. FERIA: "thứ hai of the 5 week of Easter"
  const feriaReg = /^(thứ \S+) of the (\d+) week of (.+)$/i;
  const feriaM   = name.match(feriaReg);
  if (feriaM) {
    const day    = WEEKDAY_TITLE[feriaM[1].toLowerCase()] || feriaM[1];
    const week   = toRoman(parseInt(feriaM[2]));
    const season = SEASON_VI[feriaM[3]] || feriaM[3];
    return `${day} tuần ${week} ${season}`;
  }

  // 3. SUNDAY: "5 Sunday of Easter" | "6 Sunday of Ordinary Time"
  const sundayReg = /^(\d+) Sunday of (.+)$/i;
  const sundayM   = name.match(sundayReg);
  if (sundayM) {
    const week   = toRoman(parseInt(sundayM[1]));
    const season = SEASON_VI[sundayM[2]] || sundayM[2];
    return `Chúa Nhật ${week} ${season}`;
  }

  // 4. Lookup từ khóa trong tên
  const n = name.toLowerCase();
  if (n.includes('martyr'))     return name.replace(/,?\s*Martyr[s]?/gi, ', Tử đạo');
  if (n.includes('bishop'))     return name.replace(/,?\s*Bishop/gi,     ', Giám mục');
  if (n.includes('priest'))     return name.replace(/,?\s*Priest/gi,     ', Linh mục');
  if (n.includes('pope'))       return name.replace(/,?\s*Pope/gi,       ', Giáo hoàng');
  if (n.includes('deacon'))     return name.replace(/,?\s*Deacon/gi,     ', Phó tế');
  if (n.includes('doctor'))     return name.replace(/,?\s*Doctor/gi,     ', Tiến sĩ');

  // 5. Trả nguyên
  return name;
};

// ── Icon theo tên / type ──────────────────────────────────────────────────────
const pickIcon = (name = '', type = '', colorKey = 'GREEN') => {
  const n = name.toLowerCase();
  if (n.includes('phục sinh') || n.includes('easter'))      return '🌿';
  if (n.includes('lên trời')  || n.includes('ascension'))   return '☁️';
  if (n.includes('hiện xuống')|| n.includes('pentecost'))   return '🔥';
  if (n.includes('ba ngôi')   || n.includes('trinity'))     return '✨';
  if (n.includes('mình máu')  || n.includes('body and blood'))return '🍞';
  if (n.includes('giáng sinh')|| n.includes('christmas'))   return '⭐';
  if (n.includes('hiển linh') || n.includes('epiphany'))    return '🌟';
  if (n.includes('tuần thánh')|| type === 'HOLY_WEEK')      return '🕊️';
  if (n.includes('tử đạo')    || n.includes('martyr'))      return '✝️';
  if (n.includes('đức mẹ')    || n.includes('mary') ||
      n.includes('our lady'))                                return '🌹';
  if (n.includes('thánh giuse')|| n.includes('joseph'))     return '🌸';
  if (n.includes('tông đồ')   || n.includes('apostle'))     return '📖';
  if (n.includes('tiến sĩ')   || n.includes('doctor'))      return '📜';
  if (n.includes('chúa nhật') || type === 'SUNDAY')         return '🌿';
  if (n.includes('anrê')      || n.includes('andrew'))      return '⚓';
  if (type === 'TRIDUUM')   return '🕯️';
  if (type === 'SOLEMNITY') return '⭐';
  if (type === 'FEAST')     return '📖';
  if (colorKey === 'RED')   return '✝️';
  return '✨';
};

// ── Lễ riêng Xứ đoàn Anrê Phú Yên ───────────────────────────────────────────
const getCustomEvents = (year) => [
  {
    ngay:      '26/07',
    dateKey:   `${year}-07-26`,
    ten:       'Chân phước Anrê Phú Yên, Tử đạo — Bổn mạng Xứ đoàn',
    mauKey:    'do',
    cap:       'trong',
    icon:      '⚓',
    rank:      'SOLEMNITY',
    isBonMang: true,
    isCustom:  true,
  },
];

// ── GET /api/liturgy/feasts?month=5&year=2026 ─────────────────────────────────
router.get('/feasts', async (req, res) => {
  try {
    const now   = new Date();
    const year  = parseInt(req.query.year,  10) || now.getFullYear();
    const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);

    if (month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: 'month phải từ 1–12' });
    }

    const Romcal = require('romcal');

    // romcal.calendarFor trả về object (có thể là Promise)
    let calendar = Romcal.calendarFor({ year, locale: 'vi' });
    if (calendar && typeof calendar.then === 'function') {
      calendar = await calendar;
    }

    // ── romcal v1.x trả về object với numeric keys (0, 1, 2, ...)
    //    Mỗi value là 1 entry có: moment (ISO string), type (string), name, data
    const allEntries = Object.values(calendar);

    const romcalFeasts = [];

    allEntries.forEach(entry => {
      if (!entry || !entry.moment) return;

      const date = new Date(entry.moment);
      if (isNaN(date.getTime()))         return;
      if (date.getMonth() + 1 !== month) return;

      const day      = String(date.getDate()).padStart(2, '0');
      const mon      = String(date.getMonth() + 1).padStart(2, '0');
      const type     = entry.type || 'FERIA';

      // Bỏ qua FERIA không có lễ đặc biệt (chỉ giữ ngày thường niên, bỏ Phục Sinh/Chay vì đã có season context)
      // Thực ra giữ lại tất cả để hiện đủ — người dùng cần thấy đủ ngày
      const colorKey = (
        entry.data?.meta?.liturgicalColor?.key || 'GREEN'
      ).toUpperCase();

      const mauKey = COLOR_MAP[colorKey] || 'xanh';
      const cap    = TYPE_TO_CAP[type];

      const nameEn = entry.name || '';
      const nameVi = translateName(nameEn, type);

      const isThangHoa = (month === 5);

      romcalFeasts.push({
        ngay:     `${day}/${mon}`,
        dateKey:  `${year}-${mon}-${day}`,
        ten:      nameVi,
        mauKey,
        cap,
        icon:     pickIcon(nameVi, type, colorKey),
        rank:     type,
        ...(isThangHoa && { subColor: 'blue', theme: 'FlowerMonth' }),
      });
    });

    // Sort theo ngày
    romcalFeasts.sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    // Gộp sự kiện riêng của xứ đoàn (spread operator)
    const customThisMonth = getCustomEvents(year).filter(e => {
      const m = parseInt(e.dateKey.split('-')[1], 10);
      return m === month;
    });

    const allFeasts = [...romcalFeasts, ...customThisMonth]
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    // Metadata tháng
    const isThangHoa = month === 5;
    const meta = isThangHoa ? {
      theme:    'FlowerMonth',
      subColor: 'blue',
      note:     'Tháng Hoa — Kính dâng Đức Mẹ Maria',
    } : {};

    res.json({ success: true, month, year, ...meta, feasts: allFeasts });
  } catch (err) {
    console.error('[liturgy] Lỗi:', err.message, err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
