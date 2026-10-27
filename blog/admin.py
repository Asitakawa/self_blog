from django.contrib import admin
from django.utils.html import format_html
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from ckeditor_uploader.fields import RichTextUploadingField

from .models import BlogCategory, BlogPost


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
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
                obj.category.color, obj.category.name,
            )
        return '-'
    category_link.short_description = '分类'
    category_link.admin_order_field = 'category__name'


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
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
            obj.color, obj.color,
        )
    color_display.short_description = '颜色'

    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = '文章数'
