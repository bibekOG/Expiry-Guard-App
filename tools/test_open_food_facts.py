import requests
import json
import sys

def test_open_food_facts(barcode: str):
    """
    Tests the Open Food Facts API with a given barcode.
    Returns the parsed basic information (name, category, image).
    """
    print(f"Testing Open Food Facts API for barcode: {barcode}...")
    url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
    
    try:
        headers = {
            'User-Agent': 'ExpiryGuard/1.0 (bibek@example.com)'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') != 1:
            print("[X] Product not found.")
            return False
            
        product = data.get('product', {})
        product_name = product.get('product_name', 'Unknown Name')
        categories = product.get('categories', 'Unknown Categories')
        
        print("\n[SUCCESS] Connection Successful!")
        print(f"Product Name: {product_name}")
        print(f"Categories: {categories}")
        
        # Save output to .tmp for verification
        with open('../.tmp/open_food_facts_test.json', 'w', encoding='utf-8') as f:
            json.dump(product, f, indent=2)
            
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Connection Failed: {e}")
        return False

if __name__ == "__main__":
    # Test with a common barcode (e.g., Coca-Cola)
    test_barcode = "5449000000996"
    if len(sys.argv) > 1:
        test_barcode = sys.argv[1]
    test_open_food_facts(test_barcode)
