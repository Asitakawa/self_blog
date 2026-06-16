from django.contrib import admin
from django.utils.html import format_html
from .models import (
    HomePageProfileProxy, HomeConfigProxy, SocialLinkProxy,
    HomePageProjectProxy, HomePageSkillProxy, ContactInfoProxy,
    ExhibitionDiaryProxy, MusicCreationProxy,
    HomeBadgeProxy
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


@admin.register(HomeBadgeProxy)
class HomeBadgeProxyAdmin(admin.ModelAdmin):
    list_display = ['text', 'icon', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['text']
    list_editable = ['order', 'is_active']
    fieldsets = (
        ('词条内容', {
            'fields': ('text', 'icon')
        }),
        ('排序与状态', {
            'fields': ('order', 'is_active')
        }),
    )


@admin.register(HomeConfigProxy)
class HomeConfigProxyAdmin(admin.ModelAdmin):
    list_display = ['blog_subtitle', 'updated_at']
    readonly_fields = ['updated_at']
    fieldsets = (
        ('Hero 区域', {
            'fields': ('hero_title', 'hero_description')
        }),
        ('区块标题', {
            'fields': ('section_title_projects', 'section_title_skills',
                       'section_title_music', 'section_title_exhibitions')
        }),
        ('博客', {
            'fields': ('blog_subtitle',)
        }),
        ('时间', {
            'fields': ('updated_at',)
        }),
    )

    def has_add_permission(self, request):
        if self.model.objects.exists():
            return False
        return True


@admin.register(SocialLinkProxy)
class SocialLinkProxyAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon_preview', 'url', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'url']
    list_editable = ['order', 'is_active']
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'url', 'description')
        }),
        ('图标', {
            'fields': ('icon', 'icon_image'),
            'description': '填写 FontAwesome 类名（如 fab fa-github）或上传自定义图标图片'
        }),
        ('排序与状态', {
            'fields': ('order', 'is_active')
        }),
    )

    def icon_preview(self, obj):
        if obj.icon_image:
            return format_html('<img src="{}" style="width:24px;height:24px;object-fit:contain">', obj.icon_image.url)
        elif obj.icon:
            return obj.icon
        return '-'
    icon_preview.short_description = '图标'


@admin.register(HomePageProjectProxy)
class HomePageProjectProxyAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon_preview', 'url', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description', 'technologies']
    list_editable = ['order', 'is_active']
    fieldsets = (
        ('项目信息', {
            'fields': ('name', 'description', 'url')
        }),
        ('图标与技术', {
            'fields': ('icon', 'icon_image', 'technologies'),
            'description': '填写 Bootstrap Icons 类名（如 bi-github）或上传自定义图标图片'
        }),
        ('排序与状态', {
            'fields': ('order', 'is_active')
        }),
    )

    def icon_preview(self, obj):
        if obj.icon_image:
            return format_html('<img src="{}" style="width:24px;height:24px;object-fit:contain">', obj.icon_image.url)
        elif obj.icon:
            return obj.icon
        return '-'
    icon_preview.short_description = '图标'


@admin.register(HomePageSkillProxy)
class HomePageSkillProxyAdmin(admin.ModelAdmin):
    list_display = ['category', 'skills_short', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['category', 'skills']
    list_editable = ['order', 'is_active']
    fieldsets = (
        ('技能分类', {
            'fields': ('category', 'skills')
        }),
        ('图标', {
            'fields': ('icon', 'icon_image'),
            'description': '填写 Bootstrap Icons 类名（如 bi-code-slash）或上传自定义图标图片'
        }),
        ('排序与状态', {
            'fields': ('order', 'is_active')
        }),
    )

    def skills_short(self, obj):
        if obj.skills:
            lines = obj.skills.split('\n')
            return ' | '.join([l.strip() for l in lines if l.strip()][:3])
        return '-'
    skills_short.short_description = '技能列表'


@admin.register(ContactInfoProxy)
class ContactInfoProxyAdmin(admin.ModelAdmin):
    list_display = ['contact_type', 'value', 'url', 'order', 'is_active', 'created_at']
    list_filter = ['contact_type', 'is_active']
    search_fields = ['value']
    list_editable = ['order', 'is_active']
    fieldsets = (
        ('联系方式', {
            'fields': ('contact_type', 'value', 'url')
        }),
        ('图标', {
            'fields': ('icon', 'icon_image'),
            'description': '填写 Bootstrap Icons 类名（如 bi-envelope）或上传自定义图标图片'
        }),
        ('排序与状态', {
            'fields': ('order', 'is_active')
        }),
    )


@admin.register(ExhibitionDiaryProxy)
class ExhibitionDiaryProxyAdmin(admin.ModelAdmin):
    list_display = ['thumbnail_display', 'title', 'is_featured', 'is_active', 'order', 'created_at']
    list_display_links = ['title']
    list_filter = ['is_active', 'is_featured']
    search_fields = ['title']
    list_editable = ['is_featured', 'order', 'is_active']
    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'image', 'url')
        }),
        ('排序与状态', {
            'fields': ('order', 'is_featured', 'is_active')
        }),
        ('时间', {
            'fields': ('created_at',)
        }),
    )
    readonly_fields = ['created_at']

    def thumbnail_display(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:60px;height:40px;object-fit:cover;border-radius:4px">', obj.image.url)
        return '-'
    thumbnail_display.short_description = '缩略图'


@admin.register(MusicCreationProxy)
class MusicCreationProxyAdmin(admin.ModelAdmin):
    list_display = ['title', 'original_author', 'views', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['title', 'original_author']
    list_editable = ['order', 'is_active']
    fieldsets = (
        ('作品信息', {
            'fields': ('title', 'original_author', 'version', 'url')
        }),
        ('统计与排序', {
            'fields': ('views', 'order', 'is_active')
        }),
    )