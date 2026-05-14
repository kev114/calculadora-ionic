<template>
  <ion-page>
    <ion-content :fullscreen="true" class="calc-content">

      <div class="app-shell" :style="accentVars">

        <!-- ── Top bar ──────────────────────────────────────── -->
        <div class="top-bar">
          <div class="brand">
            <span class="brand-icon">∑</span>
            <span class="brand-name">CALCULUS PRO</span>
          </div>
          <div class="top-controls">
            <div class="pill-toggle">
              <button :class="['ptb', theme==='dark'&&'ptb-on']"  @click="setTheme('dark')">◑ Oscuro</button>
              <button :class="['ptb', theme==='light'&&'ptb-on']" @click="setTheme('light')">◌ Claro</button>
            </div>
            <div class="swatches">
              <div
                v-for="(c,i) in COLORS" :key="i"
                :class="['sw', colorIdx===i&&'sw-on']"
                :style="{ background: c.accent }"
                @click="pickColor(i)"
              />
            </div>
          </div>
        </div>

        <!-- ── Tab row ──────────────────────────────────────── -->
        <div class="tab-row">
          <button :class="['tab', activeTab==='calc'&&'tab-on']"  @click="activeTab='calc'">⌨ Calculadora</button>
          <button :class="['tab', activeTab==='graph'&&'tab-on']" @click="activeTab='graph'">📈 Graficador</button>
        </div>

        <!-- ══════════ CALCULATOR TAB ══════════════════════════ -->
        <div v-show="activeTab==='calc'" class="panel">

          <!-- Screen -->
          <div class="screen" :class="theme">
            <div class="scanlines" />
            <div class="expr-line">{{ exprLine }}</div>
            <div class="result-line" :class="isError?'err':''">{{ display }}</div>
          </div>

          <!-- Mode + DEG/RAD -->
          <div class="mode-row">
            <button :class="['mode-btn', mode==='basic'&&'mode-on']" @click="mode='basic'">Básica</button>
            <button :class="['mode-btn', mode==='sci'&&'mode-on']"   @click="mode='sci'">Científica</button>
            <button :class="['mode-btn', mode==='prog'&&'mode-on']"  @click="mode='prog'">Programador</button>
            <div class="deg-rad">
              <button :class="['dr-btn', angleMode==='DEG'&&'dr-on']" @click="angleMode='DEG'">DEG</button>
              <button :class="['dr-btn', angleMode==='RAD'&&'dr-on']" @click="angleMode='RAD'">RAD</button>
            </div>
          </div>

          <!-- ── SCIENTIFIC keypad ──────────────────────────── -->
          <div v-if="mode==='sci'" class="keypad sci-pad">
            <button class="btn fn2" @click="ins('sin(')">sin</button>
            <button class="btn fn2" @click="ins('cos(')">cos</button>
            <button class="btn fn2" @click="ins('tan(')">tan</button>
            <button class="btn fn2" @click="ins('asin(')">sin⁻¹</button>
            <button class="btn fn2" @click="ins('acos(')">cos⁻¹</button>
            <button class="btn fn2" @click="ins('atan(')">tan⁻¹</button>
            <button class="btn fn2" @click="ins('log(')">log</button>
            <button class="btn fn2" @click="ins('ln(')">ln</button>
            <button class="btn fn2" @click="ins('sqrt(')">√</button>
            <button class="btn fn2" @click="ins('**2')">x²</button>
            <button class="btn fn2" @click="ins('**')">xⁿ</button>
            <button class="btn fn2" @click="ins('abs(')">|x|</button>
            <button class="btn fn2" @click="ins('PI')">π</button>
            <button class="btn fn2" @click="ins('E')">e</button>
            <button class="btn fn2" @click="ins('fact(')">n!</button>
            <button class="btn fn2" @click="ins('(')"> ( </button>
            <button class="btn fn2" @click="ins(')')"> ) </button>
            <button class="btn fn2" @click="ins('%')">mod</button>
            <button v-for="r in basicRows" :key="r.label" :class="['btn', r.cls]" @click="r.action()">{{ r.label }}</button>
          </div>

          <!-- ── PROGRAMMER keypad ─────────────────────────── -->
          <div v-else-if="mode==='prog'" class="keypad prog-pad">
            <div class="base-row">
              <button :class="['base-btn', base==='HEX'&&'base-on']" @click="base='HEX'">HEX</button>
              <button :class="['base-btn', base==='DEC'&&'base-on']" @click="base='DEC'">DEC</button>
              <button :class="['base-btn', base==='OCT'&&'base-on']" @click="base='OCT'">OCT</button>
              <button :class="['base-btn', base==='BIN'&&'base-on']" @click="base='BIN'">BIN</button>
            </div>
            <div class="conversions" v-if="!isError && display!=='0'">
              <span>HEX: {{ convHex }}</span>
              <span>DEC: {{ convDec }}</span>
              <span>OCT: {{ convOct }}</span>
              <span>BIN: {{ convBin }}</span>
            </div>
            <div class="hex-grid">
              <button class="btn fn2" :disabled="base!=='HEX'" @click="ins('A')">A</button>
              <button class="btn fn2" :disabled="base!=='HEX'" @click="ins('B')">B</button>
              <button class="btn fn2" :disabled="base!=='HEX'" @click="ins('C')">C</button>
              <button class="btn fn2" :disabled="base!=='HEX'" @click="ins('D')">D</button>
              <button class="btn fn2" :disabled="base!=='HEX'" @click="ins('E')">E</button>
              <button class="btn fn2" :disabled="base!=='HEX'" @click="ins('F')">F</button>
            </div>
            <button v-for="r in basicRows" :key="r.label" :class="['btn', r.cls]" @click="r.action()">{{ r.label }}</button>
          </div>

          <!-- ── BASIC keypad ──────────────────────────────── -->
          <div v-else class="keypad basic-pad">
            <button v-for="r in basicRows" :key="r.label" :class="['btn', r.cls]" @click="r.action()">{{ r.label }}</button>
          </div>

        </div>

        <!-- ══════════ GRAPH TAB ════════════════════════════════ -->
        <div v-show="activeTab==='graph'" class="panel">

          <div class="graph-controls">
            <div class="fx-row">
              <span class="fx-label">f(x) =</span>
              <input v-model="fxInput" class="fx-input" placeholder="ej: sin(x)*x, x**2-4, cos(x)" @keydown.enter="plotGraph" />
              <button class="plot-btn" @click="plotGraph">Graficar</button>
            </div>
            <div class="range-row">
              <label>x min <input v-model.number="xMin"  type="number"                   class="range-in" /></label>
              <label>x max <input v-model.number="xMax"  type="number"                   class="range-in" /></label>
              <label>paso  <input v-model.number="xStep" type="number" step="0.01" min="0.001" class="range-in" /></label>
            </div>
            <div class="presets">
              <button v-for="p in presets" :key="p.label" class="preset-btn" @click="applyPreset(p)">{{ p.label }}</button>
            </div>
          </div>

          <canvas ref="graphCanvas" class="graph-canvas" />

          <div v-if="graphInfo"  class="graph-info">{{ graphInfo }}</div>
          <div v-if="graphError" class="graph-error">⚠ {{ graphError }}</div>

        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';

