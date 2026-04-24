# CHIẾN LƯỢC PHÁT TRIỂN HỆ THỐNG QUẢN LÝ XỨ ĐOÀN ANRÊ PHÚ YÊN - MẪU TÂM

---

## TIẾN ĐỘ TỔNG QUAN

| Giai đoạn | Nội dung | Trạng thái |
|-----------|----------|------------|
| 0 | Khởi tạo project & cấu trúc mã nguồn | ✅ Hoàn thành |
| 1 | Database schema & quan hệ dữ liệu | ✅ Hoàn thành |
| 2 | Backend API (Auth, RBAC, CRUD) | ✅ Hoàn thành |
| 3 | Frontend UI cơ bản | ✅ Hoàn thành |
| 4 | Tính năng Điểm danh | ✅ Hoàn thành |
| 5 | Tính năng Bảng điểm | ⬜ Chưa bắt đầu |
| 6 | Tính năng Tin tức & Thông báo | ⬜ Chưa bắt đầu |
| 7 | Export Excel / PDF | ⬜ Chưa bắt đầu |
| 8 | Kiểm thử & Deployment | ⬜ Chưa bắt đầu |

---

## 1. TỔNG QUAN DỰ ÁN

- **Tên dự án:** Website Xứ Đoàn Anrê Phú Yên - Mẫu Tâm
- **Mục tiêu:** Số hóa quản lý giáo lý, điểm danh, điểm số và truyền thông cho Đoàn Thiếu Nhi Thánh Thể
- **Quan thầy:** Thánh Anrê Phú Yên — *"Lấy tình yêu đáp lại tình yêu, lấy mạng sống đáp lại mạng sống."*
- **Đối tượng sử dụng:** Cha Xứ, Thầy Xứ, Ban Điều Hành, Huynh trưởng, Dự trưởng, Phụ huynh

### Nhận diện thương hiệu
- **Logo:** Hình ảnh nhà thờ Mẫu Tâm kết hợp vòng tròn 5 màu ngành TNTT
- **Màu sắc:** Đỏ (nhiệt huyết) · Xanh (hy vọng) · Trắng (trong trắng)

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
| Xem giờ lễ | ✅ | ✅ | ✅ |
| Xem lời Chúa | ✅ | ✅ | ✅ |
| Xem tin tức & thông báo | ✅ | ✅ | ✅ |
| Xem danh sách lớp (read-only) | ✅ | ✅ | ✅ |
| Điểm danh lớp mình | ❌ | ✅ | ✅ |
| Nhập điểm lớp mình | ❌ | ✅ | ✅ |
| Cập nhật thông tin đoàn sinh | ❌ | ✅ lớp mình | ✅ |
| Đăng tin tức / thông báo khẩn | ❌ | ❌ | ✅ |
| Quản lý tất cả lớp & nhân sự | ❌ | ❌ | ✅ |
| Phân công Huynh trưởng vào lớp | ❌ | ❌ | ✅ |
| Tạo / reset tài khoản | ❌ | ❌ | ✅ |
| Xuất Excel / PDF | ❌ | ❌ | ✅ |

> **Nguyên tắc bảo mật:** Huynh trưởng / Dự trưởng chỉ được thao tác trên lớp được phân công, middleware `checkClassPermission` chặn mọi truy cập chéo lớp.

---

## 4. BỐ CỤC MÃ NGUỒN

```
mautam-website/
├── client/                          # React + Vite
│   └── src/
│       ├── assets/                  # Logo, ảnh Thánh Anrê Phú Yên
│       ├── components/              # Navbar, Footer, AttendanceTable, GradeForm
│       ├── pages/                   # Home, News, Liturgy, ClassDetail, Login
│       ├── services/api.js          # Axios + auto-attach JWT token
│       ├── store/AuthContext.jsx    # Auth state toàn cục
│       └── App.jsx                  # React Router
└── server/                          # Node.js + Express
    ├── index.js
    └── src/
        ├── config/db.js             # Kết nối MongoDB
        ├── models/                  # User, Class, Student, Attendance, Grade, Post, NamHoc
        ├── controllers/             # Auth, Student, Grade, Attendance, Post
        ├── middlewares/             # checkAuth, checkClassPermission
        ├── routes/                  # API endpoints
        └── app.js
```

---

## 5. LỘ TRÌNH CHI TIẾT

---

### GIAI ĐOẠN 0 — Khởi tạo project `✅ Hoàn thành`

- [x] Khởi tạo Vite (React) cho frontend
- [x] Khởi tạo Express + cài packages cho backend
- [x] Tạo cấu trúc thư mục đầy đủ
- [x] Tạo `.gitignore` (loại trừ `node_modules`, `.env`)
- [x] Push lên GitHub

