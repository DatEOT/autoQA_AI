
Routers/Question(
---API DOCUMENTATION - /questions/generate

Phương thức: POST
URL: /questions/generate

YÊU CẦU XÁC THỰC:
-----------------
- Header: Authorization: Bearer <token>
- Header: API-Key: <your_api_key> (VD: 2605)

FORM DATA (multipart/form-data):
--------------------------------
- file (File, Bắt buộc): File PDF đề cương
- exam_subject (String, Bắt buộc): Môn thi (VD: "1", "Văn học")
- exam_duration (String, Bắt buộc): Thời gian làm bài (VD: "60 phút")
- num_questions (Integer, Bắt buộc): Tổng số câu hỏi cần tạo
- level_1 -> level_6 (Integer, Bắt buộc): Số câu theo từng cấp độ Bloom (từ nhớ đến sáng tạo)

REQUEST MẪU:
------------
curl -X 'POST' \
  'http://127.0.0.1:8000/questions/generate' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <your_token>' \
  -H 'API-Key: 2605' \
  -H 'Content-Type: multipart/form-data' \
  -F 'exam_subject=1' \
  -F 'exam_duration=1' \
  -F 'num_questions=6' \
  -F 'level_1=1' \
  -F 'level_2=1' \
  -F 'level_3=1' \
  -F 'level_4=1' \
  -F 'level_5=1' \
  -F 'level_6=1' \
  -F 'file=@TLHĐC-pages-1.pdf;type=application/pdf'

RESPONSE MẪU:
-------------
{
  "file_id": "uuid-xxx",
  "original_filename": "TLHĐC-pages-1.pdf",
  "num_segments": 7,
  "formatted_docx_download_url": "/questions/download/formatted/{file_id}",
  "simple_docx_download_url": "/questions/download/simple/{file_id}",
  "questions_and_answers": [
    {
      "level": "Cấp độ 1 - Nhớ",
      "questions": {
        "Câu hỏi 1": "Nội dung trả lời 1"
      }
    },
    ...
  ]
}

MÃ LỖI PHỔ BIẾN:
---------------
- 401 Unauthorized: Thiếu hoặc token không hợp lệ
- 403 Forbidden: API Key không hợp lệ
- 422 Unprocessable Entity: Thiếu file hoặc dữ liệu chưa hợp lệ
- 500 Internal Server Error: Lỗi hệ thống




---API DOCUMENTATION: Download Generated Questions as ZIP---

Endpoint:
GET /questions/download/zip/{file_id}

Description:
Tải file ZIP chứa các tài liệu liên quan đến bộ câu hỏi đã sinh ra (ví dụ: file Word định dạng đẹp, đơn giản, v.v.).

Authentication:
Không yêu cầu API-Key.

Request

Headers:
- accept: */*

Path Parameters:
- file_id (string, required): ID duy nhất của file được tạo từ quá trình sinh câu hỏi.

Curl Example:
curl -X 'GET' \
  'http://127.0.0.1:8000/questions/download/zip/124f4ddf-81f6-4687-9950-3177039cd4e2' \
  -H 'accept: */*'

Response (200 OK):
- Response body: Dữ liệu dạng file zip.
- Response headers:
    content-disposition: attachment; filename=<file_name>.zip
    content-type: application/zip
    date: <timestamp>
    server: uvicorn
    transfer-encoding: chunked

Example Response Headers:
content-disposition: attachment; filename=124f4ddf-81f6-4687-9950-3177039cd4e2_files.zip
content-type: application/zip
date: Thu, 24 Apr 2025 08:22:25 GMT
server: uvicorn
transfer-encoding: chunked

Error Codes:
- 404: File not found (file_id không hợp lệ hoặc chưa có dữ liệu)
- 500: Internal Server Error (có lỗi trong quá trình đóng gói file ZIP)
)

Authentication(
---API: User Registration

Endpoint:
POST /authentication/register

Description:
API dùng để đăng ký tài khoản người dùng mới vào hệ thống.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key          | Value                |
|--------------|----------------------|
| accept       | application/json     |
| API-Key      | 2605                 |
| Content-Type | application/json     |

Request Body (JSON)
| Field     | Type     | Required | Description                       |
|-----------|----------|----------|-----------------------------------|
| email     | string   | ✅       | Địa chỉ email người dùng          |
| password  | string   | ✅       | Mật khẩu người dùng               |
| role      | string   | ✅       | Vai trò người dùng (e.g., "user") |

Ví dụ curl:
curl -X 'POST' \
  'http://127.0.0.1:8000/authentication/register' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605' \
  -H 'Content-Type: application/json' \
  -d '{\n  "email": "thanhdat12300@gmail.com",\n  "password": "Dat@@600636",\n  "role": "user"\n}'

Response

Success - 200 OK
{
  "message": "Đăng ký thành công"
}

Errors

| Code | Message                     | Description                                   |
|------|-----------------------------|-----------------------------------------------|
| 400  | Invalid request body        | Dữ liệu đầu vào không hợp lệ hoặc thiếu trường |
| 401  | Invalid API key             | API-Key không hợp lệ                           |
| 409  | Email already registered    | Tài khoản với email đã tồn tại                |
| 500  | Internal Server Error       | Có lỗi hệ thống xảy ra                        |

---API: User Login

Endpoint:
POST /authentication/login

Description:
API dùng để người dùng đăng nhập vào hệ thống và nhận access token JWT.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key          | Value                |
|--------------|----------------------|
| accept       | application/json     |
| API-Key      | 2605                 |
| Content-Type | application/json     |

Request Body (JSON)
| Field     | Type     | Required | Description                       |
|-----------|----------|----------|-----------------------------------|
| email     | string   | ✅       | Địa chỉ email người dùng          |
| password  | string   | ✅       | Mật khẩu người dùng               |
| role      | string   | ✅       | Vai trò người dùng (e.g., "user") |

Ví dụ curl:
curl -X 'POST' \
  'http://127.0.0.1:8000/authentication/login' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605' \
  -H 'Content-Type: application/json' \
  -d '{\n  "email": "thanhdat12300@gmail.com",\n  "password": "Dat@@600636",\n  "role": "user"\n}'

Response

Success - 200 OK
{
  "message": "Đăng nhập thành công",
  "access_token": "<JWT Token>",
  "token_type": "bearer",
  "role": "user",
  "balance": 0,
  "idUser": 31
}

Response Fields
| Field         | Type     | Description                           |
|---------------|----------|---------------------------------------|
| message       | string   | Thông báo đăng nhập thành công         |
| access_token  | string   | Mã token JWT để xác thực người dùng   |
| token_type    | string   | Loại token (mặc định: bearer)         |
| role          | string   | Vai trò của người dùng (user/admin)   |
| balance       | integer  | Số dư tài khoản                        |
| idUser        | integer  | ID người dùng trong hệ thống          |

Errors

| Code | Message                     | Description                                   |
|------|-----------------------------|-----------------------------------------------|
| 400  | Invalid credentials         | Email hoặc mật khẩu không chính xác           |
| 401  | Invalid API key             | API-Key không hợp lệ                           |
| 403  | Unauthorized role access    | Vai trò không được phép đăng nhập            |
| 500  | Internal Server Error       | Lỗi trong quá trình xử lý đăng nhập          |

)

