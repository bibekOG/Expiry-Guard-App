import os
import json
import sys
try:
    import google.generativeai as genai
    from dotenv import load_dotenv
except ImportError:
    print("[ERROR] Missing dependencies. Please run: pip install google-generativeai python-dotenv")
    sys.exit(1)

def test_gemini_parsing():
    """
    Tests the Gemini API by providing a sample raw text string and asking it to
    extract the item details according to our Data Schema.
    """
    load_dotenv(dotenv_path='../.env')
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key or api_key == "your-gemini-api-key":
        print("[WARNING] GEMINI_API_KEY is missing or invalid in .env")
        print("Please add a real key to test Gemini parsing.")
        return False
        
    print("Testing Gemini API connection...")
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = """
    Extract the grocery item details from this text and return ONLY valid JSON matching this schema:
    {
      "name": "string",
      "quantity": "number",
      "unit": "string",
      "category": "food | medication | household"
    }
    
    Text: "I just bought two gallons of whole milk."
    """
    
    try:
        response = model.generate_content(prompt)
        print("\n[SUCCESS] Connection Successful!")
        print("Gemini Output:")
        print(response.text)
        
        # Save output to .tmp for verification
        with open('../.tmp/gemini_test.txt', 'w', encoding='utf-8') as f:
            f.write(response.text)
            
        return True
    except Exception as e:
        print(f"[ERROR] Connection Failed: {e}")
        return False

if __name__ == "__main__":
    test_gemini_parsing()
