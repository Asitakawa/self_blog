from django.db import models


class GameCharacter(models.Model):
    """登场角色：立绘头像、名字配色由后台维护。"""

    name = models.CharField(max_length=50, verbose_name='角色名')
    name_color = models.CharField(max_length=7, default='#f5c542', verbose_name='名牌颜色')
    avatar = models.ImageField(upload_to='game/avatars/', blank=True, verbose_name='头像')
    title = models.CharField(max_length=100, blank=True, verbose_name='角色头衔（名牌下方小字）')
    is_active = models.BooleanField(default=True, verbose_name='启用')
    order = models.IntegerField(default=0, verbose_name='排序')

    class Meta:
        verbose_name = '游戏角色'
        verbose_name_plural = '游戏角色'
        ordering = ['order', 'id']

    def __str__(self):
        return self.name


class GameChapter(models.Model):
    """剧情章节，按 order 顺序解锁。"""

    title = models.CharField(max_length=100, verbose_name='章节标题')
    badge = models.CharField(max_length=20, blank=True, verbose_name='章节编号（如 第一章）')
    background = models.CharField(max_length=300, blank=True, verbose_name='背景图 URL（/static/... 或 /media/...）')
    intro = models.CharField(max_length=200, blank=True, verbose_name='章节简介（章节选择界面显示）')
    next_chapter = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL,
        related_name='previous_chapters', verbose_name='通关后进入',
    )
    is_active = models.BooleanField(default=True, verbose_name='启用')
    order = models.IntegerField(default=0, verbose_name='排序')

    class Meta:
        verbose_name = '剧情章节'
        verbose_name_plural = '剧情章节'
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.badge} {self.title}'.strip()


class GameDialogue(models.Model):
    """一句台词。kind 决定引擎的呈现方式。"""

    KIND_TEXT = 'text'
    KIND_NARRATION = 'narration'
    KIND_BLOGS = 'dynamic_blogs'
    KIND_CHOICES = [
        (KIND_TEXT, '角色台词'),
        (KIND_NARRATION, '旁白'),
        (KIND_BLOGS, '动态博客列表（自动插入最新文章选项）'),
    ]

    chapter = models.ForeignKey(GameChapter, on_delete=models.CASCADE, related_name='dialogues',
                                verbose_name='所属章节')
    order = models.IntegerField(default=0, verbose_name='顺序（同章内从小到大）')
    kind = models.CharField(max_length=20, choices=KIND_CHOICES, default=KIND_TEXT, verbose_name='类型')
    character = models.ForeignKey(GameCharacter, null=True, blank=True, on_delete=models.SET_NULL,
                                  related_name='dialogues', verbose_name='说话角色（旁白可留空）')
    text = models.TextField(verbose_name='台词内容')
    is_branch_point = models.BooleanField(default=False, verbose_name='此句后弹出选项')
    is_active = models.BooleanField(default=True, verbose_name='启用')

    class Meta:
        verbose_name = '台词'
        verbose_name_plural = '台词'
        ordering = ['chapter__order', 'order', 'id']

    def __str__(self):
        return f'[{self.chapter_id}-{self.order}] {self.text[:30]}'


class GameChoice(models.Model):
    """选项：绑定在某句台词后。跳转目标三选一：章节 / 台词 / 外部链接。"""

    dialogue = models.ForeignKey(GameDialogue, on_delete=models.CASCADE, related_name='choices',
                                 verbose_name='所属台词')
    text = models.CharField(max_length=100, verbose_name='选项文字')
    goto_chapter = models.ForeignKey(GameChapter, null=True, blank=True, on_delete=models.SET_NULL,
                                     related_name='entry_choices', verbose_name='跳转到章节')
    goto_dialogue = models.ForeignKey(GameDialogue, null=True, blank=True, on_delete=models.SET_NULL,
                                      related_name='+', verbose_name='跳转到指定台词')
    url = models.CharField(max_length=300, blank=True, verbose_name='或跳转链接（如 /blog/）')
    order = models.IntegerField(default=0, verbose_name='排序')

    class Meta:
        verbose_name = '剧情选项'
        verbose_name_plural = '剧情选项'
        ordering = ['dialogue__order', 'order', 'id']

    def __str__(self):
        return self.text