Usermanagement(
---API: Get All Users

Endpoint:
GET /Usermanagement/getUsers

Description:
Lấy toàn bộ danh sách người dùng trong hệ thống, bao gồm thông tin ID, email, vai trò, trạng thái hoạt động và số dư tài khoản.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/Usermanagement/getUsers' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
[
  {
    "id": 1,
    "email": "thanhdat5699636@gmail.com",
    "role": "admin",
    "is_active": true,
    "balance": 10202
  },
  {
    "id": 8,
    "email": "dat123@123",
    "role": "user",
    "is_active": true,
    "balance": 90
  },
  ...
]

Response Fields
| Field      | Type     | Description                          |
|------------|----------|--------------------------------------|
| id         | integer  | ID duy nhất của người dùng          |
| email      | string   | Địa chỉ email người dùng            |
| role       | string   | Vai trò (admin/user)                |
| is_active  | boolean  | Trạng thái hoạt động của người dùng |
| balance    | integer  | Số dư trong tài khoản                |

Errors

| Code | Message                   | Description                            |
|------|---------------------------|----------------------------------------|
| 401  | Invalid API key           | API-Key không hợp lệ                   |
| 500  | Internal Server Error     | Lỗi khi truy xuất dữ liệu người dùng  |


---API: Get User by ID

Endpoint:
GET /Usermanagement/getUserID/{id}

Description:
Lấy thông tin chi tiết của một người dùng dựa theo ID.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Path Parameters:
| Param | Type     | Required | Description                      |
|-------|----------|----------|----------------------------------|
| id    | integer  | ✅       | ID của người dùng cần truy vấn   |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/Usermanagement/getUserID/1' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "id": 1,
  "email": "thanhdat5699636@gmail.com",
  "role": "admin",
  "is_active": true,
  "balance": 10202
}

Response Fields
| Field      | Type     | Description                          |
|------------|----------|--------------------------------------|
| id         | integer  | ID duy nhất của người dùng          |
| email      | string   | Địa chỉ email người dùng            |
| role       | string   | Vai trò (admin/user)                |
| is_active  | boolean  | Trạng thái hoạt động của người dùng |
| balance    | integer  | Số dư trong tài khoản                |

Errors

| Code | Message                   | Description                                  |
|------|---------------------------|----------------------------------------------|
| 404  | User not found            | Không tìm thấy người dùng với ID đã cung cấp |
| 401  | Invalid API key           | API-Key không hợp lệ                         |
| 500  | Internal Server Error     | Lỗi khi truy xuất dữ liệu người dùng         |


---API: Get User by Email

Endpoint:
GET /Usermanagement/getUserByEmail/{email}

Description:
Truy vấn thông tin chi tiết của một người dùng thông qua địa chỉ email.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Path Parameters:
| Param  | Type   | Required | Description                  |
|--------|--------|----------|------------------------------|
| email  | string | ✅       | Địa chỉ email đã URL-encoded |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/Usermanagement/getUserByEmail/thanhdat5699636%40gmail.com' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "id": 1,
  "email": "thanhdat5699636@gmail.com",
  "role": "admin",
  "is_active": true,
  "balance": 10202
}

Response Fields
| Field      | Type     | Description                          |
|------------|----------|--------------------------------------|
| id         | integer  | ID duy nhất của người dùng          |
| email      | string   | Địa chỉ email người dùng            |
| role       | string   | Vai trò (admin/user)                |
| is_active  | boolean  | Trạng thái hoạt động của người dùng |
| balance    | integer  | Số dư trong tài khoản                |

Errors

| Code | Message                   | Description                                  |
|------|---------------------------|----------------------------------------------|
| 404  | User not found            | Không tìm thấy người dùng với email đã cung cấp |
| 401  | Invalid API key           | API-Key không hợp lệ                         |
| 500  | Internal Server Error     | Lỗi khi truy xuất dữ liệu người dùng         |


---API: Create New User

Endpoint:
POST /Usermanagement/createUser

Description:
Tạo mới một người dùng trong hệ thống với email, mật khẩu và vai trò được chỉ định.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key          | Value                |
|--------------|----------------------|
| accept       | application/json     |
| API-Key      | 2605                 |
| Content-Type | application/json     |

Request Body (JSON)
| Field     | Type     | Required | Description                       |
|-----------|----------|----------|-----------------------------------|
| email     | string   | ✅       | Địa chỉ email người dùng mới      |
| password  | string   | ✅       | Mật khẩu người dùng               |
| role      | string   | ✅       | Vai trò người dùng (user/admin)   |

Ví dụ curl:
curl -X 'POST' \
  'http://127.0.0.1:8000/Usermanagement/createUser' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "thanhdat101010@gmail.com",
  "password": "Dat@@102030",
  "role": "user"
}'

Response

Success - 200 OK
{
  "message": "User created successfully"
}

Errors

| Code | Message                       | Description                                 |
|------|-------------------------------|---------------------------------------------|
| 400  | Invalid input                 | Dữ liệu đầu vào không hợp lệ hoặc thiếu     |
| 401  | Invalid API key               | API-Key không hợp lệ                         |
| 409  | Email already exists          | Người dùng với email đã tồn tại             |
| 500  | Internal Server Error         | Lỗi hệ thống khi tạo người dùng mới         |

---API: Update User Role

Endpoint:
PUT /Usermanagement/updateUser/{id}?role={new_role}

Description:
Cập nhật vai trò (role) cho một người dùng cụ thể dựa trên ID.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Path Parameters:
| Param | Type     | Required | Description                    |
|-------|----------|----------|--------------------------------|
| id    | integer  | ✅       | ID của người dùng cần cập nhật |

Query Parameters:
| Param | Type   | Required | Description            |
|-------|--------|----------|------------------------|
| role  | string | ✅       | Vai trò mới (user/admin) |

