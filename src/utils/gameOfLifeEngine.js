// Motor Conway's Game of Life adaptado como Autómata Celular Demográfico y Urbano

export const createGrid = (rows = 24, cols = 40, initialDensity = 0.2) => {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      // 1 = celda viva (distrito activo), 0 = terreno vacío
      row.push(Math.random() < initialDensity ? 1 : 0);
    }
    grid.push(row);
  }
  return grid;
};

// Inyectar un planeador (Glider) en una posición dada
export const spawnGlider = (grid, r = 2, c = 2) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const gliderPattern = [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1]
  ];

  const newGrid = grid.map(row => [...row]);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const nr = (r + i) % rows;
      const nc = (c + j) % cols;
      newGrid[nr][nc] = gliderPattern[i][j];
    }
  }
  return newGrid;
};

// Contar vecinos vivos con topología toroidal (bordes conectados)
const countNeighbors = (grid, r, c, rows, cols) => {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const nr = (r + i + rows) % rows;
      const nc = (c + j + cols) % cols;
      count += grid[nr][nc] ? 1 : 0;
    }
  }
  return count;
};

// Avanzar 1 generación del Game of Life modulado por políticas de estado
export const stepGameOfLife = (
  grid,
  {
    taxRate = 1.0,
    healthBonus = 0.25,
    infraBonus = 0.25,
    isCrisis = false,
    growthModifier = 0
  } = {}
) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const nextGrid = [];

  // Los impuestos muy altos (>1.2) o crisis severas aumentan la tasa de mortandad celular
  const harshness = Math.max(0, (taxRate - 1.0) * 0.1) + (isCrisis ? 0.15 : 0);
  // La salud alta (>0.5) protege células aisladas
  const isolationProtection = healthBonus * 0.15;

  let totalAlive = 0;

  for (let r = 0; r < rows; r++) {
    const nextRow = [];
    for (let c = 0; c < cols; c++) {
      const current = grid[r][c];
      const neighbors = countNeighbors(grid, r, c, rows, cols);

      let nextState = 0;

      if (current === 1) {
        // Reglas estándar de Conway: Supervivencia con 2 o 3 vecinos
        if (neighbors === 2 || neighbors === 3) {
          nextState = Math.random() < harshness ? 0 : 1;
        } else if (neighbors < 2) {
          // Muerte por soledad, pero si la sanidad es muy alta puede sobrevivir
          nextState = Math.random() < isolationProtection ? 1 : 0;
        } else {
          // Muerte por sobrepoblación (neighbors > 3)
          nextState = 0;
        }
      } else {
        // Regla de nacimiento estándar: Nace con exactamente 3 vecinos
        if (neighbors === 3) {
          nextState = 1;
        } else if (neighbors === 2 && Math.random() < (infraBonus * 0.05 + growthModifier)) {
          // Infraestructura permite que nazcan nuevas comunidades con solo 2 vecinos cercanos
          nextState = 1;
        }
      }

      if (nextState === 1) totalAlive++;
      nextRow.push(nextState);
    }
    nextGrid.push(nextRow);
  }

  // Si la cuadrícula está casi muerta (menos de 5 celdas), sembrar una pequeña chispa de vida
  if (totalAlive < 5) {
    const centerR = Math.floor(rows / 2);
    const centerC = Math.floor(cols / 2);
    return spawnGlider(nextGrid, centerR, centerC);
  }

  return nextGrid;
};
