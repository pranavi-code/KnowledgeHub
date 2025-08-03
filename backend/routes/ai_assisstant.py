import os
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai

# Load API key from .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Configure Gemini
genai.configure(api_key=api_key)

# Use free-tier compatible model
model = genai.GenerativeModel("gemini-1.5-flash")

# Blueprint setup
ai_bp = Blueprint('ai_assistant', __name__)

@ai_bp.route('/ask', methods=['POST'])
def ask():
    try:
        data = request.get_json()
        prompt = data.get("query", "").strip()

        if not prompt:
            return jsonify({"error": "Query is required"}), 400

        response = model.generate_content(prompt)
        return jsonify({"response": response.text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500