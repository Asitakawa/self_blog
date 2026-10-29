from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path

from self_blog.sitemaps import BlogPostSitemap, StaticViewSitemap
from self_blog.uploader import ckeditor_upload

sitemaps = {
    'static': StaticViewSitemap,
    'blog': BlogPostSitemap,
}

urlpatterns = [
    path('ckeditor/custom-upload/', ckeditor_upload, name='ckeditor_custom_upload'),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('admin/', admin.site.urls),
    path('blog/', include('blog.urls')),
    path('about/', include('about.urls')),
    path('resume/', include('resume.urls')),
    # 《树洞奇缘》是彩蛋，不占根路径，入口只在右下角浮球
    path('play/', include('game.urls')),
    path('', include('home.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
