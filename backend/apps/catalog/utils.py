import re

def normalize_description(text: str) -> str:
    if not text:
        return text
    # remove espaços duplicados e trim
    return re.sub(r"\s+", " ", text).strip()
