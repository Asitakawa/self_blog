/* ============================================================
 * 树洞奇缘 · 游戏内场景系统
 * 把站点内容（简历 / 博客 / 展览 / 关于 / 留言）做成游戏场景，
 * 玩家在剧情中「走进」这些场景翻阅，而不是跳转到普通网页。
 * ============================================================ */
(function () {
  'use strict';

  var app = document.getElementById('vn-app');
  if (!app) return;

  var API = {
    content: app.dataset.contentApi,
    post: app.dataset.postApi,
    guestbook: app.dataset.guestbookApi,
    guestbookPost: app.dataset.guestbookPost,
  };

  var LS = { frags: 'vn_frags', ach: 'vn_ach', nick: 'vn_nick', read: 'vn_read', shelf: 'vn_shelf_mode' };

  var ACHIEVEMENTS = [
    { key: 'start', name: '推开树洞的门', desc: '开始这段故事' },
    { key: 'resume', name: '档案管理员', desc: '读完他的完整档案' },
    { key: 'blog1', name: '第一个故事', desc: '翻开一篇文章' },
    { key: 'blog3', name: '博览群书', desc: '读完三篇文章' },
    { key: 'gallery', name: '看展的人', desc: '打开相册' },
    { key: 'about', name: '认识我', desc: '读完那封信' },
    { key: 'board', name: '树洞回声', desc: '在留言板留下一条话' },
    { key: 'frag1', name: '拾光者', desc: '找到第一块记忆碎片' },
    { key: 'fragall', name: '记忆收藏家', desc: '集齐全部记忆碎片' },
    { key: 'archive', name: '夜班归档员', desc: '完成第一夜归档' },
    { key: 'ending', name: '树洞守护者', desc: '抵达真结局' },
  ];

  var root = document.getElementById('vn-scenes');
  var lightbox = document.getElementById('vn-lightbox');
  var ending = document.getElementById('vn-ending');
  var data = null;
  var loading = null;
  var current = null;
  var lastScene = 'blogs';

  var $ = function (id) { return document.getElementById(id); };

  /* ---------------- 基础工具 ---------------- */

  function readLS(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 忽略 */ }
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function toast(msg) {
    if (window.VNEngine && window.VNEngine.toast) window.VNEngine.toast(msg);
  }
  function empty(text) {
    return '<p class="vn-empty">' + esc(text) + '</p>';
  }

  /* ---------------- 成就与碎片 ---------------- */

  function achievements() { return readLS(LS.ach, {}); }

  function unlock(key) {
    var got = achievements();
    if (got[key]) return false;
    got[key] = Date.now();
    writeLS(LS.ach, got);
    var def = ACHIEVEMENTS.filter(function (a) { return a.key === key; })[0];
    if (def) {
      toast('成就解锁 · ' + def.name);
      if (window.GameAudio) window.GameAudio.sfx('stamp');
    }
    updateHud();
    return true;
  }

  function fragmentCodes() { return readLS(LS.frags, []); }

  function collectFragment(code) {
    var owned = fragmentCodes();
    if (owned.indexOf(code) !== -1) return;
    owned.push(code);
    writeLS(LS.frags, owned);
    var frag = (data.fragments || []).filter(function (f) { return f.code === code; })[0];
    if (frag) toast('拾得记忆碎片「' + frag.name + '」：' + frag.hint);
    unlock('frag1');
    updateHud();
    if (data.fragments.length && owned.length >= data.fragments.length) {
      unlock('fragall');
      setTimeout(showEnding, 800);
    }
  }

  function updateHud() {
    var total = (data && data.fragments) ? data.fragments.length : 0;
    var owned = fragmentCodes().length;
    var ach = Object.keys(achievements()).length;
    var fc = $('vn-frag-count'); if (fc) fc.textContent = Math.min(owned, total);
    var ft = $('vn-frag-total'); if (ft) ft.textContent = total;
    var ac = $('vn-ach-count'); if (ac) ac.textContent = ach;
  }

  /* ---------------- 场景开关 ---------------- */

  function open(kind) {
    if (!kind) kind = 'resume';
    ensureData().then(function () {
      current = kind;
      root.classList.remove('vn-hidden');
      document.body.classList.add('scene-open');
      Array.prototype.forEach.call(root.querySelectorAll('.vn-scene'), function (sec) {
        var on = sec.dataset.scene === kind;
        sec.classList.toggle('active', on);
        if (on) {
          sec.scrollTop = 0;
          var body = sec.querySelector('.vn-scene-body');
          if (body) body.scrollTop = 0;
        }
      });

      var renderers = {
        resume: renderResume,
        blogs: renderBlogs,
        reader: renderReader,
        gallery: renderGallery,
        about: renderAbout,
        board: renderBoard,
        achievements: renderAchievements,
      };
      if (renderers[kind]) renderers[kind]();
      if (window.VNEngine && window.VNEngine.pauseAuto) window.VNEngine.pauseAuto();
    });
  }

  function close() {
    root.classList.add('vn-hidden');
    document.body.classList.remove('scene-open');
    current = null;
  }

  function ensureData() {
    if (data) return Promise.resolve(data);
    if (loading) return loading;
    loading = fetch(API.content, { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        data = json;
        updateHud();
        return data;
      })
      .catch(function () {
        data = {
          profile: null, educations: [], internships: [], projects: [], skills: [],
          campus: [], hobbies: [], tags: [], about: null, posts: [], exhibitions: [],
          contacts: [], socials: [], fragments: [], guestbook: [], counts: {},
        };
        return data;
      });
    return loading;
  }

  /* ---------------- 场景一：档案室 ---------------- */

  function metaItem(label, value) {
    if (!value) return '';
    return '<div class="vn-meta-item"><span>' + esc(label) + '</span><b>' + esc(value) + '</b></div>';
  }

  function block(title, hint, inner, count) {
    return '<section class="vn-file-block">' +
      '<header><h3>' + esc(title) + '</h3>' +
      (hint ? '<p>' + esc(hint) + '</p>' : '') +
      (typeof count === 'number' ? '<span class="vn-file-count">' + count + '</span>' : '') +
      '</header>' + inner + '</section>';
  }

  function timeline(items) {
    if (!items.length) return empty('这一页还是空白。');
    return '<div class="vn-timeline">' + items.map(function (it) {
      return '<article class="vn-tl-item">' +
        '<div class="vn-tl-dot"></div>' +
        '<div class="vn-tl-body">' +
        '<div class="vn-tl-top"><h4>' + esc(it.title) + '</h4><span>' + esc(it.span) + '</span></div>' +
        (it.sub ? '<p class="vn-tl-sub">' + esc(it.sub) + '</p>' : '') +
        (it.desc ? '<p class="vn-tl-desc">' + esc(it.desc) + '</p>' : '') +
        (it.extra ? '<p class="vn-tl-desc">' + esc(it.extra) + '</p>' : '') +
        '</div></article>';
    }).join('') + '</div>';
  }

  function renderResume() {
    var d = data, p = d.profile;
    var h = '';

    h += '<div class="vn-file-head">';
    h += '<div class="vn-file-avatar">' +
      (p && p.avatar ? '<img src="' + esc(p.avatar) + '" alt="">' : '<span>' + esc(p ? p.name.slice(0, 1) : '？') + '</span>') +
      '</div>';
    h += '<div class="vn-file-head-main">';
    h += '<h3>' + esc(p ? p.name : '档案暂缺') + ' <small>' + esc(p ? p.intention || '' : '') + '</small></h3>';
    if (p && p.intro) h += '<p class="vn-file-intro">' + esc(p.intro) + '</p>';
    h += '</div></div>';

    if (p) {
      h += '<div class="vn-file-meta">' +
        metaItem('年龄', p.age ? p.age + ' 岁' : '') +
        metaItem('籍贯', p.hometown) +
        metaItem('邮箱', p.email) +
        metaItem('电话', p.phone) +
        metaItem('期望薪资', p.salary) +
        '</div>';
    }

    h += block('教育经历', '从哪间教室出发', timeline(d.educations.map(function (e) {
      return { title: e.school, sub: e.major + ' · ' + e.degree, span: e.span, desc: e.description };
    })), d.educations.length);

    h += block('实习与工作', '在真实项目里学到的', timeline(d.internships.map(function (i) {
      return { title: i.company, sub: i.position, span: i.span, desc: i.responsibilities };
    })), d.internships.length);

    h += block('项目', '亲手做出来的东西', timeline(d.projects.map(function (pr) {
      return {
        title: pr.name, sub: pr.role, span: pr.span, desc: pr.description,
        extra: pr.technologies.length ? '技术：' + pr.technologies.join(' · ') : '',
      };
    })), d.projects.length);

    if (d.skills.length) {
      var skillHtml = d.skills.map(function (group) {
        return '<div class="vn-skill-group"><h4>' + esc(group.category) + '</h4>' +
          group.items.map(function (s) {
            var pct = Math.max(0, Math.min(100, s.proficiency || 0));
            return '<div class="vn-skill"><span class="vn-skill-name">' + esc(s.name) + '</span>' +
              '<span class="vn-skill-bar"><i style="width:' + pct + '%"></i></span>' +
              '<span class="vn-skill-num">' + pct + '</span></div>';
          }).join('') + '</div>';
      }).join('');
      h += block('技能', '点亮的技能树', skillHtml);
    } else {
      h += block('技能', '点亮的技能树', empty('还没有录入技能。'));
    }

    h += block('校园实践', '课堂之外的那些事', timeline(d.campus.map(function (c) {
      return {
        title: c.organization, sub: c.role, span: c.span, desc: c.description,
        extra: c.achievements ? '成果：' + c.achievements : '',
      };
    })), d.campus.length);

    if (d.hobbies.length) {
      h += block('兴趣', '不在工位上的时候', '<div class="vn-chip-wrap">' +
        d.hobbies.map(function (x) { return '<span class="vn-chip">' + esc(x.name) + '</span>'; }).join('') +
        '</div>');
    }

    if (d.tags.length) {
      h += block('关键词', '如果要三句话介绍自己', '<div class="vn-chip-wrap">' +
        d.tags.map(function (t) { return '<span class="vn-chip vn-chip--tag">' + esc(t.name) + '</span>'; }).join('') +
        '</div>');
    }

    $('scene-resume-body').innerHTML = h;
    unlock('resume');
    plantFragment('resume', $('scene-resume-body'));
  }

  /* ---------------- 场景二：书架 / 阅读器 ---------------- */

  function shelfBar(total) {
    return '<div class="vn-shelf-bar">' +
      '<span class="vn-shelf-count">' + total + ' 本书在架上</span>' +
      '</div>';
  }

  function bookGridHtml(posts) {
    return '<div class="vn-book-grid">' + posts.map(function (p, i) {
      return '<button class="vn-book" data-post="' + esc(p.slug) + '">' +
        '<span class="vn-book-spine" style="background:' + esc(p.color) + '"></span>' +
        '<span class="vn-book-main">' +
        '<span class="vn-book-meta">' + esc(p.category || '随笔') + ' · ' + esc(p.date) + '</span>' +
        '<span class="vn-book-title">' + esc(p.title) + '</span>' +
        '<span class="vn-book-excerpt">' + esc(p.excerpt || '') + '</span>' +
        '<span class="vn-book-action">翻开第 ' + (i + 1) + ' 本 →</span>' +
        '</span></button>';
    }).join('') + '</div>';
  }

  function renderBookList(body, posts) {
    body.dataset.shelfMode = 'list';
    body.innerHTML = shelfBar(posts.length) + bookGridHtml(posts);
    plantFragment('blogs', body);
  }

  function renderBlogs() {
    var posts = data.posts || [];
    var body = $('scene-blogs-body');
    body.dataset.shelfMode = '';

    if (!posts.length) {
      body.innerHTML = empty('书架上还空着，等主人写下第一篇。');
      plantFragment('blogs', body);
      return;
    }

    renderBookList(body, posts);
  }

  function renderReader() {
    // 阅读器内容由 openReader 拉取后填充，这里只兜底空状态
    var body = $('scene-reader-body');
    if (!body.dataset.slug) body.innerHTML = empty('还没有选择要读的书。');
  }

  function openReader(slug) {
    lastScene = 'blogs';
    open('reader');
    var body = $('scene-reader-body');
    body.dataset.slug = slug;
    body.innerHTML = '<div class="vn-loading-inline">正在翻页…</div>';
    $('reader-meta').textContent = '';
    fetch(API.post.replace('__slug__', encodeURIComponent(slug)), { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (post) {
        if (!post.ok) { body.innerHTML = empty(post.error || '这篇文章不见了。'); return; }
        $('reader-meta').textContent = (post.category || '随笔') + ' · ' + post.date;
        body.innerHTML = '<article class="vn-prose">' +
          '<h1>' + esc(post.title) + '</h1>' +
          '<p class="vn-prose-meta">' + esc(post.date) +
          (post.category ? ' · ' + esc(post.category) : '') +
          (post.tags.length ? ' · ' + post.tags.map(esc).join(' / ') : '') + '</p>' +
          '<div class="vn-prose-body">' + post.html + '</div>' +
          '</article>';
        body.scrollTop = 0;

        var read = readLS(LS.read, []);
        if (read.indexOf(slug) === -1) {
          read.push(slug);
          writeLS(LS.read, read);
        }
        unlock('blog1');
        if (read.length >= 3) unlock('blog3');
      })
      .catch(function () {
        body.innerHTML = empty('翻页失败，请稍后再试。');
      });
  }

  /* ---------------- 场景三：相册 ---------------- */

  function renderGallery() {
    var items = data.exhibitions || [];
    var h = '';
    if (!items.length) {
      h = empty('墙上还空着，等他再出门看几次展。');
    } else {
      h = '<div class="vn-photo-grid">' + items.map(function (x, i) {
        var img = x.image
          ? '<img src="' + esc(x.image) + '" alt="' + esc(x.title) + '" loading="lazy">'
          : '<span class="vn-photo-blank">暂无照片</span>';
        return '<button class="vn-photo" data-photo="' + esc(x.image) + '" data-cap="' + esc(x.title) + '">' +
          img + '<span class="vn-photo-cap"><b>' + esc(x.title) + '</b><small>' + esc(x.date) + '</small></span></button>';
      }).join('') + '</div>';
    }
    $('scene-gallery-body').innerHTML = h;
    unlock('gallery');
    plantFragment('gallery', $('scene-gallery-body'));
  }

  function openLightbox(src, cap) {
    if (!src) return;
    $('vn-lightbox-img').src = src;
    $('vn-lightbox-cap').textContent = cap || '';
    lightbox.classList.remove('vn-hidden');
  }

  /* ---------------- 场景四：关于 ---------------- */

  function renderAbout() {
    var a = data.about;
    var h = '';
    if (!a) {
      h = empty('这封信还没有写完。');
    } else {
      h = '<div class="vn-letter">';
      if (a.welcome) h += '<p class="vn-letter-lead">' + esc(a.welcome) + '</p>';
      if (a.introduction) h += '<div class="vn-letter-body">' + esc(a.introduction) + '</div>';
      h += '</div>';

      if (a.sections.length) {
        h += '<div class="vn-about-sections">' + a.sections.map(function (s) {
          return '<section class="vn-about-card"><h3>' + esc(s.title) + '</h3>' +
            '<div class="vn-prose-body">' + s.content + '</div></section>';
        }).join('') + '</div>';
      }

      if (a.project) {
        h += '<section class="vn-about-card vn-about-project"><h3>' + esc(a.project_title || '关于这个站') + '</h3>' +
          '<div class="vn-prose-body">' + a.project + '</div></section>';
      }

      if (a.blessing) h += '<p class="vn-letter-sign">' + esc(a.blessing) + '</p>';

      if (data.contacts.length || data.socials.length) {
        h += '<div class="vn-contact-row">';
        data.contacts.forEach(function (c) {
          h += '<span class="vn-chip">' + esc(c.type) + '：' + esc(c.value) + '</span>';
        });
        data.socials.forEach(function (s) {
          h += '<a class="vn-chip vn-chip--link" href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + ' ↗</a>';
        });
        h += '</div>';
      }
    }
    $('scene-about-body').innerHTML = h;
    unlock('about');
    plantFragment('about', $('scene-about-body'));
  }

  /* ---------------- 场景五：留言板 ---------------- */

  function renderBoard() {
    var body = $('scene-board-body');
    var nick = readLS(LS.nick, '');
    fetch(API.guestbook, { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (json) { paintBoard(body, json.messages || [], nick); })
      .catch(function () { paintBoard(body, data.guestbook || [], nick); });
  }

  function paintBoard(body, messages, nick) {
    var h = '';
    h += '<div class="vn-board-form">';
    h += '<div class="vn-board-identity">' +
      (nick ? '<span class="vn-bound">身份已绑定：<b>' + esc(nick) + '</b></span>'
            : '<input id="vn-nick-input" class="vn-input" maxlength="30" placeholder="留下你的昵称（绑定后不可更改）">') +
      '</div>';
    h += '<div class="vn-board-compose">' +
      '<textarea id="vn-msg-input" class="vn-input" maxlength="200" rows="2" placeholder="想对这个树洞说点什么…"></textarea>' +
      '<button class="vn-btn vn-btn-primary" id="vn-msg-send">钉上去</button>' +
      '</div>';
    h += '<p class="vn-board-hint">昵称全站唯一，绑定后只能用同一身份继续留言。</p>';
    h += '</div>';

    h += '<div class="vn-board-list">';
    if (!messages.length) h += empty('留言板还是空的，你可以是第一个。');
    messages.forEach(function (m) {
      h += '<article class="vn-board-item">' +
        '<header><b>' + esc(m.nickname) + '</b><span>' + esc(m.time) + '</span></header>' +
        '<p>' + esc(m.content) + '</p></article>';
    });
    h += '</div>';
    body.innerHTML = h;

    var send = $('vn-msg-send');
    if (send) send.addEventListener('click', submitMessage);
    var msgInput = $('vn-msg-input');
    if (msgInput) msgInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitMessage();
    });
    plantFragment('board', body);
  }

  function submitMessage() {
    var nickInput = $('vn-nick-input');
    var nick = readLS(LS.nick, '') || (nickInput ? nickInput.value.trim() : '');
    var msgEl = $('vn-msg-input');
    var content = msgEl ? msgEl.value.trim() : '';
    if (!nick) { toast('先留个昵称吧'); if (nickInput) nickInput.focus(); return; }
    if (!content) { toast('留言不能是空的'); if (msgEl) msgEl.focus(); return; }

    var btn = $('vn-msg-send');
    if (btn) { btn.disabled = true; btn.textContent = '正在钉…'; }
    fetch(API.guestbookPost, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ nickname: nick, content: content }),
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) { toast(res.error || '留言失败'); if (btn) { btn.disabled = false; btn.textContent = '钉上去'; } return; }
        writeLS(LS.nick, nick);
        unlock('board');
        toast(res.reusing ? '欢迎回来，' + nick : '留言已钉上，' + nick);
        renderBoard();
      })
      .catch(function () {
        toast('网络不太稳，再试一次');
        if (btn) { btn.disabled = false; btn.textContent = '钉上去'; }
      });
  }

  /* ---------------- 场景六：探索记录 ---------------- */

  function renderAchievements() {
    var got = achievements();
    var owned = fragmentCodes();
    var total = (data.fragments || []).length;
    var pct = ACHIEVEMENTS.length ? Math.round(Object.keys(got).length / ACHIEVEMENTS.length * 100) : 0;

    var h = '<div class="vn-ach-progress">' +
      '<div class="vn-ach-progress-top"><span>探索度</span><b>' + Object.keys(got).length + ' / ' + ACHIEVEMENTS.length + '</b></div>' +
      '<div class="vn-ach-progress-bar"><i style="width:' + pct + '%"></i></div>' +
      '<p class="vn-ach-hint">碎片 ' + owned.length + ' / ' + total + ' · 集齐碎片会触发真结局</p>' +
      '</div>';

    h += '<div class="vn-ach-grid">' + ACHIEVEMENTS.map(function (a) {
      var on = !!got[a.key];
      return '<div class="vn-ach' + (on ? ' on' : '') + '">' +
        '<span class="vn-ach-icon">' + (on ? '✦' : '·') + '</span>' +
        '<div><b>' + esc(a.name) + '</b><small>' + esc(a.desc) + '</small></div>' +
        '</div>';
    }).join('') + '</div>';

    h += '<h3 class="vn-ach-sub">记忆碎片</h3><div class="vn-frag-list">' + data.fragments.map(function (f) {
      var on = owned.indexOf(f.code) !== -1;
      return '<div class="vn-frag' + (on ? ' on' : '') + '">' +
        '<span class="vn-frag-mark">' + (on ? '✦' : '?') + '</span>' +
        '<div><b>' + (on ? esc(f.name) : '未拾得的碎片') + '</b>' +
        '<small>' + (on ? esc(f.hint) : '藏在「' + esc(panelName(f.panel)) + '」里') + '</small></div>' +
        '</div>';
    }).join('') + '</div>';

    $('scene-achievements-body').innerHTML = h;
  }

  function panelName(key) {
    return { resume: '档案室', blogs: '书架', gallery: '相册', about: '关于', board: '留言板' }[key] || key;
  }

  /* ---------------- 碎片埋点 ---------------- */

  function plantFragment(panel, container) {
    if (!container || !data || !data.fragments) return;
    var frag = data.fragments.filter(function (f) { return f.panel === panel; })[0];
    if (!frag) return;
    if (fragmentCodes().indexOf(frag.code) !== -1) return;
    if (container.querySelector('.vn-spark')) return;

    var seed = 0;
    for (var i = 0; i < frag.code.length; i++) seed = (seed * 31 + frag.code.charCodeAt(i)) % 997;
    var top = 12 + (seed % 62);
    var left = 8 + ((seed * 7) % 74);

    var btn = document.createElement('button');
    btn.className = 'vn-spark';
    btn.type = 'button';
    btn.title = '这里有一点微光';
    btn.setAttribute('aria-label', '拾取记忆碎片');
    btn.style.top = top + '%';
    btn.style.left = left + '%';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      btn.classList.add('taken');
      collectFragment(frag.code);
      setTimeout(function () { btn.remove(); }, 400);
      if (current === 'achievements') renderAchievements();
    });
    container.appendChild(btn);
  }

  /* ---------------- 真结局 ---------------- */

  function showEnding() {
    if (!ending.classList.contains('vn-hidden')) return;
    unlock('ending');
    ending.classList.remove('vn-hidden');
    var actions = $('vn-ending-actions');
    actions.innerHTML = '';
    var b1 = document.createElement('button');
    b1.className = 'vn-btn vn-btn-primary';
    b1.textContent = '查看探索记录';
    b1.addEventListener('click', function () {
      ending.classList.add('vn-hidden');
      open('achievements');
    });
    var b2 = document.createElement('button');
    b2.className = 'vn-btn';
    b2.textContent = '回到标题';
    b2.addEventListener('click', function () {
      ending.classList.add('vn-hidden');
      if (window.VNEngine && window.VNEngine.showTitle) window.VNEngine.showTitle();
    });
    var b3 = document.createElement('button');
    b3.className = 'vn-btn';
    b3.textContent = '继续这段故事';
    b3.addEventListener('click', function () { ending.classList.add('vn-hidden'); });
    actions.appendChild(b1); actions.appendChild(b2); actions.appendChild(b3);
  }

  /* ---------------- 事件绑定 ---------------- */

  document.addEventListener('click', function (e) {
    // 关闭类先判定：场景容器本身也带 data-scene，不能让它把关闭点击吃掉
    if (e.target.closest('[data-scene-close]')) { close(); return; }
    if (e.target.closest('[data-reader-back]')) { open('blogs'); return; }

    var book = e.target.closest('[data-post]');
    if (book) { openReader(book.dataset.post); return; }

    var photo = e.target.closest('[data-photo]');
    if (photo) { openLightbox(photo.dataset.photo, photo.dataset.cap); return; }

    if (e.target.closest('[data-act="achievements"]')) {
      e.preventDefault();
      open('achievements');
      return;
    }

    var sceneBtn = e.target.closest('button[data-scene]');
    if (sceneBtn) {
      e.preventDefault();
      e.stopPropagation();
      open(sceneBtn.dataset.scene);
    }
  });

  $('vn-lightbox-close').addEventListener('click', function () {
    lightbox.classList.add('vn-hidden');
  });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) lightbox.classList.add('vn-hidden');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!lightbox.classList.contains('vn-hidden')) { lightbox.classList.add('vn-hidden'); return; }
      if (!ending.classList.contains('vn-hidden')) { ending.classList.add('vn-hidden'); return; }
      if (current) close();
    }
  });

  /* ---------------- 深链：#scene=blogs 直接进场景 ---------------- */

  var SCENES = ['resume', 'blogs', 'gallery', 'about', 'board', 'achievements'];

  function sceneFromUrl() {
    var s = null;
    try {
      s = new URLSearchParams(location.search).get('scene');
    } catch (e) { /* 老浏览器忽略 */ }
    if (!s && location.hash.indexOf('#scene=') === 0) s = location.hash.slice(7);
    return SCENES.indexOf(s) !== -1 ? s : null;
  }

  function openFromUrl() {
    var s = sceneFromUrl();
    if (s) open(s);
  }

  window.addEventListener('load', openFromUrl);
  window.addEventListener('hashchange', openFromUrl);
  // 提前取一次内容，HUD 的碎片总数不用等场景打开
  window.addEventListener('load', function () { ensureData(); });

  /* ---------------- 对外接口 ---------------- */

  window.GameScenes = {
    open: open,
    close: close,
    openPost: openReader,
    progress: function () {
      var total = (data && data.fragments) ? data.fragments.length : 0;
      return { owned: fragmentCodes().length, total: total };
    },
    isOpen: function () { return !!current; },
    toast: toast,
    unlock: unlock,
    showEnding: showEnding,
  };
})();
