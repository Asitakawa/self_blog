from resume.models import (
    HomePageProfile, HomeConfig, SocialLink, HomePageProject,
    HomePageSkill, ContactInfo, ExhibitionDiary, MusicCreation
)


class HomePageProfileProxy(HomePageProfile):
    class Meta:
        proxy = True
        app_label = 'homepage_mgmt'
        verbose_name = '首页个人介绍'
        verbose_name_plural = '首页个人介绍'


class HomeConfigProxy(HomeConfig):
    class Meta:
        proxy = True
        app_label = 'homepage_mgmt'
        verbose_name = '首页配置'
        verbose_name_plural = '首页配置'


class SocialLinkProxy(SocialLink):
    class Meta:
        proxy = True
        app_label = 'homepage_mgmt'
        verbose_name = '社交链接'
        verbose_name_plural = '社交链接'


class HomePageProjectProxy(HomePageProject):
    class Meta:
        proxy = True
        app_label = 'homepage_mgmt'
        verbose_name = '首页项目'
        verbose_name_plural = '首页项目'


class HomePageSkillProxy(HomePageSkill):
    class Meta:
        proxy = True
        app_label = 'homepage_mgmt'
        verbose_name = '首页技能分类'
        verbose_name_plural = '首页技能分类'


class ContactInfoProxy(ContactInfo):
    class Meta:
        proxy = True
        app_label = 'homepage_mgmt'
        verbose_name = '联系信息'
        verbose_name_plural = '联系信息'


class ExhibitionDiaryProxy(ExhibitionDiary):
    class Meta:
        proxy = True
        app_label = 'homepage_mgmt'
        verbose_name = '日常分享'
        verbose_name_plural = '日常分享'


class MusicCreationProxy(MusicCreation):
    class Meta:
        proxy = True
        app_label = 'homepage_mgmt'
        verbose_name = '校园生活'
        verbose_name_plural = '校园生活'