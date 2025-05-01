import logging
from pathlib import Path
from fastapi import UploadFile, HTTPException
from docx import Document
import re
import unicodedata
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Tuple, Any

logger = logging.getLogger(__name__)

IGNORED_LINE_PATTERNS = [
    re.compile(r"^\s*Tài liệu Tâm lý học đại cương.*$", re.MULTILINE | re.IGNORECASE),
    re.compile(r"^\s*Bản quyền thuộc về .*", re.MULTILINE | re.IGNORECASE),
    re.compile(r"^\s*[\w\s]+ - Trang\s*\d+.*$", re.MULTILINE | re.IGNORECASE),
    re.compile(r"^\s*[-*]{5,}\s*$", re.MULTILINE),
]

PAGE_NUMBER_PATTERNS = [
    re.compile(r"^\s*[-—–\[\]\(\)]?\s*\d+\s*[-—–\[\]\(\)]?\s*$", re.MULTILINE),
    re.compile(r"^\s*(?:Trang|Page)\s+\d+\s*[\.\,]?\s*$", re.MULTILINE | re.IGNORECASE),
    re.compile(r"^\s*\d+\s*(?:/|\||trên)\s*\d+\s*$", re.MULTILINE | re.IGNORECASE),
    re.compile(r"^\s*\d+\s*$", re.MULTILINE),  # Cẩn trọng với pattern này
]


def sanitize_filename(filename: str) -> str:
    name = (
        unicodedata.normalize("NFKD", filename)
        .encode("ascii", "ignore")
        .decode("utf-8")
    )

    # Thay thế khoảng trắng, ký tự đặc biệt bằng dấu gạch dưới
    name = re.sub(r"[^\w\-_. ]", "_", name)

    # Xóa khoảng trắng ở đầu/cuối + thay khoảng trắng bằng _
    name = name.strip().replace(" ", "_")

    return name


def save_uploaded_file(file: UploadFile, file_id: str, upload_dir: Path) -> Path:
    """
    Lưu file tải lên vào thư mục upload_dir và trả về đường dẫn.

    Args:
        file: UploadFile từ request
        file_id: Mã định danh duy nhất
        upload_dir: Thư mục lưu trữ file

    Returns:
        Path: Đường dẫn file đã lưu
    """
    try:
        sanitized_name = sanitize_filename(file.filename)
        file_path = upload_dir / f"{file_id}_{sanitized_name}"
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        return file_path
    except Exception as e:
        logger.error(f"Lỗi khi lưu file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi lưu file: {str(e)}")


# Hàm tiện ích để làm sạch text
def clean_text_content(text: str) -> str:
    """
    Loại bỏ các mẫu số trang và header/footer không mong muốn khỏi văn bản.
    Sử dụng danh sách các pattern cấu hình được.
    """
    cleaned_text = text

    # Áp dụng danh sách các pattern dòng cần loại bỏ (bao gồm cả header)
    for pattern in IGNORED_LINE_PATTERNS:
        cleaned_text = pattern.sub("", cleaned_text)

    # Áp dụng danh sách các pattern số trang cần loại bỏ
    for pattern in PAGE_NUMBER_PATTERNS:
        cleaned_text = pattern.sub("", cleaned_text)

    # Loại bỏ các dòng trống thừa sau khi xóa
    # Áp dụng lặp lại vài lần để xử lý các trường hợp có nhiều dòng trống liên tiếp sau khi xóa
    for _ in range(3):  # Lặp 3 lần để đảm bảo loại bỏ hết
        cleaned_text = re.sub(r"\n\s*\n", "\n\n", cleaned_text)

    cleaned_text = (
        cleaned_text.strip()
    )  # Loại bỏ khoảng trắng/dòng trống ở đầu/cuối file

    return cleaned_text


def extract_text_from_file(file_path: Path, file_extension: str) -> Tuple[str, Any]:
    """
    Trích xuất văn bản từ các loại file .docx, .pdf, .txt và làm sạch.

    Args:
        file_path: Đường dẫn file
        file_extension: Đuôi mở rộng ("docx", "pdf", "txt")

    Returns:
        Tuple[str, Any]: Tuple chứa (nội dung văn bản đã trích xuất và làm sạch, metadata)
                         Metadata có thể là list of dicts (cho pdf) hoặc None (cho docx, txt)
    """
    try:
        metadata = None
        extracted_text = ""

        if file_extension == "docx":
            doc = Document(file_path)
            texts = [para.text.strip() for para in doc.paragraphs if para.text.strip()]
            extracted_text = "\n".join(texts)
            metadata = None

        # Lưu ý: Logic xử lý PDF ở đây chỉ trích xuất text *toàn bộ* file
        # Luồng chính trong router sử dụng extract_segments_with_pages cho PDF
        # Bạn có thể cân nhắc loại bỏ logic PDF ở đây nếu nó không được dùng

        elif file_extension == "txt":
            with open(file_path, "r", encoding="utf-8") as f:
                extracted_text = f.read()
            metadata = None

        else:
            raise ValueError("Loại file không được hỗ trợ")

        # --- ÁP DỤNG BƯỚC LÀM SẠCH TEXT ---
        # Áp dụng hàm làm sạch đã cập nhật
        cleaned_text = clean_text_content(extracted_text)
        # --- KẾT THÚC ÁP DỤNG BƯỚC LÀM SẠCH TEXT ---

        return cleaned_text, metadata

    except Exception as e:
        logger.error(f"Lỗi khi trích xuất văn bản: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Lỗi khi trích xuất văn bản: {str(e)}"
        )


