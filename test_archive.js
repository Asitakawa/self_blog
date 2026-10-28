/* 夜班归档逻辑测试：jsdom + 真实页面结构，验证归档、灯油、结算与存档 */
const { JSDOM } = require('jsdom');
const fs = require('fs');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
function ok(cond, label, extra) {
  console.log((cond ? 'PASS ' : 'FAIL ') + label + (cond ? '' : '  << ' + (extra === undefined ? '' : extra)));
  if (!cond) failed++;
}

const KINDS = ['study', 'work', 'writing', 'life'];
const CARDS = KINDS.flatMap((kind, i) =>
  [0, 1].map((n) => ({
    id: `${kind}-${n}`,
    kind,
    title: `${kind} 卡片 ${n}`,
    text: `这是 ${kind} 的第 ${n} 条记录，用来确认归档判定。`,
    source: '测试',
    date: '2026.10',
  }))
);

(async () => {
  const base = 'http://127.0.0.1:8000';
  let html = await fetch(base + '/').then((r) => r.text());
  html = html.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');

  const dom = new JSDOM(html, { runScripts: 'outside-only', url: base + '/' });
  const { window } = dom;
  const doc = window.document;

  const story = {
    chapters: [{
      id: 1, badge: '序章', title: '测试章', intro: '', background: '', next: null,
      dialogues: [{ id: 1, order: 1, kind: 'narration', text: '测试用台词。', branch: false, character: null }],
    }],
    latest_posts: [],
  };

  window.fetch = (url) => {
    url = String(url);
    if (url.includes('/api/archive/')) return Promise.resolve({ json: () => Promise.resolve({ cards: CARDS }) });
    if (url.includes('/api/story/')) return Promise.resolve({ json: () => Promise.resolve(story) });
    if (url.includes('/api/content/')) {
      return Promise.resolve({ json: () => Promise.resolve({
        profile: null, educations: [], internships: [], projects: [], skills: [], campus: [],
        hobbies: [], tags: [], about: null, posts: [], exhibitions: [], contacts: [], socials: [],
        fragments: [], guestbook: [], counts: {},
      }) });
    }
    if (url.includes('/api/guestbook/')) return Promise.resolve({ json: () => Promise.resolve({ messages: [] }) });
    return Promise.reject(new Error('unexpected ' + url));
  };

  window.localStorage.setItem('vn_speed', '1');
  window.eval(fs.readFileSync('static/js/game/audio.js', 'utf8'));
  window.eval(fs.readFileSync('static/js/game/engine.js', 'utf8'));
  window.eval(fs.readFileSync('static/js/game/scenes.js', 'utf8'));
  window.eval(fs.readFileSync('static/js/game/archive.js', 'utf8'));
  await sleep(250);

  const $ = (id) => doc.getElementById(id);
  const q = (sel) => doc.querySelector(sel);
  const qa = (sel) => [...doc.querySelectorAll(sel)];
  const click = (el) => el && el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  const visible = (el) => !!el && !el.classList.contains('vn-hidden');
  const game = () => window.GameArchive.state;

  // 打开夜班
  ok(!!window.GameArchive, '夜班脚本已加载');
  click(q('[data-act="archive"]'));
  await sleep(400);
  ok(visible($('vn-archive')), '夜班界面打开');
  ok($('ar-night').textContent.includes('01'), '显示第 01 夜', $('ar-night').textContent);
  ok(game().deck.length === 8, '一晚 8 张卡片', game().deck.length);
  ok(qa('.ar-card--top').length === 1, '桌面只有一张待归档卡片');
  ok(qa('#ar-oil i.on').length === 3, '灯油满格 3');
  ok(qa('.ar-drawer').length === 4, '四个抽屉');

  // 归错：灯油 -1，卡片不前进
  const firstKind = game().deck[0].kind;
  const wrongKind = KINDS.find((k) => k !== firstKind);
  click(q(`.ar-drawer[data-kind="${wrongKind}"]`));
  await sleep(600);
  ok(game().oil === 2, '归错扣一格灯油', game().oil);
  ok(game().index === 0, '归错时卡片留在原处', game().index);
  ok(qa('#ar-oil i.on').length === 2, '灯油 UI 同步');

  // 连续归对剩余全部
  for (let i = 0; i < 8; i++) {
    const kind = game().deck[game().index].kind;
    click(q(`.ar-drawer[data-kind="${kind}"]`));
    await sleep(430);
  }
  await sleep(300);
  ok(visible($('ar-result')), '归档完成弹出结算');
  ok($('ar-result-title').textContent === '归档完成', '结算标题正确', $('ar-result-title').textContent);
  ok($('ar-result-stats').textContent.includes('8 / 8'), '统计显示 8 / 8', $('ar-result-stats').textContent);
  const save = JSON.parse(window.localStorage.getItem('vn_archive') || '{}');
  ok(save.night === 2, '保存下一夜为第 2 夜', JSON.stringify(save));
  const ach = JSON.parse(window.localStorage.getItem('vn_ach') || '{}');
  ok(!!ach.archive, '解锁「夜班归档员」成就', Object.keys(ach).join(','));

  // 读完今晚的信：关闭夜班并进入剧情
  const read = qa('#ar-result-actions .vn-btn').find((b) => b.textContent.includes('读今晚的信'));
  ok(!!read, '结算提供「读今晚的信」入口');
  click(read);
  await sleep(500);
  ok(!visible($('vn-archive')), '读信后离开夜班');
  ok(visible($('vn-dialog')), '读信后进入视觉小说');
  ok($('vn-chapter-label').textContent.includes('序章'), '进入第一段剧情', $('vn-chapter-label').textContent);

  click(q('[data-act="archive"]'));
  await sleep(400);
  ok($('ar-night').textContent.includes('02'), '重新打开进入第 02 夜', $('ar-night').textContent);

  // 灯油耗尽
  const kind2 = game().deck[0].kind;
  const wrong2 = KINDS.find((k) => k !== kind2);
  for (let i = 0; i < 3; i++) {
    click(q(`.ar-drawer[data-kind="${wrong2}"]`));
    await sleep(520);
  }
  ok(visible($('ar-result')), '灯油耗尽弹出结算');
  ok($('ar-result-title').textContent === '灯灭了', '失败标题正确', $('ar-result-title').textContent);
  ok(game().oil === 0, '灯油归零', game().oil);

  const leave = qa('#ar-result-actions .vn-btn').find((b) => b.textContent.includes('回到树洞'));
  click(leave);
  await sleep(200);
  ok(!visible($('vn-archive')), '失败后可以离开夜班');

  console.log('\nFAILED =', failed);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('测试异常:', e); process.exit(1); });
