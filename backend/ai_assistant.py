import os
import google.generativeai as genai
from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")

# Enhanced chat history with metadata
chat_history = [
    {
        'id': 1,
        'type': 'assistant',
        'content': "Hi! I'm your AI Knowledge Assistant. I can help you understand past technical decisions, find architectural rationale, and explore project history. What would you like to know?",
        'timestamp': datetime.now().isoformat(),
        'sources': [],
        'confidence': None
    }
]

# Mock knowledge sources
mock_sources = [
    {
        'type': 'github',
        'title': 'PR #234: Implement new auth system',
        'url': '#',
        'relevance': 95
    },
    {
        'type': 'docs',
        'title': 'Architecture Decision Record: Auth Strategy',
        'url': '#',
        'relevance': 92
    },
    {
        'type': 'meeting',
        'title': 'Security Review Meeting - Oct 2024',
        'url': '#',
        'relevance': 88
    }
]

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/ai/ask', methods=['POST'])
def ask_ai():
    """Enhanced AI question handling with context"""
    try:
        user_input = request.json.get("question")
        if not user_input:
            return jsonify({"error": "No input provided"}), 400
        
        # Add user message to history
        user_message = {
            'id': len(chat_history) + 1,
            'type': 'user',
            'content': user_input,
            'timestamp': datetime.now().isoformat()
        }
        chat_history.append(user_message)
        
        # Generate AI response
        context_prompt = f"""
        You are a technical knowledge assistant helping developers understand past technical decisions, 
        architectural choices, and project history. The user asked: "{user_input}"
        
        Provide a helpful, technical response that might reference:
        - Past architectural decisions
        - Code changes and pull requests
        - Technical documentation
        - Meeting discussions
        - Best practices
        
        Keep the response informative but concise.
        """
        
        response = model.generate_content(context_prompt)
        ai_reply = response.text
        
        # Create AI response with metadata
        ai_message = {
            'id': len(chat_history) + 1,
            'type': 'assistant',
            'content': ai_reply,
            'timestamp': datetime.now().isoformat(),
            'sources': mock_sources[:3],  # Include relevant sources
            'confidence': 94  # Mock confidence score
        }
        chat_history.append(ai_message)
        
        return jsonify({
            "answer": ai_reply,
            "sources": mock_sources[:3],
            "confidence": 94,
            "message_id": ai_message['id']
        })
        
    except Exception as e:
        error_message = {
            'id': len(chat_history) + 1,
            'type': 'assistant',
            'content': f"I apologize, but I'm having trouble processing your request right now. Error: {str(e)}",
            'timestamp': datetime.now().isoformat(),
            'sources': [],
            'confidence': None
        }
        chat_history.append(error_message)
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    """Get enhanced chat history"""
    return jsonify(chat_history)

@app.route('/suggested-questions', methods=['GET'])
def get_suggested_questions():
    """Get suggested questions for the AI assistant"""
    suggestions = [
        "Why did we migrate from MongoDB to PostgreSQL?",
        "What was the rationale behind our microservices architecture?",
        "How did we implement authentication in the v2.0 release?",
        "What performance optimizations were made last quarter?",
        "Why did we choose Kubernetes over Docker Swarm?",
        "What were the key decisions in our API design?"
    ]
    return jsonify(suggestions)

@app.route('/clear-history', methods=['POST'])
def clear_history():
    """Clear chat history"""
    global chat_history
    chat_history = [chat_history[0]]  # Keep only the initial welcome message
    return jsonify({"message": "Chat history cleared"})

artifacts_bp = Blueprint('artifacts', __name__)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