Ví dụ curl:
curl -X 'PUT' \
  'http://127.0.0.1:8000/Usermanagement/updateUser/32?role=admin' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "message": "User role updated successfully"
}

Errors

| Code | Message                       | Description                                |
|------|-------------------------------|--------------------------------------------|
| 400  | Invalid role or user ID       | Vai trò không hợp lệ hoặc ID không tồn tại |
| 401  | Invalid API key               | API-Key không hợp lệ                        |
| 404  | User not found                | Không tìm thấy người dùng với ID cung cấp  |
| 500  | Internal Server Error         | Lỗi hệ thống khi cập nhật dữ liệu          |


---API: Update User Balance

Endpoint:
PUT /Usermanagement/updateBalance/{id}?amount={value}

Description:
Cập nhật số dư (balance) cho người dùng theo ID, bằng cách cộng thêm một số tiền chỉ định.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Path Parameters:
| Param | Type     | Required | Description                    |
|-------|----------|----------|--------------------------------|
| id    | integer  | ✅       | ID của người dùng              |

Query Parameters:
| Param   | Type    | Required | Description                        |
|---------|---------|----------|------------------------------------|
| amount  | number  | ✅       | Số tiền cần cộng thêm vào tài khoản |

Ví dụ curl:
curl -X 'PUT' \
  'http://127.0.0.1:8000/Usermanagement/updateBalance/32?amount=100' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "message": "Balance updated",
  "change_amount": "100",
  "new_balance": "100",
  "timestamp": "2025-04-24 15:40:41"
}

Response Fields
| Field         | Type     | Description                             |
|---------------|----------|-----------------------------------------|
| message       | string   | Thông báo cập nhật thành công            |
| change_amount | string   | Số tiền đã cộng thêm                    |
| new_balance   | string   | Số dư mới sau khi cập nhật              |
| timestamp     | string   | Thời điểm cập nhật                      |

Errors

| Code | Message                   | Description                                     |
|------|---------------------------|-------------------------------------------------|
| 400  | Invalid user ID or amount | ID không tồn tại hoặc giá trị amount không hợp lệ |
| 401  | Invalid API key           | API-Key không hợp lệ                           |
| 500  | Internal Server Error     | Lỗi hệ thống khi cập nhật số dư                |

---API: Set User Active Status

Endpoint:
PUT /Usermanagement/setActive/{id}?is_active={true|false}

Description:
Kích hoạt hoặc vô hiệu hóa tài khoản người dùng dựa trên ID và trạng thái chỉ định.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Path Parameters:
| Param | Type     | Required | Description                    |
|-------|----------|----------|--------------------------------|
| id    | integer  | ✅       | ID của người dùng              |

Query Parameters:
| Param      | Type    | Required | Description                         |
|------------|---------|----------|-------------------------------------|
| is_active  | boolean | ✅       | Trạng thái mới (true = mở khóa, false = khóa) |

Ví dụ curl:
curl -X 'PUT' \
  'http://127.0.0.1:8000/Usermanagement/setActive/32?is_active=true' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "message": "User unlocked successfully"
}

Response Fields
| Field   | Type   | Description                        |
|---------|--------|------------------------------------|
| message | string | Thông báo trạng thái cập nhật thành công |

Errors

| Code | Message                     | Description                                  |
|------|-----------------------------|----------------------------------------------|
| 400  | Invalid user ID or input    | ID không tồn tại hoặc is_active không hợp lệ |
| 401  | Invalid API key             | API-Key không hợp lệ                         |
| 500  | Internal Server Error       | Lỗi hệ thống khi cập nhật trạng thái         |

---API: Delete User

Endpoint:
DELETE /Usermanagement/delete/{id}

Description:
Xoá một người dùng khỏi hệ thống dựa trên ID.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Path Parameters:
| Param | Type     | Required | Description                    |
|-------|----------|----------|--------------------------------|
| id    | integer  | ✅       | ID của người dùng cần xoá      |

Ví dụ curl:
curl -X 'DELETE' \
  'http://127.0.0.1:8000/Usermanagement/delete/31' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "message": "User deleted successfully"
}

Response Fields
| Field   | Type   | Description                    |
|---------|--------|--------------------------------|
| message | string | Thông báo xoá người dùng thành công |

Errors

| Code | Message                   | Description                                  |
|------|---------------------------|----------------------------------------------|
| 400  | Invalid user ID           | ID người dùng không hợp lệ                  |
| 401  | Invalid API key           | API-Key không hợp lệ                         |
| 404  | User not found            | Không tìm thấy người dùng cần xoá           |
| 500  | Internal Server Error     | Lỗi hệ thống khi xoá người dùng             |

---API: Change User Password

Endpoint:
PUT /Usermanagement/changePassword

Description:
Thay đổi mật khẩu cho người dùng dựa trên ID, mật khẩu cũ và mật khẩu mới.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key              | Value                          |
|------------------|--------------------------------|
| accept           | application/json               |
| API-Key          | 2605                           |
| Content-Type     | application/x-www-form-urlencoded |

Form Data (x-www-form-urlencoded)
| Field         | Type     | Required | Description                           |
|---------------|----------|----------|---------------------------------------|
| user_id       | integer  | ✅       | ID của người dùng                     |
| old_password  | string   | ✅       | Mật khẩu cũ                           |
| new_password  | string   | ✅       | Mật khẩu mới                          |

Ví dụ curl:
curl -X 'PUT' \
  'http://127.0.0.1:8000/Usermanagement/changePassword' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'user_id=32&old_password=Dat%40%40102030&new_password=12345'

Response

Success - 200 OK
{
  "message": "Đổi mật khẩu thành công"
}

Response Fields
| Field   | Type   | Description                     |
|---------|--------|---------------------------------|
| message | string | Thông báo đổi mật khẩu thành công |

Errors

| Code | Message                       | Description                                 |
|------|-------------------------------|---------------------------------------------|
| 400  | Missing or invalid input      | Thiếu hoặc sai dữ liệu truyền vào           |
| 401  | Invalid API key               | API-Key không hợp lệ                         |
| 403  | Incorrect old password        | Mật khẩu cũ không chính xác                  |
| 500  | Internal Server Error         | Lỗi hệ thống khi thay đổi mật khẩu          |

---API: Count Total Users

Endpoint:
GET /Usermanagement/countUsers

Description:
Trả về tổng số lượng người dùng hiện có trong hệ thống.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/Usermanagement/countUsers' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "total_users": 8
}

