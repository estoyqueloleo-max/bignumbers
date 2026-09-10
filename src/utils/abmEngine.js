/**
 * abmEngine.js — Motor de Simulación Basada en Agentes (Agent-Based Modeling)
 *
 * Simula una muestra estadística representativa (ej. 2.000 a 3.000 agentes)
 * con micro-decisiones individuales de consumo, ahorro, empleo, tributación y protesta.
 *
 * Las magnitudes macroeconómicas (PIB, desempleo, recaudación, Gini, paz social)
 * emergen desde el comportamiento agregado de los agentes individuales.
 */

// ─── Nombres y Apellidos para Agentes ────────────────────────────────────────

const FIRST_NAMES_M = [
  'Antonio', 'Manuel', 'José', 'Francisco', 'David', 'Juan', 'Javier', 'Daniel',
  'Carlos', 'Jesús', 'Alejandro', 'Miguel', 'Rafael', 'Pedro', 'Ángel', 'Pablo',
  'Sergio', 'Fernando', 'Jorge', 'Luis', 'Alberto', 'Álvaro', 'Adrián', 'Diego'
];

const FIRST_NAMES_F = [
  'María', 'Carmen', 'Ana', 'Isabel', 'Laura', 'Cristina', 'Marta', 'Elena',
  'Lucía', 'Sara', 'Paula', 'Raquel', 'Rosa', 'Pilar', 'Teresa', 'Beatriz',
  'Nuria', 'Patricia', 'Silvia', 'Irene', 'Alba', 'Rocío', 'Andrea', 'Clara'
];

const SURNAMES = [
  'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez',
  'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno',
  'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres', 'Domínguez',
  'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Molina', 'Morales'
];

const FIRM_SECTORS = [
  'Hostelería & Turismo', 'Construcción & Reformas', 'Comercio Minorista',
  'Tecnología & Software', 'Agroalimentario & Distribución', 'Metalurgia & Fabricación',
  'Transporte & Logística', 'Servicios Profesionales & Asesoría'
];

export function getRandomName() {
  const isFemale = Math.random() > 0.5;
  const first = isFemale
    ? FIRST_NAMES_F[Math.floor(Math.random() * FIRST_NAMES_F.length)]
    : FIRST_NAMES_M[Math.floor(Math.random() * FIRST_NAMES_M.length)];
  const s1 = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const s2 = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  return `${first} ${s1} ${s2}`;
}

// ─── Generación de Población Inicial ──────────────────────────────────────────

/**
 * Crea una población de agentes calibrada con la estructura demográfica española.
 * @param {number} count - Número de agentes a generar (ej. 2500)
 * @param {object} baseConfig - Configuración base del estado del juego
 * @param {object} abmCalibration - Calibración salarial real por sub-cohort (de getDebtLabData)
 */
