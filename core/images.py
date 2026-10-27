from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile


def compress_image(uploaded_image, quality=85, max_width=1920, max_height=1080):
    """
    自动压缩上传的图片：
    - 缩小到最大尺寸以内（保持宽高比）
    - 调整 JPEG 质量
    - 返回压缩后的 ContentFile
    """
    if not uploaded_image:
        return uploaded_image

    img = Image.open(uploaded_image)

    # 转换为 RGB（去除 RGBA 等模式）
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGB')

    # 缩小尺寸
    original_width, original_height = img.size
    if original_width > max_width or original_height > max_height:
        ratio = min(max_width / original_width, max_height / original_height)
        new_size = (int(original_width * ratio), int(original_height * ratio))
        img = img.resize(new_size, Image.LANCZOS)

    # 保存到 BytesIO
    buffer = BytesIO()
    img.save(buffer, format='JPEG', quality=quality, optimize=True)
    buffer.seek(0)

    # 返回 ContentFile，保留原文件名但改后缀为 .jpg
    filename = uploaded_image.name.rsplit('.', 1)[0] + '.jpg'
    return ContentFile(buffer.read(), name=filename)