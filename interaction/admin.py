from django.contrib import admin, messages

from core.admin_base import BaseModelAdmin

from .models import Comment


@admin.register(Comment)
class CommentAdmin(BaseModelAdmin):
    list_display = ['nickname', 'content_short', 'parent_link', 'is_approved', 'is_hidden', 'created_at']
    list_display_links = ['nickname']
    list_editable = ['is_approved', 'is_hidden']
    list_filter = ['is_approved', 'is_hidden', 'created_at']
    list_select_related = ['parent']
    search_fields = ['nickname', 'email', 'content']
    autocomplete_fields = ['parent']
    readonly_fields = ['created_at', 'ip_address']
    date_hierarchy = 'created_at'
    actions = ['approve_comments', 'hide_comments', 'show_comments']
    fieldsets = (
        ('评论信息', {
            'fields': ('nickname', 'email', 'website', 'content'),
        }),
        ('头像与 IP', {
            'fields': ('avatar', 'ip_address', 'created_at'),
            'classes': ('collapse',),
        }),
        ('状态', {
            'fields': ('is_approved', 'is_hidden'),
            'description': '通过审核且未隐藏的评论才会在前台显示。',
        }),
        ('回复', {
            'fields': ('parent',),
            'classes': ('collapse',),
        }),
    )

    @admin.display(description='评论内容')
    def content_short(self, obj):
        return obj.content[:50] + '…' if len(obj.content) > 50 else obj.content

    @admin.display(description='回复对象')
    def parent_link(self, obj):
        if not obj.parent:
            return '—'
        return f'@{obj.parent.nickname}'

    @admin.action(description='通过选中评论')
    def approve_comments(self, request, queryset):
        count = queryset.update(is_approved=True, is_hidden=False)
        self.message_user(request, f'已通过 {count} 条评论', messages.SUCCESS)

    @admin.action(description='隐藏选中评论')
    def hide_comments(self, request, queryset):
        count = queryset.update(is_hidden=True)
        self.message_user(request, f'已隐藏 {count} 条评论', messages.SUCCESS)

    @admin.action(description='恢复显示选中评论')
    def show_comments(self, request, queryset):
        count = queryset.update(is_hidden=False)
        self.message_user(request, f'已恢复显示 {count} 条评论', messages.SUCCESS)