export function createABMPopulation(count = 2500, baseConfig = {}, abmCalibration = {}) {
  const baseIncome = baseConfig.baseIncomePerCapita || 1800;
  const targetUnempRate = (baseConfig.unemploymentRate !== undefined ? baseConfig.unemploymentRate : 14.0) / 100;

  // Salarios reales por sub-cohort de funcionario (fallback a valores 2019)
  const wageCalib = {
    health:    abmCalibration.health    || 2010,
    education: abmCalibration.education || 2060,
    defense:   abmCalibration.defense   || 2220,
    admin:     abmCalibration.admin     || 2080,
    justice:   abmCalibration.justice   || 2760,
  };

  // Proporciones objetivo de sub-cohorts públicos (por función, proporcionales al empleo real)
  // Educación 32%, Sanidad 26%, Admin 21%, Defensa 9%, Justicia 7%, Otros 5%
  const PUBLIC_WORKER_SUBCOHORTS = [
    { key: 'education_worker', label: 'Docente', weight: 0.32, income: wageCalib.education },
    { key: 'health_worker',    label: 'Sanitario',  weight: 0.26, income: wageCalib.health },
    { key: 'admin_worker',     label: 'Funcionario AAPP', weight: 0.21, income: wageCalib.admin },
    { key: 'defense_worker',   label: 'Defensa/Seguridad', weight: 0.09, income: wageCalib.defense },
    { key: 'justice_worker',   label: 'Justicia',  weight: 0.07, income: wageCalib.justice },
    { key: 'public_worker',    label: 'Empleado Público', weight: 0.05, income: wageCalib.admin }, // Resto AAPP
  ];

  // Construir tabla de umbrales acumulados para sub-cohorts públicos
  let cumulativePublicWeight = 0;
  const publicCohortThresholds = PUBLIC_WORKER_SUBCOHORTS.map(sc => {
    cumulativePublicWeight += sc.weight;
    return { ...sc, cumWeight: cumulativePublicWeight };
  });

  const pctRetired = 0.22;
  const pctPublicWorker = 0.08; // ~8% de la población activa
  const pctFirmOwner = 0.12;
  const pctActivePrivate = 1 - (pctRetired + pctPublicWorker + pctFirmOwner); // ~0.58
  const pctUnemployed = pctActivePrivate * targetUnempRate;

  const agents = [];
  const firms = [];

  // 1. Crear agentes
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let cohort;
    let subLabel = null;
    let age;
    let income = 0;
    let savings = Math.floor(500 + Math.random() * 15000);

    if (roll < pctRetired) {
      cohort = 'retired';
      age = Math.floor(65 + Math.random() * 25);
      income = Math.floor(baseIncome * (0.55 + Math.random() * 0.45)); // Pensión media: 1.000€ - 1.800€
      savings = Math.floor(3000 + Math.random() * 25000);
    } else if (roll < pctRetired + pctPublicWorker) {
      // Sub-cohort de funcionario (por peso relativo real)
      const rollPublic = Math.random();
      const sc = publicCohortThresholds.find(t => rollPublic <= t.cumWeight)
        || PUBLIC_WORKER_SUBCOHORTS[PUBLIC_WORKER_SUBCOHORTS.length - 1];
      cohort = sc.key;
      subLabel = sc.label;
      age = Math.floor(25 + Math.random() * 38);
      income = Math.floor(sc.income * (0.85 + Math.random() * 0.35)); // Variación salarial real ±20%
    } else if (roll < pctRetired + pctPublicWorker + pctFirmOwner) {
      cohort = 'firm_owner';
      age = Math.floor(30 + Math.random() * 32);
      income = Math.floor(baseIncome * (0.8 + Math.random() * 1.2)); // Beneficio inicial autónomo/pyme
      savings = Math.floor(5000 + Math.random() * 35000);
    } else if (roll < pctRetired + pctPublicWorker + pctFirmOwner + pctUnemployed) {
      cohort = 'unemployed';
      age = Math.floor(20 + Math.random() * 42);
      income = Math.floor(baseIncome * 0.45); // Subsidio por desempleo
      savings = Math.floor(100 + Math.random() * 2500);
    } else {
      cohort = 'employed';
      age = Math.floor(22 + Math.random() * 42);
      income = Math.floor(baseIncome * (0.7 + Math.random() * 0.6)); // Salario asalariado
    }

    // Ubicación espacial por distrito
    let district, baseX, baseY;
    if (cohort === 'retired') {
      district = 'Residencial / Parques'; baseX = 200; baseY = 150;
    } else if (cohort === 'employed' || cohort === 'unemployed') {
      district = 'Barrio Obrero / Servicios'; baseX = 200; baseY = 350;
    } else if (cohort === 'firm_owner') {
      district = 'Polígono Industrial & Comercios'; baseX = 600; baseY = 150;
    } else {
      // Todos los funcionarios → Distrito Administrativo & Salud
      district = 'Distrito Administrativo & Salud'; baseX = 600; baseY = 350;
    }
    const x = Math.max(30, Math.min(770, baseX + (Math.random() - 0.5) * 280));
    const y = Math.max(30, Math.min(470, baseY + (Math.random() - 0.5) * 200));

    const agent = {
      id: i + 1,
      name: getRandomName(),
      cohort,
      subLabel, // Especialidad del funcionario (null si no es funcionario)
      age,
      income,
      baseIncome: income,
      savings,
      consumption: 0,
      taxPaid: 0,
      vatPaid: 0,
      satisfaction: Math.floor(65 + Math.random() * 30),
      isProtesting: false,
      health: Math.floor(75 + Math.random() * 25),
      monthsUnemployed: cohort === 'unemployed' ? Math.floor(1 + Math.random() * 10) : 0,
      firmId: null,
      district,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
    };


    agents.push(agent);

    // Si es firm_owner, crear entidad de empresa asociada
    if (cohort === 'firm_owner') {
      firms.push({
        id: agent.id,
        ownerId: agent.id,
        name: `Pyme ${FIRM_SECTORS[Math.floor(Math.random() * FIRM_SECTORS.length)]}`,
        employees: [],
        monthlyRevenue: 0,
        monthlyProfit: 0,
        wageCost: 0,
        cashReserve: agent.savings * 0.5,
        monthsLosses: 0,
      });
    }
  }

  // Asignar trabajadores a empresas
  const firmCount = firms.length;
  if (firmCount > 0) {
    agents.forEach(a => {
      if (a.cohort === 'employed') {
        const firm = firms[Math.floor(Math.random() * firmCount)];
        firm.employees.push(a.id);
        a.firmId = firm.id;
      }
    });
  }

  return { agents, firms };
}

