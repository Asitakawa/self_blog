/* 3D 书架端到端测试：真实 Chrome + WebGL，验证渲染、悬停、点击、拖拽与释放 */
const puppeteer = require('puppeteer-core');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failed = 0;
function ok(cond, label, extra) {
  console.log((cond ? 'PASS ' : 'FAIL ') + label + (cond ? '' : '  << ' + (extra === undefined ? '' : extra)));
  if (!cond) failed++;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
      '--hide-scrollbars', '--window-size=1400,900',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 1 });

  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.goto(BASE + '/?scene=blogs', { waitUntil: 'load' });
  await page.waitForSelector('.vn-shelf3d canvas', { timeout: 20000 });
  await sleep(900);

  const stage = await page.evaluate(() => {
    const el = document.querySelector('.vn-shelf3d');
    const r = el.getBoundingClientRect();
    const s = window.GameScenes && window.GameScenes.shelfInstance();
    return {
      rect: { left: r.left, top: r.top, width: r.width, height: r.height },
      hasShelf: !!s,
      books: s ? s.books.length : 0,
      canvas: !!el.querySelector('canvas'),
      mode: document.querySelector('#scene-blogs-body').dataset.shelfMode,
    };
  });

  ok(stage.mode === '3d', '场景以 3D 模式渲染', stage.mode);
  ok(stage.canvas, 'canvas 已挂载');
  ok(stage.hasShelf, 'Shelf3D 实例存在');
  ok(stage.books === 2, '书本数量与文章数一致', stage.books);

  // 投影第一本书到屏幕坐标
  const book = await page.evaluate(() => {
    const s = window.GameScenes.shelfInstance();
    s.camera.updateMatrixWorld();
    const rect = s.renderer.domElement.getBoundingClientRect();
    const b = s.books[0];
    b.updateMatrixWorld();
    const p = b.position.clone();
    b.getWorldPosition(p);
    p.z += 0.26; // 书脊前脸：投影到几何中心会因视差偏到书的右边缘
    p.project(s.camera);
    return {
      title: b.userData.title,
      x: rect.left + (p.x * 0.5 + 0.5) * rect.width,
      y: rect.top + (-p.y * 0.5 + 0.5) * rect.height,
    };
  });
  ok(book.x > stage.rect.left && book.x < stage.rect.left + stage.rect.width, '书本投影落在画布内', JSON.stringify(book));

  // 悬停
  await page.mouse.move(book.x, book.y);
  await sleep(700);
  const tip = await page.evaluate(() => {
    const t = document.querySelector('.vn-shelf-tip');
    return { on: t.classList.contains('on'), text: t.textContent };
  });
  ok(tip.on, '悬停显示书脊提示', tip.text);
  ok(tip.text.includes(book.title), '提示内容为文章标题', tip.text);

  // 抬起动画
  await sleep(260);
  const lift = await page.evaluate(() => {
    const s = window.GameScenes.shelfInstance();
    return s.books[0].userData.lift;
  });
  ok(lift > 0.6, '悬停时书本抬起', lift.toFixed(2));

  await page.screenshot({ path: 'tmp_shelf_hover.png' });

  // 点击翻开
  await page.mouse.click(book.x, book.y);
  await sleep(800);
  const reader = await page.evaluate(() => {
    const active = document.querySelector('.vn-scene[data-scene="reader"]').classList.contains('active');
    return { active, text: document.querySelector('#scene-reader-body').textContent.slice(0, 80) };
  });
  ok(reader.active, '点击书脊打开阅读器');
  ok(reader.text.includes(book.title), '阅读器载入对应文章', reader.text);

  // 返回书架
  await page.click('[data-reader-back]');
  await page.waitForSelector('.vn-shelf3d canvas', { timeout: 15000 });
  await sleep(700);

  const rectAfter = await page.evaluate(() => {
    const r = document.querySelector('.vn-shelf3d').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.move(rectAfter.x, rectAfter.y);
  await page.mouse.down();
  await page.mouse.move(rectAfter.x + 140, rectAfter.y - 20, { steps: 12 });
  await page.mouse.up();
  await sleep(300);
  const azimuth = await page.evaluate(() => window.GameScenes.shelfInstance().azimuth);
  ok(azimuth > 0.1, '拖拽可旋转视角', azimuth.toFixed(3));

  // 关闭场景应释放 WebGL 资源
  await page.click('.vn-scene.active [data-scene-close]');
  await sleep(700);
  const disposed = await page.evaluate(() => ({
    canvases: document.querySelectorAll('.vn-shelf3d canvas').length,
    instance: !!window.GameScenes.shelfInstance(),
  }));
  ok(disposed.canvases === 0 && !disposed.instance, '关闭场景后释放 3D 资源', JSON.stringify(disposed));

  ok(errors.length === 0, '页面无 JS 报错', errors.join(' | '));

  await browser.close();
  console.log('\nFAILED =', failed);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('测试异常:', e); process.exit(1); });
