from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import List, Tuple
from uuid import uuid4
from pathlib import Path
import io
import zipfile
import logging
import pymysql
from chatbot.utils.file_utils import extract_segments_with_pages
from app.models.question import QuestionRequest, FileResponseModel, QAResponse
from chatbot.utils.create_docx import (
    create_formatted_docx_file,
    create_simple_docx_file,
)
from ingestion.ingestion import Ingestion
from app.utils.mysql_connection import get_db
from app.security.dependency import get_current_user_id
from app.security.security import get_api_key

from chatbot.utils.file_utils import save_uploaded_file, extract_text_from_file
from chatbot.utils.validation_utils import (
    validate_request,
    get_bloom_level_name,
    generate_bloom_assignment,
)
from chatbot.utils.db_utils import (
    deduct_token_and_log_transaction,
    insert_question_history,
)
from chatbot.utils.bloom_keywords import BLOOM_KEYWORDS
from chatbot.services.bloom_generator import BloomGenerator

from docx2pdf import convert

router = APIRouter(prefix="/questions", tags=["questions"])

TXT_DIR = Path("txt")
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
TXT_DIR.mkdir(exist_ok=True)


def generate_qa_content(
    segments: List[Tuple[str, str]], request: QuestionRequest
) -> QAResponse:
    bloom_assignment, segments_per_level = generate_bloom_assignment(segments, request)
    # #Kiểm tra phân bổ đoạn văn theo từng cấp độ
    # print("\nKIỂM TRA PHÂN BỔ ĐOẠN VĂN:")
    # level_question_counts = [
    #     request.level_1,
    #     request.level_2,
    #     request.level_3,
    #     request.level_4,
    #     request.level_5,
    #     request.level_6,
    # ]
    # for i in range(6):
    #     print(
    #         f"🔹 Cấp độ {i+1}: {level_question_counts[i]} câu hỏi → {segments_per_level[i]} đoạn văn"
    #     )
    # print(f" Tổng đoạn văn: {len(segments)}")
    # print(f" Tổng câu hỏi: {sum(level_question_counts)}")
    # print(f" Tổng đoạn đã phân bổ: {sum(segments_per_level)}\n")

    qa_results = []
    bloom_gen = BloomGenerator(llm_name="openai")

    idx = 0
    global_question_index = 1
    for level, num_segments in enumerate(segments_per_level, start=1):
        if num_segments == 0:
            continue

        level_segments = segments[idx : idx + num_segments]
        idx += num_segments

        level_name = get_bloom_level_name(level)
        bloom_keywords = BLOOM_KEYWORDS.get(level, "")

        num_questions = getattr(request, f"level_{level}")
        segments_with_keywords = [
            (label, text, bloom_keywords, page)
            for (label, text, page) in level_segments
        ]

        qas = bloom_gen.generate_questions_for_level(
            level,
            segments_with_keywords,
            num_questions,
            level_name,
            bloom_keywords,
            start_index=global_question_index,
        )
        global_question_index += len(qas)

        answers = bloom_gen.generate_answers_for_pairs(qas)

        qa_results.append(
            {
                "level": f"Cấp độ {level} - {level_name}",
                "questions": answers,
            }
        )

    return QAResponse(
        bloom_assignment="\n".join(bloom_assignment), qa_results=qa_results
    )


@router.get("/download/zip/{file_id}", response_class=StreamingResponse)
def download_zip(file_id: str):
    """
    Tải file ZIP chứa cả 2 DOCX và 2 PDF.
    """
    from pathlib import Path

    formatted_docx_file = TXT_DIR / f"{file_id}_formatted.docx"
    simple_docx_file = TXT_DIR / f"{file_id}_simple.docx"
    formatted_pdf_file = TXT_DIR / f"{file_id}_formatted.pdf"
    simple_pdf_file = TXT_DIR / f"{file_id}_simple.pdf"

    for file_path in [
        formatted_docx_file,
        simple_docx_file,
        formatted_pdf_file,
        simple_pdf_file,
    ]:
        if not file_path.exists():
            raise HTTPException(
                status_code=404, detail=f"File {file_path.name} không tồn tại."
            )

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(formatted_docx_file, arcname=f"{file_id}_formatted.docx")
        zipf.write(simple_docx_file, arcname=f"{file_id}_simple.docx")
        zipf.write(formatted_pdf_file, arcname=f"{file_id}_formatted.pdf")
        zipf.write(simple_pdf_file, arcname=f"{file_id}_simple.pdf")
    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={file_id}_files.zip"},
    )