// ─── Constante: cohorts que son empleados públicos ───────────────────────────
export const PUBLIC_COHORT_KEYS = [
  'public_worker', 'health_worker', 'education_worker',
  'defense_worker', 'admin_worker', 'justice_worker',
];

// ─── Paso de Simulación Micro (Tick Mensual) ──────────────────────────────────

/**
 * Ejecuta un mes de simulación en el micro-mundo de agentes.
 * @param {object} abmState - { agents, firms }
 * @param {object} params - { taxRate, ministryAllocations, inflationRate, shock }
 *
 * Shocks disponibles:
 *   'austerity'        → Recorte 25% pensiones, consumo -15%
 *   'stimulus'         → Bono de consumo +25%
 *   'lockdown'         → Confinamiento: consumo -35%
 *   'extreme_austerity'→ "Pagar la deuda en 1 año": recorte 80% de todo excepto intereses
 */
export function stepABMSimulation(abmState, params = {}) {
  const { agents, firms } = abmState;
  const taxRate = params.taxRate || 1.0;
  const socialAlloc = (params.ministryAllocations?.social ?? 40) / 100;
  const healthAlloc = (params.ministryAllocations?.health ?? 20) / 100;
  const rdAlloc = (params.ministryAllocations?.rd ?? 15) / 100;
  const shock = params.shock || null;

  // Mapa de empresas para búsqueda rápida
  const firmMap = new Map();
  firms.forEach(f => {
    f.monthlyRevenue = 0;
    f.wageCost = 0;
    firmMap.set(f.id, f);
  });

  const shockConsumptionFactor = shock === 'austerity'         ? 0.85
    : shock === 'stimulus'          ? 1.25
    : shock === 'lockdown'          ? 0.65
    : shock === 'extreme_austerity' ? 0.40  // Todo congelado: solo subsistencia
    : 1.0;
  const shockPensionFactor    = shock === 'austerity'         ? 0.75
    : shock === 'extreme_austerity' ? 0.30  // Pensiones recortadas al mínimo vital
    : 1.0;
  const shockPublicWageFactor = shock === 'extreme_austerity' ? 0.20  // Sólo se paga el mínimo funcional
    : 1.0;

  // ─── FASE 1: INGRESOS E IMPUESTOS DIRECTOS (IRPF) ───────────────────────────
  let totalDirectTax = 0;
  let totalPensionsPaid = 0;
  let totalSubsidiesPaid = 0;
  let totalPublicWages = 0;

  agents.forEach(a => {
    // Ajustar ingresos según cohorte y políticas públicas
    if (a.cohort === 'retired') {
      const pensionRatio = Math.max(0.4, socialAlloc / 0.40);
      a.income = Math.floor(a.baseIncome * pensionRatio * shockPensionFactor);
      totalPensionsPaid += a.income;
    } else if (a.cohort === 'unemployed') {
      const subsidyRate = Math.max(0.3, 0.7 - (a.monthsUnemployed * 0.03));
      a.income = Math.floor(a.baseIncome * subsidyRate * (socialAlloc / 0.40));
      a.monthsUnemployed++;
      totalSubsidiesPaid += a.income;
    } else if (PUBLIC_COHORT_KEYS.includes(a.cohort)) {
      // Todos los funcionarios: salario real calibrado, afectado por austeridad extrema
      a.income = Math.floor(a.baseIncome * shockPublicWageFactor);
      totalPublicWages += a.income;
    } else if (a.cohort === 'employed') {
      a.income = a.baseIncome;
      const firm = firmMap.get(a.firmId);
      if (firm) firm.wageCost += a.income;
    }

    // Cálculo del IRPF (impuesto directo)
    // Tasa progresiva según nivel de ingresos multiplicada por la presión fiscal general
    const baseBracket = a.income > 2500 ? 0.28 : (a.income > 1400 ? 0.19 : 0.10);
    const effectiveTaxRate = Math.min(0.50, baseBracket * taxRate);
    a.taxPaid = Math.floor(a.income * effectiveTaxRate);
    totalDirectTax += a.taxPaid;

    // Renta disponible neta
    const netIncome = Math.max(0, a.income - a.taxPaid);

    // ─── FASE 2: CONSUMO Y AHORRO (Demanda agregada) ──────────────────────────
    // Propensión marginal al consumo: los de menor renta consumen casi todo su ingreso
    const propensityToConsume = a.cohort === 'unemployed' || a.cohort === 'retired'
      ? 0.94
      : (a.income > 2500 ? 0.65 : 0.82);

    const targetConsumption = netIncome * propensityToConsume * shockConsumptionFactor;

    // Si la renta no llega para lo básico, tira de ahorros
    let actualConsumption = targetConsumption;
    if (actualConsumption > netIncome) {
      const deficit = actualConsumption - netIncome;
      const withdrawn = Math.min(a.savings, deficit);
      a.savings -= withdrawn;
    } else {
      // Ahorra el remanente
      a.savings += Math.floor(netIncome - actualConsumption);
    }

    // IVA (Impuesto Indirecto sobre consumo, ~21%)
    a.vatPaid = Math.floor(actualConsumption * 0.18 * taxRate);
    a.consumption = actualConsumption;

    // El gasto en consumo se reparte entre las empresas del país
    const randomFirm = firms[Math.floor(Math.random() * firms.length)];
    if (randomFirm) {
      randomFirm.monthlyRevenue += actualConsumption - a.vatPaid;
    }
  });

  // ─── FASE 3: MERCADO EMPRESARIAL (Contratación y Despido) ───────────────────
  let totalCorporateTax = 0;
  const newlyUnemployedIds = [];
  const newlyEmployedIds = [];

  // Pool de desempleados disponibles
  const unemployedPool = agents.filter(a => a.cohort === 'unemployed');

  firms.forEach(f => {
    // Beneficio neto de la empresa
    const grossProfit = f.monthlyRevenue - f.wageCost - (f.monthlyRevenue * 0.12); // 12% costes fijos
    const corpTaxRate = Math.min(0.35, 0.22 * taxRate);
    const corpTax = grossProfit > 0 ? Math.floor(grossProfit * corpTaxRate) : 0;
    totalCorporateTax += corpTax;

    f.monthlyProfit = grossProfit - corpTax;
    f.cashReserve += f.monthlyProfit;

    // LÓGICA DE CONTRATACIÓN Y DESPIDO:
    if (f.monthlyProfit < 0) {
      f.monthsLosses++;
      // Si lleva 2 meses en pérdidas y tiene empleados, despide a uno
      if (f.monthsLosses >= 2 && f.employees.length > 0) {
        const firedId = f.employees.pop();
        newlyUnemployedIds.push(firedId);
        f.monthsLosses = 0;
      }
    } else {
      f.monthsLosses = Math.max(0, f.monthsLosses - 1);
      // Si la empresa tiene beneficios fuertes y hay desempleados, contrata a uno
      const hiringThreshold = 1800 + (rdAlloc * 500); // I+D favorece expansión
      if (f.monthlyProfit > hiringThreshold && unemployedPool.length > 0 && Math.random() < 0.35) {
        const candidate = unemployedPool.pop();
        f.employees.push(candidate.id);
        newlyEmployedIds.push({ candidateId: candidate.id, firmId: f.id });
      }
    }
  });

  // Aplicar despidos y contrataciones
  newlyUnemployedIds.forEach(id => {
    const ag = agents.find(a => a.id === id);
    if (ag) {
      ag.cohort = 'unemployed';
      ag.firmId = null;
      ag.monthsUnemployed = 1;
      ag.satisfaction = Math.max(5, ag.satisfaction - 40);
    }
  });

  newlyEmployedIds.forEach(({ candidateId, firmId }) => {
    const ag = agents.find(a => a.id === candidateId);
    if (ag) {
      ag.cohort = 'employed';
      ag.firmId = firmId;
      ag.monthsUnemployed = 0;
      ag.satisfaction = Math.min(95, ag.satisfaction + 35);
    }
  });

  // ─── FASE 4: BIENESTAR, SALUD Y PROTESTAS ──────────────────────────────────
  let totalProtesting = 0;

  agents.forEach(a => {
    // Salud influenciada por gasto sanitario público
    const healthGain = (healthAlloc - 0.20) * 8;
    a.health = Math.max(10, Math.min(100, a.health + healthGain + (Math.random() - 0.5) * 2));

    // Satisfacción individual: función de su renta real, empleo, salud y ayudas
    let targetSatisfaction = 70;
    if (a.cohort === 'unemployed') {
      targetSatisfaction -= 35;
      if (a.monthsUnemployed > 6) targetSatisfaction -= 15;
    } else if (a.cohort === 'retired' && socialAlloc < 0.25) {
      targetSatisfaction -= 30; // Recorte de pensiones enfurece a los jubilados
    } else if (a.cohort === 'firm_owner' && taxRate > 1.2) {
      targetSatisfaction -= 25; // Asfixia fiscal a pymes
    }

    if (a.health < 40) targetSatisfaction -= 20;
    if (a.savings < 500) targetSatisfaction -= 15;

    // Inercia de satisfacción
    a.satisfaction = Math.round(a.satisfaction * 0.7 + targetSatisfaction * 0.3);

    // ¿Sale a la calle a protestar?
    a.isProtesting = a.satisfaction < 30;
    if (a.isProtesting) totalProtesting++;

    // ─── FASE 5: DINÁMICA ESPACIAL 2D (Movimiento en Canvas) ──────────────────
    if (a.isProtesting) {
      // Los manifestantes marchan hacia la Plaza Mayor / Centro cívico (x: 400, y: 250)
      const dx = 400 - a.x;
      const dy = 250 - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      a.vx = (dx / dist) * 1.5 + (Math.random() - 0.5) * 0.5;
      a.vy = (dy / dist) * 1.5 + (Math.random() - 0.5) * 0.5;
    } else {
      // Movimiento errático natural en su distrito
      a.vx = Math.max(-1.2, Math.min(1.2, a.vx + (Math.random() - 0.5) * 0.3));
      a.vy = Math.max(-1.2, Math.min(1.2, a.vy + (Math.random() - 0.5) * 0.3));
    }

    a.x = Math.max(20, Math.min(780, a.x + a.vx));
    a.y = Math.max(20, Math.min(480, a.y + a.vy));
  });

  return {
    agents,
    firms,
    stats: {
      totalDirectTax,
      totalCorporateTax,
      totalPensionsPaid,
      totalSubsidiesPaid,
      totalPublicWages,
      newlyUnemployed: newlyUnemployedIds.length,
      newlyHired: newlyEmployedIds.length,
      totalProtesting,
    }
  };
}

