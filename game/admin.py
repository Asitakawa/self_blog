from django.contrib import admin

from core.admin_base import BaseModelAdmin, ImagePreviewMixin, ActiveToggleMixin
from game.models import (GameCharacter, GameChapter, GameDialogue, GameChoice,
                         GameGuestbook, GameMemoryFragment)


class GameChoiceInline(admin.TabularInline):
    model = GameChoice
    fk_name = 'dialogue'
    extra = 1
    fields = ['order', 'text', 'goto_chapter', 'goto_dialogue', 'url']
    verbose_name = '选项'
    verbose_name_plural = '该句后的选项（章节 / 台词 / 链接 / panel:场景）'


class GameDialogueInline(admin.StackedInline):
    model = GameDialogue
    extra = 1
    fields = ['order', 'kind', 'character', 'text', 'is_branch_point', 'is_active']
    verbose_name = '台词'
    verbose_name_plural = '章节台词（按顺序播放）'


@admin.register(GameCharacter)
class GameCharacterAdmin(ImagePreviewMixin, BaseModelAdmin):
    list_display = ['image_thumb', 'name', 'title', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    fields = ['name', 'name_color', 'title', 'avatar', 'is_active', 'order']


@admin.register(GameChapter)
class GameChapterAdmin(BaseModelAdmin):
    list_display = ['badge', 'title', 'order', 'next_chapter', 'is_active']
    list_editable = ['order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['title', 'intro']
    fields = ['badge', 'title', 'intro', 'background', 'next_chapter', 'is_active', 'order']
    inlines = [GameDialogueInline]


@admin.register(GameDialogue)
class GameDialogueAdmin(BaseModelAdmin):
    list_display = ['chapter', 'order', 'kind', 'character', 'text_preview', 'is_branch_point', 'is_active']
    list_editable = ['order', 'is_branch_point', 'is_active']
    list_filter = ['kind', 'is_branch_point', 'is_active', 'chapter']
    search_fields = ['text']
    fields = ['chapter', 'order', 'kind', 'character', 'text', 'is_branch_point', 'is_active']
    inlines = [GameChoiceInline]

    @admin.display(description='台词内容')
    def text_preview(self, obj):
        return obj.text[:40]


@admin.register(GameGuestbook)
class GameGuestbookAdmin(BaseModelAdmin):
    list_display = ['nickname', 'content', 'created_at']
    search_fields = ['nickname', 'content']
    readonly_fields = ['created_at']
    fields = ['nickname', 'content', 'created_at']

    def has_add_permission(self, request):
        # 留言只能由访客在游戏内留下
        return False


@admin.register(GameMemoryFragment)
class GameMemoryFragmentAdmin(BaseModelAdmin):
    list_display = ['name', 'code', 'panel', 'hint', 'order']
    list_editable = ['panel', 'order']
    list_filter = ['panel']
    fields = ['code', 'name', 'hint', 'panel', 'order']

