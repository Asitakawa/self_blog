/* ============================================================
 * 树洞奇缘 · 3D 夜班桌面
 * 一张真实的木桌：台灯、纸卡、四只抽屉、一盏三格的灯油。
 * 卡片可以拖进抽屉，盖章落纸，归错会抖一下、烧掉一格灯油。
 * 由 archive.js 动态 import，WebGL 不可用时回退 DOM 版本。
 * ============================================================ */
import * as THREE from '../vendor/three.module.js';

const DESK_W = 9.4;
const DESK_D = 4.8;

const CARD_W = 3.3;
const CARD_H = 2.2;
const CARD_Z = -0.12;
const CARD_TILT = 0.13;                     // 纸面微微翘起，前缘仍贴在桌上
const CARD_Y = 0.085 + (CARD_H / 2) * Math.sin(CARD_TILT);

const TRAY_Z = 2.02;
const TRAY_W = 1.36;
const TRAY_H = 0.26;
const TRAY_D = 0.84;
const TRAY_X = [-2.29, -0.765, 0.765, 2.29];

const SERIF = '"Source Han Serif SC","Songti SC","SimSun",Georgia,serif';
const SANS = '"PingFang SC","Microsoft YaHei","Hiragino Sans GB",sans-serif';

const DEFAULT_DRAWERS = [
  { key: 'study', label: '学业', note: '学校、专业、校园里的事' },
  { key: 'work', label: '工作', note: '实习、项目、做出来的东西' },
  { key: 'writing', label: '写作', note: '博客与深夜的笔记' },
  { key: 'life', label: '生活', note: '展览、兴趣、日常' },
];

/* ---------------- 贴图 ---------------- */

function woodTexture() {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 320;
  const x = c.getContext('2d');

  x.fillStyle = '#c3a984';
  x.fillRect(0, 0, 640, 320);

  const base = x.createLinearGradient(0, 0, 0, 320);
  base.addColorStop(0, 'rgba(255, 246, 230, .28)');
  base.addColorStop(0.5, 'rgba(0, 0, 0, .04)');
  base.addColorStop(1, 'rgba(80, 50, 24, .16)');
  x.fillStyle = base;
  x.fillRect(0, 0, 640, 320);

  for (let i = 0; i < 90; i++) {
    const y = Math.random() * 320;
    const amp = 1 + Math.random() * 3;
    x.beginPath();
    x.strokeStyle = `rgba(${104 + Math.random() * 34 | 0},${82 + Math.random() * 26 | 0},56,${0.04 + Math.random() * 0.08})`;
    x.lineWidth = 0.5 + Math.random() * 1.7;
    x.moveTo(0, y);
    for (let px = 0; px <= 640; px += 20) {
      x.lineTo(px, y + Math.sin(px * 0.012 + i * 1.7) * amp);
    }
    x.stroke();
  }

  // 木节
  for (let i = 0; i < 3; i++) {
    const cx = 90 + Math.random() * 460;
    const cy = 40 + Math.random() * 240;
    for (let r = 2; r < 16; r += 2) {
      x.beginPath();
      x.strokeStyle = `rgba(96, 68, 38, ${0.1 - r * 0.004})`;
      x.lineWidth = 1;
      x.ellipse(cx, cy, r * 1.7, r, 0, 0, Math.PI * 2);
      x.stroke();
    }
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 1);
  t.anisotropy = 4;
  return t;
}

function paperGrain(x, w, h) {
  for (let i = 0; i < 2400; i++) {
    const a = Math.random() * 0.05;
    x.fillStyle = Math.random() > 0.5 ? `rgba(90,72,48,${a})` : `rgba(255,252,240,${a})`;
    x.fillRect(Math.random() * w, Math.random() * h, 1, 1);
  }
}

