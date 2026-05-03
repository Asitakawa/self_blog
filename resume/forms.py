from django import forms
from .models import Comment

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['nickname', 'email', 'website', 'content', 'parent']
        widgets = {
            'nickname': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '昵称 *',
                'required': True
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': '邮箱（选填）'
            }),
            'website': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': '网站（选填）'
            }),
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': '快来评论吧 (*≥ω≤)/',
                'rows': 4,
                'required': True
            }),
            'parent': forms.HiddenInput()
        }
        labels = {
            'nickname': '昵称',
            'email': '邮箱',
            'website': '网站',
            'content': '评论内容',
            'parent': ''
        }
