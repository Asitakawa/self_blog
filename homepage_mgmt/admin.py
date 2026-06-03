from django.contrib import admin
from .models import (
    HomePageProfileProxy, HomeConfigProxy, SocialLinkProxy,
    HomePageProjectProxy, HomePageSkillProxy, ContactInfoProxy,
    ExhibitionDiaryProxy, MusicCreationProxy
)


@admin.register(HomePageProfileProxy)
class HomePageProfileProxyAdmin(admin.ModelAdmin):
    list_display = ['name', 'title', 'is_active', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['name', 'title']
    readonly_fields = ['updated_at']
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'title', 'description', 'avatar')
        }),
        ('按钮配置', {
            'fields': ('resume_link', 'contact_link', 'resume_button_text', 'contact_button_text')
        }),
        ('状态', {
            'fields': ('is_active', 'updated_at')
        }),
    )

    def has_add_permission(self, request):
        if self.model.objects.exists():
            return False
        return True


@admin.register(HomeConfigProxy)
class HomeConfigProxyAdmin(admin.ModelAdmin):
    fields = [
        'hero_title', 'hero_description',
        'section_title_projects', 'section_title_skills',
        'section_title_music', 'section_title_exhibitions',
        'blog_subtitle',
        'updated_at'
    ]
    readonly_fields = ['updated_at']

    def has_add_permission(self, request):
        if self.model.objects.exists():
            return False
        return True


@admin.register(SocialLinkProxy)
class SocialLinkProxyAdmin(admin.ModelAdmin):
    list_display = ['name', 'url', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'url']
    list_editable = ['order', 'is_active']


@admin.register(HomePageProjectProxy)
class HomePageProjectProxyAdmin(admin.ModelAdmin):
    list_display = ['name', 'url', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description', 'technologies']
    list_editable = ['order', 'is_active']


@admin.register(HomePageSkillProxy)
class HomePageSkillProxyAdmin(admin.ModelAdmin):
    list_display = ['category', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['category', 'skills']
    list_editable = ['order', 'is_active']


@admin.register(ContactInfoProxy)
class ContactInfoProxyAdmin(admin.ModelAdmin):
    list_display = ['contact_type', 'value', 'url', 'order', 'is_active', 'created_at']
    list_filter = ['contact_type', 'is_active']
    search_fields = ['value']
    list_editable = ['order', 'is_active']


@admin.register(ExhibitionDiaryProxy)
class ExhibitionDiaryProxyAdmin(admin.ModelAdmin):
    list_display = ['is_featured', 'order', 'is_active', 'title', 'url', 'created_at']
    list_display_links = ['title']
    list_filter = ['is_active', 'is_featured']
    search_fields = ['title']
    list_editable = ['is_featured', 'order', 'is_active']


@admin.register(MusicCreationProxy)
class MusicCreationProxyAdmin(admin.ModelAdmin):
    list_display = ['title', 'original_author', 'views', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['title', 'original_author']
    list_editable = ['order', 'is_active']