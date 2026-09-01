from django.db.models import Sum, F, Count, DecimalField
from django.db.models.functions import TruncDate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.cart.models import Cart
from apps.opportunities.models import LostSale

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.company:
            return Response({"detail": "Usuário sem empresa vinculada."}, status=400)

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        carts = Cart.objects.filter(company=user.company, status='closed')
        opps = LostSale.objects.filter(company=user.company)

        if start_date:
            carts = carts.filter(updated_at__gte=f"{start_date} 00:00:00")
            opps = opps.filter(created_at__gte=f"{start_date} 00:00:00")
        if end_date:
            carts = carts.filter(updated_at__lte=f"{end_date} 23:59:59")
            opps = opps.filter(created_at__lte=f"{end_date} 23:59:59")

        totals = carts.aggregate(
            total_revenue=Sum(F('items__quantity') * F('items__item__inventory__sell_price'), output_field=DecimalField()),
            total_cost=Sum(F('items__quantity') * F('items__item__inventory__cost_price'), output_field=DecimalField()),
            total_sales=Count('id', distinct=True)
        )

        total_revenue = totals.get('total_revenue') or 0
        total_cost = totals.get('total_cost') or 0
        total_sales = totals.get('total_sales') or 0

        profit = total_revenue - total_cost
        avg_ticket = (total_revenue / total_sales) if total_sales > 0 else 0

        opps_count = opps.count()
        total_attempts = total_sales + opps_count
        conversion_rate = (total_sales / total_attempts * 100) if total_attempts > 0 else 0

        chart_data_qs = carts.annotate(
            date=TruncDate('updated_at')
        ).values('date').annotate(
            revenue=Sum(F('items__quantity') * F('items__item__inventory__sell_price'), output_field=DecimalField())
        ).order_by('date')

        chart_data = [
            {"date": str(item['date']), "revenue": float(item['revenue'] or 0)}
            for item in chart_data_qs
        ]

        return Response({
            "total_revenue": float(total_revenue),
            "profit": float(profit),
            "total_sales": total_sales,
            "avg_ticket": float(avg_ticket),
            "conversion_rate": float(conversion_rate),
            "chart_data": chart_data
        })