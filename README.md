# 个人简历网站 - Personal Resume Website

一个基于Django和Bootstrap构建的现代化个人简历展示网站，支持通过后台管理实时修改内容。

## 🌟 功能特点

### 前台展示
- ✨ 响应式设计，完美支持手机、平板、电脑
- 🎨 基于Bootstrap 5.3.8的现代化UI
- 👤 个人信息卡片展示（姓名、联系方式、期望薪资等）
- 💼 实习/工作经历时间线
- 📁 项目经历详细展示（含技术栈）
- 📊 专业技能进度条可视化
- 🏆 校园实践成果展示
- 🖼️ 支持个人头像上传

### 后台管理
- 🔐 Django Admin完整的管理界面
- ✏️ 实时修改所有内容
- 🖼️ 支持图片上传
- 🔍 数据搜索和筛选
- 📋 中文管理界面
- 📊 数据排序功能

## 🛠️ 技术栈

- **后端框架**: Django 6.0.4
- **前端框架**: Bootstrap 5.3.8
- **图标库**: Bootstrap Icons 1.10.0
- **数据库**: SQLite3
- **包管理**: npm (Bootstrap依赖管理)
- **图片处理**: Pillow 12.2.0
- **开发语言**: Python 3.13

## 📦 项目结构

```
self_blog/
├── self_blog/              # 项目配置
│   ├── settings.py        # Django设置
│   ├── urls.py            # URL路由配置
│   └── views.py           # 视图函数
├── resume/                # 简历应用
│   ├── models.py          # 数据模型
│   ├── views.py           # 视图逻辑
│   ├── admin.py           # 后台管理配置
│   └── urls.py            # 应用路由
├── templates/             # 模板文件
│   ├── base.html          # 基础模板
│   └── resume/
│       └── resume.html    # 简历展示页面
├── static/                # 静态文件
│   ├── css/               # CSS文件（含Bootstrap）
│   ├── js/                # JavaScript文件（含Bootstrap）
│   └── images/            # 图片资源
├── media/                 # 媒体文件（上传的头像等）
├── manage.py              # Django管理脚本
└── package.json           # npm配置
```

## 🚀 快速开始

### 1. 环境要求
- Python 3.10+
- pip (Python包管理器)
- npm (Node.js包管理器)

### 2. 安装依赖

```bash
# 安装Python依赖
pip install django pillow

# 安装前端依赖（Bootstrap已通过npm安装）
npm install
```

### 3. 数据库迁移

```bash
# 生成迁移文件
python manage.py makemigrations

# 执行迁移
python manage.py migrate
```

### 4. 创建超级用户

```bash
python manage.py createsuperuser
```

按提示输入用户名、邮箱和密码。

### 5. 启动开发服务器

```bash
python manage.py runserver
```

### 6. 访问网站

- **简历展示页面**: http://127.0.0.1:8000/
- **后台管理页面**: http://127.0.0.1:8000/admin/

## 📝 使用指南

### 添加简历内容

1. **登录后台**: 访问 http://127.0.0.1:8000/admin/
2. **添加个人信息**: RESUME -> 个人基本信息 -> 增加
3. **添加实习经历**: RESUME -> 实习/工作经历 -> 增加
4. **添加项目经历**: RESUME -> 项目经历 -> 增加
5. **添加专业技能**: RESUME -> 专业技能 -> 增加
6. **添加校园实践**: RESUME -> 校园实践 -> 增加

详细内容请参考 [简历管理说明.md](./简历管理说明.md)

## 📊 数据模型

### Profile (个人基本信息)
- 姓名、性别、年龄、籍贯
- 电话、邮箱、期望薪资
- 头像、个人简介

### Internship (实习/工作经历)
- 公司、职位
- 开始/结束时间
- 工作职责

### Project (项目经历)
- 项目名称、角色
- 开始/结束时间
- 项目描述、使用技术

### Skill (专业技能)
- 技能分类、名称
- 熟练程度（1-5级）
- 技能描述、排序

### CampusActivity (校园实践)
- 组织/活动、角色
- 开始/结束时间
- 活动描述、成就

## 🎨 自定义样式

### 修改CSS
编辑 `static/css/style.css` 文件添加自定义样式。

### 修改模板
- 基础模板: `templates/base.html`
- 简历页面: `templates/resume/resume.html`

### 更新Bootstrap
```bash
npm update bootstrap
npm run copy-bootstrap
```

## 🔧 常见问题

### Q: 如何修改管理员密码？
```bash
python manage.py changepassword admin
```

### Q: 如何备份数据？
复制 `db.sqlite3` 文件即可。

### Q: 如何部署到生产环境？
1. 修改 `settings.py`: `DEBUG = False`
2. 配置 `ALLOWED_HOSTS`
3. 使用 Gunicorn/uWSGI + Nginx
4. 使用 PostgreSQL/MySQL

### Q: 静态文件不显示？
确保已运行:
```bash
npm run copy-bootstrap
```

## 📄 许可证

本项目仅供个人学习和使用。

## 📞 联系方式

如有问题或建议，欢迎联系！

---

**祝你使用愉快！** 🎉