Response Fields
| Field        | Type    | Description                     |
|--------------|---------|---------------------------------|
| total_users  | integer | Tổng số lượng người dùng hiện tại |

Errors

| Code | Message                   | Description                          |
|------|---------------------------|--------------------------------------|
| 401  | Invalid API key           | API-Key không hợp lệ                 |
| 500  | Internal Server Error     | Lỗi hệ thống khi đếm người dùng     |

)

roleUsers(
---API: Count Users by Role

Endpoint:
GET /roleUser/countRoles

Description:
Trả về số lượng người dùng được phân theo từng vai trò (ví dụ: admin, user).

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/roleUser/countRoles' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "admin": 3,
  "user": 5
}

Response Fields
| Field | Type    | Description                          |
|--------|---------|--------------------------------------|
| admin  | integer | Số lượng người dùng có vai trò admin |
| user   | integer | Số lượng người dùng có vai trò user  |

Errors

| Code | Message                   | Description                          |
|------|---------------------------|--------------------------------------|
| 401  | Invalid API key           | API-Key không hợp lệ                 |
| 500  | Internal Server Error     | Lỗi hệ thống khi đếm vai trò người dùng |

---API: Filter Users by Role

Endpoint:
GET /roleUser/filterByRole?role={role_name}

Description:
Lọc và trả về danh sách người dùng theo vai trò chỉ định (ví dụ: "admin", "user").

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Query Parameters:
| Param | Type   | Required | Description                       |
|-------|--------|----------|-----------------------------------|
| role  | string | ✅       | Vai trò cần lọc (admin/user)      |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/roleUser/filterByRole?role=admin' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
[
  {
    "id": 1,
    "email": "thanhdat5699636@gmail.com",
    "role": "admin",
    "is_active": true,
    "balance": 10202
  },
  {
    "id": 16,
    "email": "admin@1234",
    "role": "admin",
    "is_active": true,
    "balance": 0
  },
  {
    "id": 32,
    "email": "thanhdat101010@gmail.com",
    "role": "admin",
    "is_active": true,
    "balance": 100
  }
]

Response Fields
| Field      | Type     | Description                          |
|------------|----------|--------------------------------------|
| id         | integer  | ID duy nhất của người dùng          |
| email      | string   | Địa chỉ email người dùng            |
| role       | string   | Vai trò người dùng (admin/user)     |
| is_active  | boolean  | Trạng thái hoạt động của người dùng |
| balance    | integer  | Số dư trong tài khoản                |

Errors

| Code | Message                   | Description                              |
|------|---------------------------|------------------------------------------|
| 400  | Missing or invalid role   | Vai trò không được cung cấp hoặc sai     |
| 401  | Invalid API key           | API-Key không hợp lệ                     |
| 500  | Internal Server Error     | Lỗi hệ thống khi lọc người dùng          |

)

login_history(
    📘 API: Get Last Login Time by User ID

Endpoint:
GET /login_history/last_login/{user_id}

Description:
Trả về thời gian đăng nhập gần nhất của người dùng dựa trên `user_id`.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Path Parameters:
| Param    | Type     | Required | Description                  |
|----------|----------|----------|------------------------------|
| user_id  | integer  | ✅       | ID của người dùng            |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/login_history/last_login/16' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "last_login": "2025-04-24T15:35:42"
}

Response Fields
| Field       | Type     | Description                          |
|-------------|----------|--------------------------------------|
| last_login  | string   | Dấu thời gian đăng nhập gần nhất (ISO format) |

Errors

| Code | Message                   | Description                              |
|------|---------------------------|------------------------------------------|
| 404  | User not found            | Không tìm thấy người dùng với ID cung cấp |
| 401  | Invalid API key           | API-Key không hợp lệ                     |
| 500  | Internal Server Error     | Lỗi hệ thống khi truy xuất dữ liệu       |

)

QuestionStats(
---API: Get All Users' Question Statistics

Endpoint:
GET /QuestionStats/getAllUserStats

Description:
Trả về danh sách thống kê số lượng đề thi và tổng số câu hỏi được tạo bởi từng người dùng.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/QuestionStats/getAllUserStats' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
[
  {
    "idUser": 8,
    "email": "dat123@123",
    "create_count": 1,
    "total_questions": 6
  },
  {
    "idUser": 20,
    "email": "admin@123",
    "create_count": 48,
    "total_questions": 290
  },
  ...
]

Response Fields
| Field           | Type     | Description                                |
|------------------|----------|--------------------------------------------|
| idUser           | integer  | ID của người dùng                          |
| email            | string   | Email của người dùng                       |
| create_count     | integer  | Số lần người dùng tạo đề thi               |
| total_questions  | integer  | Tổng số câu hỏi đã tạo ra bởi người dùng  |

Errors

| Code | Message                   | Description                          |
|------|---------------------------|--------------------------------------|
| 401  | Invalid API key           | API-Key không hợp lệ                 |
| 500  | Internal Server Error     | Lỗi hệ thống khi truy xuất thống kê |

---API: Get User Question Stats in Date Range

Endpoint:
GET /QuestionStats/getUserStatsInRange?start={yyyy-mm-dd}&end={yyyy-mm-dd}

Description:
Trả về thống kê số lượng đề thi và tổng số câu hỏi mà từng người dùng đã tạo trong khoảng thời gian chỉ định.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Query Parameters:
| Param | Type   | Required | Description                    |
|-------|--------|----------|--------------------------------|
| start | string | ✅       | Ngày bắt đầu (định dạng yyyy-mm-dd) |
| end   | string | ✅       | Ngày kết thúc (định dạng yyyy-mm-dd) |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/QuestionStats/getUserStatsInRange?start=2025-04-01&end=2025-04-30' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
[
  {
    "idUser": 8,
    "email": "dat123@123",
    "create_count": 1,
    "total_questions": 6
  },
  {
    "idUser": 20,
    "email": "admin@123",
    "create_count": 48,
    "total_questions": 290
  },
  ...
]

Response Fields
| Field           | Type     | Description                                |
|------------------|----------|--------------------------------------------|
| idUser           | integer  | ID của người dùng                          |
| email            | string   | Email của người dùng                       |
| create_count     | integer  | Số lần tạo đề thi trong khoảng thời gian   |
| total_questions  | integer  | Tổng số câu hỏi đã tạo ra trong thời gian đó |

Errors

| Code | Message                       | Description                                 |
|------|-------------------------------|---------------------------------------------|
| 400  | Missing or invalid parameters | Tham số start/end thiếu hoặc sai định dạng  |
| 401  | Invalid API key               | API-Key không hợp lệ                        |
| 500  | Internal Server Error         | Lỗi hệ thống khi truy xuất dữ liệu thống kê |

---API: Get Overall Question Stats in Date Range

Endpoint:
GET /QuestionStats/getStatsInRange?start={yyyy-mm-dd}&end={yyyy-mm-dd}

Description:
Trả về thống kê tổng số đề thi và câu hỏi được tạo trong khoảng thời gian chỉ định, phân chia theo ngày, tháng, năm và tổng cộng.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Query Parameters:
| Param | Type   | Required | Description                         |
|-------|--------|----------|-------------------------------------|
| start | string | ✅       | Ngày bắt đầu (định dạng yyyy-mm-dd) |
| end   | string | ✅       | Ngày kết thúc (định dạng yyyy-mm-dd) |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/QuestionStats/getStatsInRange?start=2025-04-01&end=2025-04-30' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "creation_stats": {
    "day": 0,
    "month": 0,
    "year": 0,
    "total": 52
  },
  "question_stats": {
    "day": 0,
    "month": 0,
    "year": 0,
    "total": 333
  }
}

