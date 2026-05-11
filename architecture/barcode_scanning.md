# SOP: Open Food Facts API Integration

**Goal:** Retrieve accurate grocery item metadata from a scanned barcode.

## Known Constraints & Edge Cases
1. **User-Agent Requirement (403 Forbidden):** The Open Food Facts API will return a `403 Forbidden` error if requested without a valid `User-Agent` header. All requests must identify the application (e.g., `User-Agent: ExpiryGuard/1.0 (contact@example.com)`).
2. **Missing Products:** Not all products exist in the database. The system must handle a `status != 1` response gracefully by prompting the user for manual entry or using OCR on the label.

## Input Shape
- Raw Barcode string (e.g., `"5449000000996"`)

## Output Shape (from API)
Returns the raw JSON from Open Food Facts, but we specifically extract:
- `product_name`
- `categories`
- `image_url` (if available)

## Tool Implementation Reference
See `tools/test_open_food_facts.py` for the reference implementation.
