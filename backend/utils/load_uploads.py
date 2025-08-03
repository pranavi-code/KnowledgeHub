import os
import json
import fitz  # PyMuPDF


UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'routes', 'uploads')

def extract_pdf_text(pdf_path):
    text = ""
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text += page.get_text()
    except Exception as e:
        text = f"Error reading PDF: {str(e)}"
    return text.strip()

def load_uploads():
    uploads = []
    files = os.listdir(UPLOAD_DIR)
    print("DEBUG: Found files:", files)
    for filename in files:
        if filename.endswith('.json'):
            json_path = os.path.join(UPLOAD_DIR, filename)
            with open(json_path, 'r') as f:
                metadata = json.load(f)

            pdf_path = os.path.join(UPLOAD_DIR, metadata.get('filename', ''))
            pdf_text = extract_pdf_text(pdf_path) if os.path.exists(pdf_path) else "PDF file not found."

            metadata['content'] = pdf_text
            uploads.append(metadata)

    return uploads

docs = load_uploads()
print("Loaded docs:", docs)
