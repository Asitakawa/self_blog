def get_client_ip(request):
    """取客户端 IP，兼容 Nginx 反向代理转发的 X-Forwarded-For。"""
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')
