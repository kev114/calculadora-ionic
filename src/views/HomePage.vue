<template>
  <ion-page>
    <div class="calculadora-wrapper fondo-azul-blindado">
      
      <div class="seccion-pantalla">
        <div class="pantalla-lcd">
          <div class="status-bar">
            <span :class="{ 'visible': shiftActivo }">S</span>
            <span class="visible">{{ modoGrados ? 'DEG' : 'RAD' }}</span>
            <span class="label-modo">{{ mostrandoGrafica ? 'GRAPH' : 'MATH' }}</span>
          </div>
          
          <div class="contenido-variable">
            <canvas v-show="mostrandoGrafica" ref="canvasGrafico" width="300" height="100"></canvas>
            <div v-show="!mostrandoGrafica" class="contenedor-historial">
              <div v-for="(h, i) in historial" :key="i" class="item-historial">{{ h }}</div>
            </div>
          </div>

          <div class="display-datos">
            <div class="display-buffer">{{ buffer || '0' }}</div>
            <div class="display-resultado">{{ resultado }}</div>
          </div>
        </div>
      </div>

      <div class="panel-control">
        <ion-grid>
          <ion-row>
            <ion-col size="3"><button class="btn-control shift" @click="toggleShift()" :class="{ 'btn-active-shift': shiftActivo }">SHIFT</button></ion-col>
            <ion-col size="3"><button class="btn-control" @click="toggleUnidad()">{{ modoGrados ? '→ RAD' : '→ DEG' }}</button></ion-col>
            <ion-col size="3"><button class="btn-control btn-azul-claro" @click="alternarGrafica()">{{ mostrandoGrafica ? 'VER LISTA' : 'VER GRAF' }}</button></ion-col>
            <ion-col size="3"><button class="btn-control" @click="convertir('cm', 'inch')">cm➞in</button></ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <div class="seccion-cientifica">
        <ion-grid>
          <ion-row v-for="(fila, i) in botonesCientificos" :key="'c'+i">
            <ion-col size="2.4" v-for="btn in fila" :key="btn.label">
              <button class="btn-cientifico-negro" @click="procesarCientifico(btn)">
                <span class="hint-shift">{{ btn.shift }}</span>
                {{ btn.label }}
              </button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <div class="seccion-base">
        <ion-grid>
          <ion-row v-for="(fila, i) in botonesBase" :key="'b'+i">
            <ion-col size="2.4" v-for="tecla in fila" :key="tecla">
              <button :class="getEstiloTecla(tecla)" @click="presionarTecla(tecla)">
                {{ tecla }}
              </button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as math from 'mathjs';

const buffer = ref('');
const resultado = ref('0');
const historial = ref<string[]>([]);
const shiftActivo = ref(false);
const modoGrados = ref(true);
const mostrandoGrafica = ref(false);
const canvasGrafico = ref<HTMLCanvasElement | null>(null);

const botonesCientificos = [
  [{label: 'x', shift: 'y'}, {label: 'sin', shift: 'sin⁻¹'}, {label: 'cos', shift: 'cos⁻¹'}, {label: 'tan', shift: 'tan⁻¹'}, {label: 'log', shift: '10ⁿ'}],
  [{label: '(', shift: '√'}, {label: ')', shift: 'x²'}, {label: 'Abs', shift: 'π'}, {label: 'x³', shift: '∛'}, {label: 'x⁻¹', shift: '!'}]
];

const botonesBase = [
  ['7', '8', '9', 'DEL', 'AC'],
  ['4', '5', '6', '×', '÷'],
  ['1', '2', '3', '+', '-'],
  ['0', '.', 'x10ⁿ', 'Ans', '=']
];

const alternarGrafica = () => {
  mostrandoGrafica.value = !mostrandoGrafica.value;
  if (mostrandoGrafica.value) setTimeout(dibujar, 50);
};

const presionarTecla = (tecla: string) => {
  if (tecla === 'AC') { buffer.value = ''; resultado.value = '0'; }
  else if (tecla === 'DEL') { buffer.value = buffer.value.slice(0, -1); }
  else if (tecla === '=') { calcular(); }
  else if (tecla === '×') { buffer.value += '*'; }
  else if (tecla === '÷') { buffer.value += '/'; }
  else { buffer.value += tecla; }
};

