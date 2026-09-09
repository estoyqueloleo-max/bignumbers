/**
 * useRealData.js
 *
 * Hook React que gestiona la selección de año y carga de datos reales de España.
 * Expone el año seleccionado, los datos cargados y un método para aplicarlos al juego.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchSpainDataForYear, convertToGameState, AVAILABLE_YEARS, DEFAULT_YEAR } from '../utils/realDataLoader';

export function useRealData() {
  const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR);
  const [rawData, setRawData] = useState(null);      // datos del catálogo/API
  const [gameState, setGameState] = useState(null);  // convertido al formato del juego
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [dataSource, setDataSource] = useState(null); // 'api' | 'cache' | 'static'

  const loadYear = useCallback(async (year) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await fetchSpainDataForYear(year);
      setRawData(result.data);
      setGameState(convertToGameState(result.data));
      setDataSource(result.source);
    } catch (err) {
      setLoadError(err.message || 'Error cargando datos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar automáticamente cuando cambia el año seleccionado
  useEffect(() => {
    loadYear(selectedYear);
  }, [selectedYear, loadYear]);

  const setYear = useCallback((year) => {
    if (AVAILABLE_YEARS.includes(year)) {
      setSelectedYear(year);
    }
  }, []);

  /**
   * Aplica los datos reales cargados al juego.
   * @param {Function} loadRealDataScenario - función de useGameLoop
   */
  const applyToGame = useCallback((loadRealDataScenario) => {
    if (gameState && loadRealDataScenario) {
      loadRealDataScenario(gameState);
    }
  }, [gameState]);

  return {
    selectedYear,
    setYear,
    rawData,
    gameState,
    isLoading,
    loadError,
    dataSource,
    availableYears: AVAILABLE_YEARS,
    reload: () => loadYear(selectedYear),
  };
}
