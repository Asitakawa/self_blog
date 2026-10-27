"""后台共用基类：统一分页、搜索、图片预览、单例配置与启停操作。"""

from django.contrib import admin, messages
from django.utils.html import format_html


class BaseModelAdmin(admin.ModelAdmin):
    """全站后台的默认行为，避免每个 ModelAdmin 重复声明。"""

    list_per_page = 30
    save_on_top = True
    empty_value_display = '—'
    show_facets = admin.ShowFacets.ALWAYS


class SingletonAdmin(BaseModelAdmin):
    """单例配置表：已有记录时不允许再新增。"""

    def has_add_permission(self, request):
        return not self.model.objects.exists()


class DateRangeMixin:
    """列表页展示「起始 - 结束」时间区间，结束时间为空时显示「至今」。"""

    @admin.display(description='时间', ordering='start_date')
    def date_range(self, obj):
        start = obj.start_date.strftime('%Y.%m')
        end = obj.end_date.strftime('%Y.%m') if obj.end_date else '至今'
        return f'{start} - {end}'

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if 'end_date' in form.base_fields:
            form.base_fields['end_date'].required = False
            form.base_fields['end_date'].help_text = '留空表示「至今」'
            form.base_fields['end_date'].widget.attrs['placeholder'] = '留空表示至今'
        return form


class ImagePreviewMixin:
    """详情页显示当前图片，列表页显示缩略图。"""

    preview_field = None
    preview_max_width = 220

    def get_readonly_fields(self, request, obj=None):
        fields = list(super().get_readonly_fields(request, obj))
        if 'image_preview' not in fields:
            fields.append('image_preview')
        return fields

    @admin.display(description='当前图片')
    def image_preview(self, obj):
        file = getattr(obj, self.preview_field, None) if obj and self.preview_field else None
        if not file:
            return '尚未上传'
        return format_html(
            '<img src="{}" class="sb-admin-preview" style="max-width:{}px" alt="">',
            file.url,
            self.preview_max_width,
        )

    @admin.display(description='图片')
    def image_thumb(self, obj):
        file = getattr(obj, self.preview_field, None) if obj and self.preview_field else None
        if not file:
            return '—'
        return format_html('<img src="{}" class="sb-admin-thumb" loading="lazy" alt="">', file.url)


class ActiveToggleMixin:
    """给带 is_active 字段的模型提供批量启停。"""

    @admin.action(description='启用选中项')
    def activate(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'已启用 {count} 项', messages.SUCCESS)

    @admin.action(description='停用选中项')
    def deactivate(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'已停用 {count} 项', messages.SUCCESS)


class IconPreviewMixin(ImagePreviewMixin):
    """图标字段：优先显示上传的图片，否则按类名渲染图标。"""

    icon_field = 'icon'

    @admin.display(description='图标')
    def icon_preview(self, obj):
        file = getattr(obj, self.preview_field, None) if obj and self.preview_field else None
        if file:
            return format_html('<img src="{}" class="sb-admin-thumb" alt="">', file.url)

        icon = getattr(obj, self.icon_field, '') if obj else ''
        if not icon:
            return '—'
        css = f'bi {icon}' if icon.startswith('bi-') else icon
        return format_html('<i class="{}"></i> <code class="sb-muted">{}</code>', css, icon)

