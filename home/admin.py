from django.contrib import admin, messages

from core.admin_base import (
    ActiveToggleMixin,
    BaseModelAdmin,
    IconPreviewMixin,
    ImagePreviewMixin,
    SingletonAdmin,
)

from .models import (
    ContactInfo,
    ExhibitionDiary,
    HomeBadge,
    HomeConfig,
    HomePageProfile,
    HomePageProject,
    HomePageSkill,
    MusicCreation,
    SocialLink,
)


@admin.register(HomePageProfile)
class HomePageProfileAdmin(ImagePreviewMixin, SingletonAdmin):
    preview_field = 'avatar'
    list_display = ['image_thumb', 'name', 'title', 'is_active', 'updated_at']
    list_display_links = ['name']
    list_filter = ['is_active']
    search_fields = ['name', 'title']
    readonly_fields = ['updated_at', 'image_preview']
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'title', 'description'),
        }),
        ('头像', {
            'fields': ('avatar', 'image_preview'),
        }),
        ('按钮配置', {
            'fields': ('resume_link', 'contact_link', 'resume_button_text', 'contact_button_text'),
        }),
        ('状态', {
            'fields': ('is_active', 'updated_at'),
        }),
    )


@admin.register(HomeConfig)
class HomeConfigAdmin(SingletonAdmin):
    list_display = ['blog_subtitle', 'updated_at']
    readonly_fields = ['updated_at']
    fieldsets = (
        ('Hero 区域', {
            'fields': ('hero_title', 'hero_description'),
        }),
        ('区块标题', {
            'fields': ('section_title_projects', 'section_title_skills',
                       'section_title_music', 'section_title_exhibitions'),
        }),
        ('博客', {
            'fields': ('blog_subtitle',),
        }),
        ('时间', {
            'fields': ('updated_at',),
        }),
    )


@admin.register(HomeBadge)
class HomeBadgeAdmin(BaseModelAdmin):
    list_display = ['text', 'icon', 'order', 'is_active', 'created_at']
    list_editable = ['order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['text']
    fieldsets = (
        ('词条内容', {
            'fields': ('text', 'icon'),
            'description': '图标可以填 emoji（如 🐍）或图标类名（如 bi-code-slash）。',
        }),
        ('排序与状态', {
            'fields': ('order', 'is_active'),
        }),
    )


@admin.register(SocialLink)
class SocialLinkAdmin(IconPreviewMixin, ActiveToggleMixin, BaseModelAdmin):
    preview_field = 'icon_image'
    list_display = ['name', 'icon_preview', 'url', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'url']
    actions = ['activate', 'deactivate']
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'url', 'description'),
        }),
        ('图标', {
            'fields': ('icon', 'icon_image', 'image_preview'),
            'description': '填写 Bootstrap Icons 类名（如 bi-github）或上传自定义图标。',
        }),
        ('排序与状态', {
            'fields': ('order', 'is_active'),
        }),
    )


@admin.register(HomePageProject)
class HomePageProjectAdmin(IconPreviewMixin, ActiveToggleMixin, BaseModelAdmin):
    preview_field = 'icon_image'
    list_display = ['name', 'icon_preview', 'technologies_short', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'description', 'technologies']
    actions = ['activate', 'deactivate']
    fieldsets = (
        ('项目信息', {
            'fields': ('name', 'description', 'url'),
        }),
        ('图标与技术', {
            'fields': ('icon', 'icon_image', 'image_preview', 'technologies'),
            'description': '图标可填 bi-xxx 类名或上传图片；技术栈用逗号分隔。',
        }),
        ('排序与状态', {
            'fields': ('order', 'is_active'),
        }),
    )

    @admin.display(description='技术栈')
    def technologies_short(self, obj):
        if not obj.technologies:
            return '—'
        return obj.technologies[:40] + '…' if len(obj.technologies) > 40 else obj.technologies


@admin.register(HomePageSkill)
class HomePageSkillAdmin(IconPreviewMixin, ActiveToggleMixin, BaseModelAdmin):
    preview_field = 'icon_image'
    list_display = ['category', 'icon_preview', 'skills_short', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['category', 'skills']
    actions = ['activate', 'deactivate']
    fieldsets = (
        ('技能分类', {
            'fields': ('category', 'skills'),
            'description': '每行一个技能，前台按行渲染。',
        }),
        ('图标', {
            'fields': ('icon', 'icon_image', 'image_preview'),
        }),
        ('排序与状态', {
            'fields': ('order', 'is_active'),
        }),
    )

    @admin.display(description='技能列表')
    def skills_short(self, obj):
        lines = [line.strip() for line in obj.skills.splitlines() if line.strip()]
        return ' · '.join(lines[:3]) + ('…' if len(lines) > 3 else '')


@admin.register(ContactInfo)
class ContactInfoAdmin(IconPreviewMixin, ActiveToggleMixin, BaseModelAdmin):
    preview_field = 'icon_image'
    list_display = ['contact_type', 'value', 'icon_preview', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    list_filter = ['contact_type', 'is_active']
    search_fields = ['value']
    actions = ['activate', 'deactivate']
    fieldsets = (
        ('联系方式', {
            'fields': ('contact_type', 'value', 'url'),
        }),
        ('图标', {
            'fields': ('icon', 'icon_image', 'image_preview'),
        }),
        ('排序与状态', {
            'fields': ('order', 'is_active'),
        }),
    )


@admin.register(ExhibitionDiary)
class ExhibitionDiaryAdmin(ImagePreviewMixin, ActiveToggleMixin, BaseModelAdmin):
    preview_field = 'image'
    list_display = ['image_thumb', 'title', 'is_featured', 'is_active', 'order', 'created_at']
    list_display_links = ['title']
    list_editable = ['is_featured', 'is_active', 'order']
    list_filter = ['is_active', 'is_featured', 'created_at']
    search_fields = ['title']
    readonly_fields = ['created_at', 'image_preview']
    date_hierarchy = 'created_at'
    actions = ['feature_items', 'unfeature_items', 'activate', 'deactivate']
    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'url'),
        }),
        ('图片', {
            'fields': ('image', 'image_preview'),
        }),
        ('排序与状态', {
            'fields': ('order', 'is_featured', 'is_active'),
            'description': '勾选「首页展示」后优先出现在首页，最多取 4 张。',
        }),
        ('时间', {
            'fields': ('created_at',),
        }),
    )

    @admin.action(description='设为首页展示')
    def feature_items(self, request, queryset):
        count = queryset.update(is_featured=True)
        self.message_user(request, f'已设置 {count} 张为首页展示', messages.SUCCESS)

    @admin.action(description='取消首页展示')
    def unfeature_items(self, request, queryset):
        count = queryset.update(is_featured=False)
        self.message_user(request, f'已取消 {count} 张的首页展示', messages.SUCCESS)


@admin.register(MusicCreation)
class MusicCreationAdmin(ActiveToggleMixin, BaseModelAdmin):
    list_display = ['title', 'original_author', 'version', 'views', 'order', 'is_active']
    list_editable = ['views', 'order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['title', 'original_author']
    actions = ['activate', 'deactivate']
    fieldsets = (
        ('作品信息', {
            'fields': ('title', 'original_author', 'version', 'url'),
        }),
        ('统计与排序', {
            'fields': ('views', 'order', 'is_active'),
        }),
    )
