import os
import shutil
from scripts.chunk_utils import generate_chunks
from scripts.build_rag_index import embed_and_store_chunks

def clean_and_rebuild_index():
    """Clean the index and rebuild it with only properly uploaded files"""
    
    # Remove existing index files
    index_path = "vector_index/faiss_index.index"
    metadata_path = "vector_index/metadata.pkl"
    
    if os.path.exists(index_path):
        os.remove(index_path)
        print("🗑️ Removed old index")
    
    if os.path.exists(metadata_path):
        os.remove(metadata_path)
        print("🗑️ Removed old metadata")
    
    # Get all files in uploads directory
    uploads_dir = "routes/uploads"
    if not os.path.exists(uploads_dir):
        print("❌ Uploads directory doesn't exist!")
        return
    
    files = os.listdir(uploads_dir)
    
    # Filter for actual files (not metadata .json files and not empty PDFs)
    actual_files = []
    for f in files:
        if not f.endswith('.json'):
            file_path = os.path.join(uploads_dir, f)
            # Skip empty files
            if os.path.getsize(file_path) > 0:
                actual_files.append(f)
    
    print(f"📁 Found {len(actual_files)} valid files to index:")
    for file in actual_files:
        print(f"  - {file}")
    
    # Process each file
    for filename in actual_files:
        file_path = os.path.join(uploads_dir, filename)
        
        try:
            # Read file content
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Skip if content is too short or contains error messages
            if len(content.strip()) < 10 or "Error reading PDF" in content:
                print(f"⏭️ Skipping {filename} (too short or contains errors)")
                continue
            
            # Generate chunks
            chunks = generate_chunks(content)
            
            # Update chunk titles to include filename
            for chunk in chunks:
                chunk['title'] = filename
            
            # Embed and store
            print(f"\n🔄 Processing {filename}...")
            embed_and_store_chunks(chunks, filename)
            
        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")
    
    print("\n✅ Index rebuilt successfully!")

if __name__ == "__main__":
    clean_and_rebuild_index() 