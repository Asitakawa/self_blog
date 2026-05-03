from django.shortcuts import render
from .models import Profile, Education, Internship, Project, Skill, CampusActivity, Hobby, Tag, HomePageProfile, HomeConfig


def resume_view(request):
    """简历展示页面"""
    # 获取个人基本信息（取第一条记录）
    profile = Profile.objects.first()
    
    # 获取首页个人介绍（用于侧边栏判断）
    home_profile = HomePageProfile.objects.filter(is_active=True).first()
    
    # 获取首页配置
    home_config = HomeConfig.objects.first()
    
    # 获取所有相关数据
    educations = Education.objects.all()
    internships = Internship.objects.all()
    projects = Project.objects.all()
    skills = Skill.objects.all()
    campus_activities = CampusActivity.objects.all()
    hobbies = Hobby.objects.all()
    tags = Tag.objects.all()
    
    context = {
        'profile': profile,
        'home_profile': home_profile,
        'home_config': home_config,
        'educations': educations,
        'internships': internships,
        'projects': projects,
        'skills': skills,
        'campus_activities': campus_activities,
        'hobbies': hobbies,
        'tags': tags,
        'request': request,  # 传递给模板用于判断当前页面
    }
    
    return render(request, 'resume/resume.html', context)
