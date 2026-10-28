/* 游戏内场景交互测试：用真实页面 + 真实 API 数据，在 jsdom 中跑完整链路 */
const { JSDOM } = require('jsdom');
const fs = require('fs');

const sleep = ms => new Promise(r => setTimeout(r, ms));
let failed = 0;
function ok(cond, label, extra) {
  console.log((cond ? 'PASS ' : 'FAIL ') + label + (cond ? '' : '  << ' + (extra || '')));
  if (!cond) failed++;
}

(async () => {
  const base = 'http://127.0.0.1:8000';
  const [story, content, guestbook] = await Promise.all([
    fetch(base + '/api/story/').then(r => r.json()),
    fetch(base + '/api/content/').then(r => r.json()),
    fetch(base + '/api/guestbook/').then(r => r.json()),
  ]);
  const firstSlug = content.posts[0] && content.posts[0].slug;
  const postDetail = firstSlug ? await fetch(base + '/api/post/' + firstSlug + '/').then(r => r.json()) : null;

  let html = await fetch(base + '/').then(r => r.text());
  html = html.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');

  const dom = new JSDOM(html, { runScripts: 'outside-only', url: base + '/' });
  const { window } = dom;
  const doc = window.document;

  // 模拟网络
  let posted = null;
  let board = guestbook.messages.slice();
  window.fetch = (url, opts) => {
    url = String(url);
    const method = (opts && opts.method) || 'GET';
    if (url.includes('/api/guestbook/post/') && method === 'POST') {
      posted = JSON.parse(opts.body);
      board = [{ nickname: posted.nickname, content: posted.content, time: '10-28 14:00' }].concat(board);
      return Promise.resolve({ json: () => Promise.resolve({ ok: true, nickname: posted.nickname, reusing: false }) });
    }
    if (url.includes('/api/guestbook/')) return Promise.resolve({ json: () => Promise.resolve({ messages: board }) });
    if (url.includes('/api/story/')) return Promise.resolve({ json: () => Promise.resolve(story) });
    if (url.includes('/api/content/')) return Promise.resolve({ json: () => Promise.resolve(content) });
    if (url.includes('/api/post/')) return Promise.resolve({ json: () => Promise.resolve(postDetail) });
    return Promise.reject(new Error('unexpected fetch ' + url));
  };

  window.localStorage.setItem('vn_speed', '1');
  window.eval(fs.readFileSync('static/js/game/engine.js', 'utf8'));
  window.eval(fs.readFileSync('static/js/game/scenes.js', 'utf8'));
  await sleep(200);

  const $ = id => doc.getElementById(id);
  const q = sel => doc.querySelector(sel);
  const qa = sel => [...doc.querySelectorAll(sel)];
  const visible = el => !!el && !el.classList.contains('vn-hidden');
  const click = el => el && el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

  const titleVisible = visible($('vn-title'));
  ok(titleVisible, '标题画面加载');

  // 开始游戏
  click(q('#vn-title [data-act="start"]'));
  await sleep(300);
  ok(visible($('vn-dialog')), '进入剧情对话框');
  ok(!$('vn-hud').classList.contains('vn-hidden'), 'HUD 显示');

  // 推进到序章分支（7 句，每句两击）
  for (let i = 0; i < 20; i++) { click($('vn-dialog')); await sleep(45); }
  await sleep(200);
  const choices = qa('.vn-choice');
  ok(choices.length === 4, '序章出现 4 个选项', choices.length);

  // 选择「看看他长什么样」→ 打开档案场景
  const resumeChoice = choices.find(b => b.textContent.includes('看看他长什么样'));
  click(resumeChoice);
  await sleep(500);
  ok(visible($('vn-scenes')), '档案场景打开');
  ok(q('.vn-scene[data-scene="resume"]').classList.contains('active'), '档案场景处于激活态');
  const resumeHtml = $('scene-resume-body').innerHTML;
  ok(resumeHtml.includes(content.profile.name), '档案渲染出姓名', resumeHtml.slice(0, 80));
  ok(resumeHtml.includes('教育经历') && resumeHtml.includes('技能'), '档案含教育与技能区块');
  ok(qa('#scene-resume-body .vn-spark').length === 1, '档案室藏有 1 块碎片');

  // 收集碎片
  click(q('#scene-resume-body .vn-spark'));
  await sleep(300);
  const frags = JSON.parse(window.localStorage.getItem('vn_frags') || '[]');
  ok(frags.includes('page'), '碎片已收集并写入本地', JSON.stringify(frags));
  ok($('vn-frag-count').textContent === '1', 'HUD 碎片计数更新');

  // 关闭场景 → 回到选项
  click(q('.vn-scene.active [data-scene-close]'));
  await sleep(200);
  ok(!visible($('vn-scenes')), '场景已关闭');
  ok(qa('.vn-choice').length > 0, '关闭后选项仍在（可继续选择）');

  // 走「继续」推进到第一章
  const cont = qa('.vn-choice').find(b => b.textContent.includes('走进亮着台灯的房间'));
  click(cont);
  await sleep(400);
  ok($('vn-chapter-label').textContent.includes('第一章'), '进入第一章', $('vn-chapter-label').textContent);

  // 存档面板与关闭按钮
  click(q('[data-act="save"]'));
  await sleep(200);
  const slots = qa('#vn-save-body .vn-slot');
  ok(slots.length === 2, '存档面板有两个槽位', slots.length);
  click(slots[1]);
  await sleep(200);
  ok(!!window.localStorage.getItem('vn_slot'), '手动存档已写入');
  click(q('#vn-save-panel .vn-close'));
  await sleep(150);
  ok(!visible($('vn-save-panel')), '存档面板关闭按钮生效');

  // 读档
  click(q('[data-act="load"]'));
  await sleep(200);
  const loadSlots = qa('#vn-save-body .vn-slot');
  ok(loadSlots.length === 2, '读档面板两个槽位');
  click(loadSlots[0]);
  await sleep(700);
  ok(visible($('vn-dialog')) && $('vn-chapter-label').textContent.includes('第一章'), '读档回到第一章');

  // 推进到第一章分支，进入第二章
  for (let i = 0; i < 20; i++) { click($('vn-dialog')); await sleep(45); }
  await sleep(200);
  const ch1Continue = qa('.vn-choice').find(b => b.textContent.includes('先往下走'));
  ok(!!ch1Continue, '第一章分支含继续选项');
  click(ch1Continue);
  await sleep(400);
  ok($('vn-chapter-label').textContent.includes('第二章'), '进入第二章', $('vn-chapter-label').textContent);

  // 第二章分支：继续听下去 → 动态最新文章节点
  for (let i = 0; i < 14; i++) { click($('vn-dialog')); await sleep(45); }
  await sleep(200);
  const keepGoing = qa('.vn-choice').find(b => b.textContent.includes('继续听下去'));
  ok(!!keepGoing, '第二章分支含继续选项');
  click(keepGoing);
  await sleep(300);
  for (let i = 0; i < 6; i++) { click($('vn-dialog')); await sleep(45); }
  await sleep(300);
  const dyn = qa('.vn-choice').find(b => b.textContent.includes(content.posts[0].title));
  ok(!!dyn, '动态文章选项由最新文章注入');
  if (dyn) {
    click(dyn);
    await sleep(500);
    ok(q('.vn-scene[data-scene="reader"]').classList.contains('active'), '动态文章在游戏内阅读器打开');
    click(q('.vn-scene.active [data-scene-close]'));
    await sleep(200);
  }

  // 顶栏菜单打开书架
  click(q('[data-scene="blogs"]'));
  await sleep(500);
  ok(q('.vn-scene[data-scene="blogs"]').classList.contains('active'), '书架场景打开');
  ok($('scene-blogs-body').dataset.shelfMode === 'list', '无 WebGL 时自动回退列表视图');
  ok(qa('#scene-blogs-body .vn-book').length === content.posts.length, '书籍数量与文章数一致');
  ok(qa('#scene-blogs-body .vn-spark').length === 1, '书架藏有碎片');

  // 读一本书
  click(q('#scene-blogs-body .vn-book'));
  await sleep(500);
  ok(q('.vn-scene[data-scene="reader"]').classList.contains('active'), '阅读器打开');
  ok($('scene-reader-body').innerHTML.includes(postDetail.title), '阅读器显示文章标题');
  ok($('scene-reader-body').innerHTML.includes('vn-prose-body'), '阅读器渲染正文 HTML');
  const readList = JSON.parse(window.localStorage.getItem('vn_read') || '[]');
  ok(readList.includes(firstSlug), '阅读记录已保存');

  // 返回书架
  click(q('[data-reader-back]'));
  await sleep(300);
  ok(q('.vn-scene[data-scene="blogs"]').classList.contains('active'), '返回书架');

  // 打开留言板并留言
  click(q('[data-scene="board"]'));
  await sleep(600);
  ok(q('.vn-scene[data-scene="board"]').classList.contains('active'), '留言板打开');
  ok(!!$('vn-nick-input'), '未绑定昵称时显示输入框');
  $('vn-nick-input').value = '测试旅人';
  $('vn-msg-input').value = '这个树洞不错。';
  click($('vn-msg-send'));
  await sleep(400);
  ok(posted && posted.nickname === '测试旅人', '留言已提交', JSON.stringify(posted));
  ok(window.localStorage.getItem('vn_nick'), '昵称已绑定到本地');
  ok($('scene-board-body').innerHTML.includes('这个树洞不错。'), '留言出现在列表中');
  ok(!!q('#scene-board-body .vn-spark'), '留言板藏有碎片');
  click(q('#scene-board-body .vn-spark'));
  await sleep(200);
  const fragsNow = JSON.parse(window.localStorage.getItem('vn_frags') || '[]');
  ok(fragsNow.includes('trace'), '留言板碎片已收集');

  // 相册与关于
  click(q('[data-scene="gallery"]'));
  await sleep(500);
  ok(qa('#scene-gallery-body .vn-photo').length === content.exhibitions.length, '相册照片数量正确');
  ok(qa('#scene-gallery-body .vn-spark').length === 1, '相册藏有碎片');

  click(q('[data-scene="about"]'));
  await sleep(500);
  ok($('scene-about-body').innerHTML.includes('vn-letter'), '关于页渲染为信件');
  ok(qa('#scene-about-body .vn-spark').length === 1, '关于页藏有碎片');

  // 收集剩下的碎片，触发真结局
  click(q('#scene-about-body .vn-spark'));
  await sleep(200);
  click(q('[data-scene="blogs"]'));
  await sleep(400);
  click(q('#scene-blogs-body .vn-spark'));
  await sleep(200);
  click(q('[data-scene="gallery"]'));
  await sleep(400);
  click(q('#scene-gallery-body .vn-spark'));
  await sleep(1200);
  ok(!$('vn-ending').classList.contains('vn-hidden'), '集齐碎片触发真结局');
  const allFrags = JSON.parse(window.localStorage.getItem('vn_frags') || '[]');
  ok(allFrags.length === content.fragments.length, '碎片全部收集', allFrags.length);

  // 成就面板
  click(q('#vn-ending [data-act]') || q('#vn-ending-actions .vn-btn'));
  await sleep(500);
  ok(q('.vn-scene[data-scene="achievements"]').classList.contains('active'), '从结局打开探索记录');
  const achHtml = $('scene-achievements-body').innerHTML;
  ok(achHtml.includes('树洞守护者') && achHtml.includes('vn-ach on'), '成就列表渲染且已有解锁项');
  const achCount = Object.keys(JSON.parse(window.localStorage.getItem('vn_ach') || '{}')).length;
  ok(achCount >= 6, '已解锁成就数合理', achCount);

  console.log('\nFAILED =', failed);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('测试异常:', e); process.exit(1); });
