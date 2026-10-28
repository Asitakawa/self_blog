/* ============================================================
 * 树洞奇缘 · 3D 书架
 * 用 Three.js 把博客文章立成一座真实的木书柜：
 * 书脊按分类上色、标题烫在书脊上，悬停抬起、点击翻开。
 * 由 scenes.js 动态 import，WebGL 不可用时自动回退 2D 列表。
 * ============================================================ */
import * as THREE from '../vendor/three.module.js';

const CJK = /[\u3400-\u9FFF\uF900-\uFAFF]/;
const MAX_BOOKS = 40;

const SHELF_W = 6.4;
const SHELF_H = 4.5;
const SHELF_D = 0.78;
const ROW_H = 1.04;
const ROWS = 4;
const BASE_Y = 0.4;

/* ---------------- 书脊贴图 ---------------- */

function spineTexture(title, color) {
  const W = 128;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = color || '#8ea2ff';
  ctx.fillRect(0, 0, W, H);

  // 书脊的圆弧光与暗边
  const shade = ctx.createLinearGradient(0, 0, W, 0);
  shade.addColorStop(0, 'rgba(255,255,255,.22)');
  shade.addColorStop(0.18, 'rgba(255,255,255,.05)');
  shade.addColorStop(0.55, 'rgba(0,0,0,.06)');
  shade.addColorStop(1, 'rgba(0,0,0,.34)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, W, H);

  // 烫金细线
  ctx.fillStyle = 'rgba(245,197,66,.7)';
  ctx.fillRect(12, 18, W - 24, 3);
  ctx.fillRect(12, H - 21, W - 24, 3);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,248,225,.95)';

  if (CJK.test(title)) {
    const chars = Array.from(title).slice(0, 13);
    const size = Math.min(34, (H - 90) / chars.length);
    ctx.font = `600 ${size}px "PingFang SC","Microsoft YaHei",sans-serif`;
    const start = H / 2 - ((chars.length - 1) * size) / 2;
    chars.forEach((ch, i) => ctx.fillText(ch, W / 2, start + i * size));
  } else {
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(Math.PI / 2);
    let size = 27;
    do {
      ctx.font = `600 ${size}px Georgia,serif`;
      size -= 1;
    } while (ctx.measureText(title).width > H - 96 && size > 12);
    ctx.fillText(title.slice(0, 46), 0, 0);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/* ---------------- 书架本体 ---------------- */

export class Shelf3D {
  constructor(container, posts, options = {}) {
    this.container = container;
    this.posts = (posts || []).slice(0, MAX_BOOKS);
    this.onOpen = options.onOpen || function () {};

    this.clock = new THREE.Clock();
    this.books = [];
    this.hovered = null;
    this.dragging = false;
    this.moved = 0;
    this.pointer = new THREE.Vector2(-2, -2);
    this.azimuth = 0;
    this.elevation = 0.02;
    this.distance = 6.3;
    this.idleAt = performance.now();
    this.raf = null;
    this.alive = true;

    this._initRenderer();
    this._initScene();
    this._buildRoom();
    this._buildShelf();
    this._buildBooks();
    this._buildDust();
    this._createTip();
    this._bind();

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
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.container.appendChild(this.renderer.domElement);
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0806);
    this.scene.fog = new THREE.Fog(0x0a0806, 9, 16);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    this.camera.position.set(0, 2.5, 6.3);
    this.camera.lookAt(0, 2.25, 0);

    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Line = { threshold: 0.1 };
  }

  _buildRoom() {
    const s = this.scene;

    s.add(new THREE.AmbientLight(0xb7a689, 0.6));
    s.add(new THREE.HemisphereLight(0xd9c8a8, 0x1a120c, 0.65));

    const key = new THREE.DirectionalLight(0xffd9a3, 1.9);
    key.position.set(3.4, 6.2, 5.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -1;
    key.shadow.bias = -0.0012;
    s.add(key);

    const warm = new THREE.PointLight(0xff9d5c, 18, 9, 2);
    warm.position.set(-2.2, 2.7, 2.4);
    s.add(warm);

    const rim = new THREE.PointLight(0x8a5a2e, 10, 8, 2);
    rim.position.set(2.6, 1.4, 2.2);
    s.add(rim);

    // 地板
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshStandardMaterial({ color: 0x120e0a, roughness: 0.94, metalness: 0.04 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    s.add(floor);

    // 背墙
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 9),
      new THREE.MeshStandardMaterial({ color: 0x0e0b08, roughness: 0.96 })
    );
    wall.position.set(0, 4, -1.6);
    wall.receiveShadow = true;
    s.add(wall);

    // 墙上的一圈暖光，制造房间感
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(2.6, 48),
      new THREE.MeshBasicMaterial({ color: 0x2b1f17, transparent: true, opacity: 0.5 })
    );
    glow.position.set(0, 2.4, -1.55);
    s.add(glow);
  }

  _buildShelf() {
    const wood = new THREE.MeshStandardMaterial({ color: 0x4d3624, roughness: 0.66, metalness: 0.05 });
    const woodDark = new THREE.MeshStandardMaterial({ color: 0x32211a, roughness: 0.8 });

    const frame = new THREE.Group();
    frame.position.z = 0;

    // 两侧板
    [-1, 1].forEach((side) => {
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.14, SHELF_H, SHELF_D), wood);
      board.position.set(side * (SHELF_W / 2), SHELF_H / 2 + 0.2, 0);
      board.castShadow = true;
      board.receiveShadow = true;
      frame.add(board);
    });

    // 顶板 / 底板 / 层板
    for (let i = 0; i <= ROWS; i++) {
      const y = BASE_Y + i * ROW_H - 0.05;
      const board = new THREE.Mesh(new THREE.BoxGeometry(SHELF_W + 0.18, 0.1, SHELF_D + 0.06), i === ROWS ? wood : woodDark);
      board.position.set(0, y, 0);
      board.castShadow = true;
      board.receiveShadow = true;
      frame.add(board);
    }

    // 背板
    const back = new THREE.Mesh(new THREE.BoxGeometry(SHELF_W, SHELF_H, 0.06), woodDark);
    back.position.set(0, SHELF_H / 2 + 0.2, -SHELF_D / 2 + 0.03);
    back.receiveShadow = true;
    frame.add(back);

    this.scene.add(frame);
  }

  _buildBooks() {
    const innerW = SHELF_W - 0.56;
    const startX = -innerW / 2;
    const right = innerW / 2;
    const rowCursor = new Array(ROWS).fill(startX);
    const sideBase = new THREE.MeshStandardMaterial({ color: 0xd8cbb2, roughness: 0.88 });
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xb23a2b,
      emissive: 0x4a120b,
      emissiveIntensity: 0.9,
      roughness: 0.55,
    });
    let row = 0;

    this.posts.forEach((post) => {
      const title = post.title || '无题';
      const width = Math.min(0.34, 0.15 + Array.from(title).length * 0.008);
      const height = 0.82 + ((title.length * 7) % 14) / 100;
      const depth = 0.52;

      if (rowCursor[row] + width > right && row < ROWS - 1) row += 1;
      if (row >= ROWS) return;

      const color = post.color || '#8ea2ff';
      const spineMat = new THREE.MeshStandardMaterial({
        map: spineTexture(title, color),
        roughness: 0.74,
        metalness: 0.03,
        emissive: new THREE.Color(0x000000),
      });
      const sideMat = sideBase.clone();
      sideMat.color = new THREE.Color(color).offsetHSL(0, -0.12, -0.22);

      const materials = [sideMat, sideMat, sideMat, sideMat, spineMat, sideMat];
      const book = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), materials);

      // 新书从上往下摆，最上层是最近写的
      const rowY = BASE_Y + (ROWS - 1 - row) * ROW_H;
      const y = rowY + height / 2 + 0.005;
      const x = rowCursor[row] + width / 2;
      rowCursor[row] += width + 0.016;

      book.position.set(x, y, 0.02);
      book.rotation.z = ((title.length % 5) - 2) * 0.004;

      // 露出的金色书签带：一眼分辨哪些书能翻开
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.1, 0.008), ribbonMat);
      ribbon.position.set(width * 0.28, height / 2 + 0.03, depth / 2 - 0.03);
      ribbon.rotation.z = 0.12;
      book.add(ribbon);

      book.castShadow = true;
      book.receiveShadow = true;
      book.userData = {
        slug: post.slug,
        title,
        date: post.date,
        category: post.category,
        baseY: y,
        baseZ: 0.02,
        baseRot: book.rotation.z,
        spineMat,
        lift: 0,
      };

      this.books.push(book);
      this.scene.add(book);
    });

    // 空位用无字旧书填满，让书柜看起来像真的有人在用
    this._fillProps(rowCursor, startX, right);

    // 极端情况下仍有剩余，叠成一摞平放的书
    const remaining = this.posts.length - this.books.length;
    if (remaining > 0) {
      const stackMat = new THREE.MeshStandardMaterial({ color: 0x2f3a66, roughness: 0.8 });
      for (let i = 0; i < Math.min(remaining, 4); i++) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.075, 0.52), stackMat);
        slab.position.set(innerW / 2 - 0.44, BASE_Y + 0.05 + i * 0.08, 0.02);
        slab.rotation.y = (i % 2 ? 1 : -1) * 0.04;
        slab.castShadow = true;
        this.scene.add(slab);
      }
    }
  }

  /** 用没有书名的旧书填充空隙，仅作背景，不参与拾取。 */
  _fillProps(rowCursor, startX, right) {
    const rng = mulberry32(20261028);
    const palette = [0x3a2f24, 0x4a3a2a, 0x2f2a22, 0x53372c, 0x3d3a2e, 0x2b2320, 0x5a4a33, 0x2f3a3c, 0x38303f, 0x2c342c];
    const matCache = {};

    for (let r = 0; r < ROWS; r++) {
      let x = (rowCursor[r] > startX ? rowCursor[r] : startX) + 0.03;
      const rowY = BASE_Y + (ROWS - 1 - r) * ROW_H;
      while (x < right - 0.06) {
        const w = 0.12 + rng() * 0.14;
        const h = 0.66 + rng() * 0.16;
        if (x + w > right - 0.02) break;

        const color = palette[Math.floor(rng() * palette.length)];
        if (!matCache[color]) {
          matCache[color] = new THREE.MeshStandardMaterial({
            map: spineTexture('', '#' + color.toString(16).padStart(6, '0')),
            roughness: 0.82,
          });
        }
        const prop = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.5), matCache[color]);
        prop.position.set(x + w / 2, rowY + h / 2 + 0.005, 0.01 + rng() * 0.02);
        prop.rotation.z = (rng() - 0.5) * 0.035;
        prop.castShadow = true;
        prop.receiveShadow = true;
        this.scene.add(prop);

        x += w + 0.01 + rng() * 0.014;
        if (rng() < 0.06) x += 0.07;
      }
    }
  }

  _buildDust() {
    const count = 260;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 5.2;
      positions[i * 3 + 2] = (Math.random() - 0.4) * 3.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffd9a8,
      size: 0.02,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.dust = new THREE.Points(geo, mat);
    this.scene.add(this.dust);
  }

  _createTip() {
    this.tip = document.createElement('div');
    this.tip.className = 'vn-shelf-tip';
    this.container.appendChild(this.tip);
  }

  /* ---------- 交互 ---------- */

  _bind() {
    const canvas = this.renderer.domElement;

    const setPointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.tipX = e.clientX - rect.left;
      this.tipY = e.clientY - rect.top;
    };

    this._onDown = (e) => {
      setPointer(e);
      this.dragging = true;
      this.moved = 0;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.container.classList.add('dragging');
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      this.idleAt = performance.now();
    };

    this._onMove = (e) => {
      setPointer(e);
      if (this.dragging) {
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        this.moved += Math.abs(dx) + Math.abs(dy);
        this.azimuth = THREE.MathUtils.clamp(this.azimuth + dx * 0.0035, -0.5, 0.5);
        this.elevation = THREE.MathUtils.clamp(this.elevation + dy * 0.0022, -0.12, 0.24);
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.idleAt = performance.now();
      }
    };

    this._onUp = (e) => {
      this.container.classList.remove('dragging');
      // 触摸设备没有 hover，抬起时按当前坐标重新拾取
      if (this.dragging && this.moved < 7) {
        setPointer(e);
        const hit = this._pick();
        if (hit && hit.userData.slug) this.onOpen(hit.userData.slug);
      }
      this.dragging = false;
      this.idleAt = performance.now();
    };

    this._onLeave = () => {
      this.dragging = false;
      this.pointer.set(-2, -2);
      this.container.classList.remove('dragging');
    };

    this._onWheel = (e) => {
      e.preventDefault();
      this.distance = THREE.MathUtils.clamp(this.distance + e.deltaY * 0.0016, 4.7, 8.2);
    };

    canvas.addEventListener('pointerdown', this._onDown);
    canvas.addEventListener('pointermove', this._onMove);
    canvas.addEventListener('pointerup', this._onUp);
    canvas.addEventListener('pointerleave', this._onLeave);
    canvas.addEventListener('wheel', this._onWheel, { passive: false });
  }

  _pick() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.books, false);
    return hits.length ? hits[0].object : null;
  }

  /* ---------- 循环 ---------- */

  _resize() {
    const w = this.container.clientWidth || 640;
    const h = this.container.clientHeight || 420;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  _tick() {
    if (!this.alive) return;
    this.raf = requestAnimationFrame(() => this._tick());

    this.clock.getElapsedTime();

    // 悬停检测（拖动时不检测，避免抖动）
    if (!this.dragging && this.pointer.x > -1.5) {
      const hit = this._pick();
      if (hit !== this.hovered) {
        if (this.hovered) this.hovered.userData.lift = 0;
        this.hovered = hit;
        if (hit) {
          this.tip.innerHTML = '<b>' + escapeHtml(hit.userData.title) + '</b>' +
            '<span>' + escapeHtml(hit.userData.category || '随笔') + ' · ' + escapeHtml(hit.userData.date || '') + '</span>';
        }
      }
    } else {
      this.hovered = null;
    }

    // 书脊抬起 / 发光
    this.books.forEach((book) => {
      const d = book.userData;
      const target = book === this.hovered ? 1 : 0;
      d.lift += (target - d.lift) * 0.16;
      book.position.z = d.baseZ + d.lift * 0.075;
      book.position.y = d.baseY + d.lift * 0.055;
      d.spineMat.emissive.setRGB(
        0.05 + d.lift * 0.3,
        0.035 + d.lift * 0.21,
        0.008 + d.lift * 0.05
      );
    });

    // 提示框跟随（夹在画布内，避免顶到场景标题）
    if (this.hovered && this.tipX != null) {
      const w = this.container.clientWidth || 640;
      const x = Math.min(Math.max(this.tipX, 72), w - 72);
      const y = Math.max(this.tipY - 10, 76);
      this.tip.classList.add('on');
      this.tip.style.left = x + 'px';
      this.tip.style.top = y + 'px';
    } else {
      this.tip.classList.remove('on');
    }

    const r = this.distance;
    const cosEl = Math.cos(this.elevation);
    this.camera.position.set(
      Math.sin(this.azimuth) * r * cosEl,
      2.35 + Math.sin(this.elevation) * r,
      Math.cos(this.azimuth) * r * cosEl
    );
    this.camera.lookAt(0, 2.25, 0);

    // 灰尘缓慢上浮
    if (this.dust) {
      const pos = this.dust.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + 0.0016;
        if (y > 5.2) y = 0;
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
    canvas.removeEventListener('wheel', this._onWheel);

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
    if (this.tip && this.tip.parentNode) this.tip.parentNode.removeChild(this.tip);
    this.books = [];
    this.hovered = null;
  }
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default Shelf3D;
