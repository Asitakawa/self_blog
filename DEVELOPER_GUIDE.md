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
├── game/                       # 视觉小说《树洞奇缘》
│   ├── models.py              # 角色 / 章节 / 台词 / 选项 / 记忆碎片 / 留言
│   ├── views.py               # /api/story/ 剧情、/api/content/ 场景内容、阅读器与留言 API
│   ├── urls.py / admin.py     # 章节内联台词、台词内联选项、碎片场景下拉
│   ├── management/commands/seed_story.py   # 示例剧情与碎片重置命令
│   └── templates/game/play.html   # 游戏主界面（独立模板）
├── static/js/game/desk3d.js    # 3D 夜班桌面（Three.js，动态 import）
├── static/js/game/shelf3d.js   # 3D 书架（Three.js，动态 import）
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

### 0. 视觉小说《树洞奇缘》 (`/`、`/play/`)

**模板**：`game/templates/game/play.html`（独立模板，不继承 base.html）
**引擎**：`static/js/game/engine.js`（剧情推进 / 存档 / 章节）+ `static/js/game/scenes.js`（游戏内场景）+ `static/css/game.css`

数据流：Django Admin 编辑剧情 → `/api/story/` 输出 JSON → 引擎渲染。台词类型三种：
- `text`：角色台词（带名牌与头像，头像来自 `GameCharacter.avatar`）
- `narration`：旁白（无名牌，暗色文字）
- `dynamic_blogs`：动态节点——引擎把 `latest_posts` 渲染为选项

选项跳转优先级：`url` > `goto_chapter` > `goto_dialogue`，三者都空则线性继续。

**`panel:` 协议**：选项的 `url` 以 `panel:` 开头时，不跳页，而是在游戏内打开场景：

| 值 | 场景 | 数据来源 |
|----|------|----------|
| `panel:resume` | 档案室（简历手账） | `/api/content/` 的 profile / educations / internships / projects / skills / campus / hobbies / tags |
| `panel:blogs` | 书架 | `/api/content/` 的 posts |
| `panel:gallery` | 相册 | `/api/content/` 的 exhibitions（图片 + 灯箱） |
| `panel:about` | 关于（信件） | `/api/content/` 的 about + contacts + socials |
| `panel:guestbook` | 留言板 | `/api/guestbook/`，POST 同路径 `/api/guestbook/post/` |
| `panel:achievements` | 探索记录 | 本地 localStorage |

阅读器单独走 `/api/post/<slug>/`，返回文章正文 HTML（内容由后台 CKEditor 撰写，属可信来源）。

#### 夜班归档（`static/js/game/archive.js`）

主玩法，入口在标题页主按钮与顶栏「夜班」。状态与渲染分离：优先用 3D 桌面（`desk3d.js`），WebGL 不可用时同一套状态驱动 DOM 卡牌。

- **数据**：`/api/archive/`（`views.archive_api`）把 Education / CampusActivity / Internship / Project / BlogPost / ExhibitionDiary / Hobby 映射成四种 `kind`：`study` / `work` / `writing` / `life`。
- **发牌**：`buildDeck()` 先按 kind 分组洗牌，再轮询抽取，保证一晚 8 张不会全是「生活」。
- **判定**：`file(kind)` 比较卡片 kind；正确盖章并前进，错误扣 `oil`、卡片抖一下、停在原卡。`oil <= 0` 结算失败。
- **输入**：点抽屉、按 1–4、把卡片拖进抽屉三种都行；3D 下由 `Desk3D` 的 Raycaster 判定落点，2D 下用 `elementFromPoint`。
- **渲染同步**：`renderCard / updateCounts / renderOil` 同时更新 DOM 与 `desk.setCard / setCounts / setOil`；DOM 版始终保留，用于回退、读屏与 jsdom 测试。
- **存档**：`vn_archive` 存 `{night, cleared}`；成功后 `night+1`、`cleared+1`，标题页显示值守次数。
- **与剧情衔接**：结算的「读今晚的信」调用 `VNEngine.gotoChapter(night-1)`，把当前夜映射到章节。
- **测试**：`node test_archive.js`（jsdom，25 项，走 DOM 回退）+ `node test_desk3d.js`（真实 Chrome + WebGL，23 项）。

#### 立绘、CG 与演出

