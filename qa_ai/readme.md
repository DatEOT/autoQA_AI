# 📚 Tự Động Tạo Câu Hỏi/Trả Lời Dựa Trên Giáo Trình Bằng AI

Dự án này sử dụng trí tuệ nhân tạo để tự động tạo các câu hỏi và câu trả lời từ giáo trình (pdf,docx,txt) đầu vào. Hệ thống hỗ trợ phân loại câu hỏi theo cấp độ tư duy Bloom và xuất kết quả theo định dạng có thể tải xuống.

---

## 💡 Mục Tiêu Đề Tài

- Tự động sinh câu hỏi/trả lời theo từng cấp độ nhận thức.
- Trích xuất thông tin từ giáo trình (file pdf,docx,txt).
- Tạo câu hỏi phù hợp cho thi cử, kiểm tra, luyện tập.
- Cung cấp định dạng tải xuống đơn giản và định dạng docx,pdf chuẩn.

---

## 🧰 Công Nghệ Sử Dụng

- **Ngôn ngữ Backend:** Python
- **Framework:** FastAPI
- **Xử lý AI:** OpenAI GPT (hỗ trợ nhiều biến thể: `gpt-4o-mini`, `gpt-4`, ...)
- **Phân tích tài liệu:** PyMuPDF, LangChain
- **Quản lý phân quyền:** Bearer Token + API Key
- **Hệ thống phân cấp Bloom:** Cấp độ 1 → 6

---

## 📦 Cài Đặt Dự Án

```bash
# 1. Clone dự án
git clone https://github.com/DatEOT/autoQA_AI.git
cd autoQA_AI (Folder cha chứa 2 folder con là backend và frontend)
cd qa_ai (backend)

# 2. Tạo virtual environment và kích hoạt
python -m venv myproject_env
myproject_env\Scripts\activate

# 3. Cài đặt dependencies
pip install -r requirements.txt

```

---

## 🚀 Khởi Chạy Server

python run_api.py

---

## 📌Ghi Chú

Cần token hợp lệ và API Key khi sử dụng.
Hệ thống hỗ trợ tiếng Việt.
Tập trung vào giáo dục đại học, phổ thông.

---

## 🧑‍💻Tác Giả

Nguyễn Thành Đạt (ĐạtEOT)
📧 Email: thanhdat5699636@gmail.com
🌐 GitHub: github.com/DatEOT
