/* ============================================================
 * 树洞奇缘 · 夜班归档
 * 把站点内容切成卡片，玩家读线索、归进四个抽屉。
 * 归对盖章，归错退回并烧掉一格灯油；灯油见底今晚就白干。
 * ============================================================ */
(function () {
  'use strict';

  var app = document.getElementById('vn-app');
  var API = app && app.dataset.archiveApi;
  var LS = 'vn_archive';

  var KINDS = [
    { key: 'study', label: '学业', note: '学校、专业、校园里的事' },
    { key: 'work', label: '工作', note: '实习、项目、做出来的东西' },
    { key: 'writing', label: '写作', note: '博客与深夜的笔记' },
    { key: 'life', label: '生活', note: '展览、兴趣、日常' },
  ];

  var $ = function (id) { return document.getElementById(id); };

  var root = $('vn-archive');
  var stack = $('ar-stack');
  var drawersEl = $('ar-drawers');
  var resultEl = $('ar-result');
  var stampEl = $('ar-stamp');
  var stage = $('ar-stage');

  var desk = null;
  var deskTried = false;
  var cache = null;
  var state = {
    cards: [],
    deck: [],
    index: 0,
    oil: 3,
    maxOil: 3,
    correct: 0,
    wrong: 0,
    night: 1,
    cleared: 0,
    startedAt: 0,
    busy: false,
    open: false,
    dragging: null,
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function readSave() {
    try {
      var raw = JSON.parse(localStorage.getItem(LS) || '{}');
      return {
        night: Math.max(1, parseInt(raw.night, 10) || 1),
        cleared: Math.max(0, parseInt(raw.cleared, 10) || 0),
      };
    } catch (e) {
      return { night: 1, cleared: 0 };
    }
  }

  function writeSave(data) {
    try { localStorage.setItem(LS, JSON.stringify(data)); } catch (e) { /* 忽略 */ }
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function buildDeck(cards, size) {
    var groups = {};
    cards.forEach(function (c) {
      (groups[c.kind] = groups[c.kind] || []).push(c);
    });
    var keys = Object.keys(groups);
    keys.forEach(function (k) { groups[k] = shuffle(groups[k]); });

    var out = [];
    var round = 0;
    while (out.length < size) {
      var added = false;
      for (var i = 0; i < keys.length && out.length < size; i++) {
        var item = groups[keys[i]][round];
        if (item) { out.push(item); added = true; }
      }
      if (!added) break;
      round++;
    }
    return shuffle(out);
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function loadCards() {
    if (cache) return Promise.resolve(cache);
    return fetch(API, { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        cache = (data.cards || []).filter(function (c) { return c && c.title; });
        return cache;
      })
      .catch(function () { return []; });
  }

  /* ---------------- 3D 桌面 ---------------- */

  function ensureDesk() {
    if (deskTried) return Promise.resolve(desk);
    deskTried = true;

    var url = app && app.dataset.desk3d;
    if (!url || !stage || !window.WebGLRenderingContext) return Promise.resolve(null);

    return import(url).then(function (mod) {
      if (!state.open) return null;
      try {
        desk = new mod.Desk3D(stage, {
          drawers: KINDS.map(function (k, i) {
            return { key: k.key, label: k.label, note: k.note, no: '0' + (i + 1) };
          }),
          onFile: function (kind) { file(kind); },
        });
        root.classList.add('ar-3d');
        return desk;
      } catch (e) {
        desk = null;
        deskTried = false;
        return null;
      }
    }).catch(function () {
      deskTried = false;
      return null;
    });
  }

  function dropDesk() {
    if (desk) {
      desk.dispose();
      desk = null;
    }
    deskTried = false;
    if (stage) stage.innerHTML = '';
    root.classList.remove('ar-3d');
  }

  function countsMap() {
    var map = {};
    state.deck.slice(0, state.index).forEach(function (c) {
      map[c.kind] = (map[c.kind] || 0) + 1;
    });
    return map;
  }

  /* ---------------- 渲染 ---------------- */

  function renderDrawers() {
    drawersEl.innerHTML = KINDS.map(function (k, i) {
      return '<button class="ar-drawer" data-kind="' + k.key + '">' +
        '<span class="ar-drawer-no">' + (i + 1) + '</span>' +
        '<b>' + k.label + '</b>' +
        '<small>' + k.note + '</small>' +
        '<span class="ar-drawer-count" data-count="' + k.key + '">0</span>' +
        '</button>';
    }).join('');
    drawersEl.querySelectorAll('.ar-drawer').forEach(function (btn) {
      btn.addEventListener('click', function () { file(btn.dataset.kind); });
    });
  }

  function updateCounts() {
    KINDS.forEach(function (k) {
      var n = state.deck.slice(0, state.index).filter(function (c) { return c.kind === k.key; }).length;
      var el = drawersEl.querySelector('[data-count="' + k.key + '"]');
      if (el) el.textContent = n;
    });
    if (desk) desk.setCounts(countsMap());
  }

  function renderOil() {
    var el = $('ar-oil');
    if (!el) return;
    var html = '';
    for (var i = 0; i < state.maxOil; i++) {
      html += '<i class="' + (i < state.oil ? 'on' : '') + '"></i>';
    }
    el.innerHTML = html;
    el.setAttribute('aria-label', '灯油 ' + state.oil + ' / ' + state.maxOil);
    if (desk) desk.setOil(state.oil);
  }

  function renderHeader() {
    $('ar-night').textContent = '第 ' + pad(state.night) + ' 夜';
    $('ar-count').textContent = '已归档 ' + state.index + ' / ' + state.deck.length;
  }

  function renderCard() {
    if (state.index >= state.deck.length) {
      finishNight(true);
      return;
    }
    var card = state.deck[state.index];
    var backs = '<div class="ar-card ar-card--back"></div><div class="ar-card ar-card--back ar-card--back2"></div>';
    stack.innerHTML = backs +
      '<article class="ar-card ar-card--top" data-kind="' + esc(card.kind) + '" data-id="' + esc(card.id) + '">' +
      '<div class="ar-card-head">' +
      '<span class="ar-card-source">' + esc(card.source || '档案') + '</span>' +
      (card.date ? '<span class="ar-card-date">' + esc(card.date) + '</span>' : '') +
      '</div>' +
      '<h3>' + esc(card.title) + '</h3>' +
      '<p>' + esc(card.text) + '</p>' +
      '<span class="ar-card-hint">拖进抽屉，或按 1–4</span>' +
      '</article>';

    var top = stack.querySelector('.ar-card--top');
    bindDrag(top);
    renderHeader();
    updateCounts();
    if (desk) desk.setCard(card);
  }

  /* ---------------- 交互 ---------------- */

  function bindDrag(card) {
    var startX = 0;
    var startY = 0;

    card.addEventListener('pointerdown', function (e) {
      if (state.busy) return;
      state.dragging = { card: card, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0 };
      card.classList.add('dragging');
      card.setPointerCapture && card.setPointerCapture(e.pointerId);
    });

    card.addEventListener('pointermove', function (e) {
      var d = state.dragging;
      if (!d || d.card !== card) return;
      d.dx = e.clientX - d.sx;
      d.dy = e.clientY - d.sy;
      card.style.transform = 'translate(' + d.dx + 'px,' + d.dy + 'px) rotate(-1deg)';
      highlightDrawer(e.clientX, e.clientY);
    });

    card.addEventListener('pointerup', function (e) {
      var d = state.dragging;
      if (!d || d.card !== card) return;
      state.dragging = null;
      card.classList.remove('dragging');
      card.style.transform = '';
      clearHighlight();

      if (Math.abs(d.dx) + Math.abs(d.dy) < 10) return;
      var target = drawerAt(e.clientX, e.clientY);
      if (target) {
        file(target);
      }
    });

    card.addEventListener('pointercancel', function () {
      state.dragging = null;
      card.classList.remove('dragging');
      card.style.transform = '';
      clearHighlight();
    });
  }

  function drawerAt(x, y) {
    var el = document.elementFromPoint(x, y);
    var drawer = el && el.closest ? el.closest('.ar-drawer') : null;
    return drawer ? drawer.dataset.kind : null;
  }

  function highlightDrawer(x, y) {
    var kind = drawerAt(x, y);
    drawersEl.querySelectorAll('.ar-drawer').forEach(function (d) {
      d.classList.toggle('hot', d.dataset.kind === kind);
    });
  }

  function clearHighlight() {
    drawersEl.querySelectorAll('.ar-drawer').forEach(function (d) { d.classList.remove('hot'); });
  }

  function showStamp(text, bad) {
    stampEl.textContent = text;
    stampEl.classList.remove('vn-hidden', 'ok', 'bad', 'show');
    void stampEl.offsetWidth;
    stampEl.classList.add(bad ? 'bad' : 'ok', 'show');
    setTimeout(function () { stampEl.classList.remove('show'); }, 700);
  }

  function file(kind) {
    if (!state.open || state.busy || state.index >= state.deck.length) return;
    var card = state.deck[state.index];
    var top = stack.querySelector('.ar-card--top');
    if (!top && !desk) return;

    var ok = kind === card.kind;

    if (ok) {
      state.busy = true;
      state.correct++;
      if (desk) {
        desk.react(true, kind);
      } else {
        showStamp('归档', false);
        if (window.GameAudio) window.GameAudio.sfx('stamp');
        top.classList.add('filed');
      }
      setTimeout(function () {
        state.index++;
        state.busy = false;
        renderCard();
      }, 380);
    } else {
      state.busy = true;
      state.wrong++;
      state.oil--;
      renderOil();
      if (desk) {
        desk.react(false, kind);
      } else {
        showStamp('退回', true);
        if (window.GameAudio) window.GameAudio.sfx('wrong');
        top.classList.add('reject');
      }
      setTimeout(function () {
        if (top) top.classList.remove('reject');
        state.busy = false;
        if (state.oil <= 0) finishNight(false);
      }, 460);
    }
  }

  /* ---------------- 开局与结算 ---------------- */

  function startNight(night) {
    Promise.all([loadCards(), ensureDesk()]).then(function (res) {
      var cards = res[0];
      if (!cards.length) {
        stack.innerHTML = '<div class="ar-card ar-card--top"><h3>今晚没有档案</h3><p>后台还没有可归档的内容，先去写点什么吧。</p></div>';
        if (desk) desk.setCard(null);
        return;
      }
      state.cards = cards;
      state.night = night;
      state.deck = buildDeck(cards, Math.min(8, cards.length));
      state.index = 0;
      state.oil = state.maxOil;
      state.correct = 0;
      state.wrong = 0;
      state.busy = false;
      state.startedAt = Date.now();
      resultEl.classList.add('vn-hidden');
      renderDrawers();
      renderOil();
      renderHeader();
      renderCard();
      if (window.VNEngine && window.VNEngine.pauseAuto) window.VNEngine.pauseAuto();
    });
  }

  function fmtDuration(ms) {
    var total = Math.round(ms / 1000);
    return pad(Math.floor(total / 60)) + ':' + pad(total % 60);
  }

  function finishNight(success) {
    var save = readSave();

    if (success) {
      save.night = Math.max(save.night, state.night + 1);
      save.cleared = save.cleared + 1;
      writeSave(save);
      updateRecord();
      if (window.GameScenes) window.GameScenes.unlock('archive');
      if (window.GameAudio) window.GameAudio.sfx('chapter');
    }

    $('ar-result-kicker').textContent = 'NIGHT ' + pad(state.night);
    $('ar-result-title').textContent = success ? '归档完成' : '灯灭了';
    $('ar-result-desc').textContent = success
      ? '最后一格抽屉合上，灯芯还亮着。今晚的档案没有丢。'
      : '灯油见底，剩下的卡片被退了回来。明晚再来。';

    $('ar-result-stats').innerHTML =
      '<div><span>归档</span><b>' + (success ? state.deck.length : state.index) + ' / ' + state.deck.length + '</b></div>' +
      '<div><span>退回</span><b>' + state.wrong + '</b></div>' +
      '<div><span>用时</span><b>' + fmtDuration(Date.now() - state.startedAt) + '</b></div>';

    var actions = $('ar-result-actions');
    actions.innerHTML = '';
    if (success) {
      actions.appendChild(btn('再来一夜', 'vn-btn vn-btn-primary', function () {
        resultEl.classList.add('vn-hidden');
        state.open = true;
        startNight(state.night + 1);
      }));
      actions.appendChild(btn('读今晚的信', 'vn-btn', function () {
        resultEl.classList.add('vn-hidden');
        close();
        if (window.VNEngine && window.VNEngine.gotoChapter) {
          window.VNEngine.gotoChapter(Math.min(state.night - 1, (window.VNEngine.chapterCount || function () { return 1; })() - 1));
        }
      }));
    } else {
      actions.appendChild(btn('再试一次', 'vn-btn vn-btn-primary', function () {
        resultEl.classList.add('vn-hidden');
        state.open = true;
        startNight(state.night);
      }));
    }
    actions.appendChild(btn('回到树洞', 'vn-btn', function () {
      resultEl.classList.add('vn-hidden');
      close();
    }));

    resultEl.classList.remove('vn-hidden');
  }

  function btn(text, cls, onClick) {
    var b = document.createElement('button');
    b.className = cls;
    b.textContent = text;
    b.addEventListener('click', onClick);
    return b;
  }

  function updateRecord() {
    var el = $('ar-record');
    if (!el) return;
    var save = readSave();
    el.textContent = save.cleared > 0 ? '已值守 ' + save.cleared + ' 夜' : '';
  }

  /* ---------------- 开关 ---------------- */

  function start() {
    if (state.open) return;
    var save = readSave();
    state.open = true;
    state.night = save.night;
    state.cleared = save.cleared;
    root.classList.remove('vn-hidden');
    document.body.classList.add('archive-open');
    if (window.GameAudio) window.GameAudio.start();
    startNight(state.night);
  }

  function close() {
    state.open = false;
    state.dragging = null;
    root.classList.add('vn-hidden');
    document.body.classList.remove('archive-open');
    resultEl.classList.add('vn-hidden');
    dropDesk();
  }

  /* ---------------- 事件 ---------------- */

  if (root) {
    root.addEventListener('click', function (e) { e.stopPropagation(); });
    $('ar-close').addEventListener('click', close);
  }

  document.addEventListener('keydown', function (e) {
    if (!state.open) return;
    if (e.key === 'Escape') { close(); return; }
    var idx = parseInt(e.key, 10);
    if (idx >= 1 && idx <= 4) {
      e.preventDefault();
      file(KINDS[idx - 1].key);
    }
  });

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('[data-act="archive"]');
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      start();
    }
  });

  window.GameArchive = {
    start: start,
    close: close,
    isOpen: function () { return state.open; },
    file: file,
    state: state,
    kinds: KINDS,
    deskInstance: function () { return desk; },
  };

  updateRecord();
})();
