# 个人博客系统 - Personal Blog & Resume Website

一个基于 Django 6.0.4 构建的个人博客网站，集成简历展示、博客文章、日常分享、评论互动等功能。样式全部手写（CSS 变量 + 组件类），不依赖前端 CSS 框架；内容通过 Django Admin 按业务模块分组管理，实时生效。

在线访问：[www.asitakawa.top](http://www.asitakawa.top)

---

## 功能特点

### 前台展示
- **视觉小说《树洞奇缘》**：整站游戏化入口——打字机对话、分支选项、章节解锁、存档系统，剧情全部后台可编辑
- **游戏内场景**：简历 / 博客 / 展览 / 关于 / 留言板以游戏房间呈现，点开即在小说界面内翻阅，不跳出网页；含记忆碎片收集、10 项成就与真结局
- **「深夜档案馆」视觉**：深墨底 + 纸页场景 + 朱砂印记，宋体标题与细线分隔；3D 书架为暖光木柜，不使用渐变字/毛玻璃/药丸按钮
- **「深夜档案馆」视觉**：深墨底 + 纸页场景 + 朱砂印记，宋体标题与细线分隔；3D 书架为暖光木柜，不使用渐变字/毛玻璃/药丸按钮
- **响应式设计**：适配桌面端和移动端
- **个人简历**：教育经历、实习/工作、项目、技能（进度条）、校园实践、兴趣爱好、个人标签
- **博客系统**：文章发布、动态分类筛选、搜索（标题/内容/标签）、分页（每页10篇）
- **富文本编辑**：CKEditor 集成，支持文章内直接插入图片
- **树洞小屋**：个人介绍、社交链接、项目展示、技能分类、日常分享、联系信息、浮动词条
- **关于我**：个人介绍、自定义章节卡片、评论区
- **日常分享**：图片展览墙，分页展示（每页20张）
- **Lightbox**：图片点击放大查看
- **SEO优化**：语义化 HTML、Open Graph 标签、Sitemap
- **背景切换**：滚动时自动切换背景图

### 后台管理（按业务模块分组）

| 管理区 | 对应 app | 管理内容 |
|--------|----------|----------|
| 游戏剧情 | `game` | 角色、章节、台词、选项、记忆碎片、树洞留言——改动实时生效 |
| 树洞小屋 | `home` | 首页个人介绍、首页配置（含博客副标题）、浮动词条、社交链接、首页项目、首页技能分类、联系信息、日常分享、校园生活 |
| 博客 | `blog` | 博客文章（CKEditor 富文本）、博客分类 |
| 关于页 | `about` | 关于页面信息、关于页面章节卡片 |
| 简历 | `resume` | 个人基本信息、教育/实习/项目/技能/校园实践/兴趣爱好/个人标签 |
| 用户互动 | `interaction` | 评论审核、隐藏、批量操作 |

后台在 Django Admin 基础上做了统一改造：

- **首页仪表盘**：文章 / 评论 / 日常分享 / 项目统计，最近文章与评论，常用操作快捷入口
- **中文标题自动生成 slug**：不用手填 URL 别名，`重构笔记` 会自动变成 `zhong-gou-bi-ji`，重名自动加后缀
- **列表页直接编辑**：排序、启用状态、发布状态、评论审核状态都能在列表里改，并支持批量操作
- **图片预览**：编辑页显示当前封面/头像/图标，列表页显示缩略图
- **统一后台基类**：分页 30 条、搜索、筛选、空值显示、单例配置保护，配色与前台一致

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.12+ | 编程语言 |
| Django | 6.0.4 | Web 框架 |
| SQLite | 内置 | 开发数据库 |
| Pillow | 12.2.0 | 图片处理 |
| django-ckeditor | 6.7.4 | 富文本编辑器 |
| pypinyin | 0.55.0 | 中文标题自动生成 URL 别名 |
| Three.js | r160（本地内置） | 3D 书架场景 |
| 手写 CSS | - | 全站样式（CSS 变量 + 组件类） |
| Bootstrap Icons | 1.10.0 | 图标库 |
| Font Awesome | 6.5.1 | 图标库 |
| Gunicorn + Nginx | - | 生产部署 |

---

## 快速开始

### 环境要求
- Python 3.12+（Django 6 的最低要求）
- pip

### 安装运行

```bash
# 克隆项目
git clone https://github.com/Asitakawa/self_blog.git
cd self_blog

# 创建并激活虚拟环境
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # Linux/Mac

# 安装依赖
pip install -r requirements.txt

# 数据库迁移
python manage.py migrate

# 创建管理员
python manage.py createsuperuser

# 启动开发服务器
python manage.py runserver
```

访问 http://127.0.0.1:8000 查看网站  
访问 http://127.0.0.1:8000/admin 管理后台

### 环境变量

本地开发不配置也能直接跑（默认 `DEBUG=True` 且使用内置的开发密钥）。生产环境必须设置：

| 变量 | 说明 | 示例 |
|------|------|------|
| `DJANGO_SECRET_KEY` | 生产密钥，务必替换 | `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DJANGO_DEBUG` | 生产设为 `False` | `False` |
| `DJANGO_ALLOWED_HOSTS` | 允许的域名，逗号分隔 | `www.asitakawa.top,asitakawa.top` |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | CSRF 信任源，逗号分隔 | `https://www.asitakawa.top` |

---

## 项目结构

```
self_blog/
├── self_blog/              # 项目配置（不含业务视图）
│   ├── settings.py         # 配置，敏感项走环境变量
│   ├── urls.py             # 主路由，按应用 include
│   ├── sitemaps.py         # Sitemap 配置
│   └── uploader.py         # CKEditor 自定义图片上传
├── core/                   # 公共组件：图片压缩、分页、slug 生成、后台基类、模板过滤器
├── game/                   # 游戏《树洞奇缘》：剧情模型、内容场景 API、碎片与留言板
├── home/                   # 树洞小屋：个人信息、配置、社交、项目、技能、日常分享
├── blog/                   # 博客：文章、分类
├── about/                  # 关于页：页面信息、章节卡片
├── resume/                 # 简历：教育、实习、项目、技能、实践、兴趣、标签
├── interaction/            # 互动：评论模型、表单、审核后台
├── templates/              # 项目级模板
│   ├── base.html           # 基础模板
│   ├── partials/
│   │   ├── sidebar.html    # 全站侧边栏导航
│   │   └── game_orb.html   # 「回到游戏」浮球
│   ├── admin/              # 后台品牌与仪表盘模板
│   └── game/play.html      # 游戏主界面（独立模板，不继承 base）
├── static/                 # 静态资源
│   ├── css/
│   │   ├── style.css       # 全局样式（设计变量 + 组件类）
│   │   ├── sidebar.css     # 侧边栏样式
│   │   ├── game.css        # 视觉小说与游戏内场景样式
│   │   ├── about.css       # 关于页面样式
│   │   ├── admin-custom.css        # 后台品牌配色
│   │   └── resume-optimized.css  # 简历页动画与滚动条
│   ├── js/main.js          # 主逻辑（背景切换、灯箱、侧边栏）
│   ├── js/game/engine.js   # 剧情引擎（对话、分支、存档、章节）
│   ├── js/game/scenes.js   # 游戏内场景（档案/书架/相册/关于/留言板/成就）
│   ├── js/game/shelf3d.js  # 3D 书架（Three.js：书柜、书脊贴图、悬停拾取）
│   ├── js/vendor/          # 本地依赖（three.module.js）
│   └── images/             # 静态图片资源（含 game/ 章节背景与角色头像）
└── media/                  # 用户上传文件（git 忽略）
```

每个业务 app 自带 `models.py` / `views.py` / `urls.py` / `admin.py` / `templates/<app>/`，改一个模块不需要再翻全局目录。

---

## 数据模型

### 简历模块（`resume`）
- **Profile** - 个人基本信息（姓名、性别、年龄、籍贯、联系方式、求职意向等）
- **Education** - 教育经历
- **Internship** - 实习/工作经历
- **Project** - 项目经历
- **Skill** - 专业技能（带熟练度进度条 1-5 级）
- **CampusActivity** - 校园实践
- **Hobby** - 兴趣爱好
- **Tag** - 个人标签（带颜色）

### 首页模块（`home`）
- **HomePageProfile** - 首页个人介绍
- **HomeConfig** - 首页配置（Hero 标题、各区块标题、博客副标题）
- **HomeBadge** - 首页头像浮动词条
- **SocialLink** - 社交链接
- **HomePageProject** - 首页项目展示
- **HomePageSkill** - 首页技能分类
- **MusicCreation** - 校园生活（作品）
- **ExhibitionDiary** - 日常分享
- **ContactInfo** - 联系信息

### 博客模块（`blog`）
- **BlogCategory** - 博客分类（可动态管理）
- **BlogPost** - 博客文章（标题、别名、富文本内容、封面图、分类、标签、浏览量等）

### 关于模块（`about`）
- **AboutPageInfo** - 关于页面信息
- **AboutSection** - 关于页面章节卡片

### 互动模块（`interaction`）
- **Comment** - 评论（昵称、邮箱、网站、内容、IP、审核、自关联回复）

---

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/`（或 `/play/`） | 视觉小说《树洞奇缘》 | 游戏化首页：剧情推进、分支选项、存档 |
| `/home/` | 树洞小屋 | Hero、社交、项目、技能、日常分享、联系 |
| `/home/exhibitions/` | 日常分享 | 图片展览墙（每页20张） |
| `/resume/` | 简历 | 个人简历完整展示 |
| `/about/` | 关于我 | 个人介绍 + 章节卡片 + 评论区 |
| `/blog/` | 博客列表 | 搜索 + 分类筛选 + 分页（每页10篇） |
| `/blog/<slug>/` | 博客详情 | 文章正文 + 标签 + 浏览量 |
| `/api/story/` | 剧情 API | 章节/台词/选项 + 最新文章 |
| `/api/content/` | 场景内容 API | 档案、书架、相册、关于、留言板、碎片 |
| `/api/post/<slug>/` | 阅读器 API | 游戏内阅读器取文章正文 |
| `/api/guestbook/` | 留言板 API | 读取 / 提交树洞留言 |
| `/admin/` | 后台管理 | 五个管理区（含游戏剧情与碎片） |
| `/sitemap.xml` | Sitemap | 搜索引擎站点地图 |

---

## 视觉小说与游戏内场景（`game`）

首页是一部原创视觉小说《树洞奇缘》。站点的真实内容不是被链接出去，而是被做成了游戏里的房间：

- **档案室**：简历数据（基本信息、教育、实习、项目、技能、校园、兴趣、标签）在游戏内渲染成一本手账，技能带熟练度条。
- **书架**：博客文章变成一座 **3D 木质书柜**——拖动旋转、滚轮缩放、悬停抬起显示书名，点击书脊在游戏内阅读器打开；带金色书签带的才是真实文章。WebGL 不可用时自动回退为列表视图。
- **相册**：展览照片墙，点开可放大到整屏。
- **关于**：关于页内容渲染成一封写给自己的信。
- **留言板**：玩家直接钉留言；昵称首次输入后在本机绑定，同一昵称可继续留言，数据存 `GameGuestbook`。
- **记忆碎片**：五个房间各藏一块微光，拾取时浮出独白；集齐触发真结局。
- **成就系统**：10 项成就（开始游戏、读完档案、读书、看展、读信、留言、拾碎片、真结局等），顶栏 HUD 与「探索记录」面板实时显示进度。

玩法：点击/空格推进，分支处选择；顶栏和标题页都能直接进入任一场���。自动存档、手动存档、对话履历、章节选择、自动播放、快进全部保留。

**后台编辑**：Admin → 游戏剧情 管理角色 / 章节 / 台词 / 选项，Admin → 记忆碎片 管理收集要素。选项链接填 `panel:resume`、`panel:blogs`、`panel:gallery`、`panel:about`、`panel:guestbook`、`panel:achievements` 就会在游戏内打开对应场景；只有填 `/blog/` 这类站内路径才会真的跳转网页。

**重置示例内容**：`python manage.py seed_story`（覆盖现有剧情，并同步 5 块碎片）。

---

## 使用指南

### 发布博客文章
1. 登录后台 → **博客 → 博客文章 → 增加博客文章**
2. 填写标题即可，URL 别名留空会自动按标题生成拼音（如 `chong-gou-bi-ji`），也可以手动修改
3. 选择分类，用 CKEditor 富文本编辑器编写内容
4. 可选上传封面图、填写标签（逗号分隔）
5. 勾选"是否发布"控制前台可见性
6. 点击保存

### 管理博客分类
1. 登录后台 → **博客 → 博客分类**
2. 可添加/删除/修改分类名称、颜色、排序
3. `slug` 字段影响 URL 筛选参数 `?category=<slug>`

### 修改博客副标题
1. 登录后台 → **首页 → 首页配置**
2. 修改"博客副标题"字段

### 评论管理
1. 登录后台 → **用户互动 → 评论**
2. 可审核通过/隐藏/显示评论
3. IP 地址自动记录

---

## 部署

```bash
git pull
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DJANGO_SECRET_KEY='你的密钥'
export DJANGO_DEBUG=False
python manage.py migrate
python manage.py collectstatic --noinput --clear
sudo systemctl restart gunicorn nginx

# HTTPS（可选）
sudo certbot --nginx -d www.asitakawa.top -d asitakawa.top
```

---

## 常见问题

### 迁移失败
```bash
python manage.py showmigrations
python manage.py migrate --fake <app_name> <migration_name>
```

### 静态文件 404
```bash
python manage.py collectstatic --noinput --clear
```

### 图片上传不显示
检查 `media/` 目录权限和 Nginx `location /media/` 配置

---

## 联系方式

如有问题或建议，欢迎通过 Issues 反馈或在评论区留言。

---

Made with ❤️ by Asitakawa | Powered by Django & Bootstrap
