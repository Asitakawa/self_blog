import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from about.models import AboutPageInfo, AboutSection
from blog.models import BlogPost
from game.models import GameChapter, GameDialogue, GameGuestbook, GameMemoryFragment
from home.models import ContactInfo, ExhibitionDiary, SocialLink
from resume.models import (CampusActivity, Education, Hobby, Internship, Profile,
                           Project, Skill, Tag)


def _ym(value):
    """日期 -> 2024.09 形式；空值 -> 至今。"""
    return value.strftime('%Y.%m') if value else '至今'


def _span(start, end):
    return f'{_ym(start)} - {_ym(end)}'


@require_GET
def story_api(request):
    """整份剧情 + 动态博客数据，前端引擎一次性加载。"""
    chapters = []
    for ch in GameChapter.objects.filter(is_active=True).select_related('next_chapter'):
        dialogues = []
        for d in ch.dialogues.filter(is_active=True).select_related('character'):
            item = {
                'id': d.id,
                'order': d.order,
                'kind': d.kind,
                'text': d.text,
                'branch': d.is_branch_point,
                'character': None,
            }
            if d.character and d.character.is_active:
                avatar_url = ''
                if d.character.avatar:
                    name = d.character.avatar.name
                    # 允许后台直接引用静态图（/static/...），否则按上传文件走 media
                    avatar_url = name if name.startswith('/') else d.character.avatar.url
                item['character'] = {
                    'name': d.character.name,
                    'color': d.character.name_color,
                    'title': d.character.title,
                    'avatar': avatar_url,
                }
            if d.is_branch_point or d.kind == GameDialogue.KIND_BLOGS:
                item['choices'] = [
                    {
                        'text': c.text,
                        'chapter': c.goto_chapter_id,
                        'dialogue': c.goto_dialogue_id,
                        'url': c.url,
                    }
                    for c in d.choices.all()
                ]
            dialogues.append(item)
        chapters.append({
            'id': ch.id,
            'badge': ch.badge,
            'title': ch.title,
            'intro': ch.intro,
            'background': ch.background,
            'next': ch.next_chapter_id,
            'dialogues': dialogues,
        })

    latest_posts = [
        {
            'title': p.title,
            'url': p.get_absolute_url(),
            'excerpt': p.excerpt[:80],
            'slug': p.slug,
        }
        for p in BlogPost.objects.filter(is_published=True).order_by('-created_at')[:5]
    ]

    return JsonResponse({'chapters': chapters, 'latest_posts': latest_posts})


