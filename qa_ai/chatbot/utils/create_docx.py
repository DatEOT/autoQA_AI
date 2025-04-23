from pathlib import Path
from app.models.question import QAResponse
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from fastapi import HTTPException
import re


def create_formatted_docx_file(
    qa_result: QAResponse, docx_file_path: Path, exam_subject: str, exam_duration: str
) -> None:
    doc = Document()

    # -- Thiết lập font chữ mặc định --
    style = doc.styles["Normal"]
    font = style.font
    font.name = "Times New Roman"
    font.size = Pt(12)

    # ------------------- PHẦN TIÊU ĐỀ -------------------
    title_paragraph = doc.add_paragraph()
    title_run = title_paragraph.add_run("ĐỀ THI TỰ LUẬN")
    title_run.bold = True
    title_run.font.size = Pt(14)
    title_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # ------------------- THÔNG TIN MÔN THI & THỜI GIAN -------------------
    info_paragraph = doc.add_paragraph()
    info_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    info_run = info_paragraph.add_run(
        f"Môn thi: {exam_subject}\nThời gian làm bài: {exam_duration}"
    )
    info_run.bold = True
    info_run.font.size = Pt(12)

    # ------------------- HƯỚNG DẪN -------------------
    guide_paragraph = doc.add_paragraph()
    guide_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    guide_run = guide_paragraph.add_run("(Thí sinh không được phép sử dụng tài liệu)")
    guide_run.italic = True
    guide_run.font.size = Pt(11)

    # Dòng trống ngăn cách
    doc.add_paragraph("")

    # ------------------- PHÂN BỔ CẤP ĐỘ BLOOM -------------------
    doc.add_heading("PHÂN BỔ CẤP ĐỘ BLOOM:", level=1)
    doc.add_paragraph(qa_result.bloom_assignment)

    # Xác định số cấp độ hiện có
    num_levels = len(qa_result.qa_results)
    if num_levels == 6:
        percentages = [0.10, 0.15, 0.20, 0.20, 0.20, 0.15]
    else:
        if num_levels < 2:
            raise HTTPException(status_code=500, detail="Phải có ít nhất 2 cấp độ")
        percentages = [0.10] + [0.90 / (num_levels - 1)] * (num_levels - 1)

    # ------------------- CÂU HỎI VÀ CÂU TRẢ LỜI -------------------
    doc.add_heading("CÂU HỎI VÀ CÂU TRẢ LỜI:", level=1)
    question_counter = 1

    # Lặp qua từng cấp độ Bloom (theo thứ tự từ thấp đến cao)
    for level_idx, level_result in enumerate(qa_result.qa_results):
        # Heading cho cấp độ Bloom (ví dụ: "Cấp độ 1 - Nhớ")
        doc.add_heading(level_result["level"], level=2)
        questions_dict = level_result["questions"]
        num_questions = len(questions_dict)

        # Tổng điểm cho cấp (ví dụ: nếu 6 cấp và cấp 1 thì 10% của 10 = 1.0 điểm)
        level_total_points = percentages[level_idx] * 10

        # Phân chia điểm cho từng câu trong cấp, làm tròn đến bội số 0.05
        points_alloc = []
        if num_questions > 0:
            # Tính điểm cho từng câu (cho tất cả các câu trừ câu cuối cùng)
            for i in range(num_questions - 1):
                raw = level_total_points / num_questions
                nice = round(raw * 20) / 20  # làm tròn đến 0.05
                points_alloc.append(nice)
            sum_so_far = sum(points_alloc)
            last_point = level_total_points - sum_so_far
            last_nice = round(last_point * 20) / 20
            points_alloc.append(last_nice)
        else:
            points_alloc = []

        # Lặp qua từng câu hỏi, dùng chỉ số cục bộ để truy cập points_alloc
        for idx, (question, answer) in enumerate(questions_dict.items()):
            para_question = doc.add_paragraph()
            run_question_title = para_question.add_run(f"Câu {question_counter}: ")
            run_question_title.bold = True

            run_question_text = para_question.add_run(clean_markdown_bold(question))
            run_question_text.font.bold = False

            run_points = para_question.add_run(f" ({points_alloc[idx]} điểm)")
            run_points.bold = True

            para_answer_title = doc.add_paragraph()
            run_answer_title = para_answer_title.add_run("Trả lời: ")
            run_answer_title.bold = True

            para_answer_content = doc.add_paragraph(clean_markdown_bold(answer))
            para_answer_content.left_indent = Inches(0.5)

            question_counter += 1

    doc.save(docx_file_path)


def create_simple_docx_file(
    qa_result: QAResponse, docx_file_path: Path, exam_subject: str, exam_duration: str
) -> None:
    """
    Tạo file DOCX đơn giản chỉ chứa phần header và danh sách câu hỏi với điểm,
    sử dụng cơ chế phân bố điểm giống như create_formatted_docx_file.
    """
    doc = Document()

    # ------------------- PHẦN HEADER -------------------
    title_paragraph = doc.add_paragraph()
    title_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_paragraph.add_run("ĐỀ THI TỰ LUẬN")
    title_run.bold = True
    title_run.font.size = Pt(14)

    info_paragraph = doc.add_paragraph()
    info_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    info_run = info_paragraph.add_run(
        f"Môn thi: {exam_subject}\nThời gian làm bài: {exam_duration}"
    )
    info_run.bold = True
    info_run.font.size = Pt(12)

    guide_paragraph = doc.add_paragraph()
    guide_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    guide_run = guide_paragraph.add_run("(Thí sinh không được phép sử dụng tài liệu)")
    guide_run.italic = True
    guide_run.font.size = Pt(11)

    doc.add_paragraph("")

    # Xác định số cấp độ
    num_levels = len(qa_result.qa_results)
    if num_levels == 6:
        percentages = [0.10, 0.15, 0.20, 0.20, 0.20, 0.15]
    else:
        if num_levels < 2:
            raise HTTPException(status_code=500, detail="Phải có ít nhất 2 cấp độ")
        percentages = [0.10] + [0.90 / (num_levels - 1)] * (num_levels - 1)

    # Tính toán và phân phối điểm cho từng câu hỏi
    question_counter = 1

    for level_idx, level_result in enumerate(qa_result.qa_results):
        questions_dict = level_result["questions"]
        num_questions = len(questions_dict)
        level_total_points = percentages[level_idx] * 10

        points_alloc = []
        if num_questions > 0:
            for i in range(num_questions - 1):
                raw = level_total_points / num_questions
                nice = round(raw * 20) / 20
                points_alloc.append(nice)
            sum_so_far = sum(points_alloc)
            last_point = level_total_points - sum_so_far
            last_nice = round(last_point * 20) / 20
            points_alloc.append(last_nice)
        else:
            points_alloc = []

        for idx, (question, _) in enumerate(questions_dict.items()):
            para = doc.add_paragraph()
            para.add_run(
                f"Câu {question_counter}: {question} ({points_alloc[idx]} điểm)"
            )
            question_counter += 1

    doc.save(docx_file_path)


def clean_markdown_bold(text: str) -> str:
    return re.sub(r"\*\*(.*?)\*\*", r"\1", text)