// ─── Cálculo del Coeficiente de Gini (Desigualdad) ─────────────────────────────

/**
 * Calcula el coeficiente de Gini exacto sobre la riqueza/ahorro de los agentes.
 * @param {Array<number>} values - Array de valores numéricos (ahorros o ingresos)
 * @returns {number} Coeficiente de Gini entre 0 (igualdad total) y 1 (desigualdad máxima)
 */
export function calculateGini(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  let cumulativeSum = 0;
  let weightedSum = 0;

  for (let i = 0; i < n; i++) {
    cumulativeSum += sorted[i];
    weightedSum += (i + 1) * sorted[i];
  }

  if (cumulativeSum === 0) return 0;
  const gini = (2 * weightedSum) / (n * cumulativeSum) - (n + 1) / n;
  return Math.max(0, Math.min(1, Math.round(gini * 1000) / 1000));
}

// ─── Agregación Macroeconómica Emergente ───────────────────────────────────────

/**
 * Agrega los micro-datos de los agentes para proyectar las cifras de España real.
 * @param {Array<object>} agents - Array de agentes
 * @param {number} totalPopulation - Población real (ej. 47.000.000)
 */
export function aggregateABMMacro(agents, totalPopulation = 47000000) {
  if (!agents || agents.length === 0) return null;

  const sampleSize = agents.length;
  const weight = totalPopulation / sampleSize;

  let totalIncome = 0;
  let totalConsumption = 0;
  let totalTaxes = 0;
  let totalPensions = 0;
  let totalSubsidies = 0;
  let totalPublicWageBill = 0;
  let protestingCount = 0;

  const counts = {
    employed: 0,
    unemployed: 0,
    retired: 0,
    firm_owner: 0,
    public_worker: 0,
    health_worker: 0,
    education_worker: 0,
    defense_worker: 0,
    admin_worker: 0,
    justice_worker: 0,
  };

  const savingsList = [];
  const incomeList = [];

  agents.forEach(a => {
    totalIncome += a.income;
    totalConsumption += a.consumption;
    totalTaxes += a.taxPaid + a.vatPaid;
    if (a.cohort === 'retired') totalPensions += a.income;
    if (a.cohort === 'unemployed') totalSubsidies += a.income;
    if (PUBLIC_COHORT_KEYS.includes(a.cohort)) totalPublicWageBill += a.income;
    if (a.isProtesting) protestingCount++;

    counts[a.cohort] = (counts[a.cohort] || 0) + 1;
    savingsList.push(a.savings);
    incomeList.push(a.income);
  });

  // Tasa de desempleo emergente
  const totalPublicWorkers = PUBLIC_COHORT_KEYS.reduce((s, k) => s + (counts[k] || 0), 0);
  const activePop = counts.employed + counts.unemployed + counts.firm_owner + totalPublicWorkers;
  const emergentUnemploymentRate = activePop > 0
    ? Math.round((counts.unemployed / activePop) * 1000) / 10
    : 14.0;

  // Paz social emergente
  const protestRate = (protestingCount / sampleSize) * 100;
  const emergentSocialPeace = Math.max(10, Math.min(100, Math.round(100 - (protestRate * 2.5))));

  // Coeficiente de Gini
  const wealthGini = calculateGini(savingsList);
  const incomeGini = calculateGini(incomeList);

  // Cifras macro proyectadas a escala nacional mensual
  const projectedMonthlyRevenue = Math.round(totalTaxes * weight);
  const projectedMonthlyGDP = Math.round((totalConsumption + (totalIncome * 0.35)) * weight);
  const projectedMonthlyPensions = Math.round(totalPensions * weight);
  const projectedMonthlyPublicWages = Math.round(totalPublicWageBill * weight);

  return {
    sampleSize,
    agentWeight: Math.round(weight),
    counts,
    totalPublicWorkers,
    emergentUnemploymentRate,
    emergentSocialPeace,
    wealthGini,
    incomeGini,
    protestRate: Math.round(protestRate * 10) / 10,
    projectedMonthlyRevenue,
    projectedMonthlyGDP,
    projectedMonthlyPensions,
    projectedMonthlyPublicWages,
  };
}
