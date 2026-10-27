from django.contrib import admin

from core.admin_utils import DateRangeMixin, SingletonMixin

from .models import CampusActivity, Education, Hobby, Internship, Profile, Project, Skill, Tag


@admin.register(Profile)
class ProfileAdmin(SingletonMixin, admin.ModelAdmin):
    list_display = [
        'name', 'job_intention', 'gender', 'age',
        'hometown', 'expected_salary', 'phone', 'email', 'updated_at',
    ]
    list_filter = ['gender']
    search_fields = ['name', 'phone', 'email', 'job_intention']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'updated_at'
    fieldsets = (
        ('个人信息', {
            'fields': ('name', 'gender', 'age', 'hometown', 'avatar', 'introduction')
        }),
        ('求职信息', {
            'fields': ('job_intention', 'expected_salary')
        }),
        ('联系方式', {
            'fields': ('phone', 'email')
        }),
        ('时间', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Education)
class EducationAdmin(DateRangeMixin, admin.ModelAdmin):
    list_display = ['school', 'major', 'degree', 'date_range', 'order']
    list_filter = ['degree', 'start_date']
    search_fields = ['school', 'major']
    list_editable = ['order']
    fieldsets = (
        ('学校信息', {
            'fields': ('school', 'major', 'degree', 'image')
        }),
        ('时间', {
            'fields': ('start_date', 'end_date')
        }),
        ('描述与排序', {
            'fields': ('description', 'order')
        }),
    )


@admin.register(Internship)
class InternshipAdmin(DateRangeMixin, admin.ModelAdmin):
    list_display = ['company', 'position', 'date_range', 'order']
    list_filter = ['start_date']
    search_fields = ['company', 'position']
    list_editable = ['order']
    fieldsets = (
        ('公司信息', {
            'fields': ('company', 'position', 'image')
        }),
        ('时间', {
            'fields': ('start_date', 'end_date')
        }),
        ('职责与排序', {
            'fields': ('responsibilities', 'order')
        }),
    )


@admin.register(Project)
class ProjectAdmin(DateRangeMixin, admin.ModelAdmin):
    list_display = ['name', 'role', 'technologies_short', 'date_range', 'order']
    list_filter = ['start_date']
    search_fields = ['name', 'role', 'technologies']
    list_editable = ['order']
    fieldsets = (
        ('项目信息', {
            'fields': ('name', 'role', 'technologies', 'image')
        }),
        ('时间', {
            'fields': ('start_date', 'end_date')
        }),
        ('描述与排序', {
            'fields': ('description', 'order')
        }),
    )

    def technologies_short(self, obj):
        if obj.technologies:
            return obj.technologies[:30] + '...' if len(obj.technologies) > 30 else obj.technologies
        return '-'
    technologies_short.short_description = '技术栈'


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['category', 'name', 'proficiency', 'order']
    list_filter = ['category', 'proficiency']
    search_fields = ['name', 'category']
    list_editable = ['order']


@admin.register(CampusActivity)
class CampusActivityAdmin(DateRangeMixin, admin.ModelAdmin):
    list_display = ['organization', 'role', 'achievements_short', 'date_range', 'order']
    list_filter = ['start_date']
    search_fields = ['organization', 'role']
    list_editable = ['order']
    fieldsets = (
        ('活动信息', {
            'fields': ('organization', 'role', 'achievements', 'image')
        }),
        ('时间', {
            'fields': ('start_date', 'end_date')
        }),
        ('描述与排序', {
            'fields': ('description', 'order')
        }),
    )

    def achievements_short(self, obj):
        if obj.achievements:
            return obj.achievements[:30] + '...' if len(obj.achievements) > 30 else obj.achievements
        return '-'
    achievements_short.short_description = '成就'


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
