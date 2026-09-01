import requests
import hmac
import hashlib

def validar_hmac_nfeio(credenciais, payload_body: bytes, signature: str) -> bool:
    secret = str(credenciais.get("nfe_io_webhook_secret", "")).strip()
    if not secret or not signature:
        return False

    calculated = hmac.new(
        secret.encode('utf-8'),
        msg=payload_body,
        digestmod=hashlib.sha1
    ).hexdigest()
    
    return hmac.compare_digest(calculated, signature)

def emitir_nfce_nfeio(cart):
    company = cart.company
    credenciais = company.credenciais_api or {}
    
    api_key = str(credenciais.get("nfe_io_api_key", "")).strip()
    company_id = str(credenciais.get("nfe_io_company_id", "")).strip()

    if not api_key or not company_id:
        raise ValueError("Credenciais da API NFe.io não configuradas na empresa.")

    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json"
    }

    payment_map = {
        "dinheiro": "Cash",
        "pix": "Pix",
        "cartao_credito": "CreditCard",
        "cartao_debito": "DebitCard"
    }

    items_payload = [
        {
            "code": str(cart_item.item.id),
            "description": cart_item.item.description[:120],
            "quantity": cart_item.quantity,
            "unitAmount": float(cart_item.item.inventory.sell_price),
            "cfop": "5102",
            "ncm": "87089990", 
            "tax": {"icms": {"csosn": "102", "origin": "0"}}
        }
        for cart_item in cart.items.select_related('item__inventory')
    ]

    if company.ambiente == "homologacao":
        items_payload.insert(0, {
            "code": "HOMOLOGACAO",
            "description": "NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL",
            "quantity": 1,
            "unitAmount": 1.00,
            "cfop": "5102",
            "ncm": "87089990",
            "tax": {"icms": {"csosn": "102", "origin": "0"}}
        })

    # Calcula o total dinamicamente baseado nos itens do payload para garantir que vPag == vNF
    total_amount = sum(item["quantity"] * item["unitAmount"] for item in items_payload)

    payload = {
        "environment": "Development" if company.ambiente == "homologacao" else "Production",
        "issueOn": cart.updated_at.isoformat(),
        "documentType": "NFCe",
        "payment": [{"paymentDetail": [{"method": payment_map.get(cart.payment_method, "Cash"), "amount": total_amount}]}],
        "items": items_payload
    }

    url = f"https://api.nfse.io/v2/companies/{company_id}/consumerinvoices"
    response = requests.post(url, json=payload, headers=headers, timeout=15)
    
    if response.status_code in [200, 201, 202]:
        data = response.json()
        cart.nfe_id = data.get("id")
        cart.save(update_fields=["nfe_id"])
        return data
        
    raise Exception(f"Erro {response.status_code} na NFe.io. Detalhe: {response.text}")