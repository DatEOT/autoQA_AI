from fastapi import HTTPException
from app.models.question import QuestionRequest
from typing import List, Tuple, Any, Dict
from chatbot.utils.bloom_keywords import BLOOM_KEYWORDS


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


def generate_bloom_assignment(
    segments: List[Tuple[str, str, Any]],
    request: QuestionRequest,
) -> Tuple[List[str], List[List[Tuple[str, str, Any]]]]:
    """
    Phân bổ đoạn văn theo logic mới dựa trên ví dụ.
    Trả về danh sách mô tả phân bổ và danh sách các đoạn văn đã được nhóm theo cấp độ.
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

    active_levels_with_counts = [
        (i, count) for i, count in enumerate(level_question_counts) if count > 0
    ]
    num_active_levels = len(active_levels_with_counts)

    if total_segments < num_active_levels:
        # Thông báo cảnh báo nếu không đủ số đoạn
        raise HTTPException(
            status_code=400,
            detail=f"Số đoạn văn ({total_segments}) không đủ để phân bổ cho {num_active_levels} cấp độ yêu cầu. "
            "Vui lòng cung cấp thêm đoạn văn để tạo câu hỏi cho tất cả các cấp độ.",
        )

    segments_per_active_level = [0] * num_active_levels
    base_segments_per_level = total_segments // num_active_levels
    extra_segments = total_segments % num_active_levels

    for i in range(num_active_levels):
        segments_per_active_level[i] = base_segments_per_level
        if i < extra_segments:
            segments_per_active_level[i] += 1

    segments_per_level_count_full = [0] * 6
    for i in range(num_active_levels):
        level_index = active_levels_with_counts[i][0]
        segments_per_level_count_full[level_index] = segments_per_active_level[i]

    assigned_segments_by_level: List[List[Tuple[str, str, Any]]] = [
        [] for _ in range(6)
    ]
    bloom_assignment_strings = []
    current_segment_index = 0

    for level_index in range(6):
        num_segments_for_this_level = segments_per_level_count_full[level_index]

        for _ in range(num_segments_for_this_level):
            if current_segment_index < total_segments:
                segment = segments[current_segment_index]
                assigned_segments_by_level[level_index].append(segment)

                segment_label = (
                    segment[0]
                    if segment[0]
                    else f"Đoạn chưa gán label {current_segment_index + 1}"
                )
                bloom_assignment_strings.append(
                    f"- Đoạn văn {segment_label}: Cấp độ {level_index + 1} - {get_bloom_level_name(level_index + 1)}"
                )
                current_segment_index += 1
            else:
                break

    print("\n" + "=" * 50)
    print("--- KẾT QUẢ PHÂN BỔ ĐOẠN VĂN (từ generate_bloom_assignment - LOGIC MỚI) ---")
    print("Tổng số đoạn gốc:", total_segments)
    print("Số lượng đoạn dự kiến cho mỗi cấp độ (0-5):", segments_per_level_count_full)
    print("Danh sách mô tả phân bổ (bloom_assignment_strings):")
    if bloom_assignment_strings:
        for assignment in bloom_assignment_strings:
            print(assignment)
    else:
        print("Không có đoạn nào được phân bổ.")

    print("\nCác đoạn văn đã NHÓM theo cấp độ (assigned_segments_by_level):")
    for level_index, segments_list in enumerate(assigned_segments_by_level):
        level = level_index + 1
        level_name = get_bloom_level_name(level)
        print(f"Cấp độ {level} ({level_name}) - Số đoạn: {len(segments_list)}")
        if segments_list:
            for seg in segments_list:
                print(f"  - Đoạn Label: {seg[0]}, Trang: {seg[2]}")
        else:
            print("  (Không có đoạn nào được phân bổ cho cấp độ này)")
    print("=" * 50 + "\n")

    return bloom_assignment_strings, assigned_segments_by_level
