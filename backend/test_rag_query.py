from scripts.query_rag import get_top_k_chunks

def test_rag_query():
    query = "summarize admin.js"
    print(f"🔍 Testing query: '{query}'")
    
    try:
        results = get_top_k_chunks(query, top_k=3)
        
        if results:
            print(f"✅ Found {len(results)} relevant chunks:")
            for i, result in enumerate(results, 1):
                print(f"\n📄 Chunk {i} (from '{result.get('title', 'Unknown')}'):")
                print(f"   {result.get('chunk', 'No content')[:200]}...")
        else:
            print("❌ No relevant chunks found")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_rag_query() 