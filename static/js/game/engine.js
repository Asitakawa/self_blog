/* ============================================================
 * 树洞奇缘 · 视觉小说引擎（原生 JS，无依赖）
 * 数据来源：/game/api/story/（Django 后台可编辑）
 * ============================================================ */
(function () {
  'use strict';

  var app = document.getElementById('vn-app');
  var API = app.dataset.api;
  var HOME = app.dataset.home;

  var LS = { auto: 'vn_autosave', slot: 'vn_slot', unlocked: 'vn_unlocked', speed: 'vn_speed' };

  var $ = function (id) { return document.getElementById(id); };

  var el = {
    bgA: $('vn-bg-a'), bgB: $('vn-bg-b'),
    topbar: $('vn-topbar'), chapterLabel: $('vn-chapter-label'),
    avatar: $('vn-avatar'), avatarImg: $('vn-avatar-img'),
    dialog: $('vn-dialog'), namePlate: $('vn-name-plate'),
    name: $('vn-name'), nameTitle: $('vn-name-title'),
    text: $('vn-text'), caret: $('vn-caret'),
    choices: $('vn-choices'),
    title: $('vn-title'), clear: $('vn-clear'),
    clearBadge: $('vn-clear-badge'), clearTitle: $('vn-clear-title'),
    clearDesc: $('vn-clear-desc'), clearActions: $('vn-clear-actions'),
    log: $('vn-log'), logBody: $('vn-log-body'),
    chapterPanel: $('vn-chapter-panel'), chapterBody: $('vn-chapter-body'),
    savePanel: $('vn-save-panel'), saveTitle: $('vn-save-title'), saveBody: $('vn-save-body'),
    toast: $('vn-toast'), loading: $('vn-loading'),
    btnContinue: $('vn-btn-continue'),
  };

  var chapters = [];
  var latestPosts = [];
  var pos = null;            // { ci, di }
  var history = [];
  var autoMode = false;
  var skipMode = false;
  var bgToggle = false;      // 背景交叉淡化用
  var typeTimer = null;
  var autoTimer = null;
  var speed = +(localStorage.getItem(LS.speed) || 26);
  if (!isFinite(speed) || speed < 1) speed = 26; // 防御非法存值
  var curLine = null;

  /* ---------------- 工具 ---------------- */

  function readLS(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function writeLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 隐私模式忽略 */ }
  }

  function show(node) { node.classList.remove('vn-hidden'); }
  function hide(node) { node.classList.add('vn-hidden'); }

  var toastTimer = null;
  function toast(msg) {
    el.toast.textContent = msg;
    show(el.toast);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { hide(el.toast); }, 1800);
  }

  function chapter(i) { return chapters[i]; }
  function dialogues(ci) { return chapters[ci] ? chapters[ci].dialogues : []; }

  function getUnlocked() { return readLS(LS.unlocked, []); }
  function unlock(id) {
    var arr = getUnlocked();
    if (arr.indexOf(id) === -1) { arr.push(id); writeLS(LS.unlocked, arr); }
  }

  /* ---------------- 背景 ---------------- */

  function setBackground(url) {
    var incoming = bgToggle ? el.bgA : el.bgB;
    var staying = bgToggle ? el.bgB : el.bgA;
    bgToggle = !bgToggle;
    if (!url) { incoming.style.backgroundImage = ''; staying.classList.remove('on'); return; }
    incoming.style.backgroundImage = 'url("' + url + '")';
    incoming.classList.add('on');
    staying.classList.remove('on');
  }

  /* ---------------- 打字机 ---------------- */

  function typeText(text, done) {
    clearInterval(typeTimer);
    var i = 0;
    el.text.textContent = '';
    show(el.caret);
    el.caret.style.visibility = 'hidden';
    typeTimer = setInterval(function () {
      if (skipMode) { i = text.length; }
      el.text.textContent = text.slice(0, i);
      i++;
      if (i > text.length) {
        clearInterval(typeTimer);
        typeTimer = null;
        el.caret.style.visibility = 'visible';
        done();
      }
    }, speed);
    el.text._full = text;
  }

  function finishTyping() {
    if (!typeTimer) return false;
    clearInterval(typeTimer);
    typeTimer = null;
    el.text.textContent = el.text._full || '';
    el.caret.style.visibility = 'visible';
    return true;
  }

  /* ---------------- 剧情推进 ---------------- */

  function goto(ci, di, recordUnlock) {
    if (!chapters[ci]) { showTitle(); return; }
    pos = { ci: ci, di: di || 0 };
    if (recordUnlock !== false) unlock(chapters[ci].id);
    hide(el.title); hide(el.clear);
    show(el.topbar); show(el.dialog);
    el.chapterLabel.textContent =
      (chapters[ci].badge ? chapters[ci].badge + ' · ' : '') + chapters[ci].title;
    showLine();
  }

  function showLine() {
    var ch = chapter(pos.ci);
    var lines = dialogues(pos.ci);
    if (pos.di >= lines.length) { chapterEnd(); return; }
    var d = lines[pos.di];
    curLine = d;

    setBackground(ch.background);

    if (d.kind === 'narration' || !d.character) {
      hide(el.namePlate);
      hide(el.avatar);
      el.text.className = 'narration';
    } else {
      show(el.namePlate);
      el.name.textContent = d.character.name;
      el.name.style.color = d.character.color || 'var(--vn-gold)';
      el.nameTitle.textContent = d.character.title || '';
      el.text.className = '';
      if (d.character.avatar) {
        el.avatarImg.src = d.character.avatar;
        show(el.avatar);
      } else {
        hide(el.avatar);
      }
    }

    history.push({ name: d.character ? d.character.name : '', text: d.text, narration: d.kind === 'narration' });

    var branchAfter = d.branch || d.kind === 'dynamic_blogs';
    typeText(d.text, function () {
      autoSave();
      if (branchAfter) { showChoices(d); return; }
      if (skipMode) { autoTimer = setTimeout(advance, 120); return; }
      if (autoMode) { autoTimer = setTimeout(advance, 1300); }
    });
  }

  function advance() {
    clearTimeout(autoTimer);
    if (!pos) return;
    // 选项待机时不推进，防止误触穿透
    if (!el.choices.classList.contains('vn-hidden')) return;
    var lines = dialogues(pos.ci);
    if (pos.di + 1 < lines.length) {
      pos.di++;
      showLine();
    } else {
      chapterEnd();
    }
  }

  function chapterEnd() {
    autoSave();
    var ch = chapter(pos.ci);
    var next = null;
    for (var i = 0; i < chapters.length; i++) {
      if (chapters[i].id === ch.next) next = chapters[i];
    }
    el.clearBadge.textContent = 'CHAPTER CLEAR';
    el.clearTitle.textContent = ch.badge ? ch.badge + ' 完' : '「' + ch.title + '」完';
    el.clearDesc.textContent = next ? (next.intro || '旅程还在继续…') : '夜色温柔，故事未完待续。';
    el.clearActions.innerHTML = '';

    if (next) {
      el.clearActions.appendChild(btn('进入 · ' + next.title, 'vn-btn vn-btn-primary', function () {
        goto(chapters.indexOf(next), 0);
      }));
    }
    el.clearActions.appendChild(btn('章节选择', 'vn-btn', function () { openChapters(); }));
    el.clearActions.appendChild(btn('返回标题', 'vn-btn', function () { showTitle(); }));
    show(el.clear);
  }

  /* ---------------- 选项 ---------------- */

  function showChoices(d) {
    var list = [];
    if (d.kind === 'dynamic_blogs') {
      latestPosts.forEach(function (p) {
        list.push({ text: p.title, sub: p.excerpt, url: p.url, ext: true });
      });
      list.push({ text: '先不看了，继续剧情 →' });
    } else {
      (d.choices || []).forEach(function (c) {
        list.push({
          text: c.text,
          url: c.url,
          chapter: c.chapter,
          dialogue: c.dialogue,
          ext: !!c.url && c.url.indexOf('/') === 0 && c.url.split('/').length > 2,
        });
      });
    }
    if (!list.length) { advance(); return; }
    renderChoices(list);
  }

  function renderChoices(list) {
    el.choices.innerHTML = '';
    list.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'vn-choice';
      b.textContent = c.text;
      if (c.sub) {
        var s = document.createElement('small');
        s.textContent = c.sub;
        if (c.ext) s.className = 'vn-ext';
        b.appendChild(s);
      } else if (c.ext) {
        var s2 = document.createElement('small');
        s2.className = 'vn-ext';
        s2.textContent = '↗ 前往站内页面';
        b.appendChild(s2);
      }
      b.addEventListener('click', function (e) { e.stopPropagation(); choose(c); });
      el.choices.appendChild(b);
    });
    show(el.choices);
  }

  function choose(c) {
    hide(el.choices);
    if (c.url) {
      autoSave();
      window.location.href = c.url;
      return;
    }
    if (c.chapter) {
      var ci = chapters.findIndex(function (ch) { return ch.id === c.chapter; });
      if (ci >= 0) { goto(ci, 0); return; }
    }
    if (c.dialogue) {
      var found = locateDialogue(c.dialogue);
      if (found) { goto(found.ci, found.di); return; }
    }
    advance(); // 无目标 = 线性继续
  }

  function locateDialogue(did) {
    for (var ci = 0; ci < chapters.length; ci++) {
      for (var di = 0; di < chapters[ci].dialogues.length; di++) {
        if (chapters[ci].dialogues[di].id === did) return { ci: ci, di: di };
      }
    }
    return null;
  }

  /* ---------------- 存档 ---------------- */

  function saveData() {
    if (!pos) return null;
    var d = dialogues(pos.ci)[pos.di];
    return {
      c: chapter(pos.ci).id,
      d: d ? d.id : null,
      t: Date.now(),
      preview: curLine ? curLine.text.slice(0, 30) : '',
    };
  }
  function autoSave() { var s = saveData(); if (s) writeLS(LS.auto, s); }
  function manualSave() { var s = saveData(); if (s) { writeLS(LS.slot, s); toast('已保存'); } }

  function loadFrom(data) {
    var ci = chapters.findIndex(function (ch) { return ch.id === data.c; });
    if (ci < 0) { toast('剧情已更新，无法恢复存档'); return false; }
    var di = 0;
    if (data.d) {
      var idx = dialogues(ci).findIndex(function (x) { return x.id === data.d; });
      di = idx >= 0 ? idx : 0;
    }
    history = [];
    skipMode = false; autoMode = false;
    goto(ci, di);
    return true;
  }

  function fmtTime(t) {
    var d = new Date(t);
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' +
      ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  /* ---------------- 面板 ---------------- */

  function closePanels() {
    hide(el.log); hide(el.chapterPanel); hide(el.savePanel);
  }

  function openLog() {
    el.logBody.innerHTML = '';
    if (!history.length) {
      el.logBody.innerHTML = '<p style="color:var(--vn-ink-dim);font-size:.85rem">还没有对话记录。</p>';
    }
    history.forEach(function (h) {
      var item = document.createElement('div');
      item.className = 'vn-log-item' + (h.narration ? ' narration' : '');
      var name = document.createElement('div');
      name.className = 'vn-log-name';
      name.textContent = h.narration ? '旁白' : h.name;
      name.style.color = h.narration ? 'var(--vn-ink-dim)' : 'var(--vn-accent)';
      var text = document.createElement('div');
      text.className = 'vn-log-text';
      text.textContent = h.text;
      item.appendChild(name); item.appendChild(text);
      el.logBody.appendChild(item);
    });
    el.logBody.scrollTop = el.logBody.scrollHeight;
    show(el.log);
  }

  function openChapters() {
    el.chapterBody.innerHTML = '';
    var unlocked = getUnlocked();
    chapters.forEach(function (ch, ci) {
      var b = document.createElement('button');
      b.className = 'vn-chapter-item';
      var ok = ci === 0 || unlocked.indexOf(ch.id) !== -1;
      if (!ok) b.disabled = true;
      b.innerHTML =
        '<div class="vn-chapter-badge">' + (ch.badge || 'CHAPTER ' + (ci + 1)) + (ok ? '' : ' · 未解锁') + '</div>' +
        '<div class="vn-chapter-name"></div>' +
        '<div class="vn-chapter-intro"></div>';
      b.querySelector('.vn-chapter-name').textContent = ch.title;
      b.querySelector('.vn-chapter-intro').textContent = ch.intro || ' ';
      b.addEventListener('click', function () {
        if (!ok) return;
        closePanels();
        history = [];
        goto(ci, 0);
      });
      el.chapterBody.appendChild(b);
    });
    show(el.chapterPanel);
  }

  function openSave(mode) {
    el.saveTitle.textContent = mode === 'load' ? '读档' : '存档';
    el.saveBody.innerHTML = '';
    var auto = readLS(LS.auto, null);
    var slot = readLS(LS.slot, null);

    el.saveBody.appendChild(slotEl('自动存档', auto, function () {
      if (!auto) return;
      closePanels(); loadFrom(auto);
    }, mode === 'load'));
    el.saveBody.appendChild(slotEl('手动存档', slot, function () {
      if (mode === 'save') { manualSave(); openSave('save'); }
      else if (slot) { closePanels(); loadFrom(slot); }
    }, true));

    if (mode !== 'save') {
      var hint = document.createElement('p');
      hint.style.cssText = 'font-size:.75rem;color:var(--vn-ink-dim);margin-top:8px';
      hint.textContent = '提示：手动存档槽在「存档」面板写入，进度会同时自动保存到自动存档。';
      el.saveBody.appendChild(hint);
    }
    show(el.savePanel);
  }

  function slotEl(label, data, onClick, clickable) {
    var b = document.createElement('button');
    b.className = 'vn-slot' + (data ? '' : ' empty');
    var head = document.createElement('div');
    head.className = 'vn-slot-head';
    var name = document.createElement('span'); name.textContent = label;
    var time = document.createElement('span');
    time.textContent = data ? fmtTime(data.t) : '— 空 —';
    head.appendChild(name); head.appendChild(time);
    var text = document.createElement('div');
    text.className = 'vn-slot-text';
    text.textContent = data ? (data.preview || '……') : '暂无存档';
    b.appendChild(head); b.appendChild(text);
    if (clickable) b.addEventListener('click', onClick);
    else b.disabled = true;
    return b;
  }

  /* ---------------- 标题画面 ---------------- */

  function showTitle() {
    pos = null;
    skipMode = false; autoMode = false;
    syncMenuButtons();
    closePanels();
    hide(el.topbar); hide(el.dialog); hide(el.avatar);
    hide(el.choices); hide(el.clear);
    if (chapters.length && chapters[0].background) setBackground(chapters[0].background);
    el.btnContinue.hidden = !readLS(LS.auto, null);
    show(el.title);
  }

  /* ---------------- 交互 ---------------- */

  function btn(text, cls, onClick) {
    var b = document.createElement('button');
    b.className = cls;
    b.textContent = text;
    b.addEventListener('click', function (e) { e.stopPropagation(); onClick(); });
    return b;
  }

  function syncMenuButtons() {
    document.querySelector('[data-act="auto"]').classList.toggle('on', autoMode);
    document.querySelector('[data-act="skip"]').classList.toggle('on', skipMode);
  }

  document.getElementById('vn-menu').addEventListener('click', function (e) {
    e.stopPropagation();
    var act = e.target.dataset && e.target.dataset.act;
    if (!act) return;
    if (act === 'auto') { autoMode = !autoMode; if (autoMode) skipMode = false; syncMenuButtons(); toast(autoMode ? '自动播放：开' : '自动播放：关'); }
    if (act === 'skip') { skipMode = !skipMode; if (skipMode) autoMode = false; syncMenuButtons(); if (skipMode && !typeTimer) advance(); }
    if (act === 'log') openLog();
    if (act === 'save') openSave('save');
    if (act === 'load') openSave('load');
    if (act === 'chapters') openChapters();
    if (act === 'title') showTitle();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closePanels(); return; }
    if (!pos || typeTimer === null && el.choices && !el.choices.classList.contains('vn-hidden')) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (typeTimer) { finishTyping(); onTypingInterrupted(); }
      else advance();
    }
  });

  // 打字中被点击打断后，与自然打完一致的后续逻辑
  function onTypingInterrupted() {
    if (!curLine) return;
    var branchAfter = curLine.branch || curLine.kind === 'dynamic_blogs';
    if (branchAfter) showChoices(curLine);
  }

  app.addEventListener('click', function (e) {
    // 面板与按钮自己处理
    if (e.target.closest('.vn-panel') || e.target.closest('#vn-topbar')) return;
    if (e.target.closest('#vn-title') || e.target.closest('#vn-clear')) return;
    if (e.target.closest('#vn-choices')) return;
    if (!pos) return;
    if (typeTimer) { finishTyping(); onTypingInterrupted(); }
    else advance();
  });

  // 标题画面按钮
  el.title.addEventListener('click', function (e) {
    var act = e.target.dataset && e.target.dataset.act;
    if (!act) return;
    if (act === 'start') { history = []; goto(0, 0); }
    if (act === 'continue') { var s = readLS(LS.auto, null); if (s) loadFrom(s); }
    if (act === 'chapters') openChapters();
    if (act === 'leave') window.location.href = HOME;
  });

  /* ---------------- 启动 ---------------- */

  function boot(data) {
    chapters = data.chapters || [];
    latestPosts = data.latest_posts || [];
    if (!chapters.length) {
      el.loading.innerHTML = '后台还没有剧情数据，请先到 Django Admin → 游戏剧情 里编写章节。';
      return;
    }
    hide(el.loading);
    showTitle();
  }

  fetch(API, { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(boot)
    .catch(function () {
      el.loading.innerHTML = '剧情加载失败，请刷新重试。';
    });
})();
