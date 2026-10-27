from django.contrib import admin
from django.utils.html import format_html

from core.admin_base import (
    BaseModelAdmin,
    DateRangeMixin,
    IconPreviewMixin,
    ImagePreviewMixin,
    SingletonAdmin,
)

from .models import CampusActivity, Education, Hobby, Internship, Profile, Project, Skill, Tag


@admin.register(Profile)
class ProfileAdmin(ImagePreviewMixin, SingletonAdmin):
    preview_field = 'avatar'
    list_display = ['image_thumb', 'name', 'job_intention', 'gender', 'age', 'phone', 'updated_at']
    list_display_links = ['name']
    search_fields = ['name', 'phone', 'email', 'job_intention']
    readonly_fields = ['created_at', 'updated_at', 'image_preview']
    fieldsets = (
        ('个人信息', {
            'fields': ('name', 'gender', 'age', 'hometown', 'introduction'),
        }),
        ('头像', {
            'fields': ('avatar', 'image_preview'),
        }),
        ('求职信息', {
            'fields': ('job_intention', 'expected_salary'),
        }),
        ('联系方式', {
            'fields': ('phone', 'email'),
        }),
        ('时间', {
            'fields': ('created_at', 'updated_at'),
        }),
    )


@admin.register(Education)
class EducationAdmin(DateRangeMixin, ImagePreviewMixin, BaseModelAdmin):
    preview_field = 'image'
    list_display = ['school', 'major', 'degree', 'date_range', 'order']
    list_editable = ['order']
    list_filter = ['degree', 'start_date']
    search_fields = ['school', 'major']
    readonly_fields = ['image_preview']
    fieldsets = (
        ('学校信息', {
            'fields': ('school', 'major', 'degree'),
        }),
        ('时间', {
            'fields': ('start_date', 'end_date'),
        }),
        ('配图', {
            'fields': ('image', 'image_preview'),
        }),
        ('描述与排序', {
            'fields': ('description', 'order'),
        }),
    )


@admin.register(Internship)
class InternshipAdmin(DateRangeMixin, ImagePreviewMixin, BaseModelAdmin):
    preview_field = 'image'
    list_display = ['company', 'position', 'date_range', 'order']
    list_editable = ['order']
    list_filter = ['start_date']
    search_fields = ['company', 'position']
    readonly_fields = ['image_preview']
    fieldsets = (
        ('公司信息', {
            'fields': ('company', 'position'),
        }),
        ('时间', {
            'fields': ('start_date', 'end_date'),
        }),
        ('配图', {
            'fields': ('image', 'image_preview'),
        }),
        ('职责与排序', {
            'fields': ('responsibilities', 'order'),
        }),
    )


@admin.register(Project)
class ProjectAdmin(DateRangeMixin, ImagePreviewMixin, BaseModelAdmin):
    preview_field = 'image'
    list_display = ['name', 'role', 'technologies_short', 'date_range', 'order']
    list_editable = ['order']
    list_filter = ['start_date']
    search_fields = ['name', 'role', 'technologies']
    readonly_fields = ['image_preview']
    fieldsets = (
        ('项目信息', {
            'fields': ('name', 'role', 'technologies'),
        }),
        ('时间', {
            'fields': ('start_date', 'end_date'),
        }),
        ('配图', {
            'fields': ('image', 'image_preview'),
        }),
        ('描述与排序', {
            'fields': ('description', 'order'),
        }),
    )

    @admin.display(description='技术栈')
    def technologies_short(self, obj):
        if not obj.technologies:
            return '—'
        return obj.technologies[:40] + '…' if len(obj.technologies) > 40 else obj.technologies


@admin.register(Skill)
class SkillAdmin(BaseModelAdmin):
    list_display = ['category', 'name', 'proficiency', 'order']
    list_editable = ['proficiency', 'order']
    list_filter = ['category', 'proficiency']
    search_fields = ['name', 'category']
    fieldsets = (
        ('技能信息', {
            'fields': ('category', 'name', 'proficiency'),
        }),
        ('描述与排序', {
            'fields': ('description', 'order'),
        }),
    )


@admin.register(CampusActivity)
class CampusActivityAdmin(DateRangeMixin, ImagePreviewMixin, BaseModelAdmin):
    preview_field = 'image'
    list_display = ['organization', 'role', 'achievements_short', 'date_range', 'order']
    list_editable = ['order']
    list_filter = ['start_date']
    search_fields = ['organization', 'role']
    readonly_fields = ['image_preview']
    fieldsets = (
        ('活动信息', {
            'fields': ('organization', 'role', 'achievements'),
        }),
        ('时间', {
            'fields': ('start_date', 'end_date'),
        }),
        ('配图', {
            'fields': ('image', 'image_preview'),
        }),
        ('描述与排序', {
            'fields': ('description', 'order'),
        }),
    )

    @admin.display(description='成就')
    def achievements_short(self, obj):
        if not obj.achievements:
            return '—'
        return obj.achievements[:40] + '…' if len(obj.achievements) > 40 else obj.achievements


@admin.register(Hobby)
class HobbyAdmin(IconPreviewMixin, BaseModelAdmin):
    preview_field = 'image'
    list_display = ['name', 'icon_preview', 'order']
    list_editable = ['order']
    search_fields = ['name']
    readonly_fields = ['image_preview']
    fieldsets = (
        ('兴趣信息', {
            'fields': ('name', 'icon'),
            'description': '图标填 Bootstrap Icons 类名，如 bi-camera。',
        }),
        ('配图', {
            'fields': ('image', 'image_preview'),
        }),
        ('描述与排序', {
            'fields': ('description', 'order'),
        }),
    )


@admin.register(Tag)
class TagAdmin(BaseModelAdmin):
    list_display = ['name', 'color_chip', 'order']
    list_editable = ['order']
    list_filter = ['color']
    search_fields = ['name']

    @admin.display(description='颜色')
    def color_chip(self, obj):
        return format_html(
            '<span class="sb-chip sb-chip--{}">{}</span>',
            obj.color, obj.get_color_display(),
        )
