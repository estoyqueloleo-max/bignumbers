export const SCENARIOS = [
  {
    id: 'standard',
    name: 'Gestión Democrática Estándar',
    tag: 'Balanceado',
    difficulty: 'Normal',
    description: 'Empiezas con una economía estable de 10 millones de habitantes y $500 Millones de reservas.',
    initialState: {
      population: 10000000,
      treasury: 500000000,
      debt: 0,
      baseIncomePerCapita: 5,
      baseExpensePerCapita: 4.5,
      taxRate: 1.0,
      fixedIncome: 0,
      fixedExpenses: 0,
      month: 1
    }
  },
  {
    id: 'great_depression',
    name: 'La Gran Depresión',
    tag: 'Supervivencia',
    difficulty: 'Difícil',
    description: 'Deuda asfixiante con el FMI de $2.000M, déficit estructural y solo $100M en caja. ¡Evita la quiebra!',
    initialState: {
      population: 12000000,
      treasury: 100000000,
      debt: 2000000000,
      baseIncomePerCapita: 4.2,
      baseExpensePerCapita: 4.8,
      taxRate: 1.1,
      fixedIncome: 0,
      fixedExpenses: 20000000,
      month: 1
    }
  },
  {
    id: 'petro_state',
    name: 'Petro-Estado en Auge',
    tag: 'Gigantismo',
    difficulty: 'Medio',
    description: 'Empiezas con $5.000M de reservas gracias al crudo, pero las crisis que enfrentarás serán monumentales.',
    initialState: {
      population: 6000000,
      treasury: 5000000000,
      debt: 500000000,
      baseIncomePerCapita: 12,
      baseExpensePerCapita: 9,
      taxRate: 0.8,
      fixedIncome: 50000000,
      fixedExpenses: 40000000,
      month: 1
    }
  },
  {
    id: 'island_state',
    name: 'Pequeña Isla Vulnerable',
    tag: 'Micro-Estado',
    difficulty: 'Experto',
    description: 'Apenas 800.000 habitantes y $80M en caja. Cualquier fallo de infraestructura puede liquidar a la nación.',
    initialState: {
      population: 800000,
      treasury: 80000000,
      debt: 0,
      baseIncomePerCapita: 6,
      baseExpensePerCapita: 5.2,
      taxRate: 1.0,
      fixedIncome: 0,
      fixedExpenses: 2000000,
      month: 1
    }
  }
];
