<div align="center">

<img
  src="client/public/images/Chan Phuoc Anre Phu Yen.jpg"
  alt="Chân Phước Anrê Phú Yên"
  width="100%"
  style="max-width: 800px; border-radius: 12px; border: 2px solid #D4AF37; shadow: 0 4px 12px rgba(0,0,0,0.5);"
/>

# XỨ ĐOÀN ANRÊ PHÚ YÊN – MẪU TÂM

*"Lấy tình yêu đáp lại tình yêu, lấy mạng sống đáp lại mạng sống."*

**— Chân Phước Anrê Phú Yên (1625 – 1644) —**

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Storage-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat-square&logo=framer&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Phase](https://img.shields.io/badge/Phase-17c_%E2%9C%85-8B0000?style=flat-square)

</div>

---

## 📖 Giới thiệu

**Xứ Đoàn Anrê Phú Yên – Mẫu Tâm** là ứng dụng web quản lý dành riêng cho Huynh trưởng và Dự trưởng của tổ chức Thiếu Nhi Thánh Thể. Hệ thống số hoá toàn bộ công việc quản lý giáo lý từ điểm danh đến báo cáo cuối kỳ:

- 📋 **Quản lý lớp học** theo 5 ngành: Chiên Non · Ấu Nhi · Thiếu Nhi · Nghĩa Sĩ · Hiệp Sĩ
- ✅ **Điểm danh** hàng tuần (Chúa Nhật) — lưới scroll ngang, toggle trực tiếp, thanh % tiến độ
- 📊 **Bảng điểm** miệng / 15 phút / 1 tiết — TBM tự động + phân loại học lực
- 📅 **Chuyên cần** — tự tính điểm từ số buổi vắng; **Tổng kết = TBM×80% + CC×20%**
- ⬆️ **Lên lớp hàng loạt** — chọn lớp nguồn → đích, lưu lịch sử đầy đủ
- 📤 **Xuất Excel** — điểm danh, bảng điểm, **tổng kết từng lớp** và **toàn đoàn**
- 📊 **Dashboard thống kê** — SVG bar + donut chart, phân phối học lực theo từng ngành
- 🖼️ **Avatar đoàn sinh** — upload ảnh thẻ lên Firebase Storage, tự nén
- 👤 **Hồ sơ cá nhân** — mỗi tài khoản có trang Profile: xem/sửa thông tin, upload avatar riêng
- 📜 **Lịch sử điểm** — xem TBM / CC / Tổng kết của mỗi em qua các năm học
- 📧 **Email phụ huynh** — 3 loại: thông báo khẩn, điểm danh từng buổi, bảng điểm tổng kết HK
- 📖 **Lời Chúa thông minh** — scraper 3 nguồn (tgpsaigon.net → loichua.net), cache 6 giờ, màu phụng vụ tự động, MiniCalendar điều hướng
- ⛪ **Giờ Lễ phụng vụ** — đồng hồ real-time, hiệu ứng feast solemnity/great/memorial, dời lễ VN tự động
- 📸 **Thư viện ảnh** — Firebase Storage, tự nén ~70%, lightbox toàn màn hình
- 🌙 **Dark Mode** — Circular Reveal (View Transitions API), lưu localStorage, fallback system preference
- 🌐 **Đa ngôn ngữ** Tiếng Việt / English (i18next)
- 🗺️ **Module Lịch sử Cứu độ** — 2 tab CỰU ƯỚC/TÂN ƯỚC, bản đồ SVG địa hình thật, nhân vật tiêu biểu, bảng lời tiên tri, InteractiveTimeline bảo tàng số
- 🛡️ **Admin Suite nâng cao** — Audit Log nhật ký hoạt động, RBAC permission matrix, Backup & Chốt niên học
- 📰 **News UI nâng cấp** — Mesh gradient hero, featured card, Playfair Display, reading time estimate, fade-in stagger

---

## 🛠️ Công nghệ

### Frontend

- ⚛️ **React 19** + **Vite** — UI framework
- 🎨 **Tailwind CSS 4** — Utility-first styling
- 🎞️ **Framer Motion 12** — Animations & page transitions
- 🔤 **Be Vietnam Pro + EB Garamond + Inter + Playfair Display** — Typography tiếng Việt tối ưu
- 🔀 **React Router v7** — Client-side routing
- 🌍 **i18next** — Đa ngôn ngữ VI/EN
- 🔥 **Firebase Storage** — Ảnh gallery + avatar đoàn sinh

### Backend

- 🟢 **Node.js + Express 5** — REST API
- 🍃 **MongoDB + Mongoose 9** — Database
- 🔐 **JWT** — Authentication & Authorization (7 ngày)
- 📧 **nodemailer** — 3 template email HTML: thông báo khẩn, điểm danh, bảng điểm
- 🔢 **romcal** — Lịch phụng vụ Công giáo (màu lễ, mùa phụng vụ)
- 📊 **ExcelJS 4** — Xuất báo cáo `.xlsx` đa sheet

### Cloud / Infrastructure

- ☁️ **Vercel** — Frontend hosting (auto-deploy từ GitHub)
- 🚀 **Render** — Backend hosting
- 🍃 **MongoDB Atlas** — Database cloud
- 🔥 **Firebase** — Storage (ảnh) + Firestore (metadata gallery)

---

## 🗂️ Cấu trúc dự án

```text
mautam-website/
├── client/                   # Frontend React
│   ├── public/images/        # Ảnh tĩnh (Quan Thầy, logo...)
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx            # Nav + user dropdown + ThemeToggle + LanguageSwitcher
│       │   ├── Footer.jsx            # Footer branding + motto
│       │   ├── GradeForm.jsx         # Bảng điểm + Chuyên cần 80/20
│       │   ├── AttendanceTable.jsx   # Điểm danh Chúa Nhật + thanh tiến độ
│       │   ├── StudentList.jsx       # Danh sách + avatar + lịch sử điểm
│       │   ├── ExportButton.jsx
│       │   ├── UrgentBanner.jsx      # Banner thông báo khẩn dismissable
│       │   ├── RouteGuard.jsx        # Bảo vệ route theo role
│       │   ├── LoadingSpinner.jsx    # Spinner SVG dùng chung
│       │   ├── LanguageSwitcher.jsx  # Dropdown VI 🇻🇳 / EN 🇺🇸
│       │   ├── ThemeToggle.jsx       # Sun/Moon + Circular Reveal
│       │   ├── QuickActionWidgets.jsx
│       │   ├── Toast.jsx             # ToastProvider + useToast (success/error/warning/info)
│       │   ├── ConfirmModal.jsx      # Safety modal trước destructive actions
│       │   └── Skeleton.jsx          # SkeletonTable/Row/Card/Line
│       ├── pages/
│       │   ├── Home.jsx              # Landing page 5 ngành
│       │   ├── Login.jsx             # Đăng nhập
│       │   ├── Signup.jsx            # Đăng ký tài khoản
│       │   ├── ForgotPassword.jsx    # Quên mật khẩu
│       │   ├── Profile.jsx           # Hồ sơ cá nhân + avatar upload
│       │   ├── News.jsx              # Tin tức — mesh gradient hero, featured card, reading time
│       │   ├── NewsDetail.jsx        # Chi tiết bài viết: ảnh, nội dung HTML, tác giả
│       │   ├── ClassList.jsx         # Explorer 5 ngành
│       │   ├── ClassDetail.jsx       # 3 tab: Danh sách / Điểm danh / Bảng điểm
│       │   ├── LoiChua.jsx           # Lời Chúa + MiniCalendar + điều hướng ngày
│       │   ├── GioLe.jsx             # Dashboard phụng vụ + đồng hồ + feast effects
│       │   ├── Gallery.jsx           # Thư viện ảnh Firebase
│       │   ├── LichSuCuuDo.jsx       # 2 tab CỰU ƯỚC/TÂN ƯỚC — BibleMap, Timeline, CharacterCards
│       │   ├── NhanVat.jsx           # Trang nhân vật — lưới 3×3 với filter OT/NT
│       │   └── admin/
│       │       ├── AdminLayout.jsx     # Sidebar (desktop) + bottom tab (mobile)
│       │       ├── AdminDashboard.jsx  # Quick Actions, SVG Charts, Global Search
│       │       ├── AdminClasses.jsx    # Phân công nhân sự
│       │       ├── AdminPromotion.jsx  # Lên lớp hàng loạt + lịch sử
│       │       ├── AdminStats.jsx      # Dashboard thống kê ngành
│       │       ├── AdminExport.jsx     # Export toàn đoàn
│       │       ├── AdminPosts.jsx      # Quản lý tin tức / thông báo
│       │       ├── AdminUsers.jsx      # Quản lý tài khoản + phân quyền
│       │       ├── AdminNamHoc.jsx
│       │       ├── AdminAuditLog.jsx   # Nhật ký hoạt động — timeline, avatar, filter, pagination
│       │       ├── AdminRBAC.jsx       # Phân quyền vai trò — matrix 8×4, toggle, protected roles
│       │       └── AdminBackup.jsx     # Sao lưu xlsx/json, chốt niên học
│       ├── services/
│       │   ├── api.js                # Axios + JWT interceptor + 401 auto-redirect
│       │   ├── firebase.js           # Firebase SDK init
│       │   └── galleryService.js     # Upload + nén Firebase
│       ├── store/
│       │   ├── AuthContext.jsx       # Login/logout + updateUser + useAuth hook
│       │   └── ThemeContext.jsx      # Dark/light + localStorage + system preference
│       ├── utils/
│       │   └── formatClassName.js    # Viết tắt → tên đầy đủ (XT, CN, TN, NS, HS)
│       └── i18n.js                   # Translations VI/EN
│
└── server/                   # Backend Express
    └── src/
        ├── models/
        │   ├── User.js, Class.js, Student.js, NamHoc.js
        │   ├── Grade.js, Attendance.js, Post.js
        │   ├── ChuyenCan.js          # Điểm chuyên cần
        │   ├── MeritPoint.js
        │   └── PromotionHistory.js   # Lịch sử lên lớp
        ├── controllers/
        │   ├── authController.js     # Login, signup, forgot password
        │   ├── exportController.js   # attendance, grades, tổng kết, toàn đoàn
        │   ├── notifyController.js   # email: điểm danh, lịch lễ, bảng điểm
        │   ├── loiChuaController.js  # scraper 3 nguồn + cache 6h + romcal
        │   ├── chuyenCanController.js
        │   ├── promoteController.js
        │   └── ...
        ├── utils/
        │   ├── sendEmail.js          # Nodemailer transporter factory
        │   ├── emailTemplates.js     # 3 template HTML có branding
        │   └── gradeCalculator.js    # tinhTBHocTap, tinhTongKet, phanLoai
        ├── routes/                   # /auth, /export, /notify, /liturgy, /chuyen-can, ...
        └── middlewares/
            ├── checkAuth.js
            ├── checkClassPermission.js
            └── errorHandler.js       # Global error handler (Mongoose/JWT/500)
```

---

## 🚀 Cài đặt & Chạy thử

### Yêu cầu

- Node.js ≥ 18
- MongoDB (local hoặc Atlas)
- Tài khoản Firebase (Spark plan miễn phí)

### 1. Clone repo

```bash
git clone https://github.com/Feng1907/mautam-web.git
cd mautam-web
```

### 2. Cài dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Cấu hình môi trường

**`server/.env`** (xem `server/.env.example`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mautam
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

**`client/.env`** (xem `client/.env.example`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Khởi chạy

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Mở trình duyệt: **<http://localhost:5173>**

---

## 👤 Vai trò người dùng

| Vai trò | Quyền hạn |
| --- | --- |
| `admin`   | Toàn quyền: quản lý lớp, nhân sự, lên lớp, thống kê, export toàn đoàn |
| `giaoly`  | Quản lý lớp được phân công: điểm danh, điểm, chuyên cần, export lớp mình |
| `user`    | Xem lớp, xem lịch sử điểm con em, nhận email thông báo khẩn |

---

## ✨ Tính năng nổi bật

| Tính năng | Chi tiết |
| --- | --- |
| **Chuyên cần thông minh** | Tự tính điểm từ số buổi vắng (có phép −0.5đ, không phép −1đ). Modal 2 mode: nhập buổi hoặc nhập thẳng. |
| **Tổng kết công thức** | TBM×80% + Chuyên cần×20% = Điểm tổng kết. Export Excel đầy đủ 1 lớp hoặc toàn đoàn. |
| **Lên lớp hàng loạt** | Chọn checkbox nhiều em, chuyển sang lớp + năm học mới, lưu lịch sử có thể xem lại. |
| **Dashboard thống kê** | SVG bar + donut chart (không cần thư viện ngoài), phân phối học lực + % điểm danh — phân theo từng ngành. |
| **Lịch sử điểm** | Mỗi đoàn sinh có modal xem TBM/CC/Tổng kết qua tất cả năm học đã học. |
| **Avatar đoàn sinh** | Upload ảnh thẻ → tự nén → Firebase Storage → hiển thị trong danh sách lớp. Gradient fallback 8 màu theo tên. |
| **Hồ sơ cá nhân** | Trang Profile riêng cho mỗi user: xem/sửa thông tin, upload avatar (validate MIME, tối đa 1.5MB). |
| **Dark Mode Circular Reveal** | View Transitions API clip-path `circle(0%→160%)` từ tâm nút bấm, fallback instant cho Firefox/Safari. |
| **Email phụ huynh 3 loại** | Thông báo khẩn / điểm danh từng buổi / bảng điểm tổng kết — template HTML branding, gửi batch `Promise.allSettled()`. |
| **Lời Chúa thông minh** | Scraper 3 nguồn (tgpsaigon.net → loichua.net HTML → JSON), cache 6h, tô màu lời Chúa Giêsu, MiniCalendar điều hướng tháng độc lập. |
| **Giờ Lễ phụng vụ** | Feast visual effects (solemnity/great/feast/memorial gradient + glow), dời lễ VN (Lên Trời → CN VII, Mình Máu → CN tiếp). |
| **Tính điểm tự động** | `gradeCalculator.js` dùng chung: TBM có trọng số (miệng×1, 15ph×1, 1tiết×2), Tổng kết = TBM×80%+CC×20%, phân loại học lực. |
| **Auto-compress ảnh** | Canvas API trước khi upload Firebase — tiết kiệm ~70% dung lượng Storage. |
| **Sắp xếp tên Việt** | `localeCompare('vi')` theo tên chính (từ cuối cùng trong họ tên). |
| **Module Lịch sử Cứu độ** | BibleMap SVG địa hình thật, InteractiveTimeline zigzag glassmorphism, CharacterCollection 3×3, ProphecyTable 9 cặp OT↔NT, sync bản đồ–timeline real-time. |
| **Admin Audit Log** | Nhật ký hoạt động timeline, action badges 6 loại, filter theo user/action, avatar real users, click-to-profile. |
| **Admin RBAC** | Permission matrix 8 module × 4 quyền, toggle switch, tạo vai trò tùy chỉnh, 3 vai trò hệ thống protected. |
| **Admin Backup** | Xuất dữ liệu `.xlsx` + `.json`, chốt niên học với ConfirmModal, cảnh báo nếu > 7 ngày chưa backup. |
| **News UI nâng cấp** | Mesh gradient hero, FeaturedCard layout ngang, Playfair Display, reading time ước tính, `whileInView` stagger fade-in. |
| **Font tiếng Việt tối ưu** | Be Vietnam Pro (font thiết kế riêng cho Việt), `font-variant-ligatures: none` toàn cục, `lang="vi"` đúng trên `<html>`. |

---

## 🌿 Nhánh phát triển

| Nhánh | Mục đích |
| --- | --- |
| `master` | Production — đã merge phase 1–17b |
| `develop` | Integration — phase 17c (Admin Suite, News UI, Font) đang phát triển |

---

## 📜 Giấy phép

Dự án được phát triển phục vụ nội bộ tổ chức Thiếu Nhi Thánh Thể Xứ Đoàn Anrê Phú Yên – Mẫu Tâm.
Không sao chép hoặc phân phối lại mà không có sự đồng ý của tác giả.

---

<div align="center">

<br/>

*"Lấy tình yêu đáp lại tình yêu, lấy mạng sống đáp lại mạng sống."*

**✝ Chân Phước Anrê Phú Yên, cầu cho chúng con ✝**

<br/>

Được xây dựng với ❤️ bởi

**DƯƠNG AN PHONG**
*Fullstack Developer*

<br/>

![GitHub](https://img.shields.io/badge/GitHub-Feng1907%2Fmautam--web-181717?style=flat-square&logo=github)

</div>
