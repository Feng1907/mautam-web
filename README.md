<div align="center">

<img
  src="client/public/images/Chan Phuoc Anre Phu Yen.jpg"
  alt="Chân Phước Anrê Phú Yên"
  width="100%"
  style="max-width: 800px; border-radius: 12px; border: 2px solid #D4AF37;"
/>

# XỨ ĐOÀN ANRÊ PHÚ YÊN – MẪU TÂM

*"Lấy tình yêu đáp lại tình yêu, lấy mạng sống đáp lại mạng sống."*

**— Chân Phước Anrê Phú Yên (1625 – 1644) —**

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0055?style=flat-square&logo=framer&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat-square&logo=socket.io&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-Chat-4285F4?style=flat-square&logo=google&logoColor=white)

</div>

---

## 📖 Giới thiệu

**Xứ Đoàn Anrê Phú Yên – Mẫu Tâm** là ứng dụng web quản lý dành riêng cho tổ chức Thiếu Nhi Thánh Thể. Hệ thống số hoá toàn bộ công việc từ điểm danh, bảng điểm đến phân công sự kiện và thông báo real-time:

- 📋 **Quản lý lớp học** theo 5 ngành: Chiên Non · Ấu Nhi · Thiếu Nhi · Nghĩa Sĩ · Hiệp Sĩ
- ✅ **Điểm danh** hàng tuần — lưới scroll ngang, QR scan, toggle trực tiếp
- 📊 **Bảng điểm** miệng / 15 phút / 1 tiết — TBM tự động + phân loại học lực
- 📅 **Chuyên cần** — tự tính điểm từ số buổi vắng; **Tổng kết = TBM×80% + CC×20%**
- ⬆️ **Lên lớp hàng loạt** — chọn lớp nguồn → đích, lưu lịch sử đầy đủ
- 📤 **Xuất Excel** — điểm danh, bảng điểm, tổng kết từng lớp và toàn đoàn
- 📊 **Dashboard thống kê** — SVG bar + donut chart, phân phối học lực theo ngành
- 👨‍👩‍👧 **Cổng phụ huynh** — xem điểm/chuyên cần con, xin phép nghỉ, liên kết học sinh
- 🤖 **Chat AI (Gemini)** — trợ lý xứ đoàn biết lịch phụng vụ, sự kiện, dữ liệu lớp học
- 🔔 **Push Notifications** — web push + email cho thông báo khẩn, điểm danh muộn
- ⚡ **Real-time Socket.io** — điểm danh QR live, thông báo bài mới, notify admin khi HT điểm danh
- 📋 **Phân công sự kiện** — tạo bảng lưới (buổi × vai trò), gán người, publish + notify
- 🗂️ **Audit Log** — nhật ký mọi thao tác nhạy cảm trong hệ thống
- 📖 **Lời Chúa** — scraper đa nguồn, cache 6h, màu phụng vụ tự động, MiniCalendar
- ⛪ **Giờ Lễ** — đồng hồ real-time, feast effects, dời lễ VN tự động
- 📸 **Thư viện ảnh** — Firebase Storage, tự nén ~70%, lightbox
- 🌙 **Dark Mode** — Circular Reveal (View Transitions API)
- 🌐 **Đa ngôn ngữ** — Tiếng Việt / English (i18next)
- 🗺️ **Lịch sử Cứu độ** — 2 tab CỰU ƯỚC/TÂN ƯỚC, bản đồ SVG, timeline bảo tàng số

---

## 🛠️ Công nghệ

### Frontend

| Thư viện | Vai trò |
|---|---|
| **React 18** + **Vite** | UI framework |
| **Tailwind CSS 3** | Utility-first styling |
| **Framer Motion** | Animations & page transitions |
| **React Router v6** | Client-side routing |
| **@tanstack/react-query** | Server state management |
| **i18next** | Đa ngôn ngữ VI/EN |
| **Socket.io-client** | Real-time events |
| **DOMPurify** | XSS sanitization |
| **Firebase Storage** | Ảnh gallery + avatar |

