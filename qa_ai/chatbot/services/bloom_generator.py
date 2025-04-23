from chatbot.utils.llm import LLM
from chatbot.utils.answer_generator import AnswerGenerator
from chatbot.utils.custom_prompt import CustomPrompt
from typing import List, Tuple, Dict
import re
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from chatbot.utils.bloom_keywords import BLOOM_KEYWORDS


class BloomGenerator:
    def __init__(self, llm_name: str = "openai"):
        self.llm = LLM().get_llm(llm_name)
        self.answer_generator = AnswerGenerator(self.llm)
        # Prompt riêng để sinh câu hỏi với biến cụ thể
        self.question_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", CustomPrompt.GENERATE_QUESTION_PROMPT),
                (
                    "human",
                    """
                    Dựa trên các đoạn sau (Cấp độ {level_name}):

                    {segments}
                    Lưu ý:
                    - Mỗi câu hỏi nên bám sát nội dung một đoạn cụ thể.
                    - Chỉ kết hợp các đoạn nếu chúng liên quan chặt chẽ và cùng cấp độ.
                    - Tuyệt đối không tổng hợp ý tưởng từ các đoạn không liên quan.
                    - Mỗi câu hỏi nằm trên một dòng riêng.

                    YÊU CẦU:
                    - Tạo đúng {num_questions} câu hỏi tự luận.
                    - Hãy tạo câu hỏi thể hiện hành vi theo cấp độ {level_name}, sử dụng các từ khóa đặc trưng sau: {keywords}
                    - Không được đặt câu hỏi vượt ra ngoài nội dung có trong đoạn văn.
                    - Tuyệt đối không được yêu cầu tạo ví dụ, tình huống, hoặc đánh giá nếu đoạn không có dữ kiện đó.
                    - Tránh đặt câu hỏi quá rộng, trừu tượng hoặc không thể trả lời từ đoạn văn.
                    """,
                ),
            ]
        )
        self.question_chain = self.question_prompt | self.llm | StrOutputParser()

    def generate_questions_for_level(
        self,
        level: int,
        segments: List[Tuple[str, str, str, int]],  # Thêm int cho page_number
        num_questions: int,
        level_name: str,
        bloom_keywords: str,
        start_index: int = 1,
    ) -> List[Tuple[str, str, int]]:
        """
        Sinh câu hỏi tự luận theo cấp độ Bloom từ các đoạn văn.
        Trả về list tuple: [(question, combined_segment_text, page_number), ...]
        """
        level_segments = segments

        segment_defs = "\n\n".join(
            f"Đoạn {label} (từ khóa: {keywords}, trang {page_number}):\n{text.strip()}"
            for label, text, keywords, page_number in segments
        )

        print("\nNội dung segments được đưa vào prompt:")
        print(segment_defs)
        print("=" * 80)

        result = self.question_chain.invoke(
            {
                "level_name": level_name,
                "segments": segment_defs,
                "num_questions": num_questions,
                "keywords": bloom_keywords,
            }
        )

        questions = [
            f"Câu {i + start_index}: {line.strip()}"
            for i, line in enumerate(result.splitlines())
            if line.strip()
        ]

        combined_segment_text = "\n\n".join(
            text.strip() for (_, text, _, _) in segments
        )
        return [
            (q, combined_segment_text, page_number)
            for q, (_, _, _, page_number) in zip(questions, segments)
        ]

    def generate_answers_for_pairs(
        self, qas: List[Tuple[str, str, int]]
    ) -> Dict[str, str]:
        """
        Sinh câu trả lời ngắn gọn, có trích dẫn từ từng cặp (question, đoạn, số trang).
        Trả về dict: {question: answer}
        """
        results = {}

        for question, segment_text, page_number in qas:
            prompt = (
                f"Dựa trên đoạn văn sau (trang {page_number}):\n\n{segment_text}\n\n"
                f"Hãy trả lời chính xác và đầy đủ cho câu hỏi sau: {question}\n\n"
                "QUY TẮC TRẢ LỜI:\n"
                "1. Chỉ sử dụng thông tin có trong đoạn văn.\n"
                "2. Mỗi câu trả lời phải đi kèm một câu trích dẫn nguyên văn từ đoạn, thể hiện rõ phần thông tin được sử dụng để trả lời.\n"
                "3. Trích dẫn phải đúng với nội dung đã trả lời, có thể bao quát hơn một chút nhưng phải nằm trong đoạn.\n"
                "4. Không được trích dẫn toàn đoạn hoặc sử dụng dấu ba chấm (...).\n"
                "5. Trích dẫn đặt thành một dòng riêng, theo định dạng: Trích từ đoạn, trang {page_number}: “<câu trích dẫn>”.\n"
                "6. Đảm bảo câu trả lời luôn bao gồm trích dẫn với số trang như yêu cầu."
            )

            print("\n Nội dung đoạn văn cho câu trả lời:")
            print(f"Câu hỏi: {question}")
            print(f"Đoạn văn (trang {page_number}):\n{segment_text}")
            print("=" * 80)

            answer = self.answer_generator.get_chain().invoke(
                {
                    "question": question,
                    "context": prompt,  # Truyền toàn bộ prompt thay vì chỉ segment_text
                }
            )

            # Kiểm tra xem câu trả lời có trích dẫn hợp lệ không
            if not re.search(rf"Trích từ đoạn, trang {page_number}: “[^”]+”", answer):
                answer += f"\n\nTrích từ đoạn, trang {page_number}: “Không có trích dẫn phù hợp được tìm thấy trong đoạn văn.”"

            results[question] = answer.strip()

        return results
