import logging
from pathlib import Path
from fastapi import UploadFile, HTTPException
from docx import Document
import re
import unicodedata
from langchain_community.document_loaders import PyPDFLoader  # Thêm import

logger = logging.getLogger(__name__)


def sanitize_filename(filename: str) -> str:
    # Bỏ dấu tiếng Việt
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


def extract_text_from_file(file_path: Path, file_extension: str) -> str:
    """
    Trích xuất văn bản từ các loại file .docx, .pdf, .txt.

    Args:
        file_path: Đường dẫn file
        file_extension: Đuôi mở rộng ("docx", "pdf", "txt")

    Returns:
        str: Nội dung văn bản đã trích xuất
    """
    try:
        if file_extension == "docx":
            doc = Document(file_path)
            return "\n".join(
                [para.text.strip() for para in doc.paragraphs if para.text.strip()]
            )
        elif file_extension == "pdf":
            loader = PyPDFLoader(str(file_path))  # Chuyển Path thành chuỗi
            pages = loader.load()  # Tải tất cả các trang (đồng bộ)
            texts = [
                page.page_content.strip() for page in pages if page.page_content.strip()
            ]
            metadata = [
                {"page": page.metadata["page"] + 1}
                for page in pages
                if page.page_content.strip()
            ]  # Lưu số trang (bắt đầu từ 1)
            return "\n".join(texts), metadata  # Trả về tuple: (văn bản, siêu dữ liệu)
        elif file_extension == "txt":
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        else:
            raise ValueError("Loại file không được hỗ trợ")
    except Exception as e:
        logger.error(f"Lỗi khi trích xuất văn bản: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Lỗi khi trích xuất văn bản: {str(e)}"
        )
