<template>
  <ion-page>
    <ion-content :fullscreen="true" class="calc-content">
      <div class="app-shell" :class="[theme === 'dark' ? 'theme-dark' : 'theme-light']" :style="accentVars">
        <!-- Top bar -->
        <div class="top-bar">
          <div class="brand">
            <span class="brand-icon">∑</span>
            <span class="brand-name">CALCULUS PRO</span>
          </div>
          <div class="top-controls">
            <div class="pill-toggle">
              <button :class="['ptb', theme==='dark'&&'ptb-on']" @click="setTheme('dark')">🌙 Oscuro</button>
              <button :class="['ptb', theme==='light'&&'ptb-on']" @click="setTheme('light')">☀️ Claro</button>
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

        <!-- Tabs -->
        <div class="tab-row">
          <button :class="['tab', activeTab==='calc'&&'tab-on']" @click="activeTab='calc'">🧮 Calculadora</button>
          <button :class="['tab', activeTab==='graph'&&'tab-on']" @click="activeTab='graph'">📈 Graficador</button>
          <button :class="['tab', activeTab==='matrix'&&'tab-on']" @click="activeTab='matrix'">🔢 Matrices</button>
          <button :class="['tab', activeTab==='fraction'&&'tab-on']" @click="activeTab='fraction'">½ Fracciones</button>
          <button :class="['tab', activeTab==='calculus'&&'tab-on']" @click="activeTab='calculus'">📊 Cálculo</button>
        </div>

        <!-- ========== CALCULATOR TAB ========== -->
        <div v-show="activeTab==='calc'" class="panel">
          <div class="screen" :class="theme">
            <div class="scanlines" />
            <div class="expr-line">{{ exprLine || ' ' }}</div>
            <div class="result-line" :class="isError?'err':''">{{ display }}</div>
          </div>

          <div class="mode-row">
            <button :class="['mode-btn', mode==='basic'&&'mode-on']" @click="mode='basic'">📐 Básica</button>
            <button :class="['mode-btn', mode==='sci'&&'mode-on']" @click="mode='sci'">🔬 Científica</button>
            <button :class="['mode-btn', mode==='prog'&&'mode-on']" @click="mode='prog'">💻 Programador</button>
            <div class="deg-rad">
              <button :class="['dr-btn', angleMode==='DEG'&&'dr-on']" @click="angleMode='DEG'">DEG</button>
              <button :class="['dr-btn', angleMode==='RAD'&&'dr-on']" @click="angleMode='RAD'">RAD</button>
            </div>
          </div>

          <!-- Modo científico -->
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
            <button class="btn fn2" @click="ins('^2')">x²</button>
            <button class="btn fn2" @click="ins('^')">xⁿ</button>
            <button class="btn fn2" @click="ins('abs(')">|x|</button>
            <button class="btn fn2" @click="ins('PI')">π</button>
            <button class="btn fn2" @click="ins('E')">e</button>
            <button class="btn fn2" @click="ins('fact(')">n!</button>
            <button class="btn fn2" @click="ins('(')">(</button>
            <button class="btn fn2" @click="ins(')')">)</button>
            <button class="btn fn2" @click="ins('%')">mod</button>
            <button class="btn fn" @click="clearAll">AC</button>
            <button class="btn fn" @click="del">⌫</button>
            <button class="btn num" @click="ins('7')">7</button>
            <button class="btn num" @click="ins('8')">8</button>
            <button class="btn num" @click="ins('9')">9</button>
            <button class="btn op"  @click="ins('/')">÷</button>
            <button class="btn num" @click="ins('4')">4</button>
            <button class="btn num" @click="ins('5')">5</button>
            <button class="btn num" @click="ins('6')">6</button>
            <button class="btn op"  @click="ins('*')">×</button>
            <button class="btn num" @click="ins('1')">1</button>
            <button class="btn num" @click="ins('2')">2</button>
            <button class="btn num" @click="ins('3')">3</button>
            <button class="btn op"  @click="ins('+')">+</button>
            <button class="btn fn"  @click="toggleSign">±</button>
            <button class="btn num" @click="ins('0')">0</button>
            <button class="btn num" @click="ins('.')">.</button>
            <button class="btn eq"  @click="evaluate">=</button>
          </div>

          <!-- Modo programador -->
          <div v-else-if="mode==='prog'" class="keypad prog-pad">
            <div class="base-row">
              <button :class="['base-btn', base==='HEX'&&'base-on']" @click="base='HEX'">HEX</button>
              <button :class="['base-btn', base==='DEC'&&'base-on']" @click="base='DEC'">DEC</button>
              <button :class="['base-btn', base==='OCT'&&'base-on']" @click="base='OCT'">OCT</button>
              <button :class="['base-btn', base==='BIN'&&'base-on']" @click="base='BIN'">BIN</button>
            </div>
            <div class="conversions" v-if="!isError && display!=='0'">
              <span>🔴 HEX: {{ convHex }}</span>
              <span>🔵 DEC: {{ convDec }}</span>
              <span>🟢 OCT: {{ convOct }}</span>
              <span>⚫ BIN: {{ convBin }}</span>
            </div>
            <div class="hex-grid">
              <button class="btn fn2" :disabled="base!=='HEX'" @click="ins('A')">A</button>
              <button class="btn fn2" :disabled="base!=='HEX'" @click="ins('B')">B</button>
              <button class="btn fn2" :disabled="base!=='HEX'" @click="ins('C')">C</button>
              <button class="btn fn2" :disabled="base!=='HEX'" @click="ins('D')">D</button>
              <button class="btn fn2" :disabled="base!=='HEX'" @click="ins('E')">E</button>
              <button class="btn fn2" :disabled="base!=='HEX'" @click="ins('F')">F</button>
            </div>
            <div class="basic-grid">
              <button v-for="r in basicRows" :key="r.label" :class="['btn', r.cls]" @click="r.action()">{{ r.label }}</button>
            </div>
          </div>

          <!-- Modo básico -->
          <div v-else class="keypad basic-pad">
            <button v-for="r in basicRows" :key="r.label" :class="['btn', r.cls]" @click="r.action()">{{ r.label }}</button>
          </div>
        </div>

        <!-- ========== GRAPH TAB ========== -->
        <div v-show="activeTab==='graph'" class="panel">
          <div class="graph-controls">
            <div class="fx-row">
              <span class="fx-label">📊 f(x) =</span>
              <input v-model="fxInput" class="fx-input" placeholder="ej: 2x+1, sin(x), e^x, ln(x)" @keydown.enter="plotGraph" />
              <button class="plot-btn" @click="plotGraph">📈 Graficar</button>
            </div>
            <div class="range-row">
              <label>📉 x min <input v-model.number="xMin" type="number" class="range-in" /></label>
              <label>📈 x max <input v-model.number="xMax" type="number" class="range-in" /></label>
              <label>⚙️ paso <input v-model.number="xStep" type="number" step="0.01" min="0.001" class="range-in" /></label>
            </div>
            <div class="presets">
              <button v-for="p in presets" :key="p.label" class="preset-btn" @click="applyPreset(p)">{{ p.label }}</button>
            </div>
          </div>
          <canvas ref="graphCanvas" class="graph-canvas" />
          <div v-if="graphInfo" class="graph-info">{{ graphInfo }}</div>
          <div v-if="graphError" class="graph-error">⚠️ {{ graphError }}</div>
        </div>

        <!-- ========== MATRIX TAB ========== -->
        <div v-show="activeTab==='matrix'" class="panel">
          <div class="matrix-controls">
            <div class="matrix-size-row">
              <label>Filas A: <input v-model.number="matA.rows" type="number" min="1" max="4" class="range-in" @change="resizeMatrix('A')" /></label>
              <label>Cols A: <input v-model.number="matA.cols" type="number" min="1" max="4" class="range-in" @change="resizeMatrix('A')" /></label>
              <label>Filas B: <input v-model.number="matB.rows" type="number" min="1" max="4" class="range-in" @change="resizeMatrix('B')" /></label>
              <label>Cols B: <input v-model.number="matB.cols" type="number" min="1" max="4" class="range-in" @change="resizeMatrix('B')" /></label>
            </div>
            <div class="matrices-row">
              <div class="mat-block">
                <div class="mat-label">Matriz A</div>
                <div class="mat-grid" :style="`grid-template-columns: repeat(${matA.cols}, 1fr)`">
                  <input
                    v-for="(_, i) in matA.data" :key="'a'+i"
                    v-model.number="matA.data[i]"
                    type="number"
                    class="mat-cell"
                    placeholder="0"
                  />
                </div>
              </div>
              <div class="mat-block">
                <div class="mat-label">Matriz B</div>
                <div class="mat-grid" :style="`grid-template-columns: repeat(${matB.cols}, 1fr)`">
                  <input
                    v-for="(_, i) in matB.data" :key="'b'+i"
                    v-model.number="matB.data[i]"
                    type="number"
                    class="mat-cell"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div class="mat-ops">
              <button class="mat-op-btn" @click="matOp('add')">A + B</button>
              <button class="mat-op-btn" @click="matOp('sub')">A − B</button>
              <button class="mat-op-btn" @click="matOp('mul')">A × B</button>
              <button class="mat-op-btn" @click="matOp('transA')">Aᵀ</button>
              <button class="mat-op-btn" @click="matOp('transB')">Bᵀ</button>
              <button class="mat-op-btn" @click="matOp('detA')">det(A)</button>
              <button class="mat-op-btn" @click="matOp('detB')">det(B)</button>
              <button class="mat-op-btn" @click="matOp('invA')">A⁻¹</button>
            </div>
          </div>
          <div v-if="matResult !== null" class="mat-result-block">
            <div class="mat-label">Resultado</div>
            <template v-if="typeof matResult === 'number'">
              <div class="mat-scalar">{{ matResult }}</div>
            </template>
            <template v-else>
              <div
                class="mat-grid mat-result-grid"
                :style="`grid-template-columns: repeat(${matResultCols}, 1fr)`"
              >
                <div v-for="(v, i) in (matResult as number[])" :key="i" class="mat-cell-out">
                  {{ formatNum(v) }}
                </div>
              </div>
            </template>
          </div>
          <div v-if="matError" class="graph-error">⚠️ {{ matError }}</div>
        </div>

        <!-- ========== FRACTIONS TAB ========== -->
        <div v-show="activeTab==='fraction'" class="panel">
          <div class="frac-section">
            <div class="frac-inputs">
              <div class="frac-display">
                <input v-model.number="frac1.num" type="number" class="frac-in" placeholder="Num" />
                <div class="frac-line"></div>
                <input v-model.number="frac1.den" type="number" class="frac-in" placeholder="Den" />
              </div>
              <div class="frac-op-col">
                <button v-for="op in fracOps" :key="op.sym"
                  :class="['frac-op-btn', fracOp===op.sym&&'frac-op-on']"
                  @click="fracOp=op.sym">{{ op.sym }}</button>
              </div>
              <div class="frac-display">
                <input v-model.number="frac2.num" type="number" class="frac-in" placeholder="Num" />
                <div class="frac-line"></div>
                <input v-model.number="frac2.den" type="number" class="frac-in" placeholder="Den" />
              </div>
              <button class="plot-btn" @click="calcFrac">=</button>
            </div>
            <div v-if="fracResult" class="frac-result-block">
              <div class="frac-result-label">Resultado simplificado</div>
              <div class="frac-result-display">
                <template v-if="fracResult.den === 1">
                  <span class="frac-big">{{ fracResult.num }}</span>
                </template>
                <template v-else>
                  <div class="frac-display frac-result-frac">
                    <span class="frac-big">{{ fracResult.num }}</span>
                    <div class="frac-line"></div>
                    <span class="frac-big">{{ fracResult.den }}</span>
                  </div>
                </template>
                <span class="frac-decimal">≈ {{ (fracResult.num / fracResult.den).toFixed(6) }}</span>
              </div>
            </div>
            <div v-if="fracError" class="graph-error">⚠️ {{ fracError }}</div>

            <div class="frac-simplify-section">
              <div class="mat-label" style="margin-bottom:12px">Simplificar fracción</div>
              <div class="frac-inputs">
                <div class="frac-display">
                  <input v-model.number="simpFrac.num" type="number" class="frac-in" placeholder="Num" />
                  <div class="frac-line"></div>
                  <input v-model.number="simpFrac.den" type="number" class="frac-in" placeholder="Den" />
                </div>
                <button class="plot-btn" @click="simplifyFrac">Simplificar</button>
              </div>
              <div v-if="simpResult" class="frac-result-block">
                <div class="frac-result-display">
                  <div class="frac-display frac-result-frac">
                    <span class="frac-big">{{ simpResult.num }}</span>
                    <div class="frac-line"></div>
                    <span class="frac-big">{{ simpResult.den }}</span>
                  </div>
                  <span class="frac-decimal">MCD: {{ simpResult.gcd }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== CALCULUS TAB (Derivadas e Integrales) ========== -->
        <div v-show="activeTab==='calculus'" class="panel">
          <div class="graph-controls">
            <div class="fx-row">
              <span class="fx-label">📐 f(x) =</span>
              <input v-model="calculusFx" class="fx-input" placeholder="ej: x^2, sin(x), e^x, ln(x)" @keydown.enter="runCalculus" />
            </div>
            <div class="calculus-mode-row">
              <button :class="['mode-btn', calculusMode==='deriv'&&'mode-on']" @click="calculusMode='deriv'">f'(x₀)</button>
              <button :class="['mode-btn', calculusMode==='deriv2'&&'mode-on']" @click="calculusMode='deriv2'">f''(x₀)</button>
              <button :class="['mode-btn', calculusMode==='integral'&&'mode-on']" @click="calculusMode='integral'">∫ f(x) dx</button>
            </div>

            <div v-if="calculusMode === 'deriv' || calculusMode === 'deriv2'" class="range-row">
              <label>x₀ = <input v-model.number="calculusX0" type="number" class="range-in" step="any" /></label>
            </div>
            <div v-if="calculusMode === 'integral'" class="range-row">
              <label>a = <input v-model.number="calculusA" type="number" class="range-in" step="any" /></label>
              <label>b = <input v-model.number="calculusB" type="number" class="range-in" step="any" /></label>
            </div>

            <button class="plot-btn" @click="runCalculus">Calcular</button>
          </div>

          <div v-if="calculusResult !== null" class="calculus-result-block">
            <div class="mat-label">Resultado</div>
            <div class="calculus-result-value">{{ calculusResult }}</div>
          </div>
          <div v-if="calculusError" class="graph-error">⚠️ {{ calculusError }}</div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';

// ─── Paleta de colores ─────────────────────────────────────────
const COLORS = [
  { name:'Ámbar',   accent:'#f59e0b', dark:'#d97706' },
  { name:'Cian',    accent:'#06b6d4', dark:'#0891b2' },
  { name:'Verde',   accent:'#10b981', dark:'#059669' },
  { name:'Rosa',    accent:'#ec4899', dark:'#db2777' },
  { name:'Violeta', accent:'#8b5cf6', dark:'#7c3aed' },
  { name:'Coral',   accent:'#f97316', dark:'#ea580c' },
];

const theme    = ref<'dark'|'light'>('dark');
const colorIdx = ref(0);

const accentVars = computed(() => ({
  '--acc':  COLORS[colorIdx.value].accent,
  '--acc2': COLORS[colorIdx.value].dark,
}));

function setTheme(t: 'dark'|'light') { theme.value = t; }
function pickColor(i: number)        { colorIdx.value = i; }

// ─── Tabs ──────────────────────────────────────────────────────
const activeTab = ref<'calc'|'graph'|'matrix'|'fraction'|'calculus'>('calc');

// ─── Calculadora ───────────────────────────────────────────────
const expr      = ref('');
const display   = ref('0');
const exprLine  = ref('');
const isError   = ref(false);
const mode      = ref<'basic'|'sci'|'prog'>('basic');
const angleMode = ref<'DEG'|'RAD'>('DEG');
const base      = ref<'HEX'|'DEC'|'OCT'|'BIN'>('DEC');

const convDec = computed(() => {
  try {
    if (base.value === 'HEX') return parseInt(display.value, 16).toString(10);
    if (base.value === 'BIN') return parseInt(display.value, 2).toString(10);
    if (base.value === 'OCT') return parseInt(display.value, 8).toString(10);
    return parseInt(display.value).toString(10);
  } catch { return '?'; }
});
const convHex = computed(() => {
  try {
    let num = parseInt(display.value);
    if (isNaN(num)) num = parseInt(display.value, 16);
    return num.toString(16).toUpperCase();
  } catch { return '?'; }
});
const convOct = computed(() => {
  try {
    let num = parseInt(display.value);
    if (isNaN(num)) num = parseInt(display.value, 16);
    return num.toString(8);
  } catch { return '?'; }
});
const convBin = computed(() => {
  try {
    let num = parseInt(display.value);
    if (isNaN(num)) num = parseInt(display.value, 16);
    return num.toString(2);
  } catch { return '?'; }
});

function ins(s: string) {
  if (display.value === 'Error') {
    expr.value = '';
    display.value = '0';
    isError.value = false;
  }
  if (display.value === '0' && /^\d/.test(s)) expr.value = s;
  else expr.value += s;
  display.value = expr.value || '0';
  isError.value = false;
}

function del() {
  expr.value = expr.value.slice(0, -1);
  display.value = expr.value || '0';
  isError.value = false;
}

function clearAll() {
  expr.value = '';
  display.value = '0';
  exprLine.value = '';
  isError.value = false;
}

function toggleSign() {
  const val = parseFloat(display.value);
  if (!isNaN(val)) {
    expr.value = String(-val);
    display.value = expr.value;
  }
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
      .replace(/\^/g, '**')
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

    const result = Function(
      '__dsin','__dcos','__dtan','__dasin','__dacos','__datan','__fact',
      `"use strict"; return (${e})`
    )(dSin, dCos, dTan, dAsin, dAcos, dAtan, fact);

    exprLine.value = expr.value + ' =';
    const r = Number(result);
    if (!isFinite(r)) {
      display.value = 'Error';
      isError.value = true;
      return;
    }
    display.value = parseFloat(r.toPrecision(12)).toString();
    expr.value = display.value;
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
  { label:'±',   cls:'btn fn',  action: toggleSign },
  { label:'0',   cls:'btn num', action: () => ins('0') },
  { label:'.',   cls:'btn num', action: () => ins('.') },
  { label:'=',   cls:'btn eq',  action: evaluate },
]);

