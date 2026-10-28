"""
Django settings for self_blog project.

敏感配置通过环境变量注入，本地开发不设置也能直接跑。
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def env_bool(name, default=False):
    return os.environ.get(name, str(default)).lower() in ('1', 'true', 'yes', 'on')


def env_list(name, default=None):
    value = os.environ.get(name, '')
    if not value:
        return default or []
    return [item.strip() for item in value.split(',') if item.strip()]


# SECURITY WARNING: 生产环境务必通过 DJANGO_SECRET_KEY 注入
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-fc60*i1pb!=!(+5qdwi3a=s$6usiv1a^)_xm25q#mb#v#*65l+',
)

DEBUG = env_bool('DJANGO_DEBUG', True)

ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS', [
    'www.asitakawa.top',
    'asitakawa.top',
    'localhost',
    '127.0.0.1',
])

CSRF_TRUSTED_ORIGINS = env_list('DJANGO_CSRF_TRUSTED_ORIGINS', [
    'http://www.asitakawa.top',
    'https://www.asitakawa.top',
    'http://asitakawa.top',
    'https://asitakawa.top',
])


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sitemaps',
    'ckeditor',
    'ckeditor_uploader',
    'core',
    'home',
    'blog',
    'about',
    'resume',
    'interaction',
    'game',
]

MIDDLEWARE = [
    # 压缩 HTML / CSS / JS，3D 引擎与样式表都能小一半以上
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'self_blog.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'self_blog.wsgi.application'


# Database

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization

LANGUAGE_CODE = 'zh-hans'
TIME_ZONE = 'Asia/Shanghai'
USE_I18N = True
USE_TZ = True


# Static & media files

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

if not DEBUG:
    STORAGES = {
        'default': {
            'BACKEND': 'django.core.files.storage.FileSystemStorage',
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage',
        },
    }


# CKEditor

CKEDITOR_UPLOAD_PATH = 'uploads/'
CKEDITOR_IMAGE_BACKEND = 'pillow'
CKEDITOR_IMAGE_MAX_WIDTH = 1920
CKEDITOR_IMAGE_MAX_HEIGHT = 1080
CKEDITOR_THUMBNAIL_SIZE = (300, 300)
CKEDITOR_IMAGE_QUALITY = 82
CKEDITOR_FORCE_JPEG_COMPRESSION = True
CKEDITOR_BROWSE_SHOW_DIRS = True
CKEDITOR_ALLOW_NONIMAGE_FILES = False
CKEDITOR_CONFIGS = {
    'default': {
        'toolbar': 'full',
        'height': 500,
        'width': '100%',
        'extraPlugins': ','.join([
            'uploadimage', 'image2', 'codesnippet',
            'tableresize', 'tabletools', 'divarea',
        ]),
        'removePlugins': 'exportpdf',
        'allowedContent': True,
        'extraAllowedContent': 'img[*]',
        'image2_disableResizer': False,
        'image2_alignClasses': ['image-left', 'image-center', 'image-right'],
        'image2_captionedClass': 'image-captioned',
        'filebrowserUploadUrl': '/ckeditor/custom-upload/',
        'filebrowserBrowseUrl': '/ckeditor/browse/',
        'uploadUrl': '/ckeditor/custom-upload/',
    },
}
