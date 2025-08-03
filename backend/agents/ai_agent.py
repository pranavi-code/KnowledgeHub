# agent/ai_agent.py
import google.generativeai as genai
from utils.load_uploads import load_uploads
from utils.prompt_builder import build_prompt
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("AIzaSyAIj2JW7I15YNITvU-fWY9541KFziZMiX8"))

# ✅ Use free-tier model name
model = genai.GenerativeModel("gemini-1.5-flash")

def answer_query(user_query):
    try:
        uploads = load_uploads()
        prompt = build_prompt(user_query, uploads)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"