from resume.models import AboutPageInfo, AboutSection


class AboutPageInfoProxy(AboutPageInfo):
    class Meta:
        proxy = True
        app_label = 'about_mgmt'
        verbose_name = '关于页面信息'
        verbose_name_plural = '关于页面信息'


class AboutSectionProxy(AboutSection):
    class Meta:
        proxy = True
        app_label = 'about_mgmt'
        verbose_name = '关于页面章节'
        verbose_name_plural = '关于页面章节'