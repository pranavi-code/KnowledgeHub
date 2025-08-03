def build_prompt(query, uploads):
    prompt = f"You are an intelligent assistant. Answer the question: \"{query}\" using the following uploaded documents:\n\n"

    for doc in uploads:
        prompt += f"Title: {doc.get('title', 'Unknown')}\n"
        prompt += f"Type: {doc.get('type', 'Unknown')}\n"
        prompt += f"Author: {doc.get('author', 'Unknown')}\n"
        prompt += f"Tags: {', '.join(doc.get('tags', []))}\n"
        prompt += f"Description: {doc.get('description', '')}\n"
        prompt += f"Content: {doc.get('content', '')[:3000]}\n"  # Gemini input token-safe
        prompt += "-"*40 + "\n"

    prompt += "\nRespond accurately and concisely based on the information above."
    return prompt