# backend/scripts/query_rag.py

def get_top_k_chunks(query, k=3):
    # Dummy chunks to avoid app crashing
    return [
        {"chunk": f"Result 1 for query: {query}"},
        {"chunk": f"Result 2 for query: {query}"},
        {"chunk": f"Result 3 for query: {query}"},
    ]