// ─── Palette ──────────────────────────────────────────────────────────────────
const COLORS = [
  { name:'Ámbar',   accent:'#e8a838', dark:'#b87a10' },
  { name:'Cian',    accent:'#38c8e8', dark:'#1090b0' },
  { name:'Verde',   accent:'#4acd6a', dark:'#2a8a42' },
  { name:'Rosa',    accent:'#e858a8', dark:'#a82870' },
  { name:'Violeta', accent:'#9a5ae8', dark:'#6228b0' },
  { name:'Coral',   accent:'#e86050', dark:'#a83030' },
];

const theme    = ref<'dark'|'light'>('dark');
const colorIdx = ref(0);

const accentVars = computed(() => ({
  '--acc':  COLORS[colorIdx.value].accent,
  '--acc2': COLORS[colorIdx.value].dark,
}));

function setTheme(t: 'dark'|'light') { theme.value = t; }
function pickColor(i: number)        { colorIdx.value = i; }

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const activeTab = ref<'calc'|'graph'>('calc');

// ─── Calculator ───────────────────────────────────────────────────────────────
const expr      = ref('');
const display   = ref('0');
const exprLine  = ref('');
const isError   = ref(false);
const mode      = ref<'basic'|'sci'|'prog'>('basic');
const angleMode = ref<'DEG'|'RAD'>('DEG');
const base      = ref<'HEX'|'DEC'|'OCT'|'BIN'>('DEC');