function onKey(e: KeyboardEvent) {
  if (activeTab.value !== 'calc') return;
  const map: Record<string, () => void> = {
    Enter: evaluate, '=': evaluate,
    Backspace: del, Escape: clearAll,
    '+': () => ins('+'), '-': () => ins('-'),
    '*': () => ins('*'), '/': () => ins('/'),
    '.': () => ins('.'), '(': () => ins('('), ')': () => ins(')'),
  };
  if (map[e.key]) { map[e.key](); e.preventDefault(); }
  else if (/^[0-9]$/.test(e.key)) { ins(e.key); e.preventDefault(); }
}

// ─── Graficador ────────────────────────────────────────────────
const graphCanvas = ref<HTMLCanvasElement | null>(null);
const fxInput = ref('sin(x)');
const xMin = ref(-10);
const xMax = ref(10);
const xStep = ref(0.05);
const graphInfo = ref('');
const graphError = ref('');

const presets = [
  { label:'📐 sin(x)', fx:'sin(x)', xMin:-6.28, xMax:6.28 },
  { label:'📈 x²', fx:'x^2', xMin:-5, xMax:5 },
  { label:'📏 2x+1', fx:'2x+1', xMin:-5, xMax:5 },
  { label:'🔄 1/x', fx:'1/x', xMin:-10, xMax:10 },
  { label:'√x', fx:'sqrt(x)', xMin:0, xMax:20 },
  { label:'📊 eˣ', fx:'e^x', xMin:-3, xMax:3 },
  { label:'📉 ln(x)', fx:'ln(x)', xMin:0.01, xMax:10 },
  { label:'🎵 x·sin(x)', fx:'x*sin(x)', xMin:-15, xMax:15 },
  { label:'📐 x³−3x', fx:'x^3-3*x', xMin:-3, xMax:3 },
];

