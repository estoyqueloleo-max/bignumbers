// Datos reales del planeta Tierra para el "Efecto Ender" (Conciencia vs Simulación)

export const REAL_WORLD_FACTS = [
  {
    topic: 'Gasto Militar vs Erradicación de la Pobreza',
    icon: '⚔️',
    gameContext: 'Financiamiento de Seguridad y Defensa',
    realWorldQuote: 'En el mundo real, el gasto militar global anual asciende a $2,44 Trillones ($2.440.000.000.000). Erradicar el hambre extrema en todo el planeta costaría unos $40.000 Millones al año: apenas el 1,6% del presupuesto bélico anual.',
    source: 'Instituto Internacional de Estudios para la Paz de Estocolmo (SIPRI) & FAO',
    takeaway: 'La ineficiencia global no es una falta de recursos, sino una trampa de incentivos geopolíticos.'
  },
  {
    topic: 'Energía Limpia vs Subsidios Fósiles',
    icon: '⚡',
    gameContext: 'Transición Energética y Fusión Nuclear',
    realWorldQuote: 'El reactor de fusión experimental más avanzado de la humanidad (ITER) cuesta unos $25.000 Millones a lo largo de décadas. En contraste, los gobiernos del mundo gastan más de $7 Trillones CADA AÑO en subsidiar combustibles fósiles.',
    source: 'Fondo Monetario Internacional (FMI)',
    takeaway: 'Invertir en el futuro resulta 280 veces más barato que subsidiar la inercia del pasado.'
  },
  {
    topic: 'Prevención Sanitaria vs Coste de Pandemias',
    icon: '🧬',
    gameContext: 'Presupuesto de Sanidad y Bioseguridad',
    realWorldQuote: 'Crear una red global de vigilancia genómica y respuesta ultra-rápida ante pandemias costaría ~$5.000 Millones anuales. La pandemia de COVID-19 le costó a la economía mundial más de $16 Trillones en pérdidas acumuladas.',
    source: 'Organización Mundial de la Salud (OMS) & FMI',
    takeaway: 'La prevención cuesta céntimos; la imprevisión cuesta trillones.'
  },
  {
    topic: 'Paraísos Fiscales y Fuga de Capitales',
    icon: '🏝️',
    gameContext: 'Tratados de Transparencia Fiscal',
    realWorldQuote: 'Se estima que entre $8 y $10 Trillones de riqueza privada global se encuentran ocultos en jurisdicciones opacas sin tributar, privando a los estados de más de $480.000 Millones anuales en servicios públicos esenciales.',
    source: 'Tax Justice Network & Banco Mundial',
    takeaway: 'Cuando una nación actúa como "free-rider" fiscal, el resto del planeta paga la factura.'
  },
  {
    topic: 'Defensa Planetaria contra Asteroides',
    icon: '☄️',
    gameContext: 'Misión Espacial y Protección de la Especie',
    realWorldQuote: 'La misión DART de la NASA (el primer ensayo de desvío de un asteroide) costó $330 Millones. Es menos de lo que cuesta construir un solo estadio de fútbol de primera categoría.',
    source: 'NASA Planetary Defense Coordination Office',
    takeaway: 'Garantizar la supervivencia de la civilización a menudo cuesta menos que el entretenimiento de una ciudad.'
  }
];

export const getRandomRealWorldFact = () => {
  return REAL_WORLD_FACTS[Math.floor(Math.random() * REAL_WORLD_FACTS.length)];
};
