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
| 14 | AdminDashboard nâng cấp: Quick Actions, SVG Charts, Search toàn cục, Phụng vụ | Hoàn thành |
| 15 | Dark Mode toàn diện + Circular Reveal + Phụng vụ Việt Nam (dời lễ) | Hoàn thành |
| 16 | Chuẩn hóa tên lớp, fix Avatar, fix Calendar, tối ưu UI ClassList & GioLe | Hoàn thành |
| 17 | Tối ưu hiệu năng, PWA offline, kiểm thử toàn diện & chuẩn bị production | Sắp tới |

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
│       │   ├── Navbar.jsx           # Nav + user dropdown + ThemeToggle + LanguageSwitcher
│       │   ├── Footer.jsx           # Footer branding + motto
│       │   ├── AttendanceTable.jsx  # Điểm danh + lọc buổi + đếm vắng + email
│       │   ├── GradeForm.jsx        # Bảng điểm + CC + tính điểm tự động (80/20)
│       │   ├── StudentList.jsx      # Danh sách + avatar + lịch sử điểm
│       │   ├── ExportButton.jsx
│       │   ├── UrgentBanner.jsx     # Banner thông báo khẩn (dismissable, sessionStorage)
│       │   ├── RouteGuard.jsx       # Bảo vệ route theo role (admin/giaoly/user)
│       │   ├── LoadingSpinner.jsx   # Spinner SVG dùng chung
│       │   ├── LanguageSwitcher.jsx # Dropdown VI 🇻🇳 / EN 🇺🇸 (i18next)
│       │   ├── ThemeToggle.jsx      # Sun/Moon toggle + Circular Reveal
│       │   └── QuickActionWidgets.jsx  # 5 widget nhanh trong AdminDashboard
│       ├── pages/
│       │   ├── Home.jsx             # Landing page 5 ngành + SVG watermark
│       │   ├── Login.jsx            # Đăng nhập + redirect sau login
│       │   ├── Signup.jsx           # Đăng ký + auto-login
│       │   ├── ForgotPassword.jsx   # Quên mật khẩu — gửi email khôi phục
│       │   ├── Profile.jsx          # Hồ sơ cá nhân: avatar upload, chỉnh sửa thông tin
│       │   ├── News.jsx             # Tin tức + lọc loại + UrgentBanner
│       │   ├── NewsDetail.jsx       # Chi tiết bài viết: ảnh, nội dung HTML, tác giả
│       │   ├── ClassList.jsx        # Explorer 5 ngành + search
│       │   ├── ClassDetail.jsx      # 3 tab: Danh sách / Điểm danh / Bảng điểm
│       │   ├── LoiChua.jsx          # Lời Chúa + điều hướng ngày + Chúa Nhật + MiniCalendar
│       │   ├── GioLe.jsx            # Dashboard phụng vụ + đồng hồ real-time + feast effects
│       │   ├── Gallery.jsx          # Thư viện ảnh Firebase
│       │   └── admin/
│       │       ├── AdminLayout.jsx     # Wrapper: sidebar desktop + bottom tab mobile
│       │       ├── AdminDashboard.jsx  # Quick Actions, SVG Charts, Global Search, Liturgy Card
│       │       ├── AdminClasses.jsx    # Phân công nhân sự
│       │       ├── AdminPromotion.jsx  # Lên lớp hàng loạt + lịch sử
│       │       ├── AdminStats.jsx      # Dashboard thống kê ngành
│       │       ├── AdminExport.jsx     # Export toàn đoàn
│       │       ├── AdminPosts.jsx      # Quản lý tin tức / thông báo (CRUD + ảnh)
│       │       ├── AdminUsers.jsx      # Quản lý tài khoản + phân quyền
│       │       └── AdminNamHoc.jsx     # Quản lý năm học
│       ├── services/
│       │   ├── api.js               # Axios + JWT interceptor + 401 auto-redirect
│       │   ├── firebase.js          # Firebase SDK init (Storage + Firestore)
│       │   └── galleryService.js    # Upload + nén ảnh Firebase
│       ├── store/
│       │   ├── AuthContext.jsx      # Login/logout state + updateUser + useAuth hook
│       │   └── ThemeContext.jsx     # Dark/light + localStorage + system preference
│       ├── utils/
│       │   └── formatClassName.js   # Viết tắt → tên đầy đủ (XT, CN, TN, NS, HS)
│       └── i18n.js                  # VI / EN (i18next)
│
└── server/                          # Node.js + Express 5
    └── src/
        ├── models/
        │   ├── User.js, Class.js, Student.js
        │   ├── NamHoc.js, Grade.js, Attendance.js
        │   ├── ChuyenCan.js         # Điểm chuyên cần
        │   ├── MeritPoint.js
        │   ├── PromotionHistory.js  # Lịch sử lên lớp
        │   └── Post.js
        ├── controllers/
        │   ├── authController.js         # Login, signup, forgot password
        │   ├── exportController.js       # attendance, grades, tổng kết, toàn đoàn
        │   ├── notifyController.js       # Email: điểm danh, lịch lễ, bảng điểm
        │   ├── loiChuaController.js      # Scraper 3 nguồn + cache + romcal
        │   ├── chuyenCanController.js
        │   ├── promoteController.js
        │   └── ...
        ├── routes/
        │   ├── auth.js              # /login, /signup, /forgot-password
        │   ├── export.js            # /attendance, /grades, /tong-ket, /tong-ket-toan-doan
        │   ├── notify.js            # /diem-danh, /lich-le, /bang-diem
        │   ├── liturgy.js           # /feasts (romcal + dời lễ VN)
        │   ├── chuyencan.js
        │   ├── promote.js
        │   └── ...
        ├── utils/
        │   ├── sendEmail.js         # Nodemailer transporter factory (SMTP env vars)
        │   ├── emailTemplates.js    # 3 template HTML: điểm danh, lịch lễ, bảng điểm
        │   └── gradeCalculator.js   # Hàm dùng chung: tinhTBHocTap, tinhTongKet, phanLoai
        ├── scripts/
        │   └── test-loichua.js      # Debug script kiểm tra 3 nguồn Lời Chúa
        └── middlewares/
            ├── checkAuth.js
            ├── checkClassPermission.js
            └── errorHandler.js      # Global error handler (Mongoose/JWT/500)
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

