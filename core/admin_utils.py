"""后台管理共用的 Mixin，供各业务 app 的 admin 复用。"""


class DateRangeMixin:
    """列表页展示「起始 - 结束」时间区间，结束时间为空时显示「至今」。"""

    def date_range(self, obj):
        start = obj.start_date.strftime('%Y.%m')
        end = obj.end_date.strftime('%Y.%m') if obj.end_date else '至今'
        return f'{start} - {end}'

    date_range.short_description = '时间'
    date_range.admin_order_field = 'start_date'

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if 'end_date' in form.base_fields:
            form.base_fields['end_date'].required = False
            form.base_fields['end_date'].help_text = '留空表示「至今」'
            form.base_fields['end_date'].widget.attrs['placeholder'] = '留空表示至今'
        return form


class SingletonMixin:
    """单例配置表：已有记录时禁用「新增」按钮。"""

    def has_add_permission(self, request):
        return not self.model.objects.exists()
