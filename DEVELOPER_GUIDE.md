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
| Python | 3.13 | 编程语言 |
| Django | 6.0.4 | Web框架 |
| SQLite | 内置 | 开发数据库 |
| Pillow | 12.2.0 | 图片处理 |
| django-ckeditor | 6.7.3 | 富文本编辑器 |

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Bootstrap | 5.3.8 | CSS框架 |
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
├── self_blog/                  # Django项目配置
│   ├── settings.py            # 配置文件
│   ├── urls.py                # 主路由
│   ├── views.py               # 全局视图（首页、关于、博客、展览）
│   └── sitemaps.py            # Sitemap配置
├── resume/                     # 核心应用（数据模型）
│   ├── migrations/             # 数据库迁移文件
│   ├── templatetags/           # 自定义模板过滤器
│   ├── models.py              # 所有数据模型定义
│   ├── admin.py               # 部分后台配置
│   ├── views.py               # 简历视图
│   ├── urls.py                # 简历路由
│   └── utils.py               # 图片压缩工具
├── content_mgmt/               # 内容管理后台分组（代理模型）
├── homepage_mgmt/              # 首页管理后台分组（代理模型）
├── about_mgmt/                 # 关于页管理后台分组（代理模型）
├── interaction/                # 用户互动后台分组（代理模型）
├── templates/                  # HTML模板
│   ├── base.html              # 基础模板（导航、背景、SEO基础）
│   ├── home.html              # 首页
│   ├── about.html             # 关于我页面
│   ├── exhibitions.html       # 日常分享（展览）页面
│   ├── blog_list.html         # 博客列表页（搜索+分类筛选+分页）
│   ├── blog_detail.html       # 博客详情页
│   └── resume/
│       ├── resume.html        # 简历页
│       └── sidebar.html       # 侧边栏
├── static/                     # 静态资源
│   ├── css/
│   │   ├── style.css          # 全局通用样式
│   │   ├── home.css           # 首页样式
│   │   ├── resume-optimized.css # 简历页样式
│   │   ├── about.css          # 关于页样式
│   │   ├── blog.css           # 博客页样式
│   │   ├── exhibitions.css    # 展览页样式
│   │   └── sidebar.css        # 侧边栏样式
│   ├── images/                # 静态图片（背景图等）
│   ├── js/
│   │   └── main.js            # 主逻辑文件
│   ├── favicon.ico            # 网站图标
│   └── robots.txt             # 爬虫规则
├── media/                      # 用户上传文件（git忽略）
├── manage.py                   # Django管理脚本
└── requirements.txt            # Python依赖包
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

### 首页相关模型（resume）

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

### 博客相关模型（resume）

#### BlogCategory - 博客分类（后台可动态管理）
`name, slug, color, order, created_at`

#### BlogPost - 博客文章
`title, slug, content(RichTextUploadingField), excerpt, cover_image, category(ForeignKey→BlogCategory), tags, is_published, views_count, created_at, updated_at`

### 关于页面模型（resume）

#### AboutPageInfo - 关于页面基本信息
`welcome_text, introduction, about_project, project_title, footer_blessing, is_active`

#### AboutSection - 关于页面章节卡片
`title, icon, icon_image, content(HTML), order, is_active`

### 用户互动模型（resume）

#### Comment - 评论
`nickname, email, website, content, avatar, ip_address, is_approved, is_hidden, parent(自关联), created_at`

---

## 页面功能说明

### 1. 首页 (`/`)

**模板**：`templates/home.html`  
**视图**：`self_blog/views.py:home()`

功能模块：
- Hero区域 + 社交链接 + 项目展示
- 技能分类 + 日常分享（Lightbox图片放大）
- 评论区

### 2. 简历页 (`/resume/`)

**模板**：`templates/resume/resume.html`  
**视图**：`resume/views.py:resume_view()`

侧边栏（个人信息、标签、兴趣） + 主内容（教育、实习、项目、技能、校园实践）

### 3. 关于我 (`/about/`)

**模板**：`templates/about.html`  
**视图**：`self_blog/views.py:about_view()`

欢迎语 + 个人介绍 + 自定义章节卡片 + 评论区

### 4. 日常分享 (`/exhibitions/`)

**模板**：`templates/exhibitions.html`  
**视图**：`self_blog/views.py:exhibitions_view()`

图片墙展示，支持 Lightbox

### 5. 博客列表 (`/blog/`)

**模板**：`templates/blog_list.html`  
**视图**：`self_blog/views.py:blog_list()`

- 搜索框（标题/内容/标签）
- 分类筛选（动态分类）
- 分页（每页10篇）

### 6. 博客详情 (`/blog/<slug>/`)

**模板**：`templates/blog_detail.html`  
**视图**：`self_blog/views.py:blog_detail()`

- 文章内容（支持富文本/图片）
- 浏览量自动 +1
- 分类标签颜色

---

## 后台管理指南

### 登录后台

访问 `http://localhost:8000/admin/`  
使用 `createsuperuser` 创建的账号登录

### 管理分组

后台按功能模块分为 4 个管理区：

#### 内容管理
- 博客文章：发布/编辑/删除，含 CKEditor 富文本编辑器
- 博客分类：动态添加/删除/修改分类名称、颜色、排序
- 首页个人介绍、首页配置（含博客副标题）
- 首页项目、首页技能分类、社交链接
- 联系信息、展览日记、音乐作品

#### 首页管理
- 首页个人介绍、首页配置
- 社交链接、首页项目、首页技能分类
- 联系信息

#### 关于页面管理
- 关于页面信息、关于页面章节

#### 用户互动
- 评论审核与管理

### 内容管理入口

所有数据模型定义在 `resume/models.py`，通过代理模型（Proxy Model）在 4 个管理应用中注册。

| 管理区 | 对应 app | 入口 |
|--------|----------|------|
| 内容管理 | `content_mgmt` | 博客文章、博客分类、展览日记等 |
| 首页管理 | `homepage_mgmt` | 首页配置、社交链接等 |
| 关于页面管理 | `about_mgmt` | 关于信息、章节卡片 |
| 用户互动 | `interaction` | 评论管理 |

---

## 前端开发规范

### CSS 文件组织
- `style.css`：全局通用样式（背景、返回按钮、Lightbox、滚动条）
- `home.css`：首页专属
- `resume-optimized.css`：简历页
- `about.css`：关于页
- `blog.css`：博客列表 + 详情页
- `exhibitions.css`：展览页
- `sidebar.css`：侧边栏（显示在简历/关于/展览/博客等页面）

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