# Tổng quan mã nguồn Monitor Log Frontend

Ngày đọc code: 22/10/2026.

Tài liệu mô tả code hiện có trong repository, tập trung vào cấu trúc Angular, đăng nhập, workspace, sidebar quản lý dự án, quản lý thành viên và xem session. Đã build frontend với cấu hình development; chưa kiểm chứng runtime với backend triển khai.

## 1. Mục đích và trạng thái hiện tại

Frontend hiện phục vụ hai nhóm chức năng:

- Workspace để xem, tạo, cập nhật, lưu trữ/khôi phục dự án và quản lý thành viên.
- Trang xem session để hiển thị ảnh/video cùng dữ liệu console, network và thao tác người dùng.

README cũ gọi dự án là DriverSchool, còn tên package và Angular project là `fta-index`. Vì vậy README chưa phản ánh đầy đủ chức năng hiện tại.

Phần nội dung chính của workspace chưa triển khai giao diện nghiệp vụ: phần lớn HTML trong `content.component.html` đang bị comment. Chọn dự án cập nhật state trong component cha nhưng chưa hiển thị danh sách ticket hoặc chi tiết nghiệp vụ ở vùng nội dung.

## 2. Công nghệ

| Thành phần | Khai báo trong code |
| --- | --- |
| Framework | Angular 14, kiến trúc NgModule |
| Ngôn ngữ | TypeScript ~4.7.2 |
| UI | PrimeNG 14.1.1, PrimeFlex ^3.2.0, PrimeIcons 6.0.1 |
| Bất đồng bộ | RxJS ~7.5.0 |
| Form | Angular Forms và Reactive Forms |
| Style | SCSS, CSS; session viewer dùng Shadow DOM |
| Đa ngôn ngữ | ngx-translate, dữ liệu tiếng Việt trong `src/assets/i18n/vi.json` |

Package còn khai báo NgRx, Firebase, Chart.js, Quill, PDFMake, XLSX, JSZip và các thư viện khác. Việc có dependency không đồng nghĩa mọi thư viện đều đang được dùng trong luồng nghiệp vụ hiện tại. Workspace chủ yếu quản lý state trực tiếp qua component và Input/Output; auth state có service dùng BehaviorSubject.

## 3. Bản đồ mã nguồn

```text
src/
├── main.ts                          # Điểm khởi động Angular
├── app/
│   ├── app.module.ts                 # Module gốc, initializer, interceptor
│   ├── app-routing.module.ts         # Route cấp ứng dụng
│   ├── components/
│   │   ├── login/                    # Form đăng nhập
│   │   ├── workspace/
│   │   │   ├── sidebar/              # Danh sách và thao tác dự án
│   │   │   ├── content/              # Vùng nội dung, hiện chủ yếu bị comment
│   │   │   └── project-member-management/
│   │   ├── session-view/             # Ảnh/video và DevTools telemetry
│   │   ├── no-permission/            # Trang 403
│   │   └── not-found/                # Trang 404
│   ├── services/                     # HTTP và service nghiệp vụ
│   ├── models/                       # Model auth, cấu hình
│   └── shared/
│       ├── app-state/                # AuthStateService
│       ├── interceptors/             # Token, xử lý 401
│       ├── components/               # Loading, notification, bảng, confirm
│       ├── pipes/                    # Chuyển đổi dữ liệu hiển thị
│       ├── validators/               # Validator dùng lại
│       └── utils/                    # Tiện ích
├── assets/config/config.json         # Cấu hình API lúc chạy
├── assets/i18n/vi.json
├── assets/layout/                    # Layout và bộ theme
├── custom-scss/                      # Style tùy chỉnh
└── styles.scss                       # Style toàn cục
```

## 4. Khởi động và routing

`AppModule` đăng ký `APP_INITIALIZER` gọi `AppConfigService.load()` để đọc `assets/config/config.json`. `api.baseUrl` phải là URL đầy đủ gồm protocol và prefix `/api`, ví dụ `https://api.example.com/api`; service chuẩn hóa dấu `/` ở cuối. Các service HTTP lấy base URL từ cấu hình này.

`AppComponent` bật ripple của PrimeNG, chọn ngôn ngữ `vi`, nạp bản dịch PrimeNG và theo dõi trạng thái loading. Lệnh gọi `validateToken()` trong `ngOnInit()` đang bị comment.

| URL | Thành phần được nạp |
| --- | --- |
| `/` và `/login` | LoginModule |
| `/workspace` | WorkspaceModule |
| `/session/:sessionId` | SessionViewModule → SessionViewComponent |
| `/403` | NoPermissionModule |
| `/404` | NotFoundModule |
| Đường dẫn không khớp | Chuyển tới `/404` |

Các feature module được lazy load. Router dùng PathLocationStrategy, nên máy chủ khi triển khai cần trả ứng dụng Angular cho các đường dẫn frontend để mở trực tiếp URL con.

## 5. Đăng nhập và HTTP

### Luồng đăng nhập đang hoạt động

1. `LoginComponent` tạo form `username` và `password`, có validator bắt buộc.
2. `login()` gửi dữ liệu tới `POST /auth/login`.
3. Nếu `res.status` có giá trị truthy, component báo lỗi qua NotificationService.
4. Nhánh còn lại lưu `res.accessToken` vào localStorage qua `StorageKeys.TOKEN` và điều hướng tới `/workspace`.
5. Workspace gọi `GET /auth/me` để lấy thông tin người dùng truyền xuống sidebar và content.

`returnUrl` được đọc từ query param nhưng chưa dùng khi điều hướng sau đăng nhập. Hàm `login()` hiện chưa tự chặn form invalid và chưa có callback xử lý lỗi HTTP riêng.

### Tầng service

```text
Component → Service nghiệp vụ → BaseService → Service → HttpClient
                                                     ↓
                                          CustomHttpInterceptor
                                                     ↓
                                                  Backend
```

- `Service`: ghép URL, tạo Authorization header, cung cấp GET/POST/PUT/PATCH/DELETE và xử lý một số response type.
- `BaseService`: bổ sung các hàm CRUD tổng quát theo thuộc tính `url` của service con.
- `ProjectService`, `ProjectMemberService`, `AuthService`, `SessionViewService`: định nghĩa API và dữ liệu theo nghiệp vụ.
- `CustomHttpInterceptor`: thêm Bearer token khi URL khớp điều kiện; gặp 401 thì xóa token/user trong localStorage và chuyển về login.

`AuthStateService` dùng BehaviorSubject, lưu access token, refresh token và thông tin user/role/permission. Login xử lý `mustChangePassword`; interceptor dùng một refresh request chung cho các 401 đồng thời, cập nhật cả hai token và chỉ retry request gốc một lần.

## 6. Workspace và sidebar

`WorkspaceComponent` giữ `selectedItem`, `sidebarCollapsed`, `currentUser` và `managedProject`.

| Sự kiện từ component con | Xử lý tại workspace |
| --- | --- |
| Sidebar `itemSelected` | Cập nhật mục được chọn, truyền xuống content |
| Sidebar `collapsedChange` | Cập nhật trạng thái thu gọn |
| Sidebar `manageProject` | Mở component quản lý thành viên |
| Member management `closed` | Đóng phần quản lý |
| Member management `memberCountChanged` | Cập nhật số thành viên của dự án đang quản lý và dự án đang chọn nếu trùng ID |

### Danh sách dự án

`SidebarComponent` tải danh sách ngay trong `ngOnInit()`. Mỗi trang có 10 phần tử; nút “Xem thêm” lấy trang tiếp theo. Danh sách được gộp bằng Map theo ID để tránh trùng. Bộ lọc chuyển giữa `active` và `archived`; đổi bộ lọc sẽ reset danh sách và tải lại.

Có trạng thái đang tải, danh sách rỗng, lỗi và nút thử lại. Request danh sách trước được unsubscribe khi reset; các subscription có `takeUntil(destroy$)` để kết thúc khi component bị hủy.

### Tạo dự án

- Form nằm trong sidebar; mở form sẽ mở rộng sidebar nếu đang thu gọn.
- Tên được trim, bắt buộc, tối đa 255 ký tự.
- Mã được trim và chuyển chữ hoa, kiểm tra regex `^[A-Z][A-Z0-9_]{0,19}$`.
- Mô tả rỗng được gửi thành `null`.
- Thành công: đóng form, chọn dự án mới, chuyển bộ lọc về active và tải lại danh sách.

### Menu thao tác và dialog

Menu dấu ba chấm cung cấp xem chi tiết, quản lý thành viên, chỉnh sửa, lưu trữ hoặc khôi phục. Menu đặt ngoài vùng cuộn để tránh bị cắt; hỗ trợ phím mũi tên, Home/End, Escape và quản lý focus.