function wrapLines(ctx, text, maxWidth, maxLines) {
  const chars = Array.from(String(text || '').replace(/\s+/g, ' ').trim());
  const lines = [];
  let line = '';
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch;
      if (lines.length === maxLines) {
        lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '…';
        return lines;
      }
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** 卡片正面：纸张、栏线、来源、标题、正文。 */
function paintCard(canvas, card) {
  const W = canvas.width;
  const H = canvas.height;
  const x = canvas.getContext('2d');
  x.clearRect(0, 0, W, H);

  x.fillStyle = '#ffffff';
  x.fillRect(0, 0, W, H);
  paperGrain(x, W, H);

  const shade = x.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, 'rgba(255, 250, 236, .55)');
  shade.addColorStop(0.45, 'rgba(255, 250, 236, 0)');
  shade.addColorStop(1, 'rgba(96, 76, 50, .16)');
  x.fillStyle = shade;
  x.fillRect(0, 0, W, H);

  // 右侧栏线
  x.strokeStyle = 'rgba(37, 99, 235, .18)';
  x.lineWidth = 2;
  x.beginPath();
  x.moveTo(W - 74, 0);
  x.lineTo(W - 74, H);
  x.stroke();

  // 横线
  x.strokeStyle = 'rgba(30, 64, 175, .09)';
  x.lineWidth = 1;
  for (let y = 210; y < H - 54; y += 52) {
    x.beginPath();
    x.moveTo(64, y);
    x.lineTo(W - 96, y);
    x.stroke();
  }

  // 页眉
  x.fillStyle = '#64748b';
  x.font = `500 22px ${SANS}`;
  x.textAlign = 'left';
  x.textBaseline = 'alphabetic';
  x.fillText(String(card.source || '档案'), 64, 80);

  if (card.date) {
    x.textAlign = 'right';
    x.fillText(String(card.date), W - 96, 80);
    x.textAlign = 'left';
  }

  x.strokeStyle = 'rgba(15, 23, 42, .22)';
  x.lineWidth = 1.4;
  x.beginPath();
  x.moveTo(64, 100);
  x.lineTo(W - 96, 100);
  x.stroke();

  // 标题
  x.fillStyle = '#0f172a';
  x.font = `600 56px ${SERIF}`;
  const titleLines = wrapLines(x, card.title, W - 168, 2);
  let ty = 166;
  titleLines.forEach((ln) => {
    x.fillText(ln, 62, ty);
    ty += 64;
  });

  // 正文
  x.fillStyle = '#334155';
  x.font = `400 35px ${SANS}`;
  const bodyLines = wrapLines(x, card.text, W - 168, 6);
  let by = ty + 40;
  bodyLines.forEach((ln) => {
    x.fillText(ln, 62, by);
    by += 52;
  });

  // 底部提示
  x.fillStyle = 'rgba(100, 116, 139, .9)';
  x.font = `400 22px ${SANS}`;
  x.fillText('拖进抽屉 · 或按 1 – 4', 64, H - 32);

  // 淡淡的待归档印记
  x.save();
  x.translate(W - 150, H - 96);
  x.rotate(-0.12);
  x.strokeStyle = 'rgba(37, 99, 235, .18)';
  x.lineWidth = 3;
  x.strokeRect(-56, -34, 112, 68);
  x.fillStyle = 'rgba(37, 99, 235, .16)';
  x.font = `600 30px ${SERIF}`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText('待归档', 0, 0);
  x.restore();

  // 边缘压暗，像在灯下放了很久
  x.strokeStyle = 'rgba(15, 23, 42, .2)';
  x.lineWidth = 6;
  x.strokeRect(3, 3, W - 6, H - 6);
}

/** 抽屉上的索引卡。 */
function paintDrawer(canvas, def, count) {
  const W = canvas.width;
  const H = canvas.height;
  const x = canvas.getContext('2d');
  x.clearRect(0, 0, W, H);

  x.fillStyle = '#ffffff';
  x.fillRect(0, 0, W, H);
  paperGrain(x, W, H);

  x.fillStyle = 'rgba(37, 99, 235, .12)';
  x.fillRect(0, 0, W, 5);

  x.fillStyle = 'rgba(100, 116, 139, .8)';
  x.font = `500 20px ${SANS}`;
  x.textAlign = 'left';
  x.fillText(def.no, 26, 40);

  x.fillStyle = '#0f172a';
  x.font = `600 62px ${SERIF}`;
  x.fillText(def.label, 26, 118);

  x.fillStyle = 'rgba(100, 116, 139, .9)';
  x.font = `400 20px ${SANS}`;
  const note = wrapLines(x, def.note, W - 52, 1)[0] || '';
  x.fillText(note, 26, 154);

  x.textAlign = 'right';
  x.fillStyle = 'rgba(30, 64, 175, .9)';
  x.font = `600 26px ${SERIF}`;
  x.fillText(String(count), W - 26, H - 22);

  x.strokeStyle = 'rgba(15, 23, 42, .14)';
  x.lineWidth = 2;
  x.strokeRect(1, 1, W - 2, H - 2);
}

/** 印章图案：归档 / 退回。 */
function sealTexture(text, color) {
  const S = 320;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d');
  x.clearRect(0, 0, S, S);
  x.translate(S / 2, S / 2);

  x.strokeStyle = color;
  x.lineWidth = 7;
  x.strokeRect(-124, -78, 248, 156);
  x.lineWidth = 2;
  x.strokeRect(-110, -64, 220, 128);

  x.fillStyle = color;
  x.font = `600 66px ${SERIF}`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(text, 0, 2);

  // 做一点油墨不均
  x.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 220; i++) {
    x.beginPath();
    x.arc((Math.random() - 0.5) * 250, (Math.random() - 0.5) * 160, Math.random() * 2.4, 0, Math.PI * 2);
    x.fill();
  }
  x.globalCompositeOperation = 'source-over';

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------------- 桌面本体 ---------------- */