### GIAI ĐOẠN 14 — AdminDashboard nâng cấp — Hoàn thành

#### Quick Action Widgets (`QuickActionWidgets.jsx`)

| Widget | Chức năng |
| --- | --- |
| `AddStudentModal` | Form thêm đoàn sinh nhanh (hoTen, tenThanh, gioiTinh, lop, SĐT PH) → POST /api/students |
| `ExportDropdown` | Xuất Excel toàn đoàn (xlsx) hoặc In PDF (window.print), loading state |
| `SendNotifyModal` | Soạn & gửi thông báo khẩn → POST /api/posts, daDang=true |
| `StickyNote` | Ghi chú nhanh lưu localStorage, auto-save debounce 600ms |
| `QuickAttendanceModal` | Điểm danh 2 bước: chọn lớp (search) → điểm danh tại chỗ, lưu batch song song |

#### SVG Charts (không cần thư viện ngoài)

- `SvgBarChart` — đoàn sinh theo ngành, màu theo ngành, Y-axis tự scale
- `SvgDonutChart` — tỉ lệ chuyên cần (Có mặt / Nghỉ phép / Nghỉ không phép)
- MutationObserver theo dõi class `dark` trên `<html>` để cập nhật màu SVG realtime

#### Global Search (debounce 220ms)

- Tìm đồng thời users (tên + email) và classes (tên lớp đã format)
- Dropdown gợi ý phân loại bằng icon, click điều hướng thẳng
- Đóng khi click ngoài (mousedown listener)

#### Liturgy Card

