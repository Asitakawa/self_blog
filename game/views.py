from django.http import JsonResponse
from django.views.decorators.http import require_GET

from blog.models import BlogPost
from game.models import GameChapter, GameDialogue


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
                item['character'] = {
                    'name': d.character.name,
                    'color': d.character.name_color,
                    'title': d.character.title,
                    'avatar': d.character.avatar.url if d.character.avatar else '',
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
        }
        for p in BlogPost.objects.filter(is_published=True).order_by('-created_at')[:5]
    ]

    return JsonResponse({'chapters': chapters, 'latest_posts': latest_posts})
