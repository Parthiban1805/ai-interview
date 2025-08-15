# backend/utils.py
import io
from fastapi import UploadFile
from pypdf import PdfReader

def parse_resume(file: UploadFile) -> str:
    """Extracts text from an uploaded PDF file."""
    try:
        if file.content_type == "application/pdf":
            # Read the file content into an in-memory bytes buffer
            pdf_stream = io.BytesIO(file.file.read())
            reader = PdfReader(pdf_stream)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
        else:
            # For simplicity, we only support PDF. You could add .docx support here.
            return "Could not parse resume. Unsupported file format."
    except Exception as e:
        print(f"Error parsing resume: {e}")
        return "Error reading resume content."