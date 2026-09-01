import re
import unicodedata

def remove_accents(text: str) -> str:
    if not text:
        return text
    return ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )

def normalize_name(text: str) -> str:
    if not text:
        return text
    return remove_accents(re.sub(r"\s+", " ", text).strip().lower())

def normalize_description(text: str, to_lower: bool = False) -> str:
    if not text:
        return text
    cleaned = re.sub(r"\s+", " ", text).strip()
    return cleaned.lower() if to_lower else cleaned

def extract_tokens_from_description(description: str) -> list[str]:
    if not description:
        return []
    return description.split(" ")