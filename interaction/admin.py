from django.contrib import admin
from .models import CommentProxy


@admin.register(CommentProxy)
class CommentProxyAdmin(admin.ModelAdmin):
    list_display = ['nickname', 'content_short', 'is_approved', 'is_hidden', 'created_at']
    list_filter = ['is_approved', 'is_hidden', 'created_at']
    search_fields = ['nickname', 'email', 'content']
    readonly_fields = ['created_at', 'ip_address']

    fieldsets = (
        ('评论信息', {
            'fields': ('nickname', 'email', 'website', 'content')
        }),
        ('头像与IP', {
            'fields': ('avatar', 'ip_address')
        }),
        ('状态', {
            'fields': ('is_approved', 'is_hidden', 'created_at')
        }),
        ('回复', {
            'fields': ('parent',),
            'classes': ('collapse',)
        }),
    )

    actions = ['approve_comments', 'hide_comments', 'show_comments']

    def content_short(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_short.short_description = '评论内容'

    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
    approve_comments.short_description = '通过选中的评论'

    def hide_comments(self, request, queryset):
        queryset.update(is_hidden=True)
    hide_comments.short_description = '隐藏选中的评论'

    def show_comments(self, request, queryset):
        queryset.update(is_hidden=False)
    show_comments.short_description = '显示选中的评论'