function applyPreset(p: typeof presets[0]) {
  fxInput.value = p.fx;
  xMin.value = p.xMin;
  xMax.value = p.xMax;
  nextTick(plotGraph);
}

function evalFx(x: number): number {
  try {
    let e = fxInput.value.trim();
    e = e.replace(/\be\^x\b/g, 'Math.exp(x)');
    e = e.replace(/\be\^\(([^)]+)\)/g, 'Math.exp($1)');
    e = e.replace(/\be\^([\w\.\+\-\*\/]+)/g, 'Math.exp($1)');
    e = e.replace(/\^/g, '**');
    e = e.replace(/(\d)(x)/g, '$1*x');
    e = e.replace(/(x)(\d)/g, 'x*$1');
    e = e.replace(/(\d)\(/g, '$1*(');
    e = e.replace(/\)(x)/g, ')*x');
    e = e
      .replace(/\bPI\b/g, String(Math.PI))
      .replace(/\bE\b/g,  String(Math.E))
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\blog\b/g, 'Math.log10')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\bexp\b/g, 'Math.exp');
    const fn = Function('x', `"use strict"; return (${e})`);
    return fn(x);
  } catch { throw new Error('Error evaluando f(x)'); }
}

function plotGraph() {
  graphError.value = '';
  graphInfo.value = '';
  const canvas = graphCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.clientWidth || 500, H = canvas.clientHeight || 400;
  canvas.width = W; canvas.height = H;
  const PAD = 50, isDark = theme.value === 'dark', acc = COLORS[colorIdx.value].accent;
  ctx.fillStyle = isDark ? '#0d1117' : '#ffffff';
  ctx.fillRect(0, 0, W, H);
  const pts: { x: number; y: number }[] = [];
  let yMin = Infinity, yMax = -Infinity;
  const step = Math.max(Math.abs(xStep.value), 0.01);
  for (let xi = xMin.value; xi <= xMax.value + step * 0.5; xi += step) {
    try {
      const y = evalFx(xi);
      if (isFinite(y) && Math.abs(y) < 1e6) {
        pts.push({ x: xi, y });
        yMin = Math.min(yMin, y); yMax = Math.max(yMax, y);
      } else pts.push({ x: xi, y: NaN });
    } catch { pts.push({ x: xi, y: NaN }); }
  }
  if (!pts.some(p => isFinite(p.y))) { graphError.value = 'No se pudo evaluar f(x) en el rango dado'; return; }
  const yRange = (yMax - yMin) || 1;
  yMin -= yRange * 0.1; yMax += yRange * 0.1;
  const cx = (x: number) => PAD + ((x - xMin.value) / (xMax.value - xMin.value)) * (W - PAD * 2);
  const cy = (y: number) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - PAD * 2);
  ctx.save();
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  ctx.fillStyle   = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    const x = xMin.value + (i / 8) * (xMax.value - xMin.value);
    const px = cx(x);
    if (px >= PAD && px <= W - PAD) {
      ctx.beginPath(); ctx.moveTo(px, PAD); ctx.lineTo(px, H - PAD); ctx.stroke();
      ctx.fillText(x.toFixed(1), px - 10, H - PAD + 20);
    }
  }
  for (let i = 0; i <= 6; i++) {
    const y = yMin + (i / 6) * (yMax - yMin);
    const py = cy(y);
    if (py >= PAD && py <= H - PAD) {
      ctx.beginPath(); ctx.moveTo(PAD, py); ctx.lineTo(W - PAD, py); ctx.stroke();
      ctx.fillText(y.toFixed(2), PAD - 35, py + 4);
    }
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  const zeroX = cx(0), zeroY = cy(0);
  if (zeroX >= PAD && zeroX <= W - PAD) { ctx.beginPath(); ctx.moveTo(zeroX, PAD); ctx.lineTo(zeroX, H - PAD); ctx.stroke(); }
  if (zeroY >= PAD && zeroY <= H - PAD) { ctx.beginPath(); ctx.moveTo(PAD, zeroY); ctx.lineTo(W - PAD, zeroY); ctx.stroke(); }
  ctx.beginPath();
  ctx.strokeStyle = acc;
  ctx.lineWidth = 3;
  let started = false, prevY = NaN;
  for (const p of pts) {
    if (!isFinite(p.y)) { started = false; prevY = NaN; continue; }
    const px = cx(p.x), py = cy(p.y);
    if (isFinite(prevY) && Math.abs(p.y - prevY) > (yMax - yMin) * 0.8) started = false;
    if (!started) { ctx.moveTo(px, py); started = true; }
    else ctx.lineTo(px, py);
    prevY = p.y;
  }
  ctx.stroke();
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(PAD, PAD, W - PAD * 2, H - PAD * 2);
  ctx.restore();
  graphInfo.value = `f(x) = ${fxInput.value}  |  x ∈ [${xMin.value}, ${xMax.value}]  |  y ∈ [${yMin.toFixed(3)}, ${yMax.toFixed(3)}]`;
}

