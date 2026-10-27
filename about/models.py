from django.db import models


class AboutPageInfo(models.Model):
    """关于页面基本信息"""
    welcome_text = models.TextField(blank=True, verbose_name='欢迎语')
    introduction = models.TextField(blank=True, verbose_name='关于我介绍')
    about_project = models.TextField(blank=True, verbose_name='关于博客/项目介绍')
    project_title = models.CharField(max_length=100, default='关于博客', verbose_name='项目区块标题')
    footer_blessing = models.CharField(max_length=200, blank=True, verbose_name='页脚祝福语')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '关于页面信息'
        verbose_name_plural = '关于页面信息'

    def __str__(self):
        return '关于页面信息'


class AboutSection(models.Model):
    """关于页面章节卡片"""
    title = models.CharField(max_length=100, verbose_name='章节标题')
    icon = models.CharField(
        max_length=100,
        blank=True,
        default='fas fa-star',
        verbose_name='图标类名（Bootstrap: bi-xxx / Font Awesome: fas/fa/fab fa-xxx）',
    )
    icon_image = models.ImageField(upload_to='icons/about/', blank=True, null=True, verbose_name='自定义图标图片')
    content = models.TextField(verbose_name='章节内容（支持HTML）')
    order = models.IntegerField(default=0, verbose_name='排序')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '关于页面章节'
        verbose_name_plural = '关于页面章节'
        ordering = ['order']

    def __str__(self):
        return self.title
