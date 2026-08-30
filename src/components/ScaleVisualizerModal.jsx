import React, { useState } from 'react';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';
import { POWERS_OF_TEN_LEVELS, PHYSICAL_ANALOGIES, getRealWorldTimeEquivalent } from '../utils/scaleData';
import { WealthStack3D } from './WealthStack3D';
import { X, ZoomIn, ZoomOut, Clock, Compass, Layers, Eye, Box } from 'lucide-react';

export const ScaleVisualizerModal = ({ isOpen, onClose, currentTreasury = 1000000000, numberingSystem }) => {
  const [selectedLevel, setSelectedLevel] = useState(2);
  const [customCalcValue, setCustomCalcValue] = useState(currentTreasury || 1000000000);

  if (!isOpen) return null;

  const currentLevelData = POWERS_OF_TEN_LEVELS[selectedLevel];
  const timeEq = getRealWorldTimeEquivalent(customCalcValue);

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-container scale-visualizer-modal">
        <div className="modal-header d-flex align-center justify-between">
          <div className="d-flex align-center gap-2">
            <Layers className="text-cyan" size={24} />
            <h2 className="m-0 text-cyan">Visor de Magnitudes & Potencias de 10</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* SECCIÓN 1: SELECTOR DE POTENCIAS DE 10 */}
          <div className="powers-selector-bar d-flex gap-2 mb-4">
            {POWERS_OF_TEN_LEVELS.map((lvl) => (
              <button
                key={lvl.level}
                className={`btn flex-1 ${selectedLevel === lvl.level ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedLevel(lvl.level)}
              >
                <div className="font-bold text-sm">{lvl.power}</div>
                <div className="text-xs opacity-80">{lvl.label}</div>
              </button>
            ))}
          </div>

          {/* VISUALIZADOR ACTIVO */}
          <div className="active-power-display glass-panel mb-4 p-4">
            <div className="d-flex justify-between align-center mb-3">
              <div>
                <span className="badge badge-cyan mr-2">{currentLevelData.power}</span>
                <span className="font-bold text-lg">{currentLevelData.label}</span>
              </div>
              <div className="text-warning text-sm font-bold d-flex align-center gap-1">
                <Clock size={16} /> {currentLevelData.time} contando $1/s
              </div>
            </div>

            <p className="text-sm text-muted mb-4">{currentLevelData.visualDesc}</p>

            <div className="visual-matrix-box">
              <div className="visual-matrix-header d-flex justify-between text-xs text-muted mb-2">
                <span>Representación gráfica de densidad proporcional:</span>
                <span>{formatLargeNumber(currentLevelData.unitCount, numberingSystem)} unidades</span>
              </div>

              <div className="dots-grid-container" style={{ borderColor: currentLevelData.boxColor }}>
                {Array.from({ length: Math.min(300, currentLevelData.dotCount) }).map((_, i) => (
                  <span
                    key={i}
                    className="matrix-dot"
                    style={{ background: currentLevelData.boxColor }}
                  />
                ))}
              </div>

              {selectedLevel > 1 && (
                <div className="comparison-callout mt-3 p-2 text-xs">
                  💡 <strong>Impacto de Escala:</strong> Un millón (10⁶) cabe exactamente <strong>1.000 veces</strong> en mil millones (10⁹), y <strong>1.000.000 de veces</strong> en un billón (10¹²).
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: PILA ISOMÉTRICA 3D DE RIQUEZA */}
          <WealthStack3D initialTreasury={currentTreasury} numberingSystem={numberingSystem} />

          {/* SECCIÓN 3: CALCULADORA INTERACTIVA DE TIEMPO HUMANO */}
          <div className="time-calculator-card glass-panel mb-4 p-4">
            <h4 className="d-flex align-center gap-2 mb-3 text-cyan">
              <Clock size={18} /> El Reloj del Tiempo (Contando a $1 por Segundo)
            </h4>
            <p className="text-xs text-muted mb-3">
              Introduce cualquier cifra o usa tu tesorería actual para descubrir cuántas vidas o siglos tardarías en contarla billete a billete sin dormir.
            </p>

            <div className="calc-input-group d-flex gap-2 align-center mb-3">
              <input
                type="number"
                className="input-field flex-1"
                value={customCalcValue}
                onChange={(e) => setCustomCalcValue(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="Cantidad en dólares..."
              />
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCustomCalcValue(currentTreasury)}
              >
                Cargar Tesoro Actual
              </button>
            </div>

            <div className="calc-result-box p-3 text-center">
              <div className="text-xs text-muted">Contar {formatCurrency(customCalcValue, numberingSystem)} a $1/segundo tomaría:</div>
              <div className="text-xl font-bold text-success mt-1">{timeEq}</div>
            </div>
          </div>

          {/* SECCIÓN 4: ANALOGÍAS FÍSICAS REALES */}
          <div className="analogies-section">
            <h4 className="d-flex align-center gap-2 mb-3 text-cyan">
              <Compass size={18} /> Analogías del Mundo Real
            </h4>
            <div className="analogies-grid">
              {PHYSICAL_ANALOGIES.map((item, idx) => (
                <div key={idx} className="analogy-card glass-panel p-3">
                  <div className="d-flex align-center gap-2 mb-2">
                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                    <h5 className="m-0 font-bold">{item.title}</h5>
                  </div>
                  <div className="text-xs text-warning mb-1">⏱️ {item.timeText}</div>
                  <div className="text-xs text-muted mb-1">📏 {item.heightText}</div>
                  <div className="text-xs text-cyan">💼 {item.realWorld}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer d-flex justify-end mt-4">
          <button className="btn btn-primary" onClick={onClose}>
            Entendido, volver a la gestión
          </button>
        </div>
      </div>
    </div>
  );
};
