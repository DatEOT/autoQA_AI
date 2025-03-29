from pydantic import BaseModel, Field
from typing import List


# Input: Yêu cầu từ người dùng
class QuestionRequest(BaseModel):
    num_questions: int = Field(..., ge=1, description="Tổng số câu hỏi cần tạo")
    level_1: int = Field(..., ge=0, description="Số câu hỏi cấp độ 1")
    level_2: int = Field(..., ge=0, description="Số câu hỏi cấp độ 2")
    level_3: int = Field(..., ge=0, description="Số câu hỏi cấp độ 3")
    level_4: int = Field(..., ge=0, description="Số câu hỏi cấp độ 4")
    level_5: int = Field(..., ge=0, description="Số câu hỏi cấp độ 5")
    level_6: int = Field(..., ge=0, description="Số câu hỏi cấp độ 6")


# Output: Kết quả tổng thể
class FileResponse(BaseModel):
    file_id: str = Field(..., description="ID của file")
    original_filename: str = Field(..., description="Tên file gốc")
    num_segments: int = Field(
        ..., description="Số đoạn trong file"
    )  # Đổi từ num_chapters thành num_segments
    txt_file_path: str = Field(..., description="Đường dẫn file .txt")
    questions_and_answers: List[str] = Field(
        ..., description="Danh sách câu hỏi và đáp án từ tất cả các đoạn"
    )