### Backend

| Thư viện | Vai trò |
|---|---|
| **Node.js + Express** | REST API |
| **MongoDB + Mongoose** | Database |
| **Socket.io** | Real-time bidirectional events |
| **JWT + bcryptjs** | Authentication |
| **nodemailer** | Email (thông báo khẩn, reset MK, phân công) |
| **web-push** | Browser push notifications |
| **ExcelJS** | Xuất báo cáo `.xlsx` |
| **@google/generative-ai** | Gemini AI chat |
| **express-rate-limit** | Rate limiting per IP / per user |

### Cloud / Infrastructure

| Dịch vụ | Vai trò |
|---|---|
| **Vercel** | Frontend hosting (auto-deploy từ GitHub) |
| **Render** | Backend hosting |
| **MongoDB Atlas** | Database cloud |
| **Firebase** | Storage ảnh + Firestore gallery metadata |

---

## 🗂️ Cấu trúc dự án

```text
mautam-website/
├── client/                          # Frontend React
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx           # Nav + search + theme toggle + language
│       │   ├── Footer.jsx           # Footer + social links (FB/TikTok/YouTube)
│       │   ├── ChatWidget.jsx       # AI chat popup — streaming, multi-conversation
│       │   ├── RealtimeToasts.jsx   # Global Socket.io toast (post:new, attendance:saved)
│       │   ├── UrgentBanner.jsx     # Banner thông báo khẩn dismissable
│       │   ├── QrAttendanceGenerator.jsx  # QR + countdown + Socket live feed
│       │   ├── Toast.jsx            # ToastProvider + useToast
│       │   ├── PushNotificationManager.jsx
│       │   └── ...
│       ├── hooks/
│       │   ├── useAttendanceSocket.js     # Socket.io hook — attendance:checked
│       │   └── useRealtimeNotifications.js # Socket.io hook — post:new, attendance:saved
│       ├── pages/
│       │   ├── Home.jsx             # Landing page
│       │   ├── GioLe.jsx            # Phụng vụ + giờ lễ
│       │   ├── LoiChua.jsx          # Lời Chúa + MiniCalendar
│       │   ├── ClassDetail.jsx      # Điểm danh + bảng điểm
│       │   ├── ParentDashboard.jsx  # Cổng phụ huynh
│       │   ├── LichSuCuuDo.jsx      # Lịch sử Cứu độ — BibleMap + Timeline
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminAssignments.jsx  # Phân công sự kiện (bảng lưới)
│       │       ├── AdminAuditLog.jsx     # Nhật ký hoạt động
│       │       ├── AdminClasses.jsx      # Phân công nhân sự lớp
│       │       ├── AdminStats.jsx        # Thống kê ngành
│       │       ├── AdminExport.jsx       # Export Excel
│       │       ├── AdminPosts.jsx        # Quản lý tin tức
│       │       ├── AdminUsers.jsx        # Quản lý tài khoản
│       │       ├── AdminPromotion.jsx    # Lên lớp hàng loạt
│       │       ├── AdminBackup.jsx       # Sao lưu JSON
│       │       ├── AdminEvents.jsx       # Sự kiện đếm ngược
│       │       └── AdminParentLink.jsx   # Duyệt liên kết phụ huynh
│       ├── store/
│       │   ├── AuthContext.jsx      # Login/logout + useAuth
│       │   └── ThemeContext.jsx     # Dark/light mode
│       └── i18n.js                  # Translations VI/EN
│
└── server/                          # Backend Express
    └── src/
        ├── models/
        │   ├── User.js, Class.js, Student.js, NamHoc.js
        │   ├── Grade.js, Attendance.js, ChuyenCan.js
        │   ├── Post.js, CountdownEvent.js
        │   ├── AssignmentSheet.js   # Bảng phân công sự kiện
        │   ├── AuditLog.js          # Nhật ký thao tác
        │   ├── Conversation.js      # Chat AI multi-conversation
        │   ├── AbsenceRequest.js    # Xin phép nghỉ
        │   └── ParentStudent.js     # Liên kết phụ huynh–học sinh
        ├── controllers/
        │   ├── authController.js    # Login, signup, forgot/reset password
        │   ├── chatController.js    # Gemini streaming + getUserContext
        │   ├── assignmentController.js  # CRUD phân công + publish notify
        │   ├── auditLogController.js    # Lấy audit logs
        │   ├── exportController.js  # xlsx: điểm danh, bảng điểm, toàn đoàn
        │   ├── attendanceController.js  # Điểm danh + QR scan + Socket emit
        │   └── ...
        ├── utils/
        │   ├── auditLog.js          # logAction() — fire-and-forget
        │   ├── pushNotifier.js      # sendPushToUsers() — web-push
        │   ├── sendEmail.js         # nodemailer transporter
        │   └── gradeCalculator.js   # TBM, tổng kết, phân loại
        ├── config/
        │   └── socket.js            # Socket.io init + rooms (lop:id, admin)
        └── middlewares/
            ├── checkAuth.js         # JWT verify → req.user
            ├── checkClassPermission.js
            └── errorHandler.js
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

**`server/.env`**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mautam
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
GEMINI_API_KEY=your_gemini_api_key
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:your@email.com
```

