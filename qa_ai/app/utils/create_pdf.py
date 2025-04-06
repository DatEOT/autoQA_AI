from pathlib import Path
from app.models.question import QAResponse
from fastapi import HTTPException
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT


def create_formatted_pdf_file(
    qa_result: QAResponse, pdf_file_path: Path, exam_subject: str, exam_duration: str
) -> None:
    """
    Tạo file PDF với định dạng:
      - Tiêu đề: "ĐỀ THI TỰ LUẬN"
      - Thông tin môn thi và thời gian làm bài (căn giữa, in đậm)
      - Hướng dẫn: "(Thí sinh không được phép sử dụng tài liệu)" (in nghiêng, căn giữa)
      - Phân bố điểm cho mỗi cấp độ Bloom với cơ chế:
            Nếu có 6 cấp: [10%, 15%, 20%, 20%, 20%, 15%]
            Nếu khác: cấp 1 luôn 10% và các cấp còn lại chia đều 90%.
        => Tổng điểm là 10.
        Và phân chia đều số điểm cho từng câu hỏi của mỗi cấp,
        làm tròn đến bội số của 0.05.
      - Danh sách câu hỏi (theo cấp độ Bloom) kèm đáp án.
    """
    doc = SimpleDocTemplate(
        str(pdf_file_path),
        pagesize=A4,
        rightMargin=inch / 2,
        leftMargin=inch / 2,
        topMargin=inch,
        bottomMargin=inch,
    )

    styles = getSampleStyleSheet()
    # Tùy chỉnh style
    title_style = ParagraphStyle(
        name="TitleStyle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontName="Times-Roman",
        fontSize=14,
        leading=16,
        spaceAfter=12,
    )
    info_style = ParagraphStyle(
        name="InfoStyle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontName="Times-Roman",
        fontSize=12,
        leading=14,
        spaceAfter=12,
    )
    guide_style = ParagraphStyle(
        name="GuideStyle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontName="Times-Roman",
        fontSize=11,
        leading=13,
        spaceAfter=12,
    )
    heading1_style = ParagraphStyle(
        name="Heading1Style",
        parent=styles["Heading1"],
        alignment=TA_LEFT,
        fontName="Times-Bold",
        fontSize=12,
        leading=14,
        spaceBefore=12,
        spaceAfter=6,
    )
    heading2_style = ParagraphStyle(
        name="Heading2Style",
        parent=styles["Heading2"],
        alignment=TA_LEFT,
        fontName="Times-Bold",
        fontSize=11,
        leading=13,
        spaceBefore=8,
        spaceAfter=4,
    )
    question_style = ParagraphStyle(
        name="QuestionStyle",
        parent=styles["Normal"],
        alignment=TA_LEFT,
        fontName="Times-Roman",
        fontSize=11,
        leading=13,
        spaceAfter=4,
    )
    answer_label_style = ParagraphStyle(
        name="AnswerLabelStyle",
        parent=styles["Normal"],
        alignment=TA_LEFT,
        fontName="Times-Bold",
        fontSize=11,
        leading=13,
        spaceAfter=2,
    )
    answer_style = ParagraphStyle(
        name="AnswerStyle",
        parent=styles["Normal"],
        alignment=TA_LEFT,
        leftIndent=20,
        fontName="Times-Roman",
        fontSize=11,
        leading=13,
        spaceAfter=8,
    )

    story = []
    # ------------------- PHẦN TIÊU ĐỀ -------------------
    story.append(Paragraph("<b>ĐỀ THI TỰ LUẬN</b>", title_style))
    # ------------------- THÔNG TIN MÔN THI & THỜI GIAN -------------------
    info_text = f"<b>Môn thi: {exam_subject}<br/>Thời gian làm bài: {exam_duration}</b>"
    story.append(Paragraph(info_text, info_style))
    # ------------------- HƯỚNG DẪN -------------------
    story.append(
        Paragraph("<i>(Thí sinh không được phép sử dụng tài liệu)</i>", guide_style)
    )
    story.append(Spacer(1, 12))
    # ------------------- PHÂN BỔ CẤP ĐỘ BLOOM -------------------
    story.append(Paragraph("<b>PHÂN BỔ CẤP ĐỘ BLOOM:</b>", heading1_style))
    story.append(Paragraph(qa_result.bloom_assignment, styles["Normal"]))
    story.append(Spacer(1, 12))

    # ------------------- XỬ LÝ PHÂN BỔ ĐIỂM -------------------
    num_levels = len(qa_result.qa_results)
    if num_levels == 6:
        percentages = [0.10, 0.15, 0.20, 0.20, 0.20, 0.15]
    else:
        if num_levels < 2:
            raise HTTPException(status_code=500, detail="Phải có ít nhất 2 cấp độ")
        percentages = [0.10] + [0.90 / (num_levels - 1)] * (num_levels - 1)

    story.append(Paragraph("<b>CÂU HỎI VÀ CÂU TRẢ LỜI:</b>", heading1_style))
    question_counter = 1

    # Lặp qua từng cấp độ Bloom theo thứ tự từ thấp đến cao
    for level_idx, level_result in enumerate(qa_result.qa_results):
        # Heading cho cấp độ Bloom
        story.append(Paragraph(f"<b>{level_result['level']}</b>", heading2_style))
        questions_dict = level_result["questions"]
        num_questions = len(questions_dict)
        level_total_points = percentages[level_idx] * 10

        # Phân chia điểm cho từng câu (làm tròn đến bội số của 0.05)
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

        # Lặp qua từng câu hỏi trong cấp
        for idx, (question, answer) in enumerate(questions_dict.items()):
            question_text = (
                f"<b>Câu {question_counter}:</b> {question} "
                f"(<b>{points_alloc[idx]} điểm</b>)"
            )
            story.append(Paragraph(question_text, question_style))
            story.append(Paragraph("<b>Trả lời:</b>", answer_label_style))
            story.append(Paragraph(answer, answer_style))
            question_counter += 1

    doc.build(story)


