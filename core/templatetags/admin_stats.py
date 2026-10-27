"""后台首页仪表盘用的统计标签。"""

from django import template

register = template.Library()


@register.simple_tag
def admin_stats():
    from blog.models import BlogPost
    from home.models import ExhibitionDiary, HomePageProject
    from interaction.models import Comment
    from resume.models import Project

    return {
        'posts': BlogPost.objects.count(),
        'drafts': BlogPost.objects.filter(is_published=False).count(),
        'comments': Comment.objects.count(),
        'pending_comments': Comment.objects.filter(is_approved=False, is_hidden=False).count(),
        'exhibitions': ExhibitionDiary.objects.count(),
        'projects': Project.objects.count() + HomePageProject.objects.count(),
        'recent_posts': BlogPost.objects.order_by('-created_at')[:5],
        'recent_comments': Comment.objects.order_by('-created_at')[:5],
    }
