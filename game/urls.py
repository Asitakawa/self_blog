from django.urls import path
from django.views.generic import TemplateView

from game import views

app_name = 'game'

urlpatterns = [
    path('', TemplateView.as_view(template_name='game/play.html'), name='play'),
    path('play/', TemplateView.as_view(template_name='game/play.html'), name='play_alt'),
    path('api/story/', views.story_api, name='story_api'),
]
