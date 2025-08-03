import os
import json
from scripts.chunk_utils import generate_chunks
from scripts.build_rag_index import embed_and_store_chunks

def reindex_uploads():
    """Re-index all uploaded files that weren't properly indexed"""
    uploads_dir = "routes/uploads"
    
    if not os.path.exists(uploads_dir):
        print("❌ Uploads directory doesn't exist!")
        return
    
    # Get all files in uploads directory
    files = os.listdir(uploads_dir)
    
    # Filter for actual files (not metadata .json files)
    actual_files = [f for f in files if not f.endswith('.json') and not f.endswith('.pdf')]
    
    print(f"📁 Found {len(actual_files)} files to re-index:")
    for file in actual_files:
        print(f"  - {file}")
    
    # Process each file
    for filename in actual_files:
        file_path = os.path.join(uploads_dir, filename)
        
        try:
            # Read file content
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Generate chunks
            chunks = generate_chunks(content)
            
            # Update chunk titles to include filename
            for chunk in chunks:
                chunk['title'] = filename
            
            # Embed and store
            print(f"\n🔄 Processing {filename}...")
            embed_and_store_chunks(chunks, filename)
            
            # Update metadata status
            update_metadata_status(filename, "indexed")
            
        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")
            update_metadata_status(filename, "error")
    
    print("\n✅ Re-indexing complete!")

def update_metadata_status(filename, status):
    """Update the status in metadata files"""
    uploads_dir = "routes/uploads"
    
    # Find the metadata file for this filename
    for f in os.listdir(uploads_dir):
        if f.endswith('.json'):
            meta_path = os.path.join(uploads_dir, f)
            try:
                with open(meta_path, 'r') as meta_file:
                    metadata = json.load(meta_file)
                
                if metadata.get('filename') == filename:
                    metadata['status'] = status
                    with open(meta_path, 'w') as meta_file:
                        json.dump(metadata, meta_file, indent=2)
                    print(f"  ✅ Updated status for {filename} to '{status}'")
                    break
            except Exception as e:
                print(f"  ❌ Error updating metadata for {filename}: {e}")

if __name__ == "__main__":
    reindex_uploads() 