const convDec = computed(() => { try { return parseInt(display.value, 16).toString(10); }  catch { return '?'; } });
const convHex = computed(() => { try { return parseInt(display.value).toString(16).toUpperCase(); } catch { return '?'; } });
const convOct = computed(() => { try { return parseInt(display.value).toString(8);  }  catch { return '?'; } });
const convBin = computed(() => { try { return parseInt(display.value).toString(2);  }  catch { return '?'; } });

function ins(s: string) {
  if (display.value === '0' && /^\d/.test(s)) expr.value = s;
  else expr.value += s;
  display.value = expr.value || '0';
  isError.value = false;
}

function del() {
  expr.value    = expr.value.slice(0, -1);
  display.value = expr.value || '0';
  isError.value = false;
}

function clearAll() {
  expr.value = ''; display.value = '0'; exprLine.value = ''; isError.value = false;
}

function fact(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n <= 1) return 1;
  if (n > 170) return Infinity;
  return n * fact(n - 1);
}

function evaluate() {
  try {
    const D2R = Math.PI / 180;
    const R2D = 180 / Math.PI;
    const dSin  = (x: number) => Math.sin(x * D2R);
    const dCos  = (x: number) => Math.cos(x * D2R);
    const dTan  = (x: number) => Math.tan(x * D2R);
    const dAsin = (x: number) => Math.asin(x) * R2D;
    const dAcos = (x: number) => Math.acos(x) * R2D;
    const dAtan = (x: number) => Math.atan(x) * R2D;

    const useDeg = angleMode.value === 'DEG';

    let e = expr.value
      .replace(/\bPI\b/g,  String(Math.PI))
      .replace(/\bE\b/g,   String(Math.E))
      .replace(/\bsin\b/g,  useDeg ? '__dsin'  : 'Math.sin')
      .replace(/\bcos\b/g,  useDeg ? '__dcos'  : 'Math.cos')
      .replace(/\btan\b/g,  useDeg ? '__dtan'  : 'Math.tan')
      .replace(/\basin\b/g, useDeg ? '__dasin' : 'Math.asin')
      .replace(/\bacos\b/g, useDeg ? '__dacos' : 'Math.acos')
      .replace(/\batan\b/g, useDeg ? '__datan' : 'Math.atan')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\blog\b/g,  'Math.log10')
      .replace(/\bln\b/g,   'Math.log')
      .replace(/\babs\b/g,  'Math.abs')
      .replace(/\bfact\b/g, '__fact');

    // eslint-disable-next-line no-new-func
    const result = Function(
      '__dsin','__dcos','__dtan','__dasin','__dacos','__datan','__fact',
      `"use strict"; return (${e})`
    )(dSin, dCos, dTan, dAsin, dAcos, dAtan, fact);

    exprLine.value = expr.value + ' =';
    const r = Number(result);
    if (!isFinite(r)) { display.value = 'Error'; isError.value = true; return; }
    display.value = parseFloat(r.toPrecision(12)).toString();
    expr.value    = display.value;
    isError.value = false;
  } catch {
    isError.value = true;
    display.value = 'Error';
  }
}

const basicRows = computed(() => [
  { label:'AC',  cls:'btn fn',  action: clearAll },
  { label:'⌫',   cls:'btn fn',  action: del },
  { label:'%',   cls:'btn fn',  action: () => ins('%') },
  { label:'÷',   cls:'btn op',  action: () => ins('/') },
  { label:'7',   cls:'btn num', action: () => ins('7') },
  { label:'8',   cls:'btn num', action: () => ins('8') },
  { label:'9',   cls:'btn num', action: () => ins('9') },
  { label:'×',   cls:'btn op',  action: () => ins('*') },
  { label:'4',   cls:'btn num', action: () => ins('4') },
  { label:'5',   cls:'btn num', action: () => ins('5') },
  { label:'6',   cls:'btn num', action: () => ins('6') },
  { label:'−',   cls:'btn op',  action: () => ins('-') },
  { label:'1',   cls:'btn num', action: () => ins('1') },
  { label:'2',   cls:'btn num', action: () => ins('2') },
  { label:'3',   cls:'btn num', action: () => ins('3') },
  { label:'+',   cls:'btn op',  action: () => ins('+') },
  { label:'+/−', cls:'btn fn',  action: () => { expr.value = String(-parseFloat(display.value)); display.value = expr.value; } },
  { label:'0',   cls:'btn num', action: () => ins('0') },
  { label:'.',   cls:'btn num', action: () => ins('.') },
  { label:'=',   cls:'btn eq',  action: evaluate },
]);

