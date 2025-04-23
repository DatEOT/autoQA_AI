from fastapi import HTTPException
from app.models.question import QuestionRequest
from typing import List, Tuple


def validate_request(request: QuestionRequest) -> None:
    """
    Kiểm tra tổng số câu hỏi cấp độ Bloom phải đúng và hợp lệ.
    """
    total_levels = sum(
        [
            request.level_1,
            request.level_2,
            request.level_3,
            request.level_4,
            request.level_5,
            request.level_6,
        ]
    )

    if total_levels == 0:
        raise HTTPException(
            status_code=400,
            detail="Không có câu hỏi nào được yêu cầu ở bất kỳ cấp độ nào.",
        )

    if total_levels != request.num_questions:
        raise HTTPException(
            status_code=400,
            detail=f"Tổng số câu hỏi theo cấp độ ({total_levels}) không khớp với num_questions ({request.num_questions})",
        )


def get_bloom_level_name(level: int) -> str:
    level_names = {
        1: "Nhớ",
        2: "Hiểu",
        3: "Áp dụng",
        4: "Phân tích",
        5: "Đánh giá",
        6: "Sáng tạo",
    }
    return level_names.get(level, "Không xác định")


# def get_bloom_level_description(level: int) -> str:
#     descriptions = {
#         1: "Nhớ lại thông tin cơ bản, dữ liệu.",
#         2: "Giải thích hoặc làm rõ khái niệm.",
#         3: "Áp dụng kiến thức vào thực tế.",
#         4: "Phân tích và giải thích mối quan hệ giữa các yếu tố.",
#         5: "Đánh giá và phê phán ý tưởng hoặc giả thuyết.",
#         6: "Sáng tạo hoặc thiết kế giải pháp mới.",
#     }
#     return descriptions.get(level, "Không xác định")


def generate_bloom_assignment(
    segments: List[Tuple[str, str]], request: QuestionRequest
) -> Tuple[List[str], List[int]]:
    """
    Phân bổ đoạn văn theo số câu hỏi yêu cầu và cộng dồn phần dư theo thứ tự ưu tiên cấp thấp trước.
    """
    total_segments = len(segments)
    level_question_counts = [
        request.level_1,
        request.level_2,
        request.level_3,
        request.level_4,
        request.level_5,
        request.level_6,
    ]
    total_questions = sum(level_question_counts)

    if total_questions == 0:
        raise HTTPException(
            status_code=400, detail="Không có câu hỏi nào được yêu cầu."
        )

    # xác định các cấp độ có yêu cầu câu hỏi
    active_levels = [
        (i, count) for i, count in enumerate(level_question_counts) if count > 0
    ]
    num_active_levels = len(active_levels)

    if total_segments < num_active_levels:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Số đoạn ({total_segments}) không đủ để chia cho {num_active_levels} cấp độ có câu hỏi."
            ),
        )

    # khởi tạo: mỗi cấp có câu hỏi sẽ nhận 1 đoạn
    segments_per_level = [0] * 6
    for i, _ in active_levels:
        segments_per_level[i] = 1

    # còn lại bao nhiêu đoạn thì dồn theo thứ tự cấp độ tăng dần
    remainder = total_segments - num_active_levels
    priority_order = [i for i, _ in active_levels]  # theo cấp độ: 0 → 5

    idx = 0
    while remainder > 0:
        level = priority_order[idx % len(priority_order)]
        segments_per_level[level] += 1
        remainder -= 1
        idx += 1
    bloom_assignment = []
    segment_idx = 0
    for level in range(1, 7):
        num_segments = segments_per_level[level - 1]
        level_name = get_bloom_level_name(level)
        for _ in range(num_segments):
            bloom_assignment.append(
                f"- Đoạn văn {segment_idx + 1}: Cấp độ {level} - {level_name}"
            )
            segment_idx += 1

    return bloom_assignment, segments_per_level
