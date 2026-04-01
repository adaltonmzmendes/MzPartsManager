from __future__ import annotations


def normalize_query_to_tags(query: str) -> list[str]:
    """
    Converte a string digitada pelo usuário em uma lista de "tags" (tokens).
    Regras definidas:
    - Quebra por espaços
    - Tudo vira tag (sem stopwords)
    - Normaliza para lowercase
    - Remove tokens vazios
    """
    if not query:
        return []

    return [token.strip().lower() for token in query.split(" ") if token.strip()]
