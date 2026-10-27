import re

from django import template

register = template.Library()


@register.filter
def split(value, delimiter=None):
    """将字符串按指定分隔符分割成列表，不传参时自动兼容逗号/顿号"""
    if not value:
        return []
    if delimiter is None:
        return re.split(r'[,，、]', value)
    return value.split(delimiter)
