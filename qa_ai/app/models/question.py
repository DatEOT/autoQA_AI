from pydantic import BaseModel, Field
from typing import List, Dict, Any


# Input: Yêu cầu từ người dùng
class QuestionRequest(BaseModel):
    provider: str
    model_variant: str
    num_questions: int = Field(..., ge=1, description="Tổng số câu hỏi cần tạo")
    level_1: int = Field(..., ge=0, description="Số câu hỏi cấp độ 1")
    level_2: int = Field(..., ge=0, description="Số câu hỏi cấp độ 2")
    level_3: int = Field(..., ge=0, description="Số câu hỏi cấp độ 3")
    level_4: int = Field(..., ge=0, description="Số câu hỏi cấp độ 4")
    level_5: int = Field(..., ge=0, description="Số câu hỏi cấp độ 5")
    level_6: int = Field(..., ge=0, description="Số câu hỏi cấp độ 6")


# Output: Kết quả tổng thể
class FileResponseModel(BaseModel):
    file_id: str = Field(..., description="ID của file")
    original_filename: str = Field(..., description="Tên file gốc")
    num_segments: int = Field(..., description="Số đoạn trong file")
    formatted_docx_download_url: str = Field(
        ..., description="Đường dẫn file định dạng đầy đủ (.docx)"
    )
    simple_docx_download_url: str = Field(
        ..., description="Đường dẫn file chỉ chứa câu hỏi (.docx)"
    )
    questions_and_answers: List[Dict[str, Any]] = Field(
        ..., description="Danh sách câu hỏi và đáp án từ tất cả các đoạn"
    )


# Output: Nội dung câu hỏi và câu trả lời theo các cấp độ Bloom
class QAResponse(BaseModel):
    bloom_assignment: str = Field(..., description="Phân bổ cấp độ Bloom")
    qa_results: List[Dict[str, Any]] = Field(
        ...,
        description=(
            "Danh sách kết quả Q&A, mỗi phần tử là dict có dạng: "
            '{"level": <tên cấp độ>, "questions": {<câu hỏi>: <đáp án>, ...}}'
        ),
    )
