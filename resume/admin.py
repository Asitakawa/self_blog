from django.contrib import admin
from .models import (
    Profile, Education, Internship, Project, Skill, CampusActivity, 
    Hobby, Tag, SocialLink, HomePageProject, HomePageSkill, 
    MusicCreation, ExhibitionDiary, ContactInfo, HomeConfig, HomePageProfile,
    AboutPageInfo, AboutSection, Comment
)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'gender', 'age', 'phone', 'email', 'updated_at']
    search_fields = ['name', 'phone', 'email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['school', 'major', 'degree', 'start_date', 'end_date']
    list_filter = ['degree', 'start_date']
    search_fields = ['school', 'major']


@admin.register(Internship)
class InternshipAdmin(admin.ModelAdmin):
    list_display = ['company', 'position', 'start_date', 'end_date', 'order']
    list_filter = ['start_date']
    search_fields = ['company', 'position']
    list_editable = ['order']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'start_date', 'end_date', 'order']
    list_filter = ['start_date']
    search_fields = ['name', 'role']
    list_editable = ['order']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['category', 'name', 'proficiency', 'order']
    list_filter = ['category', 'proficiency']
    search_fields = ['name', 'category']
    list_editable = ['order']


@admin.register(CampusActivity)
class CampusActivityAdmin(admin.ModelAdmin):
    list_display = ['organization', 'role', 'start_date', 'end_date', 'order']
    list_filter = ['start_date']
    search_fields = ['organization', 'role']
    list_editable = ['order']


@admin.register(Hobby)
class HobbyAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'order']
    search_fields = ['name']
    list_editable = ['order']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'order']
    list_filter = ['color']
    search_fields = ['name']
    list_editable = ['order']


# ==================== 首页内容管理 ====================

@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ['name', 'url', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'url']
    list_editable = ['order', 'is_active']


@admin.register(HomePageProject)
class HomePageProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'url', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description', 'technologies']
    list_editable = ['order', 'is_active']


@admin.register(HomePageSkill)
class HomePageSkillAdmin(admin.ModelAdmin):
    list_display = ['category', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['category', 'skills']
    list_editable = ['order', 'is_active']


@admin.register(MusicCreation)
class MusicCreationAdmin(admin.ModelAdmin):
    list_display = ['title', 'original_author', 'views', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['title', 'original_author']
    list_editable = ['order', 'is_active']


@admin.register(ExhibitionDiary)
class ExhibitionDiaryAdmin(admin.ModelAdmin):
    list_display = ['title', 'url', 'order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['title']
    list_editable = ['order', 'is_active']


@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ['contact_type', 'value', 'url', 'order', 'is_active', 'created_at']
    list_filter = ['contact_type', 'is_active']
    search_fields = ['value']
    list_editable = ['order', 'is_active']


@admin.register(HomeConfig)
class HomeConfigAdmin(admin.ModelAdmin):
    fields = [
        'hero_title', 'hero_description',
        'section_title_projects', 'section_title_skills',
        'section_title_music', 'section_title_exhibitions',
        'updated_at'
    ]
    readonly_fields = ['updated_at']

    def has_add_permission(self, request):
        # 只允许有一条配置记录
        if HomeConfig.objects.exists():
            return False
        return True


@admin.register(HomePageProfile)
class HomePageProfileAdmin(admin.ModelAdmin):
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
        # 只允许有一条首页个人介绍记录
        if HomePageProfile.objects.exists():
            return False
        return True


@admin.register(AboutPageInfo)
class AboutPageInfoAdmin(admin.ModelAdmin):
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
    readonly_fields = ['updated_at']

    def has_add_permission(self, request):
        # 只允许有一条关于页面信息记录
        if AboutPageInfo.objects.exists():
            return False
        return True


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


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
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
