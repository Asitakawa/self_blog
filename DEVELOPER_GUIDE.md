# 个人博客系统 - 开发者文档

> 📅 最后更新：2026年6月  
> 👤 项目维护者：Asitakawa  
> 🌐 在线访问：http://www.asitakawa.top

---

## 📋 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [项目结构](#项目结构)
4. [快速开始](#快速开始)
5. [数据库模型](#数据库模型)
6. [页面功能说明](#页面功能说明)
7. [后台管理指南](#后台管理指南)
8. [前端开发规范](#前端开发规范)
9. [部署与运维](#部署与运维)
10. [常见问题排查](#常见问题排查)

---

## 项目概述

### 项目简介

这是一个基于 Django 开发的**个人简历博客系统**，集成了简历展示、个人介绍、博客文章、日常分享、评论互动等功能模块。系统采用前后端不分离架构，后台管理按功能模块分组为独立管理区。

### 核心功能

- ✅ **简历页面**：完整的简历信息展示（教育、实习、项目、技能等）
- ✅ **首页**：个人信息、社交链接、项目展示、技能分类、日常分享
- ✅ **关于我页面**：个人介绍、自定义章节卡片
- ✅ **博客系统**：文章发布、分类管理、富文本编辑、图片上传
- ✅ **日常分享**：图片展览墙
- ✅ **评论系统**：支持游客留言和回复
- ✅ **分组后台管理**：按功能模块分组管理所有内容

### 主要特点

- 🎨 **响应式设计**：适配桌面端和移动端
- 🖼️ **富文本编辑**：CKEditor 集成，支持文章内插入图片
- 🗂️ **动态分类**：博客分类可在后台动态增删改
- 🔍 **站内搜索**：博客文章支持标题/内容/标签搜索
- 🔎 **SEO优化**：语义化 HTML、Sitemap、Open Graph 标签

---

## 技术栈

### 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.12+ | 编程语言 |
| Django | 6.0.4 | Web框架 |
| SQLite | 内置 | 开发数据库 |
| Pillow | 12.2.0 | 图片处理 |
| django-ckeditor | 6.7.4 | 富文本编辑器 |

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| 手写 CSS | - | CSS 变量 + 组件类，无前端框架 |
| Bootstrap Icons | 1.10.0 | 图标库 |
| 原生JavaScript | ES6+ | 交互逻辑 |

### 部署环境

- **操作系统**：Linux (Ubuntu/CentOS)
- **Web服务器**：Nginx
- **应用服务器**：Gunicorn
- **Python虚拟环境**：venv

---

## 项目结构

```
self_blog/
├── self_blog/                  # 项目配置层，不放业务代码
│   ├── settings.py            # 配置，敏感项走环境变量
│   ├── urls.py                # 主路由，按 app include
│   ├── sitemaps.py            # Sitemap 配置
│   └── uploader.py            # CKEditor 自定义图片上传
├── core/                       # 公共组件
│   ├── images.py              # 图片压缩
│   ├── pagination.py          # 带省略号的页码生成
│   ├── slug.py                # 中文标题 -> 拼音 slug
│   ├── utils.py               # 客户端 IP 等小工具
│   ├── admin_base.py          # 后台共用 ModelAdmin / Mixin
│   └── templatetags/          # 模板过滤器、后台统计标签
├── home/                       # 首页与日常分享
│   ├── models.py              # 首页相关 9 个模型
│   ├── views.py               # home / exhibition_list
│   ├── urls.py
│   ├── admin.py
│   └── templates/home/        # index.html / exhibitions.html
├── blog/                       # 博客
│   ├── models.py              # BlogCategory / BlogPost
│   ├── views.py               # blog_list / blog_detail
│   ├── urls.py / admin.py
│   └── templates/blog/        # list.html / detail.html
├── about/                      # 关于页
│   ├── models.py              # AboutPageInfo / AboutSection
│   ├── views.py / urls.py / admin.py
│   └── templates/about/index.html
├── resume/                     # 简历
│   ├── models.py              # 8 个简历模型
│   ├── views.py / urls.py / admin.py
│   └── templates/resume/index.html
├── interaction/               # 评论
│   ├── models.py              # Comment
│   ├── forms.py               # 评论表单
│   ├── admin.py               # 审核 / 隐藏 / 批量操作
│   └── migrations/
├── templates/                  # 项目级模板
│   ├── base.html              # 基础模板（导航、背景、SEO）
│   ├── partials/sidebar.html  # 全站侧边栏
│   └── admin/                 # 后台品牌页与仪表盘
├── static/                     # 静态资源
│   ├── css/
│   │   ├── style.css          # 全站样式（设计变量 + 组件类）
│   │   ├── sidebar.css        # 侧边栏
│   │   ├── about.css          # 关于页
│   │   ├── admin-custom.css   # 后台品牌配色
│   │   └── resume-optimized.css
│   ├── images/
│   ├── js/main.js             # 背景切换、灯箱、侧边栏
│   ├── favicon.ico
│   └── robots.txt
├── media/                      # 用户上传文件（git忽略）
├── manage.py
└── requirements.txt
```

---

## 快速开始

### 本地开发环境搭建

#### 1. 安装依赖

```bash
git clone <repository_url>
cd self_blog
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate # Linux/Mac

pip install -r requirements.txt
```

#### 2. 初始化数据库

```bash
python manage.py migrate
python manage.py createsuperuser
```

#### 3. 启动开发服务器

```bash
python manage.py runserver
```

访问 http://127.0.0.1:8000 查看网站  
访问 http://127.0.0.1:8000/admin 登录后台管理

---

## 数据库模型

### 简历相关模型（resume）

#### Profile - 个人基本信息
`name, gender, age, hometown, phone, email, expected_salary, job_intention, avatar, introduction`

#### Education - 教育经历
`school, major, degree, start_date, end_date, description, image, order`

#### Internship - 实习/工作经历
`company, position, start_date, end_date, responsibilities, image, order`

#### Project - 项目经历
`name, role, start_date, end_date, description, technologies, image, order`

#### Skill - 专业技能
`category, name, proficiency, description, order`

#### CampusActivity - 校园实践
`organization, role, start_date, end_date, description, achievements, image, order`

#### Hobby - 兴趣爱好
`name, icon, description, image, order`

#### Tag - 个人标签
`name, color, order`

### 首页相关模型（home）

#### HomePageProfile - 首页个人介绍
`name, title, description, avatar, resume_link, contact_link, ...`

#### HomeConfig - 首页配置（包含博客副标题）
`hero_title, hero_description, section_title_projects, section_title_skills, section_title_music, section_title_exhibitions, blog_subtitle`

#### SocialLink - 社交链接
`name, icon, icon_image, url, description, order, is_active`

#### HomePageProject - 首页项目展示
`name, icon, icon_image, description, url, technologies, order, is_active`

#### HomePageSkill - 首页技能分类
`category, icon, icon_image, skills, order, is_active`

#### ContactInfo - 联系信息
`contact_type, icon, icon_image, value, url, order, is_active`

#### ExhibitionDiary - 日常分享
`title, url, image, order, is_featured, is_active, created_at`

#### MusicCreation - 音乐作品
`title, original_author, version, url, views, order, is_active, created_at`

### 博客相关模型（blog）

#### BlogCategory - 博客分类（后台可动态管理）
`name, slug, color, order, created_at`

#### BlogPost - 博客文章
`title, slug, content(RichTextUploadingField), excerpt, cover_image, category(ForeignKey→BlogCategory), tags, is_published, views_count, created_at, updated_at`

### 关于页面模型（about）

#### AboutPageInfo - 关于页面基本信息
`welcome_text, introduction, about_project, project_title, footer_blessing, is_active`

#### AboutSection - 关于页面章节卡片
`title, icon, icon_image, content(HTML), order, is_active`

### 用户互动模型（interaction）

#### Comment - 评论
`nickname, email, website, content, avatar, ip_address, is_approved, is_hidden, parent(自关联), created_at`

---

## 页面功能说明

### 1. 首页 (`/`)

**模板**：`home/templates/home/index.html`  
**视图**：`home/views.py:home()`

功能模块：
- Hero区域 + 社交链接 + 项目展示
- 技能分类 + 日常分享（Lightbox图片放大）
- 评论区

### 2. 简历页 (`/resume/`)

**模板**：`resume/templates/resume/index.html`  
**视图**：`resume/views.py:resume_view()`

侧边栏（个人信息、标签、兴趣） + 主内容（教育、实习、项目、技能、校园实践）

### 3. 关于我 (`/about/`)

**模板**：`about/templates/about/index.html`  
**视图**：`about/views.py:about_view()`

欢迎语 + 个人介绍 + 自定义章节卡片 + 评论区

### 4. 日常分享 (`/exhibitions/`)

**模板**：`home/templates/home/exhibitions.html`  
**视图**：`home/views.py:exhibition_list()`

图片墙展示，支持 Lightbox

### 5. 博客列表 (`/blog/`)

**模板**：`blog/templates/blog/list.html`  
**视图**：`blog/views.py:blog_list()`

- 搜索框（标题/内容/标签）
- 分类筛选（动态分类）
- 分页（每页10篇）

### 6. 博客详情 (`/blog/<slug>/`)

**模板**：`blog/templates/blog/detail.html`  
**视图**：`blog/views.py:blog_detail()`

- 文章内容（支持富文本/图片）
- 浏览量自动 +1
- 分类标签颜色

---

## 后台管理指南

### 登录后台

访问 `http://localhost:8000/admin/`  
使用 `createsuperuser` 创建的账号登录

### 管理分组

后台按业务域分为 5 个管理区，和 5 个 app 一一对应：

#### 首页（`home`）
- 首页个人介绍、首页配置（含博客副标题）、浮动词条
- 社交链接、首页项目、首页技能分类、联系信息
- 日常分享、校园生活

#### 博客（`blog`）
- 博客文章：发布/编辑/删除，含 CKEditor 富文本编辑器
- 博客分类：动态增删改分类名称、颜色、排序

#### 关于页（`about`）
- 关于页面信息、关于页面章节

#### 简历（`resume`）
- 个人基本信息、教育、实习/工作、项目、技能、校园实践、兴趣爱好、标签

#### 用户互动（`interaction`）
- 评论审核、隐藏、批量操作

### 后台注册方式

模型直接定义在各自 app 的 `models.py`，并在同 app 的 `admin.py` 注册——不再需要代理模型（Proxy Model）或额外的分组 app。

公共行为统一收敛在 `core/admin_base.py`：

| 类 | 作用 |
|----|------|
| `BaseModelAdmin` | 分页 30 条、保存按钮置顶、空值显示、筛选面板常显 |
| `SingletonAdmin` | 单例配置（首页配置、个人信息）禁止重复新增 |
| `DateRangeMixin` | 列表显示「2024.09 - 至今」并放开结束时间必填 |
| `ImagePreviewMixin` | 编辑页当前图片预览 + 列表页缩略图 |
| `IconPreviewMixin` | 图标字段：有图显示图，没图按 `bi-*` 类名渲染 |
| `ActiveToggleMixin` | 带 `is_active` 的模型提供批量启用/停用 |

后台首页是自定义仪表盘：`templates/admin/index.html` + `core/templatetags/admin_stats.py` 提供统计；品牌配色在 `static/css/admin-custom.css`，同时适配浅色与深色模式。

### URL 别名规则

`BlogPost.slug` 和 `BlogCategory.slug` 都允许留空，保存时由 `core/slug.py` 用 pypinyin 转拼音并保证唯一，例如：

- `重构之后的第一篇文章` → `zhong-gou-zhi-hou-de-di-yi-pian-wen-zhang`
- 同名标题第二篇 → 自动追加 `-2`

| 管理区 | 对应 app | 入口 |
|--------|----------|------|
| 首页 | `home` | 首页配置、社交链接、项目、技能、日常分享等 |
| 博客 | `blog` | 博客文章、博客分类 |
| 关于页 | `about` | 关于信息、章节卡片 |
| 简历 | `resume` | 基本信息、教育、实习、项目、技能等 |
| 用户互动 | `interaction` | 评论管理 |

---

## 前端开发规范

### CSS 文件组织
- `style.css`：全站样式（设计变量、卡片、按钮、博客、灯箱、滚动条）
- `sidebar.css`：侧边栏（简历/关于/展览/博客等页面共用）
- `about.css`：关于页
- `resume-optimized.css`：简历页动画与滚动条

模板在 `base.html` 只引 `style.css` + `sidebar.css`，各页面通过 `extra_css` 追加自己的样式。

### 颜色方案
```css
/* 主色调 */
background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
/* 毛玻璃容器 */
background-color: rgba(255, 255, 255, 0.75);
backdrop-filter: blur(10px);
```

### 图片优化
- 背景图：宽度 ≤1920px，文件 <2MB
- 文章配图：CKEditor 自动压缩至最长边 ≤600px
- 封面图：上传后自动压缩至 1920×1080

---

## 部署与运维

### 部署步骤

```bash
git pull
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DJANGO_SECRET_KEY='你的密钥'
export DJANGO_DEBUG=False
export DJANGO_ALLOWED_HOSTS='www.asitakawa.top,asitakawa.top'
python manage.py migrate
python manage.py collectstatic --noinput --clear
sudo systemctl restart gunicorn nginx
```

### HTTPS

```bash
sudo certbot --nginx -d www.asitakawa.top -d asitakawa.top
```

---

## 常见问题排查

### 迁移失败
```bash
python manage.py showmigrations
python manage.py migrate --fake <app_name> <migration_name>
```

### 静态文件404
```bash
python manage.py collectstatic --noinput --clear
```

### 图片上传不显示
检查 `media/` 目录权限和 Nginx `location /media/` 配置