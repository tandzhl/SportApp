# utils/vnpay.py
import hashlib
import hmac
from urllib.parse import urlencode

from django.conf import settings

def generate_vnpay_url(amount, order_id, order_desc, client_ip):
    vnp_data = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': settings.VNPAY_TMN_CODE,
        'vnp_Amount': str(int(amount) * 100),  # nhân 100
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': order_id,
        'vnp_OrderInfo': order_desc,
        'vnp_OrderType': 'other',
        'vnp_Locale': 'vn',
        'vnp_ReturnUrl': settings.VNPAY_RETURN_URL,
        'vnp_IpAddr': client_ip,
        'vnp_CreateDate': order_id,
    }

    sorted_items = sorted(vnp_data.items())
    query_string = urlencode(sorted_items)
    raw_hash = '&'.join(f'{k}={v}' for k, v in sorted_items)
    secure_hash = hmac.new(
        settings.VNPAY_HASH_SECRET.encode(),
        raw_hash.encode(),
        hashlib.sha512
    ).hexdigest()

    payment_url = f"{settings.VNPAY_PAYMENT_URL}?{query_string}&vnp_SecureHash={secure_hash}"
    return payment_url
