# TODO — Simulador Macro ABM · España

> Rama activa: `feature/abm-simulation`
> Stack: React + Vite · spainDataCatalog.js · abmEngine.js · useABMSimulation.js · ABMVisualizerModal.jsx

---

## ✅ Completado

- [x] **Datos Reales IGAE/Eurostat 2010-2024**: `spainDataCatalog.js` con PIB, deuda, gasto COFOG, desglose salarios públicos por función.
- [x] **Motor ABM 2.500 Agentes**: `abmEngine.js` con jubilados, asalariados, desempleados, pymes y empleados públicos en lienzo 2D con distritos urbanos.
- [x] **Sub-cohortes de Funcionarios**: Sanitarios, docentes, defensa/seguridad, administración general, justicia y resto AAPP con salarios medios brutos y masa salarial real.
- [x] **Pestaña 🏦 Laboratorio de Deuda**: KPIs agregados, ranking interactivo de partidas de gasto, masa salarial pública y calculadora "¿Puede España pagar su deuda en 1 año?".
- [x] **Choque `extreme_austerity`**: Simulación de austeridad severa en vivo en el micro-mundo ABM.
- [x] **Idea #1 — Máquina del Tiempo de la Deuda Española (1980–2024)**:
  - Serie histórica anual de 45 años en `DEBT_TIMELINE` (Banco de España y Eurostat PDE).
  - Gráfico de área SVG interactivo con gradiente y línea del Límite de Maastricht (60% PIB).
  - Slider temporal 1980–2024 con cursor vertical reactivo y 8 botones de salto rápido a hitos clave.
  - Tarjeta de detalle: ratio Deuda/PIB, deuda nominal en B€, tipo de bono 10Y y hito histórico.
- [x] **Idea #10 — Calibración Sociodemográfica con Datos EPA Reales (INE)**:
  - Catálogo trimestral `EPA_DATA` (8 trimestres: 3T2022 a 2T2024).
  - Selector de trimestre en columna derecha del Canvas tab.
  - Reconfiguración dinámica de proporciones (paro, salario mediano, brecha de género).
  - Botón `↺ Recalibrar` con regeneración instantánea de los 2.500 agentes.

---

## 📋 Roadmap de Próximas Ideas

- [x] **Idea #12 — Calculadora de "Ruta al 30%" (Vía del Crecimiento + Palancas de Gasto)**:
  - Palancas de ingresos: afloramiento economía sumergida (0-5 pp), tipo efectivo Sociedades (17%-25%), crecimiento PIB nominal (1%-7%), IED (0-3%), formalización de autónomos (0-50%).
  - Palancas de gasto: reducción gasto no esencial (0-15%), eficiencia administrativa (0-10%).
  - Proyección dinámica año a año a 30 años (2024-2054) con gráfico SVG de doble curva (escenario activo vs. inmovilismo).
  - Cálculo de años para alcanzar el 60% (Maastricht) y el 30% (nivel de 1980) e intereses totales pagados.
- [x] **Idea #16 — El Desafío Demográfico y el "Muro de las Pensiones" (Baby Boom 2025–2045)**:
  - Integración del gasto vegetativo de pensiones proyectado por AIReF y Eurostat (+2 a +4 pp de PIB en 2040).
  - Palancas de reforma: retraso de edad efectiva de jubilación, saldo migratorio neto y Mecanismo de Equidad Intergeneracional (MEI).
  - Alerta de cruce: ¿cuándo el envejecimiento devora el crecimiento y cuándo las reformas logran compensarlo?

---

## 📋 Roadmap de Próximas Ideas

### ⭐ Idea #13 — Conector ABM: Feedback Loop Micro-Macro de las Reformas
> **Qué**: Conectar directamente los deslizadores de la "Ruta al 30%" con el motor ABM de los 2.500 agentes para medir daños colaterales y efectos secundarios:
> - **Afloramiento sumergido**: Tasa de quiebra en microempresas y autónomos vulnerables al pasar al 100% formal.
> - **Impuesto de Sociedades**: Elasticidad del capital, posible fuga de inversión o ajuste de plantillas en grandes empresas.
> - **Recorte de gasto público**: Impacto multiplicador keynesiano en consumo privado de los hogares y demanda interna.
> - **Métricas resultantes**: Evolución del Índice Gini, tasa de paro efectiva y pobreza relativa durante la consolidación fiscal.

### ⭐ Idea #14 — Prima de Riesgo Dinámica y Diferencial $(r - g)$ Endógeno
> **Qué**: El tipo de interés de la deuda no es estático ($3,2\%$). En los mercados de deuda soberana:
> - Si la deuda/PIB supera el 100%, los inversores exigen un spread creciente (+25 a +150 pb).
> - Si la deuda baja del 70% o 60%, España accede a tipos de financiación más bajos (círculo virtuoso nórdico/alemán).
> - Permite visualizar el umbral crítico donde la deuda entra en espiral viciosa o se vuelve autosostenible.

### ⭐ Idea #15 — Comparador de "Grandes Pactos" Históricos (Presets 1-Clic)
> **Qué**: Botones de presets para probar estrategias macroeconómicas documentadas:
> - 🇪🇸 **Boom 1996–2007**: Crecimiento nominal al 7%, tipos reales bajos, deuda cae del 67% al 36% por volumen de PIB.
> - 🇩🇪 **Freno Constitucional a la Deuda (Schuldenbremse)**: Superávit primario estricto del 1,5% y contención de gasto.
> - 📉 **Vía Oferta / Curva de Laffer**: Rebaja impositiva selectiva para ensanchar base tributaria.
> - 🇪🇺 **Plan Draghi (Inversión en Productividad e I+D)**: Déficit temporal financiado para elevar el crecimiento potencial a largo plazo.

