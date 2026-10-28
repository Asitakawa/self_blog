/* 3D 夜班桌面端到端测试：真实 Chrome + WebGL
 * 覆盖：渲染、抽屉悬停、点击归档、归错扣灯油、拖拽归档、键盘归档、关闭释放 */
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
      '--hide-scrollbars', '--window-size=1440,900',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.goto(BASE + '/', { waitUntil: 'load' });
  await sleep(600);
  await page.click('#vn-title [data-act="archive"]');
  await page.waitForSelector('#ar-stage canvas', { timeout: 20000 });
  await sleep(1200);

  const boot = await page.evaluate(() => {
    const root = document.getElementById('vn-archive');
    const stage = document.getElementById('ar-stage');
    const canvas = stage.querySelector('canvas');
    const d = window.GameArchive.deskInstance();
    const r = canvas.getBoundingClientRect();
    return {
      hasDesk: !!d,
      mode3d: root.classList.contains('ar-3d'),
      canvas: !!canvas,
      size: [Math.round(r.width), Math.round(r.height)],
      stage: [stage.clientWidth, stage.clientHeight],
      deck: window.GameArchive.state.deck.length,
      drawers: d ? d.drawers.length : 0,
      texLen: d ? d.cardCanvas.toDataURL('image/png').length : 0,
      lights: d ? d.oilNodes.filter((n) => n.lit).length : 0,
    };
  });

  ok(boot.hasDesk, '3D 桌面实例创建成功');
  ok(boot.mode3d, '夜班界面进入 3D 模式');
  ok(boot.canvas && boot.size[0] > 800, 'WebGL 画布铺满舞台', JSON.stringify(boot.size));
  ok(boot.size[0] === boot.stage[0] && boot.size[1] === boot.stage[1], '画布尺寸与容器一致');
  ok(boot.drawers === 4, '四只抽屉建模完成', boot.drawers);
  ok(boot.deck === 8, '发牌 8 张', boot.deck);
  ok(boot.texLen > 20000, '卡片贴图已绘制内容', boot.texLen);
  ok(boot.lights === 3, '三盏灯油点亮', boot.lights);

  // 悬停抽屉
  const studyPt = await page.evaluate(() => window.GameArchive.deskInstance().drawerScreen('study'));
  await page.mouse.move(studyPt.x, studyPt.y);
  await sleep(400);
  const hover = await page.evaluate(() => {
    const d = window.GameArchive.deskInstance();
    const drawer = d.drawers.find((x) => x.kind === 'study');
    return {
      hot: d.hot,
      emissive: +drawer.label.material.emissive.r.toFixed(2),
      z: +drawer.group.position.z.toFixed(2),
      base: +drawer.baseZ.toFixed(2),
    };
  });
  ok(hover.hot === 'study', '悬停命中「学业」抽屉', hover.hot);
  ok(hover.emissive > 0, '悬停时索引卡发光');
  ok(hover.z > hover.base + 0.02, '悬停时抽屉被拉开', hover.z + '/' + hover.base);

  // 点击正确抽屉
  const first = await page.evaluate(() => {
    const g = window.GameArchive;
    const kind = g.state.deck[g.state.index].kind;
    return { kind, pt: g.deskInstance().drawerScreen(kind) };
  });
  await page.mouse.click(first.pt.x, first.pt.y);
  await sleep(900);
  const afterRight = await page.evaluate(() => {
    const g = window.GameArchive;
    const d = g.deskInstance();
    const counts = {};
    d.drawers.forEach((x) => { counts[x.kind] = x.count; });
    return {
      index: g.state.index, correct: g.state.correct, oil: g.state.oil,
      counts, stampHidden: !d.stamp.visible,
    };
  });
  ok(afterRight.index === 1, '归对后进入下一张', afterRight.index);
  ok(afterRight.correct === 1 && afterRight.oil === 3, '归对不扣灯油');
  ok(afterRight.counts[first.kind] === 1, '抽屉计数 +1', JSON.stringify(afterRight.counts));
  ok(afterRight.stampHidden, '印章在动画结束后收起');

  // 点击错误抽屉
  const wrong = await page.evaluate(() => {
    const g = window.GameArchive;
    const kind = g.state.deck[g.state.index].kind;
    const bad = ['study', 'work', 'writing', 'life'].find((k) => k !== kind);
    return { kind, bad, pt: g.deskInstance().drawerScreen(bad) };
  });
  await page.mouse.click(wrong.pt.x, wrong.pt.y);
  await sleep(800);
  const afterWrong = await page.evaluate(() => {
    const g = window.GameArchive;
    const d = g.deskInstance();
    return {
      oil: g.state.oil, wrong: g.state.wrong, index: g.state.index,
      lit: d.oilNodes.filter((n) => n.lit).length,
      index2: g.state.index,
    };
  });
  ok(afterWrong.oil === 2 && afterWrong.wrong === 1, '归错扣一格灯油', JSON.stringify(afterWrong));
  ok(afterWrong.lit === 2, '3D 灯盏熄灭一盏', afterWrong.lit);
  ok(afterWrong.index2 === 1, '归错不推进卡片');

  // 拖拽归档
  const dragCfg = await page.evaluate(() => {
    const g = window.GameArchive;
    const d = g.deskInstance();
    return { kind: g.state.deck[g.state.index].kind, from: d.cardScreen(), to: d.drawerScreen(g.state.deck[g.state.index].kind) };
  });
  await page.mouse.move(dragCfg.from.x, dragCfg.from.y);
  await page.mouse.down();
  for (let i = 1; i <= 14; i++) {
    await page.mouse.move(
      dragCfg.from.x + (dragCfg.to.x - dragCfg.from.x) * i / 14,
      dragCfg.from.y + (dragCfg.to.y - dragCfg.from.y) * i / 14
    );
    await sleep(25);
  }
  const dragging = await page.evaluate(() => {
    const d = window.GameArchive.deskInstance();
    return { hot: d.hot, y: +d.cardGroup.position.y.toFixed(3), z: +d.cardGroup.position.z.toFixed(2) };
  });
  ok(dragging.hot === dragCfg.kind, '拖拽经过抽屉时高亮', dragging.hot);
  ok(dragging.y > 0.25, '拖拽时卡片被抬起', dragging.y);
  await page.mouse.up();
  await sleep(900);
  const afterDrag = await page.evaluate(() => ({ index: window.GameArchive.state.index }));
  ok(afterDrag.index === 2, '拖进抽屉完成归档', afterDrag.index);

  // 键盘归档
  const keyCfg = await page.evaluate(() => {
    const g = window.GameArchive;
    const kind = g.state.deck[g.state.index].kind;
    return { digit: String(['study', 'work', 'writing', 'life'].indexOf(kind) + 1), kind };
  });
  await page.keyboard.press(keyCfg.digit);
  await sleep(900);
  const afterKey = await page.evaluate(() => ({ index: window.GameArchive.state.index }));
  ok(afterKey.index === 3, '按 1–4 也能归档', afterKey.index + ' key=' + keyCfg.digit);

  // 关闭释放
  await page.evaluate(() => window.GameArchive.close());
  await sleep(400);
  const closed = await page.evaluate(() => ({
    canvas: !!document.querySelector('#ar-stage canvas'),
    desk: !!window.GameArchive.deskInstance(),
    mode: document.getElementById('vn-archive').classList.contains('ar-3d'),
  }));
  ok(!closed.canvas && !closed.desk && !closed.mode, '关闭后释放 WebGL 与画布', JSON.stringify(closed));

  // 重新打开
  await page.click('#vn-title [data-act="archive"]');
  await page.waitForSelector('#ar-stage canvas', { timeout: 20000 });
  await sleep(900);
  const reopened = await page.evaluate(() => {
    const d = window.GameArchive.deskInstance();
    return { desk: !!d, drawers: d ? d.drawers.length : 0, night: document.getElementById('ar-night').textContent };
  });
  ok(reopened.desk && reopened.drawers === 4, '重新打开时重建 3D 桌面');

  ok(errors.length === 0, '没有 JS 报错', errors.slice(0, 3).join(' | '));

  console.log('\nEXIT_FAILED=' + failed);
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
