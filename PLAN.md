# CHIẾN LƯỢC PHÁT TRIỂN HỆ THỐNG QUẢN LÝ XỨ ĐOÀN ANRÊ PHÚ YÊN - MẪU TÂM

---

## TIẾN ĐỘ TỔNG QUAN

| Giai đoạn | Nội dung | Trạng thái |
| --- | --- | --- |
| 0 | Khởi tạo project & cấu trúc mã nguồn | Hoàn thành |
| 1 | Database schema & quan hệ dữ liệu | Hoàn thành |
| 2 | Backend API (Auth, RBAC, CRUD) | Hoàn thành |
| 3 | Frontend UI cơ bản | Hoàn thành |
| 4 | Tính năng Điểm danh | Hoàn thành |
| 5 | Tính năng Bảng điểm | Hoàn thành |
| 6 | Tính năng Tin tức & Thông báo | Hoàn thành |
| 7 | Export Excel | Hoàn thành |
| 8 | Kiểm thử & Deployment | Hoàn thành |
| 9 | UX nâng cao & Trải nghiệm Phụng vụ | Hoàn thành |
| 10 | Thư viện ảnh Firebase | Hoàn thành |
| 11 | UI Spiritual Modernism + Chuyên cần + Lên lớp + Nhân sự | Hoàn thành |
| 12 | Polish: Báo cáo tổng kết, Email phụ huynh, Lời Chúa, Stats, Avatar, Lịch sử điểm | Hoàn thành |
| 13 | Thông báo Email nâng cao, Lời Chúa thông minh, Tính điểm tự động | Hoàn thành |
| 14 | Tối ưu hiệu năng, PWA offline, kiểm thử toàn diện & chuẩn bị production | Sắp tới |

---

## 1. TỔNG QUAN DỰ ÁN

- **Tên dự án:** Website Xứ Đoàn Anrê Phú Yên - Mẫu Tâm
- **Mục tiêu:** Số hóa quản lý giáo lý, điểm danh, điểm số và truyền thông cho Đoàn Thiếu Nhi Thánh Thể
- **Quan thầy:** Thánh Anrê Phú Yên
- **Đối tượng sử dụng:** Cha Xứ, Thầy Xứ, Ban Điều Hành, Huynh trưởng, Dự trưởng, Phụ huynh

### Nhận diện thương hiệu

- **Logo:** Hình ảnh nhà thờ Mẫu Tâm kết hợp vòng tròn 5 màu ngành TNTT
- **Màu sắc:** Đỏ đô `#8B0000` · Vàng đồng `#D4AF37` · Kem ngà `#fdfbf7`
- **Design System:** Spiritual Modernism — cổ điển, trang trọng, dễ dùng trên mobile

---

## 2. CƠ CẤU TỔ CHỨC

### Nhân sự

| Vai trò | Số lượng |
| --- | --- |
| Cha Xứ | 01 |
| Thầy Xứ | 01 |
| Huynh trưởng | 14 |
| Dự trưởng | 09 |

### Hệ thống 12 lớp

| Ngành | Lớp |
| --- | --- |
| Chiên Non | Khai Tâm |
| Ấu Nhi | XT 1, XT 2A, XT 2B, XT 3A (Bí Tích), XT 3B (Bí Tích) |
| Thiếu Nhi | Thêm Sức 1, Thêm Sức 2 |
| Nghĩa Sĩ | Sống Đạo 1, Sống Đạo 2, Sống Đạo 3 |
| Hiệp Sĩ | Hiệp Sĩ |

---

## 3. PHÂN QUYỀN (RBAC)

| Chức năng | User / Phụ huynh | Giáo lý viên | Admin |
| --- | :-: | :-: | :-: |
| Xem giờ lễ, Lời Chúa, tin tức | OK | OK | OK |
| Xem danh sách lớp & lịch sử điểm | OK | OK | OK |
| Điểm danh lớp mình | -- | OK | OK |
| Nhập điểm + điểm chuyên cần | -- | OK lớp mình | OK |
| Cập nhật đoàn sinh + avatar | -- | OK lớp mình | OK |
| Export Excel (lớp mình) | -- | OK | OK |
| Gửi email thông báo điểm danh / bảng điểm | -- | OK lớp mình | OK |
| Gửi email lịch lễ tuần tới | -- | -- | OK |
| Đăng tin tức / thông báo khẩn | -- | -- | OK |
| Quản lý tất cả lớp & nhân sự | -- | -- | OK |
| Lên lớp hàng loạt | -- | -- | OK |
| Export tổng kết toàn đoàn | -- | -- | OK |
| Dashboard thống kê ngành | -- | -- | OK |
| Tạo / reset tài khoản | -- | -- | OK |

