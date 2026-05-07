/**
 * emailTemplates.js — HTML templates gửi email phụ huynh
 * Hai loại: điểm danh hằng tuần + lịch lễ tuần tới
 */

// ── Shared layout ─────────────────────────────────────────────────────────────
const layout = (body) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Xứ Đoàn Mẫu Tâm</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#8B0000 0%,#6e1a1a 100%);padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;color:#D4AF37;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                    ✝ XỨ ĐOÀN ANRÊ PHÚ YÊN
                  </p>
                  <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                    Mẫu Tâm
                  </h1>
                </td>
                <td align="right">
                  <p style="margin:0;color:rgba(255,255,255,0.5);font-size:11px;">Thông báo từ Ban Huynh Trưởng</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#faf7f2;border-top:1px solid #e8dcc8;padding:20px 32px;">
            <p style="margin:0;font-size:11px;color:#a09080;text-align:center;line-height:1.6;">
              Email này được gửi tự động từ hệ thống quản lý Xứ Đoàn Anrê Phú Yên · Mẫu Tâm.<br/>
              Vui lòng không trả lời email này. Nếu có thắc mắc, liên hệ trực tiếp huynh trưởng phụ trách.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── Template 1: Điểm danh hằng tuần ─────────────────────────────────────────
/**
 * @param {object} opts
 * @param {string} opts.tenThanh       - Tên thánh của đoàn sinh
 * @param {string} opts.hoTen          - Họ tên đầy đủ
 * @param {boolean} opts.present       - Có mặt hay vắng
 * @param {string} opts.date           - ISO date 'YYYY-MM-DD'
 * @param {string} opts.tenLop         - Tên lớp
 * @param {string} opts.tenHuynhTruong - Tên huynh trưởng
 * @param {string} opts.namHoc         - Năm học
 */
