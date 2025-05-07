from chatbot.utils.bloom_keywords import BLOOM_KEYWORDS
from chatbot.services.bloom_generator import BloomGenerator
from app.models.question import QuestionRequest, FileResponseModel, QAResponse

from typing import List, Tuple, Any, Dict
from chatbot.utils.validation_utils import (
    get_bloom_level_name,
    generate_bloom_assignment,
)


def generate_qa_content(
    segments: List[Tuple[str, str, Any]],
    request: QuestionRequest,
    provider: str,
    model_variant: str,
) -> QAResponse:
    print("\n" + "*" * 50)
    print("--- DỮ LIỆU ĐẦU VÀO generate_qa_content ---")
    print(f"Tổng số đoạn ban đầu nhận được: {len(segments)}")
    print(
        "Yêu cầu câu hỏi:",
        {f"level_{i+1}": getattr(request, f"level_{i+1}") for i in range(6)},
        f"Tổng: {request.num_questions}",
    )
    print("*" * 50 + "\n")

    bloom_assignment_strings, segments_grouped_by_level = generate_bloom_assignment(
        segments, request
    )

    qa_results = []
    bloom_gen = BloomGenerator(provider, model_variant)
    global_question_index = 1

    print("\n" + "-" * 50)
    print("--- BẮT ĐẦU VÒNG LẶP XỬ LÝ QA THEO CẤP ĐỘ ---")

    for level_index, level_segments in enumerate(segments_grouped_by_level):
        level = level_index + 1
        num_segments = len(level_segments)

        if num_segments == 0:
            print(
                f"\n--- Bỏ qua Cấp độ {level} ({get_bloom_level_name(level)}) - Không có đoạn nào được phân bổ ---"
            )
            continue

        print(f"\n--- Đang xử lý Cấp độ {level} ({get_bloom_level_name(level)}) ---")
        print(f"Số đoạn được phân bổ và đang sử dụng cho cấp độ này: {num_segments}")
        print("Danh sách các đoạn văn đang được sử dụng (Label, Page):")
        for seg in level_segments:
            print(f"  - Label: {seg[0]}, Page: {seg[2]}")
        print(
            "-"
            * (
                len(
                    f"--- Đang xử lý Cấp độ {level} ({get_bloom_level_name(level)}) ---"
                )
            )
        )

        level_name = get_bloom_level_name(level)
        bloom_keywords = BLOOM_KEYWORDS.get(level, "")
        num_questions_requested_for_level = getattr(request, f"level_{level}")

        segments_with_keywords = [
            (label, text, bloom_keywords, page)
            for (label, text, page) in level_segments
        ]

        qas_dict = bloom_gen.generate_qas_until_valid(
            level=level,
            segments=segments_with_keywords,
            num_questions=num_questions_requested_for_level,
            level_name=level_name,
            start_index=global_question_index,
        )

        # Cập nhật số thứ tự câu hỏi toàn cục
        global_question_index += len(qas_dict)

        qa_results.append(
            {
                "level": f"Cấp độ {level} - {level_name}",
                "questions": qas_dict,
            }
        )

        print("\n" + "-" * 50)

    print("--- KẾT THÚC VÒNG LẶP XỬ LÝ QA ---")
    print("-" * 50 + "\n")

    return QAResponse(
        bloom_assignment="\n".join(bloom_assignment_strings), qa_results=qa_results
    )
