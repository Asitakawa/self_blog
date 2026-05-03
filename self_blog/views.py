from django.shortcuts import render, redirect
from django.contrib import messages
from django.urls import reverse
from resume.models import (
    Profile, Hobby, SocialLink, HomePageProject, HomePageSkill,
    MusicCreation, ExhibitionDiary, ContactInfo, HomeConfig, HomePageProfile
)
from resume.models import AboutPageInfo, AboutSection, Comment
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
    
    # 获取逛展日记
    exhibitions = ExhibitionDiary.objects.filter(is_active=True).order_by('order')[:6]
    
    # 获取联系信息
    contact_info = ContactInfo.objects.filter(is_active=True).order_by('order')
    
    # 获取兴趣爱好
    hobbies = Hobby.objects.all()[:6]
    
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
        'request': request,  # 传递给模板用于判断当前页面
    }
    
    # 禁止缓存
    response = render(request, 'home.html', context)
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    
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
    
    # 获取评论（只显示通过审核且未隐藏的）
    comments = Comment.objects.filter(is_approved=True, is_hidden=False, parent=None).order_by('-created_at')
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
        'request': request,
    }
    
    return render(request, 'about.html', context)


def get_client_ip(request):
    """获取客户端IP地址"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
