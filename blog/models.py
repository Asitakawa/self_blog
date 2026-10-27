import re

from django.db import models
from django.urls import reverse
from django.utils.html import strip_tags
from ckeditor_uploader.fields import RichTextUploadingField

from core.images import compress_image
from core.slug import generate_unique_slug


class BlogCategory(models.Model):
    """博客文章分类"""
    name = models.CharField(max_length=50, verbose_name='分类名称')
    slug = models.SlugField(
        max_length=50, unique=True, blank=True,
        verbose_name='URL标识', help_text='留空则按分类名自动生成拼音',
    )
    color = models.CharField(max_length=7, default='#a1c4fd', verbose_name='颜色（如 #a1c4fd）')
    order = models.IntegerField(default=0, verbose_name='排序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '博客分类'
        verbose_name_plural = '博客分类'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name, max_length=50)
        super().save(*args, **kwargs)


class BlogPost(models.Model):
    """博客文章"""
    title = models.CharField(max_length=200, verbose_name='文章标题')
    slug = models.SlugField(
        max_length=200, unique=True, blank=True,
        verbose_name='URL别名', help_text='留空则按标题自动生成拼音，如 chong-gou-bi-ji',
    )
    content = RichTextUploadingField(verbose_name='文章内容')
    excerpt = models.TextField(blank=True, verbose_name='摘要（留空自动截取）')
    cover_image = models.ImageField(upload_to='blog/covers/', blank=True, null=True, verbose_name='封面图')
    category = models.ForeignKey(
        BlogCategory, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name='分类', related_name='posts',
    )
    tags = models.CharField(max_length=500, blank=True, verbose_name='标签（用逗号分隔）')
    is_published = models.BooleanField(default=True, verbose_name='是否发布')
    views_count = models.IntegerField(default=0, verbose_name='浏览次数')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '博客文章'
        verbose_name_plural = '博客文章'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('blog_detail', kwargs={'slug': self.slug})

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.title, max_length=200)

        if not self.excerpt and self.content:
            plain = re.sub(r'\s+', ' ', strip_tags(self.content)).strip()
            self.excerpt = plain[:150] + '...' if len(plain) > 150 else plain

        # 只压缩新上传的封面图，避免每次保存都对已存储的图片重复编码
        if self.cover_image and not self.cover_image._committed:
            self.cover_image = compress_image(self.cover_image)

        super().save(*args, **kwargs)