// ─── Matrices ──────────────────────────────────────────────────
interface MatrixState { rows: number; cols: number; data: number[] }
function makeMatrix(rows: number, cols: number): MatrixState {
  return { rows, cols, data: Array(rows * cols).fill(0) };
}
const matA = ref<MatrixState>(makeMatrix(2, 2));
const matB = ref<MatrixState>(makeMatrix(2, 2));
const matResult     = ref<number | number[] | null>(null);
const matResultCols = ref(0);
const matError      = ref('');

function resizeMatrix(which: 'A'|'B') {
  const m = which === 'A' ? matA : matB;
  const old = m.value.data.slice();
  const oldCols = m.value.cols;
  const newRows = Math.max(1, Math.min(4, m.value.rows));
  const newCols = Math.max(1, Math.min(4, m.value.cols));
  const newData = Array(newRows * newCols).fill(0);
  for (let r = 0; r < newRows; r++)
    for (let c = 0; c < newCols; c++)
      if (r < (old.length / oldCols) && c < oldCols)
        newData[r * newCols + c] = old[r * oldCols + c] ?? 0;
  m.value = { rows: newRows, cols: newCols, data: newData };
}
function getMatrix(m: MatrixState): number[][] {
  const out: number[][] = [];
  for (let r = 0; r < m.rows; r++)
    out.push(m.data.slice(r * m.cols, r * m.cols + m.cols).map(v => v || 0));
  return out;
}
function matAdd(A: number[][], B: number[][]) { return A.map((r, i) => r.map((v, j) => v + B[i][j])); }
function matSub(A: number[][], B: number[][]) { return A.map((r, i) => r.map((v, j) => v - B[i][j])); }
function matMul(A: number[][], B: number[][]) {
  const rows = A.length, cols = B[0].length, inner = B.length;
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (__, c) =>
      Array.from({ length: inner }, (___, k) => A[r][k] * B[k][c]).reduce((a,b)=>a+b,0)
    )
  );
}
function transpose(A: number[][]) { return A[0].map((_, c) => A.map(row => row[c])); }
function det2(A: number[][]): number {
  if (A.length === 1) return A[0][0];
  if (A.length === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];
  return A[0].reduce((acc, val, c) => acc + val * Math.pow(-1, c) * det2(A.slice(1).map(row => row.filter((_, j) => j !== c))), 0);
}
function inverse(A: number[][]): number[][] {
  const n = A.length;
  const aug = A.map((row, r) => [...row, ...Array.from({ length: n }, (_, c) => (r === c ? 1 : 0))]);
  for (let col = 0; col < n; col++) {
    let pivot = -1;
    for (let row = col; row < n; row++) if (Math.abs(aug[row][col]) > 1e-10) { pivot = row; break; }
    if (pivot < 0) throw new Error('Matriz singular');
    [aug[col], aug[pivot]] = [aug[pivot], aug[col]];
    const div = aug[col][col];
    aug[col] = aug[col].map(v => v / div);
    for (let row = 0; row < n; row++) if (row !== col) {
      const factor = aug[row][col];
      aug[row] = aug[row].map((v, j) => v - factor * aug[col][j]);
    }
  }
  return aug.map(row => row.slice(n));
}
function formatNum(v: number): string {
  if (!isFinite(v)) return '∞';
  if (Math.abs(v) < 1e-10) return '0';
  if (Number.isInteger(v)) return String(v);
  return parseFloat(v.toFixed(6)).toString();
}
function matOp(op: string) {
  matError.value = '';
  matResult.value = null;
  try {
    const A = getMatrix(matA.value), B = getMatrix(matB.value);
    if (op === 'add') {
      if (matA.value.rows !== matB.value.rows || matA.value.cols !== matB.value.cols) throw new Error('Dimensiones diferentes');
      const r = matAdd(A, B); matResultCols.value = r[0].length; matResult.value = r.flat();
    } else if (op === 'sub') {
      if (matA.value.rows !== matB.value.rows || matA.value.cols !== matB.value.cols) throw new Error('Dimensiones diferentes');
      const r = matSub(A, B); matResultCols.value = r[0].length; matResult.value = r.flat();
    } else if (op === 'mul') {
      if (matA.value.cols !== matB.value.rows) throw new Error(`Columnas A (${matA.value.cols}) ≠ Filas B (${matB.value.rows})`);
      const r = matMul(A, B); matResultCols.value = r[0].length; matResult.value = r.flat();
    } else if (op === 'transA') { const r = transpose(A); matResultCols.value = r[0].length; matResult.value = r.flat(); }
    else if (op === 'transB') { const r = transpose(B); matResultCols.value = r[0].length; matResult.value = r.flat(); }
    else if (op === 'detA') { if (matA.value.rows !== matA.value.cols) throw new Error('Matriz no cuadrada'); matResult.value = parseFloat(det2(A).toFixed(8)); }
    else if (op === 'detB') { if (matB.value.rows !== matB.value.cols) throw new Error('Matriz no cuadrada'); matResult.value = parseFloat(det2(B).toFixed(8)); }
    else if (op === 'invA') { if (matA.value.rows !== matA.value.cols) throw new Error('Matriz no cuadrada'); const r = inverse(A); matResultCols.value = r[0].length; matResult.value = r.flat(); }
  } catch (e: any) { matError.value = e.message || 'Error'; }
}

