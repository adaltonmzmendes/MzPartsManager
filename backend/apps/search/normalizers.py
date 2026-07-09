from __future__ import annotations
import unicodedata


def normalize_query_to_tags(query: str) -> list[str]:
    if not query:
        return []

    normalized_query = unicodedata.normalize("NFKD", query)
    unaccented_query = "".join(c for c in normalized_query if not unicodedata.combining(c))

    return [token.strip().lower() for token in unaccented_query.split(" ") if token.strip()]