from django.urls import path

from . import views

app_name = 'home'

urlpatterns = [
    path('', views.home, name='index'),
    path('exhibitions/', views.exhibition_list, name='exhibitions'),
]
