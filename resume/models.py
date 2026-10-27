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
        choices=[(i, f'{i * 20}%') for i in range(1, 6)],
        default=3,
        verbose_name='熟练程度',
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
    COLOR_CHOICES = [
        ('primary', '蓝色'),
        ('secondary', '灰色'),
        ('success', '绿色'),
        ('danger', '红色'),
        ('warning', '黄色'),
        ('info', '青色'),
        ('dark', '黑色'),
    ]

    name = models.CharField(max_length=50, verbose_name='标签名称')
    color = models.CharField(max_length=20, default='primary', choices=COLOR_CHOICES, verbose_name='标签颜色')
    order = models.IntegerField(default=0, verbose_name='排序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '个人标签'
        verbose_name_plural = '个人标签'
        ordering = ['order']

    def __str__(self):
        return self.name
