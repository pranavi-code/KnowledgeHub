import json
from utils.chunker import chunk_document

with open("uploads/sample.json", "r") as f:
    doc = json.load(f)

content = doc.get("content", "")
metadata = {
    "title": doc.get("title", ""),
    "tags": doc.get("tags", [])
}

chunks = chunk_document(content, metadata)

for i, chunk in enumerate(chunks):
    print(f"\nChunk {i+1}:\n{chunk['text']}")
