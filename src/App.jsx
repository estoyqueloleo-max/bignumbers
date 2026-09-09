import React, { useState, useEffect } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { StatsPanel } from './components/StatsPanel';
import { UpgradesPanel } from './components/UpgradesPanel';
import { MinistriesPanel } from './components/MinistriesPanel';
import { EventsFeed } from './components/EventsFeed';
import { SettingsPanel } from './components/SettingsPanel';
import { TutorialModal } from './components/TutorialModal';
import { ScaleVisualizerModal } from './components/ScaleVisualizerModal';
import { ScenariosModal } from './components/ScenariosModal';
import { GlobalAssemblyModal } from './components/GlobalAssemblyModal';
import { RulesEngineModal } from './components/RulesEngineModal';
import { PassportModal } from './components/PassportModal';
import { DiplomacyModal } from './components/DiplomacyModal';
import { GazetteExportModal } from './components/GazetteExportModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { TechTreeModal } from './components/TechTreeModal';
import { P2PRoomModal } from './components/P2PRoomModal';
import { SimCityWorld } from './components/SimCityWorld';
import { NationalGazette } from './components/NationalGazette';
import { PostGameModal } from './components/PostGameModal';
import { Milestones } from './components/Milestones';
import { HUD } from './components/HUD';
import { YearPickerModal } from './components/YearPickerModal';
import { DataCatalogModal } from './components/DataCatalogModal';
import { NumberingSystems } from './utils/formatters';
import { playWinSound, setAudioMuted, getAudioMuted } from './utils/audio';
import { Play, Pause, FastForward, Skull, Trophy, Layers, Flag, Landmark, DollarSign, Cpu, RadioTower, Globe, Sliders, ShieldCheck, Mail, Printer, Command, Search, CalendarDays, Database } from 'lucide-react';

