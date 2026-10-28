/* 视觉小说引擎 jsdom 行为测试（临时脚本） */
const { JSDOM } = require('jsdom');
const fs = require('fs');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const api = await fetch('http://127.0.0.1:8000/api/story/').then(r => r.json());
  let html = fs.readFileSync('game/templates/game/play.html', 'utf8');
  html = html.replace(/\{%[^%]*?%\}/g, ''); // 去掉 Django 模板标签

  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'http://127.0.0.1:8000/' });
  const { window } = dom;
  const doc = window.document;
  window.fetch = () => Promise.resolve({ json: () => Promise.resolve(api) });

  // 加速打字机
  window.localStorage.setItem('vn_speed', '1');

  let failures = 0;
  const ok = (cond, name) => {
    console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name);
    if (!cond) failures++;
  };

  window.eval(fs.readFileSync('static/js/game/engine.js', 'utf8'));
  await sleep(150);

  const $ = id => doc.getElementById(id);
  const visible = el => el && !el.classList.contains('vn-hidden');
  const click = el => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  const clickMenu = act => click(doc.querySelector(`[data-act="${act}"]`));

  // 1. 启动
  ok(!visible($('vn-loading')), '加载层隐藏（剧情数据就绪）');
  ok(visible($('vn-title')), '标题画面显示');

  // 2. 开始游戏
  click(doc.querySelector('#vn-title [data-act="start"]'));
  await sleep(400);
  ok(visible($('vn-dialog')), '对话框出现');
  ok($('vn-chapter-label').textContent.includes('序章'), '进入序章');
  ok($('vn-text').textContent.length > 0, '台词开始打字输出');

  // 3. 连点推进到分支（序章 7 句，每句两击）
  for (let i = 0; i < 16; i++) { await sleep(50); click($('vn-dialog')); await sleep(80); }
  await sleep(300);
  ok(visible($('vn-choices')), '分支选项弹出');
  const choiceTexts = [...doc.querySelectorAll('.vn-choice')].map(b => b.textContent);
  ok(choiceTexts.length === 3, `选项数量 = 3（实际 ${choiceTexts.length}）`);

  // 4. 选择进入第一章
  const toAbout = [...doc.querySelectorAll('.vn-choice')].find(b => b.textContent.includes('先看看'));
  click(toAbout);
  await sleep(500);
  ok($('vn-chapter-label').textContent.includes('第一章'), '分支跳转到第一章');
  // 第一章第一句是旁白：无头像无名牌
  ok(!visible($('vn-avatar')), '旁白不显示头像');
  ok(!visible($('vn-name-plate')), '旁白不显示名牌');
  // 推进两句（跳过打字 + 下一句）到小栗台词
  for (let i = 0; i < 3; i++) { click($('vn-dialog')); await sleep(250); }
  ok(visible($('vn-avatar')) && !!$('vn-avatar-img').src.match(/guide_avatar/), '小栗头像显示');
  ok(visible($('vn-name-plate')) && $('vn-name').textContent === '小栗', '名牌显示小栗');

  // 5. 推进第一章到分支 → 继续逛 → 第二章
  for (let i = 0; i < 12; i++) { await sleep(50); click($('vn-dialog')); await sleep(80); }
  await sleep(300);
  const cont = [...doc.querySelectorAll('.vn-choice')].find(b => b.textContent.includes('继续往前逛'));
  ok(!!cont, '第一章分支包含「继续往前逛」');
  click(cont);
  await sleep(400);
  ok($('vn-chapter-label').textContent.includes('第二章'), '进入第二章');

  // 6. 动态博客节点
  for (let i = 0; i < 8; i++) { await sleep(50); click($('vn-dialog')); await sleep(80); }
  await sleep(300);
  const dynChoices = [...doc.querySelectorAll('.vn-choice')].map(b => b.textContent);
  ok(dynChoices.length === api.latest_posts.length + 1, `动态博客选项 = 文章数+继续（${dynChoices.length}）`);
  ok(dynChoices.some(t => t.includes('记录一些日常')), '选项包含真实文章标题');

  // 7. 关掉动态选项，推进到结尾分支：「从头再玩一遍」应跳回序章
  const skipBlogs = [...doc.querySelectorAll('.vn-choice')].find(b => b.textContent.includes('先不看了'));
  if (skipBlogs) { click(skipBlogs); await sleep(250); }
  for (let i = 0; i < 6; i++) { click($('vn-dialog')); await sleep(200); }
  const restart = [...doc.querySelectorAll('.vn-choice')].find(b => b.textContent.includes('从头再玩一遍'));
  ok(!!restart, '结尾分支包含「从头再玩一遍」');
  click(restart);
  await sleep(1500);
  ok($('vn-chapter-label').textContent.includes('序章'), '章节跳转回序章');

  // 8. 存档与自动存档
  const auto = JSON.parse(window.localStorage.getItem('vn_autosave'));
  ok(!!auto && auto.c, '自动存档已写入');
  clickMenu('save'); await sleep(50);
  ok(visible($('vn-save-panel')), '存档面板打开');
  // 写入手动存档
  const slots = [...doc.querySelectorAll('.vn-slot')];
  click(slots[1]);
  await sleep(100);
  const slot = JSON.parse(window.localStorage.getItem('vn_slot'));
  if (!slot || slot.c !== auto.c) console.log('  DEBUG auto=', window.localStorage.getItem('vn_autosave'), 'slot=', window.localStorage.getItem('vn_slot'));
  ok(!!slot && slot.c === auto.c, '手动存档写入成功');

  // 9. 履历与章节面板
  clickMenu('log'); await sleep(50);
  ok(doc.querySelectorAll('.vn-log-item').length > 5, '对话履历有记录');
  clickMenu('close');
  clickMenu('chapters'); await sleep(50);
  const chapterBtns = [...doc.querySelectorAll('.vn-chapter-item')];
  ok(chapterBtns.length === 3 && chapterBtns.every(b => !b.disabled), '三章全部解锁');
  clickMenu('close');

  // 10. 回到标题，读档恢复
  clickMenu('title'); await sleep(100);
  ok(visible($('vn-title')), '返回标题画面');
  ok(!$('vn-btn-continue').hidden, '「继续游戏」按钮可见');
  click($('vn-btn-continue'));
  await sleep(1500);
  ok(visible($('vn-dialog')) && $('vn-chapter-label').textContent.includes('序章'), '读档恢复到最新进度（序章）');

  console.log('EXIT_FAILED=' + failures);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e.message); process.exit(2); });