@router.post("/generate", response_model=FileResponseModel)
async def generate_questions(
    file: UploadFile = File(...),
    exam_subject: str = Form(...),
    exam_duration: str = Form(...),
    num_questions: int = Form(..., ge=1),
    level_1: int = Form(..., ge=0),
    level_2: int = Form(..., ge=0),
    level_3: int = Form(..., ge=0),
    level_4: int = Form(..., ge=0),
    level_5: int = Form(..., ge=0),
    level_6: int = Form(..., ge=0),
    api_key: str = get_api_key,
    db: pymysql.connections.Connection = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    try:
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in ["docx", "pdf", "txt"]:
            raise HTTPException(status_code=400, detail="Chỉ hỗ trợ docx, pdf, txt")

        request = QuestionRequest(
            num_questions=num_questions,
            level_1=level_1,
            level_2=level_2,
            level_3=level_3,
            level_4=level_4,
            level_5=level_5,
            level_6=level_6,
        )
        validate_request(request)

        file_id = str(uuid4())
        file_path = save_uploaded_file(file, file_id, UPLOAD_DIR)

        if file_extension == "pdf":
            segments = extract_segments_with_pages(file_path, chunk_size=2000)
        else:
            extracted_text, metadata = extract_text_from_file(file_path, file_extension)

            txt_path = TXT_DIR / f"{file_id}_extracted.txt"
            txt_path.write_text(extracted_text, encoding="utf-8")

            ingestion = Ingestion(embedding_model_name="openai")
            docs = ingestion.process_txt(str(txt_path), chunk_size=2000)

            segments = []
            for i, doc in enumerate(docs):
                segments.append(
                    (i + 1, doc.page_content.strip(), None)
                )  # không có số trang cho docx, txt

        if not segments:
            raise HTTPException(
                status_code=400, detail="File không có nội dung để xử lý."
            )

        level_counts = [level_1, level_2, level_3, level_4, level_5, level_6]
        if len(segments) < sum(1 for lv in level_counts if lv > 0):
            raise HTTPException(
                status_code=400,
                detail=f"Số đoạn văn ({len(segments)}) không đủ để tạo số cấp độ khác nhau.",
            )

        deduct_token_and_log_transaction(db, current_user_id, cost=10)

        qa_result = generate_qa_content(segments, request)

        formatted_docx_path = TXT_DIR / f"{file_id}_formatted.docx"
        simple_docx_path = TXT_DIR / f"{file_id}_simple.docx"
        formatted_pdf_path = TXT_DIR / f"{file_id}_formatted.pdf"
        simple_pdf_path = TXT_DIR / f"{file_id}_simple.pdf"

        create_formatted_docx_file(
            qa_result, formatted_docx_path, exam_subject, exam_duration
        )
        create_simple_docx_file(
            qa_result, simple_docx_path, exam_subject, exam_duration
        )
        convert(str(formatted_docx_path), str(formatted_pdf_path))
        convert(str(simple_docx_path), str(simple_pdf_path))

        insert_question_history(db, current_user_id, num_questions)

        return FileResponseModel(
            file_id=file_id,
            original_filename=file.filename,
            num_segments=len(segments),
            formatted_docx_download_url=f"/questions/download/formatted/{file_id}",
            simple_docx_download_url=f"/questions/download/simple/{file_id}",
            questions_and_answers=qa_result.qa_results,
        )

    except HTTPException:
        raise
    except Exception as e:
        logging.exception(f"Lỗi không xác định: {e}")
        raise HTTPException(status_code=500, detail="Lỗi không xác định")
