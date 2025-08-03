import faiss
import pickle
import os

def test_index():
    INDEX_PATH = "vector_index/faiss_index.index"
    METADATA_PATH = "vector_index/metadata.pkl"
    
    if not os.path.exists(INDEX_PATH) or not os.path.exists(METADATA_PATH):
        print("❌ Index files don't exist!")
        return
    
    try:
        # Load index
        index = faiss.read_index(INDEX_PATH)
        print(f"✅ Index loaded with {index.ntotal} vectors")
        
        # Load metadata
        with open(METADATA_PATH, "rb") as f:
            metadata = pickle.load(f)
        
        print(f"✅ Metadata loaded with {len(metadata)} entries")
        
        # Show some sample metadata
        print("\n📄 Sample documents in index:")
        titles = set()
        for item in metadata:
            titles.add(item.get('title', 'Unknown'))
        
        for title in list(titles)[:10]:  # Show first 10 unique titles
            print(f"  - {title}")
            
        if len(titles) > 10:
            print(f"  ... and {len(titles) - 10} more")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_index() 