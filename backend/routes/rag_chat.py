from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
from scripts.query_rag import get_top_k_chunks

rag_bp = Blueprint("rag_chat", __name__)

# ✅ Configure Gemini
genai.configure(api_key="AIzaSyAIj2JW7I15YNITvU-fWY9541KFziZMiX8")

@rag_bp.route("/api/rag-chat", methods=["POST"])
def rag_chat():
    data = request.json
    query = data.get("query", "")

    if not query:
        return jsonify({"error": "Query is required"}), 400

    # Step 1: Retrieve top chunks
    top_chunks = get_top_k_chunks(query, top_k=3)
    if not top_chunks:
        return jsonify({"response": "No relevant information found."})

    # Step 2: Prepare context
    context = "\n\n".join(
        f"From '{chunk.get('title', 'unknown')}':\n{chunk['chunk']}" for chunk in top_chunks
    )

    prompt = f"""You are an assistant helping users with knowledge-based queries.

User question:
{query}

Document snippets:
{context}

Give a helpful answer based on the information above:
"""

    try:
        # Step 3: Generate Gemini response
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        return jsonify({"response": response.text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
