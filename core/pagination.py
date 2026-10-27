"""分页页码生成：首页、列表页共用，避免各处重复写「省略号」逻辑。"""


def build_page_list(current, num_pages, on_each_side=1):
    """返回带省略号的页码列表，例如 [1, '…', 4, 5, 6, '…', 20]。"""
    if num_pages <= 5:
        return list(range(1, num_pages + 1))

    pages = {1, num_pages, current}
    for offset in range(1, on_each_side + 1):
        if current - offset >= 1:
            pages.add(current - offset)
        if current + offset <= num_pages:
            pages.add(current + offset)

    result = []
    previous = 0
    for page in sorted(pages):
        if previous and page - previous > 1:
            result.append('…')
        result.append(page)
        previous = page
    return result
