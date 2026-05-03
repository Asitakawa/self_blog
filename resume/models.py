from django.db import models


class Profile(models.Model):
    """个人基本信息"""
    name = models.CharField(max_length=50, verbose_name='姓名')
    gender = models.CharField(max_length=10, verbose_name='性别')
    age = models.IntegerField(verbose_name='年龄')
    hometown = models.CharField(max_length=100, verbose_name='籍贯')
    phone = models.CharField(max_length=20, verbose_name='电话')
    email = models.EmailField(verbose_name='邮箱')
    expected_salary = models.CharField(max_length=50, verbose_name='期望薪资')
    job_intention = models.CharField(max_length=200, blank=True, verbose_name='求职意向')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='头像')
    introduction = models.TextField(blank=True, verbose_name='个人简介')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '个人基本信息'
        verbose_name_plural = '个人基本信息'

    def __str__(self):
        return self.name


class Education(models.Model):
    """教育经历"""
    school = models.CharField(max_length=200, verbose_name='学校')
    major = models.CharField(max_length=100, verbose_name='专业')
    degree = models.CharField(max_length=50, verbose_name='学历')
    start_date = models.DateField(verbose_name='开始时间')
    end_date = models.DateField(verbose_name='结束时间', blank=True, null=True)
    description = models.TextField(blank=True, verbose_name='描述')
    image = models.ImageField(upload_to='educations/', blank=True, null=True, verbose_name='学校配图')
    order = models.IntegerField(default=0, verbose_name='排序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '教育经历'
        verbose_name_plural = '教育经历'
        ordering = ['order', '-start_date']

    def __str__(self):
        return f"{self.school} - {self.major}"


class Internship(models.Model):
    """实习/工作经历"""
    company = models.CharField(max_length=200, verbose_name='公司/组织')
    position = models.CharField(max_length=100, verbose_name='职位')
    start_date = models.DateField(verbose_name='开始时间')
    end_date = models.DateField(verbose_name='结束时间', blank=True, null=True)
    responsibilities = models.TextField(verbose_name='工作职责')
    image = models.ImageField(upload_to='internships/', blank=True, null=True, verbose_name='配图')
    order = models.IntegerField(default=0, verbose_name='排序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '实习/工作经历'
        verbose_name_plural = '实习/工作经历'
        ordering = ['order', '-start_date']

    def __str__(self):
        return f"{self.company} - {self.position}"


class Project(models.Model):
    """项目经历"""
    name = models.CharField(max_length=200, verbose_name='项目名称')
    role = models.CharField(max_length=100, verbose_name='角色')
    start_date = models.DateField(verbose_name='开始时间')
    end_date = models.DateField(verbose_name='结束时间', blank=True, null=True)
    description = models.TextField(verbose_name='项目描述')
    technologies = models.CharField(max_length=500, blank=True, verbose_name='使用技术')
    image = models.ImageField(upload_to='projects/', blank=True, null=True, verbose_name='项目配图')
    order = models.IntegerField(default=0, verbose_name='排序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '项目经历'
        verbose_name_plural = '项目经历'
        ordering = ['order', '-start_date']

    def __str__(self):
        return self.name


class Skill(models.Model):
    """专业技能"""
    category = models.CharField(max_length=50, verbose_name='技能分类')
    name = models.CharField(max_length=200, verbose_name='技能名称')
    proficiency = models.IntegerField(
        choices=[(i, f'{i*20}%') for i in range(1, 6)],
        default=3,
        verbose_name='熟练程度'
    )
    description = models.TextField(blank=True, verbose_name='技能描述')
    order = models.IntegerField(default=0, verbose_name='排序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '专业技能'
        verbose_name_plural = '专业技能'
        ordering = ['category', 'order']

    def __str__(self):
        return f"{self.category} - {self.name}"


class CampusActivity(models.Model):
    """校园实践"""
    organization = models.CharField(max_length=200, verbose_name='组织/活动')
    role = models.CharField(max_length=100, verbose_name='角色/职位')
    start_date = models.DateField(verbose_name='开始时间')
    end_date = models.DateField(verbose_name='结束时间', blank=True, null=True)
    description = models.TextField(verbose_name='活动描述')
    achievements = models.TextField(blank=True, verbose_name='成就/成果')
    image = models.ImageField(upload_to='activities/', blank=True, null=True, verbose_name='活动配图')
    order = models.IntegerField(default=0, verbose_name='排序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '校园实践'
        verbose_name_plural = '校园实践'
        ordering = ['order', '-start_date']

    def __str__(self):
        return f"{self.organization} - {self.role}"


class Hobby(models.Model):
    """兴趣爱好"""
    name = models.CharField(max_length=100, verbose_name='兴趣名称')
    icon = models.CharField(max_length=50, default='bi-heart', verbose_name='Bootstrap图标类名')
    description = models.TextField(blank=True, verbose_name='描述')
    image = models.ImageField(upload_to='hobbies/', blank=True, null=True, verbose_name='配图')
    order = models.IntegerField(default=0, verbose_name='排序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '兴趣爱好'
        verbose_name_plural = '兴趣爱好'
        ordering = ['order']

    def __str__(self):
        return self.name


class Tag(models.Model):
    """个人标签"""
    name = models.CharField(max_length=50, verbose_name='标签名称')
    color = models.CharField(
        max_length=20,
        default='primary',
        choices=[
            ('primary', '蓝色'),
            ('secondary', '灰色'),
            ('success', '绿色'),
            ('danger', '红色'),
            ('warning', '黄色'),
            ('info', '青色'),
            ('dark', '黑色'),
        ],
        verbose_name='标签颜色'
    )
    order = models.IntegerField(default=0, verbose_name='排序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '个人标签'
        verbose_name_plural = '个人标签'
        ordering = ['order']

    def __str__(self):
        return self.name


# ==================== 首页内容管理模型 ====================

class SocialLink(models.Model):
    """社交链接"""
    name = models.CharField(max_length=50, verbose_name='平台名称')
    icon = models.CharField(
        max_length=100, 
        blank=True, 
        default='fab fa-github', 
        verbose_name='图标类名（Bootstrap: bi-xxx / Font Awesome: fas/fa/fab fa-xxx）'
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
        verbose_name='图标类名（Bootstrap: bi-xxx / Font Awesome: fas/fa/fab fa-xxx）'
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
        verbose_name='图标类名（Bootstrap: bi-xxx / Font Awesome: fas/fa/fab fa-xxx）'
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
    contact_type = models.CharField(
        max_length=50,
        verbose_name='联系方式类型',
        choices=[
            ('email', 'Email'),
            ('phone', '电话'),
            ('qq', 'QQ'),
            ('wechat', '微信'),
            ('telegram', 'Telegram'),
            ('twitter', 'Twitter'),
            ('location', '位置'),
        ]
    )
    icon = models.CharField(
        max_length=100, 
        blank=True, 
        default='fas fa-envelope', 
        verbose_name='图标类名（Bootstrap: bi-xxx / Font Awesome: fas/fa/fab fa-xxx）'
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
        verbose_name='图标类名（Bootstrap: bi-xxx / Font Awesome: fas/fa/fab fa-xxx）'
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


class Comment(models.Model):
    """游客评论"""
    nickname = models.CharField(max_length=50, verbose_name='昵称')
    email = models.EmailField(blank=True, verbose_name='邮箱')
    website = models.URLField(blank=True, verbose_name='网站')
    content = models.TextField(verbose_name='评论内容')
    avatar = models.CharField(max_length=200, blank=True, default='', verbose_name='头像URL（可选）')
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name='IP地址')
    is_approved = models.BooleanField(default=True, verbose_name='是否通过审核')
    is_hidden = models.BooleanField(default=False, verbose_name='是否隐藏')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='replies',
        verbose_name='父评论'
    )

    class Meta:
        verbose_name = '评论'
        verbose_name_plural = '评论'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nickname}: {self.content[:50]}"
