from langchain.text_splitter import RecursiveCharacterTextSplitter

def chunk_document(text, metadata):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_text(text)
    return [{"text": chunk, "metadata": metadata} for chunk in chunks]
