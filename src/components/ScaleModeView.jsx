import React, { useState } from 'react';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';
import { POWERS_OF_TEN_LEVELS, PHYSICAL_ANALOGIES, getRealWorldTimeEquivalent } from '../utils/scaleData';
import { WealthStack3D } from './WealthStack3D';
import { Layers, Clock, ArrowRight, Compass, Sparkles, Building, Landmark, User, Heart, Shield, HelpCircle } from 'lucide-react';

const EVERYDAY_BENCHMARKS = [
  { label: 'Café matutino', amount: 1.5, icon: '☕', category: 'Cotidiano' },
  { label: 'Sueldo medio anual España', amount: 26900, icon: '💼', category: 'Cotidiano' },
  { label: 'Piso medio en España', amount: 195000, icon: '🏠', category: 'Cotidiano' },
  { label: 'Película superproducción Hollywood', amount: 200000000, icon: '🎬', category: 'Grandes Inversiones' },
  { label: 'Presupuesto anual Museo del Prado', amount: 55000000, icon: '🎨', category: 'Cultura & Estado' },
  { label: 'Gasto anual Defensa España', amount: 15000000000, icon: '🛡️', category: 'Estado' },
  { label: 'Compra de Twitter / X (2022)', amount: 44000000000, icon: '🐦', category: 'Corporativo' },
  { label: 'Presupuesto Sanidad Pública España', amount: 88000000000, icon: '🏥', category: 'Estado' },
  { label: 'Gasto Anual Pensiones España', amount: 190000000000, icon: '👵', category: 'Estado' },
  { label: 'Deuda Pública Total de España', amount: 1570000000000, icon: '📉', category: 'Macro' },
  { label: 'PIB Anual de España', amount: 1580000000000, icon: '🇪🇸', category: 'Macro' },
  { label: 'PIB Mundial Anual', amount: 105000000000000, icon: '🌍', category: 'Global' }
];