// ─── Fracciones ────────────────────────────────────────────────
interface Fraction { num: number; den: number }
const frac1 = ref<Fraction>({ num: 1, den: 2 });
const frac2 = ref<Fraction>({ num: 1, den: 3 });
const fracOp = ref('+');
const fracOps = [{ sym:'+' }, { sym:'−' }, { sym:'×' }, { sym:'÷' }];
const fracResult = ref<Fraction | null>(null);
const fracError  = ref('');
const simpFrac  = ref<Fraction>({ num: 12, den: 18 });
const simpResult = ref<{ num: number; den: number; gcd: number } | null>(null);

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}
function reduceFrac(num: number, den: number): Fraction {
  if (den === 0) throw new Error('Denominador cero');
  const g = gcd(num, den);
  const sign = den < 0 ? -1 : 1;
  return { num: sign * Math.round(num / g), den: sign * Math.round(den / g) };
}
function calcFrac() {
  fracError.value = ''; fracResult.value = null;
  try {
    const { num: n1, den: d1 } = frac1.value, { num: n2, den: d2 } = frac2.value;
    if (d1 === 0 || d2 === 0) throw new Error('Denominador cero');
    let rNum: number, rDen: number;
    if (fracOp.value === '+')  { rNum = n1 * d2 + n2 * d1; rDen = d1 * d2; }
    else if (fracOp.value === '−') { rNum = n1 * d2 - n2 * d1; rDen = d1 * d2; }
    else if (fracOp.value === '×') { rNum = n1 * n2; rDen = d1 * d2; }
    else { if (n2 === 0) throw new Error('División por cero'); rNum = n1 * d2; rDen = d1 * n2; }
    fracResult.value = reduceFrac(rNum, rDen);
  } catch (e: any) { fracError.value = e.message; }
}
function simplifyFrac() {
  fracError.value = ''; simpResult.value = null;
  try {
    const { num, den } = simpFrac.value;
    if (den === 0) throw new Error('Denominador cero');
    const g = gcd(num, den);
    const r = reduceFrac(num, den);
    simpResult.value = { num: r.num, den: r.den, gcd: g };
  } catch (e: any) { fracError.value = e.message; }
}

