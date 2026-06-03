from resume.models import (
    Profile, Education, Internship, Project,
    Skill, CampusActivity, Hobby, Tag, BlogPost, BlogCategory
)


class ProfileProxy(Profile):
    class Meta:
        proxy = True
        app_label = 'content_mgmt'
        verbose_name = '个人基本信息'
        verbose_name_plural = '个人基本信息'


class EducationProxy(Education):
    class Meta:
        proxy = True
        app_label = 'content_mgmt'
        verbose_name = '教育经历'
        verbose_name_plural = '教育经历'


class InternshipProxy(Internship):
    class Meta:
        proxy = True
        app_label = 'content_mgmt'
        verbose_name = '实习/工作经历'
        verbose_name_plural = '实习/工作经历'


class ProjectProxy(Project):
    class Meta:
        proxy = True
        app_label = 'content_mgmt'
        verbose_name = '项目经历'
        verbose_name_plural = '项目经历'


class SkillProxy(Skill):
    class Meta:
        proxy = True
        app_label = 'content_mgmt'
        verbose_name = '专业技能'
        verbose_name_plural = '专业技能'


class CampusActivityProxy(CampusActivity):
    class Meta:
        proxy = True
        app_label = 'content_mgmt'
        verbose_name = '校园实践'
        verbose_name_plural = '校园实践'


class HobbyProxy(Hobby):
    class Meta:
        proxy = True
        app_label = 'content_mgmt'
        verbose_name = '兴趣爱好'
        verbose_name_plural = '兴趣爱好'


class TagProxy(Tag):
    class Meta:
        proxy = True
        app_label = 'content_mgmt'
        verbose_name = '个人标签'
        verbose_name_plural = '个人标签'


class BlogPostProxy(BlogPost):
    class Meta:
        proxy = True
        app_label = 'content_mgmt'
        verbose_name = '博客文章'
        verbose_name_plural = '博客文章'


class BlogCategoryProxy(BlogCategory):
    class Meta:
        proxy = True
        app_label = 'content_mgmt'
        verbose_name = '博客分类'
        verbose_name_plural = '博客分类'