- **立绘**：`GameCharacter.avatar` 为默认立绘；`sprite_smile` / `sprite_worried` 存表情图路径（`/static/...` 或 `/media/...`）。`GameDialogue.mood` 选表情，`/api/story/` 会把它合并进 `character.avatar` 返回。
- **显示**：立绘固定在右侧、底部对齐；旁白时保留并压暗（`.dim`），角色开口时恢复。切表情走 preload + `dataset.want` 守卫，快速推进不会串图。
- **章节 CG**：就是 `GameChapter.background`，现为 `cg_rain / cg_desk / cg_shelf / cg_photos / cg_window` 五张，交叉淡化由引擎的 `.vn-bg` 双层完成。
- **章节标题卡**：进入新章节时显示 2.1 秒（badge + 标题 + 朱砂短线），音效 `chapter`。
- **标题封面**：`static/images/game/key_visual.jpg`，带 26 秒 ken-burns 缓动。
- **声音**：`static/js/game/audio.js` 全部 WebAudio 合成，不加载音频文件——低频环境垫、打字纸声、选项、印章、章节转场。顶栏「声音」开关写入 `vn_sound`，首次点击时解锁 AudioContext。
- **素材处理**：AI 生成的图底部带水印，统一裁掉最后 58px；角色图以纯黑底生成，再按亮度（≤14 透明，14–30 过渡）转 alpha 并裁边。

#### 3D 夜班桌面（`static/js/game/desk3d.js`）

- **场景**：程序化生成的木桌（BoxGeometry + Canvas 木纹贴图）、桌垫、银行家台灯（灯罩 + 假体积光锥 + SpotLight）、印泥、钢笔、桌角三盏油灯、背景书柜剪影与浮尘。
- **卡片**：一张 3.3×2.2 的纸，CanvasTexture 现场绘制页眉、标题、正文、栏线与「待归档」淡印；纸面前缘贴桌、后缘微微翘起（`CARD_TILT`），避免下半张沉进桌面。
- **抽屉**：四只木托盘，索引卡朝镜头；悬停时托盘前移 0.13、索引卡发光。
- **交互**：Raycaster 命中卡片后可拖拽（射线与 y=0.1 平面求交），经过托盘高亮，松手即归档；轻点托盘同样归档（`onFile(kind)` 交给 archive.js）。
- **动画**：印章 0.1s 落下 → 纸上出现朱砂印 → 0.18s 抬起；归对时卡片缩到 0.65 飞向抽屉后淡出，归错时绕 Y 轴抖动。所有动画走一个轻量 job 队列，`cardToken` 防止旧动画改到新卡片。
- **灯油**：`setOil(n)` 控制三盏灯的 emissive、火苗可见性与聚光强度，归错一盏就暗下去。
- **性能**：像素比上限 1.75、阴影贴图 1024、ACES 色调映射；关闭夜班时 `dispose()` 释放几何体、贴图与 WebGL 上下文。
- **竖屏**：`_layoutTrays()` 在窄屏把抽屉缩到 0.6 倍并收拢到中间，避免两侧被裁掉。
- **回退**：`archive.js` 动态 import，构造失败或 WebGL 不可用时自动改用 DOM 卡牌。
- **场景纸页**：`scenes.js` 在宽屏用 `Desk3D({ambient:true})` 铺一张同样的桌子当背景，纸页用 CSS `perspective` 轻微倾斜并跟随鼠标（书架与阅读器不叠，省一个 WebGL 上下文）。

#### 3D 书架（`static/js/game/shelf3d.js`）

书架场景默认是 Three.js 实时渲染的 3D 木书柜，不是贴图：

- **模型**：全部程序化生成——柜体由 BoxGeometry 拼装，书脊用 CanvasTexture 现场绘制（分类色底 + 书名竖排 + 烫金线），装饰旧书用同一函数留空书名填充空隙。
- **真实文章**：按发布时间从上往下、从左往右摆，书脊带金色书签带，只有这些参与拾取；装饰书不响应点击。
- **交互**：pointer 拖拽旋转（方位角 ±0.5 rad）、滚轮缩放（4.7–8.2）、悬停 Raycaster 命中后抬起 0.055 并点亮书脊、tooltip 显示标题与分类；点击调 `GameScenes.openPost(slug)` 打开游戏内阅读器。触摸设备在 pointerup 时重新拾取，因为没有 hover。
- **性能与生命周期**：像素比上限 1.75、单方向光阴影 1024；场景关闭或切换时 `dispose()` 释放 renderer / geometry / material / texture，并移除 canvas。
- **回退**：`scenes.js` 先检测 WebGL，不支持或模块加载失败时渲染 2D 书单，并给出提示；用户可用「切换列表视图 / 切换 3D 书架」手动切换，偏好存 `vn_shelf_mode`。
- **依赖**：`static/js/vendor/three.module.js`（r160，MIT，本地内置，不走 CDN）。

调试技巧：`/?scene=blogs` 直接打开书架；`window.GameScenes.shelfInstance()` 可取到当前实例。

**收集与成就**：`GameMemoryFragment` 定义碎片藏在哪个场景（`panel` 字段：resume / blogs / gallery / about / board）。前端在对应场景的 `.vn-scene-body` 里随机撒一个 `.vn-spark`，点击写入 `vn_frags`；集齐全部触发真结局。成就有 10 项，存在 `vn_ach`；阅读记录 `vn_read`；昵称绑定 `vn_nick`。

