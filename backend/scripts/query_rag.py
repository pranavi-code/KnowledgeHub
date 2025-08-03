# scripts/query_rag.py

import os
import faiss
import pickle
import numpy as np
from google.generativeai import embed_content
import google.generativeai as genai

# Load FAISS index & metadata
INDEX_PATH = "vector_index/faiss_index.index"
METADATA_PATH = "vector_index/metadata.pkl"
EMBED_MODEL = "models/embedding-001"

genai.configure(api_key="AIzaSyAIj2JW7I15YNITvU-fWY9541KFziZMiX8")

# Load
index = faiss.read_index(INDEX_PATH)
with open(METADATA_PATH, "rb") as f:
    metadata = pickle.load(f)

def get_query_embedding(query):
    try:
        res = embed_content(model=EMBED_MODEL, content=query, task_type="retrieval_query")
        return res['embedding']
    except Exception as e:
        print("Embedding error:", e)
        return None

def get_top_k_chunks(query, top_k=3):
    emb = get_query_embedding(query)
    if emb is None:
        return []

    emb = np.array([emb]).astype("float32")
    D, I = index.search(emb, top_k)

    results = []
    for idx in I[0]:
        results.append(metadata[idx])
    return results

if __name__ == "__main__":
    query = input("🔍 Enter your query: ")
    matches = get_top_k_chunks(query)
    print("\nTop Relevant Chunks:\n")
    for match in matches:
        print(f"📄 Title: {match['title']}")
        print(f"💬 Chunk: {match['chunk']}\n")
