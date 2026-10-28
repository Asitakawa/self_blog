/* ============================================================
 * 树洞奇缘 · 声音
 * 全部用 WebAudio 合成，不加载音频文件：
 * 低频环境垫、纸页声、印章声、选项与章节转场。
 * ============================================================ */
(function () {
  'use strict';

  var KEY = 'vn_sound';
  var ctx = null;
  var master = null;
  var noiseCache = null;
  var started = false;

  function enabled() {
    try { return localStorage.getItem(KEY) !== '0'; } catch (e) { return true; }
  }

  function noiseBuffer(seconds) {
    if (noiseCache && noiseCache.duration >= seconds) return noiseCache;
    var len = Math.floor(ctx.sampleRate * seconds);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    noiseCache = buf;
    return buf;
  }

  function gain(value) {
    var g = ctx.createGain();
    g.gain.value = value;
    return g;
  }

  function buildAmbient() {
    // 三个低音构成一个很轻的持续音
    [55, 82.5, 110].forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      var g = gain(0.016 / (i + 1));
      osc.connect(g).connect(master);
      osc.start();
    });

    // 空气声：低频过滤的白噪
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer(4);
    src.loop = true;
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 380;
    var g = gain(0.022);
    src.connect(lp).connect(g).connect(master);
    src.start();
  }

  function init() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = enabled() ? 0.6 : 0;
      master.connect(ctx.destination);
      buildAmbient();
      return true;
    } catch (e) {
      return false;
    }
  }

  function start() {
    if (!enabled()) return;
    if (!init()) return;
    if (ctx.state === 'suspended') ctx.resume();
    started = true;
  }

  function blip(name) {
    if (!ctx || !started || !enabled()) return;
    var t = ctx.currentTime;

    if (name === 'type') {
      var src = ctx.createBufferSource();
      src.buffer = noiseBuffer(0.08);
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2100;
      bp.Q.value = 0.9;
      var g = gain(0);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.035, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      src.connect(bp).connect(g).connect(master);
      src.start(t);
      src.stop(t + 0.06);
      return;
    }

    if (name === 'choice') {
      var osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, t);
      osc.frequency.exponentialRampToValueAtTime(780, t + 0.09);
      var og = gain(0);
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      osc.connect(og).connect(master);
      osc.start(t);
      osc.stop(t + 0.14);
      return;
    }

    if (name === 'paper') {
      var ps = ctx.createBufferSource();
      ps.buffer = noiseBuffer(0.3);
      var hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1100;
      var pg = gain(0);
      pg.gain.setValueAtTime(0.0001, t);
      pg.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
      pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      ps.connect(hp).connect(pg).connect(master);
      ps.start(t);
      ps.stop(t + 0.2);
      return;
    }

    if (name === 'stamp') {
      var thud = ctx.createOscillator();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(120, t);
      thud.frequency.exponentialRampToValueAtTime(48, t + 0.18);
      var tg = gain(0);
      tg.gain.setValueAtTime(0.0001, t);
      tg.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
      tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      thud.connect(tg).connect(master);
      thud.start(t);
      thud.stop(t + 0.24);

      var ns = ctx.createBufferSource();
      ns.buffer = noiseBuffer(0.12);
      var nf = ctx.createBiquadFilter();
      nf.type = 'lowpass';
      nf.frequency.value = 900;
      var ng = gain(0);
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.exponentialRampToValueAtTime(0.06, t + 0.006);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      ns.connect(nf).connect(ng).connect(master);
      ns.start(t);
      ns.stop(t + 0.1);
      return;
    }

    if (name === 'wrong') {
      var w = ctx.createOscillator();
      w.type = 'sawtooth';
      w.frequency.setValueAtTime(150, t);
      w.frequency.exponentialRampToValueAtTime(82, t + 0.2);
      var wf = ctx.createBiquadFilter();
      wf.type = 'lowpass';
      wf.frequency.value = 420;
      var wg = gain(0);
      wg.gain.setValueAtTime(0.0001, t);
      wg.gain.exponentialRampToValueAtTime(0.07, t + 0.01);
      wg.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      w.connect(wf).connect(wg).connect(master);
      w.start(t);
      w.stop(t + 0.26);
      return;
    }

    if (name === 'chapter') {
      [196, 294].forEach(function (freq, i) {
        var o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq;
        var og2 = gain(0);
        og2.gain.setValueAtTime(0.0001, t);
        og2.gain.exponentialRampToValueAtTime(0.055 / (i + 1), t + 0.06);
        og2.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
        o.connect(og2).connect(master);
        o.start(t);
        o.stop(t + 1.5);
      });
    }
  }

  function toggle() {
    var on = !enabled();
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) { /* 忽略 */ }
    if (!init()) return on;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.linearRampToValueAtTime(on ? 0.6 : 0, t + 0.25);
    if (on && ctx.state === 'suspended') ctx.resume();
    return on;
  }

  window.GameAudio = {
    start: start,
    sfx: blip,
    toggle: toggle,
    isOn: enabled,
  };
})();
