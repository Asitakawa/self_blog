from django.core.paginator import Paginator
from django.db.models import F, Q
from django.shortcuts import get_object_or_404, render

from core.pagination import build_page_list

from .models import BlogCategory, BlogPost


def blog_list(request):
    """博客列表页：搜索 + 分类筛选 + 分页，每页 10 篇。"""
    category_slug = request.GET.get('category', '').strip()
    query = request.GET.get('q', '').strip()

    posts = BlogPost.objects.filter(is_published=True).select_related('category')
    if category_slug:
        posts = posts.filter(category__slug=category_slug)
    if query:
        posts = posts.filter(
            Q(title__icontains=query) | Q(content__icontains=query) | Q(tags__icontains=query)
        )
    posts = posts.order_by('-created_at')

    paginator = Paginator(posts, 10)
    page_obj = paginator.get_page(request.GET.get('page', 1))

    return render(request, 'blog/list.html', {
        'page_obj': page_obj,
        'page_range': build_page_list(page_obj.number, paginator.num_pages),
        'current_category': category_slug,
        'categories': BlogCategory.objects.all(),
        'query': query,
    })


def blog_detail(request, slug):
    """博客详情页，浏览量自增。"""
    post = get_object_or_404(
        BlogPost.objects.select_related('category'), slug=slug, is_published=True
    )
    BlogPost.objects.filter(pk=post.pk).update(views_count=F('views_count') + 1)
    post.views_count += 1

    return render(request, 'blog/detail.html', {'post': post})
