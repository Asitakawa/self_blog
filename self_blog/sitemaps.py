from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from resume.models import ExhibitionDiary, BlogPost


class StaticViewSitemap(Sitemap):
    """静态页面站点地图"""
    priority = 0.8
    changefreq = 'weekly'

    def items(self):
        return ['home', 'about', 'resume', 'exhibitions', 'blog_list']

    def location(self, item):
        return reverse(item)


class ExhibitionDiarySitemap(Sitemap):
    """日常分享页面站点地图"""
    changefreq = 'weekly'
    priority = 0.5

    def items(self):
        return ExhibitionDiary.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.created_at


class BlogPostSitemap(Sitemap):
    """博客文章站点地图"""
    changefreq = 'weekly'
    priority = 0.6

    def items(self):
        return BlogPost.objects.filter(is_published=True)

    def lastmod(self, obj):
        return obj.updated_at