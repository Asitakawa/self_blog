from django.urls import path
from django.views.generic import TemplateView

from game import views

app_name = 'game'

urlpatterns = [
    path('', TemplateView.as_view(template_name='game/play.html'), name='play'),
    path('api/story/', views.story_api, name='story_api'),
    path('api/content/', views.content_api, name='content_api'),
    path('api/archive/', views.archive_api, name='archive_api'),
    path('api/post/<slug:slug>/', views.post_detail, name='post_detail'),
    path('api/guestbook/', views.guestbook_api, name='guestbook_api'),
    path('api/guestbook/post/', views.guestbook_post, name='guestbook_post'),
]
