# 🏛️ Simulador de Grandes Cifras & Centro de Mando Estatal (PWA)

> **Simulador macroeconómico, pedagógico, visual e inmersivo** diseñado para comprender intuitivamente las magnitudes astronómicas del dinero público ($10^6$ a $10^{14}$), experimentar la teoría de juegos (Dilema del Prisionero) y gestionar una civilización viva mediante autómatas celulares y arquitectura 100% P2P serverless.

🌐 **Demo en Vivo (GitHub Pages):** [https://estoyqueloleo-max.github.io/bignumbers/](https://estoyqueloleo-max.github.io/bignumbers/)

---

> [!NOTE]
> **Nota de Desarrollo & Repaso Completo:**
> Este repositorio contiene la suite completa **Master Edition (v9.0)** desarrollada paso a paso. Consulta [TODO.md](./TODO.md) para ver el registro detallado de todas las fases y módulos integrados.

---

## ✨ Características Principales

### 1. 🏙️ Micro-Mundo SimCity & Game of Life Demográfico
* **Lienzo Canvas 60fps:** La ciudad evoluciona visualmente de casas rurales a rascacielos iluminados, cúpulas de fusión y cohetes espaciales a medida que el tesoro escala de Millones a Trillones.
* **Muñequitos y Ciudadanos Vivos:** Ciudadanos paseando en superávit, manifestaciones con pancartas en déficit y ambulancias/policías patrullando en emergencias.
* **Game of Life de Conway:** Las leyes de natalidad y supervivencia celular se ven afectadas por la presión fiscal, sanidad e infraestructura.
* **Arena Genética Bicolor:** Modo de duelo territorial donde dos naciones y políticas fronterizas compiten por dominar el mapa.
* **Ciclo Solar Continuo & Clima Dinámico:** Transición día/noche, lluvia con relámpagos en crisis y fuegos artificiales en superávits históricos.

### 2. 🌐 Asamblea Global & Efecto Ender (Teoría de Juegos)
* **Dilema del Prisionero Multilateral:** Vota y coopera con 3 arquetipos de IA (*El Tecnócrata Racional*, *El Oportunista / Free-Rider*, *Tit-for-Tat*).
* **Globo Terráqueo 3D Geopolítico:** Esfera rotatoria interactiva con haces de luz de cooperación y smog sobre desertores.
* **El Efecto Ender:** Tras cada votación, se contrasta tu decisión con datos reales y presupuestos de la Tierra (SIPRI, OMS, FMI, NASA).

### 3. 📜 Pasaporte Soberano & Criptografía Local (Web Crypto API)
* **Firmas Asimétricas ECDSA P-256 / SHA-256:** Tu navegador genera una clave pública/privada y una huella digital (`PRES-XXXXXXXX`).
* **Certificación de Récords:** Firma tus logros y compártelos sin intermediarios ni blockchain.
* **Verificador Universal:** Pega el acta de un amigo para comprobar matemáticamente que sus cifras son 100% auténticas y no fueron editadas en consola.

### 4. 📬 Diplomacia Asíncrona por Relevos (Ajedrez Postal P2P)
* Gobierna 12 meses, redacta un tratado internacional (*Libre Comercio*, *Descarbonización*, *Intercambio Científico*, *Desarme*) y genera una **Cápsula de Estado** (`#treaty=...`) para enviarla vía WhatsApp o Pingo.

### 5. 🌊 Flujo Financiero Sankey & Árbol Tecnológico
* **Sankey con Partículas Luminosas:** Visualización interactiva en tiempo real de caudales (Impuestos ➔ Tesoro ➔ Sanidad, Deuda e Infraestructura).
* **Árbol Tecnológico en Grafo:** Ramas de civilización de Energía, Bio-Sociedad y Espacio conectadas por haces luminosos.

### 6. ⚙️ Motor de Reglas, Mods & Gaceta Imprimible
* **Modding Extensible:** Crea y calibra modificadores globales (*Solarpunk*, *Distopía Financiera*, *Renta Básica*).
* **Exportador de la Gaceta Oficial:** Descarga una portada de periódico histórica de alta resolución en PNG con el sello oficial de estado.
* **Paleta de Comandos `Ctrl + K`:** Controla todo el país con el teclado a la velocidad de la luz.
* **Sintetizador Web Audio:** Música ambiental *synthwave* procedural y efectos de sonido nativos.
* **Skins de Época:** *Cyberpunk Glass*, *Búnker Retro CRT 1983* y *Blueprint Arquitectónico*.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React 19 + Vite 8
* **PWA & Offline:** `vite-plugin-pwa` + Workbox (Precacheo y Web Share Target)
* **Gráficos & Animaciones:** HTML5 Canvas (60fps), SVG puro y Vanilla CSS Glassmorphism
* **Criptografía:** `window.crypto.subtle` (ECDSA P-256 / SHA-256)
* **Red P2P:** WebRTC DataChannels Serverless + Web Share API
* **Audio:** Web Audio API Procedural

---

## 🚀 Instalación y Despliegue Local

```bash
# Clonar repositorio
git clone git@github.com-estoyqueloleo:estoyqueloleo-max/bignumbers.git
cd bignumbers

# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

## 📄 Licencia

MIT © 2026 Jose (estoyqueloleo-max)