Response Fields
| Field               | Type     | Description                                 |
|---------------------|----------|---------------------------------------------|
| creation_stats      | object   | Thống kê số lượng đề thi đã tạo             |
| question_stats      | object   | Thống kê số lượng câu hỏi đã tạo            |
| day/month/year/total| integer  | Số lượng theo từng mốc thời gian & tổng cộng |

Errors

| Code | Message                       | Description                                 |
|------|-------------------------------|---------------------------------------------|
| 400  | Missing or invalid parameters | Tham số start/end thiếu hoặc sai định dạng  |
| 401  | Invalid API key               | API-Key không hợp lệ                        |
| 500  | Internal Server Error         | Lỗi hệ thống khi truy xuất dữ liệu thống kê |

---API: Get Balance Breakdown in Date Range

Endpoint:
GET /QuestionStats/getBalanceBreakdown?start={yyyy-mm-dd}&end={yyyy-mm-dd}

Description:
Trả về tổng số tiền đã cộng, trừ và chênh lệch số dư (net change) của tất cả người dùng trong khoảng thời gian chỉ định.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Query Parameters:
| Param | Type   | Required | Description                         |
|-------|--------|----------|-------------------------------------|
| start | string | ✅       | Ngày bắt đầu (yyyy-mm-dd)           |
| end   | string | ✅       | Ngày kết thúc (yyyy-mm-dd)          |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/QuestionStats/getBalanceBreakdown?start=2025-04-01&end=2025-04-30' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "total_added": 14660,
  "total_subtracted": -11380,
  "net_change": 3280
}

Response Fields
| Field            | Type    | Description                                   |
|------------------|---------|-----------------------------------------------|
| total_added      | number  | Tổng số tiền đã nạp thêm trong khoảng thời gian |
| total_subtracted | number  | Tổng số tiền đã trừ đi trong khoảng thời gian   |
| net_change       | number  | Sự thay đổi tổng thể của số dư                 |

Errors

| Code | Message                       | Description                                 |
|------|-------------------------------|---------------------------------------------|
| 400  | Missing or invalid parameters | Tham số start/end thiếu hoặc sai định dạng  |
| 401  | Invalid API key               | API-Key không hợp lệ                        |
| 500  | Internal Server Error         | Lỗi hệ thống khi truy xuất thống kê         |

---API: Get Global Statistics by Year

Endpoint:
GET /QuestionStats/getGlobalStats?year={yyyy}

Description:
Trả về thống kê tổng số đề thi và câu hỏi được tạo trong một năm cụ thể, bao gồm thống kê theo ngày, tháng, năm và tổng cộng.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Query Parameters:
| Param | Type   | Required | Description                  |
|-------|--------|----------|------------------------------|
| year  | string | ✅       | Năm cần thống kê (VD: 2025)  |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/QuestionStats/getGlobalStats?year=2025' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "creation_stats": {
    "day": 0,
    "month": 52,
    "year": 52,
    "total": 52
  },
  "question_stats": {
    "day": 0,
    "month": 333,
    "year": 333,
    "total": 333
  }
}

Response Fields
| Field               | Type     | Description                                  |
|---------------------|----------|----------------------------------------------|
| creation_stats      | object   | Thống kê số lượng đề thi đã tạo              |
| question_stats      | object   | Thống kê số lượng câu hỏi đã tạo             |
| day/month/year/total| integer  | Số lượng theo từng mốc thời gian & tổng cộng |

Errors

| Code | Message                       | Description                                |
|------|-------------------------------|--------------------------------------------|
| 400  | Missing or invalid parameters | Tham số year thiếu hoặc sai định dạng      |
| 401  | Invalid API key               | API-Key không hợp lệ                       |
| 500  | Internal Server Error         | Lỗi hệ thống khi truy xuất dữ liệu thống kê|

---API: Get Total Number of Questions

Endpoint:
GET /QuestionStats/getTotalQuestions

Description:
Trả về tổng số câu hỏi đã được tạo bởi tất cả người dùng trong hệ thống.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/QuestionStats/getTotalQuestions' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "total_questions": 333
}

Response Fields
| Field           | Type    | Description                        |
|------------------|---------|------------------------------------|
| total_questions  | integer | Tổng số câu hỏi đã được tạo       |

Errors

| Code | Message                   | Description                          |
|------|---------------------------|--------------------------------------|
| 401  | Invalid API key           | API-Key không hợp lệ                 |
| 500  | Internal Server Error     | Lỗi hệ thống khi truy xuất dữ liệu  |

)