Thông tin dự án hiển thị qua native `<dialog>` với bốn mode: `details`, `edit`, `archive`, `restore`. Khi mở sẽ lấy lại chi tiết từ API. Mã dự án chỉ đọc khi sửa; dự án archived cần khôi phục trước khi chỉnh sửa. Sau cập nhật, sidebar tải lại danh sách và phát lại mục đang chọn nếu phù hợp.

## 7. Quản lý thành viên

`ProjectMemberManagementComponent` nhận dự án qua Input và hỗ trợ:

- Xem danh sách thành viên, tìm kiếm và phân trang, mỗi trang 10 người.
- Tìm tài khoản có thể thêm qua danh sách candidates riêng.
- Xác nhận trước khi thêm hoặc xóa thành viên.
- Debounce tìm kiếm 300 ms; dùng sequence để bỏ qua response cũ khi request mới đã bắt đầu.
- Khóa thao tác ghi đối với dự án archived và ngăn đóng trong khi đang ghi/kiểm tra xóa.
- Phát lại số lượng thành viên khi tải danh sách không có từ khóa tìm kiếm.

Sau khi thêm/xóa thành công, component tải lại danh sách liên quan. Nếu xóa trả lỗi, code có nhánh xử lý 204 và bước truy vấn lại theo username để kiểm tra người dùng còn trong danh sách hay không.

Model thành viên có danh sách roles, nhưng service hiện chỉ định nghĩa xem, thêm, xóa thành viên và tìm candidates; chưa có API cập nhật role trong service này.

## 8. Trang xem session

`SessionViewComponent` đọc `sessionId` từ route và gọi `GET /files/session/{sessionId}`. Response gồm loại session (`capture` hoặc `record`) và danh sách file.

Luồng tải:

1. Ưu tiên ảnh đối với capture, video đối với record; nếu không có loại ưu tiên thì lấy media phù hợp còn lại.
2. Tải media dạng Blob qua HTTP có header auth, chuẩn hóa MIME type và tạo object URL để preview.
3. Tìm file JSON đầu tiên làm ticket/telemetry; nếu không có hoặc lỗi tải JSON thì dùng dữ liệu rỗng.
4. Ưu tiên `ticket.telemetry.console/network/actions`, có fallback sang `consoleLogs/networkLogs/userEvents`.
5. Mount panel DevTools vào DOM sau khi hoàn tất bước tải ticket.

Viewer có chọn media, phát/dừng, seek, tốc độ phát, fullscreen, kéo thay đổi chiều rộng hai cột và các phím Space/K, mũi tên trái/phải, F. Object URL được thu hồi khi reset hoặc hủy component.

`SessionViewService` chuẩn hóa URL file: URL tuyệt đối được lấy pathname, bỏ prefix `/api/` rồi ghép qua base URL của service. Vì vậy URL ngoài domain hoặc URL cần query string sẽ không được giữ nguyên.

`devtools-panel.ts` dựng giao diện bằng DOM/HTML và event listener trực tiếp. Có tab Info, Console, Network, Actions, Backend; network detail có Headers, Payload, Response, Preview, Timing, Initiator. Panel có state lọc riêng, mặc định mở Network. Viewer dùng Shadow DOM để cô lập style của bộ giao diện này.

## 9. API chính từ phía frontend

Các đường dẫn dưới đây được ghép sau API base URL; đây là contract mà frontend đang gọi, chưa xác nhận với backend.

| Method | Đường dẫn | Chức năng |
| --- | --- | --- |
| POST | `/auth/login` | Đăng nhập |
| GET | `/auth/me` | Người dùng hiện tại |
| GET | `/projects` | Danh sách, search, status, phân trang |
| POST | `/projects` | Tạo dự án |
| GET | `/projects/{projectId}` | Chi tiết dự án |
| PUT | `/projects/{projectId}` | Sửa tên và mô tả |
| PATCH | `/projects/{projectId}/archive` | Lưu trữ |
| PATCH | `/projects/{projectId}/restore` | Khôi phục |
| GET | `/projects/{projectId}/members` | Thành viên, tìm kiếm, phân trang |
| GET | `/projects/{projectId}/member-candidates` | Tài khoản có thể thêm |
| POST | `/projects/{projectId}/members` | Thêm với payload `{ userId }` |
| DELETE | `/projects/{projectId}/members/{userId}` | Xóa thành viên |
| GET | `/files/session/{sessionId}` | Danh sách file session |
| GET | `/files/session/{sessionId}/file/{fileName}` | Đường dẫn fallback khi file không có URL |

