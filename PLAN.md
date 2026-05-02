# CHIẾN LƯỢC PHÁT TRIỂN HỆ THỐNG QUẢN LÝ XỨ ĐOÀN ANRÊ PHÚ YÊN - MẪU TÂM

---

## TIẾN ĐỘ TỔNG QUAN

| Giai đoạn | Nội dung | Trạng thái |
|-----------|----------|------------|
| 0  | Khởi tạo project & cấu trúc mã nguồn | ✅ Hoàn thành |
| 1  | Database schema & quan hệ dữ liệu | ✅ Hoàn thành |
| 2  | Backend API (Auth, RBAC, CRUD) | ✅ Hoàn thành |
| 3  | Frontend UI cơ bản | ✅ Hoàn thành |
| 4  | Tính năng Điểm danh | ✅ Hoàn thành |
| 5  | Tính năng Bảng điểm | ✅ Hoàn thành |
| 6  | Tính năng Tin tức & Thông báo | ✅ Hoàn thành |
| 7  | Export Excel | ✅ Hoàn thành |
| 8  | Kiểm thử & Deployment | ✅ Hoàn thành |
| 9  | UX nâng cao & Trải nghiệm Phụng vụ | ✅ Hoàn thành |
| 10 | Thư viện ảnh Firebase | ✅ Hoàn thành |
| 11 | UI Spiritual Modernism + Chuyên cần + Lên lớp + Nhân sự | ✅ Hoàn thành |
| 12 | Polish: Báo cáo tổng kết, Email phụ huynh, Lời Chúa, Stats, Avatar, Lịch sử điểm | ✅ Hoàn thành |
| 13 | Tối ưu hiệu năng, PWA offline, kiểm thử toàn diện & chuẩn bị production | 🔜 Sắp tới |

---

## 1. TỔNG QUAN DỰ ÁN

- **Tên dự án:** Website Xứ Đoàn Anrê Phú Yên - Mẫu Tâm
- **Mục tiêu:** Số hóa quản lý giáo lý, điểm danh, điểm số và truyền thông cho Đoàn Thiếu Nhi Thánh Thể
- **Quan thầy:** Thánh Anrê Phú Yên — *"Lấy tình yêu đáp lại tình yêu, lấy mạng sống đáp lại mạng sống."*
- **Đối tượng sử dụng:** Cha Xứ, Thầy Xứ, Ban Điều Hành, Huynh trưởng, Dự trưởng, Phụ huynh

### Nhận diện thương hiệu
- **Logo:** Hình ảnh nhà thờ Mẫu Tâm kết hợp vòng tròn 5 màu ngành TNTT
- **Màu sắc:** Đỏ đô `#8B0000` · Vàng đồng `#D4AF37` · Kem ngà `#fdfbf7`
- **Design System:** Spiritual Modernism — cổ điển, trang trọng, dễ dùng trên mobile

---

## 2. CƠ CẤU TỔ CHỨC

### Nhân sự
| Vai trò | Số lượng |
|---------|----------|
| Cha Xứ | 01 |
| Thầy Xứ | 01 |
| Huynh trưởng | 14 |
| Dự trưởng | 09 |

### Hệ thống 12 lớp
| Ngành | Lớp |
|-------|-----|
| Chiên Non | Khai Tâm |
| Ấu Nhi | XT 1, XT 2A, XT 2B, XT 3A *(Bí Tích)*, XT 3B *(Bí Tích)* |
| Thiếu Nhi | Thêm Sức 1, Thêm Sức 2 |
| Nghĩa Sĩ | Sống Đạo 1, Sống Đạo 2, Sống Đạo 3 |
| Hiệp Sĩ | Hiệp Sĩ |

---

## 3. PHÂN QUYỀN (RBAC)

| Chức năng | User / Phụ huynh | Giáo lý viên | Admin |
|-----------|:-:|:-:|:-:|
| Xem giờ lễ, Lời Chúa, tin tức | ✅ | ✅ | ✅ |
| Xem danh sách lớp & lịch sử điểm | ✅ | ✅ | ✅ |
| Điểm danh lớp mình | ❌ | ✅ | ✅ |
| Nhập điểm + điểm chuyên cần | ❌ | ✅ lớp mình | ✅ |
| Cập nhật đoàn sinh + avatar | ❌ | ✅ lớp mình | ✅ |
| Export Excel (lớp mình) | ❌ | ✅ | ✅ |
| Đăng tin tức / thông báo khẩn | ❌ | ❌ | ✅ |
| Quản lý tất cả lớp & nhân sự | ❌ | ❌ | ✅ |
| Lên lớp hàng loạt | ❌ | ❌ | ✅ |
| Export tổng kết toàn đoàn | ❌ | ❌ | ✅ |
| Dashboard thống kê ngành | ❌ | ❌ | ✅ |
| Tạo / reset tài khoản | ❌ | ❌ | ✅ |

