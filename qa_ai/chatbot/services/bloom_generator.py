from chatbot.utils.llm import LLM
from chatbot.utils.answer_generator import AnswerGenerator
from chatbot.utils.custom_prompt import CustomPrompt
from typing import List, Tuple, Dict, Any, Set, Optional
import re
import string
from chatbot.utils.create_docx import clean_markdown_bold

from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from ingestion.service_manager import ServiceManager
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document as LCDocument


class BloomGenerator:
    def __init__(
        self, provider: str, model_variant: str, embedding_model_name: str = "openai"
    ):
        self.llm = LLM().get_llm(provider, model_variant)
        self.answer_generator = AnswerGenerator(self.llm)
        self.embedding_model = ServiceManager().get_embedding_model(
            embedding_model_name
        )
        if self.embedding_model is None:
            print(
                f"Embedding model '{embedding_model_name}' could not be initialized. Vector search fallback will be disabled."
            )
        else:
            print(f"Embedding model '{embedding_model_name}' initialized successfully.")

        # Prompt sinh câu hỏi với yêu cầu rõ về label và page number
        self.question_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    CustomPrompt.GENERATE_QUESTION_PROMPT
                    + """
                    \nĐảm bảo các câu hỏi:
                    1. Bắt đầu bằng [Đoạn LABEL, Trang PAGE]: nếu có số trang, hoặc [Đoạn LABEL]: nếu không. LABEL phải khớp chính xác với nhãn đoạn được cung cấp (ví dụ, '1', '2', '8',...).
                    2. Chỉ dựa trên nội dung đoạn văn được cung cấp, không sử dụng nhãn hoặc nội dung ngoài danh sách.
                    3. Với cấp độ Đánh giá, chỉ tạo câu hỏi nếu đoạn văn có thông tin về ưu điểm, hạn chế hoặc hiệu quả.
                    4. Với cấp độ Sáng tạo, đề xuất phải cụ thể, gắn với một phương pháp hoặc khía cạnh trong đoạn văn, không quá rộng hoặc trừu tượng.
                    5. Kiểm tra tính khả thi: Đảm bảo câu hỏi có thể trả lời dựa trên thông tin trong đoạn văn.
                  """,
                ),
                (
                    "human",
                    """
                    Dựa trên các đoạn sau (Cấp độ {level_name}):

                    {segments}

                    Lưu ý:
                    - Mỗi câu hỏi PHẢI bám sát nội dung một đoạn cụ thể trong danh sách trên.
                    - Không tổng hợp ý tưởng từ các đoạn không được cung cấp.
                    - Mỗi câu hỏi PHẢI bắt đầu bằng [Đoạn LABEL, Trang PAGE]: nếu có số trang, hoặc [Đoạn LABEL]: nếu không.
                    - LABEL phải khớp chính xác với nhãn đoạn được cung cấp (ví dụ, '1', '2', '8',...).
                    - Ví dụ: [Đoạn 8, Trang 5]: Đề xuất một cách cải thiện phương pháp trắc nghiệm...? hoặc [Đoạn 8]: Đề xuất một cách cải thiện...?
                    - Với cấp độ Đánh giá: Chỉ tạo câu hỏi nếu đoạn văn có thông tin về ưu điểm, hạn chế hoặc hiệu quả.
                    - Với cấp độ Sáng tạo: Đề xuất phải cụ thể, gắn với một phương pháp hoặc khía cạnh trong đoạn văn, không quá rộng.
                    - Chỉ tạo câu hỏi dựa trên các đoạn văn được cung cấp, không sử dụng các nhãn ngoài danh sách này.

                    YÊU CẦU:
                    - Tạo đúng {num_questions} câu hỏi tự luận, mỗi câu hỏi trên một dòng.
                    - Câu hỏi thể hiện hành vi theo cấp độ {level_name}, sử dụng từ khóa: {keywords}.
                    - Không vượt nội dung đoạn văn.
                    - Tránh câu hỏi quá rộng, trừu tượng.
                    - Đảm bảo định dạng chính xác và nhãn đúng với đoạn văn.
                """,
                ),
            ]
        )

        self.question_chain = self.question_prompt | self.llm | StrOutputParser()

    def _clean_text_for_comparison(self, text: str) -> str:
        """Chuẩn hóa text để so khớp nội dung."""
        text = text.lower()
        text = text.translate(str.maketrans("", "", string.punctuation))
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def parse_questions(
        self,
        llm_output: str,
        segment_lookup: Dict[str, Tuple[str, str, Any]],
        vectorstore: Optional[Any] = None,
    ) -> List[Tuple[str, str, str, Any]]:
        """
        Phân tích đầu ra từ LLM để trích xuất câu hỏi, nhãn nguồn, nội dung nguồn, và số trang.
        Sử dụng vector search để sửa nhãn sai hoặc tìm nguồn phù hợp.
        Trả về: List[(question_text, source_label, source_text, source_page)]
        """
        parsed_questions: List[Tuple[str, str, str, Any]] = []
        question_pattern = re.compile(
            r"^\s*(?:\d*\.?\s*)?[\[\(\{]?\s*(?:Đoạn|Seg)?\s*(\S+?)(?:\s*(?:,|;|-|\s)\s*(?:Trang|Page|p\.|tr\.)?\s*(\S+?))?\s*[\]\)\}]?\s*[:\-]?\s*(.*)",
            re.IGNORECASE | re.DOTALL,
        )

        for line in llm_output.splitlines():
            line = line.strip()
            if not line:
                continue

            match = question_pattern.match(line)
            source_segment_info: Optional[Tuple[str, str, Any]] = None
            question_text: Optional[str] = None

            if match:
                source_label_from_llm = re.sub(r"[^\w\s]", "", match.group(1).strip())
                page_number_from_llm = match.group(2)
                question_text = match.group(3).strip()
                source_segment_info = segment_lookup.get(source_label_from_llm)
                print(
                    f"-> Matched regex: Label={source_label_from_llm}, Page={page_number_from_llm}, Question={question_text[:50]}..."
                )
            else:
                print(f"-> Skipping line - does not match regex format: {line}")
                continue

            # Thử vector search nếu nhãn không khớp hoặc không tìm thấy nguồn
            if not source_segment_info and vectorstore is not None and question_text:
                similarity_threshold = 0.5
                print(
                    f"-> Label '{source_label_from_llm}' not found in segment_lookup. Attempting vector search for question: {question_text[:50]}..."
                )
                try:
                    results_with_scores = vectorstore.similarity_search_with_score(
                        question_text, k=1
                    )
                    if results_with_scores:
                        most_similar_doc, score = results_with_scores[0]
                        print(
                            f"-> Vector search found document with score: {score:.4f}"
                        )
                        if score >= similarity_threshold:
                            source_segment_info = most_similar_doc.metadata.get(
                                "original_data"
                            )
                            if source_segment_info:
                                print(
                                    f"-> Source found via vector search (label: {source_segment_info[0]}, page: {source_segment_info[2]}). Score: {score:.4f}"
                                )
                            else:
                                print(
                                    "-> Vector search found document but missing 'original_data' in metadata."
                                )
                        else:
                            print(
                                f"-> Vector search score ({score:.4f}) below threshold ({similarity_threshold})."
                            )
                    else:
                        print("-> Vector search returned no results.")
                except Exception as e:
                    print(
                        f"-> ERROR during vector search: {e}. Skipping vector search."
                    )

            # Nếu vẫn không tìm thấy nguồn, bỏ qua câu hỏi
            if not source_segment_info:
                print(
                    f"-> Cannot find reliable source for question: {question_text[:100]}... Skipping question."
                )
                continue

            if question_text and source_segment_info:
                parsed_questions.append(
                    (
                        question_text,
                        source_segment_info[0],
                        source_segment_info[1],
                        source_segment_info[2],
                    )
                )

        if not parsed_questions:
            print("-> No valid questions parsed from LLM output.")
        return parsed_questions

    def generate_questions_for_level(
        self,
        level: int,
        segments: List[Tuple[str, str, str, Any]],
        num_questions: int,
        level_name: str,
        bloom_keywords: str,
        start_index: int = 1,
    ) -> List[Tuple[str, str, Any]]:
        """
        Sinh câu hỏi tự luận theo cấp độ Bloom từ các đoạn văn với logic tạo thêm câu hỏi
        để đạt đủ số lượng yêu cầu (trong một số lần thử nhất định) và loại bỏ trùng lặp.
        Trả về list: [(formatted_question, source_segment_text, source_page_number)]
        """
        if not segments:
            print("-> No segments provided. Returning empty question list.")
            return []
        if num_questions <= 0:
            print(
                f"-> Invalid num_questions ({num_questions}). Returning empty question list."
            )
            return []
        if start_index < 1:
            print(f"-> Invalid start_index ({start_index}). Setting to 1.")
            start_index = 1

        segment_lookup = {seg[0]: (seg[0], seg[1], seg[3]) for seg in segments}
        print(f"-> Segment lookup: {segment_lookup}")

        segment_defs = "\n\n".join(
            f"Đoạn {label} (từ khóa: {keywords}{f', trang {page_number}' if page_number else ''}):\n{text.strip()}"
            for label, text, keywords, page_number in segments
        )

        print("\n" + "~" * 50)
        print(f"--- Nội dung segments đưa vào prompt Cấp độ {level} ({level_name}) ---")
        print(segment_defs)
        print("~" * 50 + "\n")

        lc_documents = []
        for label, text, keywords, page in segments:
            if not text.strip():
                print(f"-> Skipping empty segment (Label: {label}, Page: {page}).")
                continue
            metadata = {"original_data": (label, text, page)}
            lc_documents.append(LCDocument(page_content=text, metadata=metadata))

        vectorstore = None
        if not lc_documents:
            print(
                "-> No valid documents provided for FAISS index. Vector search fallback disabled."
            )
        else:
            try:
                print(
                    f"\nBuilding in-memory FAISS index for {len(lc_documents)} segments for Level {level}."
                )
                vectorstore = FAISS.from_documents(lc_documents, self.embedding_model)
                print("FAISS index built successfully.")
            except Exception as e:
                print(
                    f"ERROR building FAISS index: {e}. Vector search fallback disabled for this level."
                )
                vectorstore = None

        batch_size = min(4, max(1, len(segments) // 3))
        parsed_qas_cumulative_revised: List[Tuple[str, str, str, Any]] = []
        seen_questions_text_revised: Set[str] = set()

        print(
            f"\nAttempting to generate {num_questions} unique questions for Level {level} ({level_name}) using batching."
        )
        print(
            f"Total segments for this level: {len(segments)}. Batch size: {batch_size}"
        )

        max_attempts = 5
        retry_count = 0
        current_unique_count = len(parsed_qas_cumulative_revised)
        needed_count = num_questions - current_unique_count

        while retry_count < max_attempts and needed_count > 0:
            print(f"\n--- Lần thử {retry_count + 1}/{max_attempts} ---")

            num_batches = max(1, len(segments) // batch_size)
            request_count_per_batch = max(
                1, min(needed_count, (needed_count // num_batches) + 1)
            )

            print(f"Yêu cầu sinh thêm {request_count_per_batch} câu hỏi cho mỗi batch.")

            segment_batches = [
                segments[i : i + batch_size]
                for i in range(0, len(segments), batch_size)
            ]

            for batch_index, batch_segments in enumerate(segment_batches):
                print(
                    f"  -> Processing batch {batch_index + 1}/{len(segment_batches)}..."
                )
                batch_segment_defs = "\n\n".join(
                    f"Đoạn {label} (từ khóa: {keywords}{f', trang {page_number}' if page_number else ''}):\n{text.strip()}"
                    for label, text, keywords, page_number in batch_segments
                )

                max_llm_retries = 3
                for llm_attempt in range(max_llm_retries):
                    try:
                        result = self.question_chain.invoke(
                            {
                                "level_name": level_name,
                                "segments": batch_segment_defs,
                                "num_questions": request_count_per_batch,
                                "keywords": bloom_keywords,
                            }
                        )
                        if not result.strip():
                            print(
                                f"-> LLM returned empty output for batch {batch_index + 1}. Skipping parsing."
                            )
                            continue
                        print(
                            f"\n--- Kết quả thô từ LLM (Batch {batch_index + 1}, Attempt {retry_count + 1}) ---"
                        )
                        print(result)
                        print("-" * 30 + "\n")

                        new_qas = self.parse_questions(
                            result, segment_lookup, vectorstore
                        )
                        print(
                            f"-> Parsed {len(new_qas)} questions from batch {batch_index + 1}"
                        )
                        for (
                            question_text,
                            source_label,
                            source_text,
                            source_page,
                        ) in new_qas:
                            clean_q_for_check = re.sub(
                                r"^Câu \(temp\):\s*", "", question_text.strip()
                            )
                            clean_q_for_check = self._clean_text_for_comparison(
                                clean_markdown_bold(clean_q_for_check)
                            )
                            if clean_q_for_check not in seen_questions_text_revised:
                                seen_questions_text_revised.add(clean_q_for_check)
                                temp_formatted_question = f"Câu (temp): {question_text}"
                                parsed_qas_cumulative_revised.append(
                                    (
                                        temp_formatted_question,
                                        source_label,
                                        source_text,
                                        source_page,
                                    )
                                )
                                print(
                                    f"-> Added unique question: {question_text[:50]}..."
                                )
                        break
                    except Exception as e:
                        print(
                            f"-> ERROR calling LLM for batch {batch_index + 1} (attempt {llm_attempt + 1}/{max_llm_retries}): {e}"
                        )
                        if llm_attempt == max_llm_retries - 1:
                            print(
                                f"-> Skipped batch {batch_index + 1} after {max_llm_retries} failed attempts."
                            )
                            continue

                current_unique_count = len(parsed_qas_cumulative_revised)
                needed_count = num_questions - current_unique_count
                print(
                    f"Số câu hỏi đã tạo: {current_unique_count}. Số câu hỏi còn thiếu: {needed_count}."
                )

            retry_count += 1
            if current_unique_count >= num_questions:
                print(f"Đã tạo đủ {num_questions} câu hỏi sau {retry_count} lần thử.")
                break
            if retry_count == max_attempts:
                print(
                    f"Không thể tạo đủ {num_questions} câu hỏi sau {max_attempts} lần thử."
                )

        final_qas: List[Tuple[str, str, Any]] = []
        current_final_q_num = start_index

        num_q_to_return = min(num_questions, len(parsed_qas_cumulative_revised))
        print(f"\nChuẩn bị định dạng cuối cùng cho {num_q_to_return} câu hỏi duy nhất.")

        for q_tuple_revised in parsed_qas_cumulative_revised[:num_q_to_return]:
            temp_formatted_q, source_label, source_text, source_page = q_tuple_revised
            original_q_text = re.sub(r"^Câu \(temp\):\s*", "", temp_formatted_q.strip())

            final_formatted_question = f"Câu {current_final_q_num}: {original_q_text}"

            if source_text == "Nội dung nguồn không xác định":
                source_label = f"Nguồn không xác định cho câu {current_final_q_num}"

            final_qas.append((final_formatted_question, source_text, source_page))
            current_final_q_num += 1

        if len(final_qas) < num_questions:
            print(
                f"\nCẢNH BÁO: Không thể tạo đủ {num_questions} câu hỏi duy nhất sau {max_attempts} lần thử. Chỉ có {len(final_qas)} câu duy nhất được tạo."
            )

        print(
            f"Kết thúc quá trình tạo câu hỏi cho Cấp độ {level}. Tổng số câu hỏi duy nhất được chuyển sang bước sinh đáp án: {len(final_qas)}"
        )

        return final_qas

    def generate_answers_for_pairs(
        self, qas: List[Tuple[str, str, Any]]
    ) -> Dict[str, str]:
        """
        Sinh câu trả lời cho các cặp (question, đoạn nguồn, số trang).
        Trả về dict: {formatted_question: answer}
        """
        results = {}

        for formatted_question, source_segment_text, source_page_number in qas:
            if source_segment_text == "Nội dung nguồn không xác định":
                print(
                    f"Skipping answer generation for question '{formatted_question}' due to unknown source."
                )
                results[formatted_question] = (
                    "Không tìm thấy nguồn thông tin đáng tin cậy trong tài liệu để trả lời câu hỏi này."
                )
                continue

            page_info_for_prompt = (
                f" (trang {source_page_number})" if source_page_number else ""
            )
            citation_format_rule = (
                f"Trích từ đoạn{page_info_for_prompt}: \u201c<câu trích dẫn>\u201d."
            )
            citation_check_string = f"Trích từ đoạn{page_info_for_prompt}:"

            # Kiểm tra nếu câu hỏi yêu cầu đánh giá nhưng đoạn văn không đủ thông tin
            if "đánh giá" in formatted_question.lower() and (
                "ưu điểm" not in source_segment_text.lower()
                or "hạn chế" not in source_segment_text.lower()
            ):
                print(
                    f"Skipping answer generation for question '{formatted_question}' due to insufficient information for full evaluation (missing advantages or disadvantages)."
                )
                results[formatted_question] = (
                    "Đoạn văn không cung cấp đủ thông tin về cả ưu điểm và hạn chế để đánh giá theo yêu cầu của câu hỏi."
                )
                continue

            prompt = (
                f"Dựa trên đoạn văn sau{page_info_for_prompt}:\n\n{source_segment_text}\n\n"
                f"Hãy trả lời câu hỏi: {formatted_question}\n\n"
                "QUY TẮC TRẢ LỜI:\n"
                "1. Chỉ sử dụng thông tin trong đoạn.\n"
                "2. Câu trả lời phải có một câu trích dẫn.\n"
                "3. Không được trích toàn bộ đoạn hoặc dùng dấu ba chấm (...).\n"
                f"4. {citation_format_rule}\n"
                "5. Đảm bảo có trích dẫn đúng định dạng.\n"
                "6. Nếu câu hỏi yêu cầu đánh giá (ví dụ, đánh giá hiệu quả), trả lời phải bao gồm nhận định về ưu điểm và hạn chế dựa trên đoạn văn. Nếu đoạn văn không đủ thông tin cho cả hai, nêu rõ rằng không thể đánh giá đầy đủ."
            )

            print("\n" + "~" * 50)
            print(f"--- Nội dung sinh đáp án cho câu: {formatted_question} ---")
            print(
                f"Đoạn văn nguồn{page_info_for_prompt}:\n{source_segment_text[:200]}..."
            )
            print("~" * 50 + "\n")

            answer = self.answer_generator.get_chain().invoke(
                {
                    "question": formatted_question,
                    "context": prompt,
                }
            )

            print("\n" + "*" * 50)
            print(f"--- Kết quả thô từ LLM sinh đáp án ---")
            print(answer)
            print("*" * 50 + "\n")

            if citation_check_string not in answer:
                answer = re.sub(
                    r"Trích từ đoạn(?:, Trang \s*\d+)?:\s*\u201c",
                    citation_check_string + " \u201c",
                    answer,
                    count=1,
                )
                if citation_check_string not in answer:
                    print(
                        f"-> Answer for question '{formatted_question}' lacks proper citation format."
                    )
                    if not re.search(r"\u201c.*?\u201d", answer):
                        answer += f"\n\n{citation_check_string} \u201cKhông có trích dẫn phù hợp.\u201d"

            results[formatted_question] = answer.strip()

        return results