- Gọi `/api/loi-chua` + `/api/liturgy/feasts` → tự đổi màu nền theo màu áo lễ
- Hiển thị tên lễ + chủ đề Tin Mừng + link sang trang Giờ Lễ

---

### GIAI ĐOẠN 15 — Dark Mode toàn diện — Hoàn thành

#### ThemeContext + Circular Reveal

- `ThemeContext.jsx`: quản lý `dark`/`light`, lưu localStorage, nhận system preference
- Circular Reveal: `document.startViewTransition()` + CSS `clip-path: circle(0%→160%)` từ tâm nút bấm
- Fallback: chuyển ngay nếu browser không hỗ trợ View Transitions API
- `ThemeToggle.jsx`: icon Sun/Moon với rotate 90° animation, đặt trên Navbar (desktop + mobile)
- Tailwind v4: `@custom-variant dark` → class-based dark mode

#### Dark Mode phủ toàn hệ thống

| Trang / Component | Xử lý |
| --- | --- |
| AdminLayout sidebar | `dark:bg-slate-800 dark:border-slate-700`, link active `dark:bg-red-950/50` |
| AdminDashboard | Tất cả card, search, chart SVG, user list |
| Home, Gallery, News | `bg-page` class tự chuyển `#fdfbf7` → `#0f172a` |
| GioLe | Main `dark:bg-slate-950`, card `dark:bg-slate-800`, đồng hồ, bảng giờ lễ |
| LoiChua | Toàn bộ rewrite: ACCENT màu áo lễ, paper card, navigation, MiniCalendar |
| index.css | `.bg-page`, `.dark .dark\:bg-slate-800 { !important }`, global input/table dark |

#### Feast Visual Effects (GioLe.jsx)

- `feast-solemnity` — gradient red-700→rose-600, inset glow đỏ
- `feast-great` — gradient amber-950→yellow-900, glow vàng
- `feast-feast` — gradient blue-600/20, glow xanh
- `feast-memorial` — `bg-slate-800/40 backdrop-blur-md`, glow đen tối
- `hover:scale-[1.01] transition-all duration-300` trên tất cả cấp lễ

#### Phụng vụ Việt Nam — Dời lễ

- `adjustVietnameseLiturgicalCalendar()` trong `liturgy.js`:
  - Lễ Chúa Giêsu Lên Trời: Thứ Năm → Chúa Nhật VII Phục Sinh
  - Lễ Mình Máu Thánh Chúa: Thứ Năm → Chúa Nhật tiếp theo
  - Fix timezone: dùng `getFullYear/Month/Date` thay `toISOString()` tránh lệch UTC+7

---

### GIAI ĐOẠN 16 — Chuẩn hóa & Fix — Hoàn thành

#### utils/formatClassName.js — dùng chung toàn hệ thống

Regex replace tiền tố viết tắt → tên đầy đủ:

| Viết tắt | Tên đầy đủ |
| --- | --- |
| XT | Xưng Tội |
| CN | Chiên Non |
| TN | Thiếu Nhi |
| NS | Nghĩa Sĩ |
| HS | Hiệp Sĩ |

Áp dụng vào: ClassList, ClassDetail, AdminDashboard, AdminClasses, AdminExport, AdminPromotion, AdminUsers, Profile.

#### Fix Avatar toàn hệ thống

- AdminUsers: `<img>` + `onError` fallback về gradient placeholder
- AdminDashboard: tương tự, `display:none` toggle bằng JS
- Avatar gradient 8 màu theo ký tự đầu tên

#### Fix Calendar (LoiChua MiniCalendar)

- Tách `viewYear/viewMonth` state khỏi `selectedDate` → điều hướng tháng độc lập
- Nút `‹ ›` chuyển tháng, canGoNext chặn tháng tương lai
- `useEffect` đồng bộ view khi selectedDate thay đổi từ bên ngoài
- `invisible` thay `''` cho ô null → giữ grid alignment

#### ClassList Layout

- Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch`
- `motion.div` bọc card dùng `flex flex-col`, `Link` dùng `flex-1`
- Đồng đều chiều cao card dù nội dung khác nhau

#### Giờ Lễ — Chữ & Visual

- Giờ Lễ Cố Định: dark variants cho label (`dark:text-slate-200`) và time pill
- GioLe dark background: `dark:bg-none dark:bg-slate-950`
- CAP_CONFIG Lễ Nhớ/Kính: `dark:shadow-none`, viền `border-slate-200`

---

### GIAI ĐOẠN 16b — Các tính năng nền tảng (đã tồn tại, bổ sung tài liệu)

Các thành phần này được xây dựng xuyên suốt các giai đoạn 0–16 nhưng chưa được ghi lại rõ ràng:

#### Trang xác thực & hồ sơ

| Trang | Mô tả |
| --- | --- |
| `Login.jsx` | Form đăng nhập email/mật khẩu, redirect về trang trước sau khi login thành công |
| `Signup.jsx` | Đăng ký tài khoản (hoTen, email, phone, mật khẩu), auto-login sau khi tạo |
| `ForgotPassword.jsx` | Nhập email → server gửi link khôi phục mật khẩu |
| `Profile.jsx` | Xem & chỉnh sửa thông tin cá nhân; upload avatar lên Firebase Storage (validate MIME, tối đa 1.5MB), gradient fallback 8 màu theo ký tự đầu tên |

#### Trang tin tức bổ sung

| Trang | Mô tả |
| --- | --- |
| `NewsDetail.jsx` | Chi tiết bài viết: ảnh đại diện, tác giả, ngày đăng, render nội dung HTML an toàn, nút quay lại |

#### Components nền tảng

| Component | Mô tả |
| --- | --- |
| `Footer.jsx` | Footer: tên đoàn, motto, năm bản quyền |
| `RouteGuard.jsx` | HOC bảo vệ route theo role — redirect về `/login` kèm `returnTo` nếu chưa đăng nhập hoặc không đủ quyền |
| `LoadingSpinner.jsx` | SVG spinner dùng chung, có prop `text` (mặc định "Đang tải...") |
| `LanguageSwitcher.jsx` | Dropdown chọn ngôn ngữ VI 🇻🇳 / EN 🇺🇸, đóng khi click ngoài, đồng bộ i18next |

#### Nền tảng server

| File | Mô tả |
| --- | --- |
| `utils/sendEmail.js` | Factory tạo Nodemailer transporter từ env vars; sender name "Xứ Đoàn Mẫu Tâm" |
| `middlewares/errorHandler.js` | Global error handler: Mongoose ValidationError → 400, duplicate key → 400, JWT lỗi → 401, khác → 500 |
| `routes/auth.js` | `/login`, `/signup`, `/forgot-password` |
| `routes/liturgy.js` | `/api/liturgy/feasts` — romcal + `adjustVietnameseLiturgicalCalendar` |

#### Layout admin

- `AdminLayout.jsx`: wrapper bọc toàn bộ khu vực admin — sidebar icon + label (desktop), bottom tab bar cố định (mobile), dark mode variants đầy đủ.

---

### GIAI ĐOẠN 17 — Tối ưu hiệu năng & Production — Sắp tới

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
| Styling | Tailwind CSS 4, EB Garamond, Inter, Dark Mode (View Transitions API) |
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
- **`formatClassName`** là nguồn sự thật duy nhất cho tên lớp hiển thị — không hardcode tên dài trong DB.
- **Dark Mode** dùng class `dark` trên `<html>` (không phải `prefers-color-scheme`) để user có thể override.
- **View Transitions API** chỉ chạy trên Chrome/Edge 111+ — fallback instant toggle cho Firefox/Safari.
- **`adjustVietnameseLiturgicalCalendar`** cần chạy sau khi merge custom events — thứ tự sort phải đảm bảo.
- **SVG Charts** trong AdminDashboard dùng MutationObserver theo dõi class `dark` — không dùng `useTheme` để tránh re-render toàn component.
- **`server/debug/`** đã thêm vào `.gitignore` — file HTML debug tgpsaigon.net không được commit.
