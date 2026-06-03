from django.contrib import admin
from .models import (
    ProfileProxy, EducationProxy, InternshipProxy, ProjectProxy,
    SkillProxy, CampusActivityProxy, HobbyProxy, TagProxy,
    BlogPostProxy, BlogCategoryProxy
)


class DateRangeMixin:
    """日期范围显示 + end_date「至今」提示 Mixin"""
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
    """单例模式：防止创建多条记录"""
    def has_add_permission(self, request):
        if self.model.objects.exists():
            return False
        return True


@admin.register(ProfileProxy)
class ProfileProxyAdmin(SingletonMixin, admin.ModelAdmin):
    list_display = ['name', 'gender', 'age', 'phone', 'email', 'updated_at']
    search_fields = ['name', 'phone', 'email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(EducationProxy)
class EducationProxyAdmin(DateRangeMixin, admin.ModelAdmin):
    list_display = ['school', 'major', 'degree', 'date_range', 'order']
    list_filter = ['degree', 'start_date']
    search_fields = ['school', 'major']
    list_editable = ['order']


@admin.register(InternshipProxy)
class InternshipProxyAdmin(DateRangeMixin, admin.ModelAdmin):
    list_display = ['company', 'position', 'date_range', 'order']
    list_filter = ['start_date']
    search_fields = ['company', 'position']
    list_editable = ['order']


@admin.register(ProjectProxy)
class ProjectProxyAdmin(DateRangeMixin, admin.ModelAdmin):
    list_display = ['name', 'role', 'date_range', 'order']
    list_filter = ['start_date']
    search_fields = ['name', 'role']
    list_editable = ['order']


@admin.register(SkillProxy)
class SkillProxyAdmin(admin.ModelAdmin):
    list_display = ['category', 'name', 'proficiency', 'order']
    list_filter = ['category', 'proficiency']
    search_fields = ['name', 'category']
    list_editable = ['order']


@admin.register(CampusActivityProxy)
class CampusActivityProxyAdmin(DateRangeMixin, admin.ModelAdmin):
    list_display = ['organization', 'role', 'date_range', 'order']
    list_filter = ['start_date']
    search_fields = ['organization', 'role']
    list_editable = ['order']


@admin.register(HobbyProxy)
class HobbyProxyAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'order']
    search_fields = ['name']
    list_editable = ['order']


@admin.register(TagProxy)
class TagProxyAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'order']
    list_filter = ['color']
    search_fields = ['name']
    list_editable = ['order']


@admin.register(BlogPostProxy)
class BlogPostProxyAdmin(admin.ModelAdmin):
    list_display = ['title', 'category_link', 'views_count', 'is_published', 'created_at']
    list_filter = ['category', 'is_published']
    search_fields = ['title', 'tags', 'content']
    list_editable = ['is_published']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['views_count', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    fieldsets = (
        ('标题与分类', {
            'fields': ('title', 'slug', 'category', 'tags')
        }),
        ('正文内容', {
            'fields': ('content', 'excerpt', 'cover_image')
        }),
        ('状态与统计', {
            'fields': ('is_published', 'views_count', 'created_at', 'updated_at')
        }),
    )

    def category_link(self, obj):
        if obj.category:
            from django.utils.html import format_html
            return format_html(
                '<span style="background:{};color:#fff;padding:2px 10px;border-radius:10px;font-size:0.85rem">{}</span>',
                obj.category.color, obj.category.name
            )
        return '-'
    category_link.short_description = '分类'
    category_link.admin_order_field = 'category__name'


@admin.register(BlogCategoryProxy)
class BlogCategoryProxyAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'color_display', 'order', 'post_count']
    search_fields = ['name']
    list_editable = ['order']
    prepopulated_fields = {'slug': ('name',)}
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'slug', 'color', 'order')
        }),
    )

    def color_display(self, obj):
        from django.utils.html import format_html
        return format_html(
            '<span style="display:inline-block;width:20px;height:20px;background:{};border-radius:50%"></span> {}',
            obj.color, obj.color
        )
    color_display.short_description = '颜色'

    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = '文章数'