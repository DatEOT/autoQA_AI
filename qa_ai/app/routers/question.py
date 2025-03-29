import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.models.question import QuestionRequest, FileResponse
from docx import Document
import PyPDF2
from uuid import uuid4
import openai
from dotenv import load_dotenv
import httpx
from app.security.security import get_api_key
from app.utils.ingestion import Ingestion

# Tải biến môi trường
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("API key không được tìm thấy trong biến môi trường")

client = openai.OpenAI(api_key=OPENAI_API_KEY, http_client=httpx.Client())

router = APIRouter(prefix="/questions", tags=["questions"])

UPLOAD_DIR, TXT_DIR = "qa_ai/uploads", "qa_ai/txt"

if os.path.exists("qa_ai"):  # Kiểm tra nếu thư mục qa_ai đã tồn tại
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(TXT_DIR, exist_ok=True)


def save_uploaded_file(file: UploadFile, file_id: str) -> str:
    """Lưu file tải lên và trả về đường dẫn."""
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
    return file_path


def generate_questions_with_openai(segments: list, request: QuestionRequest) -> str:
    """Gọi GPT-4o-mini để tạo câu hỏi và đáp án theo thang Bloom với từ khóa từng cấp độ."""
    bloom_keywords = {
        "Cấp độ 1 - Nhớ": "dán nhãn, định nghĩa, đọc, gọi tên, lặp lại, nghe hiểu, nhắc lại, nhận biết, nhận dạng, nhận diện, nhận ra, tìm ra, nối kết điểm phù hợp, nêu rõ, chép lại, sắp xếp, sắp xếp theo thứ tự, kể lại, tóm tắt lại, trích dẫn, nêu ra, trình bày đại ý, ghi nhớ, mô tả, liệt kê, kể tên, ghi lại, đọc lại, thuật lại, tìm câu trả lời, kể lại, nhắc lại, xác định, tìm, chọn, sao chép, lặp lại chính xác, lập bảng, mô phỏng, sao chép, kể, làm theo, tưởng tượng, hình dung, loại bỏ, xem xét, kiểm tra chi tiết, tìm câu trả lời",
        "Cấp độ 2 - Hiểu": "giải thích, diễn giải, tóm tắt, so sánh, phân biệt, hỏi, đặt vấn đề, liên hệ, trích dẫn, tìm xuất xứ, phân loại, tính toán, ước tính, so sánh, đối chiếu, chuyển đổi, xác định, nhận dạng, chỉ ra, suy ra, phỏng đoán, đánh giá, nhận định, xác định, định vị, sắp xếp thứ tự, mô tả, khám phá, tìm ra, phát hiện, trình bày & phân tích, thảo luận, nhận biết, ước lượng, đánh giá, phán đoán, dự đoán, thể hiện, trình bày, diễn đạt, mở rộng, khái quát hóa, tổng hợp, đưa ra, nêu ví dụ, phân nhóm, sắp xếp theo nhóm, nhận diện, báo cáo, nghiên cứu, tìm, trình bày lại, nhắc lại, xem lại, viết lại, lựa chọn, tóm lược, phát hiện, chỉ ra (nguồn gốc), tìm xuất xứ, diễn dịch, dịch ra, chuyển sang, chuyển ngữ",
        "Cấp độ 3 - Áp dụng": "áp dụng, sử dụng, thực hiện, minh họa, tính toán, vận dụng, điều khiển, xử lý, thêm vào, sửa đổi, điều chỉnh, thay đổi, vận hành, chọn lựa, chọn lọc, lựa chọn, thực hành, phân loại, phân loại chủ đề, ước lượng, dự đoán, dự báo, hoàn thành, chuẩn bị, ước tính, tạo ra, xây dựng, liên hệ kiến thức, thuyết minh, chứng minh, giải thích, biểu diễn, lập kế hoạch, soạn/viết thành kịch bản, biên kịch, chỉ ra, nêu ra, phác họa, giải quyết, khái quát hóa, tổng quát hóa, loại trừ, sơ đồ hóa, thể hiện đồ thị, vẽ biểu đồ, thêm thông tin, chia nhỏ, diễn giải, làm sáng tỏ, dịch, liệt kê, đánh giá, nhận định, mô tả (âm thanh...)",
        "Cấp độ 4 - Phân tích": "phân tích, phân loại, đánh giá, xác định, so sánh chi tiết, sắp xếp, chia nhỏ, phân nhỏ, tách nhỏ ra, tính toán, phạm trù hóa, phân nhóm, thay đổi, lựa chọn, kết hợp, so sánh, ước tính, so sánh đối chiếu, phản biện, phê bình, minh họa, bình luận, chứng minh, giải thích, thiết kế, phân biệt, khu biệt, khám phá, tìm ra, phát hiện, soạn/viết thành kịch bản, xem xét, kiểm tra, thử nghiệm, suy luận, điều hành, vận dụng, xử lý, mô hình hóa, điều chỉnh, sửa đổi, vận hành, điều hành, lập dàn ý, nêu đại ý, phác thảo, phát hiện, nhận ra, chỉ ra, phát triển, thực hiện, thực hành, thể hiện đồ thị, sơ đồ hóa, ước đoán, dự đoán, dự báo, đặt câu hỏi, đặt vấn đề, tạo ra, chế tạo, sắp xếp kế hoạch, liên hệ, tách ra, khảo sát, phân chia, kiểm tra, thử nghiệm",
        "Cấp độ 5 - Đánh giá": "đánh giá, phê bình, biện minh, bảo vệ, đưa ra ý kiến, thẩm định, sắp xếp, thu thập, tập hợp lại, phối hợp, phân loại, phân chia, kết nối, so sánh, kết hợp, sáng tác, kết luận, xây dựng, tạo ra, tranh luận, xét đoán, phát triển, thiết kế, xác lập công thức, suy ra, đặt vấn đề, đặt giả thiết, nhận định, điều chỉnh, chuẩn bị, sắp xếp lại, xây dựng lại, lặp lại, liên hệ (tổng hợp), tái cấu trúc, ra soát, xem xét lại, sửa lại, viết lại, thiết lập, lập (kế hoạch, mô hình…), tổng kết, tóm tắt, cho ý kiến, định giá, cân nhắc, xem xét cẩn thận, viết (báo cáo, dự thảo…), tổ chức, sắp xếp theo hệ thống",
        "Cấp độ 6 - Sáng tạo": "thiết kế, sáng tạo, xây dựng, phát triển, đề xuất, tranh luận, biện luận, kết hợp, sáng tác, lập, thiết lập, tích hợp, diễn dịch, diễn giải, tìm ra, phát minh ra, làm ra, đối chiếu, lập kế hoạch, tạo ra, chế tạo, đưa ra, đặt ra, phê bình, bình luận, tổng hợp, ước lượng, biến đổi, sáng chế, đề nghị",
    }

    # Chuẩn bị nội dung prompt với tất cả các đoạn văn
    segment_texts = "\n".join(
        [f'- Đoạn văn {i+1}: "{text}"' for i, (_, text) in enumerate(segments)]
    )

    # Tạo prompt yêu cầu GPT phân bổ số câu hỏi theo cấp độ, mỗi đoạn chỉ có 1 cấp độ
    prompt = f"""
    Dựa trên các đoạn văn bản sau:
    {segment_texts}
    - ...

    Hãy thực hiện các bước sau:
    1. Xác định mỗi đoạn văn thuộc cấp độ nào trong thang Bloom (Cấp độ 1 - Nhớ, Cấp độ 2 - Hiểu, Cấp độ 3 - Áp dụng, Cấp độ 4 - Phân tích, Cấp độ 5 - Đánh giá, hoặc Cấp độ 6 - Sáng tạo) dựa trên nội dung của đoạn văn. Mỗi đoạn văn chỉ được gán MỘT cấp độ Bloom duy nhất.
    2. Tạo tổng cộng {request.num_questions} câu hỏi tự luận, phân bổ như sau:
       - Cấp độ 1 (Nhớ - sử dụng từ khóa: {bloom_keywords["Cấp độ 1 - Nhớ"]}): {request.level_1} câu
       - Cấp độ 2 (Hiểu - sử dụng từ khóa: {bloom_keywords["Cấp độ 2 - Hiểu"]}): {request.level_2} câu
       - Cấp độ 3 (Áp dụng - sử dụng từ khóa: {bloom_keywords["Cấp độ 3 - Áp dụng"]}): {request.level_3} câu
       - Cấp độ 4 (Phân tích - sử dụng từ khóa: {bloom_keywords["Cấp độ 4 - Phân tích"]}): {request.level_4} câu
       - Cấp độ 5 (Đánh giá - sử dụng từ khóa: {bloom_keywords["Cấp độ 5 - Đánh giá"]}): {request.level_5} câu
       - Cấp độ 6 (Sáng tạo - sử dụng từ khóa: {bloom_keywords["Cấp độ 6 - Sáng tạo"]}): {request.level_6} câu
    3. Phân bổ số câu hỏi cho từng đoạn văn sao cho:
       - Tổng số câu hỏi là {request.num_questions}.
       - Mỗi đoạn văn chỉ có câu hỏi thuộc cấp độ Bloom đã xác định cho đoạn đó.
       - Ưu tiên phân bổ các câu hỏi theo thứ tự cấp độ từ thấp đến cao (Cấp độ 1 -> Cấp độ 6) và theo thứ tự đoạn văn (Đoạn 1 -> Đoạn 2 -> ...).
    4. Cung cấp câu trả lời ngắn gọn cho mỗi câu hỏi.

    Định dạng kết quả:
    Đoạn văn 1: Cấp độ [X]
    Câu hỏi 1: [Nội dung câu hỏi]
    Trả lời: [Nội dung đáp án]
    Câu hỏi 2: [Nội dung câu hỏi]
    Trả lời: [Nội dung đáp án]
    ...

    Đoạn văn 2: Cấp độ [X]
    Câu hỏi 1: [Nội dung câu hỏi]
    Trả lời: [Nội dung đáp án]
    Câu hỏi 2: [Nội dung câu hỏi]
    Trả lời: [Nội dung đáp án]
    ...
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()


@router.post("/generate", response_model=FileResponse)
async def generate_questions(
    file: UploadFile = File(...),
    num_questions: int = Form(..., ge=1),
    level_1: int = Form(..., ge=0),
    level_2: int = Form(..., ge=0),
    level_3: int = Form(..., ge=0),
    level_4: int = Form(..., ge=0),
    level_5: int = Form(..., ge=0),
    level_6: int = Form(..., ge=0),
    api_key: str = get_api_key,
):
    # Chuẩn hóa input với QuestionRequest
    request = QuestionRequest(
        num_questions=num_questions,
        level_1=level_1,
        level_2=level_2,
        level_3=level_3,
        level_4=level_4,
        level_5=level_5,
        level_6=level_6,
    )

    total_levels = level_1 + level_2 + level_3 + level_4 + level_5 + level_6
    if total_levels != num_questions:
        raise HTTPException(
            status_code=400,
            detail=f"Tổng số câu hỏi theo cấp độ ({total_levels}) không khớp với num_questions ({num_questions})",
        )

    # Đếm số cấp độ khác 0 và xác định cấp độ cao nhất không thể phân bổ
    level_counts = [
        ("Cấp độ 1", level_1),
        ("Cấp độ 2", level_2),
        ("Cấp độ 3", level_3),
        ("Cấp độ 4", level_4),
        ("Cấp độ 5", level_5),
        ("Cấp độ 6", level_6),
    ]
    num_distinct_levels = sum(1 for _, count in level_counts if count > 0)
    highest_unassignable_level = None
    for level_name, count in reversed(level_counts):
        if count > 0:
            highest_unassignable_level = level_name
            break

    # Lấy đuôi file
    file_extension = file.filename.rsplit(".", 1)[-1].lower()
    if file_extension not in ["docx", "pdf", "txt"]:
        raise HTTPException(
            status_code=400,
            detail="Loại file không hợp lệ: chỉ hỗ trợ .docx, .pdf hoặc .txt",
        )

    # Lưu file tải lên
    file_id = str(uuid4())
    file_path = save_uploaded_file(file, file_id)

    # Trích xuất text từ .docx hoặc .pdf nếu cần
    if file_extension in ["docx", "pdf"]:
        extracted_text = ""
        if file_extension == "docx":
            doc = Document(file_path)
            extracted_text = "\n".join(
                [para.text.strip() for para in doc.paragraphs if para.text.strip()]
            )
        elif file_extension == "pdf":
            with open(file_path, "rb") as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)
                texts = []
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        texts.append(text.strip())
                extracted_text = "\n".join(texts)
        text_file_path = os.path.join(TXT_DIR, f"{file_id}_extracted.txt")
        with open(text_file_path, "w", encoding="utf-8") as f:
            f.write(extracted_text)
    else:
        text_file_path = file_path

    # Chia nhỏ nội dung thành các đoạn với chunk_size=2000
    ingestion_instance = Ingestion(embedding_model_name="openai")
    docs = ingestion_instance.process_txt(text_file_path, chunk_size=2000)
    segments = [(f"Đoạn {i+1}", doc.page_content) for i, doc in enumerate(docs)]

    if not segments:
        raise HTTPException(status_code=400, detail="File không có nội dung để xử lý.")

    # Kiểm tra số đoạn văn có đủ để phân bổ cho số cấp độ khác nhau không
    if len(segments) < num_distinct_levels:
        raise HTTPException(
            status_code=400,
            detail=f"{highest_unassignable_level}: Vì văn bản trong file này quá ít nên không thể tạo {highest_unassignable_level.lower()}.",
        )

    # Tạo câu hỏi cho tất cả các đoạn cùng lúc
    qa_result = generate_questions_with_openai(segments, request)

    # Lưu kết quả vào file txt
    txt_path = os.path.join(TXT_DIR, f"{file_id}.txt")
    with open(txt_path, "w", encoding="utf-8") as txt_file:
        txt_file.write(qa_result)

    return FileResponse(
        file_id=file_id,
        original_filename=file.filename,
        num_segments=len(segments),
        txt_file_path=txt_path,
        questions_and_answers=[qa_result],
    )