transactionHistory(
---API: Get Transaction History

Endpoint:
GET /transactionHistory/

Description:
Trả về danh sách lịch sử thay đổi số dư (balance) của tất cả người dùng trong hệ thống, bao gồm thời điểm thay đổi, số tiền thay đổi và số dư sau giao dịch.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/transactionHistory/' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
[
  {
    "idUser": 32,
    "change_amount": "100",
    "new_balance": "100",
    "timestamp": "2025-04-24 15:40:41"
  },
  ...
]

Response Fields
| Field         | Type     | Description                                      |
|---------------|----------|--------------------------------------------------|
| idUser        | integer  | ID của người dùng thực hiện giao dịch           |
| change_amount | string   | Số tiền thay đổi (có thể là dương hoặc âm)      |
| new_balance   | string   | Số dư tài khoản sau khi thay đổi                |
| timestamp     | string   | Thời điểm ghi nhận giao dịch (ISO 8601 format)  |

Errors

| Code | Message                   | Description                              |
|------|---------------------------|------------------------------------------|
| 401  | Invalid API key           | API-Key không hợp lệ                     |
| 500  | Internal Server Error     | Lỗi hệ thống khi truy xuất lịch sử giao dịch |


---API: Get Transaction History by Email

Endpoint:
GET /transactionHistory/by-email?email={user_email}

Description:
Trả về danh sách lịch sử thay đổi số dư (balance) của một người dùng cụ thể, xác định theo địa chỉ email.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Query Parameters:
| Param  | Type   | Required | Description                                 |
|--------|--------|----------|---------------------------------------------|
| email  | string | ✅       | Địa chỉ email của người dùng (URL encoded) |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/transactionHistory/by-email?email=thanhdat101010%40gmail.com' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
[
  {
    "id": 85,
    "idUser": 32,
    "change_amount": 100,
    "new_balance": 100,
    "timestamp": "2025-04-24 15:40:41"
  }
]

Response Fields
| Field         | Type     | Description                                      |
|---------------|----------|--------------------------------------------------|
| id            | integer  | ID của giao dịch                                |
| idUser        | integer  | ID của người dùng                               |
| change_amount | number   | Số tiền thay đổi (âm hoặc dương)                |
| new_balance   | number   | Số dư sau giao dịch                             |
| timestamp     | string   | Thời điểm thực hiện giao dịch (ISO format)      |

Errors

| Code | Message                   | Description                                 |
|------|---------------------------|---------------------------------------------|
| 400  | Missing or invalid email  | Email không hợp lệ hoặc không được cung cấp |
| 401  | Invalid API key           | API-Key không hợp lệ                        |
| 404  | User not found            | Không tìm thấy người dùng với email đó      |
| 500  | Internal Server Error     | Lỗi hệ thống khi truy xuất lịch sử giao dịch|

---API: Get Transaction History by Date

Endpoint:
GET /transactionHistory/by-date?day={dd}&month={mm}&year={yyyy}

Description:
Trả về danh sách giao dịch đã diễn ra vào một ngày cụ thể, bao gồm thay đổi số dư và thời điểm thực hiện.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Query Parameters:
| Param | Type   | Required | Description                         |
|-------|--------|----------|-------------------------------------|
| day   | int    | ✅       | Ngày giao dịch (1–31)               |
| month | int    | ✅       | Tháng giao dịch (1–12)              |
| year  | int    | ✅       | Năm giao dịch (ví dụ: 2025)         |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/transactionHistory/by-date?day=24&month=4&year=2025' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "query_info": "Lịch sử giao dịch ngày 24 tháng 04 năm 2025",
  "results": [
    {
      "idUser": 32,
      "change_amount": "100",
      "new_balance": "100",
      "timestamp": "2025-04-24 15:40:41"
    }
  ]
}

Response Fields
| Field         | Type     | Description                                      |
|---------------|----------|--------------------------------------------------|
| query_info    | string   | Thông tin mô tả ngày đã truy vấn                |
| results       | array    | Danh sách giao dịch trong ngày đó               |
| idUser        | integer  | ID của người dùng thực hiện giao dịch           |
| change_amount | string   | Số tiền thay đổi                                |
| new_balance   | string   | Số dư sau giao dịch                             |
| timestamp     | string   | Thời điểm giao dịch (ISO format)                |

Errors

| Code | Message                         | Description                                 |
|------|----------------------------------|---------------------------------------------|
| 400  | Missing or invalid date fields  | Thiếu hoặc sai thông tin ngày tháng         |
| 401  | Invalid API key                 | API-Key không hợp lệ                        |
| 500  | Internal Server Error           | Lỗi hệ thống khi truy xuất lịch sử giao dịch|

*lưu ý: có thể chọn ngày riêng, tháng riêng, năm riêng hoặc kết hợp ngày tháng , ngày năm , tháng năm hoặc ngày ngày tháng năm

)

blog(
---API: Create Blog Post

Endpoint:
POST /blogs/CreateBlog

Description:
Tạo một bài viết blog mới với tiêu đề, nội dung và hình ảnh minh họa.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key          | Value                    |
|--------------|--------------------------|
| accept       | application/json         |
| API-Key      | 2605                     |
| Content-Type | multipart/form-data      |

Form Data Parameters:
| Field   | Type     | Required | Description                  |
|---------|----------|----------|------------------------------|
| title   | string   | ✅       | Tiêu đề của bài blog         |
| content | string   | ✅       | Nội dung bài blog            |
| image   | file     | ✅       | Ảnh minh họa định dạng JPG/PNG |

Ví dụ curl:
curl -X 'POST' \
  'http://127.0.0.1:8000/blogs/CreateBlog' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605' \
  -H 'Content-Type: multipart/form-data' \
  -F 'title=exam title' \
  -F 'content=exam content' \
  -F 'image=@magnifying-glass-with-text-questions-and-answers-and-a-question-mark-on-a-yellow-background-illustration-vector.jpg;type=image/jpeg'

Response

Success - 200 OK
{
  "title": "exam title",
  "content": "exam content",
  "image_url": "/static/images/c2b0d5e1ed794e4387d54c3534bed89d.jpg",
  "id": 17
}

Response Fields
| Field      | Type    | Description                              |
|------------|---------|------------------------------------------|
| title      | string  | Tiêu đề của bài viết                     |
| content    | string  | Nội dung bài viết                        |
| image_url  | string  | Đường dẫn tới ảnh minh họa được lưu trữ  |
| id         | integer | ID duy nhất của bài blog đã tạo         |

Errors

| Code | Message                         | Description                                 |
|------|----------------------------------|---------------------------------------------|
| 400  | Missing fields or file error     | Thiếu tiêu đề, nội dung hoặc ảnh không hợp lệ |
| 401  | Invalid API key                  | API-Key không hợp lệ                        |
| 500  | Internal Server Error            | Lỗi hệ thống khi tạo blog                   |

---API: Get All Blog Posts

Endpoint:
GET /blogs/ReadBlogAll

Description:
Lấy danh sách tất cả các bài viết blog có trong hệ thống, bao gồm tiêu đề, nội dung, ảnh minh họa và ID.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/blogs/ReadBlogAll' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
[
  {
    "title": "Tắc Kè Bông",
    "content": "Là 1 loài cute phô mai que",
    "image_url": "/static/images/a4002b724c2d47ecacfc8dccd333cde0.jpg",
    "id": 11
  },
  ...
]

Response Fields
| Field      | Type     | Description                          |
|------------|----------|--------------------------------------|
| title      | string   | Tiêu đề của bài blog                 |
| content    | string   | Nội dung bài blog                    |
| image_url  | string   | Đường dẫn ảnh minh họa               |
| id         | integer  | ID duy nhất của bài viết            |

Errors

| Code | Message                   | Description                          |
|------|---------------------------|--------------------------------------|
| 401  | Invalid API key           | API-Key không hợp lệ                 |
| 500  | Internal Server Error     | Lỗi hệ thống khi truy xuất dữ liệu  |


---API: Get Blog Post by ID

Endpoint:
GET /blogs/ReadBlog/{id}

Description:
Trả về thông tin chi tiết của một bài viết blog cụ thể dựa trên ID, bao gồm tiêu đề, nội dung và ảnh minh họa.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Path Parameters:
| Param | Type     | Required | Description                |
|-------|----------|----------|----------------------------|
| id    | integer  | ✅       | ID của bài viết blog cần lấy |

Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/blogs/ReadBlog/11' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "title": "Tắc Kè Bông",
  "content": "Là 1 loài cute phô mai que",
  "image_url": "/static/images/a4002b724c2d47ecacfc8dccd333cde0.jpg",
  "id": 11
}