**`client/.env`**

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_VAPID_PUBLIC_KEY=...
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
|---|---|
| `admin` | Toàn quyền: lớp, nhân sự, phân công, thống kê, export, audit log |
| `giaoly` (huynhtruong/dutruong) | Quản lý lớp được phân công: điểm danh, điểm, chuyên cần, export |
| `PARENT` | Xem điểm/chuyên cần con, xin phép nghỉ, chat AI |
| `user` | Xem thông tin công khai, nhận thông báo |

---

## ✨ Tính năng nổi bật

| Tính năng | Chi tiết |
|---|---|
| **Chat AI (Gemini 2.5 Flash)** | Streaming SSE, multi-conversation, lịch sử server-side, biết dữ liệu lớp (HT) và chuyên cần con (PH) |
| **QR Điểm danh** | JWT token TTL ngắn, auto-refresh, geofencing tuỳ chọn, real-time Socket.io live feed |
| **Phân công sự kiện** | Tạo bảng lưới (buổi × vai trò), assign user hệ thống hoặc tên tự do, publish → push + email |
| **Audit Log** | Ghi lại login, tạo/sửa/xóa học sinh, bài viết, export, reset mật khẩu — filter theo user/action |
| **Real-time Notifications** | Socket.io: `post:new` broadcast toàn site, `attendance:saved` notify admin room, `attendance:checked` live TV |
| **Cổng phụ huynh** | Xem điểm/CC con, xin phép nghỉ (push + email đến HT), yêu cầu liên kết học sinh |
| **Push Notifications** | Web Push VAPID, notify HT khi được phân công lớp, notify phụ huynh khi yêu cầu liên kết được duyệt |
| **Dark Mode Circular Reveal** | View Transitions API clip-path `circle(0%→160%)` từ tâm nút bấm |
| **Tổng kết công thức** | TBM×80% + Chuyên cần×20% — export Excel đầy đủ 1 lớp hoặc toàn đoàn |
| **Lịch sử Cứu độ** | BibleMap SVG địa hình thật, InteractiveTimeline zigzag, CharacterCards, ProphecyTable, sync bản đồ–timeline |
| **Lên lớp hàng loạt** | Checkbox chọn nhiều em, chuyển lớp + năm học mới, lưu lịch sử xem lại |
| **Lời Chúa thông minh** | Scraper đa nguồn, cache 6h, màu phụng vụ tự động, MiniCalendar điều hướng |
| **Rate limiting** | Global 300req/15min, login/signup/forgot-password 20req/15min, chat per-user |

---

## 🌿 Nhánh phát triển

| Nhánh | Mục đích |
|---|---|
| `master` | Production — deploy tự động lên Vercel + Render |
| `develop` | Integration — tính năng mới được merge vào đây trước |

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
