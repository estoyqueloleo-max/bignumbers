// Datos de equivalencia física y temporal para grandes cifras

export const getRealWorldTimeEquivalent = (dollars) => {
  // Si contaras 1 dólar por segundo sin parar:
  const seconds = Math.max(0, dollars);
  if (seconds < 60) {
    return `${Math.round(seconds)} segundos`;
  }
  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${minutes.toFixed(1)} minutos`;
  }
  const hours = minutes / 60;
  if (hours < 24) {
    return `${hours.toFixed(1)} horas`;
  }
  const days = hours / 24;
  if (days < 365) {
    return `${days.toFixed(1)} días`;
  }
  const years = days / 365.25;
  if (years < 1000) {
    return `${years.toFixed(1)} años`;
  }
  if (years < 1000000) {
    return `${(years / 1000).toFixed(1)} milenios (${years.toLocaleString('es-ES', { maximumFractionDigits: 0 })} años)`;
  }
  return `${(years / 1000000).toFixed(2)} millones de años`;
};

export const PHYSICAL_ANALOGIES = [
  {
    threshold: 1e6, // 1 Millón
    title: '1 Millón ($10⁶)',
    timeText: '11.5 días contando $1/segundo',
    heightText: 'Un fajo de billetes de $100 mediría 1.09 metros de altura.',
    realWorld: 'Comprar una vivienda de lujo en una capital europea.',
    icon: '🏠'
  },
  {
    threshold: 1e8, // 100 Millones
    title: '100 Millones ($10⁸)',
    timeText: '3.17 años contando sin dormir',
    heightText: 'Una columna de billetes de 109 metros (más alta que la Estatua de la Libertad).',
    realWorld: 'Presupuesto de producción de una película taquillera de Hollywood.',
    icon: '🎬'
  },
  {
    threshold: 1e9, // 1 Mil Millones / 1 Billón anglosajón
    title: '1 Mil Millones / 1 Billion ($10⁹)',
    timeText: '31.7 años contando sin parar día y noche',
    heightText: 'La columna alcanzaría 1.09 km de altura (más alta que el Burj Khalifa).',
    realWorld: 'Construir un rascacielos ultramoderno o fundar una aerolínea regional.',
    icon: '🏙️'
  },
  {
    threshold: 1e10, // 10 Mil Millones
    title: '10 Mil Millones ($10¹⁰)',
    timeText: '317 años ininterrumpidos (desde el siglo XVIII)',
    heightText: '10.9 km de altura, sobrepasando la estratosfera y el Monte Everest.',
    realWorld: 'El coste total del Gran Colisionador de Hadrones (CERN) o del Telescopio Espacial James Webb.',
    icon: '🔭'
  },
  {
    threshold: 1e11, // 100 Mil Millones
    title: '100 Mil Millones ($10¹¹)',
    timeText: '3,170 años (desde la época de Troya y el antiguo Egipto)',
    heightText: '109 km de altura: entra oficialmente en el espacio exterior (Línea de Kármán).',
    realWorld: 'Coste total de la Estación Espacial Internacional (ISS), el objeto más caro construido por la humanidad.',
    icon: '🛰️'
  },
  {
    threshold: 1e12, // 1 Trillón / 1 Billón hispano
    title: '1 Trillón / 1 Billón Europeo ($10¹²)',
    timeText: '31,700 años (antes de que el ser humano domesticara la agricultura)',
    heightText: '1,090 km de altura: superaría la órbita de los satélites en órbita baja.',
    realWorld: 'El Producto Interior Bruto (PIB) anual de España o Indonesia.',
    icon: '🌍'
  }
];

export const POWERS_OF_TEN_LEVELS = [
  {
    level: 0,
    amount: 1,
    label: '$1 Dólar',
    power: '10⁰',
    visualDesc: '1 grano elemental de valor.',
    unitCount: 1,
    time: '1 segundo',
    dotCount: 1,
    boxColor: 'var(--primary)'
  },
  {
    level: 1,
    amount: 1e3,
    label: '$1.000 (Mil)',
    power: '10³',
    visualDesc: 'Un fajo de billetes. Equivale a 1.000 segundos (~16.6 minutos).',
    unitCount: 1000,
    time: '16.6 minutos',
    dotCount: 10,
    boxColor: 'var(--cyan)'
  },
  {
    level: 2,
    amount: 1e6,
    label: '$1 Millón',
    power: '10⁶',
    visualDesc: '1.000 fajos de mil. Parece una fortuna inmensa hasta que lo comparas con las crisis de Estado.',
    unitCount: 1000000,
    time: '11.5 días',
    dotCount: 100,
    boxColor: 'var(--success)'
  },
  {
    level: 3,
    amount: 1e9,
    label: '$1 Mil Millones (1 Billion)',
    power: '10⁹',
    visualDesc: 'Mil millones. El millón inicial representa apenas el 0.1% de este volumen colosal.',
    unitCount: 1000000000,
    time: '31.7 años',
    dotCount: 500,
    boxColor: 'var(--warning)'
  },
  {
    level: 4,
    amount: 1e12,
    label: '$1 Trillón (1 Billón Europeo)',
    power: '10¹²',
    visualDesc: 'Un millón de millones. Contiene mil veces la riqueza de un multimillonario global.',
    unitCount: 1000000000000,
    time: '31.700 años',
    dotCount: 1000,
    boxColor: '#ec4899'
  }
];
