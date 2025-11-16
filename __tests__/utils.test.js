// For CommonJS test environment
function calculatePositionSize(capital, entry, stopLoss, riskPercent) {
  const riskAmount = capital * (riskPercent / 100);
  const perUnitRisk = Math.abs(entry - stopLoss);
  if (!perUnitRisk || perUnitRisk === 0) return 0;
  return Math.floor(riskAmount / perUnitRisk);
}

describe('calculatePositionSize', () => {
  test('calculates position size correctly for long trade', () => {
    const capital = 10000;
    const entry = 100;
    const stopLoss = 95;
    const riskPercent = 2;
    
    const result = calculatePositionSize(capital, entry, stopLoss, riskPercent);
    
    // Risk amount = 10000 * 0.02 = 200
    // Per unit risk = 100 - 95 = 5
    // Position size = 200 / 5 = 40
    expect(result).toBe(40);
  });

  test('calculates position size correctly for short trade', () => {
    const capital = 10000;
    const entry = 100;
    const stopLoss = 105;
    const riskPercent = 2;
    
    const result = calculatePositionSize(capital, entry, stopLoss, riskPercent);
    
    // Risk amount = 10000 * 0.02 = 200
    // Per unit risk = |100 - 105| = 5
    // Position size = 200 / 5 = 40
    expect(result).toBe(40);
  });

  test('returns 0 when entry equals stop loss', () => {
    const capital = 10000;
    const entry = 100;
    const stopLoss = 100;
    const riskPercent = 2;
    
    const result = calculatePositionSize(capital, entry, stopLoss, riskPercent);
    
    expect(result).toBe(0);
  });

  test('returns 0 when per unit risk is 0', () => {
    const capital = 10000;
    const entry = 100;
    const stopLoss = 100;
    const riskPercent = 2;
    
    const result = calculatePositionSize(capital, entry, stopLoss, riskPercent);
    
    expect(result).toBe(0);
  });

  test('handles fractional results correctly (floors)', () => {
    const capital = 10000;
    const entry = 100;
    const stopLoss = 98;
    const riskPercent = 2;
    
    const result = calculatePositionSize(capital, entry, stopLoss, riskPercent);
    
    // Risk amount = 200
    // Per unit risk = 2
    // Position size = 200 / 2 = 100 (exact)
    expect(result).toBe(100);
  });
});

