from django import template

register = template.Library()

@register.filter
def split(value, delimiter='、'):
    """将字符串按指定分隔符分割成列表"""
    if not value:
        return []
    return value.split(delimiter)