const diemDanhTemplate = ({ tenThanh, hoTen, present, date, tenLop, tenHuynhTruong, namHoc }) => {
  // Định dạng ngày: DD/MM/YYYY, thứ Chúa Nhật
  const d    = new Date(date + 'T00:00:00');
  const ngay = d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  const tenDayDu = `${tenThanh} ${hoTen}`.trim();

  // Khối trạng thái: xanh nếu có mặt, đỏ nếu vắng
  const statusBlock = present
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <tr>
          <td style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:16px 20px;">
            <p style="margin:0;font-size:15px;color:#166534;font-weight:600;">
              ✅ &nbsp;Con <strong>${tenDayDu}</strong> đã <strong>có mặt</strong> trong buổi học Chúa Nhật ngày ${ngay}.
            </p>
          </td>
        </tr>
      </table>`
    : `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <tr>
          <td style="background:#fff5f5;border:1.5px solid #fca5a5;border-radius:10px;padding:16px 20px;">
            <p style="margin:0;font-size:15px;color:#991b1b;font-weight:600;">
              ❌ &nbsp;Con <strong>${tenDayDu}</strong> đã <strong>vắng mặt</strong> trong buổi học Chúa Nhật ngày ${ngay}.
            </p>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
        <tr>
          <td style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
              <strong>⚠️ Lưu ý:</strong> Nếu con vắng có lý do chính đáng, kính nhờ quý phụ huynh
              liên hệ huynh trưởng <strong>${tenHuynhTruong || 'lớp'}</strong> để được ghi phép.
              Việc vắng mặt nhiều buổi sẽ ảnh hưởng đến kết quả học kỳ của con.
            </p>
          </td>
        </tr>
      </table>`;

  const body = `
    <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-transform:uppercase;font-weight:600;letter-spacing:1px;">
      Thông báo điểm danh
    </p>
    <h2 style="margin:0 0 20px;font-size:20px;color:#1f1512;font-weight:700;">
      Kết quả buổi học Chúa Nhật
    </h2>

    <p style="margin:0 0 4px;font-size:14px;color:#6b7280;">
      Kính gửi quý phụ huynh của đoàn sinh <strong style="color:#3d1515;">${tenDayDu}</strong>,
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">
      Ban Huynh Trưởng lớp <strong>${tenLop}</strong> xin thông báo kết quả điểm danh buổi học vừa qua:
    </p>

    ${statusBlock}

    <!-- Thông tin lớp -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#faf7f2;border-radius:8px;padding:16px;margin-top:8px;">
      <tr>
        <td style="padding:4px 0;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">Lớp</p>
          <p style="margin:2px 0 0;font-size:14px;color:#1f1512;font-weight:600;">${tenLop}</p>
        </td>
        <td style="padding:4px 0;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">Huynh trưởng</p>
          <p style="margin:2px 0 0;font-size:14px;color:#1f1512;font-weight:600;">${tenHuynhTruong || '—'}</p>
        </td>
        <td style="padding:4px 0;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">Năm học</p>
          <p style="margin:2px 0 0;font-size:14px;color:#1f1512;font-weight:600;">${namHoc || '—'}</p>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.7;">
      Kính chúc quý phụ huynh một tuần tràn đầy ơn Chúa.<br/>
      <em style="color:#8B0000;">Ban Huynh Trưởng Xứ Đoàn Anrê Phú Yên · Mẫu Tâm</em>
    </p>`;

  return layout(body);
};

// ── Template 2: Lịch lễ tuần tới ─────────────────────────────────────────────
/**
 * @param {object} opts
 * @param {Array}  opts.feasts          - Mảng { ngay, ten, mauKey } lịch lễ tuần tới
 * @param {string} opts.tuanTu          - Chuỗi "DD/MM – DD/MM/YYYY"
 * @param {string[]} opts.gioLe         - Mảng giờ lễ CN, vd ['7:00', '9:00', '17:00']
 * @param {string} opts.tenLop          - Tên lớp gửi đến
 * @param {string} opts.tenHuynhTruong  - Tên huynh trưởng
 */
const lichLeTemplate = ({ feasts, tuanTu, gioLe, tenLop, tenHuynhTruong }) => {
  // Ánh xạ màu → tên tiếng Việt + màu hex badge
  const MAU_BADGE = {
    trang: { label: 'Màu Trắng', color: '#6b7280', bg: '#f9fafb' },
    do:    { label: 'Màu Đỏ',    color: '#dc2626', bg: '#fff5f5' },
    tim:   { label: 'Màu Tím',   color: '#7c3aed', bg: '#faf5ff' },
    xanh:  { label: 'Màu Xanh',  color: '#16a34a', bg: '#f0fdf4' },
    hong:  { label: 'Màu Hồng',  color: '#db2777', bg: '#fdf2f8' },
    den:   { label: 'Màu Đen',   color: '#374151', bg: '#f9fafb' },
  };

  const feastRows = feasts.length === 0
    ? `<tr><td colspan="2" style="padding:12px;text-align:center;color:#9ca3af;font-size:13px;font-style:italic;">
        Không có ngày lễ đặc biệt trong tuần này.
      </td></tr>`
    : feasts.map(f => {
        const badge = MAU_BADGE[f.mauKey] || MAU_BADGE.xanh;
        return `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #f0e8d8;font-size:13px;color:#374151;font-weight:600;white-space:nowrap;">
              ${f.ngay}
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #f0e8d8;">
              <span style="font-size:13px;color:#1f1512;">${f.ten}</span>
              <span style="display:inline-block;margin-left:8px;font-size:10px;font-weight:700;
                    padding:2px 8px;border-radius:999px;
                    color:${badge.color};background:${badge.bg};border:1px solid ${badge.color}40;">
                ${badge.label}
              </span>
            </td>
          </tr>`;
      }).join('');

  const gioLeStr = (gioLe && gioLe.length > 0)
    ? gioLe.join(' &nbsp;·&nbsp; ')
    : '7:00 &nbsp;·&nbsp; 9:00';

  const body = `
    <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-transform:uppercase;font-weight:600;letter-spacing:1px;">
      Thông báo lịch lễ
    </p>
    <h2 style="margin:0 0 6px;font-size:20px;color:#1f1512;font-weight:700;">
      Lịch Lễ Tuần Tới
    </h2>
    <p style="margin:0 0 20px;font-size:13px;color:#9ca3af;">Tuần ${tuanTu}</p>

    <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">
      Kính gửi quý phụ huynh lớp <strong>${tenLop}</strong>,<br/>
      Ban Huynh Trưởng xin gửi lịch lễ tuần tới để quý phụ huynh tiện sắp xếp:
    </p>

    <!-- Bảng lịch lễ -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e8dcc8;border-radius:10px;overflow:hidden;margin-bottom:20px;">
      <thead>
        <tr style="background:#8B0000;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#D4AF37;letter-spacing:1px;text-transform:uppercase;width:90px;">
            Ngày
          </th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#D4AF37;letter-spacing:1px;text-transform:uppercase;">
            Ngày Lễ
          </th>
        </tr>
      </thead>
      <tbody>${feastRows}</tbody>
    </table>

    <!-- Giờ lễ Chúa Nhật -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;margin-bottom:20px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:12px;color:#92400e;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
            🕐 Giờ Lễ Chúa Nhật
          </p>
          <p style="margin:0;font-size:16px;color:#78350f;font-weight:700;">${gioLeStr}</p>
        </td>
      </tr>
    </table>

    <!-- Lời nhắc nhở -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#faf7f2;border-left:4px solid #8B0000;border-radius:0 8px 8px 0;margin-bottom:20px;">
      <tr>
        <td style="padding:14px 18px;">
          <p style="margin:0;font-size:13px;color:#5a1a1a;line-height:1.7;">
            🙏 &nbsp;<strong>Kính nhắc nhở:</strong> Xin quý phụ huynh đưa con đến tham dự
            Thánh Lễ và sinh hoạt đoàn đầy đủ và đúng giờ. Sự hiện diện của con là nguồn
            vui lớn cho cả cộng đoàn.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
      Kính chúc quý phụ huynh một tuần bình an trong ơn Chúa.<br/>
      <em style="color:#8B0000;">Huynh trưởng ${tenHuynhTruong || 'phụ trách'} · Lớp ${tenLop}</em>
    </p>`;

  return layout(body);
};

// ── Template 3: Bảng điểm cuối kỳ ───────────────────────────────────────────
/**
 * @param {object} opts
 * @param {object} opts.student        - { tenThanh, hoTen, gioiTinh }
 * @param {Array}  opts.gradesByLoai   - [{ loai:'Miệng', heSo:1, danhSach:[8,7,9], tb:null }, ...]
 * @param {number|null} opts.tbHocTap  - TBM học tập (chưa ×80%)
 * @param {number|null} opts.diemCC    - Điểm chuyên cần
 * @param {number|null} opts.tongKet   - Điểm tổng kết
 * @param {string}      opts.hocLuc    - 'Xuất sắc'|'Giỏi'|'Khá'|'Trung bình'|'Yếu'|'—'
 * @param {number}      opts.hocKy     - 1 hoặc 2
 * @param {string}      opts.namHoc    - Tên năm học
 * @param {string}      opts.tenLop    - Tên lớp
 * @param {string}      opts.tenHuynhTruong
 */
const bangDiemTemplate = ({
  student, gradesByLoai, tbHocTap, diemCC, tongKet, hocLuc,
  hocKy, namHoc, tenLop, tenHuynhTruong,
}) => {
  // Badge học lực: màu theo kết quả
  const HOC_LUC_BADGE = {
    'Xuất sắc':   { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', icon: '♛' },
    'Giỏi':       { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: '★' },
    'Khá':        { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: '◆' },
    'Trung bình': { bg: '#fff7ed', border: '#fdba74', text: '#9a3412', icon: '●' },
    'Yếu':        { bg: '#fff5f5', border: '#fca5a5', text: '#991b1b', icon: '▼' },
  };
  const badge = HOC_LUC_BADGE[hocLuc] || { bg: '#f9fafb', border: '#d1d5db', text: '#374151', icon: '—' };

  // Nhận xét tự động theo học lực
  const NX = {
    'Xuất sắc':   'Xin chúc mừng! Con đã đạt kết quả xuất sắc trong học kỳ này. Ban Huynh Trưởng rất tự hào và mong con tiếp tục phát huy.',
    'Giỏi':       'Xin chúc mừng! Con đã đạt kết quả giỏi trong học kỳ này. Ban Huynh Trưởng mong con tiếp tục giữ vững và phấn đấu hơn nữa.',
    'Khá':        'Con đã có kết quả tốt trong học kỳ này. Tiếp tục cố gắng, con hoàn toàn có thể đạt thành tích cao hơn trong học kỳ tới.',
    'Trung bình': 'Con cần cố gắng hơn trong học kỳ tới. Kính nhờ quý phụ huynh động viên và nhắc nhở con ôn bài thường xuyên hơn.',
    'Yếu':        'Kính nhờ quý phụ huynh quan tâm, nhắc nhở và tạo điều kiện cho con học tốt hơn trong học kỳ tới. Ban Huynh Trưởng luôn sẵn sàng hỗ trợ.',
  };
  const nhanXet = NX[hocLuc] || 'Ban Huynh Trưởng ghi nhận sự tham gia của con trong học kỳ này.';

  // Hàm format điểm hiển thị
  const fmt = (v) => (v === null || v === undefined) ? '—' : parseFloat(v).toFixed(1);

  // Hàng điểm theo từng loại
  const gradeRows = gradesByLoai.map(({ loai, heSo, danhSach }) => {
    const dsDiem = danhSach.length ? danhSach.join(', ') : '—';
    const tbLoai = danhSach.length
      ? (danhSach.reduce((a, b) => a + b, 0) / danhSach.length).toFixed(1)
      : '—';
    return `
      <tr>
        <td style="padding:9px 14px;border-bottom:1px solid #f0e8d8;font-size:13px;color:#374151;">${loai}</td>
        <td style="padding:9px 14px;border-bottom:1px solid #f0e8d8;text-align:center;font-size:13px;color:#1f1512;font-weight:600;">${dsDiem}</td>
        <td style="padding:9px 14px;border-bottom:1px solid #f0e8d8;text-align:center;font-size:12px;color:#6b7280;">×${heSo}</td>
        <td style="padding:9px 14px;border-bottom:1px solid #f0e8d8;text-align:center;font-size:13px;color:#1e40af;font-weight:600;">${tbLoai}</td>
      </tr>`;
  }).join('');

  const body = `
    <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-transform:uppercase;font-weight:600;letter-spacing:1px;">
      Kết quả học tập giáo lý
    </p>
    <h2 style="margin:0 0 20px;font-size:20px;color:#1f1512;font-weight:700;">
      Thông Báo Bảng Điểm Cuối Kỳ ${hocKy}
    </h2>

    <!-- Thông tin đoàn sinh -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#faf7f2;border-radius:10px;padding:16px;margin-bottom:20px;border:1px solid #e8dcc8;">
      <tr>
        <td style="padding:4px 8px;">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Họ và tên</p>
          <p style="margin:3px 0 0;font-size:15px;color:#1f1512;font-weight:700;">${student.tenThanh} ${student.hoTen}</p>
        </td>
        <td style="padding:4px 8px;">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Lớp</p>
          <p style="margin:3px 0 0;font-size:14px;color:#1f1512;font-weight:600;">${tenLop}</p>
        </td>
        <td style="padding:4px 8px;">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Năm học</p>
          <p style="margin:3px 0 0;font-size:14px;color:#1f1512;font-weight:600;">${namHoc}</p>
        </td>
      </tr>
    </table>

    <!-- Bảng điểm chi tiết -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e8dcc8;border-radius:10px;overflow:hidden;margin-bottom:16px;">
      <thead>
        <tr style="background:#8B0000;">
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#D4AF37;letter-spacing:1px;text-transform:uppercase;font-weight:700;">Loại điểm</th>
          <th style="padding:10px 14px;text-align:center;font-size:11px;color:#D4AF37;letter-spacing:1px;text-transform:uppercase;font-weight:700;">Các điểm</th>
          <th style="padding:10px 14px;text-align:center;font-size:11px;color:#D4AF37;letter-spacing:1px;text-transform:uppercase;font-weight:700;">Hệ số</th>
          <th style="padding:10px 14px;text-align:center;font-size:11px;color:#D4AF37;letter-spacing:1px;text-transform:uppercase;font-weight:700;">TB loại</th>
        </tr>
      </thead>
      <tbody>
        ${gradeRows}
        <!-- Dòng TBM học tập -->
        <tr style="background:#fef9ec;">
          <td style="padding:10px 14px;font-size:13px;font-weight:700;color:#78350f;">TBM Học Tập</td>
          <td style="padding:10px 14px;text-align:center;" colspan="2">
            <span style="font-size:11px;color:#92400e;">×80%</span>
          </td>
          <td style="padding:10px 14px;text-align:center;font-size:15px;font-weight:800;color:#92400e;">${fmt(tbHocTap)}</td>
        </tr>
        <!-- Dòng chuyên cần -->
        <tr style="background:#f0fdf4;">
          <td style="padding:10px 14px;font-size:13px;font-weight:700;color:#166534;">Chuyên Cần</td>
          <td style="padding:10px 14px;text-align:center;" colspan="2">
            <span style="font-size:11px;color:#166534;">×20%</span>
          </td>
          <td style="padding:10px 14px;text-align:center;font-size:15px;font-weight:800;color:#166534;">${fmt(diemCC)}</td>
        </tr>
        <!-- Dòng tổng kết -->
        <tr style="background:#8B0000;">
          <td style="padding:12px 14px;font-size:14px;font-weight:800;color:#ffffff;" colspan="3">
            ✦ &nbsp;ĐIỂM TỔNG KẾT
          </td>
          <td style="padding:12px 14px;text-align:center;font-size:20px;font-weight:800;color:#D4AF37;">${fmt(tongKet)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Badge học lực -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;background:${badge.bg};border:2px solid ${badge.border};
               border-radius:999px;padding:10px 28px;">
            <span style="font-size:16px;font-weight:800;color:${badge.text};">
              ${badge.icon} &nbsp;Học Lực: ${hocLuc}
            </span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Nhận xét tự động -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#faf7f2;border-left:4px solid #8B0000;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <tr>
        <td style="padding:14px 18px;">
          <p style="margin:0;font-size:13px;color:#5a1a1a;line-height:1.7;">
            💬 &nbsp;<strong>Nhận xét:</strong> ${nhanXet}
          </p>
        </td>
      </tr>
    </table>

    <!-- Chữ ký -->
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
      Kính chúc quý phụ huynh và gia đình sức khỏe, bình an.<br/>
      <em style="color:#8B0000;">
        Huynh trưởng <strong>${tenHuynhTruong || 'phụ trách'}</strong> · Lớp ${tenLop} · Năm học ${namHoc}
      </em>
    </p>`;

  return layout(body);
};

module.exports = { diemDanhTemplate, lichLeTemplate, bangDiemTemplate };