def extract_segments_with_pages(
    pdf_path: Path, chunk_size: int = 2000
) -> List[Tuple[str, str, Any]]:
    """
    Trích xuất và làm sạch văn bản từ PDF (từng trang), sau đó phân đoạn
    bằng Langchain's split_documents để cố gắng giữ metadata số trang.

    Args:
        pdf_path: Đường dẫn file PDF
        chunk_size: Kích thước tối đa của một đoạn văn bản

    Returns:
        List[Tuple[str, str, Any]]: Danh sách các tuple (segment_label, segment_text, page_number)
                                   page_number là số trang gốc (có thể chỉ là trang bắt đầu của chunk)
    """
    try:
        loader = PyPDFLoader(str(pdf_path))
        pages = (
            loader.load()
        )  # pages là List[Document], mỗi Document là 1 trang với metadata

        # 1. Làm sạch nội dung TỪNG trang và cập nhật lại vào Document
        cleaned_pages = []
        for page in pages:
            if page.page_content.strip():  # Chỉ xử lý trang có nội dung
                # Áp dụng làm sạch trực tiếp lên page_content của Document
                page.page_content = clean_text_content(page.page_content)
                cleaned_pages.append(page)

        if not cleaned_pages:
            logger.warning(
                f"File PDF {pdf_path.name} không có nội dung sau khi làm sạch."
            )
            return (
                []
            )  # Trả về danh sách rỗng nếu không có trang nào có nội dung sau khi làm sạch

        # 2. Khởi tạo bộ chia nhỏ văn bản
        # Sử dụng chunk_overlap theo logic của Ingestion (0.2 * chunk_size)
        # Đảm bảo các separators giống với Ingestion.process_txt nếu muốn consistency
        chunk_overlap = int(chunk_size * 0.2)

        text_splitter = RecursiveCharacterTextSplitter(
            separators=[
                "\n\n",
                "\n",
                " ",
                ".",
                ",",
                "\u200b",
                "\uff0c",
                "\u3001",
                "\uff0e",
                "\u3002",
                "",
            ],
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            # add_start_index=True # Tùy chọn: thêm index bắt đầu của chunk trong document gốc
        )

        # 3. Chia nhỏ danh sách các Document (từng trang) thành các chunks Document mới
        # split_documents sẽ cố gắng giữ metadata từ các document gốc
        # Kết quả là một list các Document, mỗi Document là 1 chunk với metadata từ trang gốc
        chunks = text_splitter.split_documents(
            cleaned_pages
        )  # chunks là List[Document]

        # 4. Format kết quả về dạng List[Tuple[str, str, Any]] mong muốn
        segments_with_pages = []
        for i, chunk_doc in enumerate(chunks):
            segment_text = chunk_doc.page_content.strip()
            # Lấy số trang từ metadata của chunk.
            # metadata của chunk thường kế thừa từ document gốc (trang PDF).
            # Nếu chunk vắt qua nhiều trang, metadata có thể chỉ là của trang đầu tiên.
            # Langchain lưu page number trong metadata dưới key 'page' và thường bắt đầu từ 0.
            page_number_from_metadata = chunk_doc.metadata.get("page", None)
            if page_number_from_metadata is not None:
                page_number_from_metadata += (
                    1  # Chuyển từ index base 0 sang số trang base 1
                )

            # Sử dụng index (i+1) làm segment_label, và số trang từ metadata
            segments_with_pages.append(
                (str(i + 1), segment_text, page_number_from_metadata)
            )

        # Không cần ghi file tạm và gọi ingestion.process_txt ở đây nữa
        # temp_path = Path("temp_extracted_cleaned.txt")
        # try: ... finally: ...

        return segments_with_pages

    except Exception as e:
        logger.error(f"Lỗi khi trích xuất segment từ PDF: {str(e)}")
        # Quan trọng: Raise Exception hoặc HTTPException để router có thể bắt lỗi
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý file PDF: {str(e)}")
