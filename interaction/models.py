from django.db import models


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
        verbose_name='父评论',
    )

    class Meta:
        verbose_name = '评论'
        verbose_name_plural = '评论'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nickname}: {self.content[:50]}"