function App() {
  const {
    state,
    currentIncome,
    currentExpenses,
    debtInterest,
    creditRating,
    rulePacks,
    activeModifiers,
    toggleRulePack,
    addCustomRulePack,
    deleteRulePack,
    isRunning,
    setIsRunning,
    timeSpeed,
    setTimeSpeed,
    setTaxRate,
    setMinistryAllocations,
    buyUpgrade,
    resolveDilemma,
    issueBonds,
    payDebt,
    depositSovereignFund,
    withdrawSovereignFund,
    applyAssemblyImpact,
    loadScenario,
    loadRealDataScenario,
    resetGame,
    screenShake
  } = useGameLoop();

  const [numberingSystem, setNumberingSystem] = useState(NumberingSystems.INTERNATIONAL);
  const [theme, setTheme] = useState(() => localStorage.getItem('bigNumbers_theme') || 'cyberpunk');
  const [activeTab, setActiveTab] = useState('finances');
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [showScenariosModal, setShowScenariosModal] = useState(false);
  const [showAssemblyModal, setShowAssemblyModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [showDiplomacyModal, setShowDiplomacyModal] = useState(false);
  const [showGazetteExportModal, setShowGazetteExportModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showTechTreeModal, setShowTechTreeModal] = useState(false);
  const [showP2PRoomModal, setShowP2PRoomModal] = useState(false);
  const [showYearPickerModal, setShowYearPickerModal] = useState(false);
  const [showDataCatalogModal, setShowDataCatalogModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    return localStorage.getItem('bigNumbers_hideTutorial') !== 'true';
  });

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setIsRunning(true);
  };

  useEffect(() => {
    localStorage.setItem('bigNumbers_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (state.gameWon) {
      playWinSound();
    }
  }, [state.gameWon]);

  // Manejo de atajos de teclado globales
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K o Cmd+K para paleta de comandos
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
        return;
      }

      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!state.gameOver && !state.gameWon && !state.activeDilemma) {
          setIsRunning(prev => !prev);
        }
      } else if (e.key === '1') {
        setTimeSpeed(1);
      } else if (e.key === '2') {
        setTimeSpeed(2);
      } else if (e.key === '3') {
        setTimeSpeed(5);
      } else if (e.key.toLowerCase() === 'm') {
        setAudioMuted(!getAudioMuted());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.gameOver, state.gameWon, state.activeDilemma, setIsRunning, setTimeSpeed]);

  const paletteActions = {
    openAssembly: () => setShowAssemblyModal(true),
    openTechTree: () => setShowTechTreeModal(true),
    openScale: () => setShowScaleModal(true),
    openScenarios: () => setShowScenariosModal(true),
    openPassport: () => setShowPassportModal(true),
    openDiplomacy: () => setShowDiplomacyModal(true),
    openRules: () => setShowRulesModal(true),
    openGazetteExport: () => setShowGazetteExportModal(true),
    openP2PRoom: () => setShowP2PRoomModal(true),
    openYearPicker: () => setShowYearPickerModal(true),
    openDataCatalog: () => setShowDataCatalogModal(true),
    togglePlay: () => setIsRunning(prev => !prev),
    setSpeed: (s) => setTimeSpeed(s),
    issueBonds: () => issueBonds(500000000),
    toggleArena: () => {
      // Alternar modo arena
    }
  };

  return (
    <div className={`app-container theme-${theme} ${screenShake ? 'screen-shake' : ''}`}>
      {/* MODALES */}
      {showTutorial && <TutorialModal onComplete={handleTutorialComplete} />}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        actions={paletteActions}
      />
      <TechTreeModal
        isOpen={showTechTreeModal}
        onClose={() => setShowTechTreeModal(false)}
        state={state}
        buyUpgrade={buyUpgrade}
        numberingSystem={numberingSystem}
      />
      <ScaleVisualizerModal
        isOpen={showScaleModal}
        onClose={() => setShowScaleModal(false)}
        currentTreasury={state.treasury}
        numberingSystem={numberingSystem}
      />
      <ScenariosModal
        isOpen={showScenariosModal}
        onClose={() => setShowScenariosModal(false)}
        currentScenarioId={state.scenarioId}
        onSelectScenario={loadScenario}
        numberingSystem={numberingSystem}
      />
      <GlobalAssemblyModal
        isOpen={showAssemblyModal}
        onClose={() => setShowAssemblyModal(false)}
        state={state}
        applyAssemblyImpact={applyAssemblyImpact}
        numberingSystem={numberingSystem}
      />
      <RulesEngineModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        rulePacks={rulePacks}
        activeModifiers={activeModifiers}
        toggleRulePack={toggleRulePack}
        addCustomRulePack={addCustomRulePack}
        deleteRulePack={deleteRulePack}
      />
      <PassportModal
        isOpen={showPassportModal}
        onClose={() => setShowPassportModal(false)}
        state={state}
        numberingSystem={numberingSystem}
      />
      <DiplomacyModal
        isOpen={showDiplomacyModal}
        onClose={() => setShowDiplomacyModal(false)}
        state={state}
        numberingSystem={numberingSystem}
      />
      <GazetteExportModal
        isOpen={showGazetteExportModal}
        onClose={() => setShowGazetteExportModal(false)}
        state={state}
        numberingSystem={numberingSystem}
      />
      {showYearPickerModal && (
        <YearPickerModal
          onClose={() => setShowYearPickerModal(false)}
          onApply={loadRealDataScenario}
        />
      )}
      {showDataCatalogModal && (
        <DataCatalogModal
          onClose={() => setShowDataCatalogModal(false)}
          initialYear={state.realDataYear || 2023}
        />
      )}
      <P2PRoomModal
        isOpen={showP2PRoomModal}
        onClose={() => setShowP2PRoomModal(false)}
      />
      <PostGameModal
        state={state}
        onRestart={resetGame}
        numberingSystem={numberingSystem}
      />
      <Milestones treasury={state.treasury} />

      {/* CABECERA PRINCIPAL */}
      <header className="app-header">
        <div className="title-area">
          <h1 className="text-cyan">SIMULADOR DE MAGNITUDES</h1>
          <p className="text-sm text-muted" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>
            Centro de Mando Económico & Micro-Mundo Urbano
          </p>
        </div>

        <div className="header-controls d-flex align-center gap-2 flex-wrap">
          <button
            className="btn btn-outline btn-sm d-flex align-center gap-1 command-palette-trigger"
            onClick={() => setShowCommandPalette(true)}
            title="Abrir Paleta de Comandos Rápidos (Ctrl+K)"
          >
            <Search size={14} className="text-cyan" />
            <span className="hide-mobile">Buscar</span>
            <span className="badge text-xs" style={{ background: 'rgba(255,255,255,0.08)' }}>Ctrl+K</span>
          </button>

          <button
            className="btn btn-outline btn-sm d-flex align-center gap-1"
            onClick={() => setShowPassportModal(true)}
            title="Pasaporte Presidencial y Firma Criptográfica"
          >
            <ShieldCheck size={16} className="text-warning" />
            <span className="hide-mobile">Pasaporte</span>
          </button>

          <button
            className="btn btn-outline btn-sm d-flex align-center gap-1"
            onClick={() => setShowRulesModal(true)}
            title="Motor de Expansión por Reglas y Mods"
          >
            <Sliders size={16} className="text-cyan" />
            <span className="hide-mobile">Reglas</span>
            {activeModifiers.activeCount > 0 && (
              <span className="badge badge-success text-xs">{activeModifiers.activeCount}</span>
            )}
          </button>

          <button
            id="btn-real-data"
            className="btn btn-outline btn-sm d-flex align-center gap-1"
            onClick={() => setShowYearPickerModal(true)}
            title="Cargar datos macroeconómicos reales de España por año"
            style={state.realDataYear ? { borderColor: '#6366f1', color: '#a5b4fc' } : {}}
          >
            <CalendarDays size={15} style={{ color: state.realDataYear ? '#6366f1' : undefined }} />
            <span className="hide-mobile">Datos Reales</span>
            {state.realDataYear && (
              <span className="badge" style={{ background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', fontSize: '0.65rem' }}>
                🇪🇸 {state.realDataYear}
              </span>
            )}
          </button>

          <button
            id="btn-data-catalog"
            className="btn btn-outline btn-sm d-flex align-center gap-1"
            onClick={() => setShowDataCatalogModal(true)}
            title="Catálogo de datos: documentación viva de qué cifra viene de dónde"
          >
            <Database size={15} className="text-muted" />
            <span className="hide-mobile">Catálogo</span>
          </button>

          <button
            className="btn btn-outline btn-sm d-flex align-center gap-1"
            onClick={() => setShowAssemblyModal(true)}
            title="Asamblea de Naciones: Dilema del Prisionero &amp; Efecto Ender"
          >
            <Globe size={16} className="text-warning" />
            <span className="hide-mobile">Asamblea</span>
          </button>

          <button
            className="btn btn-outline btn-sm d-flex align-center gap-1"
            onClick={() => setShowScaleModal(true)}
            title="Explorar el Visor de Magnitudes & Potencias de 10"
          >
            <Layers size={16} className="text-warning" />
            <span className="hide-mobile">Visor</span>
          </button>

          <div className="speed-controls d-flex align-center gap-1">
            <button
              className={`btn btn-sm ${timeSpeed === 1 ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTimeSpeed(1)}
              title="Velocidad Normal (1 seg = 1 mes)"
            >
              <Play size={14} />
            </button>
            <button
              className={`btn btn-sm ${timeSpeed === 2 ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTimeSpeed(2)}
              title="Velocidad Rápida x2"
            >
              <FastForward size={14} /> x2
            </button>
            <button
              className={`btn btn-sm ${timeSpeed === 5 ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTimeSpeed(5)}
              title="Velocidad Ultra x5"
            >
              <FastForward size={14} /> x5
            </button>
          </div>

          <button
            className={`btn ${isRunning ? 'btn-danger' : 'btn-success'}`}
            onClick={() => setIsRunning(!isRunning)}
            disabled={state.gameOver || state.gameWon || state.activeDilemma}
            style={{ minWidth: '150px' }}
          >
            {isRunning ? (
              <><Pause size={18} /> Pausar</>
            ) : state.gameOver ? (
              <><Skull size={18} /> Colapsado</>
            ) : state.gameWon ? (
              <><Trophy size={18} /> Victoria</>
            ) : (
              <><Play size={18} /> Reanudar</>
            )}
          </button>
        </div>
      </header>

      {/* HUD DE MÉTRICAS */}
      <HUD
        state={state}
        activeModifiers={activeModifiers}
        numberingSystem={numberingSystem}
        onOpenVisualizer={() => setShowScaleModal(true)}
        onOpenScenarios={() => setShowScenariosModal(true)}
        onOpenAssembly={() => setShowAssemblyModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenPassport={() => setShowPassportModal(true)}
        onOpenDiplomacy={() => setShowDiplomacyModal(true)}
        onOpenGazetteExport={() => setShowGazetteExportModal(true)}
      />

      {/* PERIÓDICO SATÍRICO / GACETA NACIONAL */}
      <NationalGazette state={state} />

      {/* DIORAMA URBANO SIMCITY / GAME OF LIFE CON ARENA GENÉTICA */}
      <SimCityWorld
        state={state}
        isRunning={isRunning}
        timeSpeed={timeSpeed}
        activeModifiers={activeModifiers}
        numberingSystem={numberingSystem}
      />

      {/* NAVEGACIÓN POR PESTAÑAS */}
      <nav className="tab-navigation glass-panel mb-4 d-flex">
        <button
          className={`tab-btn flex-1 d-flex align-center justify-center gap-2 ${activeTab === 'finances' ? 'active' : ''}`}
          onClick={() => setActiveTab('finances')}
        >
          <DollarSign size={16} /> Finanzas & Histórico
        </button>
        <button
          className={`tab-btn flex-1 d-flex align-center justify-center gap-2 ${activeTab === 'ministries' ? 'active' : ''}`}
          onClick={() => setActiveTab('ministries')}
        >
          <Landmark size={16} /> Ministerios & Bonos
        </button>
        <button
          className={`tab-btn flex-1 d-flex align-center justify-center gap-2 ${activeTab === 'upgrades' ? 'active' : ''}`}
          onClick={() => setActiveTab('upgrades')}
        >
          <Cpu size={16} /> Inversiones & Árbol Tecnológico
        </button>
        <button
          className={`tab-btn flex-1 d-flex align-center justify-center gap-2 ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <RadioTower size={16} /> Crisis {state.activeDilemma ? '⚠️' : ''}
        </button>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <div className="tab-content-container">
          {activeTab === 'finances' && (
            <div className="tab-pane d-flex flex-column gap-4">
              <StatsPanel
                state={state}
                currentIncome={currentIncome}
                currentExpenses={currentExpenses}
                debtInterest={debtInterest}
                creditRating={creditRating}
                setTaxRate={setTaxRate}
                payDebt={payDebt}
                numberingSystem={numberingSystem}
              />
              <SettingsPanel
                numberingSystem={numberingSystem}
                setNumberingSystem={setNumberingSystem}
                onResetGame={resetGame}
                onOpenScenarios={() => setShowScenariosModal(true)}
                theme={theme}
                setTheme={setTheme}
              />
            </div>
          )}

          {activeTab === 'ministries' && (
            <div className="tab-pane">
              <MinistriesPanel
                state={state}
                creditRating={creditRating}
                setMinistryAllocations={setMinistryAllocations}
                issueBonds={issueBonds}
                payDebt={payDebt}
                depositSovereignFund={depositSovereignFund}
                withdrawSovereignFund={withdrawSovereignFund}
                numberingSystem={numberingSystem}
              />
            </div>
          )}

          {activeTab === 'upgrades' && (
            <div className="tab-pane">
              <UpgradesPanel
                state={state}
                buyUpgrade={buyUpgrade}
                numberingSystem={numberingSystem}
                onOpenTechTree={() => setShowTechTreeModal(true)}
              />
            </div>
          )}

          {activeTab === 'events' && (
            <div className="tab-pane">
              <EventsFeed
                state={state}
                resolveDilemma={resolveDilemma}
                numberingSystem={numberingSystem}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
