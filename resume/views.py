from django.shortcuts import render

from .models import CampusActivity, Education, Hobby, Internship, Profile, Project, Skill, Tag


def resume_view(request):
    """简历展示页面"""
    return render(request, 'resume/index.html', {
        'profile': Profile.objects.first(),
        'educations': Education.objects.all(),
        'internships': Internship.objects.all(),
        'projects': Project.objects.all(),
        'skills': Skill.objects.all(),
        'campus_activities': CampusActivity.objects.all(),
        'hobbies': Hobby.objects.all(),
        'tags': Tag.objects.all(),
    })
