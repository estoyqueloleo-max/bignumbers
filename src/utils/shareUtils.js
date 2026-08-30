// Utilidades de compartición P2P / Asíncrona inspiradas en Pingo (Web Share API, WhatsApp fallback y Hash URL)

export const exportGameToShareUrl = (state) => {
  try {
    const compactState = {
      pop: state.population,
      tre: state.treasury,
      deb: state.debt,
      tax: state.taxRate,
      mon: state.month,
      sce: state.scenarioId || 'standard',
      cri: state.crisesResolved || 0,
      peK: state.peakTreasury || state.treasury,
      min: state.ministryAllocations,
      v: 4
    };

    const jsonStr = JSON.stringify(compactState);
    const encoded = btoa(encodeURIComponent(jsonStr));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#save=${encoded}`;
  } catch (err) {
    console.error('Error generating share URL:', err);
    return window.location.href;
  }
};

export const importGameFromUrl = () => {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.includes('save=')) return null;

    const encoded = hash.split('save=')[1];
    if (!encoded) return null;

    const jsonStr = decodeURIComponent(atob(encoded));
    const compact = JSON.parse(jsonStr);

    if (!compact || typeof compact.tre !== 'number') return null;

    return {
      population: compact.pop,
      treasury: compact.tre,
      debt: compact.deb,
      taxRate: compact.tax,
      month: compact.mon,
      scenarioId: compact.sce || 'standard',
      crisesResolved: compact.cri || 0,
      peakTreasury: compact.peK || compact.tre,
      ministryAllocations: compact.min || { health: 25, rd: 25, infra: 25, security: 25 },
      isImported: true
    };
  } catch (err) {
    console.error('Error importing game from URL:', err);
    return null;
  }
};

/**
 * Comparte una partida o desafío utilizando Web Share API con fallback a WhatsApp y Portapapeles (igual que en Pingo).
 */
export const shareMatchViaWebShare = async ({ title, text, url }) => {
  const shareUrl = url || window.location.href;
  const fullText = `${text}\n\n🎮 Carga esta partida en el simulador: ${shareUrl}`;

  // 1. Intentar Web Share API nativo (móvil y navegadores modernos)
  if (navigator.share) {
    try {
      await navigator.share({
        title: title || 'Simulador de Grandes Cifras',
        text: text || '¡Supera mi mandato económico!',
        url: shareUrl
      });
      return { success: true, method: 'web-share' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
      console.warn('Web Share failed, falling back to WhatsApp/Clipboard', err);
    }
  }

  // 2. Fallback a WhatsApp
  try {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;
    window.open(whatsappUrl, '_blank');
    return { success: true, method: 'whatsapp' };
  } catch {
    // 3. Fallback a Portapapeles
    navigator.clipboard.writeText(shareUrl);
    return { success: true, method: 'clipboard' };
  }
};

export const exportGameFileJSON = (state) => {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mandato_mes_${state.month}_${new Date().toISOString().slice(0, 10)}.bignumbers`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

export const importGameFileJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target.result);
        resolve(state);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
