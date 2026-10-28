"""写入示例剧情《树洞奇缘》。可重复执行：先清空旧剧情再重建。

用法：python manage.py seed_story
"""
from django.core.management.base import BaseCommand

from game.models import GameCharacter, GameChapter, GameChoice, GameDialogue


class Command(BaseCommand):
    help = '写入示例剧情《树洞奇缘》（覆盖旧剧情）'

    def handle(self, *args, **options):
        GameChoice.objects.all().delete()
        GameDialogue.objects.all().delete()
        GameChapter.objects.all().delete()
        GameCharacter.objects.all().delete()

        guide = GameCharacter.objects.create(
            name='小栗',
            name_color='#f5c542',
            title='树洞看门向导',
            avatar='/static/images/game/guide_avatar.jpg',
            order=1,
        )

        prologue = GameChapter.objects.create(
            badge='序章',
            title='误入树洞',
            background='/static/images/back_2.png',
            intro='深夜迷路的我，推开了一扇写着「网络小树洞」的门。',
            order=1,
        )
        about = GameChapter.objects.create(
            badge='第一章',
            title='关于他',
            background='/static/images/back_1.jpg',
            intro='石碑上刻着洞主的档案，故事的线索从这里开始。',
            next_chapter=None,
            order=2,
        )
        tour = GameChapter.objects.create(
            badge='第二章',
            title='树洞观光指南',
            background='/static/images/back_2.png',
            intro='最后一站：逛遍树洞的每个角落，顺便看看最近的文章。',
            order=3,
        )
        prologue.next_chapter = about
        about.next_chapter = tour
        prologue.save()
        about.save()

        def line(chapter, order, text, character=None, kind=GameDialogue.KIND_TEXT, branch=False):
            return GameDialogue.objects.create(
                chapter=chapter, order=order, text=text,
                character=character, kind=kind, is_branch_point=branch,
            )

        # ---------- 序章 ----------
        line(prologue, 1, '深夜，你在网络的边缘迷了路。\n指示牌歪歪斜斜地写着——「Asitakawa 的网络小树洞」。', kind=GameDialogue.KIND_NARRATION)
        line(prologue, 2, '推开门的瞬间，一阵带着代码香气的风扑面而来。\n远处隐约有机械齿轮转动的声音。', kind=GameDialogue.KIND_NARRATION)
        line(prologue, 3, '喜欢斗！啊不对，欢迎光临——！\n我是这里的看门向导，小栗！', guide)
        line(prologue, 4, '你一定很奇怪，一个个人网站为什么长得像游戏吧？', guide)
        line(prologue, 5, '因为文字堆成的自我介绍太无聊啦！\n这年头，连树洞都要卷交互性的喵……嗷！', guide)
        line(prologue, 6, '这里的每一段剧情，都是洞主在后台亲手写下的。\n他更新内容，剧情就会跟着变哦。', guide)
        line(prologue, 7, '那么——想先从哪里开始了解这位神秘洞主呢？', guide, branch=True)
        branch = prologue.dialogues.get(order=7)
        GameChoice.objects.create(dialogue=branch, text='先看看「他」是谁', goto_chapter=about, order=1)
        GameChoice.objects.create(dialogue=branch, text='直接去博客翻文章', url='/blog/', order=2)
        GameChoice.objects.create(dialogue=branch, text='参观树洞小屋', url='/home/', order=3)

        # ---------- 第一章 ----------
        line(about, 1, '小栗带你穿过一道由 commit 记录搭成的拱门。\n尽头立着一块微微发光的石碑。', kind=GameDialogue.KIND_NARRATION)
        line(about, 2, '洞主的基本档案，全刻在这块石碑上啦！', guide)
        line(about, 3, '（石碑上浮现出字迹……细节以简历页为准。）', kind=GameDialogue.KIND_NARRATION)
        line(about, 4, '据说他会写代码、会折腾服务器，\n还偷偷养着几个没上线的小项目。', guide)
        line(about, 5, '想看更正经的版本吗？石碑后面就是他的完整简历。\n不过嘛，游戏进度我会帮你存好的，放心去！', guide, branch=True)
        branch = about.dialogues.get(order=5)
        GameChoice.objects.create(dialogue=branch, text='查看完整简历', url='/resume/', order=1)
        GameChoice.objects.create(dialogue=branch, text='继续往前逛', goto_chapter=tour, order=2)

        # ---------- 第二章 ----------
        line(tour, 1, '最后一站！这份观光指南会带你逛遍树洞的每个角落。', guide)
        line(tour, 2, '哦对了，洞主最近写的文章我带来了——\n都是热乎的，戳一下就能跳过去看！', guide)
        line(tour, 3, '', kind=GameDialogue.KIND_BLOGS, branch=True)  # 动态博客选项由引擎注入
        line(tour, 4, '逛累了就随时回来，剧情进度我都帮你记着呢。', guide)
        line(tour, 5, '那么——探险愉快！喵……嗷呜！★', guide, branch=True)
        branch = tour.dialogues.get(order=5)
        GameChoice.objects.create(dialogue=branch, text='参观树洞小屋', url='/home/', order=1)
        GameChoice.objects.create(dialogue=branch, text='去博客看看', url='/blog/', order=2)
        GameChoice.objects.create(dialogue=branch, text='看看他的日常分享', url='/exhibitions/', order=3)
        GameChoice.objects.create(dialogue=branch, text='从头再玩一遍', goto_chapter=prologue, order=4)

        self.stdout.write(self.style.SUCCESS(
            f'剧情写入完成：{GameChapter.objects.count()} 章 / '
            f'{GameDialogue.objects.count()} 句台词 / {GameChoice.objects.count()} 个选项'
        ))
