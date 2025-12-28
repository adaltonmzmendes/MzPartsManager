from django.core.paginator import Paginator
from backend.apps.catalog.models import Item
from backend.apps.multicompany.models import Company
from .models import (
    LocalApplication, LocalConversion,
    SuggestedApplication, SuggestedConversion,
    VerifiedApplication, VerifiedConversion,
)

def search_items(company: Company, query: str, page: int, page_size: int):
    qs = Item.objects.filter(company=company, active=True).order_by("description")
    q = (query or "").strip()
    if q:
        qs = qs.filter(description__icontains=q)

    paginator = Paginator(qs, page_size)
    p = paginator.get_page(page)

    items = [{
        "id": str(it.id),
        "sku": it.sku,
        "description": it.description,
        "stock": int(getattr(it, "quantity_on_hand", 0) or 0),
    } for it in p.object_list]

    return {
        "success": True,
        "query": q,
        "page": p.number,
        "page_size": page_size,
        "total": paginator.count,
        "has_more": p.has_next(),
        "items": items,
    }

def get_item_meta(company: Company, item: Item):
    ik = item.identity_key

    verified_apps = list(
        VerifiedApplication.objects.filter(identity_key=ik).order_by("value_norm")
        .values("id", "value_raw")
    )
    verified_convs = list(
        VerifiedConversion.objects.filter(identity_key=ik).order_by("code_norm")
        .values("id", "code_raw", "code_norm")
    )

    local_apps = list(
        LocalApplication.objects.filter(item=item, company=company).order_by("text_norm")
        .values("id", "text_raw")
    )
    local_convs = list(
        LocalConversion.objects.filter(item=item, company=company).order_by("code_norm")
        .values("id", "code_raw", "code_norm")
    )

    sugg_apps = list(
        SuggestedApplication.objects.filter(identity_key=ik, status="pending")
        .exclude(origin_company=company)
        .order_by("-approvals_count", "-created_at")
        .select_related("created_by__user")
    )
    sugg_convs = list(
        SuggestedConversion.objects.filter(identity_key=ik, status="pending")
        .exclude(origin_company=company)
        .order_by("-approvals_count", "-created_at")
        .select_related("created_by__user")
    )

    def user_name(up):
        u = up.user
        return (u.get_full_name() or u.username)

    return {
        "success": True,
        "item": {
            "id": str(item.id),
            "sku": item.sku,
            "description": item.description,
            "stock": int(getattr(item, "quantity_on_hand", 0) or 0),
            "identity_key": ik,
        },
        "applications": {
            "verified": verified_apps,
            "local": local_apps,
            "suggested": [{
                "id": str(s.id),
                "text": s.value_raw,
                "approvals": s.approvals_count,
                "by": user_name(s.created_by),
            } for s in sugg_apps],
        },
        "conversions": {
            "verified": verified_convs,
            "local": local_convs,
            "suggested": [{
                "id": str(s.id),
                "code": s.code_raw,
                "approvals": s.approvals_count,
                "by": user_name(s.created_by),
            } for s in sugg_convs],
        }
    }
