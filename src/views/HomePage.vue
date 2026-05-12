<template>
  <ion-page :class="{ 'dark-mode': modoOscuro }">
    <ion-header>
      <ion-toolbar color="tertiary">
        <ion-title>fx-991 CW Pro - Naomi</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="modoOscuro = !modoOscuro">
            <ion-icon :icon="modoOscuro ? sunny : moon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding fondo-azul-blindado">
      <div class="pantalla-cw" :class="{ 'pantalla-dark': modoOscuro }">

          <div class="indicadores"> 
          <span>{{ modoGrados ? 'DEG' : 'RAD' }}</span>
          <span v-if="memoria !== 0">M</span>
        </div>
        <div class="buffer-exp">{{ buffer }}</div>
        <div class="resultado-principal">{{ resultado }}</div>
      </div>

     <div class="contenedor-historial">
        <div v-for="(h, i) in historial" :key="'hist-' + i" class="item-historial">
       {{ h }}
       </div>
       <div v-if="historial.length === 0" class="vacio">Listo para calcular</div>
     </div>

      <ion-grid class="ion-no-padding">
        <ion-row>
          <ion-col><ion-button expand="block" fill="solid" class="btn-menu" @click="resetTotal()">HOME</ion-button></ion-col>
          <ion-col><ion-button expand="block" fill="solid" class="btn-menu" @click="abrirInfo()">SETTINGS</ion-button></ion-col>
          <ion-col><ion-button expand="block" fill="solid" class="btn-menu" @click="verCatalogo = true">CATALOG</ion-button></ion-col>
        </ion-row>

        <ion-row>
          <ion-col size="3"><ion-button expand="block" :color="modoGrados ? 'primary' : 'secondary'" @click="modoGrados = !modoGrados" class="btn-chico">{{ modoGrados ? 'DEG' : 'RAD' }}</ion-button></ion-col>
          <ion-col v-for="m in ['MC','MR','M+']" :key="m"><ion-button expand="block" color="primary" class="btn-chico" @click="controlMemoria(m)">{{ m }}</ion-button></ion-col>
        </ion-row>

        <ion-row v-for="(fila, i) in [['sin','cos','tan','π','e'], ['log','ln','n!','√','abs']]" :key="'c'+i">
          <ion-col v-for="b in fila" :key="b"><ion-button expand="block" color="dark" class="btn-cientifico" @click="escribir(b)">{{ b }}</ion-button></ion-col>
        </ion-row>

        <ion-row v-for="(fila, i) in [['7','8','9','DEL','AC'], ['4','5','6','×','÷'], ['1','2','3','+','-']]" :key="'n'+i">
          <ion-col v-for="b in fila" :key="b"><ion-button expand="block" :color="colorEspecial(b)" class="btn-num" @click="escribir(b)">{{ b }}</ion-button></ion-col>
        </ion-row>

        <ion-row>
          <ion-col size="5"><ion-button expand="block" color="light" class="btn-num" @click="escribir('0')">0</ion-button></ion-col>
          <ion-col><ion-button expand="block" color="light" class="btn-num" @click="escribir('.')">.</ion-button></ion-col>
          <ion-col><ion-button expand="block" color="dark" class="btn-num" @click="escribir('Ans')">Ans</ion-button></ion-col>
          <ion-col><ion-button expand="block" color="tertiary" class="btn-num" @click="escribir('=')">=</ion-button></ion-col>
        </ion-row>
      </ion-grid>

      <ion-action-sheet :is-open="verCatalogo" header="Conversiones Automáticas" :buttons="btnsCatalogo" @didDismiss="verCatalogo = false"></ion-action-sheet>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts"> // @ts-nocheck
import { ref } from 'vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonButtons, IonIcon, IonActionSheet, alertController } from '@ionic/vue';
import { moon, sunny } from 'ionicons/icons';

const resultado = ref('0');
const buffer = ref('');
const memoria = ref(0);
const modoOscuro = ref(false);
const modoGrados = ref(true);
const historial = ref<string[]>([]);
const verCatalogo = ref(false);
let ultimoAns = '0';

// Función Factorial Segura
const fact = (n: number): number => {
  if (n < 0) return NaN;
  if (n > 170) return Infinity; // Límite de JS
  return (n <= 1) ? 1 : n * fact(n - 1);
};

const resetTotal = () => { resultado.value = '0'; buffer.value = ''; historial.value = []; };

const abrirInfo = async () => {
  const a = await alertController.create({ header: 'Naomi CW Pro', message: 'Motor de cálculo v2.0 - Sin errores de sintaxis detectados.', buttons: ['OK'] });
  await a.present();
};

