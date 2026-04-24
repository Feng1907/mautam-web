# CHIẾN LƯỢC PHÁT TRIỂN HỆ THỐNG QUẢN LÝ XỨ ĐOÀN ANRÊ PHÚ YÊN - MẪU TÂM

---

## TIẾN ĐỘ TỔNG QUAN

| Giai đoạn | Nội dung | Trạng thái |
|-----------|----------|------------|
| 0 | Khởi tạo project & cấu trúc mã nguồn | ✅ Hoàn thành |
| 1 | Database schema & quan hệ dữ liệu | ✅ Hoàn thành |
| 2 | Backend API (Auth, RBAC, CRUD) | ⬜ Chưa bắt đầu |
| 3 | Frontend UI cơ bản | ⬜ Chưa bắt đầu |
| 4 | Tính năng Điểm danh | ⬜ Chưa bắt đầu |
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

### GIAI ĐOẠN 2 — Backend API `⬜ Chưa bắt đầu`

#### Auth & Tài khoản
- [ ] `POST /api/auth/login` — JWT, 7 ngày
- [ ] `GET  /api/auth/me`
- [ ] `POST /api/auth/register` — Admin tạo tài khoản cho HT
- [ ] `PUT  /api/auth/change-password` — đổi mật khẩu lần đầu
- [ ] `POST /api/auth/forgot-password` — reset qua email (nodemailer)

#### Quản lý lớp & nhân sự
- [ ] `GET    /api/classes` — danh sách lớp theo năm học
- [ ] `POST   /api/classes` — Admin tạo lớp mới
- [ ] `PUT    /api/classes/:id/assign` — Admin phân công HT vào lớp
- [ ] `GET    /api/classes/:id` — chi tiết lớp

#### Đoàn sinh
- [ ] `GET    /api/students/:lopId` — danh sách theo lớp
- [ ] `POST   /api/students` — thêm đoàn sinh
- [ ] `PUT    /api/students/:id` — cập nhật
- [ ] `DELETE /api/students/:id` — soft delete (inactive)

#### Điểm danh
- [ ] `GET  /api/attendance/:lopId` — toàn bộ bản ghi lớp
- [ ] `POST /api/attendance` — upsert (tạo hoặc cập nhật)
- [ ] `GET  /api/attendance/sundays?startDate&endDate` — tự sinh danh sách Chúa Nhật

#### Bảng điểm
- [ ] `GET    /api/grades/:lopId`
- [ ] `POST   /api/grades`
- [ ] `PUT    /api/grades/:id`
- [ ] `DELETE /api/grades/:id`

#### Tin tức
- [ ] `GET    /api/posts` — public
- [ ] `GET    /api/posts/:id`
- [ ] `POST   /api/posts` — Admin only
- [ ] `PUT    /api/posts/:id`
- [ ] `DELETE /api/posts/:id`

#### Export
- [ ] `GET /api/export/attendance/:lopId` — Excel chuyên cần
- [ ] `GET /api/export/grades/:lopId` — Excel bảng điểm
- [ ] `GET /api/export/attendance/:lopId/pdf`
- [ ] `GET /api/export/grades/:lopId/pdf`

---

### GIAI ĐOẠN 3 — Frontend UI cơ bản `⬜ Chưa bắt đầu`

- [ ] Layout tổng thể (Navbar, Footer, màu sắc thương hiệu)
- [ ] Trang Home — giới thiệu xứ đoàn, châm ngôn Quan thầy
- [ ] Trang Giờ Lễ — lịch cố định + Lời Chúa (nhập thủ công hoặc API)
- [ ] Trang Tin Tức — danh sách bài viết + chi tiết
- [ ] Trang Đăng nhập — form + xử lý lỗi
- [ ] Trang Danh sách lớp — hiển thị 12 lớp theo ngành
- [ ] Route Guard — redirect nếu chưa đăng nhập / không đủ quyền

---

### GIAI ĐOẠN 4 — Tính năng Điểm danh `⬜ Chưa bắt đầu`

- [ ] Giao diện lưới điểm danh (hàng = học sinh, cột = Chúa Nhật)
- [ ] Scroll ngang khi nhiều tuần
- [ ] Toggle check-in trực tiếp trên lưới (chỉ HT lớp mình)
- [ ] Hiển thị tổng số buổi có mặt / vắng theo từng học sinh
- [ ] Chọn năm học để xem lại dữ liệu cũ

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