// ─── Keyboard ─────────────────────────────────────────────────────────────────
function onKey(e: KeyboardEvent) {
  if (activeTab.value !== 'calc') return;
  const map: Record<string, () => void> = {
    Enter: evaluate, '=': evaluate,
    Backspace: del,  Escape: clearAll,
    '+': () => ins('+'), '-': () => ins('-'),
    '*': () => ins('*'), '/': () => ins('/'),
    '.': () => ins('.'), '(': () => ins('('), ')': () => ins(')'),
  };
  if (map[e.key])           { map[e.key](); e.preventDefault(); }
  else if (/^[0-9]$/.test(e.key)) { ins(e.key); e.preventDefault(); }
}

// ─── Graphing ─────────────────────────────────────────────────────────────────
const graphCanvas = ref<HTMLCanvasElement | null>(null);
const fxInput  = ref('sin(x)');
const xMin     = ref(-10);
const xMax     = ref(10);
const xStep    = ref(0.05);
const graphInfo  = ref('');
const graphError = ref('');

const presets = [
  { label:'sin(x)',    fx:'sin(x)',           xMin:-6.28, xMax:6.28 },
  { label:'x²',       fx:'x**2',             xMin:-5,    xMax:5    },
  { label:'1/x',      fx:'1/x',              xMin:-10,   xMax:10   },
  { label:'√x',       fx:'Math.sqrt(x)',      xMin:0,     xMax:20   },
  { label:'eˣ',       fx:'Math.exp(x)',       xMin:-3,    xMax:3    },
  { label:'ln(x)',    fx:'Math.log(x)',        xMin:0.01,  xMax:10   },
  { label:'x³−3x',   fx:'x**3-3*x',          xMin:-3,    xMax:3    },
  { label:'sin(x)/x', fx:'sin(x)/x',          xMin:-15,   xMax:15   },
];

function applyPreset(p: typeof presets[0]) {
  fxInput.value = p.fx; xMin.value = p.xMin; xMax.value = p.xMax;
  nextTick(plotGraph);
}

function evalFx(x: number): number {
  let e = fxInput.value
    .replace(/\bPI\b/g,   String(Math.PI))
    .replace(/\bE\b/g,    String(Math.E))
    .replace(/\bsin\b/g,  'Math.sin')
    .replace(/\bcos\b/g,  'Math.cos')
    .replace(/\btan\b/g,  'Math.tan')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\babs\b/g,  'Math.abs')
    .replace(/\blog\b/g,  'Math.log10')
    .replace(/\bln\b/g,   'Math.log')
    .replace(/\bexp\b/g,  'Math.exp');
  // eslint-disable-next-line no-new-func
  return Function('x', `"use strict"; return (${e})`)(x);
}