> **Nguyên tắc bảo mật:** Middleware `checkClassPermission` chặn mọi truy cập chéo lớp.

---

## 4. BỐ CỤC MÃ NGUỒN

```text
mautam-website/
├── client/                          # React 19 + Vite
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── AttendanceTable.jsx  # Điểm danh + lọc buổi + đếm vắng + email
│       │   ├── GradeForm.jsx        # Bảng điểm + CC + tính điểm tự động (80/20)
│       │   ├── StudentList.jsx      # Danh sách + avatar + lịch sử điểm
│       │   └── ExportButton.jsx
│       ├── pages/
│       │   ├── Home.jsx             # Landing page 5 ngành + SVG watermark
│       │   ├── News.jsx             # Tin tức + lọc loại + UrgentBanner
│       │   ├── ClassList.jsx        # Explorer 5 ngành + search
│       │   ├── ClassDetail.jsx      # 3 tab: Danh sách / Điểm danh / Bảng điểm
│       │   ├── LoiChua.jsx          # Lời Chúa + điều hướng ngày + Chúa Nhật
│       │   ├── GioLe.jsx            # Dashboard phụng vụ + đồng hồ real-time
│       │   ├── Gallery.jsx          # Thư viện ảnh Firebase
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminClasses.jsx    # Phân công nhân sự
│       │       ├── AdminPromotion.jsx  # Lên lớp hàng loạt
│       │       ├── AdminStats.jsx      # Dashboard thống kê ngành
│       │       ├── AdminExport.jsx     # Export toàn đoàn
│       │       ├── AdminPosts.jsx      # Quản lý tin tức / thông báo (CRUD + ảnh)
│       │       ├── AdminUsers.jsx      # Quản lý tài khoản + phân quyền
│       │       └── AdminNamHoc.jsx     # Quản lý năm học
│       ├── services/
│       │   ├── api.js               # Axios + JWT interceptor + notify endpoints
│       │   ├── firebase.js
│       │   └── galleryService.js    # Upload + nén ảnh Firebase
│       ├── store/AuthContext.jsx
│       └── i18n.js                  # VI / EN
│
└── server/                          # Node.js + Express 5
    └── src/
        ├── models/
        │   ├── User.js, Class.js, Student.js
        │   ├── NamHoc.js, Grade.js, Attendance.js
        │   ├── ChuyenCan.js         # Điểm chuyên cần (phase 11)
        │   ├── MeritPoint.js
        │   ├── PromotionHistory.js  # Lịch sử lên lớp
        │   └── Post.js
        ├── controllers/
        │   ├── exportController.js       # attendance, grades, tổng kết, toàn đoàn
        │   ├── notifyController.js       # Email: điểm danh, lịch lễ, bảng điểm
        │   ├── loiChuaController.js      # Scraper 3 nguồn + cache + romcal
        │   ├── chuyenCanController.js
        │   ├── promoteController.js
        │   └── ...
        ├── routes/
        │   ├── export.js            # /attendance, /grades, /tong-ket, /tong-ket-toan-doan
        │   ├── notify.js            # /diem-danh, /lich-le, /bang-diem
        │   ├── chuyencan.js
        │   ├── promote.js
        │   └── ...
        ├── utils/
        │   ├── emailTemplates.js    # 3 template HTML: điểm danh, lịch lễ, bảng điểm
        │   └── gradeCalculator.js   # Hàm dùng chung: tinhTBHocTap, tinhTongKet, phanLoai
        ├── scripts/
        │   └── test-loichua.js      # Debug script kiểm tra 3 nguồn Lời Chúa
        └── middlewares/
            ├── checkAuth.js
            └── checkClassPermission.js
```

---

## 5. LỘ TRÌNH CHI TIẾT

---

### GIAI ĐOẠN 0-9 — Hoàn thành