Response Fields
| Field      | Type     | Description                          |
|------------|----------|--------------------------------------|
| title      | string   | Tiêu đề bài viết                     |
| content    | string   | Nội dung bài viết                   |
| image_url  | string   | Đường dẫn ảnh minh họa               |
| id         | integer  | ID duy nhất của bài viết            |

Errors

| Code | Message                   | Description                                 |
|------|---------------------------|---------------------------------------------|
| 404  | Blog not found            | Không tìm thấy bài viết với ID đã cung cấp  |
| 401  | Invalid API key           | API-Key không hợp lệ                        |
| 500  | Internal Server Error     | Lỗi hệ thống khi truy xuất dữ liệu bài viết |


---API: Update Blog Post by ID

Endpoint:
PUT /blogs/UpdateBlog/{id}

Description:
Cập nhật tiêu đề, nội dung và ảnh minh họa của một bài viết blog cụ thể theo ID.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key          | Value                    |
|--------------|--------------------------|
| accept       | application/json         |
| API-Key      | 2605                     |
| Content-Type | multipart/form-data      |

Path Parameters:
| Param | Type     | Required | Description                 |
|-------|----------|----------|-----------------------------|
| id    | integer  | ✅       | ID của bài viết blog cần cập nhật |

Form Data Parameters:
| Field   | Type   | Required | Description                      |
|---------|--------|----------|----------------------------------|
| title   | string | ✅       | Tiêu đề mới của bài viết        |
| content | string | ✅       | Nội dung mới của bài viết       |
| image   | file   | ✅       | Ảnh minh họa mới (JPG, PNG,...) |

Ví dụ curl:
curl -X 'PUT' \
  'http://127.0.0.1:8000/blogs/UpdateBlog/17' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605' \
  -H 'Content-Type: multipart/form-data' \
  -F 'title=title 1' \
  -F 'content=content 1' \
  -F 'image=@MainBefore.jpg;type=image/jpeg'

Response

Success - 200 OK
{
  "title": "title 1",
  "content": "content 1",
  "image_url": "/static/images/c878c56e6b3540c9a13e2dd45683f81f.jpg",
  "id": 17
}

Response Fields
| Field      | Type     | Description                            |
|------------|----------|----------------------------------------|
| title      | string   | Tiêu đề bài viết đã được cập nhật     |
| content    | string   | Nội dung bài viết đã được cập nhật    |
| image_url  | string   | Đường dẫn tới ảnh minh họa mới         |
| id         | integer  | ID bài viết được cập nhật              |

Errors

| Code | Message                     | Description                                 |
|------|-----------------------------|---------------------------------------------|
| 400  | Missing fields or bad input | Dữ liệu đầu vào không hợp lệ hoặc thiếu      |
| 401  | Invalid API key             | API-Key không hợp lệ                        |
| 404  | Blog not found              | Không tìm thấy bài viết với ID đã cung cấp  |
| 500  | Internal Server Error       | Lỗi hệ thống khi cập nhật bài viết          |

📘 API: Delete Blog Post by ID

Endpoint:
DELETE /blogs/DeleteBlog/{id}

Description:
Xóa một bài viết blog cụ thể theo ID, bao gồm cả ảnh minh họa nếu có.

Authentication:
Yêu cầu Header:
- API-Key: <string>

Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

Path Parameters:
| Param | Type     | Required | Description                     |
|-------|----------|----------|---------------------------------|
| id    | integer  | ✅       | ID của bài viết blog cần xoá   |

Ví dụ curl:
curl -X 'DELETE' \
  'http://127.0.0.1:8000/blogs/DeleteBlog/18' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

Response

Success - 200 OK
{
  "message": "Blog ID 18 và ảnh đính kèm (nếu có) đã được xóa"
}

Response Fields
| Field   | Type   | Description                                   |
|---------|--------|-----------------------------------------------|
| message | string | Thông báo kết quả xoá blog và ảnh liên quan   |

Errors

| Code | Message                   | Description                                 |
|------|---------------------------|---------------------------------------------|
| 401  | Invalid API key           | API-Key không hợp lệ                        |
| 404  | Blog not found            | Không tìm thấy bài viết với ID cung cấp     |
| 500  | Internal Server Error     | Lỗi hệ thống khi xoá bài viết               |


)

