from django.shortcuts import render, redirect, get_object_or_404
from django.core.paginator import Paginator
from django.contrib import messages
from django.db import models
from resume.models import (
    Profile, Hobby, SocialLink, HomePageProject, HomePageSkill,
    MusicCreation, ExhibitionDiary, ContactInfo, HomeConfig, HomePageProfile,
    BlogPost, BlogCategory, HomeBadge, AboutPageInfo, AboutSection, Comment,
)
from resume.forms import CommentForm


def home(request):
    """首页视图"""
    # 获取首页个人介绍（优先使用，无论是否启用）
    home_profile = HomePageProfile.objects.first()

    # 如果没有首页个人介绍，或者被禁用，则使用简历个人介绍
    if not home_profile or not home_profile.is_active:
        home_profile = None

    # 获取简历个人介绍（备用）
    profile = Profile.objects.first()

    # 获取首页配置
    home_config = HomeConfig.objects.first()

    # 获取社交链接
    social_links = SocialLink.objects.filter(is_active=True).order_by('order')

    # 获取项目
    projects = HomePageProject.objects.filter(is_active=True).order_by('order')

    # 获取技能
    skills = HomePageSkill.objects.filter(is_active=True).order_by('order')

    # 获取音乐创作
    music_creations = MusicCreation.objects.filter(is_active=True).order_by('order')[:6]

    # 获取逛展日记：优先展示 is_featured 最多4张，不足则用最新创建的补齐
    featured = ExhibitionDiary.objects.filter(is_active=True, is_featured=True).order_by('order')[:4]
    if featured.count() < 4:
        exclude_ids = featured.values_list('id', flat=True)
        latest = ExhibitionDiary.objects.filter(
            is_active=True
        ).exclude(
            id__in=exclude_ids
        ).order_by('-created_at')[:4 - featured.count()]
        exhibitions = list(featured) + list(latest)
    else:
        exhibitions = featured

    # 获取联系信息
    contact_info = ContactInfo.objects.filter(is_active=True).order_by('order')

    # 获取兴趣爱好
    hobbies = Hobby.objects.all()[:6]

    # 获取最新博客文章（首页展示最多3篇）
    blog_posts = BlogPost.objects.filter(is_published=True).order_by('-created_at')[:3]

    # 获取首页浮动词条
    badges = HomeBadge.objects.filter(is_active=True).order_by('order')

    context = {
        'home_profile': home_profile,
        'profile': profile,
        'home_config': home_config,
        'social_links': social_links,
        'projects': projects,
        'skills': skills,
        'music_creations': music_creations,
        'exhibitions': exhibitions,
        'contact_info': contact_info,
        'hobbies': hobbies,
        'blog_posts': blog_posts,
        'badges': badges,
    }

    # 允许浏览器/CDN缓存5分钟
    response = render(request, 'home.html', context)
    response['Cache-Control'] = 'public, max-age=300'
    response['Pragma'] = 'cache'

    return response


def about_view(request):
    """关于我页面视图"""
    # 获取个人信息
    profile = Profile.objects.first()

    # 获取关于页面信息
    about_info = AboutPageInfo.objects.filter(is_active=True).first()

    # 获取关于页面章节
    about_sections = AboutSection.objects.filter(is_active=True).order_by('order')

    # 获取联系信息
    contact_info = ContactInfo.objects.filter(is_active=True).order_by('order')

    # 获取评论（只显示通过审核且未隐藏的，使用 prefetch_related 避免 N+1 查询）
    comments = Comment.objects.filter(
        is_approved=True, is_hidden=False, parent=None
    ).prefetch_related('replies').order_by('-created_at')
    comment_count = comments.count()

    # 处理评论提交
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            # 获取IP地址
            comment.ip_address = get_client_ip(request)
            comment.save()
            messages.success(request, '评论提交成功！')
            return redirect('about')
    else:
        form = CommentForm()

    context = {
        'profile': profile,
        'about_info': about_info,
        'about_sections': about_sections,
        'contact_info': contact_info,
        'comments': comments,
        'comment_count': comment_count,
        'form': form,
    }

    return render(request, 'about.html', context)


def exhibition_list(request):
    """日常分享列表页，每页20张"""
    exhibitions = ExhibitionDiary.objects.filter(is_active=True).order_by('-created_at')
    paginator = Paginator(exhibitions, 20)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    # 构建智能页码列表
    total = paginator.num_pages
    current = page_obj.number
    display_pages = []

    if total <= 5:
        display_pages = list(range(1, total + 1))
    else:
        display_pages.append(1)
        if current <= 3:
            # 靠前：1 2 3 4 ... total
            display_pages.extend([2, 3, 4])
            display_pages.append('…')
            display_pages.append(total)
        elif current >= total - 2:
            # 靠后：1 ... total-3 total-2 total-1 total
            display_pages.append('…')
            display_pages.extend([total - 3, total - 2, total - 1, total])
        else:
            # 中间：1 ... current-1 current current+1 ... total
            display_pages.append('…')
            display_pages.extend([current - 1, current, current + 1])
            display_pages.append('…')
            display_pages.append(total)

    return render(request, 'exhibitions.html', {
        'page_obj': page_obj,
        'display_pages': display_pages,
    })


def get_client_ip(request):
    """获取客户端IP地址"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def blog_list(request):
    """博客列表页"""
    category_slug = request.GET.get('category', '')
    query = request.GET.get('q', '').strip()
    posts = BlogPost.objects.filter(is_published=True)
    if category_slug:
        posts = posts.filter(category__slug=category_slug)
    if query:
        posts = posts.filter(
            models.Q(title__icontains=query) |
            models.Q(content__icontains=query) |
            models.Q(tags__icontains=query)
        )
    posts = posts.order_by('-created_at')

    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    categories = BlogCategory.objects.all()
    home_config = HomeConfig.objects.first()

    return render(request, 'blog_list.html', {
        'page_obj': page_obj,
        'current_category': category_slug,
        'categories': categories,
        'home_config': home_config,
        'query': query,
    })


def blog_detail(request, slug):
    """博客详情页"""
    post = get_object_or_404(BlogPost, slug=slug, is_published=True)
    # 增加浏览量
    BlogPost.objects.filter(pk=post.pk).update(views_count=models.F('views_count') + 1)
    post.refresh_from_db()

    return render(request, 'blog_detail.html', {
        'post': post,
    })