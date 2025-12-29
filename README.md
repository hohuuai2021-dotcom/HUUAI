# EduBot Manager

Ứng dụng trợ lý AI hỗ trợ học sinh tra cứu lịch học, lịch thi và giải đáp kiến thức môn học.

## Yêu cầu

- Node.js (phiên bản 18 trở lên)
- npm

## Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Lấy API Key từ Google AI Studio

1. Truy cập [Google AI Studio](https://aistudio.google.com/)
2. Đăng nhập bằng tài khoản Google
3. Click vào **"Get API Key"** ở góc trên bên phải
4. Chọn **"Create API Key"** hoặc sử dụng key có sẵn
5. Copy API Key

### 3. Cấu hình API Key

Mở file `.env.local` và thay thế API key:

```
GEMINI_API_KEY=your_api_key_here
```

### 4. Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## Thay đổi nội dung lịch học, lịch thi, nội dung môn học

Các file dữ liệu mặc định nằm trong thư mục `public/data/`:

| File | Mô tả |
|------|-------|
| `public/data/class_schedule.txt` | Lịch học các lớp |
| `public/data/exam_schedule.txt` | Lịch kiểm tra/thi |
| `public/data/subject_content.txt` | Nội dung môn học, tài liệu ôn tập |

### Cách thay đổi:

**Cách 1: Sửa trực tiếp file**

Mở và chỉnh sửa các file `.txt` trong thư mục `public/data/`

**Cách 2: Upload qua giao diện Teacher**

1. Truy cập ứng dụng
2. Click **"Teacher Login"**
3. Đăng nhập với:
   - Username: `admin`
   - Password: `password123`
4. Upload file mới tại các tab tương ứng

## Tùy chỉnh AI Prompt

Để thay đổi cách AI trả lời (tông giọng, phong cách, quy tắc...), chỉnh sửa file:

```
services/geminiService.ts
```

Tìm biến `SYSTEM_PROMPT_TEMPLATE` và chỉnh sửa theo ý muốn.

## Cấu trúc thư mục

```
edubot-manager/
├── public/
│   └── data/
│       ├── class_schedule.txt    # Lịch học
│       ├── exam_schedule.txt     # Lịch thi
│       └── subject_content.txt   # Nội dung môn học
├── components/
│   ├── ChatInterface.tsx         # Giao diện chat
│   ├── TeacherDashboard.tsx      # Dashboard giáo viên
│   ├── FileUploader.tsx          # Component upload file
│   └── Login.tsx                 # Form đăng nhập
├── services/
│   ├── geminiService.ts          # Kết nối Gemini AI
│   └── dataLoader.ts             # Load dữ liệu từ file
├── App.tsx                       # Component chính
├── constants.ts                  # Các hằng số cấu hình
├── types.ts                      # TypeScript types
└── .env.local                    # API Key (không commit)
```

## Build production

```bash
npm run build
```

Output sẽ nằm trong thư mục `dist/`