---

### Idea #2 — Simulador de "Planes de Rescate" Históricos
> **Qué**: Selector de políticas reales de consolidación fiscal aplicadas en otros países:
> - 🇬🇷 **Troika griego (2010-2015)**: Recorte brutal del 30% del gasto → colapso del PIB del 25%, paro al 28%.
> - 🇵🇹 **Gradualismo portugués (2011-2019)**: Ajuste lento y sostenido → vuelta al crecimiento en 2014.
> - 🇨🇦 **Canada 1994**: Recorte de gasto + reforma de administración + boom exportador → deuda saneada en 10 años.
> - 🇯🇵 **Japón**: Deuda al 260% del PIB, monetización del banco central. ¿Por qué no quebró? (moneda propia + ahorro doméstico).
> El usuario selecciona una estrategia, el ABM la simula durante 36 meses y muestra las curvas de paro, PIB, Gini y Paz Social emergentes.

### Idea #3 — Multiplicador Fiscal Dinámico
> **Qué**: Mostrar en tiempo real que cada euro recortado no ahorra 1€ neto.
> El multiplicador fiscal empírico para la Eurozona estimado por el FMI post-2008 es ~1.5.
> Un recorte de 10.000 M€ destruye 15.000 M€ de PIB (vía menos consumo, más paro, menos recaudación).
> Añadir un control deslizante de "importe del recorte" con calculadora: ahorro bruto, impacto en PIB,
> pérdida de recaudación derivada, ahorro neto real y años que acorta el plazo de pago de la deuda.

### Idea #4 — Mercado de Bonos Soberanos Simulado (Prima de Riesgo)
> **Qué**: Inversores institucionales como agentes (fondos de pensiones alemanes, BCE, hedge funds).
> Si la ratio Deuda/PIB supera umbrales, exigen mayor tipo de interés en las subastas.
> Cada subida de 100 pb en la prima de riesgo añade ~12.000 M€ anuales de coste financiero.
> Recrea exactamente la dinámica de 2012: España pagaba 6.7% vs. Alemania al 1.5%.

### Idea #5 — Generaciones Superpuestas (OLG — Overlapping Generations)
> **Qué**: Los agentes envejecen (cada mes de simulación ≈ 1 año de vida).
> Emerge el **conflicto intergeneracional**: ratio cotizantes/pensionistas dinámico, sostenibilidad de
> las pensiones en función de la natalidad y la inmigración.
> ¿Quién paga la deuda acumulada por generaciones anteriores?

### Idea #6 — Contagio Social y Expectativas Adaptativas
> **Qué**: Añadir expectativas adaptativas (un agente ajusta su consumo viendo lo que hacen sus vecinos).
> Emergen: pánico bancario, deflación por expectativas y burbujas especulativas.
> Es el mecanismo central detrás de las crisis financieras desde Keynes ("animal spirits").

### Idea #7 — "El Dilema del Ministro de Hacienda" (Modo Juego)
> **Qué**: Modo narrativo donde el usuario es el Ministro de Hacienda.
> ¿Subo el IVA o recorto sanidad? ¿Negocio con Bruselas o incumplo el déficit? ¿Subo el SMI o congelo pensiones?
> Los 2.500 agentes ABM reaccionan: votan, protestan, consumen o ahorran más.
> Al final del mandato (4 años de simulación) se evalúa: deuda, paro, Gini, aprobación popular.

### Idea #8 — "¿Cuándo llegamos al límite?" (Proyección a 20 años)
> **Qué**: El simulador proyecta 20 años de dinámica de deuda bajo distintos escenarios:
> - Escenario base: condiciones actuales → ¿la deuda es sostenible?
> - Escenario recesión: crecimiento cae al -1% durante 3 años → ¿umbral de quiebra?
> - Escenario tipos altos: BCE sube tipos al 5% → ¿cuándo el coste financiero supera al gasto en sanidad?
> - Escenario reformas: crecimiento potencial sube al 3% → ¿en cuántos años baja la deuda al 60%?
> Interfaz con curvas de abanico (fan chart) como las del Banco de España.

### Idea #9 — Panel de Deuda Comparada (Europa)
> **Qué**: España junto a Alemania, Francia, Italia, Grecia y Japón en un panel comparativo.
> Para cada país: deuda/PIB, déficit, tipo del bono 10Y, prima de riesgo vs. Bund alemán,
> ratio cotizantes/pensionistas y calificación crediticia.
> "¿Por qué Italia con el 145% de deuda no ha quebrado y Grecia con el 100% sí?"

### Idea #11 — Sectores Productivos Dinámicos
> **Qué**: Las 150 pymes actuales son genéricas. Dividirlas en sectores reales:
> - 🏨 Turismo y Hostelería (25% del PIB en zonas costeras, muy sensible al IVA)
> - 🏗️ Construcción e Inmobiliario (sensible a tipos hipotecarios)
> - 🏭 Industria y Manufactura (sensible a costes laborales)
> - 💻 Tecnología y Servicios Avanzados (sensible a I+D+i)
> - 🌾 Agricultura y Agroalimentaria (introduce riesgo climático vía PAC y sequía)
> Permite ver si los choques fiscales afectan igual a una comarca turística que a una zona industrial.