---

### GIAI ĐOẠN 1 — Database Schema `✅ Hoàn thành`

- [x] Model `NamHoc` — quản lý năm học, đóng/mở năm (auto tắt năm cũ khi bật năm mới)
- [x] Model `User` — vaiTro: admin / giaoly / user, bcrypt password, flag đổi mật khẩu lần đầu
- [x] Model `Class` — 5 ngành, ref NamHoc, unique index (tenLop + namHoc), thuTu hiển thị
- [x] Model `Student` — tenThanh, ngaySinh, ref Class, index text tìm kiếm tên
- [x] Model `Attendance` — ref NamHoc, unique index (student + lop + date), validate format ngày
- [x] Model `Grade` — loaiDiem: mieng / 15phut / 1tiet, ref NamHoc thay vì string
- [x] Model `Post` — loai: tintuc / thongbao / thongbaokhan, hanHienThi cho thông báo khẩn
- [x] Kiểm tra quan hệ & index toàn bộ schema (seed 12 lớp + năm học + admin ✅)

---

### GIAI ĐOẠN 2 — Backend API `✅ Hoàn thành`

#### Auth & Tài khoản
- [x] `POST /api/auth/login` — JWT, 7 ngày
- [x] `GET  /api/auth/me`
- [x] `POST /api/auth/register` — Admin tạo tài khoản + gửi email mật khẩu tạm
- [x] `PUT  /api/auth/change-password` — đổi mật khẩu, tắt flag phaiBatDauDoiMatKhau
- [x] `POST /api/auth/forgot-password` — reset qua email (nodemailer)

#### Quản lý năm học
- [x] `GET  /api/namhoc` — danh sách năm học
- [x] `POST /api/namhoc` — Admin tạo năm học mới
- [x] `PUT  /api/namhoc/:id/activate` — Admin kích hoạt năm học (auto tắt năm cũ)

#### Quản lý lớp & nhân sự
- [x] `GET    /api/classes` — danh sách lớp theo năm học (mặc định năm đang hoạt động)
- [x] `POST   /api/classes` — Admin tạo lớp mới
- [x] `PUT    /api/classes/:id/assign` — Admin phân công HT/DT, đồng bộ lopPhuTrach
- [x] `GET    /api/classes/:id` — chi tiết lớp

#### Quản lý người dùng
- [x] `GET    /api/users` — Admin xem danh sách (lọc theo vaiTro)
- [x] `PUT    /api/users/:id` — Admin cập nhật thông tin
- [x] `DELETE /api/users/:id` — Admin xoá (không tự xoá mình)

#### Đoàn sinh
- [x] `GET    /api/students/:lopId` — danh sách theo lớp
- [x] `GET    /api/students/:lopId/:id` — chi tiết đoàn sinh
- [x] `POST   /api/students` — thêm đoàn sinh
- [x] `PUT    /api/students/:id` — cập nhật (không đổi lớp qua route này)
- [x] `DELETE /api/students/:id` — soft delete (inactive)

#### Điểm danh
- [x] `GET  /api/attendance/:lopId` — toàn bộ bản ghi lớp theo năm học
- [x] `POST /api/attendance` — upsert (tạo hoặc cập nhật), tự lấy namHoc đang hoạt động
- [x] `GET  /api/attendance/sundays` — tự sinh danh sách Chúa Nhật theo năm học

#### Bảng điểm
- [x] `GET    /api/grades/:lopId` — lọc được theo namHocId và hocKy
- [x] `POST   /api/grades` — tự gắn namHoc đang hoạt động
- [x] `PUT    /api/grades/:id` — không cho đổi student/lop/namHoc
- [x] `DELETE /api/grades/:id`

#### Tin tức
- [x] `GET    /api/posts` — public, phân trang, lọc loại, ẩn thông báo hết hạn
- [x] `GET    /api/posts/:id`
- [x] `POST   /api/posts` — Admin only, gửi email khi thongbaokhan
- [x] `PUT    /api/posts/:id`
- [x] `DELETE /api/posts/:id`

#### Export
- [ ] `GET /api/export/attendance/:lopId` — Excel chuyên cần
- [ ] `GET /api/export/grades/:lopId` — Excel bảng điểm
- [ ] `GET /api/export/attendance/:lopId/pdf`
- [ ] `GET /api/export/grades/:lopId/pdf`

---

### GIAI ĐOẠN 3 — Frontend UI cơ bản `✅ Hoàn thành`

