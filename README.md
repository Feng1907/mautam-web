<div align="center">

<img
  src="client/public/images/Chan Phuoc Anre Phu Yen.jpg"
  alt="Chân Phước Anrê Phú Yên"
  width="180"
  style="border-radius: 50%; border: 4px solid #D4AF37;"
/>

# XỨ ĐOÀN ANRÊ PHÚ YÊN – MẪU TÂM

*"Lấy tình yêu đáp lại tình yêu, lấy mạng sống đáp lại mạng sống."*

**— Chân Phước Anrê Phú Yên (1625 – 1644) —**

<br/>

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.12-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.38-FF0055?style=flat-square&logo=framer&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)

</div>

---

## 📖 Giới thiệu

**Xứ Đoàn Anrê Phú Yên – Mẫu Tâm** là ứng dụng web quản lý dành riêng cho các Huynh trưởng và Dự trưởng của tổ chức Thiếu Nhi Thánh Thể. Hệ thống giúp:

- 📋 **Quản lý lớp học** theo 5 ngành: Chiên Non, Ấu Nhi, Thiếu Nhi, Nghĩa Sĩ, Hiệp Sĩ
- ✅ **Điểm danh** hàng tuần (Chúa Nhật) với giao diện cảm ứng thân thiện trên điện thoại
- 📊 **Bảng điểm** miệng / 15 phút / 1 tiết, tính TBM tự động và phân loại học lực
- 📸 **Thư viện ảnh** lưu trữ trên Firebase Storage, tự động nén ảnh trước khi upload
- 📢 **Tin tức & Thông báo** nội bộ xứ đoàn
- 🌐 **Đa ngôn ngữ** Tiếng Việt / English (i18n)
- 📤 **Xuất Excel** danh sách điểm danh và bảng điểm

---

## 🛠️ Công nghệ

### Frontend
- ⚛️ **React 19** – UI framework
- 🎨 **Tailwind CSS 4** – Utility-first styling
- 🎞️ **Framer Motion 12** – Smooth animations
- 🔤 **EB Garamond + Inter** – Typography hỗ trợ tiếng Việt
- 🔀 **React Router v6** – Client-side routing
- 🌍 **i18next** – Đa ngôn ngữ VI/EN

### Backend
- 🟢 **Node.js + Express** – REST API
- 🍃 **MongoDB + Mongoose** – Database
- 🔐 **JWT** – Authentication & Authorization

### Cloud / Infrastructure
- 🔥 **Firebase Storage** – Lưu trữ ảnh (auto-compress trước upload)
- 🔥 **Firestore** – Metadata ảnh thư viện
- ☁️ **Firebase Auth** *(optional)*

---

## 🗂️ Cấu trúc dự án

```
mautam-website/
├── client/                   # Frontend React
│   ├── public/
│   │   ├── images/           # Ảnh tĩnh (logo, ảnh Quan Thầy...)
│   │   └── logos/
│   └── src/
│       ├── components/       # Reusable components
│       │   ├── Navbar.jsx
│       │   ├── GradeForm.jsx
│       │   ├── AttendanceTable.jsx
│       │   └── StudentList.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── ClassList.jsx
│       │   ├── ClassDetail.jsx
│       │   ├── Gallery.jsx
│       │   ├── News.jsx
│       │   ├── GioLe.jsx
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminPosts.jsx
│       │       └── AdminClasses.jsx
│       ├── services/
│       │   ├── api.js          # Axios instance
│       │   ├── firebase.js     # Firebase config
│       │   └── galleryService.js
│       ├── store/
│       │   └── AuthContext.jsx
│       └── i18n.js             # Translations VI/EN
│
└── server/                   # Backend Express
    └── src/
        ├── models/           # Mongoose schemas
        ├── controllers/      # Business logic
        ├── routes/           # API routes
        └── middleware/       # Auth, permissions
```

---

## 🚀 Cài đặt & Chạy thử

### Yêu cầu hệ thống
- Node.js ≥ 18
- MongoDB (local hoặc Atlas)
- Tài khoản Firebase (Spark plan miễn phí)

### 1. Clone repo

```bash
git clone https://github.com/DuongAnPhong/mautam-website.git
cd mautam-website
```

### 2. Cài đặt dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Cấu hình môi trường

**`server/.env`**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mautam
JWT_SECRET=your_jwt_secret_here
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
```

### 4. Khởi chạy

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Mở trình duyệt: **http://localhost:5173**

---

## 📸 Giao diện

### Trang chủ
> *(Chèn ảnh screenshot trang chủ vào đây)*

```
![Trang chủ](docs/screenshots/home.png)
```

### Điểm danh
> *(Chèn ảnh bảng điểm danh Chúa Nhật vào đây)*

```
![Điểm danh](docs/screenshots/attendance.png)
```

### Bảng điểm
> *(Chèn ảnh bảng điểm học kỳ vào đây)*

```
![Bảng điểm](docs/screenshots/grades.png)
```

### Thư viện ảnh
> *(Chèn ảnh giao diện gallery vào đây)*

```
![Thư viện ảnh](docs/screenshots/gallery.png)
```

### Quản lý bài viết
> *(Chèn ảnh trang admin posts vào đây)*

```
![Quản lý bài viết](docs/screenshots/admin-posts.png)
```

---

## 👤 Vai trò người dùng

| Vai trò   | Quyền hạn |
|-----------|-----------|
| `admin`   | Toàn quyền: quản lý lớp, người dùng, bài viết, thư viện |
| `giaoly`  | Quản lý lớp được phân công: điểm danh, bảng điểm, danh sách đoàn sinh |
| *(guest)* | Xem trang chủ, tin tức, giờ lễ, thư viện ảnh |

---

## ✨ Tính năng nổi bật

- **Auto-compress ảnh** bằng Canvas API trước khi upload Firebase — tiết kiệm ~70% dung lượng Storage
- **Sắp xếp danh sách** theo tên chính (từ cuối cùng) với `localeCompare('vi')` — đúng chuẩn tiếng Việt
- **Offline-friendly**: Mock data tự động hiển thị khi Firebase chưa kết nối
- **Lightbox** xem ảnh toàn màn hình, điều hướng bàn phím ← →
- **Xuất Excel** điểm danh + bảng điểm (ExcelJS)
- **Spiritual Modernism** design: tông màu đỏ đô #8B0000, vàng đồng #D4AF37, kem ngà #fdfbf7

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
*Intern Frontend Developer*

<br/>

![GitHub](https://img.shields.io/badge/GitHub-DuongAnPhong-181717?style=flat-square&logo=github)

</div>