config(

---API: Get All Configurations

Endpoint:  
GET /config/getAll/

Description:  
Lấy tất cả thông tin cấu hình của hệ thống như tên website, mô tả, từ khóa SEO và logo.

🔐 Authentication:  
Yêu cầu Header:  
- API-Key: <string>

📤 Request

Headers:
| Key      | Value                |
|----------|----------------------|
| accept   | application/json     |
| API-Key  | 2605                 |

🧾 Ví dụ curl:
curl -X 'GET' \
  'http://127.0.0.1:8000/config/getAll/' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

✅ Response

Success - 200 OK
[
  {
    "idConfig": 1,
    "websiteName": "QnA Application - Ứng Dụng Tạo Câu Hỏi Trả Lời Tự Luận Tự Động - Question and Answer Application",
    "websiteDescription": "Trang web chúng tôi có thể tạo câu hỏi và câu trả lời tự động dựa trên giáo trình docx hoặc pdf",
    "websiteKeywords": "Ứng Dụng Tạo Câu Hỏi Tự Động - Website Tạo Câu Hỏi Tự Động - Ứng Dụng Tạo Câu Hỏi Và Câu Trả Lời Tự Động",
    "logo": "/9j/4AAQSkZJRgABAQEASABIAAD/2wCEAAgGBgcGBQgHB..."
  }
]

Response Fields
| Field             | Type     | Description                                 |
|------------------|----------|---------------------------------------------|
| idConfig          | integer  | ID cấu hình                                 |
| websiteName       | string   | Tên website                                 |
| websiteDescription| string   | Mô tả website                               |
| websiteKeywords   | string   | Từ khóa SEO cho website                     |
| logo              | string   | Logo dưới dạng chuỗi base64                 |

❌ Errors

| Code | Message                  | Description                                           |
|------|--------------------------|-------------------------------------------------------|
| 401  | Invalid API key          | API-Key không hợp lệ hoặc thiếu trong header         |
| 500  | Internal Server Error    | Lỗi hệ thống khi truy xuất dữ liệu cấu hình          



---API Name: Get Website Configuration

Method: GET
URL: http://127.0.0.1:8000/config/website/1
Headers:
- accept: application/json
- API-Key: 2605

---

📥 Request Example (cURL):
curl -X 'GET' \
  'http://127.0.0.1:8000/config/website/1' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'

---

📤 Response Example (Status: 200 OK):
{
  "websiteName": "QnA Application - Ứng Dụng Tạo Câu Hỏi Trả Lời Tự Luận Tự Động - Question and Answer Application",
  "websiteDescription": "Trang web chúng tôi có thể tạo câu hỏi và câu trả lời tự động dựa trên giáo trình docx hoặc pdf",
  "websiteKeywords": "Ứng Dụng Tạo Câu Hỏi Tự Động - Website Tạo Câu Hỏi Tự Động - Ứng Dụng Tạo Câu Hỏi Và Câu Trả Lời Tự Động",
  "logo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wCEAAgGBgcGBQgHB..."
}

---

📄 Response Fields:

| Field               | Type   | Description                                                                 |
|--------------------|--------|-----------------------------------------------------------------------------|
| websiteName        | string | Tên của ứng dụng hoặc website                                               |
| websiteDescription | string | Mô tả ngắn về chức năng chính của website                                  |
| websiteKeywords    | string | Các từ khóa SEO mô tả website                                               |
| logo               | string | Logo của website, định dạng Base64 image                                    |

---

🔐 Authentication:
- Yêu cầu header API-Key.
- Ví dụ: API-Key: 2605



---Update Website Configuration


Endpoint:
    PUT /config/website/{id}

URL:
    http://127.0.0.1:8000/config/website/1

Headers:
    accept: application/json
    API-Key: 2605
    Content-Type: multipart/form-data

Request Params (multipart/form-data):
    - websiteName: string
        Tên website

    - websiteDescription: string
        Mô tả website

    - websiteKeywords: string
        Từ khóa tìm kiếm (SEO keywords)

    - logo: file
        Logo website (file ảnh, ví dụ: JPG/PNG)

Success Response:
    {
        "message": "Website configuration updated successfully"
    }

CURL Example:
-------------
curl -X 'PUT' \
  'http://127.0.0.1:8000/config/website/1' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605' \
  -H 'Content-Type: multipart/form-data' \
  -F 'websiteName=QnA Application - Ứng Dụng Tạo Câu Hỏi Trả Lời Tự Luận Tự Động - Question and Answer Application' \
  -F 'websiteDescription=Trang web chúng tôi có thể tạo câu hỏi và câu trả lời tự động dựa trên giáo trình docx hoặc pdf' \
  -F 'websiteKeywords=Ứng Dụng Tạo Câu Hỏi Tự Động - Website Tạo Câu Hỏi Tự Động - Ứng Dụng Tạo Câu Hỏi Và Câu Trả Lời Tự Động' \
  -F 'logo=@magnifying-glass-with-text-questions-and-answers-and-a-question-mark-on-a-yellow-background-illustration-vector.jpg;type=image/jpeg'



---Get Contact Configuration

Endpoint:
    GET /config/contact/{id}

URL:
    http://127.0.0.1:8000/config/contact/1

Headers:
    accept: application/json
    API-Key: 2605

Request Params:
    None

Success Response:
    {
        "phoneNumber1": "123456789",
        "phoneNumber2": "987654321",
        "address": "1132/11 Nguyễn Trung Trực"
    }

CURL Example:
-------------
curl -X 'GET' \
  'http://127.0.0.1:8000/config/contact/1' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'


---Update Contact Configuration

Endpoint:
    PUT /config/contact/{id}

URL:
    http://127.0.0.1:8000/config/contact/1

Headers:
    accept: application/json
    API-Key: 2605
    Content-Type: application/json

Request Body (JSON):
    {
        "phoneNumber1": "123456789",
        "phoneNumber2": "987654321",
        "address": "1132/11 Nguyễn Trung Trực"
    }

Success Response:
    {
        "message": "Contact configuration updated successfully"
    }

CURL Example:
-------------
curl -X 'PUT' \
  'http://127.0.0.1:8000/config/contact/1' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605' \
  -H 'Content-Type: application/json' \
  -d '{
  "phoneNumber1": "123456789",
  "phoneNumber2": "987654321",
  "address": "1132/11 Nguyễn Trung Trực"
}'


---Get Social Media Configuration

Endpoint:
    GET /config/social-media/{id}

URL:
    http://127.0.0.1:8000/config/social-media/1

Headers:
    accept: application/json
    API-Key: 2605

Request Params:
    None

Success Response:
    {
        "tiktok": "tiktok1",
        "facebook": "facebook1",
        "zalo": "zalo1"
    }

CURL Example:
-------------
curl -X 'GET' \
  'http://127.0.0.1:8000/config/social-media/1' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605'


---Update Social Media Configuration

Endpoint:
    PUT /config/social-media/{id}

URL:
    http://127.0.0.1:8000/config/social-media/1

Headers:
    accept: application/json
    API-Key: 2605
    Content-Type: application/json

Request Body (JSON):
    {
        "tiktok": "tiktok2",
        "facebook": "facebook2",
        "zalo": "zalo2"
    }

Success Response:
    {
        "message": "Social media configuration updated successfully"
    }

CURL Example:
-------------
curl -X 'PUT' \
  'http://127.0.0.1:8000/config/social-media/1' \
  -H 'accept: application/json' \
  -H 'API-Key: 2605' \
  -H 'Content-Type: application/json' \
  -d '{
  "tiktok": "tiktok2",
  "facebook": "facebook2",
  "zalo": "zalo2"
}'
)