> Xem chi tiết trong git log. Tóm tắt:
>
> - **0-2:** Khởi tạo, schema, API CRUD toàn bộ
> - **3:** Frontend UI cơ bản, routing, auth
> - **4:** Bảng điểm danh Chúa Nhật (scroll ngang, sticky, optimistic update)
> - **5:** Bảng điểm (hệ số, TBM, học lực, read-only mode)
> - **6:** Tin tức, thông báo khẩn, UrgentBanner, Admin CRUD
> - **7:** Export Excel chuyên cần + bảng điểm (ExcelJS, UTF-8 filename)
> - **8:** Vercel + Render + MongoDB Atlas deployment config
> - **9:** UX nâng cao — Class Explorer 5 tab, Giờ Lễ dashboard, Lời Chúa Bible mode

---

### GIAI ĐOẠN 10 — Thư viện ảnh Firebase — Hoàn thành

- Firebase Storage upload với nén ảnh tự động (Canvas API, WebP, tối đa 500KB)
- Firestore lưu metadata: tiêu đề, sự kiện, năm, timestamp, storagePath
- Gallery page: lưới ảnh lazy-load, lightbox toàn màn hình, điều hướng trái phải
- Admin upload: drag & drop, progress bar 2 giai đoạn (nén → upload)
- Xoá ảnh: đồng bộ Storage + Firestore

---

### GIAI ĐOẠN 11 — UI Spiritual Modernism & Tính năng cốt lõi — Hoàn thành

#### UI Overhaul

- Design System: màu đỏ đô / vàng đồng / kem ngà, font Georgia serif + Inter sans
- SVG watermark thánh giá chìm trên bảng điểm
- Framer Motion transitions toàn bộ tab, modal, page enter/exit

#### Chuyên cần (Attendance Score)

- Model `ChuyenCan`: tongBuoi, soBuoiDi, vangCoPhep, vangKhongPhep, diem, ghiChu
- API upsert với auto-calc: `10 - vang_KP*1 - vang_CP*0.5`, kẹp [0,10]
- GradeForm: thay cột Thi đua thành Chuyên cần
- Modal 2 mode: nhập từ buổi (preview điểm) hoặc nhập thẳng 0-10
- Công thức Tổng kết = TBM x 80% + CC x 20%
- Bộ lọc Nam/Nữ trong GradeForm và StudentList

#### Lên lớp hàng loạt

- Trang `AdminPromotion`: chọn lớp nguồn, lớp đích, năm học mới
- Checkbox chọn từng đoàn sinh hoặc chọn tất cả
- MongoDB transaction đảm bảo tính toàn vẹn
- `PromotionHistory` lưu đầy đủ: từ lớp, sang lớp, năm học, ai thực hiện
- Tab Lịch sử: xem lại toàn bộ đợt chuyển lớp, expand chi tiết

#### Phân công Nhân sự

- Modal phân công HT + DT (checkbox nhiều người)
- Dashboard ClassCard: hiển thị Dự trưởng khi chưa có Huynh trưởng
- ClassList ClassCard: ưu tiên HT → DT → "Chưa phân công"

---

### GIAI ĐOẠN 12 — Polish & Production-Ready — Hoàn thành

#### Báo cáo tổng kết cuối kỳ

- `GET /api/export/tong-ket/:lopId` — Excel 1 lớp: TBM x 80% + CC x 20% + Học lực + Giới tính
- `GET /api/export/tong-ket-toan-doan` — Excel toàn đoàn (admin only), 1 sheet/lớp
- AdminExport: banner "Xuất toàn đoàn" + nút Tổng kết từng lớp

#### Thông báo Email phụ huynh (cơ bản)

- postController: khi đăng `thongbaokhan + daDang=true` → gửi email HTML đến tất cả users
- Template email có branding: tiêu đề đỏ đô, nội dung bài viết, hạn hiệu lực

#### Lời Chúa tự động

- Date picker + nút Prev/Next ngày trong LoiChua.jsx
- Nút "Hôm nay" + nút "Chúa Nhật" (tự tính Chúa Nhật gần nhất)
- Mỗi lần đổi ngày tự fetch lại API ngày đó

#### Dashboard thống kê ngành (AdminStats)