// ─── CÁLCULO (Derivadas e Integrales) ─────────────────────────
const calculusFx = ref('x^2');
const calculusMode = ref<'deriv'|'deriv2'|'integral'>('deriv');
const calculusX0 = ref(1);
const calculusA = ref(0);
const calculusB = ref(1);
const calculusResult = ref<string | null>(null);
const calculusError = ref('');

function evaluateCalculusFx(x: number): number {
  try {
    let e = calculusFx.value.trim();
    e = e.replace(/\be\^x\b/g, 'Math.exp(x)');
    e = e.replace(/\be\^\(([^)]+)\)/g, 'Math.exp($1)');
    e = e.replace(/\be\^([\w\.\+\-\*\/]+)/g, 'Math.exp($1)');
    e = e.replace(/\^/g, '**');
    e = e.replace(/(\d)(x)/g, '$1*x');
    e = e.replace(/(x)(\d)/g, 'x*$1');
    e = e.replace(/(\d)\(/g, '$1*(');
    e = e.replace(/\)(x)/g, ')*x');
    e = e
      .replace(/\bPI\b/g, String(Math.PI))
      .replace(/\bE\b/g,  String(Math.E))
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\blog\b/g, 'Math.log10')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\bexp\b/g, 'Math.exp');
    const fn = Function('x', `"use strict"; return (${e})`);
    return fn(x);
  } catch { throw new Error('Error evaluando f(x)'); }
}

function derivadaNum(f: (x: number) => number, x: number, h: number = 1e-6): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}
function derivadaSegundaNum(f: (x: number) => number, x: number, h: number = 1e-5): number {
  return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
}
function integralSimpson(f: (x: number) => number, a: number, b: number, n: number = 1000): number {
  if (a === b) return 0;
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0) ? 2 * f(x) : 4 * f(x);
  }
  return (h / 3) * sum;
}

function runCalculus() {
  calculusError.value = '';
  calculusResult.value = null;
  try {
    const f = (x: number) => evaluateCalculusFx(x);
    if (calculusMode.value === 'deriv') {
      const x0 = calculusX0.value;
      const deriv = derivadaNum(f, x0);
      calculusResult.value = `f'(${x0}) = ${deriv.toFixed(10)}`;
    } else if (calculusMode.value === 'deriv2') {
      const x0 = calculusX0.value;
      const deriv2 = derivadaSegundaNum(f, x0);
      calculusResult.value = `f''(${x0}) = ${deriv2.toFixed(10)}`;
    } else if (calculusMode.value === 'integral') {
      const a = calculusA.value, b = calculusB.value;
      if (a > b) throw new Error('El límite inferior debe ser menor que el superior');
      const integral = integralSimpson(f, a, b);
      calculusResult.value = `∫[${a}, ${b}] f(x) dx = ${integral.toFixed(10)}`;
    }
  } catch (e: any) {
    calculusError.value = e.message || 'Error en el cálculo';
  }
}

