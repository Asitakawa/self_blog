"""写入示例剧情《树洞奇缘》与记忆碎片。可重复执行：先清空旧剧情再重建。

剧情里的内容入口全部走游戏内场景（panel:resume / panel:blogs / panel:gallery /
panel:about / panel:guestbook），玩家不离开游戏就能翻阅站点的真实内容。

用法：python manage.py seed_story
"""
from django.core.management.base import BaseCommand

from game.models import (GameCharacter, GameChapter, GameChoice, GameDialogue,
                         GameMemoryFragment)


class Command(BaseCommand):
    help = '写入示例剧情《树洞奇缘》与记忆碎片（覆盖旧剧情）'

    def handle(self, *args, **options):
        GameChoice.objects.all().delete()
        GameDialogue.objects.all().delete()
        GameChapter.objects.all().delete()
        GameCharacter.objects.all().delete()

        guide = GameCharacter.objects.create(
            name='小栗',
            name_color='#d9c3a0',
            title='树洞看门向导',
            avatar='/static/images/game/guide_avatar.jpg',
            order=1,
        )

        prologue = GameChapter.objects.create(
            badge='序章', title='误入树洞',
            background='/static/images/back_2.png',
            intro='深夜迷路的我，推开了一扇写着「网络小树洞」的门。',
            order=1,
        )
        dossier = GameChapter.objects.create(
            badge='第一章', title='亮着台灯的房间',
            background='/static/images/back_1.jpg',
            intro='走廊尽头那间房，桌上摊着一本被翻旧的手账。',
            order=2,
        )
        library = GameChapter.objects.create(
            badge='第二章', title='从地板到天花板的书架',
            background='/static/images/back_2.png',
            intro='每一本书，都是他某个深夜写下的东西。',
            order=3,
        )
        gallery = GameChapter.objects.create(
            badge='第三章', title='墙上的光与那封信',
            background='/static/images/back_1.jpg',
            intro='照片钉满一面墙，旁边压着一封没有寄出的信。',
            order=4,
        )
        finale = GameChapter.objects.create(
            badge='终章', title='树洞之外',
            background='/static/images/back_2.png',
            intro='关于这个树洞最后的秘密，和灯亮起来的方式。',
            order=5,
        )
        for prev, nxt in ((prologue, dossier), (dossier, library), (library, gallery), (gallery, finale)):
            prev.next_chapter = nxt
            prev.save()

        def line(chapter, order, text, character=None, kind=GameDialogue.KIND_TEXT, branch=False):
            return GameDialogue.objects.create(
                chapter=chapter, order=order, text=text,
                character=character, kind=kind, is_branch_point=branch,
            )

        def branch_of(chapter, order):
            return chapter.dialogues.get(order=order)

        def choice(chapter, order, text, url='', goto_chapter=None, choice_order=1):
            GameChoice.objects.create(
                dialogue=branch_of(chapter, order), text=text, url=url,
                goto_chapter=goto_chapter, order=choice_order,
            )

        # ---------- 序章 ----------
        line(prologue, 1, '深夜，你在网络的边缘迷了路。\n指示牌歪歪斜斜地写着——「Asitakawa 的网络小树洞」。', kind=GameDialogue.KIND_NARRATION)
        line(prologue, 2, '门没有锁。推开时，一串风铃响了，屋里的灯跟着亮起来。', kind=GameDialogue.KIND_NARRATION)
        line(prologue, 3, '欢迎光临——！我是这里的看门向导，小栗。\n等你很久了喵。', guide)
        line(prologue, 4, '你大概以为这里是个普通的个人网站吧？\n不是的。这个树洞被做成了一部视觉小说。', guide)
        line(prologue, 5, '洞主的档案、他写的文章、看过的展、还有别人留下的话——\n都放在不同的房间里。不是链接，是能推门进去的场景。', guide)
        line(prologue, 6, '对了，五个房间里各藏着一块记忆碎片。\n全部集齐的话……嗯，先不剧透。', guide)
        line(prologue, 7, '那么，先从哪间房开始呢？', guide, branch=True)
        choice(prologue, 7, '走进亮着台灯的房间', goto_chapter=dossier, choice_order=1)
        choice(prologue, 7, '先去书架翻翻书', url='panel:blogs', choice_order=2)
        choice(prologue, 7, '看看他长什么样', url='panel:resume', choice_order=3)
        choice(prologue, 7, '不着急，听你讲', goto_chapter=dossier, choice_order=4)

        # ---------- 第一章：档案室 ----------
        line(dossier, 1, '走廊尽头有一间房，门缝里漏出暖黄的台灯光。', kind=GameDialogue.KIND_NARRATION)
        line(dossier, 2, '这里是档案室。教育、实习、项目、技能，全在他那本手账里。', guide)
        line(dossier, 3, '他不太爱主动讲自己，但你翻开就知道了。\n每一页都是他自己填的，改了后台就跟着变。', guide)
        line(dossier, 4, '要翻开看看吗？', guide, branch=True)
        choice(dossier, 4, '翻开那本手账', url='panel:resume', choice_order=1)
        choice(dossier, 4, '先往下走', goto_chapter=library, choice_order=2)
        line(dossier, 5, '……看懂了吗？他不是那种会把经历挂在嘴边的人。\n但该做的事，一件都没落下。', guide)
        line(dossier, 6, '隔壁是书架。他写的东西，比他说的话多得多。', guide)

        # ---------- 第二章：书架 ----------
        line(library, 1, '书架从地板一直顶到天花板。有的书脊磨白了，有的还很新。', kind=GameDialogue.KIND_NARRATION)
        line(library, 2, '这里的每一本书，都是他写的。\n有些在讲技术，有些只是深夜的牢骚。', guide)
        line(library, 3, '抽一本？读完记得合上，别把书页折了喵。', guide, branch=True)
        choice(library, 3, '抽一本翻开', url='panel:blogs', choice_order=1)
        choice(library, 3, '继续听下去', choice_order=2)
        choice(library, 3, '先去下一间', goto_chapter=gallery, choice_order=3)
        line(library, 4, '哦对了，他最近写的几篇，我都摆在最显眼的位置了。\n要直接抽这几本吗？', guide)
        line(library, 5, '', kind=GameDialogue.KIND_BLOGS, branch=True)  # 最新文章由引擎注入，点开即游戏内阅读器
        line(library, 6, '书可以慢慢读。后台每发一篇新文章，书架上就会多一本。', guide)
        line(library, 7, '再往里走，是他钉照片的那面墙。', guide)

        # ---------- 第三章：相册与信 ----------
        line(gallery, 1, '走廊的墙上钉满了照片，边角被灯光照得发亮。', kind=GameDialogue.KIND_NARRATION)
        line(gallery, 2, '他去看过的每一个展，都会留一张照片在这儿。\n点开看，是能放大到整面墙的。', guide)
        line(gallery, 3, '照片旁边还压着一封信，写给自己的。\n要看看哪一样？', guide, branch=True)
        choice(gallery, 3, '看看墙上的照片', url='panel:gallery', choice_order=1)
        choice(gallery, 3, '读那封没寄出的信', url='panel:about', choice_order=2)
        choice(gallery, 3, '继续听下去', choice_order=3)
        choice(gallery, 3, '先去下一间', goto_chapter=finale, choice_order=4)
        line(gallery, 4, '还有门口那块留言板。来过的人，都会在上面钉一句话。', guide)
        line(gallery, 5, '要不要也留一句？', guide, branch=True)
        choice(gallery, 5, '去留言板', url='panel:guestbook', choice_order=1)
        choice(gallery, 5, '下次再说', goto_chapter=finale, choice_order=2)

        # ---------- 终章 ----------
        line(finale, 1, '走到走廊的尽头，是一扇朝着夜色的窗。', kind=GameDialogue.KIND_NARRATION)
        line(finale, 2, '关于那五块记忆碎片——它们散在五个房间里。', guide)
        line(finale, 3, '档案、书架、相册、信、还有留言板。\n每一处都藏着一块，找到的时候会有微光闪一下。', guide)
        line(finale, 4, '全部集齐，这个树洞的灯就会全亮。\n那是他留给自己，也留给你的真结局。', guide)
        line(finale, 5, '不着急，慢慢逛。\n无论你什么时候回来，这里的灯都亮着。', guide, branch=True)
        choice(finale, 5, '再去找找碎片', url='panel:achievements', choice_order=1)
        choice(finale, 5, '从头再走一遍', goto_chapter=prologue, choice_order=2)

        # ---------- 记忆碎片 ----------
        fragments = [
            ('page', '手账的纸页', '他把所有走过的路，都折进了这本手账里。', 'resume', 1),
            ('bookmark', '深夜的书签', '有人把说不出口的话，写成了书。', 'blogs', 2),
            ('ticket', '展览的票根', '照片不会说话，但它记得那天的光。', 'gallery', 3),
            ('letter', '未寄出的信', '写给自己的信，最后一句是祝福。', 'about', 4),
            ('trace', '陌生人的字迹', '有人来过，并留下了一点点温度。', 'board', 5),
        ]
        for code, name, hint, panel, order in fragments:
            GameMemoryFragment.objects.update_or_create(
                code=code,
                defaults={'name': name, 'hint': hint, 'panel': panel, 'order': order},
            )

        self.stdout.write(self.style.SUCCESS(
            f'剧情写入完成：{GameChapter.objects.count()} 章 / '
            f'{GameDialogue.objects.count()} 句台词 / {GameChoice.objects.count()} 个选项 / '
            f'{GameMemoryFragment.objects.count()} 块碎片'
        ))
