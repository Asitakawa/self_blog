import os
from datetime import datetime

from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.html import escape

from ckeditor_uploader import utils
from ckeditor_uploader.utils import storage

from core.images import compress_image


@require_POST
@csrf_exempt
def ckeditor_upload(request):
    """自定义 CKEditor 图片上传视图，集成自动压缩"""
    uploaded_file = request.FILES.get('upload')
    if not uploaded_file:
        return HttpResponse('No file uploaded', status=400)

    ck_func_num = request.GET.get('CKEditorFuncNum')
    if ck_func_num:
        ck_func_num = escape(ck_func_num)

    # 先压缩再保存
    compressed = compress_image(
        uploaded_file,
        quality=getattr(settings, 'CKEDITOR_IMAGE_QUALITY', 82),
        max_width=getattr(settings, 'CKEDITOR_IMAGE_MAX_WIDTH', 1920),
        max_height=getattr(settings, 'CKEDITOR_IMAGE_MAX_HEIGHT', 1080),
    )

    # 生成存储路径
    date_path = datetime.now().strftime('%Y/%m/%d')
    upload_path = os.path.join(settings.CKEDITOR_UPLOAD_PATH, date_path)
    filename = utils.slugify_filename(compressed.name)
    filepath = os.path.join(upload_path, filename)
    saved_path = storage.save(filepath, compressed)
    url = utils.get_media_url(saved_path)

    if ck_func_num:
        return HttpResponse(
            f'<script>window.parent.CKEDITOR.tools.callFunction({ck_func_num}, "{url}");</script>'
        )
    else:
        _, filename = os.path.split(saved_path)
        return JsonResponse({"url": url, "uploaded": "1", "fileName": filename})
