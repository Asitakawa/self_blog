from resume.models import Comment


class CommentProxy(Comment):
    class Meta:
        proxy = True
        app_label = 'interaction'
        verbose_name = '评论'
        verbose_name_plural = '评论'