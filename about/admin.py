from django.contrib import admin

from core.admin_utils import SingletonMixin

from .models import AboutPageInfo, AboutSection


@admin.register(AboutPageInfo)
class AboutPageInfoAdmin(SingletonMixin, admin.ModelAdmin):
    readonly_fields = ['updated_at']
    fieldsets = (
        ('基本信息', {
            'fields': ('welcome_text', 'introduction')
        }),
        ('项目介绍', {
            'fields': ('project_title', 'about_project')
        }),
        ('页脚', {
            'fields': ('footer_blessing',)
        }),
        ('状态', {
            'fields': ('is_active', 'updated_at')
        }),
    )


@admin.register(AboutSection)
class AboutSectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['title']
    readonly_fields = ['created_at']
    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'icon', 'icon_image', 'content')
        }),
        ('排序与状态', {
            'fields': ('order', 'is_active', 'created_at')
        }),
    )