> **Nguyên tắc bảo mật:** Middleware `checkClassPermission` chặn mọi truy cập chéo lớp.

---

## 4. BỐ CỤC MÃ NGUỒN

```
mautam-website/
├── client/                          # React 19 + Vite
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── AttendanceTable.jsx  # Điểm danh lưới Chúa Nhật
│       │   ├── GradeForm.jsx        # Bảng điểm + Chuyên cần (80/20)
│       │   ├── StudentList.jsx      # Danh sách + avatar + lịch sử điểm
│       │   └── ExportButton.jsx
│       ├── pages/
│       │   ├── ClassList.jsx        # Explorer 5 ngành + search
│       │   ├── ClassDetail.jsx      # 3 tab: Danh sách / Điểm danh / Bảng điểm
│       │   ├── LoiChua.jsx          # Lời Chúa + điều hướng ngày
│       │   ├── GioLe.jsx            # Dashboard phụng vụ + đồng hồ real-time
│       │   ├── Gallery.jsx          # Thư viện ảnh Firebase
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminClasses.jsx # Phân công nhân sự
│       │       ├── AdminPromotion.jsx # Lên lớp hàng loạt
│       │       ├── AdminStats.jsx   # Dashboard thống kê ngành
│       │       ├── AdminExport.jsx  # Export toàn đoàn
│       │       └── AdminNamHoc.jsx
│       ├── services/
│       │   ├── api.js               # Axios + JWT interceptor
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
        │   ├── ChuyenCan.js         # Điểm chuyên cần (mới phase 11)
        │   ├── MeritPoint.js
        │   ├── PromotionHistory.js  # Lịch sử lên lớp
        │   └── Post.js
        ├── controllers/
        │   ├── exportController.js  # attendance, grades, tổng kết, toàn đoàn
        │   ├── chuyenCanController.js
        │   ├── promoteController.js
        │   └── ...
        ├── routes/
        │   ├── export.js            # /attendance, /grades, /tong-ket, /tong-ket-toan-doan
        │   ├── chuyencan.js
        │   ├── promote.js
        │   └── ...
        └── middlewares/
            ├── checkAuth.js
            └── checkClassPermission.js
```

---

## 5. LỘ TRÌNH CHI TIẾT

---

### GIAI ĐOẠN 0–9 `✅ Hoàn thành`

> Xem chi tiết từng task trong git log. Tóm tắt:
> - **0–2:** Khởi tạo, schema, API CRUD toàn bộ
> - **3:** Frontend UI cơ bản, routing, auth
> - **4:** Bảng điểm danh Chúa Nhật (scroll ngang, sticky, optimistic update)
> - **5:** Bảng điểm (hệ số, TBM, học lực, read-only mode)
> - **6:** Tin tức, thông báo khẩn, UrgentBanner, Admin CRUD
> - **7:** Export Excel chuyên cần + bảng điểm (ExcelJS, UTF-8 filename)
> - **8:** Vercel + Render + MongoDB Atlas deployment config
> - **9:** UX nâng cao — Class Explorer 5 tab, Giờ Lễ dashboard, Lời Chúa Bible mode

---

### GIAI ĐOẠN 10 — Thư viện ảnh Firebase `✅ Hoàn thành`

- [x] Firebase Storage upload với nén ảnh tự động (Canvas API, WebP, ≤500KB)
- [x] Firestore lưu metadata: tiêu đề, sự kiện, năm, timestamp, storagePath
- [x] Gallery page: lưới ảnh lazy-load, lightbox toàn màn hình, điều hướng ← →
- [x] Admin upload: drag & drop, progress bar 2 giai đoạn (nén → upload)
- [x] Xoá ảnh: đồng bộ Storage + Firestore

---

### GIAI ĐOẠN 11 — UI Spiritual Modernism & Tính năng cốt lõi `✅ Hoàn thành`

#### UI Overhaul
- [x] Design System: màu đỏ đô / vàng đồng / kem ngà, font Georgia serif + Inter sans
- [x] SVG watermark thánh giá chìm trên bảng điểm
- [x] Framer Motion transitions toàn bộ tab, modal, page enter/exit