引擎内置：打字机（点击跳过）、自动播放、快进、对话履历、自动+手动存档（localStorage）、
章节解锁（`vn_unlocked`，通关或到达即解锁）、章节通关画面。选项弹出时点击不推进剧情；
场景打开时键盘与点击都不会穿透到剧情（`GameScenes.isOpen()` 守卫）。

内容页通过 `templates/partials/game_orb.html` 的「回到游戏」浮球与游戏互通。

#### 前端测试

```bash
npm install --no-save jsdom puppeteer-core   # 仅测试用，不入库
node test_scenes.js      # 场景与剧情交互（jsdom，48 项）
node test_shelf3d.js     # 3D 书架端到端（真实 Chrome + WebGL，13 项）
node test_desk3d.js      # 3D 夜班桌面端到端（真实 Chrome + WebGL，23 项）
```

`test_shelf3d.js` 需要本机 Chrome，路径写在文件顶部；它验证渲染、悬停命中、点击阅读、拖拽旋转与资源释放。

立绘与音效没有自动化用例，改动后用无头 Chrome 截图核对；重点看立绘底部是否被对话框自然裁切、旁白压暗是否过重、章节卡文字是否压到背景亮部。

立绘与音效没有自动化用例，改动后用无头 Chrome 截图核对；重点看立绘底部是否被对话框自然裁切、旁白压暗是否过重、章节卡文字是否压到背景亮部。

### 1. 树洞小屋 (`/home/`)

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

### 4. 日常分享 (`/home/exhibitions/`)

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
- `game.css`：视觉小说与游戏内场景（「深夜档案馆」主题，变量 + 组件）
- `style.css`：站点内容页样式（旧版深蓝主题）
- `sidebar.css`：侧边栏（简历/关于/展览/博客等页面共用）
- `about.css`：关于页
- `resume-optimized.css`：简历页动画与滚动条

模板在 `base.html` 只引 `style.css` + `sidebar.css`，各页面通过 `extra_css` 追加自己的样式。

### 游戏 UI 视觉系统（`game.css`）

游戏与内容页现在是同一套配色：取自原个人站的天空蓝 + 白纸 + 石板灰。深墨版留在 git 历史里。

```css
:root {
  --sky-1: #a1c4fd;  --sky-2: #c2e9fb;   /* 背景与柔和填充 */
  --sky-3: #dbeafe;  --sky-4: #f0f4ff;
  --blue: #2563eb;   --blue-deep: #1e40af;
  --ink: #0f172a;    --text: #0f172a;  --text-dim: #64748b;
  --line: #e2e8f0;   --rule: rgba(15,23,42,.1);
  --seal: #2563eb;   /* 强调色 = 原站蓝，不再用朱砂 */
  --paper: #ffffff;  --paper-2: #f8fbff;
}
```

- **字体**：标题/姓名用宋体（`--serif`），正文用系统无衬线栈（原 Figtree 依赖 Google Fonts，国内不可达，已移除）。
- **标题页**：浅色杂志封面——左对齐大标题 + 蓝色短线 + 实心/描边按钮 + 站点导航（简历/博客/关于/日常/主页），右侧白卡放封面图与场景目录。它不是纯游戏入口，也是这个个人网站的首页。
- **对话**：底部白色半透明卡片，深色正文；顶栏白色玻璃条，深色菜单。
- **选项**：白卡片列表，左侧蓝色竖条 + 右侧箭头，hover 右移 5px。
- **场景纸页**：白纸、18px 圆角、蓝色阴影；内部 `--vn-gold/--vn-accent` 指向蓝色。
- **动效**：统一 `cubic-bezier(.16,1,.3,1)`，纸页 22px 上浮淡入，不做回弹。
- **可访问性**：`focus-visible` 蓝色描边；`prefers-reduced-motion` 关闭全部动画。
- **3D**：木桌/书柜改为浅橡木 + 白天光线（`toneMappingExposure 0.78`），桌垫是雾蓝，书签带与印章改为蓝墨。

### 图片与加载优化
- 全站图片用 WebP：背景 1920px/225–408KB、章节 CG 92–184KB、角色立绘 60–90KB；原 PNG/JPG 保留在仓库但不再被引用。
- 侧栏动画 GIF（374KB）转 160px 动态 WebP（34KB）。
- 内容页图片 `loading="lazy" decoding="async"`；第二张背景改为首次滚动时才请求。
- `GZipMiddleware` 压缩 HTML/CSS/JS；生产环境再由 Nginx/WhiteNoise 处理静态压缩。
- Three.js（1.2MB）只在鼠标移到「开始夜班 / 剧情模式 / 书架」时才 `modulepreload`，不进首屏预算。
- 首屏实测：`/` 1829KB → 302KB，`/home/` 1263KB → 515KB（本地 headless，未压缩静态）。
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