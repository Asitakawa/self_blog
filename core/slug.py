"""中文标题转 URL 别名：先转拼音，再按需加后缀保证唯一。"""

from django.utils.text import slugify
from pypinyin import lazy_pinyin


def build_slug(text, max_length=200):
    """把标题转成 ASCII slug，纯中文标题也能得到有意义的拼音。"""
    if not text:
        return ''
    pinyin = '-'.join(lazy_pinyin(str(text)))
    return slugify(pinyin)[:max_length].strip('-')


def generate_unique_slug(instance, source, field='slug', max_length=200):
    """生成不与同表记录冲突的 slug，冲突时追加 -2、-3。"""
    base = build_slug(source, max_length) or 'item'
    model = instance.__class__

    queryset = model.objects.all()
    if instance.pk:
        queryset = queryset.exclude(pk=instance.pk)

    slug = base
    index = 2
    while queryset.filter(**{field: slug}).exists():
        suffix = f'-{index}'
        slug = base[: max_length - len(suffix)].rstrip('-') + suffix
        index += 1
    return slug