#### Chuyên cần (Attendance Score)
- [x] Model `ChuyenCan`: tongBuoi, soBuoiDi, vangCoPhep, vangKhongPhep, diem, ghiChu
- [x] API upsert với auto-calc: `10 − vắng_KP×1 − vắng_CP×0.5`, kẹp [0,10]
- [x] GradeForm: thay cột Thi đua → Chuyên cần, icon CalendarCheck
- [x] Modal 2 mode: nhập từ buổi (preview điểm) hoặc nhập thẳng 0–10
- [x] **Công thức Tổng kết = TBM × 80% + CC × 20%**
- [x] Bộ lọc Nam/Nữ trong GradeForm và StudentList

#### Lên lớp hàng loạt
- [x] Trang `AdminPromotion`: chọn lớp nguồn → lớp đích → năm học mới
- [x] Checkbox chọn từng đoàn sinh hoặc chọn tất cả
- [x] MongoDB transaction đảm bảo tính toàn vẹn
- [x] `PromotionHistory` lưu đầy đủ: từ lớp, sang lớp, năm học, ai thực hiện
- [x] Tab Lịch sử: xem lại toàn bộ đợt chuyển lớp, expand chi tiết

#### Phân công Nhân sự
- [x] Modal phân công HT + DT (checkbox nhiều người)
- [x] Dashboard ClassCard: hiển thị Dự trưởng khi chưa có Huynh trưởng
- [x] ClassList ClassCard: ưu tiên HT → DT → "Chưa phân công"

---

### GIAI ĐOẠN 12 — Polish & Production-Ready `✅ Hoàn thành`

#### Báo cáo tổng kết cuối kỳ
- [x] `GET /api/export/tong-ket/:lopId` — Excel 1 lớp: TBM×80% + CC×20% + Học lực + Giới tính
- [x] `GET /api/export/tong-ket-toan-doan` — Excel toàn đoàn (admin only), 1 sheet/lớp
- [x] AdminExport: banner "Xuất toàn đoàn" + nút Tổng kết từng lớp

#### Thông báo đẩy Email phụ huynh
- [x] postController: khi đăng `thongbaokhan + daDang=true` → gửi email HTML đến **tất cả** users (kể cả role `user` = phụ huynh)
- [x] Template email có branding: tiêu đề đỏ đô, nội dung bài viết, hạn hiệu lực

#### Lời Chúa tự động
- [x] Date picker + nút Prev/Next ngày trong LoiChua.jsx
- [x] Nút "Hôm nay" + nút **"Chúa Nhật"** (tự tính Chúa Nhật gần nhất)
- [x] Mỗi lần đổi ngày tự fetch lại `loichua.net/api/daily?date=YYYY-MM-DD`

#### Dashboard thống kê ngành (AdminStats)
- [x] Route `/admin/thong-ke`, menu sidebar
- [x] BigStat cards: tổng đoàn sinh / có điểm / có CC / TBM toàn đoàn
- [x] Bar chart CSS: phân phối học lực toàn đoàn
- [x] Grid 5 ngành: TB điểm CC, % điểm danh, học lực từng ngành
- [x] Chọn học kỳ 1 / 2, tự reload

#### Avatar đoàn sinh
- [x] StudentModal: chọn file ảnh → nén (imageCompression) → upload Firebase Storage `avatars/students/`
- [x] Cột Ảnh trong StudentList: avatar tròn hoặc fallback initials màu theo giới tính
- [x] Progress bar upload realtime trong modal

#### Lịch sử điểm
- [x] `GET /api/students/:lopId/:id/lich-su` — trả grades + chuyenCan theo từng NamHoc
- [x] `LichSuModal` trong StudentList: mỗi năm học hiển thị TBM / CC / Tổng kết / Học lực từng HK
- [x] Nút `History` (đồng hồ) trên mỗi hàng đoàn sinh, mở cho tất cả (không cần canEdit)

---

## 6. CÔNG NGHỆ SỬ DỤNG

| Phần | Công nghệ |
|------|-----------|
| Frontend | React 19, Vite, React Router v7, Framer Motion 12 |
| Styling | Tailwind CSS 4, EB Garamond, Inter |
| Backend | Node.js, Express 5, Mongoose 9 |
| Database | MongoDB → MongoDB Atlas (prod) |
| Auth | JWT (7 ngày), bcryptjs |
| Email | nodemailer (HTML template) |
| Export | ExcelJS 4 (xlsx đa sheet, màu sắc, UTF-8 filename) |
| Storage | Firebase Storage (ảnh gallery + avatar đoàn sinh) |
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
- **File `.env`** tuyệt đối không commit — chỉ commit `.env.example`.
