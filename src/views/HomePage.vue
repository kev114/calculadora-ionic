<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <ion-title>Calculadora cientifica</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="display" translate="no">
        <div style="color: #2dd36f; font-size: 0.8rem;">MODO: {{ modo }}</div>
        <div class="operacion">{{ buffer }}</div>
        <h1>{{ resultado }}</h1>
      </div>

      <ion-grid>
        <ion-row v-for="fila in botones" :key="fila.toString()">
          <ion-col size="3" v-for="boton in fila" :key="boton">
            <ion-button 
              expand="block" 
              :color="esOperador(boton) ? 'warning' : (boton === 'DEG' || boton === 'RAD' ? 'success' : 'medium')"
              @click="presionar(boton)"
              translate="no"
            >
              {{ boton }}
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButton } from '@ionic/vue';
import { ref } from 'vue';

const resultado = ref('0');
const buffer = ref('');
const modo = ref('DEG');

const botones = [
  ['C', 'sin', 'cos', '/'],
  ['7', '8', '9', 'X'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', ')', '='], // Agregamos el paréntesis de cierre para que no de error
  ['DEG', 'RAD', 'sqrt', 'sqrt'] // Agregamos los botones de modo
];

const presionar = (boton: string) => {
  if (boton === 'C') {
    resultado.value = '0';
    buffer.value = '';
  } else if (boton === 'DEG' || boton === 'RAD') {
    modo.value = boton;
  } else if (boton === '=') {
    try {
      buffer.value = resultado.value + ' =';
      let expresion = resultado.value.replace(/X/g, '*');

      // Si es DEG, convertimos el valor dentro de los paréntesis a radianes
      if (modo.value === 'DEG') {
        expresion = expresion.replace(/sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)');
        expresion = expresion.replace(/cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)');
      } else {
        expresion = expresion.replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos');
      }
      
      expresion = expresion.replace(/sqrt/g, 'Math.sqrt');
      
      const res = eval(expresion);
      resultado.value = Number.isInteger(res) ? res.toString() : res.toFixed(4).toString();
    } catch {
      resultado.value = 'Error';
    }
  } else if (['sin', 'cos', 'sqrt'].includes(boton)) {
    if (resultado.value === '0') resultado.value = boton + '(';
    else resultado.value += boton + '(';
  } else {
    if (resultado.value === '0' && boton !== '.') resultado.value = boton;
    else resultado.value += boton;
  }
};

const esOperador = (b: string) => ['/', 'X', '-', '+', '=', 'sin', 'cos', 'sqrt', 'C'].includes(b);
</script>

<style scoped>
/* Tu estilo se mantiene igual */
.display {
  background: #1e1e1e;
  color: rgba(255, 255, 255, 0.97);
  padding: 20px;
  text-align: right;
  border-radius: 10px;
  margin-bottom: 20px;
  min-height: 120px;
  border: 2px solid #333;
}
.display h1 { margin: 0; font-size: 3.5rem; }
.operacion { color: #888; font-size: 1.2rem; min-height: 1.5rem; }
ion-button { --border-radius: 10px; font-weight: bold; height: 65px; font-size: 1.2rem; }
</style>