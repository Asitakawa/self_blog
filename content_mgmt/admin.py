from django.contrib import admin
from django.utils.html import format_html
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from ckeditor_uploader.fields import RichTextUploadingField
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
    list_display = ['name', 'job_intention', 'gender', 'age', 'hometown', 'expected_salary', 'phone', 'email', 'updated_at']
    list_filter = ['gender']
    search_fields = ['name', 'phone', 'email', 'job_intention']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'updated_at'
    fieldsets = (
        ('个人信息', {
            'fields': ('name', 'gender', 'age', 'hometown', 'avatar', 'introduction')
        }),
        ('求职信息', {
            'fields': ('job_intention', 'expected_salary')
        }),
        ('联系方式', {
            'fields': ('phone', 'email')
        }),
        ('时间', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(EducationProxy)
class EducationProxyAdmin(DateRangeMixin, admin.ModelAdmin):
    list_display = ['school', 'major', 'degree', 'date_range', 'order']
    list_filter = ['degree', 'start_date']
    search_fields = ['school', 'major']
    list_editable = ['order']
    fieldsets = (
        ('学校信息', {
            'fields': ('school', 'major', 'degree', 'image')
        }),
        ('时间', {
            'fields': ('start_date', 'end_date')
        }),
        ('描述与排序', {
            'fields': ('description', 'order')
        }),
    )


@admin.register(InternshipProxy)
class InternshipProxyAdmin(DateRangeMixin, admin.ModelAdmin):
    list_display = ['company', 'position', 'date_range', 'order']
    list_filter = ['start_date']
    search_fields = ['company', 'position']
    list_editable = ['order']
    fieldsets = (
        ('公司信息', {
            'fields': ('company', 'position', 'image')
        }),
        ('时间', {
            'fields': ('start_date', 'end_date')
        }),
        ('职责与排序', {
            'fields': ('responsibilities', 'order')
        }),
    )


@admin.register(ProjectProxy)
class ProjectProxyAdmin(DateRangeMixin, admin.ModelAdmin):
    list_display = ['name', 'role', 'technologies_short', 'date_range', 'order']
    list_filter = ['start_date']
    search_fields = ['name', 'role', 'technologies']
    list_editable = ['order']
    fieldsets = (
        ('项目信息', {
            'fields': ('name', 'role', 'technologies', 'image')
        }),
        ('时间', {
            'fields': ('start_date', 'end_date')
        }),
        ('描述与排序', {
            'fields': ('description', 'order')
        }),
    )

    def technologies_short(self, obj):
        if obj.technologies:
            return obj.technologies[:30] + '...' if len(obj.technologies) > 30 else obj.technologies
        return '-'
    technologies_short.short_description = '技术栈'


@admin.register(SkillProxy)
class SkillProxyAdmin(admin.ModelAdmin):
    list_display = ['category', 'name', 'proficiency', 'order']
    list_filter = ['category', 'proficiency']
    search_fields = ['name', 'category']
    list_editable = ['order']


@admin.register(CampusActivityProxy)
class CampusActivityProxyAdmin(DateRangeMixin, admin.ModelAdmin):
    list_display = ['organization', 'role', 'achievements_short', 'date_range', 'order']
    list_filter = ['start_date']
    search_fields = ['organization', 'role']
    list_editable = ['order']
    fieldsets = (
        ('活动信息', {
            'fields': ('organization', 'role', 'achievements', 'image')
        }),
        ('时间', {
            'fields': ('start_date', 'end_date')
        }),
        ('描述与排序', {
            'fields': ('description', 'order')
        }),
    )

    def achievements_short(self, obj):
        if obj.achievements:
            return obj.achievements[:30] + '...' if len(obj.achievements) > 30 else obj.achievements
        return '-'
    achievements_short.short_description = '成就'


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
    formfield_overrides = {
        RichTextUploadingField: {'widget': CKEditorUploadingWidget},
    }
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
        return format_html(
            '<span style="display:inline-block;width:20px;height:20px;background:{};border-radius:50%"></span> {}',
            obj.color, obj.color
        )
    color_display.short_description = '颜色'

    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = '文章数'