const procesarCientifico = (btn: any) => {
  let comando = shiftActivo.value ? (btn.shift || btn.label) : btn.label;
  const mapaVisual: any = { 'sin': 'sin(', 'cos': 'cos(', 'tan': 'tan(', '√': '√(', 'x²': '^2', 'x³': '^3', 'π': 'π' };
  buffer.value += mapaVisual[comando] || comando;
  shiftActivo.value = false;
};

const calcular = () => {
  try {
    let expr = buffer.value.replace(/×/g, '*').replace(/÷/g, '/').replace(/√/g, 'sqrt').replace(/π/g, 'pi');
    const r = math.evaluate(expr);
    resultado.value = math.format(r, { precision: 8 });
    historial.value.unshift(`${buffer.value} = ${resultado.value}`);
    buffer.value = ''; 
  } catch (e) { resultado.value = 'Error'; }
};

const dibujar = () => {
  const canvas = canvasGrafico.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, 300, 100);
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.moveTo(0, 50); ctx.lineTo(300, 50);
  ctx.moveTo(150, 0); ctx.lineTo(150, 100);
  ctx.stroke();
  ctx.strokeStyle = '#222';
  ctx.beginPath();
  try {
    const expr = math.compile(buffer.value);
    for (let i = 0; i <= 300; i++) {
      const xInput = (i - 150) / 15;
      const yOutput = expr.evaluate({ x: xInput });
      const pixelY = 50 - (yOutput * 15);
      if (i === 0) ctx.moveTo(i, pixelY); else ctx.lineTo(i, pixelY);
    }
    ctx.stroke();
  } catch (e) {}
};

const toggleShift = () => shiftActivo.value = !shiftActivo.value;
const toggleUnidad = () => modoGrados.value = !modoGrados.value;

const convertir = (desde: string, hacia: string) => {
  try {
    let v = parseFloat(buffer.value) || parseFloat(resultado.value) || 0;
    const res = math.unit(v, desde).toNumber(hacia);
    resultado.value = res.toFixed(4);
    historial.value.unshift(`${v}${desde} ➞ ${resultado.value}${hacia}`);
    buffer.value = '';
  } catch (e) { resultado.value = 'Error'; }
};

const getEstiloTecla = (t: string) => {
  if (t === 'AC' || t === 'DEL') return 'btn-naranja';
  if (t === '=') return 'btn-igual';
  return 'btn-numero-azul';
};
</script>

<style scoped>
.calculadora-wrapper { display: flex; flex-direction: column; height: 100vh; padding: 10px; background: #001f3f; overflow: hidden; }
.seccion-pantalla { height: 180px; margin-bottom: 10px; flex-shrink: 0; }
.pantalla-lcd { background: #a8b9a7; height: 100%; border-radius: 8px; border: 4px solid #222; padding: 8px; display: flex; flex-direction: column; color: #1a1a1a; font-family: monospace; }
.status-bar { font-size: 0.6rem; display: flex; gap: 8px; height: 15px; }
.status-bar span { opacity: 0.1; }
.status-bar span.visible { opacity: 1; }
.label-modo { margin-left: auto; font-weight: bold; }
.contenido-variable { flex: 1; overflow: hidden; margin: 5px 0; border-bottom: 1px solid rgba(0,0,0,0.1); }
.contenedor-historial { height: 100%; overflow-y: auto; font-size: 0.7rem; }
canvas { width: 100%; height: 100%; background: rgba(255,255,255,0.1); }
.display-datos { height: 50px; display: flex; flex-direction: column; justify-content: center; }
.display-buffer { font-size: 1rem; text-align: right; overflow: hidden; }
.display-resultado { font-size: 1.6rem; font-weight: bold; text-align: right; }
.btn-control { width: 100%; height: 35px; background: #333; color: white; border-radius: 5px; font-size: 0.6rem; }
.btn-active-shift { background: #f1c40f !important; color: black !important; }
.btn-azul-claro { background: #4a90e2 !important; font-weight: bold; }
.btn-cientifico-negro { background: #1a1a1a; color: white; width: 100%; height: 40px; border-radius: 4px; font-size: 0.7rem; position: relative; margin: 4px 0; }
.hint-shift { position: absolute; top: -10px; width: 100%; color: #f1c40f; font-size: 0.55rem; text-align: center; }
.btn-numero-azul { background: #f4f4f4; color: #001f3f; width: 100%; height: 50px; border-radius: 6px; font-weight: bold; font-size: 1.1rem; }
.btn-naranja { background: #ff851b; color: white; width: 100%; height: 50px; border-radius: 6px; }
.btn-igual { background: #333; color: white; width: 100%; height: 50px; border-radius: 6px; }
</style>