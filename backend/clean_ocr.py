import re

def clean_ocr_results(texts):
    """
    Clean and filter OCR results.
    Args:
        texts (list of str): List of text segments from OCR.
    Returns:
        list of str: Filtered and cleaned text segments.
    """
    filtered_texts = []
    for text in texts:
        # Remove unwanted tags (e.g., </s>) but keep the rest of the text
        cleaned_text = re.sub(r"</?s>", "", text)

        # Skip very short text after cleaning
        if len(cleaned_text.strip()) < 3:
            continue
        
        # Check if there's any meaningful alphanumeric content left
        if not re.search(r"[a-zA-Z0-9]", cleaned_text):
            continue

        # Add cleaned text
        filtered_texts.append(cleaned_text.strip())

    return filtered_texts