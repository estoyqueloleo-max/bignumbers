export const NumberingSystems = {
  INTERNATIONAL: 'international',
  SPANISH: 'spanish',
};

/**
 * Formats a number according to the selected numbering system.
 * @param {number} value
 * @param {string} system 'international' | 'spanish'
 * @returns {string}
 */
export const formatLargeNumber = (value, system = NumberingSystems.INTERNATIONAL) => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (system === NumberingSystems.INTERNATIONAL) {
    if (absValue >= 1e12) return `${sign}${(absValue / 1e12).toFixed(1)} T`;
    if (absValue >= 1e9) return `${sign}${(absValue / 1e9).toFixed(1)} B`;
    if (absValue >= 1e6) return `${sign}${(absValue / 1e6).toFixed(1)} M`;
    if (absValue >= 1e3) return `${sign}${(absValue / 1e3).toFixed(1)} K`;
  } else if (system === NumberingSystems.SPANISH) {
    // Escala Larga:
    // 10^6 = Millón (M)
    // 10^9 = Mil Millones (Mil M)
    // 10^12 = Billón (B)
    if (absValue >= 1e12) return `${sign}${(absValue / 1e12).toFixed(1)} B`;
    if (absValue >= 1e9) return `${sign}${(absValue / 1e9).toFixed(1)} Mil M`;
    if (absValue >= 1e6) return `${sign}${(absValue / 1e6).toFixed(1)} M`;
    if (absValue >= 1e3) return `${sign}${(absValue / 1e3).toFixed(1)} K`;
  }

  // Fallback para números más pequeños o sistema desconocido
  return `${sign}${absValue.toLocaleString('es-ES')}`;
};

export const formatCurrency = (value, system = NumberingSystems.INTERNATIONAL) => {
  return `$${formatLargeNumber(value, system)}`;
};
