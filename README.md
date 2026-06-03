# 个人博客系统 - Personal Blog & Resume Website

一个基于 Django 和 Bootstrap 构建的现代化个人博客网站，集成简历展示、博客文章、日常分享等功能，支持通过后台分组管理实时修改内容。

## 🌟 功能特点

### 前台展示
- 📱 响应式设计，完美支持手机、平板、电脑
- 👤 个人简历展示（教育、实习、项目、技能等）
- 📝 **博客系统**：文章发布、动态分类筛选、搜索、分页
- 🖼️ **富文本编辑**：CKEditor 集成，文章内可直接插入图片
- 🏠 首页：个人信息、社交链接、项目展示、日常分享
- 🗂️ **动态博客分类**：可在后台自行增删改查
- 🔍 站内搜索（标题/内容/标签）
- 💬 评论区：游客留言与回复
- 🖼️ Lightbox 图片放大查看

### 后台管理（分组管理）
- 📦 **内容管理**：博客文章、博客分类、首页内容、展览日记等
- 🏠 **首页管理**：首页配置（含博客副标题）、社交链接等
- 👤 **关于页面管理**：关于信息、章节卡片
- 💬 **用户互动**：评论审核管理
- ✏️ 所有内容实时生效

## 🛠️ 技术栈

- **后端框架**: Django 6.0.4
- **前端框架**: Bootstrap 5.3.8
- **富文本编辑器**: django-ckeditor 6.7.3
- **图标库**: Bootstrap Icons 1.10.0
- **数据库**: SQLite3（开发）/ PostgreSQL（生产）
- **图片处理**: Pillow 12.2.0 + 自动压缩
- **开发语言**: Python 3.13

## 🚀 快速开始

### 环境要求
- Python 3.10+
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

# 启动
python manage.py runserver
```

访问 http://127.0.0.1:8000 查看网站
访问 http://127.0.0.1:8000/admin 管理后台

## 📖 使用指南

### 发布博客文章
1. 登录后台 → **内容管理 → 博客文章 → 增加博客文章**
2. 填写标题、选择分类、用富文本编辑器编写内容
3. 可选上传封面图、填写标签（逗号分隔）
4. 点击保存，自动发布到前台

### 管理博客分类
1. 登录后台 → **内容管理 → 博客分类**
2. 可添加/删除/修改分类名称、颜色、排序
3. 默认分类：动画、工作、生活

### 修改博客副标题
1. 登录后台 → **首页管理 → 首页配置**
2. 修改"博客副标题"字段即可

## 📁 项目结构

```
self_blog/
├── self_blog/           # 项目配置
│   ├── settings.py     # 配置
│   ├── urls.py         # 路由
│   └── views.py        # 全局视图
├── resume/              # 核心应用（数据模型）
│   ├── models.py       # 所有模型
│   ├── utils.py        # 图片压缩
│   └── migrations/     # 迁移文件
├── content_mgmt/        # 内容管理后台
├── homepage_mgmt/       # 首页管理后台
├── about_mgmt/          # 关于页管理后台
├── interaction/         # 用户互动后台
├── templates/           # 模板文件
├── static/              # 静态资源
└── media/               # 上传文件
```

## 📄 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | Hero区域、社交、项目、日常分享 |
| `/resume/` | 简历 | 个人简历完整展示 |
| `/about/` | 关于我 | 个人介绍 + 评论区 |
| `/exhibitions/` | 日常分享 | 图片展览墙 |
| `/blog/` | 博客列表 | 搜索 + 分类筛选 + 分页 |
| `/blog/<slug>/` | 博客详情 | 文章正文 + 浏览量 |
| `/admin/` | 后台管理 | Django Admin |

## 📞 联系方式

如有问题或建议，欢迎在评论区留言或通过 Issues 反馈。

---

**Made with ❤️ by Asitakawa | Powered by Django & Bootstrap**