- [x] Layout tổng thể — Navbar responsive (mobile menu), Footer, màu đỏ thương hiệu
- [x] Trang Home — hero, 5 ngành TNTT, giới thiệu Quan thầy, quick links
- [x] Trang Giờ Lễ — lịch lễ cố định + khung Lời Chúa (cập nhật thủ công)
- [x] Trang Tin Tức — danh sách + lọc theo loại + phân trang
- [x] Trang Chi tiết bài viết
- [x] Trang Đăng nhập — form, xử lý lỗi, redirect về trang trước khi login
- [x] Trang Quên mật khẩu
- [x] Trang Danh sách lớp — gom nhóm theo ngành, màu sắc từng ngành
- [x] Trang Chi tiết lớp — 3 tab: Danh sách / Điểm danh / Bảng điểm
- [x] Route Guard — redirect /login nếu chưa đăng nhập, kiểm tra vai trò
- [x] Build production thành công (274ms, không lỗi)

---

### GIAI ĐOẠN 4 — Tính năng Điểm danh `✅ Hoàn thành`

- [x] Giao diện lưới điểm danh (hàng = học sinh, cột = Chúa Nhật)
- [x] Scroll ngang khi nhiều tuần, cột tên sticky bên trái
- [x] Toggle check-in trực tiếp — optimistic update, rollback nếu lỗi server
- [x] Chế độ xem read-only nếu không có quyền (badge cảnh báo)
- [x] Cột tổng kết: Có mặt / Vắng / % chuyên cần (màu xanh/vàng/đỏ theo ngưỡng)
- [x] Hàng tổng kết cuối bảng: sĩ số có mặt theo từng ngày
- [x] Highlight cột ngày hôm nay
- [x] Chọn năm học để xem lại dữ liệu cũ
- [x] Spinner loading + thông báo khi lớp chưa có đoàn sinh / Chúa Nhật

---

### GIAI ĐOẠN 5 — Tính năng Bảng điểm `⬜ Chưa bắt đầu`

- [ ] Bảng điểm theo lớp: cột Miệng, 15 phút, 1 tiết
- [ ] Form nhập điểm cho từng học sinh
- [ ] Tính điểm trung bình tự động
- [ ] Phân loại: Giỏi / Khá / Trung bình / Yếu
- [ ] Xem điểm read-only với User / lớp khác

---

### GIAI ĐOẠN 6 — Tin tức & Thông báo `⬜ Chưa bắt đầu`

- [ ] Admin đăng bài tin tức, chỉnh sửa, xoá
- [ ] Thông báo khẩn — hiển thị banner nổi bật trên tất cả trang
- [ ] Gửi email thông báo khẩn qua `nodemailer`

---

### GIAI ĐOẠN 7 — Export Excel / PDF `⬜ Chưa bắt đầu`

- [ ] Cài `exceljs` cho server
- [ ] Export bảng chuyên cần (.xlsx) theo lớp
- [ ] Export bảng điểm (.xlsx) theo lớp
- [ ] Export PDF bảng chuyên cần (dùng `puppeteer` hoặc `@react-pdf/renderer`)
- [ ] Export PDF bảng điểm
- [ ] Nút download trực tiếp trên giao diện Admin

---

### GIAI ĐOẠN 8 — Kiểm thử & Deployment `⬜ Chưa bắt đầu`

- [ ] Kiểm thử RBAC: HT không thể sửa lớp khác
- [ ] Kiểm thử luồng đăng nhập / reset mật khẩu
- [ ] Kiểm thử export file
- [ ] Cấu hình MongoDB Atlas (production)
- [ ] Deploy Backend lên Render
- [ ] Deploy Frontend lên Vercel
- [ ] Cấu hình biến môi trường production
- [ ] Kiểm thử end-to-end trên môi trường production

---

## 6. CÔNG NGHỆ SỬ DỤNG

| Phần | Công nghệ |
|------|-----------|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB (local dev) → MongoDB Atlas (prod) |
| Auth | JWT, bcryptjs |
| Email | nodemailer |
| Export | exceljs (Excel), puppeteer (PDF) |
| Deploy | Vercel (FE) + Render (BE) + MongoDB Atlas (DB) |

---

## 7. GHI CHÚ KỸ THUẬT QUAN TRỌNG

- **`checkClassPermission`** phải chạy trên mọi route write của attendance và grades — đây là lớp bảo vệ duy nhất ngăn HT sửa chéo lớp.
- **`NamHoc`** cần có flag `dangHoatDong` để lọc dữ liệu mặc định — tránh hiển thị nhầm dữ liệu năm cũ.
- **Tài khoản** nên do Admin tạo (không cho tự đăng ký) để kiểm soát danh sách HT/DT.
- **Lời Chúa** — quyết định sớm: tích hợp API ngoài hay Admin nhập thủ công mỗi tuần.
- **File `.env`** tuyệt đối không commit — chỉ commit `.env.example`.
