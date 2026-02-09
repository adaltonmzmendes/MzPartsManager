import re

def normalize_description(text: str) -> str:
    if not text:
        return text
    return re.sub(r"\s+", " ", text).strip().lower()

def extract_tokens_from_description(description: str) -> list[str]:
    if not description:
        return []
    return description.split(" ")