function plotGraph() {
  graphError.value = ''; graphInfo.value = '';
  const canvas = graphCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.offsetWidth  || 340;
  const H = canvas.offsetHeight || 300;
  canvas.width = W; canvas.height = H;

  const PAD    = 44;
  const isDark = theme.value === 'dark';
  const acc    = COLORS[colorIdx.value].accent;

  ctx.fillStyle = isDark ? '#0d1117' : '#f5f5f0';
  ctx.fillRect(0, 0, W, H);

  // Sample points
  const pts: { x: number; y: number }[] = [];
  let yMin = Infinity, yMax = -Infinity;
  const step = Math.max(xStep.value, 0.001);
  for (let xi = xMin.value; xi <= xMax.value + step * 0.5; xi += step) {
    try {
      const y = evalFx(xi);
      if (isFinite(y)) { pts.push({ x: xi, y }); yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
      else pts.push({ x: xi, y: NaN });
    } catch { pts.push({ x: xi, y: NaN }); }
  }

  if (!pts.some(p => isFinite(p.y))) { graphError.value = 'No se pudo evaluar f(x) en el rango dado.'; return; }

  const yRange = yMax - yMin || 1;
  yMin -= yRange * 0.12; yMax += yRange * 0.12;

  const cx = (x: number) => PAD + ((x - xMin.value) / (xMax.value - xMin.value)) * (W - PAD * 2);
  const cy = (y: number) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - PAD * 2);

  const gridCol  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const axisCol  = isDark ? 'rgba(255,255,255,0.2)'  : 'rgba(0,0,0,0.3)';
  const labelCol = isDark ? 'rgba(255,255,255,0.4)'  : 'rgba(0,0,0,0.5)';

  // Grid lines
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.strokeStyle = gridCol; ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    const gx = PAD + (i / 8) * (W - PAD * 2);
    ctx.beginPath(); ctx.moveTo(gx, PAD); ctx.lineTo(gx, H - PAD); ctx.stroke();
    ctx.fillStyle = labelCol; ctx.textAlign = 'center';
    ctx.fillText((xMin.value + (i / 8) * (xMax.value - xMin.value)).toFixed(1), gx, H - PAD + 14);
  }
  for (let i = 0; i <= 6; i++) {
    const gy = PAD + (i / 6) * (H - PAD * 2);
    ctx.beginPath(); ctx.moveTo(PAD, gy); ctx.lineTo(W - PAD, gy); ctx.stroke();
    ctx.fillStyle = labelCol; ctx.textAlign = 'right';
    ctx.fillText((yMax - (i / 6) * (yMax - yMin)).toFixed(2), PAD - 6, gy + 4);
  }

  // Zero axes
  ctx.strokeStyle = axisCol; ctx.lineWidth = 1.5;
  const zx = cx(0); const zy = cy(0);
  if (zx >= PAD && zx <= W - PAD) { ctx.beginPath(); ctx.moveTo(zx, PAD); ctx.lineTo(zx, H - PAD); ctx.stroke(); }
  if (zy >= PAD && zy <= H - PAD) { ctx.beginPath(); ctx.moveTo(PAD, zy); ctx.lineTo(W - PAD, zy); ctx.stroke(); }

  // Curve
  ctx.strokeStyle = acc; ctx.lineWidth = 2.5;
  ctx.shadowColor = acc; ctx.shadowBlur = 8;
  ctx.beginPath();
  let drawing = false;
  for (const p of pts) {
    if (!isFinite(p.y)) { drawing = false; continue; }
    const px = cx(p.x); const py = cy(p.y);
    if (!drawing) { ctx.moveTo(px, py); drawing = true; } else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Border
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(PAD, PAD, W - PAD * 2, H - PAD * 2);

  graphInfo.value = `f(x) = ${fxInput.value}  |  x ∈ [${xMin.value}, ${xMax.value}]  |  y ∈ [${yMin.toFixed(3)}, ${yMax.toFixed(3)}]`;
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('keydown', onKey);
  nextTick(plotGraph);
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

watch(activeTab, v => { if (v === 'graph') nextTick(plotGraph); });
watch([colorIdx, theme], () => { if (activeTab.value === 'graph') nextTick(plotGraph); });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── Tokens ──────────────────────────────────────────────────── */
:root { --acc: #e8a838; --acc2: #b87a10; }

/* ── Ion content ─────────────────────────────────────────────── */
.calc-content { --background: #0e1012; }

/* ── Shell ───────────────────────────────────────────────────── */
.app-shell {
  min-height: 100%;
  background: #0e1012;
  font-family: 'DM Sans', sans-serif;
  padding-bottom: 32px;
  transition: background 0.3s;
}

/* ── Top bar ─────────────────────────────────────────────────── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px 16px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.brand { display: flex; align-items: center; gap: 8px; }

.brand-icon {
  font-size: 22px;
  color: var(--acc);
  line-height: 1;
}

.brand-name {
  font-family: 'Orbitron', monospace;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.85);
}

.top-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.pill-toggle {
  display: flex;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 3px; gap: 2px;
}

.ptb {
  padding: 4px 12px;
  border: none; border-radius: 16px;
  font-size: 11px; font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: rgba(255,255,255,0.4);
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
}
.ptb.ptb-on { background: rgba(255,255,255,0.14); color: #fff; }

.swatches { display: flex; gap: 5px; align-items: center; }

.sw {
  width: 18px; height: 18px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.15s, border-color 0.15s;
}
.sw:hover  { transform: scale(1.25); }
.sw.sw-on  { border-color: #fff; }

/* ── Tabs ────────────────────────────────────────────────────── */
.tab-row { display: flex; padding: 12px 16px 0; gap: 4px; }

.tab {
  padding: 8px 20px;
  border: 1px solid rgba(255,255,255,0.1); border-bottom: none;
  border-radius: 10px 10px 0 0;
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.4);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.tab.tab-on { background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.18); }

/* ── Panels ──────────────────────────────────────────────────── */
.panel {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0 12px 12px 12px;
  margin: 0 16px 16px;
  padding: 16px;
}

/* ── Screen ──────────────────────────────────────────────────── */
.screen {
  border-radius: 10px;
  padding: 14px 18px 12px;
  margin-bottom: 14px;
  position: relative; overflow: hidden;
  transition: background 0.3s;
}
.screen.dark {
  background: #111a0e;
  border: 1px solid rgba(0,0,0,0.5);
  box-shadow: inset 0 3px 12px rgba(0,0,0,0.6), inset 0 1px 3px rgba(0,0,0,0.3);
}
.screen.light {
  background: #d8edbe;
  border: 1px solid rgba(0,0,0,0.2);
  box-shadow: inset 0 3px 8px rgba(0,0,0,0.15);
}

.scanlines {
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px);
}

.expr-line {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; color: rgba(140,200,60,0.65);
  text-align: right; height: 18px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.screen.light .expr-line { color: rgba(40,90,10,0.55); }

.result-line {
  font-family: 'Orbitron', monospace;
  font-size: 32px; font-weight: 700;
  color: #c8e87a;
  text-align: right;
  text-shadow: 0 0 18px rgba(140,200,60,0.4);
  line-height: 1; margin-top: 4px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  transition: color 0.3s;
}
.screen.light .result-line { color: #2a5810; text-shadow: none; }
.result-line.err            { color: #e85a5a; text-shadow: 0 0 12px rgba(232,90,90,0.4); }

/* ── Mode row ────────────────────────────────────────────────── */
.mode-row {
  display: flex; gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap; align-items: center;
}

.mode-btn {
  padding: 5px 14px;
  border: 1px solid rgba(255,255,255,0.12); border-radius: 20px;
  background: transparent; color: rgba(255,255,255,0.4);
  font-size: 12px; font-family: 'DM Sans', sans-serif;
  cursor: pointer; transition: all 0.2s;
}
.mode-btn.mode-on { background: var(--acc); border-color: var(--acc); color: #000; font-weight: 600; }

.deg-rad {
  display: flex; margin-left: auto;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px; padding: 2px;
}
.dr-btn {
  padding: 3px 10px; border: none; border-radius: 14px;
  font-size: 11px; font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer; background: transparent; color: rgba(255,255,255,0.35);
  transition: all 0.2s;
}
.dr-btn.dr-on { background: rgba(255,255,255,0.15); color: #fff; }

/* ── Keypads ─────────────────────────────────────────────────── */
.keypad        { display: grid; gap: 8px; }
.basic-pad     { grid-template-columns: repeat(4, 1fr); }
.sci-pad       { grid-template-columns: repeat(6, 1fr); }
.prog-pad      { grid-template-columns: repeat(4, 1fr); }

/* ── Buttons ─────────────────────────────────────────────────── */
.btn {
  height: 52px;
  border: none; border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px; font-weight: 500;
  cursor: pointer;
  transition: transform 0.08s, filter 0.1s;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.btn:hover  { filter: brightness(1.12); }
.btn:active { transform: translateY(3px); }

.btn.num {
  background: #2e3238; color: #e8e8e8;
  box-shadow: 0 5px 0 #1a1d22, 0 6px 8px rgba(0,0,0,0.4), inset 0 1px 0 #3e4248;
}
.btn.num:active { box-shadow: 0 2px 0 #1a1d22, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 #3e4248; }

.btn.fn {
  background: #3a3f48; color: #c0c8d0; font-size: 14px;
  box-shadow: 0 5px 0 #22262c, 0 6px 8px rgba(0,0,0,0.4), inset 0 1px 0 #4a5058;
}
.btn.fn:active { box-shadow: 0 2px 0 #22262c, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 #4a5058; }

.btn.fn2 {
  height: 44px;
  background: #1e2328; color: var(--acc);
  font-size: 12px; font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  box-shadow: 0 4px 0 #12151a, 0 5px 6px rgba(0,0,0,0.35), inset 0 1px 0 #2e3338;
  transition: background 0.3s, color 0.3s, transform 0.08s, filter 0.1s;
}
.btn.fn2:active   { box-shadow: 0 1px 0 #12151a, 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 #2e3338; }
.btn.fn2:disabled { opacity: 0.22; cursor: not-allowed; }

.btn.op {
  background: var(--acc); color: #000; font-weight: 700;
  box-shadow: 0 5px 0 var(--acc2), 0 6px 8px rgba(0,0,0,0.4), inset 0 1px 0 color-mix(in srgb, var(--acc) 80%, white 20%);
  transition: background 0.3s, box-shadow 0.3s, transform 0.08s, filter 0.1s;
}
.btn.op:active { box-shadow: 0 2px 0 var(--acc2), 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 color-mix(in srgb, var(--acc) 80%, white 20%); }

.btn.eq {
  background: var(--acc); color: #000; font-size: 22px; font-weight: 800;
  box-shadow: 0 5px 0 var(--acc2), 0 6px 8px rgba(0,0,0,0.4), inset 0 1px 0 color-mix(in srgb, var(--acc) 70%, white 30%);
  transition: background 0.3s, box-shadow 0.3s, transform 0.08s, filter 0.1s;
}
.btn.eq:active { box-shadow: 0 2px 0 var(--acc2), 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 color-mix(in srgb, var(--acc) 70%, white 30%); }

/* Programmer extras */
.base-row {
  grid-column: 1 / -1; display: flex; gap: 6px; margin-bottom: 4px;
}
.base-btn {
  flex: 1; padding: 6px;
  border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
  background: transparent; color: rgba(255,255,255,0.4);
  font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.base-btn.base-on { background: var(--acc); border-color: var(--acc); color: #000; }

.conversions {
  grid-column: 1 / -1;
  display: flex; gap: 12px; flex-wrap: wrap;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: rgba(255,255,255,0.45);
  padding: 6px 4px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 4px;
}

.hex-grid {
  grid-column: 1 / -1;
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px;
  margin-bottom: 4px;
}

/* ── Graph panel ─────────────────────────────────────────────── */
.graph-controls { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }

.fx-row { display: flex; align-items: center; gap: 8px; }

.fx-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px; font-weight: 600;
  color: var(--acc); white-space: nowrap;
}

.fx-input {
  flex: 1;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
  color: #e8e8e8; padding: 8px 12px;
  font-family: 'JetBrains Mono', monospace; font-size: 14px;
  outline: none; transition: border-color 0.2s;
}
.fx-input:focus         { border-color: var(--acc); }
.fx-input::placeholder  { color: rgba(255,255,255,0.25); }

.plot-btn {
  padding: 8px 18px;
  background: var(--acc); border: none; border-radius: 8px;
  color: #000; font-weight: 700; font-family: 'DM Sans', sans-serif; font-size: 13px;
  cursor: pointer; transition: filter 0.15s; white-space: nowrap;
}
.plot-btn:hover  { filter: brightness(1.1); }
.plot-btn:active { filter: brightness(0.9); }

.range-row { display: flex; gap: 12px; flex-wrap: wrap; }

.range-row label {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: rgba(255,255,255,0.45);
  font-family: 'JetBrains Mono', monospace;
}

.range-in {
  width: 72px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 6px;
  color: #e8e8e8; padding: 4px 8px;
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
  outline: none;
}
.range-in:focus { border-color: var(--acc); }

.presets { display: flex; flex-wrap: wrap; gap: 6px; }

.preset-btn {
  padding: 4px 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 16px;
  color: rgba(255,255,255,0.55);
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  cursor: pointer; transition: all 0.2s;
}
.preset-btn:hover { background: var(--acc); border-color: var(--acc); color: #000; }

.graph-canvas { width: 100%; height: 300px; border-radius: 10px; display: block; }

.graph-info {
  margin-top: 10px;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: rgba(255,255,255,0.35); text-align: center;
}

.graph-error { margin-top: 8px; font-size: 12px; color: #e85a5a; text-align: center; }
</style>