export const ScaleModeView = ({ currentTreasury, numberingSystem, onGoToGovern }) => {
  const [selectedLevel, setSelectedLevel] = useState(2); // 10^9
  const [customAmount, setCustomAmount] = useState(1000000000);

  const currentLevelData = POWERS_OF_TEN_LEVELS[selectedLevel];
  const timeEq = getRealWorldTimeEquivalent(customAmount);

  return (
    <div className="scale-mode-view d-flex flex-column gap-4 animate-fade-in">
      {/* BANNER INTRODUCTORIO */}
      <div className="glass-panel p-4" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
        <div className="d-flex justify-between align-center flex-wrap gap-2">
          <div>
            <div className="d-flex align-center gap-2 mb-1">
              <span className="badge badge-cyan">Paso 1 del Viaje</span>
              <h2 className="m-0 text-cyan">El Calibre de las Grandes Cifras</h2>
            </div>
            <p className="text-muted m-0" style={{ maxWidth: '780px', lineHeight: '1.5' }}>
              El cerebro humano evolucionó para contar ovejas o manzanas, no billones. Cuando escuchas en las noticias 
              <em> «se aprueban 10.000 millones para infraestructuras»</em>, parece una cifra abstracta. 
              Aquí puedes calibrar su tamaño real en tiempo, objetos físicos y presupuestos de carne y hueso.
            </p>
          </div>
          <button className="btn btn-primary d-flex align-center gap-2" onClick={onGoToGovern}>
            <span>Ir a Gobernar España</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* SELECTOR DE POTENCIAS DE 10 */}
      <div className="glass-panel p-4">
        <h3 className="text-sm text-muted uppercase font-bold mb-3" style={{ letterSpacing: '1px' }}>
          📐 Escalera de Magnitudes (Potencias de 10)
        </h3>
        <div className="powers-selector-bar d-flex gap-2 mb-4 flex-wrap">
          {POWERS_OF_TEN_LEVELS.map((lvl) => (
            <button
              key={lvl.level}
              className={`btn flex-1 ${selectedLevel === lvl.level ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                setSelectedLevel(lvl.level);
                setCustomAmount(Math.pow(10, lvl.powerNum));
              }}
              style={{ minWidth: '130px' }}
            >
              <div className="font-bold text-sm">{lvl.power}</div>
              <div className="text-xs opacity-90">{lvl.label}</div>
            </button>
          ))}
        </div>

        {/* DETALLE DEL NIVEL SELECCIONADO */}
        <div className="grid-2-col gap-4">
          <div className="active-power-card p-3 rounded" style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div className="d-flex justify-between align-center mb-2">
              <span className="badge badge-cyan font-bold text-sm">{currentLevelData.power}</span>
              <span className="text-warning font-bold text-sm d-flex align-center gap-1">
                <Clock size={16} /> {currentLevelData.time}
              </span>
            </div>
            <h4 className="m-0 mb-2 text-cyan font-bold">{currentLevelData.label}</h4>
            <p className="text-sm text-muted mb-3">{currentLevelData.visualDesc}</p>

            <div className="text-xs p-2 rounded" style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '3px solid #fbbf24' }}>
              <strong>💡 La regla del tiempo:</strong> Si empezaras a contar 1 euro por segundo sin dormir...
              <div className="text-warning font-bold mt-1">
                {currentLevelData.powerNum <= 6 && 'Llegarías al millón en apenas 11 días y medio.'}
                {currentLevelData.powerNum === 8 && 'Para contar 100 millones tardarías más de 3 años sin parar.'}
                {currentLevelData.powerNum === 9 && '¡Para contar 1.000 millones necesitarías casi 32 años de tu vida!'}
                {currentLevelData.powerNum === 10 && 'Para 10.000 millones: más de 317 años ininterrumpidos (desde el siglo XVIII).'}
                {currentLevelData.powerNum === 11 && 'Para 100.000 millones: 3.170 años (desde la Guerra de Troya y el antiguo Egipto).'}
                {currentLevelData.powerNum >= 12 && 'Para contar 1 Billón necesitarías 31.700 años (el Homo Sapiens aún pintaba en las cavernas).'}
              </div>
            </div>
          </div>

          {/* PILA 3D ISOMÉTRICA */}
          <div className="stack-3d-card p-3 rounded" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-xs text-muted font-bold uppercase mb-2">
              🧱 Si apilaras billetes de 100€:
            </div>
            <WealthStack3D initialTreasury={customAmount} numberingSystem={numberingSystem} />
          </div>
        </div>
      </div>

      {/* DEL BOLSILLO AL ESTADO: TABLA COMPARATIVA REAL */}
      <div className="glass-panel p-4">
        <h3 className="text-sm text-muted uppercase font-bold mb-3" style={{ letterSpacing: '1px' }}>
          ⚖️ Del Bolsillo al Estado: Pon las Cifras en Contexto
        </h3>
        <p className="text-sm text-muted mb-3">
          Haz clic en cualquier partida para ver qué porcentaje representa frente al <strong>Presupuesto del Estado de España</strong> (~500.000 M€) y cuánto tardarías en contarla.
        </p>

        <div className="benchmarks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
          {EVERYDAY_BENCHMARKS.map((item, idx) => {
            const isSelected = customAmount === item.amount;
            const timeStr = getRealWorldTimeEquivalent(item.amount);
            const pctOfSpainBudget = ((item.amount / 500000000000) * 100);

            return (
              <div
                key={idx}
                className={`benchmark-card p-3 rounded cursor-pointer transition-all ${
                  isSelected ? 'border-cyan' : ''
                }`}
                onClick={() => setCustomAmount(item.amount)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: 'pointer'
                }}
              >
                <div className="d-flex align-center justify-between mb-1">
                  <span className="text-lg">{item.icon}</span>
                  <span className="badge text-xs" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {item.category}
                  </span>
                </div>
                <div className="font-bold text-sm mb-1">{item.label}</div>
                <div className="text-cyan font-bold text-base mb-1">
                  {formatCurrency(item.amount, numberingSystem)}
                </div>
                <div className="text-xs text-muted d-flex align-center gap-1">
                  <Clock size={12} /> {timeStr}
                </div>
                {item.amount >= 1000000000 && (
                  <div className="text-xs text-warning mt-2 pt-1" style={{ borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    {pctOfSpainBudget >= 1
                      ? `Equivale al ${pctOfSpainBudget.toFixed(1)}% del presupuesto anual de España`
                      : `Apenas un ${pctOfSpainBudget.toFixed(2)}% del presupuesto español`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* LLAMADA A LA ACCIÓN FINAL */}
      <div className="glass-panel p-4 text-center d-flex flex-column align-center justify-center gap-3">
        <h3 className="m-0 text-cyan">¿Preparado para poner a prueba tu criterio?</h3>
        <p className="text-muted m-0" style={{ maxWidth: '600px' }}>
          En el <strong>Paso 2 (Gobernar España)</strong> asumirás el control del presupuesto real con 2.500 ciudadanos 
          simulados por el motor ABM. Cada euro que subas o bajes afectará al empleo, la sanidad y la paz social.
        </p>
        <button className="btn btn-primary btn-lg d-flex align-center gap-2" onClick={onGoToGovern}>
          <Landmark size={20} />
          <span>Comenzar a Gobernar España (Datos Reales 2023)</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