// ─── Lifecycle ─────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('keydown', onKey);
  nextTick(plotGraph);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
});
watch(activeTab, (v) => {
  if (v === 'graph') nextTick(plotGraph);
});
watch([colorIdx, theme], () => {
  if (activeTab.value === 'graph') nextTick(plotGraph);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');

:root { --acc: #f59e0b; --acc2: #d97706; }
.calc-content { --background: #0a0c0f; }
.app-shell {
  min-height: 100%;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
}

/* Top bar */
.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; padding: 20px 20px 16px;
  backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.08);
}
.brand { display: flex; align-items: center; gap: 10px; }
.brand-icon {
  font-size: 28px; font-weight: 700;
  background: linear-gradient(135deg, var(--acc), var(--acc2));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.brand-name {
  font-family: 'Orbitron', monospace; font-size: 14px; font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #fff, rgba(255,255,255,0.7));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.top-controls { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.pill-toggle {
  display: flex; background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 40px; padding: 4px; gap: 4px;
}
.ptb {
  padding: 6px 16px; border: none; border-radius: 32px;
  font-size: 12px; font-weight: 500; cursor: pointer;
  background: transparent; color: rgba(255,255,255,0.5); transition: all 0.2s;
}
.ptb.ptb-on { background: var(--acc); color: #000; }
.swatches { display: flex; gap: 8px; align-items: center; }
.sw {
  width: 24px; height: 24px; border-radius: 50%; cursor: pointer;
  border: 2px solid transparent; transition: all 0.2s;
}
.sw:hover { transform: scale(1.15); }
.sw.sw-on { border-color: #fff; box-shadow: 0 0 8px rgba(255,255,255,0.5); }

/* Tabs */
.tab-row { display: flex; padding: 16px 20px 0; gap: 8px; flex-wrap: wrap; }
.tab {
  padding: 10px 20px; border: none; border-radius: 12px 12px 0 0;
  background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.4);
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.tab.tab-on { background: rgba(255,255,255,0.08); color: var(--acc); }

/* Panels */
.panel {
  background: rgba(255,255,255,0.04); border-radius: 0 16px 16px 16px;
  margin: 0 16px 20px; padding: 20px;
  backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05);
}

/* Screen */
.screen {
  border-radius: 16px; padding: 20px; margin-bottom: 20px;
  position: relative; overflow: hidden;
  background: #0a0c0f; border: 1px solid rgba(255,255,255,0.1);
}
.screen.light { background: #f5f5f0; border-color: rgba(0,0,0,0.1); }
.scanlines {
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
}
.expr-line {
  font-family: 'JetBrains Mono', monospace; font-size: 13px;
  color: rgba(100,200,80,0.6); text-align: right; min-height: 20px;
  word-break: break-all; white-space: normal;
}
.screen.light .expr-line { color: rgba(40,90,10,0.6); }
.result-line {
  font-family: 'Orbitron', monospace; font-size: 40px; font-weight: 700;
  color: #c8e87a; text-align: right; text-shadow: 0 0 20px rgba(100,200,80,0.3);
  line-height: 1.2; margin-top: 8px; word-break: break-word;
}
.screen.light .result-line { color: #2a5810; text-shadow: none; }
.result-line.err { color: #e85a5a; }

/* Mode row */
.mode-row {
  display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;
}
.mode-btn {
  padding: 6px 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
  background: transparent; color: rgba(255,255,255,0.5);
  font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.mode-btn.mode-on { background: var(--acc); border-color: var(--acc); color: #000; }
.deg-rad {
  display: flex; margin-left: auto; background: rgba(255,255,255,0.05);
  border-radius: 20px; padding: 4px; gap: 4px;
}
.dr-btn {
  padding: 4px 12px; border: none; border-radius: 16px;
  font-size: 11px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
  cursor: pointer; background: transparent; color: rgba(255,255,255,0.4); transition: all 0.2s;
}
.dr-btn.dr-on { background: var(--acc); color: #000; }

/* Keypads */
.keypad { display: grid; gap: 10px; }
.basic-pad  { grid-template-columns: repeat(4, 1fr); }
.sci-pad    { grid-template-columns: repeat(4, 1fr); }
.prog-pad   { grid-template-columns: repeat(4, 1fr); }
.basic-grid {
  grid-column: 1 / -1; display: grid;
  grid-template-columns: repeat(4, 1fr); gap: 10px;
}
.btn {
  height: 52px; border: none; border-radius: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.08s linear; font-size: 15px;
}
.btn:active { transform: translateY(2px); }
.btn.num {
  background: #2a2e35; color: #e8e8e8; box-shadow: 0 4px 0 #1a1d22;
}
.btn.fn {
  background: #3a3f48; color: #c0c8d0; font-size: 13px; box-shadow: 0 4px 0 #22262c;
}
.btn.fn2 {
  height: 46px; background: #1e2328; color: var(--acc);
  font-size: 12px; font-weight: 600;
  font-family: 'JetBrains Mono', monospace; box-shadow: 0 3px 0 #12151a;
}
.btn.op {
  background: var(--acc); color: #000; font-weight: 700;
  font-size: 18px; box-shadow: 0 4px 0 var(--acc2);
}
.btn.eq {
  background: var(--acc); color: #000; font-size: 22px;
  font-weight: 800; box-shadow: 0 4px 0 var(--acc2);
}
.base-row { grid-column: 1 / -1; display: flex; gap: 8px; margin-bottom: 8px; }
.base-btn {
  flex: 1; padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
  background: transparent; color: rgba(255,255,255,0.5);
  font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.base-btn.base-on { background: var(--acc); border-color: var(--acc); color: #000; }
.conversions {
  grid-column: 1 / -1; display: flex; gap: 16px; flex-wrap: wrap;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: rgba(255,255,255,0.5); padding: 8px;
  background: rgba(255,255,255,0.03); border-radius: 10px; margin-bottom: 8px;
}
.hex-grid {
  grid-column: 1 / -1; display: grid; grid-template-columns: repeat(6, 1fr);
  gap: 8px; margin-bottom: 8px;
}

/* Graph */
.graph-controls { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
.fx-row { display: flex; align-items: center; gap: 12px; }
.fx-label { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; color: var(--acc); }
.fx-input {
  flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; color: #e8e8e8; padding: 10px 14px;
  font-family: 'JetBrains Mono', monospace; font-size: 14px; outline: none; transition: all 0.2s;
}
.fx-input:focus { border-color: var(--acc); }
.plot-btn {
  padding: 10px 24px; background: var(--acc); border: none; border-radius: 10px;
  color: #000; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.plot-btn:hover { transform: translateY(-1px); filter: brightness(1.05); }
.range-row { display: flex; gap: 16px; flex-wrap: wrap; }
.range-row label {
  display: flex; align-items: center; gap: 8px; font-size: 12px;
  color: rgba(255,255,255,0.5); font-family: 'JetBrains Mono', monospace;
}
.range-in {
  width: 80px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; color: #e8e8e8; padding: 6px 10px;
  font-family: 'JetBrains Mono', monospace; font-size: 12px; outline: none;
}
.range-in:focus { border-color: var(--acc); }
.presets { display: flex; flex-wrap: wrap; gap: 8px; }
.preset-btn {
  padding: 6px 14px; background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
  color: rgba(255,255,255,0.6); font-family: 'JetBrains Mono', monospace;
  font-size: 11px; cursor: pointer; transition: all 0.2s;
}
.preset-btn:hover { background: var(--acc); border-color: var(--acc); color: #000; }
.graph-canvas {
  width: 100%; height: 400px; border-radius: 12px; background: #0d1117; display: block;
}
.graph-info {
  margin-top: 12px; font-family: 'JetBrains Mono', monospace;
  font-size: 11px; color: rgba(255,255,255,0.4); text-align: center;
}
.graph-error { margin-top: 10px; font-size: 13px; color: #e85a5a; text-align: center; }

/* Matrices */
.matrix-controls { display: flex; flex-direction: column; gap: 16px; }
.matrix-size-row {
  display: flex; gap: 16px; flex-wrap: wrap; align-items: center;
}
.matrix-size-row label {
  display: flex; align-items: center; gap: 8px; font-size: 12px;
  color: rgba(255,255,255,0.5); font-family: 'JetBrains Mono', monospace;
}
.matrices-row { display: flex; gap: 24px; flex-wrap: wrap; }
.mat-block { display: flex; flex-direction: column; gap: 10px; }
.mat-label {
  font-family: 'JetBrains Mono', monospace; font-size: 13px;
  font-weight: 600; color: var(--acc);
}
.mat-grid { display: grid; gap: 8px; }
.mat-cell {
  width: 60px; height: 44px; text-align: center;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; color: #e8e8e8; font-family: 'JetBrains Mono', monospace;
  font-size: 14px; outline: none; transition: border-color 0.2s;
}
.mat-cell:focus { border-color: var(--acc); }
.mat-ops { display: flex; flex-wrap: wrap; gap: 8px; }
.mat-op-btn {
  padding: 8px 18px; background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 10px;
  color: rgba(255,255,255,0.7); font-family: 'JetBrains Mono', monospace;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.mat-op-btn:hover { background: var(--acc); border-color: var(--acc); color: #000; }
.mat-result-block {
  margin-top: 20px; padding: 16px;
  background: rgba(255,255,255,0.03); border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
}
.mat-result-grid { gap: 8px; }
.mat-cell-out {
  min-width: 60px; height: 44px; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; color: #c8e87a; font-family: 'JetBrains Mono', monospace;
  font-size: 13px; font-weight: 600; padding: 0 8px;
}
.mat-scalar {
  font-family: 'Orbitron', monospace; font-size: 36px; font-weight: 700;
  color: #c8e87a; text-align: center; padding: 12px 0;
}

/* Fracciones */
.frac-section { display: flex; flex-direction: column; gap: 24px; }
.frac-inputs { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.frac-display {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.frac-in {
  width: 80px; height: 44px; text-align: center;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; color: #e8e8e8; font-family: 'JetBrains Mono', monospace;
  font-size: 18px; outline: none; transition: border-color 0.2s;
}
.frac-in:focus { border-color: var(--acc); }
.frac-line { width: 80px; height: 2px; background: rgba(255,255,255,0.4); border-radius: 2px; }
.frac-op-col { display: flex; flex-direction: column; gap: 6px; }
.frac-op-btn {
  width: 44px; height: 44px; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
  background: transparent; color: rgba(255,255,255,0.6);
  font-size: 18px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.frac-op-btn.frac-op-on { background: var(--acc); border-color: var(--acc); color: #000; }
.frac-result-block {
  padding: 16px; background: rgba(255,255,255,0.03);
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);
}
.frac-result-label {
  font-size: 12px; font-family: 'JetBrains Mono', monospace;
  color: rgba(255,255,255,0.4); margin-bottom: 12px;
}
.frac-result-display { display: flex; align-items: center; gap: 24px; }
.frac-result-frac { gap: 6px; }
.frac-big {
  font-family: 'Orbitron', monospace; font-size: 32px;
  font-weight: 700; color: #c8e87a;
}
.frac-decimal {
  font-family: 'JetBrains Mono', monospace; font-size: 14px;
  color: rgba(255,255,255,0.4);
}
.frac-simplify-section {
  padding: 16px; background: rgba(255,255,255,0.02);
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);
}

/* Cálculo (derivadas/integrales) */
.calculus-mode-row {
  display: flex; gap: 8px; margin: 8px 0; flex-wrap: wrap;
}
.calculus-result-block {
  margin-top: 20px; padding: 16px;
  background: rgba(255,255,255,0.03); border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
}
.calculus-result-value {
  font-family: 'Orbitron', monospace; font-size: 24px;
  font-weight: 700; color: #c8e87a; text-align: center;
  word-break: break-word;
}

/* Theme Light */
.theme-light { background: #f5f7fa; }
.theme-light .top-bar { border-bottom-color: rgba(0,0,0,0.08); }
.theme-light .brand-name {
  background: linear-gradient(135deg, #1a1a1a, #4a4a4a);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.theme-light .tab { background: rgba(0,0,0,0.03); color: rgba(0,0,0,0.5); }
.theme-light .tab.tab-on { background: rgba(0,0,0,0.05); color: var(--acc); }
.theme-light .panel { background: rgba(255,255,255,0.8); border-color: rgba(0,0,0,0.05); }
.theme-light .screen { background: #ffffff; border-color: rgba(0,0,0,0.1); }
.theme-light .mode-btn, .theme-light .base-btn, .theme-light .dr-btn {
  color: rgba(0,0,0,0.6); border-color: rgba(0,0,0,0.1);
}
.theme-light .btn.num { background: #e8ece5; color: #1a2a1a; box-shadow: 0 4px 0 #c8ccc0; }
.theme-light .btn.fn  { background: #dce0d8; color: #3a4e3a; box-shadow: 0 4px 0 #b8bcb0; }
.theme-light .btn.fn2 { background: #f0f4ec; color: var(--acc); box-shadow: 0 3px 0 #d0d8c0; }
.theme-light .conversions { background: rgba(0,0,0,0.03); color: rgba(0,0,0,0.6); }
.theme-light .fx-input, .theme-light .range-in, .theme-light .mat-cell, .theme-light .frac-in {
  background: #ffffff; border-color: rgba(0,0,0,0.15); color: #1a2a1a;
}
.theme-light .graph-canvas { background: #ffffff; border: 1px solid rgba(0,0,0,0.1); }
.theme-light .preset-btn { background: rgba(0,0,0,0.05); color: rgba(0,0,0,0.6); }
.theme-light .graph-info { color: rgba(0,0,0,0.5); }
.theme-light .mat-op-btn { color: rgba(0,0,0,0.6); border-color: rgba(0,0,0,0.15); }
.theme-light .mat-cell-out { background: rgba(0,0,0,0.03); color: #2a5810; }
.theme-light .mat-scalar, .theme-light .frac-big, .theme-light .calculus-result-value { color: #2a5810; }
.theme-light .frac-line { background: rgba(0,0,0,0.3); }
.theme-light .frac-op-btn { color: rgba(0,0,0,0.5); border-color: rgba(0,0,0,0.15); }
.theme-light .frac-decimal { color: rgba(0,0,0,0.4); }
.theme-light .mat-result-block, .theme-light .frac-result-block, .theme-light .frac-simplify-section, .theme-light .calculus-result-block {
  background: rgba(0,0,0,0.02); border-color: rgba(0,0,0,0.06);
}
.theme-light .range-row label, .theme-light .matrix-size-row label { color: rgba(0,0,0,0.5); }
.theme-light .mat-label, .theme-light .frac-result-label { color: var(--acc2); }
</style>