def create_simple_pdf_file(
    qa_result: QAResponse, pdf_file_path: Path, exam_subject: str, exam_duration: str
) -> None:
    """
    Tạo file PDF đơn giản chỉ chứa phần header và danh sách câu hỏi với điểm,
    sử dụng cơ chế phân bố điểm giống như create_formatted_pdf_file.
    """
    doc = SimpleDocTemplate(
        str(pdf_file_path),
        pagesize=A4,
        rightMargin=inch / 2,
        leftMargin=inch / 2,
        topMargin=inch,
        bottomMargin=inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        name="TitleStyle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontName="Times-Roman",
        fontSize=14,
        leading=16,
        spaceAfter=12,
    )
    info_style = ParagraphStyle(
        name="InfoStyle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontName="Times-Roman",
        fontSize=12,
        leading=14,
        spaceAfter=12,
    )
    guide_style = ParagraphStyle(
        name="GuideStyle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontName="Times-Roman",
        fontSize=11,
        leading=13,
        spaceAfter=12,
    )
    question_style = ParagraphStyle(
        name="QuestionStyle",
        parent=styles["Normal"],
        alignment=TA_LEFT,
        fontName="Times-Roman",
        fontSize=11,
        leading=13,
        spaceAfter=6,
    )

    story = []
    # ------------------- PHẦN HEADER -------------------
    story.append(Paragraph("<b>ĐỀ THI TỰ LUẬN</b>", title_style))
    info_text = f"<b>Môn thi: {exam_subject}<br/>Thời gian làm bài: {exam_duration}</b>"
    story.append(Paragraph(info_text, info_style))
    story.append(
        Paragraph("<i>(Thí sinh không được phép sử dụng tài liệu)</i>", guide_style)
    )
    story.append(Spacer(1, 12))

    # ------------------- XỬ LÝ PHÂN BỔ ĐIỂM -------------------
    num_levels = len(qa_result.qa_results)
    if num_levels == 6:
        percentages = [0.10, 0.15, 0.20, 0.20, 0.20, 0.15]
    else:
        if num_levels < 2:
            raise HTTPException(status_code=500, detail="Phải có ít nhất 2 cấp độ")
        percentages = [0.10] + [0.90 / (num_levels - 1)] * (num_levels - 1)

    question_counter = 1

    # Lặp qua từng cấp độ để in danh sách câu hỏi và điểm
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
            q_text = (
                f"<b>Câu {question_counter}:</b> {question} "
                f"(<b>{points_alloc[idx]} điểm</b>)"
            )
            story.append(Paragraph(q_text, question_style))
            question_counter += 1

    doc.build(story)