- Route `/admin/thong-ke`, menu sidebar
- BigStat cards: tổng đoàn sinh / có điểm / có CC / TBM toàn đoàn
- Bar chart CSS: phân phối học lực toàn đoàn
- Grid 5 ngành: TB điểm CC, % điểm danh, học lực từng ngành
- Chọn học kỳ 1 / 2, tự reload

#### Avatar đoàn sinh

- StudentModal: chọn file ảnh, nén (imageCompression), upload Firebase Storage `avatars/students/`
- Cột Ảnh trong StudentList: avatar tròn hoặc fallback initials màu theo giới tính
- Progress bar upload realtime trong modal

#### Lịch sử điểm

- `GET /api/students/:lopId/:id/lich-su` — trả grades + chuyenCan theo từng NamHoc
- `LichSuModal` trong StudentList: mỗi năm học hiển thị TBM / CC / Tổng kết / Học lực từng HK
- Nút lịch sử trên mỗi hàng đoàn sinh, mở cho tất cả (không cần canEdit)

---

### GIAI ĐOẠN 13 — Thông báo Email nâng cao, Lời Chúa thông minh, Tính điểm tự động — Hoàn thành

#### Hệ thống thông báo Email nâng cao (notifyController + emailTemplates)

3 endpoint mới tại `POST /api/notify/`:

| Endpoint | Chức năng |
| --- | --- |
| `/diem-danh` | Gửi email điểm danh đến phụ huynh từng em (có mặt / vắng mặt) |
| `/lich-le` | Gửi lịch lễ tuần tới cho cả lớp, tích hợp romcal |
| `/bang-diem` | Gửi bảng điểm tổng kết HK đến từng phụ huynh |

Chi tiết kỹ thuật:

- `Promise.allSettled()` — gửi batch email, không crash khi có 1 email lỗi
- 100ms delay giữa các email tránh bị spam filter
- `/bang-diem` tổng hợp: từng loại điểm, TBM, CC, Tổng kết, Học lực, nhận xét tự động
- `/lich-le` lấy lịch phụng vụ từ romcal, ánh xạ màu: WHITE→trắng, RED→đỏ, PURPLE→tím, GREEN→xanh, ROSE→hồng
- Thống kê lớp cuối email: số xuất sắc / giỏi / khá / trung bình / yếu / chưa đủ điểm

3 template HTML trong `emailTemplates.js`:

| Template | Mô tả |
| --- | --- |
| `diemDanhTemplate()` | Thẻ trạng thái xanh/đỏ theo có mặt/vắng, cảnh báo vắng nhiều |
| `lichLeTemplate()` | Bảng lịch lễ màu sắc theo màu phụng vụ |
| `bangDiemTemplate()` | Bảng điểm đầy đủ + badge học lực + nhận xét tự động |

#### Lời Chúa thông minh (loiChuaController — nâng cấp)

- Cache 6 giờ trong RAM (Map + TTL) — 100 người cùng truy cập 1 ngày chỉ scrape 1 lần
- Chiến lược 3 tầng fallback:
  1. **Ưu tiên 1:** `tgpsaigon.net` — scrape bài đọc theo ngày
  2. **Ưu tiên 2:** `loichua.net` HTML — fallback nếu TGPSG lỗi
  3. **Ưu tiên 3:** `loichua.net` JSON API — fallback cuối (phát hiện API chết tự động)
- Phát hiện đoạn văn theo LABEL_PATTERNS (BÀI ĐỌC 1/2, ĐÁP CA, TUNG HÔ, PHÚC ÂM)
- `markJesusWords()` — tô đậm lời Chúa Giêsu trong ngoặc kép bằng `<span class="voice-jesus">`
- Màu phụng vụ: ưu tiên romcal (cache theo năm), fallback heuristic từ khóa tiếng Việt
- Trả về `attemptedSources` để debug khi cả 3 nguồn lỗi
- Script debug: `node server/scripts/test-loichua.js` — test 3 ngày, 3 nguồn, dump HTML ra `debug/`

#### Tính điểm tự động (gradeCalculator + GradeForm nâng cấp)

Utility `server/src/utils/gradeCalculator.js` dùng chung giữa exportController và notifyController:

