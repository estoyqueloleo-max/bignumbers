import React, { useState, useEffect } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { StatsPanel } from './components/StatsPanel';
import { UpgradesPanel } from './components/UpgradesPanel';
import { MinistriesPanel } from './components/MinistriesPanel';
import { EventsFeed } from './components/EventsFeed';
import { SettingsPanel } from './components/SettingsPanel';
import { WelcomeHubModal } from './components/WelcomeHubModal';
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
import { WorldViewport } from './components/WorldViewport';
import { ModeNavBar } from './components/ModeNavBar';
import { ToolsDropdown } from './components/ToolsDropdown';
import { ScaleModeView } from './components/ScaleModeView';
import { EnderFuturesView } from './components/EnderFuturesView';
import { NationalGazette } from './components/NationalGazette';
import { PostGameModal } from './components/PostGameModal';
import { Milestones } from './components/Milestones';
import { HUD } from './components/HUD';
import { YearPickerModal } from './components/YearPickerModal';
import { DataCatalogModal } from './components/DataCatalogModal';
import { ABMVisualizerModal } from './components/ABMVisualizerModal';
import { NumberingSystems } from './utils/formatters';
import { playWinSound, setAudioMuted, getAudioMuted } from './utils/audio';
import { Play, Pause, FastForward, Skull, Trophy, Layers, Flag, Landmark, DollarSign, Cpu, RadioTower, Globe, Sliders, ShieldCheck, Mail, Printer, Command, Search, CalendarDays, Database, Users, HelpCircle } from 'lucide-react';

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
  const [showABMModal, setShowABMModal] = useState(false);
  const [activeMode, setActiveMode] = useState('govern');
  const [showWelcomeHub, setShowWelcomeHub] = useState(() => {
    return localStorage.getItem('bigNumbers_hideTutorial') !== 'true';
  });

  const handleWelcomeComplete = (mode) => {
    setShowWelcomeHub(false);
    if (mode) setActiveMode(mode);
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
    openABMVisualizer: () => setShowABMModal(true),
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
      <WelcomeHubModal
        isOpen={showWelcomeHub}
        onClose={() => setShowWelcomeHub(false)}
        onSelectMode={handleWelcomeComplete}
      />
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
      {showABMModal && (
        <ABMVisualizerModal
          onClose={() => setShowABMModal(false)}
          gameState={state}
          numberingSystem={numberingSystem}
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

      {/* CABECERA PRINCIPAL REORGANIZADA */}
      <header className="app-header">
        <div className="title-area">
          <h1 className="text-cyan">SIMULADOR DE GRANDES CIFRAS</h1>
          <p className="text-sm text-muted" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>
            Del Sueldo al PIB • Presupuesto Real • 2.500 Agentes Vivos
          </p>
        </div>

        <div className="header-controls d-flex align-center gap-2 flex-wrap">
          {/* SELECTOR RÁPIDO DE DATOS REALES DE ESPAÑA */}
          <button
            id="btn-real-data"
            className="btn btn-outline btn-sm d-flex align-center gap-1"
            onClick={() => setShowYearPickerModal(true)}
            title="Cargar datos macroeconómicos reales de España por año (PGE)"
            style={state.realDataYear ? { borderColor: '#6366f1', color: '#a5b4fc', background: 'rgba(99,102,241,0.1)' } : {}}
          >
            <CalendarDays size={15} style={{ color: state.realDataYear ? '#6366f1' : undefined }} />
            <span>{state.realDataYear ? `🇪🇸 España: ${state.realDataYear}` : '🇪🇸 Datos Reales'}</span>
          </button>

          {/* GUÍA INTERACTIVA DE INICIO */}
          <button
            className="btn btn-outline btn-sm d-flex align-center gap-1"
            onClick={() => setShowWelcomeHub(true)}
            title="Abrir Centro de Bienvenida y Guía de Rutas"
          >
            <HelpCircle size={15} className="text-cyan" />
            <span className="hide-mobile">Guía</span>
          </button>

          {/* MENÚ AGRUPADO DE HERRAMIENTAS Y LABORATORIO */}
          <ToolsDropdown
            onOpenDataCatalog={() => setShowDataCatalogModal(true)}
            onOpenPassport={() => setShowPassportModal(true)}
            onOpenRules={() => setShowRulesModal(true)}
            onOpenDiplomacy={() => setShowDiplomacyModal(true)}
            onOpenGazetteExport={() => setShowGazetteExportModal(true)}
            onOpenP2PRoom={() => setShowP2PRoomModal(true)}
            onOpenCommandPalette={() => setShowCommandPalette(true)}
            activeModifiersCount={activeModifiers?.activeCount || 0}
          />

          {/* CONTROLES DE VELOCIDAD */}
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

          {/* PAUSA / PLAY */}
          <button
            className={`btn ${isRunning ? 'btn-danger' : 'btn-success'}`}
            onClick={() => setIsRunning(!isRunning)}
            disabled={state.gameOver || state.gameWon || state.activeDilemma}
            style={{ minWidth: '130px' }}
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

      {/* BARRA DE NAVEGACIÓN EN 3 PASOS / MODOS */}
      <ModeNavBar activeMode={activeMode} onSelectMode={setActiveMode} />

      {/* VISTA SEGÚN EL MODO ACTIVO */}
      {activeMode === 'scale' && (
        <ScaleModeView
          currentTreasury={state.treasury}
          numberingSystem={numberingSystem}
          onGoToGovern={() => setActiveMode('govern')}
        />
      )}

      {activeMode === 'futures' && (
        <EnderFuturesView
          state={state}
          applyAssemblyImpact={applyAssemblyImpact}
          loadScenario={loadScenario}
          numberingSystem={numberingSystem}
          onGoToGovern={() => setActiveMode('govern')}
        />
      )}

      {activeMode === 'govern' && (
        <>
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
            onOpenABM={() => setShowABMModal(true)}
          />

          {/* PERIÓDICO SATÍRICO / GACETA NACIONAL */}
          <NationalGazette state={state} />

          {/* DIORAMA NACIONAL DUAL (VISTA MACRO CIUDAD + LUPA MICRO ABM 2.5K AGENTES) */}
          <WorldViewport
            state={state}
            isRunning={isRunning}
            timeSpeed={timeSpeed}
            activeModifiers={activeModifiers}
            numberingSystem={numberingSystem}
            onOpenABMModal={() => setShowABMModal(true)}
          />

          {/* NAVEGACIÓN POR PESTAÑAS DE GESTIÓN */}
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

          {/* CONTENIDO PRINCIPAL DE PESTAÑAS */}
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
        </>
      )}
    </div>
  );
}

export default App;
