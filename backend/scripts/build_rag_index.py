# scripts/build_rag_index.py

import os
import sys
import faiss
import pickle
import numpy as np
from utils.load_uploads import load_uploads
from google.generativeai import embed_content
import google.generativeai as genai
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()

# 🔑 Set your Gemini API Key
genai.configure(api_key="AIzaSyAIj2JW7I15YNITvU-fWY9541KFziZMiX8")

EMBED_MODEL = "models/embedding-001"  # from Gemini
CHUNK_SIZE = 200  # words
CHUNK_OVERLAP = 50
INDEX_SAVE_PATH = "vector_index/faiss_index.index"
METADATA_SAVE_PATH = "vector_index/metadata.pkl"


# 1️⃣ Chunk text into overlapping sections
def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks


# 2️⃣ Generate Gemini Embedding for a chunk
def get_embedding(text):
    try:
        response = embed_content(model=EMBED_MODEL, content=text, task_type="retrieval_document")
        return response['embedding']
    except Exception as e:
        print("Embedding error:", e)
        return None


# 3️⃣ Main build function
def build_rag_index():
    os.makedirs("vector_index", exist_ok=True)  # <-- Move this to the top

    documents = load_uploads()
    print(f"Loaded {len(documents)} documents.")  # Debug

    all_embeddings = []
    metadata = []

    for doc in documents:
        title = doc.get("title", "Untitled")
        content = doc.get("content", "")
        if not content:
            continue

        chunks = chunk_text(content)
        print(f"Doc '{title}' split into {len(chunks)} chunks.")  # Debug
        for chunk in chunks:
            emb = get_embedding(chunk)
            if emb:
                all_embeddings.append(emb)
                metadata.append({
                    "title": title,
                    "chunk": chunk
                })

    if not all_embeddings:
        print("No embeddings created.")
        return

    # Convert to FAISS index
    dimension = len(all_embeddings[0])
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(all_embeddings).astype("float32"))

    # Save index and metadata
    os.makedirs("vector_index", exist_ok=True)
    faiss.write_index(index, INDEX_SAVE_PATH)

    with open(METADATA_SAVE_PATH, "wb") as f:
        pickle.dump(metadata, f)

    print(f"✅ Built FAISS index with {len(all_embeddings)} chunks.")

def embed_and_store_chunks(chunks, doc_id):
    """Add new chunks to the existing FAISS index"""
    import numpy as np
    
    # Load existing index and metadata
    if os.path.exists(INDEX_SAVE_PATH) and os.path.exists(METADATA_SAVE_PATH):
        index = faiss.read_index(INDEX_SAVE_PATH)
        with open(METADATA_SAVE_PATH, "rb") as f:
            metadata = pickle.load(f)
    else:
        # Create new index if it doesn't exist
        index = None
        metadata = []
    
    all_embeddings = []
    new_metadata = []

    for chunk in chunks:
        emb = get_embedding(chunk["chunk"])
        if emb:
            all_embeddings.append(emb)
            new_metadata.append({
                "title": chunk.get("title", f"Document {doc_id}"),
                "chunk": chunk["chunk"]
            })

    if not all_embeddings:
        print("❌ No embeddings generated.")
        return

    # Create or update index
    if index is None:
        dimension = len(all_embeddings[0])
        index = faiss.IndexFlatL2(dimension)
    
    # Add new embeddings to index
    index.add(np.array(all_embeddings).astype("float32"))
    
    # Combine metadata
    metadata.extend(new_metadata)

    # Save updated index and metadata
    os.makedirs("vector_index", exist_ok=True)
    faiss.write_index(index, INDEX_SAVE_PATH)

    with open(METADATA_SAVE_PATH, "wb") as f:
        pickle.dump(metadata, f)

    print(f"✅ Added {len(all_embeddings)} chunks for document: {doc_id}")

def embed_and_store_chunks_from_file(file_path, file_name):
    """Legacy function for file-based processing"""
    import numpy as np

    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    chunks = chunk_text(text)
    all_embeddings = []
    metadata = []

    for chunk in chunks:
        emb = get_embedding(chunk)
        if emb:
            all_embeddings.append(emb)
            metadata.append({
                "title": file_name,
                "chunk": chunk
            })

    if not all_embeddings:
        print("❌ No embeddings generated.")
        return

    dimension = len(all_embeddings[0])
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(all_embeddings).astype("float32"))

    os.makedirs("vector_index", exist_ok=True)
    faiss.write_index(index, INDEX_SAVE_PATH)

    with open(METADATA_SAVE_PATH, "wb") as f:
        pickle.dump(metadata, f)

    print(f"✅ Stored {len(all_embeddings)} chunks for file: {file_name}")


if __name__ == "__main__":
    import numpy as np
    build_rag_index()
