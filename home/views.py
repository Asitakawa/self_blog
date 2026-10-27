from django.core.paginator import Paginator
from django.shortcuts import render

from blog.models import BlogPost
from core.pagination import build_page_list
from resume.models import Profile

from .models import (
    ContactInfo,
    ExhibitionDiary,
    HomeBadge,
    HomeConfig,
    HomePageProfile,
    HomePageProject,
    HomePageSkill,
    SocialLink,
)


def home(request):
    """首页：个人信息、社交链接、项目、技能、日常分享、博客、联系方式。"""
    home_profile = HomePageProfile.objects.filter(is_active=True).first()
    profile = Profile.objects.first()
    home_config = HomeConfig.objects.first()

    social_links = SocialLink.objects.filter(is_active=True)
    projects = HomePageProject.objects.filter(is_active=True)
    skills = HomePageSkill.objects.filter(is_active=True)
    contact_info = ContactInfo.objects.filter(is_active=True)
    badges = HomeBadge.objects.filter(is_active=True)

    # 日常分享：优先取首页精选项，不足 4 张时用最新内容补齐
    featured = list(ExhibitionDiary.objects.filter(is_active=True, is_featured=True)[:4])
    exhibitions = featured
    if len(featured) < 4:
        latest = ExhibitionDiary.objects.filter(is_active=True).exclude(
            pk__in=[item.pk for item in featured]
        ).order_by('-created_at')[: 4 - len(featured)]
        exhibitions = featured + list(latest)

    blog_posts = (
        BlogPost.objects.filter(is_published=True)
        .select_related('category')
        .order_by('-created_at')[:3]
    )

    return render(request, 'home/index.html', {
        'home_profile': home_profile,
        'profile': profile,
        'home_config': home_config,
        'social_links': social_links,
        'projects': projects,
        'skills': skills,
        'exhibitions': exhibitions,
        'contact_info': contact_info,
        'badges': badges,
        'blog_posts': blog_posts,
    })


def exhibition_list(request):
    """日常分享列表页，每页 20 张。"""
    exhibitions = ExhibitionDiary.objects.filter(is_active=True).order_by('-created_at')
    paginator = Paginator(exhibitions, 20)
    page_obj = paginator.get_page(request.GET.get('page', 1))

    return render(request, 'home/exhibitions.html', {
        'page_obj': page_obj,
        'page_range': build_page_list(page_obj.number, paginator.num_pages),
    })
