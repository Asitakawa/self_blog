from django.contrib import admin

from core.admin_base import BaseModelAdmin, ImagePreviewMixin, ActiveToggleMixin
from game.models import GameCharacter, GameChapter, GameDialogue, GameChoice


class GameChoiceInline(admin.TabularInline):
    model = GameChoice
    fk_name = 'dialogue'
    extra = 1
    fields = ['order', 'text', 'goto_chapter', 'goto_dialogue', 'url']
    verbose_name = '选项'
    verbose_name_plural = '该句后的选项（跳转目标三选一）'


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
