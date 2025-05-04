import subprocess
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


def convert_docx_to_pdf(docx_path, pdf_path):
    try:
        libreoffice_path = (
            r"C:\Program Files\LibreOffice\program\soffice.exe"
            if os.name == "nt"
            else "soffice"
        )
        logger.info(f"Converting {docx_path} to {pdf_path} using {libreoffice_path}")

        if not Path(docx_path).exists():
            logger.error(f"DOCX file {docx_path} does not exist")
            return False

        output_dir = Path(pdf_path).parent
        if not output_dir.exists():
            logger.info(f"Creating output directory {output_dir}")
            output_dir.mkdir(parents=True, exist_ok=True)

        result = subprocess.run(
            [
                libreoffice_path,
                "--headless",
                "--convert-to",
                "pdf",
                docx_path,
                "--outdir",
                str(output_dir),
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        logger.info(f"Conversion successful: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Conversion failed: {e.stderr}")
        return False
    except FileNotFoundError:
        logger.error(f"LibreOffice not found at {libreoffice_path}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return False
