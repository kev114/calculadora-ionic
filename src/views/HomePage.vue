<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <ion-title>Calculadora cientifica</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="display" translate="no">
        <div class="operacion">{{ buffer }}</div>
        <h1>{{ resultado }}</h1>
      </div>

      <ion-grid>
        <ion-row v-for="fila in botones" :key="fila">
          <ion-col size="3" v-for="boton in fila" :key="boton">
            <ion-button 
              expand="block" 
              :color="esOperador(boton) ? 'warning' : 'medium'" 
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

const botones = [
  ['C', 'sin', 'cos', '/'],
  ['7', '8', '9', 'X'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '=', 'sqrt']
];

const presionar = (boton: string) => {
  if (boton === 'C') {
    resultado.value = '0';
    buffer.value = '';
  } else if (boton === '=') {
    try {
      // Lógica simple de reemplazo para evaluar
      let expresion = resultado.value.replace(/X/g, '*')
                                  .replace(/sin/g, 'Math.sin')
                                  .replace(/cos/g, 'Math.cos')
                                  .replace(/sqrt/g, 'Math.sqrt');
      resultado.value = eval(expresion).toString();
    } catch {
      resultado.value = 'Error';
    }
  } else if (['sin', 'cos', 'sqrt'].includes(boton)) {
    // Esto hace que al picar 'sin' escriba 'sin(' para que el usuario ponga el número
    if (resultado.value === '0') resultado.value = boton + '(';
    else resultado.value += boton + '(';
  } else {
    if (resultado.value === '0') resultado.value = boton;
    else resultado.value += boton;
  }
};  

const esOperador = (b: string) => ['/', 'X', '-', '+', '=', 'sin', 'cos', 'sqrt', 'C'].includes(b);
</script>

<style scoped>
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