const btnsCatalogo = [
  { text: 'Longitud: cm a in', handler: () => { const v = (parseFloat(resultado.value)/2.54).toFixed(4); historial.value.unshift(`${resultado.value}cm = ${v}in`); resultado.value = v; }},
  { text: 'Temperatura: °C a °F', handler: () => { const v = ((parseFloat(resultado.value)*9/5)+32).toFixed(2); historial.value.unshift(`${resultado.value}°C = ${v}°F`); resultado.value = v; }},
  { text: 'Probabilidad: Ran#', handler: () => { const r = Math.random().toFixed(4); resultado.value = r; historial.value.unshift(`Random: ${r}`); }},
  { text: 'Cerrar', role: 'cancel' }
];

const controlMemoria = (op: string) => {
  const n = parseFloat(resultado.value);
  if (op === 'MC') memoria.value = 0;
  if (op === 'MR') resultado.value = memoria.value.toString();
  if (op === 'M+') { memoria.value += n; buffer.value = 'M+ Guardado'; }
};

const escribir = (t: string) => {
  if (t === 'AC') { resultado.value = '0'; buffer.value = ''; }
  else if (t === 'DEL') { resultado.value = resultado.value.length > 1 ? resultado.value.slice(0, -1) : '0'; }
  else if (t === 'Ans') { resultado.value = resultado.value === '0' ? ultimoAns : resultado.value + ultimoAns; }
  else if (t === '=') {
    try {
      let calc = resultado.value
        .replace(/×/g, '*').replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI').replace(/e/g, 'Math.E')
        .replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(').replace(/ln\(/g, 'Math.log(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/(\d+)n!/g, (m, n) => fact(parseInt(n)).toString());

      // Manejo de Grados/Radianes para funciones trigonométricas
      const r = modoGrados.value ? '(Math.PI/180*' : '(';
      calc = calc.replace(/sin\(/g, 'Math.sin' + r).replace(/cos\(/g, 'Math.cos' + r).replace(/tan\(/g, 'Math.tan' + r);

      // Cerrar paréntesis faltantes automáticamente para evitar errores
      const abiertos = (calc.match(/\(/g) || []).length;
      const cerrados = (calc.match(/\)/g) || []).length;
      for(let i=0; i < (abiertos - cerrados); i++) { calc += ')'; }

      const final = eval(calc);
      if (isNaN(final) || !isFinite(final)) throw new Error();
      
      ultimoAns = Number(final.toFixed(6)).toString();
      historial.value.unshift(`${resultado.value} = ${ultimoAns}`);
      buffer.value = resultado.value;
      resultado.value = ultimoAns;
    } catch {
      resultado.value = 'Error de Formato';
      setTimeout(() => { resultado.value = '0'; }, 1500);
    }
  } else {
    const fns = ['sin','cos','tan','log','ln','√','abs'];
    if (fns.includes(t)) {
      resultado.value = (resultado.value === '0') ? t + '(' : resultado.value + t + '(';
    } else {
      if (resultado.value === '0' && !isNaN(Number(t))) resultado.value = t;
      else resultado.value += t;
    }
  }
};

const colorEspecial = (t: string) => ['DEL', 'AC'].includes(t) ? 'danger' : 'light';
</script>

<style scoped>
.fondo-azul-blindado { --background: linear-gradient(to bottom, #e3f2fd, #90caf9); }
.pantalla-cw { background: #f8f9fa; border: 3px solid #1565c0; border-radius: 15px; padding: 15px; min-height: 95px; text-align: right; margin-bottom: 10px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.1); }
.pantalla-dark { background: #00172d; color: #fff; border-color: #4fc3f7; }
.resultado-principal { font-size: 2rem; font-weight: bold; color: #0d47a1; }
.pantalla-dark .resultado-principal { color: #fff; }
.buffer-exp { font-size: 0.85rem; color: #546e7a; min-height: 1.1rem; }
.contenedor-historial { height: 65px; overflow-y: auto; background: rgba(255,255,255,0.6); border-radius: 10px; margin-bottom: 15px; padding: 8px; border: 1px solid #64b5f6; }
.item-historial { font-size: 0.75rem; color: #01579b; border-bottom: 1px solid #bbdefb; padding: 2px 0; }
.vacio { text-align: center; font-size: 0.7rem; color: #90a4ae; margin-top: 15px; }
ion-button { --border-radius: 10px; font-weight: bold; height: 42px; margin: 1px 0; }
.btn-menu { --background: #fff; --color: #1565c0; font-size: 0.65rem; height: 35px; }
.btn-chico { font-size: 0.7rem; height: 38px; }
.btn-cientifico { --background: #37474f; font-size: 0.85rem; }
.btn-num { font-size: 1.2rem; }
.dark-mode { --ion-background-color: #000a12; }
</style>