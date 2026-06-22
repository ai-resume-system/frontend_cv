# Frontend CV - Cổng Người Dùng

`frontend_cv` là frontend chính cho người tìm việc và nhà tuyển dụng trong hệ thống AI Resume System. Source này được xây dựng bằng Next.js, cung cấp giao diện xem việc làm, quản lý CV, phân tích CV, ứng tuyển và quản lý tin tuyển dụng.

## Liên Kết Source

Khi chạy hoặc kiểm tra từng phần của hệ thống, mở đúng source tương ứng:

- Backend API: [ai-resume-system/backend_cv](https://github.com/ai-resume-system/backend_cv)
- Frontend cho nhà tuyển dụng và người tìm việc: [ai-resume-system/frontend_cv](https://github.com/ai-resume-system/frontend_cv)
- Frontend quản trị admin: [ai-resume-system/cms_frontend_cv](https://github.com/ai-resume-system/cms_frontend_cv)

## Mục Tiêu

- Cho phép người tìm việc đăng ký, đăng nhập và quản lý tài khoản.
- Cho phép người tìm việc tải CV, xem CV, phân tích CV bằng AI và nhận gợi ý cải thiện.
- Hiển thị danh sách việc làm, chi tiết việc làm, công ty, danh mục nghề nghiệp và kỹ năng.
- Hỗ trợ ứng tuyển bằng CV và theo dõi lịch sử ứng tuyển.
- Cho phép nhà tuyển dụng quản lý công ty, tạo/sửa/đóng tin tuyển dụng và xem danh sách ứng viên.
- Hiển thị điểm AI Match khi backend trả về dữ liệu phù hợp.

## Kiến Trúc Hiện Tại

Frontend dùng Next.js App Router, tổ chức theo hướng tách portal và shared layer:

- `src/app`: route theo App Router.
- `src/portals/jobseeker`: màn hình và luồng dành cho người tìm việc.
- `src/portals/recruiter`: màn hình và luồng dành cho nhà tuyển dụng.
- `src/shared`: service gọi API, type, hook, component, constants và utility dùng chung.
- `src/shared/services`: các service kết nối API backend.
- `src/shared/constants`: route, API endpoint và enum dùng ở FE.

Luồng gọi API:

```txt
Page/Feature -> Hook/Service -> API Service -> backend_cv /api/v1
```

## Công Nghệ Sử Dụng

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Lucide React
- Recharts
- React Toastify
- SweetAlert2
- Leaflet

## Yêu Cầu Cài Đặt

- Node.js 20+ khuyến nghị
- npm
- Backend `backend_cv` đang chạy

## Cấu Hình Môi Trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Các biến môi trường thường dùng:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_NODE_ENV=
```

Lưu ý:

- `NEXT_PUBLIC_API_URL` trỏ tới backend và đã bao gồm `/api`.
- API route trong code tự thêm `/v1`, ví dụ `/api/v1/jobs`.
- Nếu backend đổi port theo `WEB_PORT`, cần đổi lại `NEXT_PUBLIC_API_URL`.

## Cài Dependency

```bash
cd frontend_cv
npm install
```

# Hoặc

```bash
npm i
```

## Chạy Development

```bash
npm run dev
```

## Lệnh Hữu Ích

```bash
npm run build
npm run start
npm run lint
```

## Luồng Chạy Với Toàn Hệ Thống

1. Chạy hạ tầng PostgreSQL, Redis, MinIO.
2. Chạy `ai_service` nếu cần phân tích CV.
3. Chạy `backend_cv`.
4. Chạy `frontend_cv` và `cms_frontend_cv`.

## Ghi Chú Vận Hành

- Nếu đăng nhập không giữ phiên, kiểm tra cookie, token và `NEXT_PUBLIC_API_URL`.
- Nếu gọi API bị lỗi CORS, kiểm tra cấu hình CORS trong `backend_cv/.env`.
- Nếu ảnh/media không hiển thị, kiểm tra MinIO và URL media trả từ backend.
- Nếu phân tích CV không chạy, kiểm tra `ai_service`, Redis queue và cấu hình `AI_SERVICE_BASE_URL` bên backend.