export class Desk3D {
  constructor(container, options = {}) {
    this.container = container;
    this.ambient = !!options.ambient;
    this.drawerDefs = (options.drawers && options.drawers.length ? options.drawers : DEFAULT_DRAWERS)
      .map((d, i) => Object.assign({ no: '0' + (i + 1) }, d));
    this.onFile = options.onFile || function () {};

    this.clock = new THREE.Clock();
    this.jobs = [];
    this.drawers = [];
    this.oilNodes = [];
    this.pointer = new THREE.Vector2(-2, -2);
    this.parallax = { x: 0, y: 0 };
    this.dragging = null;
    this.hot = null;
    this.card = null;
    this.alive = true;
    this.stampBusy = false;
    this.cardToken = 0;

    this._initRenderer();
    this._initScene();
    this._buildRoom();
    this._buildDesk();
    this._buildLamp();
    if (!this.ambient) {
      this._buildTrays();
      this._buildCard();
      this._buildStamp();
      this._buildOil();
      this._bind();
    } else {
      this._buildProps();
    }
    this._buildDust();

    this.resizeObserver = new ResizeObserver(() => this._resize());
    this.resizeObserver.observe(container);
    this._resize();
    this._tick();
  }

  /* ---------- 基础 ---------- */

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.78;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const canvas = this.renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    this.container.appendChild(canvas);
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdde9f8);
    this.scene.fog = new THREE.Fog(0xdde9f8, 9.5, 18);

    this.camera = new THREE.PerspectiveCamera(41, 1, 0.1, 60);
    this.camera.position.set(0, 3.95, 5.7);
    this.camera.lookAt(0, 0.05, 0.18);

    this.raycaster = new THREE.Raycaster();
    this.deskPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.1);
    this.tmpVec = new THREE.Vector3();
  }

  _buildRoom() {
    const s = this.scene;

    s.add(new THREE.AmbientLight(0xd7e4f7, 0.5));
    s.add(new THREE.HemisphereLight(0xffffff, 0xa9c1e0, 0.55));

    const key = new THREE.DirectionalLight(0xfff3e4, 1.0);
    key.position.set(3.6, 6.4, 4.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5.5;
    key.shadow.camera.right = 5.5;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -3;
    key.shadow.bias = -0.0011;
    s.add(key);

    const fill = new THREE.PointLight(0x9db8e8, 6, 11, 2);
    fill.position.set(3.2, 1.6, 2.2);
    s.add(fill);

    // 后墙
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 10),
      new THREE.MeshStandardMaterial({ color: 0xc9d9ef, roughness: 0.97 })
    );
    wall.position.set(0, 3.2, -2.7);
    wall.receiveShadow = true;
    s.add(wall);

    // 墙上的暖光晕
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 48),
      new THREE.MeshBasicMaterial({ color: 0xc7dcf7, transparent: true, opacity: 0.3 })
    );
    glow.position.set(-1.2, 1.9, -2.66);
    s.add(glow);

    // 背景里的旧书柜剪影，制造房间纵深
    const shadeMat = new THREE.MeshStandardMaterial({ color: 0xc2d3e9, roughness: 0.95 });
    [-7.6, 7.4].forEach((bx) => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.4, 0.5), shadeMat);
      frame.position.set(bx, 1.75, -2.25);
      s.add(frame);
      for (let i = 0; i < 4; i++) {
        const board = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.07, 0.42), shadeMat);
        board.position.set(bx, 0.55 + i * 0.8, -2.22);
        s.add(board);
      }
    });
  }

  _buildDesk() {
    const s = this.scene;
    const wood = new THREE.MeshStandardMaterial({
      map: woodTexture(),
      color: 0xe4d4bf,
      roughness: 0.68,
      metalness: 0.04,
    });

    const top = new THREE.Mesh(new THREE.BoxGeometry(DESK_W, 0.28, DESK_D), wood);
    top.position.set(0, -0.14, 0);
    top.receiveShadow = true;
    top.castShadow = true;
    s.add(top);

    // 向前延伸的桌面，避免竖屏时桌沿下方留出大片黑边
    const front = new THREE.Mesh(new THREE.BoxGeometry(DESK_W, 0.28, 3.2), wood);
    front.position.set(0, -0.14, DESK_D / 2 + 1.6);
    front.receiveShadow = true;
    s.add(front);

    // 前挡板与桌腿，避免俯视时边缘像一块悬空的板
    const apronMat = new THREE.MeshStandardMaterial({ color: 0xb08a63, roughness: 0.85 });
    const apron = new THREE.Mesh(new THREE.BoxGeometry(DESK_W, 0.46, 0.1), apronMat);
    apron.position.set(0, -0.5, DESK_D / 2 - 0.06);
    s.add(apron);

    [-1, 1].forEach((side) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.4, 0.26), apronMat);
      leg.position.set(side * (DESK_W / 2 - 0.3), -0.9, DESK_D / 2 - 0.3);
      s.add(leg);
    });

    // 桌垫
    const blotterMat = new THREE.MeshStandardMaterial({ color: 0x9fb8d8, roughness: 0.94 });
    const blotter = new THREE.Mesh(new THREE.BoxGeometry(4.15, 0.018, 2.85), blotterMat);
    blotter.position.set(0, 0.009, -0.02);
    blotter.receiveShadow = true;
    s.add(blotter);

    const stitchMat = new THREE.MeshStandardMaterial({ color: 0x8fb0dc, roughness: 0.7 });
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([sx, sz]) => {
      const w = sx ? 0.012 : 3.95;
      const d = sz ? 0.012 : 2.65;
      const stitch = new THREE.Mesh(new THREE.BoxGeometry(w, 0.004, d), stitchMat);
      stitch.position.set(sx * 2.02, 0.019, -0.02 + sz * 1.38);
      s.add(stitch);
    });

    // 印泥与钢笔：给桌面一点生活痕迹，也给印章一个来处
    const padWood = new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 0.62 });
    const padFelt = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.94 });
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.07, 0.46), padWood);
    pad.position.set(2.62, 0.035, 0.18);
    pad.rotation.y = -0.26;
    pad.castShadow = true;
    pad.receiveShadow = true;
    s.add(pad);
    const felt = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.015, 0.35), padFelt);
    felt.position.set(2.62, 0.078, 0.18);
    felt.rotation.y = -0.26;
    s.add(felt);

    const penBody = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.36, metalness: 0.2 });
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.78, 12), penBody);
    pen.position.set(-2.0, 0.045, 0.62);
    pen.rotation.set(0, 0.5, Math.PI / 2);
    pen.castShadow = true;
    s.add(pen);
    const penTip = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.022, 0.16, 10),
      new THREE.MeshStandardMaterial({ color: 0x9a7742, roughness: 0.35, metalness: 0.8 }));
    penTip.position.set(-1.62, 0.045, 0.82);
    penTip.rotation.set(0, 0.5, Math.PI / 2);
    s.add(penTip);

    // 桌沿的暖色高光
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(DESK_W, 0.012, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xa8804f, roughness: 0.55 })
    );
    edge.position.set(0, 0.001, DESK_D / 2 - 0.015);
    s.add(edge);
  }

  _buildLamp() {
    const s = this.scene;
    const brass = new THREE.MeshStandardMaterial({ color: 0x8a6a3c, roughness: 0.42, metalness: 0.72 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x24406e, roughness: 0.5, metalness: 0.45 });

    const lamp = new THREE.Group();
    lamp.position.set(-3.35, 0, -1.55);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.37, 0.07, 32), brass);
    base.position.y = 0.035;
    base.castShadow = true;
    lamp.add(base);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.42, 16), brass);
    stem.position.y = 0.75;
    stem.castShadow = true;
    lamp.add(stem);

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 12), brass);
    arm.position.set(0.24, 1.44, 0);
    arm.rotation.z = Math.PI / 2.35;
    arm.castShadow = false;
    lamp.add(arm);

    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.34, 0.4, 28, 1, true), dark);
    shade.position.set(0.46, 1.36, 0);
    shade.rotation.z = 0.3;
    shade.castShadow = false;
    shade.material.side = THREE.DoubleSide;
    lamp.add(shade);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0xfff0cf, emissive: 0xffc078, emissiveIntensity: 2.4 })
    );
    bulb.position.set(0.46, 1.24, 0);
    lamp.add(bulb);
    this.bulb = bulb;

    // 灯下的光锥（假体积光）
    const shaft = new THREE.Mesh(
      new THREE.ConeGeometry(1.55, 2.1, 32, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xffe8c4,
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    shaft.position.set(0.46, 0.22, 0);
    shaft.rotation.z = 0.06;
    lamp.add(shaft);
    this.shaft = shaft;

    s.add(lamp);

    const spot = new THREE.SpotLight(0xffdfb8, 7, 13, Math.PI / 4.2, 0.8, 1.15);
    spot.position.set(-2.85, 1.55, -1.45);
    spot.target.position.set(0.2, 0, 0.25);
    spot.castShadow = true;
    spot.shadow.mapSize.set(1024, 1024);
    spot.shadow.bias = -0.0014;
    s.add(spot);
    s.add(spot.target);
    this.spot = spot;
  }

  _buildTrays() {
    const s = this.scene;
    const trayMat = new THREE.MeshStandardMaterial({ color: 0xc39a6a, roughness: 0.74, metalness: 0.04 });
    const innerMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc6, roughness: 0.95 });
    const brass = new THREE.MeshStandardMaterial({ color: 0x9a7742, roughness: 0.38, metalness: 0.7 });

    this.drawerDefs.forEach((def, i) => {
      const group = new THREE.Group();
      group.position.set(TRAY_X[i] || i * 2 - 3, 0, TRAY_Z);

      const body = new THREE.Mesh(new THREE.BoxGeometry(TRAY_W, TRAY_H, TRAY_D), trayMat);
      body.position.y = TRAY_H / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      const inner = new THREE.Mesh(new THREE.BoxGeometry(TRAY_W - 0.12, 0.02, TRAY_D - 0.12), innerMat);
      inner.position.y = TRAY_H - 0.005;
      group.add(inner);

      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.035, 0.05), brass);
      handle.position.set(0, TRAY_H * 0.55, TRAY_D / 2 + 0.01);
      group.add(handle);

      const canvas = document.createElement('canvas');
      canvas.width = 460;
      canvas.height = 240;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;

      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.63),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, emissive: 0x000000 })
      );
      label.position.set(0, TRAY_H + 0.2, -0.11);
      label.rotation.x = -0.62;
      label.castShadow = true;
      group.add(label);

      s.add(group);

      const drawer = {
        kind: def.key,
        def,
        group,
        label,
        canvas,
        texture: tex,
        count: 0,
        hover: 0,
        baseZ: TRAY_Z,
        baseRot: 0,
      };
      paintDrawer(canvas, def, 0);
      tex.needsUpdate = true;
      group.userData.drawer = drawer;
      this.drawers.push(drawer);
    });
  }

  _buildCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 920;
    canvas.height = 612;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;

    const group = new THREE.Group();
    group.position.set(0, CARD_Y, CARD_Z);
    group.rotation.x = -Math.PI / 2 + CARD_TILT;
    group.rotation.y = 0.018;

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(CARD_W, CARD_H),
      new THREE.MeshStandardMaterial({ map: tex, color: 0xf7f2e8, roughness: 0.94, metalness: 0, transparent: true })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    const decalTex = sealTexture('归档', '#1e40af');
    const decal = new THREE.Mesh(
      new THREE.PlaneGeometry(1.16, 0.7),
      new THREE.MeshBasicMaterial({ map: decalTex, transparent: true, opacity: 0, depthWrite: false })
    );
    decal.position.set(CARD_W * 0.1, 0, 0.004);
    group.add(decal);

    this.scene.add(group);

    this.cardCanvas = canvas;
    this.cardTexture = tex;
    this.cardMesh = mesh;
    this.cardGroup = group;
    this.decal = decal;
    this.sealArchive = decalTex;
    this.sealReject = sealTexture('退回', '#475569');
  }

  _buildStamp() {
    const brass = new THREE.MeshStandardMaterial({ color: 0x8a6a3c, roughness: 0.4, metalness: 0.7 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 0.7 });

    const g = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.34, 18), wood);
    handle.position.y = 0.3;
    g.add(handle);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 18, 14), brass);
    knob.position.y = 0.5;
    g.add(knob);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.18, 22), brass);
    body.position.y = 0.09;
    body.castShadow = true;
    g.add(body);
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.025, 22), wood);
    plate.position.y = -0.02;
    g.add(plate);

    g.visible = false;
    this.scene.add(g);
    this.stamp = g;
  }

  _buildOil() {
    const brass = new THREE.MeshStandardMaterial({ color: 0x8a6a3c, roughness: 0.45, metalness: 0.65 });
    this.oilGroup = new THREE.Group();
    this.oilGroup.position.set(3.15, 0, -1.5);

    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group();
      g.position.x = i * 0.46;

      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.09, 18), brass);
      cup.position.y = 0.045;
      g.add(cup);

      const glass = new THREE.Mesh(
        new THREE.SphereGeometry(0.115, 18, 14),
        new THREE.MeshStandardMaterial({
          color: 0x8a6a2a,
          emissive: 0xffb257,
          emissiveIntensity: 1.8,
          roughness: 0.3,
          metalness: 0.1,
          transparent: true,
          opacity: 0.92,
        })
      );
      glass.position.y = 0.19;
      glass.scale.y = 1.25;
      g.add(glass);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.035, 0.13, 10),
        new THREE.MeshBasicMaterial({ color: 0xffd79a, transparent: true, opacity: 0.95 })
      );
      flame.position.y = 0.36;
      g.add(flame);

      this.oilGroup.add(g);
      this.oilNodes.push({ group: g, glass, flame, lit: true });
    }
    this.scene.add(this.oilGroup);
  }

  /** 只给场景面板当背景时，桌上放点纸堆、墨水瓶和信封。 */
  _buildProps() {
    const s = this.scene;
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
    const leather = new THREE.MeshStandardMaterial({ color: 0x24406e, roughness: 0.8 });

    for (let i = 0; i < 6; i++) {
      const sheet = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.012, 1.05), paperMat);
      sheet.position.set(-2.1 + i * 0.02, 0.006 + i * 0.013, -0.5 + i * 0.006);
      sheet.rotation.y = 0.12 - i * 0.02;
      sheet.castShadow = true;
      sheet.receiveShadow = true;
      s.add(sheet);
    }

    const book = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.16, 0.9), leather);
    book.position.set(1.75, 0.08, -0.7);
    book.rotation.y = -0.16;
    book.castShadow = true;
    s.add(book);

    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.3, 20), leather);
    bottle.position.set(2.9, 0.15, 0.15);
    bottle.castShadow = true;
    s.add(bottle);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.12, 16), leather);
    cap.position.set(2.9, 0.36, 0.15);
    s.add(cap);

    // 桌角的一只杯子
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.13, 0.24, 22, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xd9cdb4, roughness: 0.6, side: THREE.DoubleSide })
    );
    cup.position.set(-3.4, 0.12, 0.85);
    cup.castShadow = true;
    s.add(cup);
  }

  _buildDust() {
    const count = 220;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 3.4;
      positions[i * 3 + 2] = (Math.random() - 0.4) * 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xe4d4bf,
      size: 0.018,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.dust = new THREE.Points(geo, mat);
    this.scene.add(this.dust);
  }

  /* ---------- 交互 ---------- */

  _bind() {
    const canvas = this.renderer.domElement;

    const setPointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.lastClient = { x: e.clientX, y: e.clientY };
    };

    this._onDown = (e) => {
      setPointer(e);
      this.parallax.active = true;

      this.cardHover = false;
      const cardHit = this._pickCard();
      if (cardHit) {
        const p = this._deskPoint();
        this.dragging = {
          dx: p ? this.cardGroup.position.x - p.x : 0,
          dz: p ? this.cardGroup.position.z - p.z : 0,
          moved: 0,
          startX: e.clientX,
          startY: e.clientY,
        };
        canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
        this._liftCard(1);
        return;
      }

      const drawer = this._pickDrawer();
      if (drawer) this.pendingDrawer = drawer.kind;
    };

    this._onMove = (e) => {
      setPointer(e);
      const rect = canvas.getBoundingClientRect();
      this.parallax.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      this.parallax.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      if (!this.dragging) {
        this.cardHover = !!this._pickCard();
        const hoverDrawer = this._pickDrawer();
        this._setHot(hoverDrawer ? hoverDrawer.kind : null);
        return;
      }
      const p = this._deskPoint();
      if (!p) return;
      const d = this.dragging;
      d.moved = Math.max(d.moved, Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY));
      this.cardGroup.position.x = THREE.MathUtils.clamp(p.x + d.dx, -3.9, 3.9);
      this.cardGroup.position.z = THREE.MathUtils.clamp(p.z + d.dz, -1.5, 1.9);
      this.cardGroup.position.y = CARD_Y + Math.min(d.moved * 0.0006, 0.12);

      const over = this._pickDrawer();
      this._setHot(over ? over.kind : null);
    };

    this._onUp = (e) => {
      setPointer(e);
      canvas.releasePointerCapture && this.dragging && canvas.releasePointerCapture(e.pointerId);

      if (this.dragging) {
        const d = this.dragging;
        this.dragging = null;
        this._liftCard(0);
        this._setHot(null);

        const over = this._pickDrawer();
        if (d.moved > 14 && over) {
          this.onFile(over.kind, 'drop');
          return;
        }
        if (d.moved <= 14) {
          // 轻点卡片就把它放回原处
          this._resetCardPose();
          return;
        }
        this._resetCardPose();
        return;
      }

      if (this.pendingDrawer) {
        const kind = this.pendingDrawer;
        this.pendingDrawer = null;
        this.onFile(kind, 'click');
      }
    };

    this._onLeave = () => {
      this.cardHover = false;
      this.pointer.set(-2, -2);
      this.parallax.x = 0;
      this.parallax.y = 0;
      this._setHot(null);
    };

    canvas.addEventListener('pointerdown', this._onDown);
    canvas.addEventListener('pointermove', this._onMove);
    canvas.addEventListener('pointerup', this._onUp);
    canvas.addEventListener('pointerleave', this._onLeave);
  }

  _deskPoint() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const p = this.raycaster.ray.intersectPlane(this.deskPlane, this.tmpVec);
    return p ? { x: p.x, z: p.z } : null;
  }

  _pickCard() {
    if (!this.cardGroup || !this.cardGroup.visible) return null;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObject(this.cardMesh, false);
    return hits.length ? hits[0] : null;
  }

  _pickDrawer() {
    if (!this.drawers.length) return null;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets = [];
    this.drawers.forEach((d) => {
      targets.push(d.group.children[0]);
      targets.push(d.label);
    });
    const hits = this.raycaster.intersectObjects(targets, false);
    if (!hits.length) return null;
    let node = hits[0].object;
    while (node && !node.userData.drawer) node = node.parent;
    return node ? node.userData.drawer : null;
  }

  _setHot(kind) {
    this.hot = kind;
    this.drawers.forEach((d) => {
      if (d.kind === kind) d.label.material.emissive.setRGB(0.24, 0.15, 0.05);
      else d.label.material.emissive.setRGB(0, 0, 0);
    });
  }

  _liftCard(up) {
    if (!this.cardGroup) return;
    this.cardLift = up;
    this.cardGroup.position.y = CARD_Y + up * 0.07;
  }

  _resetCardPose() {
    if (!this.cardGroup) return;
    this.jobs.push({
      t: 0,
      dur: 0.24,
      update: (p) => {
        this.cardGroup.position.x += (0 - this.cardGroup.position.x) * 0.25;
        this.cardGroup.position.z += (CARD_Z - this.cardGroup.position.z) * 0.25;
        this.cardGroup.position.y = CARD_Y;
        this.cardGroup.rotation.y = 0.018;
        this.cardGroup.scale.setScalar(1);
        void p;
      },
      done: () => {
        this.cardGroup.position.set(0, CARD_Y, CARD_Z);
        this.cardGroup.rotation.y = 0.018;
      },
    });
  }

  /* ---------- 对外接口 ---------- */

  setCard(card) {
    if (this.ambient) return;
    this.card = card || null;
    if (!this.cardGroup) return;

    if (!card) {
      this.cardGroup.visible = false;
      return;
    }

    this.cardToken++;
    paintCard(this.cardCanvas, card);
    this.cardTexture.needsUpdate = true;
    this.cardGroup.visible = true;
    this.cardGroup.position.set(0, CARD_Y, CARD_Z);
    this.cardGroup.rotation.set(-Math.PI / 2 + CARD_TILT, 0.018, 0);
    this.cardGroup.scale.setScalar(1);
    this.cardMesh.material.opacity = 1;
    this.decal.material.opacity = 0;
    this.stampBusy = false;
    this.stamp.visible = false;
    this._setHot(null);
  }

  setCounts(counts) {
    counts = counts || {};
    this.drawers.forEach((d) => {
      const n = counts[d.kind] || 0;
      if (n === d.count) return;
      d.count = n;
      paintDrawer(d.canvas, d.def, n);
      d.texture.needsUpdate = true;
    });
  }

  setOil(n) {
    this.oil = n;
    this.oilNodes.forEach((node, i) => {
      const lit = i < n;
      if (node.lit === lit) return;
      node.lit = lit;
      node.glass.material.emissiveIntensity = lit ? 1.8 : 0;
      node.glass.material.color.setHex(lit ? 0x8a6a2a : 0x9aa7b8);
      node.flame.visible = lit;
    });
    if (this.spot) {
      this.spot.intensity = 18 + n * 8;
    }
    if (this.bulb) {
      this.bulb.material.emissiveIntensity = 1.2 + n * 0.45;
    }
  }

  /** ok=true 盖章归档并把卡片收进抽屉；false 盖章退回并抖一下。 */
  react(ok, kind) {
    if (this.ambient || !this.cardGroup || !this.cardGroup.visible) return;

    var token = this.cardToken;
    this.decal.material.map = ok ? this.sealArchive : this.sealReject;
    this.decal.material.needsUpdate = true;
    this.decal.material.opacity = 0;
    this.stampBusy = true;

    const drawer = this.drawers.find((d) => d.kind === kind) || this.drawers[0];
    const from = new THREE.Vector3(CARD_W * 0.1, 1.12, CARD_Z + 0.02);
    const to = new THREE.Vector3(CARD_W * 0.1, CARD_Y + 0.03, CARD_Z + 0.02);

    this.stamp.visible = true;
    this.stamp.position.set(from.x, from.y, from.z);
    this.stamp.rotation.set(0, -0.2, 0.08);

    this.jobs.push({
      t: 0,
      dur: 0.1,
      update: (p) => {
        const e = 1 - Math.pow(1 - p, 3);
        this.stamp.position.y = from.y + (to.y - from.y) * e;
      },
      done: () => {
        if (this.cardToken !== token) return;
        this.decal.material.opacity = 1;
        if (window.GameAudio) window.GameAudio.sfx(ok ? 'stamp' : 'wrong');
        this.jobs.push({
          t: 0,
          dur: 0.18,
          update: (p) => {
            this.stamp.position.y = to.y + p * 0.75;
          },
          done: () => {
            this.stamp.visible = false;
            if (!ok) this.stampBusy = false;
          },
        });
      },
    });

    if (ok) {
      this.jobs.push({
        t: 0,
        dur: 0.2,
        delay: 0.1,
        update: (p) => {
          if (this.cardToken !== token) return;
          const e = p * p;
          this.cardGroup.position.x = (drawer.group.position.x) * e;
          this.cardGroup.position.z = CARD_Z + (drawer.group.position.z - CARD_Z) * e;
          this.cardGroup.position.y = CARD_Y + e * 0.16;
          this.cardGroup.scale.setScalar(1 - e * 0.35);
          this.cardMesh.material.opacity = 1 - e;
          this.decal.material.opacity = 1 - e;
        },
        done: () => {
          if (this.cardToken !== token) return;
          this.cardGroup.visible = false;
        },
      });
    } else {
      this.jobs.push({
        t: 0,
        dur: 0.42,
        delay: 0.08,
        update: (p) => {
          if (this.cardToken !== token) return;
          const damp = 1 - p;
          this.cardGroup.rotation.y = 0.018 + Math.sin(p * Math.PI * 6) * 0.05 * damp;
          this.decal.material.opacity = 1 - Math.max(0, (p - 0.55) / 0.45);
        },
        done: () => {
          if (this.cardToken !== token) return;
          this.cardGroup.rotation.y = 0.018;
          this.decal.material.opacity = 0;
        },
      });
    }
  }

  screenOf(object3d) {
    if (!object3d) return null;
    const v = new THREE.Vector3();
    object3d.getWorldPosition(v);
    v.project(this.camera);
    const rect = this.renderer.domElement.getBoundingClientRect();
    return {
      x: rect.left + (v.x * 0.5 + 0.5) * rect.width,
      y: rect.top + (-v.y * 0.5 + 0.5) * rect.height,
    };
  }

  drawerScreen(kind) {
    const d = this.drawers.find((x) => x.kind === kind);
    return d ? this.screenOf(d.label) : null;
  }

  cardScreen() {
    return this.screenOf(this.cardMesh);
  }

  /* ---------- 循环 ---------- */

  _resize() {
    const w = this.container.clientWidth || 900;
    const h = this.container.clientHeight || 500;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;

    const portrait = w / h < 1.25;
    this.portrait = portrait;
    this.camera.fov = portrait ? 55 : 41;
    this.camera.position.set(0, portrait ? 5.2 : 3.95, portrait ? 8.0 : 5.7);
    this.camera.lookAt(0, 0.05, portrait ? 0.55 : 0.18);
    this.camera.updateProjectionMatrix();
    this._layoutTrays();
  }

  _layoutTrays() {
    if (!this.drawers.length) return;
    this.drawers.forEach((d, i) => {
      if (this.portrait) {
        d.group.scale.setScalar(0.6);
        d.group.position.x = (i - 1.5) * 0.9;
        d.group.position.z = 1.5;
      } else {
        d.group.scale.setScalar(1);
        d.group.position.x = TRAY_X[i];
        d.group.position.z = TRAY_Z;
      }
      d.baseZ = d.group.position.z;
    });
  }

  _tick() {
    if (!this.alive) return;
    this.raf = requestAnimationFrame(() => this._tick());
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = performance.now() / 1000;

    // 任务队列
    for (let i = this.jobs.length - 1; i >= 0; i--) {
      const job = this.jobs[i];
      if (job.delay && job.delay > 0) {
        job.delay -= dt;
        continue;
      }
      job.t += dt;
      const p = Math.min(job.t / job.dur, 1);
      job.update(p);
      if (p >= 1) {
        if (job.done) job.done();
        const idx = this.jobs.indexOf(job);
        if (idx >= 0) this.jobs.splice(idx, 1);
      }
    }

    // 抽屉悬停与待机浮动
    this.drawers.forEach((d) => {
      const target = d.kind === this.hot ? 1 : 0;
      d.hover += (target - d.hover) * 0.16;
      d.group.position.z = d.baseZ + d.hover * 0.13;
      d.group.rotation.x = -d.hover * 0.03;
      const bob = Math.sin(t * 1.4 + d.baseZ) * 0.0006;
      d.label.position.y = TRAY_H + 0.23 + d.hover * 0.02 + bob;
    });

    // 灯焰呼吸
    this.oilNodes.forEach((node, i) => {
      if (!node.lit) return;
      const f = 1 + Math.sin(t * 6 + i * 1.7) * 0.12;
      node.flame.scale.set(f, 1 + Math.sin(t * 9 + i) * 0.18, f);
      node.glass.material.emissiveIntensity = 1.6 + Math.sin(t * 5 + i) * 0.3;
    });

    // 相机视差
    if (!this.dragging) {
      const px = this.portrait ? 0 : this.parallax.x * 0.22;
      const py = this.portrait ? 0 : this.parallax.y * 0.1;
      const baseY = this.portrait ? 5.2 : 3.95;
      const baseZ = this.portrait ? 8.0 : 5.7;
      this.camera.position.x += (px - this.camera.position.x) * 0.045;
      this.camera.position.y += (baseY - py - this.camera.position.y) * 0.045;
      this.camera.position.z += (baseZ - this.camera.position.z) * 0.045;
      this.camera.lookAt(0, 0.05, this.portrait ? 0.55 : 0.18);
    }

    // 卡片待机轻微浮动，像被灯照着
    if (this.cardGroup && this.cardGroup.visible && !this.dragging && !this.stampBusy && !this.jobs.length) {
      const target = CARD_Y + (this.cardHover ? 0.02 : 0) + Math.sin(t * 1.1) * 0.002;
      this.cardGroup.position.y += (target - this.cardGroup.position.y) * 0.2;
    }

    // 灰尘
    if (this.dust) {
      const pos = this.dust.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + 0.0014;
        if (y > 3.4) y = 0;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  /* ---------- 生命周期 ---------- */

  pause() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  resume() {
    if (!this.raf && this.alive) this._tick();
  }

  dispose() {
    this.alive = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.resizeObserver) this.resizeObserver.disconnect();

    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointerdown', this._onDown);
    canvas.removeEventListener('pointermove', this._onMove);
    canvas.removeEventListener('pointerup', this._onUp);
    canvas.removeEventListener('pointerleave', this._onLeave);

    this.scene.traverse((obj) => {
      if (obj.isMesh || obj.isPoints) {
        if (obj.geometry) obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (!m) return;
          if (m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
    this.renderer.dispose();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);

    this.drawers = [];
    this.oilNodes = [];
    this.jobs = [];
    this.cardGroup = null;
    this.card = null;
  }
}

export default Desk3D;
