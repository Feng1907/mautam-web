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

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat-square&logo=framer&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat-square&logo=socket.io&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-Chat-4285F4?style=flat-square&logo=google&logoColor=white)
![CI](https://img.shields.io/github/actions/workflow/status/Feng1907/mautam-web/ci.yml?branch=develop&style=flat-square&label=CI)

</div>

---

## 📖 Giới thiệu

**Xứ Đoàn Anrê Phú Yên – Mẫu Tâm** là ứng dụng web quản lý dành riêng cho tổ chức Thiếu Nhi Thánh Thể. Hệ thống số hoá toàn bộ công việc từ điểm danh, bảng điểm đến phân công sự kiện và thông báo real-time:

- 📋 **Quản lý lớp học** theo 5 ngành: Chiên Non · Ấu Nhi · Thiếu Nhi · Nghĩa Sĩ · Hiệp Sĩ
- ✅ **Điểm danh** hàng tuần — lưới scroll ngang, QR scan, toggle trực tiếp
- 📊 **Bảng điểm** miệng / 15 phút / 1 tiết — TBM tự động + phân loại học lực
- 📅 **Chuyên cần** — tự tính điểm từ số buổi vắng; **Tổng kết = TBM×80% + CC×20%**
- 👤 **Hồ sơ đoàn sinh** — thông tin, lịch sử điểm & chuyên cần qua từng năm học (recharts)
- ⬆️ **Lên lớp hàng loạt** — chọn lớp nguồn → đích, lưu lịch sử đầy đủ
- 📤 **Xuất Excel** — điểm danh, bảng điểm, tổng kết từng lớp và toàn đoàn
- 🖨️ **In danh sách** — `@media print` ẩn toàn bộ UI chrome, giữ bảng dữ liệu
- 📊 **Dashboard thống kê** — LineChart xu hướng chuyên cần + BarChart sĩ số theo ngành
- 👨‍👩‍👧 **Cổng phụ huynh** — xem điểm/chuyên cần con, xin phép nghỉ, liên kết học sinh
- 🤖 **Chat AI (Gemini 1.5 Flash)** — trợ lý xứ đoàn, multimodal (ảnh/PDF/DOCX), multi-conversation
- 🔔 **Push Notifications** — web push + email cho thông báo khẩn, điểm danh muộn
- ⚡ **Real-time Socket.io** — điểm danh QR live, thông báo bài mới, notify admin khi HT điểm danh
- 📋 **Phân công sự kiện** — tạo bảng lưới (buổi × vai trò), gán người, publish + notify
- 🗂️ **Audit Log** — nhật ký mọi thao tác nhạy cảm trong hệ thống
- 📖 **Lời Chúa** — scraper đa nguồn, cache 6h, màu phụng vụ tự động, MiniCalendar
- ⛪ **Giờ Lễ** — đồng hồ real-time, feast effects, countdown lễ kế tiếp, dịch đầy đủ lễ tiếng Việt (romcal + fallback translator)
- 📸 **Thư viện ảnh** — Firebase Storage, album theo sự kiện, lightbox
- 🌙 **Dark Mode** — Circular Reveal (View Transitions API)
- 🗺️ **Lịch sử Cứu độ** — 2 tab CỰU ƯỚC/TÂN ƯỚC, bản đồ SVG Israel (Tân Ước), timeline bảo tàng số
- 💬 **HT Chat** — nhắn tin nội bộ kiểu Messenger/Zalo: grouping tin nhắn, reply, emoji reaction, ghim, badge Admin/DT/HT, tooltip flex-sibling không bị mất hover, context menu dynamic positioning
- 📝 **Quiz** — tạo & quản lý bài kiểm tra theo lớp, thông báo push khi kết thúc, bảng kiểm tra lớp
- 📊 **Báo cáo lớp** — tổng hợp thống kê theo lớp cho huynh trưởng (donut chart + bar chart)
- 📥 **Import Excel** — nhập điểm và điểm danh hàng loạt từ file `.xlsx`
- 🏫 **Đăng ký sự kiện** — huynh trưởng đăng ký sĩ số lớp tham dự, admin quản lý xác nhận

---

## 🛠️ Công nghệ

### Frontend

| Thư viện | Phiên bản | Vai trò |
|---|---|---|
| **React** | 19 | UI framework |
| **Vite** | 8 | Build tool |
| **Tailwind CSS** | 4 | Utility-first styling |
| **Framer Motion** | 12 | Animations & page transitions |
| **React Router** | v6 | Client-side routing |
| **@tanstack/react-query** | v5 | Server state, retry, stale-while-revalidate |
| **Recharts** | latest | Biểu đồ điểm, chuyên cần, thống kê |
| **Socket.io-client** | latest | Real-time events |
| **Firebase Storage** | latest | Ảnh gallery + avatar |

### Backend

| Thư viện | Vai trò |
|---|---|
| **Node.js + Express** | REST API + SSE streaming |
| **MongoDB + Mongoose** | Database |
| **Socket.io** | Real-time bidirectional events |
| **JWT + bcryptjs** | Authentication + account lockout |
| **nodemailer** | Email (thông báo khẩn, reset MK, phân công) |
| **web-push** | Browser push notifications (VAPID) |
| **ExcelJS** | Xuất báo cáo `.xlsx` |
| **@google/generative-ai** | Gemini 1.5 Flash — chat + multimodal |
| **multer** | Upload file cho chat AI (ảnh/PDF/DOCX) |
| **mammoth** | DOCX → text extraction |
| **sanitize-html** | Sanitize nội dung bài viết trước khi lưu |
| **express-rate-limit** | Global 300req/15min, login 20req/15min, chat per-user |
| **compression** | Gzip response |

### Cloud / Infrastructure

| Dịch vụ | Vai trò |
|---|---|
| **Vercel** | Frontend hosting (auto-deploy từ GitHub) |
| **Render** | Backend hosting |
| **MongoDB Atlas** | Database cloud |
| **Firebase** | Storage ảnh + Firestore gallery metadata |
| **GitHub Actions** | CI/CD: lint → unit test → integration test |

---

## 🗂️ Cấu trúc dự án

```text
mautam-website/
├── .github/workflows/ci.yml            # CI: lint, vitest, integration test (MongoDB service)
├── scripts/wait-for-server.sh          # Health-poll helper cho CI
│
├── client/                             # Frontend React 19 + Vite 8
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx              # Nav + search + theme toggle
│       │   ├── ChatWidget.jsx          # AI chat popup — streaming SSE, multi-conv, file upload
│       │   ├── StudentList.jsx         # Bảng đoàn sinh + link hồ sơ cá nhân
│       │   ├── AttendanceTable.jsx     # Lưới điểm danh scroll ngang
│       │   ├── GradeForm.jsx           # Nhập điểm + export Excel
│       │   ├── QrAttendanceGenerator.jsx  # QR + countdown + Socket live feed
│       │   ├── RealtimeToasts.jsx      # Global Socket.io toasts
│       │   ├── Toast.jsx               # ToastProvider + useToast (aria-live)
│       │   ├── Skeleton.jsx            # Skeleton screens: GioLe, NewsFeed, ClassGrid, ...
│       │   └── ...
│       ├── pages/
│       │   ├── Home.jsx                # Landing page
│       │   ├── GioLe.jsx               # Phụng vụ + giờ lễ + countdown lễ kế tiếp
│       │   ├── LoiChua.jsx             # Lời Chúa + MiniCalendar
│       │   ├── ClassDetail.jsx         # Điểm danh + bảng điểm + print button
│       │   ├── StudentProfile.jsx      # Hồ sơ đoàn sinh — recharts LineChart + BarChart
│       │   ├── NewsDetail.jsx          # Bài viết — reading progress bar
│       │   ├── ParentDashboard.jsx     # Cổng phụ huynh
│       │   ├── LichSuCuuDo.jsx         # Lịch sử Cứu độ — BibleMap + Timeline
│       │   └── admin/
│       │       ├── AdminLayout.jsx     # Sidebar + mobile drawer (Lucide icons)
│       │       ├── AdminDashboard.jsx  # useQueries parallel fetch + SkeletonDashboard
│       │       ├── AdminStats.jsx      # useQuery — LineChart xu hướng + BarChart sĩ số
│       │       ├── AdminAssignments.jsx
│       │       ├── AdminParentLink.jsx
│       │       └── ...
│       ├── store/
│       │   ├── AuthContext.jsx         # Login/logout + useAuth
│       │   └── ThemeContext.jsx        # Dark/light mode + Circular Reveal
│       └── index.css                   # Global styles + @media print
│
└── server/                             # Backend Express
    └── src/
        ├── models/
        │   ├── User.js, Class.js, Student.js, NamHoc.js
        │   ├── Grade.js, Attendance.js, ChuyenCan.js
        │   ├── Post.js, CountdownEvent.js
        │   ├── Conversation.js         # Chat AI multi-conversation
        │   ├── AssignmentSheet.js      # Bảng phân công sự kiện
        │   ├── AuditLog.js
        │   ├── AbsenceRequest.js
        │   └── ParentStudent.js
        ├── controllers/
        │   ├── authController.js       # Login + account lockout sau 5 lần sai
        │   ├── chatController.js       # Gemini SSE streaming + multimodal + Bible KB
        │   ├── studentController.js    # CRUD + lichSu (điểm & chuyên cần qua năm)
        │   ├── exportController.js     # xlsx: điểm danh, bảng điểm, toàn đoàn
        │   ├── attendanceController.js # Điểm danh + QR scan + Socket emit
        │   └── ...
        ├── routes/
        │   ├── chat.js                 # checkAuth + multer 5MB + SSE stream
        │   └── ...
        ├── utils/
        │   ├── auditLog.js             # logAction() — fire-and-forget
        │   ├── pushNotifier.js         # sendPushToUsers() — web-push
        │   ├── sendEmail.js            # nodemailer transporter
        │   └── gradeCalculator.js      # TBM, tổng kết, phân loại
        └── config/
            └── socket.js               # Socket.io init + rooms (lop:id, admin)
```

---

## 🚀 Cài đặt & Chạy thử

### Yêu cầu

- Node.js ≥ 20.19
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
| **Chat AI — Trợ lý Xứ Đoàn** | Gemini 1.5 Flash, streaming SSE, multi-conversation, multimodal (ảnh/PDF/DOCX), Bible KB, honorific detection |
| **Hồ sơ đoàn sinh** | Trang `/hoc-sinh/:lopId/:id` — thông tin, LineChart điểm qua năm, BarChart chuyên cần |
| **QR Điểm danh** | JWT token TTL ngắn, auto-refresh, real-time Socket.io live feed |
| **Phân công sự kiện** | Bảng lưới (buổi × vai trò), assign user hoặc tên tự do, publish → push + email |
| **Audit Log** | Ghi login, tạo/sửa/xóa học sinh, bài viết, export, reset MK — filter theo user/action |
| **Real-time Notifications** | Socket.io: `post:new` broadcast toàn site, `attendance:saved` notify admin, `attendance:checked` live TV |
| **Cổng phụ huynh** | Xem điểm/CC con, xin phép nghỉ (push + email đến HT), yêu cầu liên kết học sinh |
| **In danh sách** | `@media print` ẩn Navbar/FAB/chat, giữ bảng — nút "In" trong trang lớp học |
| **Bảo mật** | Rate limiting 3 cấp, sanitize-html, account lockout 5 lần sai, compression |
| **CI/CD** | GitHub Actions: ESLint → Vitest → integration test (MongoDB service container) |
| **Dark Mode Circular Reveal** | View Transitions API `clip-path: circle(0%→160%)` từ tâm nút bấm |
| **Tổng kết công thức** | TBM×80% + Chuyên cần×20% — export Excel đầy đủ 1 lớp hoặc toàn đoàn |
| **Lịch sử Cứu độ** | BibleMap SVG, bản đồ Israel Tân Ước vẽ lại, InteractiveTimeline zigzag, CharacterCards, ProphecyTable |
| **HT Chat** | Nhắn tin nội bộ kiểu Messenger/Zalo, mutual exclusion với Trợ lý AI widget |
| **Quiz** | Tạo bài kiểm tra theo lớp (giaoly tự quản), push notify khi kết thúc, bảng kiểm tra lớp |
| **Import Excel** | Upload `.xlsx` để nhập điểm miệng/15'/1 tiết và điểm danh hàng loạt |
| **Đăng ký sự kiện** | Huynh trưởng đăng ký sĩ số lớp tham dự sự kiện, admin xác nhận và tổng hợp |
| **Báo cáo lớp** | Thống kê tổng hợp theo lớp cho huynh trưởng — donut chart + bar chart |
| **Lên lớp hàng loạt** | Checkbox nhiều em, chuyển lớp + năm học mới, lưu lịch sử xem lại |
| **Lời Chúa thông minh** | Scraper đa nguồn, cache 6h, màu phụng vụ tự động, MiniCalendar |

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
