from django.contrib import messages
from django.shortcuts import redirect, render

from core.utils import get_client_ip
from interaction.forms import CommentForm
from interaction.models import Comment
from resume.models import Profile

from .models import AboutPageInfo, AboutSection


def about_view(request):
    """关于我页面：个人介绍 + 章节卡片 + 评论区。"""
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.ip_address = get_client_ip(request)
            comment.save()
            messages.success(request, '评论提交成功！')
            return redirect('about')
    else:
        form = CommentForm()

    comments = (
        Comment.objects.filter(is_approved=True, is_hidden=False, parent=None)
        .prefetch_related('replies')
        .order_by('-created_at')
    )

    return render(request, 'about/index.html', {
        'profile': Profile.objects.first(),
        'about_info': AboutPageInfo.objects.filter(is_active=True).first(),
        'about_sections': AboutSection.objects.filter(is_active=True),
        'comments': comments,
        'comment_count': comments.count(),
        'form': form,
    })
