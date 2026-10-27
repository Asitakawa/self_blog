from django.contrib import admin
from django.db import models
from ckeditor_uploader.widgets import CKEditorUploadingWidget

from core.admin_base import BaseModelAdmin, IconPreviewMixin, SingletonAdmin

from .models import AboutPageInfo, AboutSection


@admin.register(AboutPageInfo)
class AboutPageInfoAdmin(SingletonAdmin):
    readonly_fields = ['updated_at']
    fieldsets = (
        ('基本信息', {
            'fields': ('welcome_text', 'introduction'),
        }),
        ('项目介绍', {
            'fields': ('project_title', 'about_project'),
        }),
        ('页脚', {
            'fields': ('footer_blessing',),
        }),
        ('状态', {
            'fields': ('is_active', 'updated_at'),
        }),
    )


@admin.register(AboutSection)
class AboutSectionAdmin(IconPreviewMixin, BaseModelAdmin):
    preview_field = 'icon_image'
    formfield_overrides = {
        models.TextField: {'widget': CKEditorUploadingWidget},
    }
    list_display = ['title', 'icon_preview', 'order', 'is_active', 'created_at']
    list_editable = ['order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['title', 'content']
    readonly_fields = ['created_at', 'image_preview']
    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'icon', 'icon_image', 'image_preview'),
        }),
        ('内容', {
            'fields': ('content',),
        }),
        ('排序与状态', {
            'fields': ('order', 'is_active', 'created_at'),
        }),
    )
