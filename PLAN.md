import os
# Nội dung tổng hợp cuối cùng cho file PLAN.md

final_plan_content = """# CHIẾN LƯỢC PHÁT TRIỂN HỆ THỐNG QUẢN LÝ XỨ ĐOÀN ANRÊ PHÚ YÊN - MẪU TÂM



## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

* **Tên dự án:** Website Xứ đoàn Anrê Phú Yên - Mẫu Tâm.

* **Mục tiêu:** Số hóa quản lý giáo lý, điểm danh, điểm số và truyền thông cho Đoàn Thiếu nhi Thánh Thể.

* **Đối tượng Admin:** Cha Xứ, Thầy Xứ, Ban Điều Hành Xứ Đoàn.



---



## 2. NHẬN DIỆN & TIỂU SỬ

* **Logo:** Hình ảnh nhà thờ Mẫu Tâm kết hợp vòng tròn 5 màu ngành TNTT.

* **Màu sắc:** Đỏ (nhiệt huyết), Xanh (hy vọng), Trắng (trong trắng).

* **Tiểu sử Quan thầy:** Thánh Anrê Phú Yên - Vị chứng nhân đầu tiên. Châm ngôn: "Lấy tình yêu đáp lại tình yêu, lấy mạng sống đáp lại mạng sống."



---



## 3. CƠ CẤU TỔ CHỨC LỚP HỌC & NHÂN SỰ

* **Nhân sự:** 01 Cha xứ, 01 Thầy xứ, 14 Huynh trưởng, 09 Dự trưởng.

* **Hệ thống 12 lớp:**

1. **Chiên Non:** Khai Tâm.

2. **Ấu Nhi:** XT 1, XT 2A, XT 2B, XT 3A, XT 3B (3A & 3B là lớp Bí Tích).

3. **Thiếu Nhi:** Thêm Sức 1, Thêm Sức 2.

4. **Nghĩa Sĩ:** Sống Đạo 1, Sống Đạo 2, Sống Đạo 3.

5. **Hiệp Sĩ:** Hiệp Sĩ.



---



## 4. BỐ CỤC MÃ NGUỒN (PROJECT STRUCTURE)



### A. Frontend (React.js)

```text

frontend/

├── src/

│ ├── assets/ # Logo, ảnh Thánh Anrê Phú Yên

│ ├── components/ # Navbar, Footer, AttendanceTable, GradeForm

│ ├── pages/ # Home, News, Liturgy, ClassDetail, Login

│ ├── services/ # API calls (axios)

│ ├── store/ # Auth context / Redux

│ └── App.js # Routing

### B. Backend (Node.js/Express)

Plaintext


backend/

├── src/

│ ├── config/ # DB Connection, Cloudinary config

│ ├── controllers/ # Auth, Student, Grade, Attendance, Post controllers

│ ├── middlewares/ # checkAuth, checkClassPermission (Quan trọng)

│ ├── models/ # Student, User, Class, Grade, Attendance, Post schemas

│ ├── routes/ # API Endpoints

│ └── app.js # Express App setup

└── .env # JWT_SECRET, DB_URL

## 5. CHỨC NĂNG CHI TIẾT & PHÂN QUYỀN (RBAC)

5.1. Quyền Người dùng (User/Phụ huynh)

Xem Giờ lễ (Ngày thường: 05:30, 18:00 | CN: 05:30, 09:00, 17:00, 18:30).

Xem Lời Chúa (Bài đọc 1, Bài đọc 2, Thánh vịnh, Phúc âm).

Xem Tin tức & Thông báo.

Xem danh sách lớp: Tên anh chị đứng lớp, sĩ số, danh sách tên Thánh, họ tên, ngày sinh (Read-only).

5.2. Quyền Giáo lý viên (Huynh trưởng / Dự trưởng)

Quản lý lớp được phân công (Chỉ lớp mình, xem lớp khác như User).

Điểm danh: Check-in theo danh sách ngày Chúa Nhật trong năm học.

Quản lý điểm: Nhập điểm Miệng, 15 phút, 1 tiết.

Cập nhật thông tin đoàn sinh lớp mình.

5.3. Quyền Admin (Cha/Thầy/BĐH Xứ Đoàn)

Toàn quyền quản trị tất cả các lớp và nhân sự.

Đăng tin tức, gửi thông báo khẩn.

Xuất báo cáo chuyên cần và bảng điểm toàn Đoàn.

Tạo và xuất file Export Excel/PDF cho bảng điểm và bảng chuyên cần của từng lớp



6. LỘ TRÌNH KỸ THUẬT (TECH ROADMAP)

Thiết kế Database: Định nghĩa quan hệ giữa User và Class (Mapping).

Xây dựng API bảo mật: Sử dụng JWT và Middleware để đảm bảo anh chị lớp này không sửa điểm lớp kia.

Phát triển UI: Tập trung vào bảng điểm danh (Attendance Grid) có scroll ngang và bảng điểm giáo lý.

Tự động hóa: Script tự tạo danh sách Chúa Nhật cho cả năm học.

Deployment: Frontend trên Vercel, Backend trên Render, Database trên MongoDB Atlas.

"""