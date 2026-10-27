from django.contrib import admin, messages
from django.utils.html import format_html
from ckeditor_uploader.fields import RichTextUploadingField
from ckeditor_uploader.widgets import CKEditorUploadingWidget

from core.admin_base import BaseModelAdmin, ImagePreviewMixin

from .models import BlogCategory, BlogPost


@admin.register(BlogPost)
class BlogPostAdmin(ImagePreviewMixin, BaseModelAdmin):
    preview_field = 'cover_image'
    preview_max_width = 320

    formfield_overrides = {
        RichTextUploadingField: {'widget': CKEditorUploadingWidget},
    }
    list_display = ['image_thumb', 'title', 'category_link', 'views_count', 'is_published', 'created_at']
    list_display_links = ['title']
    list_editable = ['is_published']
    list_filter = ['category', 'is_published', 'created_at']
    list_select_related = ['category']
    search_fields = ['title', 'tags', 'content']
    autocomplete_fields = ['category']
    readonly_fields = ['views_count', 'created_at', 'updated_at', 'image_preview']
    date_hierarchy = 'created_at'
    actions = ['publish_posts', 'unpublish_posts']
    fieldsets = (
        ('标题与分类', {
            'fields': ('title', 'slug', 'category', 'tags'),
            'description': '别名留空会按标题自动生成拼音，无需手填。',
        }),
        ('正文内容', {
            'fields': ('content', 'excerpt'),
        }),
        ('封面图', {
            'fields': ('cover_image', 'image_preview'),
        }),
        ('状态与统计', {
            'fields': ('is_published', 'views_count', 'created_at', 'updated_at'),
        }),
    )

    @admin.display(description='分类', ordering='category__name')
    def category_link(self, obj):
        if not obj.category:
            return '—'
        return format_html(
            '<span class="sb-chip" style="background:{}">{}</span>',
            obj.category.color, obj.category.name,
        )

    @admin.action(description='发布选中文章')
    def publish_posts(self, request, queryset):
        count = queryset.update(is_published=True)
        self.message_user(request, f'已发布 {count} 篇文章', messages.SUCCESS)

    @admin.action(description='转为草稿')
    def unpublish_posts(self, request, queryset):
        count = queryset.update(is_published=False)
        self.message_user(request, f'已将 {count} 篇文章转为草稿', messages.SUCCESS)


@admin.register(BlogCategory)
class BlogCategoryAdmin(BaseModelAdmin):
    list_display = ['name', 'slug', 'color_display', 'order', 'post_count']
    list_editable = ['order']
    search_fields = ['name', 'slug']
    readonly_fields = ['created_at']
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'slug', 'color', 'order'),
            'description': '别名留空会按分类名自动生成拼音。',
        }),
        ('时间', {
            'fields': ('created_at',),
        }),
    )

    @admin.display(description='颜色')
    def color_display(self, obj):
        return format_html(
            '<span class="sb-color"><i style="background:{}"></i>{}</span>',
            obj.color, obj.color,
        )

    @admin.display(description='文章数')
    def post_count(self, obj):
        return obj.posts.count()
