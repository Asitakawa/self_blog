# 个人博客系统 - Personal Blog & Resume Website

一个基于 Django 6.0.4 和 Bootstrap 5 构建的现代化个人博客网站，集成简历展示、博客文章、日常分享、评论互动等功能。所有内容可通过 Django Admin 分组管理，实时生效。

在线访问：[www.asitakawa.top](http://www.asitakawa.top)

---

## 功能特点

### 前台展示
- **响应式设计**：适配桌面端和移动端
- **个人简历**：教育经历、实习/工作、项目、技能（进度条）、校园实践、兴趣爱好、个人标签
- **博客系统**：文章发布、动态分类筛选、搜索（标题/内容/标签）、分页（每页10篇）
- **富文本编辑**：CKEditor 集成，支持文章内直接插入图片
- **首页**：个人介绍、社交链接、项目展示、技能分类、日常分享、音乐作品、联系信息、浮动词条
- **关于我**：个人介绍、自定义章节卡片、评论区
- **日常分享**：图片展览墙，分页展示（每页20张）
- **Lightbox**：图片点击放大查看
- **SEO优化**：语义化 HTML、Open Graph 标签、Sitemap
- **背景切换**：滚动时自动切换背景图

### 后台管理（四组独立管理区）
| 管理区 | 管理内容 |
|--------|----------|
| 内容管理 | 博客文章、博客分类、个人基本信息、教育/实习/项目/技能/校园实践/兴趣爱好/标签 |
| 首页管理 | 首页个人介绍、首页配置（含博客副标题）、社交链接、首页项目、首页技能分类、联系信息、展览日记、校园生活、浮动词条 |
| 关于页面管理 | 关于页面信息、关于页面章节卡片 |
| 用户互动 | 评论审核与管理 |

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.13 | 编程语言 |
| Django | 6.0.4 | Web 框架 |
| SQLite | 内置 | 开发数据库 |
| Pillow | 12.2.0 | 图片处理 |
| django-ckeditor | 6.7.3 | 富文本编辑器 |
| Bootstrap | 5.3.8 | CSS 框架 |
| Bootstrap Icons | 1.10.0 | 图标库 |
| Font Awesome | 6.5.1 | 图标库 |
| Gunicorn + Nginx | - | 生产部署 |

---

## 快速开始

### 环境要求
- Python 3.10+
- pip
- Node.js（可选，用于 Bootstrap 编译）

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

---

## 项目结构

```
self_blog/
├── self_blog/              # Django 项目配置
│   ├── settings.py         # 配置文件
│   ├── urls.py             # 主路由
│   ├── views.py            # 全局视图（首页、关于、博客、展览）
│   ├── sitemaps.py         # Sitemap 配置
│   └── uploader.py         # CKEditor 自定义图片上传
├── resume/                 # 核心应用（数据模型）
│   ├── models.py           # 所有数据模型定义
│   ├── admin.py            # Django Admin 基础配置
│   ├── views.py            # 简历视图
│   ├── urls.py             # 简历路由
│   ├── forms.py            # 评论表单
│   ├── utils.py            # 图片压缩工具
│   └── templatetags/       # 自定义模板标签/过滤器
├── content_mgmt/           # 内容管理后台（代理模型分组）
├── homepage_mgmt/          # 首页管理后台（代理模型分组）
├── about_mgmt/             # 关于页管理后台（代理模型分组）
├── interaction/            # 用户互动后台（代理模型分组）
├── templates/              # HTML 模板
│   ├── base.html           # 基础模板
│   ├── home.html           # 首页
│   ├── about.html          # 关于我
│   ├── blog_list.html      # 博客列表
│   ├── blog_detail.html    # 博客详情
│   ├── exhibitions.html    # 日常分享
│   ├── ui_preview.html     # UI 预览页
│   └── resume/
│       ├── resume.html     # 简历页
│       └── sidebar.html    # 侧边栏组件
├── static/                 # 静态资源
│   ├── css/
│   │   ├── style.css       # 全局通用样式
│   │   ├── sidebar.css     # 侧边栏样式
│   │   ├── about.css       # 关于页面样式
│   │   └── resume-optimized.css  # 简历页样式 + 滚动条美化
│   ├── js/main.js          # 主逻辑（背景切换、轻量框、侧边栏）
│   └── images/             # 静态图片资源
└── media/                  # 用户上传文件（git 忽略）
```

---

## 数据模型

### 简历模块
- **Profile** - 个人基本信息（姓名、性别、年龄、籍贯、联系方式、求职意向等）
- **Education** - 教育经历
- **Internship** - 实习/工作经历
- **Project** - 项目经历
- **Skill** - 专业技能（带熟练度进度条 1-5 级）
- **CampusActivity** - 校园实践
- **Hobby** - 兴趣爱好
- **Tag** - 个人标签（带颜色）

### 首页模块
- **HomePageProfile** - 首页个人介绍
- **HomeConfig** - 首页配置（Hero 标题、各区块标题、博客副标题）
- **HomeBadge** - 首页头像浮动词条
- **SocialLink** - 社交链接
- **HomePageProject** - 首页项目展示
- **HomePageSkill** - 首页技能分类
- **MusicCreation** - 校园生活（作品）
- **ExhibitionDiary** - 日常分享
- **ContactInfo** - 联系信息

### 博客模块
- **BlogCategory** - 博客分类（可动态管理）
- **BlogPost** - 博客文章（标题、别名、富文本内容、封面图、分类、标签、浏览量等）

### 关于模块
- **AboutPageInfo** - 关于页面信息
- **AboutSection** - 关于页面章节卡片

### 互动模块
- **Comment** - 评论（昵称、邮箱、网站、内容、IP、审核、自关联回复）

---

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | Hero、社交、项目、技能、日常分享、联系 |
| `/resume/` | 简历 | 个人简历完整展示 |
| `/about/` | 关于我 | 个人介绍 + 章节卡片 + 评论区 |
| `/exhibitions/` | 日常分享 | 图片展览墙（每页20张） |
| `/blog/` | 博客列表 | 搜索 + 分类筛选 + 分页（每页10篇） |
| `/blog/<slug>/` | 博客详情 | 文章正文 + 标签 + 浏览量 |
| `/admin/` | 后台管理 | 四组独立管理区 |
| `/sitemap.xml` | Sitemap | 搜索引擎站点地图 |
| `/ui-preview/` | UI 预览 | 组件预览页 |

---

## 使用指南

### 发布博客文章
1. 登录后台 → **内容管理 → 博客文章 → 增加博客文章**
2. 填写标题，自动生成 URL 别名（可手动修改）
3. 选择分类，用 CKEditor 富文本编辑器编写内容
4. 可选上传封面图、填写标签（逗号分隔）
5. 勾选"是否发布"控制前台可见性
6. 点击保存

### 管理博客分类
1. 登录后台 → **内容管理 → 博客分类**
2. 可添加/删除/修改分类名称、颜色、排序
3. `slug` 字段影响 URL 筛选参数 `?category=<slug>`

### 修改博客副标题
1. 登录后台 → **首页管理 → 首页配置**
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
