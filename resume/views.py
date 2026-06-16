from django.shortcuts import render
from .models import Profile, Education, Internship, Project, Skill, CampusActivity, Hobby, Tag


def resume_view(request):
    """简历展示页面"""
    profile = Profile.objects.first()
    educations = Education.objects.all()
    internships = Internship.objects.all()
    projects = Project.objects.all()
    skills = Skill.objects.all()
    campus_activities = CampusActivity.objects.all()
    hobbies = Hobby.objects.all()
    tags = Tag.objects.all()

    context = {
        'profile': profile,
        'educations': educations,
        'internships': internships,
        'projects': projects,
        'skills': skills,
        'campus_activities': campus_activities,
        'hobbies': hobbies,
        'tags': tags,
    }

    return render(request, 'resume/resume.html', context)
