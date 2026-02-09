import os
import sys
import random

# =========================
# Ajustar PYTHONPATH
# =========================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

# =========================
# Django setup
# =========================
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "mz.settings"
)

import django
django.setup()

# =========================
# Imports do projeto
# =========================
from apps.catalog.models import Item, Tag, Application
from apps.multicompany.models import Company


def run():
    company = Company.objects.get(cnpj="57734612000125")

    base_codes = [
        "6205-2RS", "6304-2RS", "6305-ZZ", "6203-ZZ", "6204-2RS",
        "30205", "30304", "32006", "32208", "51107",
    ]

    descriptions = [
        "Rolamento rígido de esferas",
        "Rolamento de rolos cônicos",
        "Rolamento blindado",
        "Rolamento selado",
        "Rolamento industrial",
    ]

    tags_pool = [
        "alta rotação", "uso industrial", "automotivo",
        "linha pesada", "linha leve"
    ]

    applications_pool = [
        "motor elétrico",
        "caixa de câmbio",
        "eixo traseiro",
        "máquina agrícola",
        "implemento industrial"
    ]

    created = 0

    for _ in range(500):
        code = random.choice(base_codes)
        desc = random.choice(descriptions)

        item = Item.objects.create(
            company=company,
            description=f"{code} {desc}"
        )

        item.tags.add(*[
            Tag.objects.get_or_create(name=t)[0]
            for t in random.sample(tags_pool, k=random.randint(1, 2))
        ])

        item.applications.add(*[
            Application.objects.get_or_create(name=a)[0]
            for a in random.sample(applications_pool, k=random.randint(1, 2))
        ])

        created += 1

    print(f"✅ {created} itens criados para {company.razao_social}")


if __name__ == "__main__":
    run()