AuthService còn có refresh, logout, đổi mật khẩu, quên/reset mật khẩu và đọc/cập nhật profile. Có hàm service không có nghĩa đã có màn hình sử dụng tương ứng. UserService hiện chứa nhiều hàm trùng AuthService.

## 10. Chạy và build

```bash
npm install
npm start
npm run build
```

README cũ hướng dẫn cài bằng `npm i --force`; chưa kiểm chứng việc cài dependency trong lần đọc này. `npm start` gọi `ng serve -o`, `npm run build` gọi `ng build`, cấu hình build mặc định là production. Output nằm ở `dist/fta-index`.

Trước khi chạy cần chỉnh `src/assets/config/config.json` trỏ đúng backend, gồm protocol và `/api`, ví dụ `https://api.example.com/api`. API guide mới ghi nhận DI cho `IProjectModuleService` và `IProjectTicketStatusService` đã được đăng ký trong source backend; môi trường backend vẫn cần deploy/restart và có schema nghiệp vụ trước khi kiểm thử project.

Các script `s`, `s:s`, `s:p`, `b` dùng lệnh `copy` cho Windows. Các script `sl`, `sl:s`, `sl:p`, `bl` dùng `cp` cho Linux. Chúng tham chiếu `src/config/development.json`, `staging.json`, `production.json`; các file này không xuất hiện trong cây file đã kiểm tra nên cần bổ sung trước khi dùng các script đó.

`start:https` dùng chứng chỉ local trong `src/assets/local-ssl`. `angular.json` còn tham chiếu asset `src/html` và `src/firebase-messaging-sw.js`, không thấy trong danh sách file đã kiểm tra; cần đối chiếu khi build.

## 11. Các điểm cần lưu ý khi phát triển tiếp

1. **Nội dung workspace:** triển khai content thực tế khi chọn dự án; hiện template phần nghiệp vụ đang bị comment.
2. **Runtime backend:** API guide mới nói DI cho project đã có trong source. `500` từ môi trường triển khai cần kiểm tra deploy/restart, migration/schema nghiệp vụ và log backend trước khi thay đổi frontend.
3. **Phân quyền:** route guard chỉ kiểm tra có phiên; quyền dữ liệu và quyền trong project phải tiếp tục do backend kiểm tra. Guide chưa có API trả effective permission theo project.
4. **Session request cũ:** đổi route session sẽ gọi tải mới nhưng request trước chỉ được hủy khi component destroy, có khả năng response cũ cập nhật vào view mới. Loading được tắt sau bước ticket, chưa chờ toàn bộ Blob media hoàn tất.
5. **Fallback media:** nhánh lỗi Blob dùng URL file đã chuẩn hóa trực tiếp cho preview; cần kiểm tra đường dẫn và cơ chế auth khi gặp nhánh này.
6. **Helper bất đồng bộ cũ:** `BaseService.getAllandSub*()` trả mảng ngay sau subscribe, nên bên gọi không thể kỳ vọng nhận dữ liệu HTTP đã tải xong.
7. **Kiểm thử:** có cấu hình Karma/Jasmine và test target trong Angular, nhưng không thấy file `*.spec.ts` trong source đã kiểm tra; package chưa có script `test`.

## 12. Điểm bắt đầu khi sửa code

| Nhu cầu | File nên đọc/sửa trước |
| --- | --- |
| Layout/nút/form sidebar | `src/app/components/workspace/sidebar/sidebar.component.html` và `.scss` |
| Logic dự án | `sidebar.component.ts`, `src/app/services/project.service.ts` |
| Màn hình sau khi chọn dự án | `workspace.component.ts`, `content/content.component.*` |
| Quản lý thành viên | `project-member-management.component.*`, `project-member.service.ts` |
| Đăng nhập/token | `login.component.ts`, `auth.service.ts`, `auth-state.service.ts`, interceptor |
| Ảnh/video session | `session-view.component.*`, `session-view.service.ts` |
| Hiển thị log/DevTools | `devtools-panel.ts`, `devtools-panel.css` |
| Địa chỉ backend | `src/assets/config/config.json`, `app-config.service.ts` |
| Route mới | `app-routing.module.ts` và routing module của feature |