| Hàm | Công thức |
| --- | --- |
| `tinhTBHocTap(grades)` | Tong(diem x heSo) / Tong(heSo) — heSo: mieng=1, 15phut=1, 1tiet=2 |
| `tinhTongKet(tbHT, diemCC)` | TBM x 0.8 + CC x 0.2, làm tròn 2 chữ số |
| `phanLoai(diem)` | >=9 Xuất sắc / >=8 Giỏi / >=6.5 Khá / >=5 Trung bình / <5 Yếu |

GradeForm client-side cũng tính ngay khi nhập:

- Badge Tổng kết cập nhật realtime khi nhập điểm hoặc CC
- Học lực tự phân loại và đổi màu
- Nút email gửi bảng điểm ngay từ form

#### AttendanceTable — nâng cấp

- Lọc theo buổi học (Chúa Nhật cụ thể)
- Cột đếm số buổi vắng, màu đỏ khi vắng nhiều
- Thanh tiến độ % điểm danh theo từng em (xanh >= 80%, vàng >= 60%, đỏ < 60%)
- Nút mail nhanh gửi email điểm danh ngay trên bảng

#### AdminPosts — nâng cấp

- Upload ảnh bài viết: validate MIME, tối đa 2MB, nén Canvas xuống 1200px, quality 0.82
- Phân loại bài: tintuc / thongbao / thongbaokhan với màu badge riêng
- Toggle daDang (công khai / nháp), hạn hiển thị hanHienThi

#### AdminUsers — Quản lý tài khoản

- Tab lọc: Tất cả / Admin / Huynh trưởng / Dự trưởng / GLV khác / Phụ huynh
- Tạo / chỉnh sửa user: hoTen, email, vaiTro, chucVu (chỉ hiện khi vaiTro = giaoly), soDienThoai
- Reset chucVu về null khi đổi vai trò khỏi giaoly

---

### GIAI ĐOẠN 14 — Tối ưu hiệu năng & Production — Sắp tới

- PWA offline support (Service Worker, cache assets)
- Kiểm thử toàn diện (unit test controller, integration test API)
- Performance audit: Lighthouse score >= 90
- Rate limiting cho `/api/notify/` tránh spam
- Monitoring: lỗi email, lỗi scrape Lời Chúa, alert khi cả 3 nguồn down
- Tài liệu hướng dẫn sử dụng cho Huynh trưởng

---

## 6. CÔNG NGHỆ SỬ DỤNG

| Phần | Công nghệ |
| --- | --- |
| Frontend | React 19, Vite, React Router v7, Framer Motion 12 |
| Styling | Tailwind CSS 4, EB Garamond, Inter |
| Backend | Node.js, Express 5, Mongoose 9 |
| Database | MongoDB → MongoDB Atlas (prod) |
| Auth | JWT (7 ngày), bcryptjs |
| Email | nodemailer (3 template HTML branding) |
| Export | ExcelJS 4 (xlsx đa sheet, màu sắc, UTF-8 filename) |
| Storage | Firebase Storage (gallery + avatar đoàn sinh + ảnh bài viết) |
| Phụng vụ | romcal (lịch phụng vụ tự động), tgpsaigon.net scraper |
| Deploy | Vercel (FE) + Render (BE) + MongoDB Atlas (DB) |
| i18n | i18next (VI / EN) |

---

## 7. GHI CHÚ KỸ THUẬT

- **`checkClassPermission`** phải chạy trên mọi route write của attendance, grades, chuyencan — ngăn HT sửa chéo lớp.
- **`NamHoc.dangHoatDong`** là nguồn sự thật cho mọi query mặc định — luôn chỉ có 1 năm active.
- **ChuyenCan index unique** `(student, lop, namHoc, hocKy)` — mỗi em chỉ có 1 bản ghi CC mỗi HK.
- **PromotionHistory** dùng MongoDB transaction — nếu server không hỗ trợ replica set, bỏ `session`.
- **Avatar**: upload thẳng lên Firebase từ client, chỉ lưu URL vào MongoDB — không qua server.
- **Export toàn đoàn** gọi DB tuần tự theo từng lớp (for...of) — tránh quá tải RAM trên Render free.
- **Lời Chúa cache** sống trong RAM process — restart Render xóa cache, scrape lại lần đầu.
- **gradeCalculator** là nguồn sự thật duy nhất cho công thức 80/20 — không tính lại ở client lẫn exportController riêng lẻ.
- **File `.env`** tuyệt đối không commit — chỉ commit `.env.example`.
