# DriverSchool

FE Angular project for DriverSchool.
***

# How to run
- Install packages: `npm i --force`
- Start: `npm start`

    *(Xem thêm ở file package.json)*

# Công nghệ sử dụng
- **Angular 14**
- **UI components: PrimeNG 14**

  https://www.primefaces.org/primeng-v14/setup \
  Project DriverSchool-FE sử dụng các UI components của PrimeNG.

  **Example**:  
  Trong file `src/app/components/admin/list-users/list-users.module.ts` đã import một số module như: `FormsModule`, `ButtonModule`, `InputTextModule`,... \
  Khi cần sử dụng các module khác cho các component thuộc `ListUsersModule`, lập trình viên tìm kiếm <a href="https://www.primefaces.org/primeng-v14/setup">document của PrimeNG</a>, sau đó import tương tự các module đã dùng.

  **Note**: Import các module của PrimeNG và các thư viện khác vào module cần sử dụng của DriverSchool-FE, thay vì sử dụng shared module.


# Cấu trúc project
```
src
└─app
└─assets
| └─config
| └─images: ảnh logo, icon
| └─layout:
| | └─styles
| |   └─layout: css cho admin layout
| |   └─theme: css của một số mẫu theme
| └─styles
|   | theme.css: css của theme đang dùng cho DriverSchool-FE
└─environment
└─html: các page sử dụng trong project qua iframe (slide viewer, print template)
```
**Note**: Không tùy ý thay đổi file theme.css

# UI classes: PrimeFlex 3

**Lưu ý**: PrimeFlex dùng đơn vị rem trong config css cho các thành phần UI. \
1 rem = 1 lần font-size của root element của HTML document. 
Ở DriverSchool, font-size = 14px nên **1rem = 14px**.

**Link tham khảo chính:**

https://www.primefaces.org/primeflex/ 

<u>*Ví dụ áp dụng CSS class của PrimeFlex*</u>:
```html
  <div class="hidden"></div>
```
tương đương với
```html
  <div style="display: none;"></div>
```

**Link tham khảo tên các class của PrimeNg:**

Display:
https://www.primefaces.org/primeflex/display

Padding:
https://www.primefaces.org/primeflex/padding

Margin:
https://www.primefaces.org/primeflex/margin

# Danh sách custom style class  cần tuân theo

- custom-disable : Áp dụng khi form control bị disable.

# Icons:
  - PrimeIcons 6: https://www.primefaces.org/primeng-v14/icons
  - FontAwesome 6: https://fontawesome.com/v6/search

# Build code:
- Sử dụng lệnh cd để di chuyển đến thư mục chứa mã nguồn Angular.
        cd /path/to/your/angular/app
- Sử dụng lệnh ng build để build ứng dụng . Theo mặc định, ứng dụng sẽ được build vào thư mục dist/.
        ng build

# Upcode test:


