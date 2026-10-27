from django.db import models


class SocialLink(models.Model):
    """社交链接"""
    name = models.CharField(max_length=50, verbose_name='平台名称')
    icon = models.CharField(
        max_length=100,
        blank=True,
        default='fab fa-github',
        verbose_name='图标类名（Bootstrap: bi-xxx / Font Awesome: fas/fa/fab fa-xxx）',
    )
    icon_image = models.ImageField(upload_to='icons/social/', blank=True, null=True, verbose_name='自定义图标图片')
    url = models.URLField(verbose_name='链接地址')
    description = models.CharField(max_length=100, blank=True, verbose_name='描述')
    order = models.IntegerField(default=0, verbose_name='排序')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '社交链接'
        verbose_name_plural = '社交链接'
        ordering = ['order']

    def __str__(self):
        return self.name


class HomePageProject(models.Model):
    """首页项目展示"""
    name = models.CharField(max_length=200, verbose_name='项目名称')
    icon = models.CharField(
        max_length=100,
        blank=True,
        default='fas fa-folder',
        verbose_name='图标类名（Bootstrap: bi-xxx / Font Awesome: fas/fa/fab fa-xxx）',
    )
    icon_image = models.ImageField(upload_to='icons/projects/', blank=True, null=True, verbose_name='自定义图标图片')
    description = models.TextField(verbose_name='项目描述')
    url = models.URLField(blank=True, verbose_name='项目链接')
    technologies = models.CharField(max_length=500, blank=True, verbose_name='使用技术（用逗号分隔）')
    order = models.IntegerField(default=0, verbose_name='排序')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '首页项目'
        verbose_name_plural = '首页项目'
        ordering = ['order']

    def __str__(self):
        return self.name


class HomePageSkill(models.Model):
    """首页技能分类"""
    category = models.CharField(max_length=100, verbose_name='技能分类')
    icon = models.CharField(
        max_length=100,
        blank=True,
        default='fas fa-tools',
        verbose_name='图标类名（Bootstrap: bi-xxx / Font Awesome: fas/fa/fab fa-xxx）',
    )
    icon_image = models.ImageField(upload_to='icons/skills/', blank=True, null=True, verbose_name='自定义图标图片')
    skills = models.TextField(verbose_name='技能列表（每行一个技能）')
    order = models.IntegerField(default=0, verbose_name='排序')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '首页技能分类'
        verbose_name_plural = '首页技能分类'
        ordering = ['order']

    def __str__(self):
        return self.category


class MusicCreation(models.Model):
    """校园生活"""
    title = models.CharField(max_length=200, verbose_name='作品名称')
    original_author = models.CharField(max_length=100, blank=True, verbose_name='原作者')
    version = models.CharField(max_length=100, blank=True, verbose_name='版本')
    url = models.URLField(blank=True, verbose_name='作品链接')
    views = models.IntegerField(default=0, verbose_name='播放量')
    order = models.IntegerField(default=0, verbose_name='排序')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '校园生活'
        verbose_name_plural = '校园生活'
        ordering = ['order']

    def __str__(self):
        return self.title


class ExhibitionDiary(models.Model):
    """日常分享"""
    title = models.CharField(max_length=200, verbose_name='展览名称')
    url = models.URLField(blank=True, verbose_name='链接地址')
    image = models.ImageField(upload_to='exhibitions/', blank=True, null=True, verbose_name='配图')
    is_featured = models.BooleanField(default=False, verbose_name='首页展示（勾选后在首页展示）')
    order = models.IntegerField(default=0, verbose_name='排序')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '日常分享'
        verbose_name_plural = '日常分享'
        ordering = ['order']

    def __str__(self):
        return self.title


class ContactInfo(models.Model):
    """联系信息"""
    CONTACT_TYPE_CHOICES = [
        ('email', 'Email'),
        ('phone', '电话'),
        ('qq', 'QQ'),
        ('wechat', '微信'),
        ('telegram', 'Telegram'),
        ('twitter', 'Twitter'),
        ('location', '位置'),
    ]

    contact_type = models.CharField(max_length=50, choices=CONTACT_TYPE_CHOICES, verbose_name='联系方式类型')
    icon = models.CharField(
        max_length=100,
        blank=True,
        default='fas fa-envelope',
        verbose_name='图标类名（Bootstrap: bi-xxx / Font Awesome: fas/fa/fab fa-xxx）',
    )
    icon_image = models.ImageField(upload_to='icons/contact/', blank=True, null=True, verbose_name='自定义图标图片')
    value = models.CharField(max_length=200, verbose_name='联系方式')
    url = models.URLField(blank=True, verbose_name='链接（可选）')
    order = models.IntegerField(default=0, verbose_name='排序')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '联系信息'
        verbose_name_plural = '联系信息'
        ordering = ['order']

    def __str__(self):
        return f"{self.get_contact_type_display()}: {self.value}"


class HomeConfig(models.Model):
    """首页配置"""
    hero_title = models.CharField(max_length=200, blank=True, verbose_name='Hero标题（副标题）')
    hero_description = models.TextField(blank=True, verbose_name='Hero描述')
    section_title_projects = models.CharField(max_length=100, default='个人项目', verbose_name='项目区块标题')
    section_title_skills = models.CharField(max_length=100, default='专业技能', verbose_name='技能区块标题')
    section_title_music = models.CharField(max_length=100, default='校园生活', verbose_name='音乐区块标题')
    section_title_exhibitions = models.CharField(max_length=100, default='日常分享', verbose_name='逛展区块标题')
    blog_subtitle = models.CharField(
        max_length=200, default='用文字记录热爱与思考', blank=True, verbose_name='博客副标题'
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '首页配置'
        verbose_name_plural = '首页配置'

    def __str__(self):
        return '首页配置'


class HomePageProfile(models.Model):
    """首页个人介绍"""
    name = models.CharField(max_length=50, verbose_name='姓名')
    title = models.CharField(max_length=200, blank=True, verbose_name='个人标题（副标题）')
    description = models.TextField(blank=True, verbose_name='个人简介')
    avatar = models.ImageField(upload_to='avatars/home/', blank=True, null=True, verbose_name='头像')
    resume_link = models.URLField(blank=True, default='/resume/', verbose_name='简历链接')
    contact_link = models.CharField(max_length=200, blank=True, default='#contact', verbose_name='联系锚点')
    resume_button_text = models.CharField(max_length=50, default='查看简历', verbose_name='简历按钮文字')
    contact_button_text = models.CharField(max_length=50, default='联系我', verbose_name='联系按钮文字')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '首页个人介绍'
        verbose_name_plural = '首页个人介绍'

    def __str__(self):
        return self.name


class HomeBadge(models.Model):
    """首页头像浮动词条"""
    text = models.CharField(max_length=100, verbose_name='词条文本')
    icon = models.CharField(max_length=50, blank=True, verbose_name='图标（emoji 或 图标类名）')
    order = models.IntegerField(default=0, verbose_name='排序')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '首页浮动词条'
        verbose_name_plural = '首页浮动词条'
        ordering = ['order']

    def __str__(self):
        return self.text
