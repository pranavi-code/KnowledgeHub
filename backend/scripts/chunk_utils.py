def generate_chunks(text, chunk_size=500, overlap=100):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk_text = text[start:end]
        chunks.append({
            "chunk": chunk_text.strip(),
            "title": "Uploaded File"
        })
        start += chunk_size - overlap
    return chunks