@require_GET
def content_api(request):
    """游戏内场景数据：档案、书架、相册、关于、留言板、碎片定义。

    这些内容在游戏内以场景面板呈现，而不是跳转到普通网页。
    """
    profile = Profile.objects.first()
    profile_data = None
    if profile:
        profile_data = {
            'name': profile.name,
            'gender': profile.gender,
            'age': profile.age,
            'hometown': profile.hometown,
            'phone': profile.phone,
            'email': profile.email,
            'salary': profile.expected_salary,
            'intention': profile.job_intention,
            'intro': profile.introduction,
            'avatar': profile.avatar.url if profile.avatar else '',
        }

    educations = [
        {
            'school': e.school,
            'major': e.major,
            'degree': e.degree,
            'span': _span(e.start_date, e.end_date),
            'description': e.description,
        }
        for e in Education.objects.all()
    ]

    internships = [
        {
            'company': i.company,
            'position': i.position,
            'span': _span(i.start_date, i.end_date),
            'responsibilities': i.responsibilities,
        }
        for i in Internship.objects.all()
    ]

    projects = [
        {
            'name': p.name,
            'role': p.role,
            'span': _span(p.start_date, p.end_date),
            'description': p.description,
            'technologies': [t.strip() for t in p.technologies.split(',') if t.strip()],
        }
        for p in Project.objects.all()
    ]

    skill_groups = {}
    for s in Skill.objects.all():
        skill_groups.setdefault(s.category, []).append({
            'name': s.name,
            'proficiency': s.proficiency,
            'description': s.description,
        })

    campus = [
        {
            'organization': c.organization,
            'role': c.role,
            'span': _span(c.start_date, c.end_date),
            'description': c.description,
            'achievements': c.achievements,
        }
        for c in CampusActivity.objects.all()
    ]

    hobbies = [
        {'name': h.name, 'icon': h.icon, 'description': h.description}
        for h in Hobby.objects.all()
    ]

    tags = [{'name': t.name, 'color': t.get_color_display()} for t in Tag.objects.all()]

    about = AboutPageInfo.objects.filter(is_active=True).first()
    about_data = None
    if about:
        about_data = {
            'welcome': about.welcome_text,
            'introduction': about.introduction,
            'project': about.about_project,
            'project_title': about.project_title,
            'blessing': about.footer_blessing,
            'sections': [
                {'title': s.title, 'icon': s.icon, 'content': s.content}
                for s in AboutSection.objects.filter(is_active=True)
            ],
        }

    posts = [
        {
            'slug': p.slug,
            'title': p.title,
            'excerpt': p.excerpt,
            'date': p.created_at.strftime('%Y.%m.%d'),
            'category': p.category.name if p.category else '',
            'color': p.category.color if p.category else '#a1c4fd',
            'tags': [t.strip() for t in p.tags.split(',') if t.strip()],
            'cover': p.cover_image.url if p.cover_image else '',
        }
        for p in BlogPost.objects.filter(is_published=True).select_related('category')[:60]
    ]

    exhibitions = [
        {
            'title': e.title,
            'image': e.image.url if e.image else '',
            'url': e.url,
            'date': e.created_at.strftime('%Y.%m'),
        }
        for e in ExhibitionDiary.objects.filter(is_active=True)
    ]

    contacts = [
        {'type': c.get_contact_type_display(), 'value': c.value, 'url': c.url}
        for c in ContactInfo.objects.filter(is_active=True)
    ]

    socials = [
        {'name': s.name, 'url': s.url, 'icon': s.icon}
        for s in SocialLink.objects.filter(is_active=True)
    ]

    fragments = [
        {'code': f.code, 'name': f.name, 'hint': f.hint, 'panel': f.panel}
        for f in GameMemoryFragment.objects.all()
    ]

    guestbook = [
        {'nickname': g.nickname, 'content': g.content, 'time': g.created_at.strftime('%m-%d %H:%M')}
        for g in GameGuestbook.objects.all()[:50]
    ]

    return JsonResponse({
        'profile': profile_data,
        'educations': educations,
        'internships': internships,
        'projects': projects,
        'skills': [{'category': k, 'items': v} for k, v in skill_groups.items()],
        'campus': campus,
        'hobbies': hobbies,
        'tags': tags,
        'about': about_data,
        'posts': posts,
        'exhibitions': exhibitions,
        'contacts': contacts,
        'socials': socials,
        'fragments': fragments,
        'guestbook': guestbook,
        'counts': {
            'posts': BlogPost.objects.filter(is_published=True).count(),
            'exhibitions': ExhibitionDiary.objects.filter(is_active=True).count(),
            'guestbook': GameGuestbook.objects.count(),
        },
    })


@require_GET
def post_detail(request, slug):
    """阅读器：返回文章正文 HTML（内容由后台 CKEditor 撰写，属可信来源）。"""
    post = BlogPost.objects.filter(slug=slug, is_published=True).select_related('category').first()
    if not post:
        return JsonResponse({'ok': False, 'error': '文章不存在'}, status=404)
    return JsonResponse({
        'ok': True,
        'title': post.title,
        'html': post.content,
        'date': post.created_at.strftime('%Y.%m.%d'),
        'category': post.category.name if post.category else '',
        'tags': [t.strip() for t in post.tags.split(',') if t.strip()],
        'cover': post.cover_image.url if post.cover_image else '',
        'views': post.views_count,
    })


def _clean(raw, limit=30):
    return (raw or '').strip()[:limit]


@require_GET
def guestbook_api(request):
    data = [
        {'nickname': g.nickname, 'content': g.content, 'time': g.created_at.strftime('%m-%d %H:%M')}
        for g in GameGuestbook.objects.all()[:50]
    ]
    return JsonResponse({'messages': data, 'total': GameGuestbook.objects.count()})


@csrf_exempt
@require_POST
def guestbook_post(request):
    """留言：昵称由前端绑定后复用，同一昵称可继续留言。"""
    try:
        payload = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'ok': False, 'error': '请求格式错误'}, status=400)

    nickname = _clean(payload.get('nickname'))
    content = _clean(payload.get('content'), 200)
    if not nickname or not content:
        return JsonResponse({'ok': False, 'error': '昵称和留言都不能为空'}, status=400)

    reusing = GameGuestbook.objects.filter(nickname=nickname).exists()
    GameGuestbook.objects.create(nickname=nickname, content=content)
    return JsonResponse({'ok': True, 'nickname': nickname, 'reusing': reusing,
                         'total': GameGuestbook.objects.count()})
