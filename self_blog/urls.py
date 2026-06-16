"""
URL configuration for self_blog project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.sitemaps.views import sitemap
from django.urls import path, include
from django.views.generic import TemplateView
from . import views
from .sitemaps import StaticViewSitemap, ExhibitionDiarySitemap, BlogPostSitemap
from .uploader import ckeditor_upload

sitemaps = {
    'static': StaticViewSitemap,
    'exhibitions': ExhibitionDiarySitemap,
    'blog': BlogPostSitemap,
}

urlpatterns = [
    path('ckeditor/custom-upload/', ckeditor_upload, name='ckeditor_custom_upload'),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('admin/', admin.site.urls),
    path('ui-preview/', TemplateView.as_view(template_name='ui_preview.html'), name='ui_preview'),
    path('', views.home, name='home'),  # 首页
    path('about/', views.about_view, name='about'),  # 关于我页面
    path('resume/', include('resume.urls')),  # 简历页面
    path('exhibitions/', views.exhibition_list, name='exhibitions'),
    path('blog/', views.blog_list, name='blog_list'),
    path('blog/<slug:slug>/', views.blog_detail, name='blog_detail'),
]

# 在开发环境中提供静态文件和媒体文件
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
