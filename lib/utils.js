/**
 * Calculate position size based on risk management
 * @param {number} capital - Total trading capital
 * @param {number} entry - Entry price
 * @param {number} stopLoss - Stop loss price
 * @param {number} riskPercent - Risk percentage (e.g., 2 for 2%)
 * @returns {number} Position size (number of units)
 */
export function calculatePositionSize(capital, entry, stopLoss, riskPercent) {
  const riskAmount = capital * (riskPercent / 100);
  const perUnitRisk = Math.abs(entry - stopLoss);
  if (!perUnitRisk || perUnitRisk === 0) return 0;
  return Math.floor(riskAmount / perUnitRisk);
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercent(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/**
 * Format date
 */
export function formatDate(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Sanitize OCR text - remove suspicious long binary strings
 */
export function sanitizeOCRText(text) {
  if (!text) return '';
  // Remove lines longer than 200 characters (likely binary/encoded data)
  return text
    .split('\n')
    .filter(line => line.length <= 200)
    .join('\n')
    .substring(0, 5000); // Limit total length
}

/**
 * Extract trade data from OCR text using regex
 */
export function extractTradeDataFromOCR(ocrText) {
  const data = {};
  
  // Extract entry price
  const entryMatch = ocrText.match(/(?:entry|buy|long|short)[\s:]*\$?([\d,]+\.?\d*)/i);
  if (entryMatch) {
    data.entryPrice = parseFloat(entryMatch[1].replace(/,/g, ''));
  }
  
  // Extract exit price
  const exitMatch = ocrText.match(/(?:exit|sell|close)[\s:]*\$?([\d,]+\.?\d*)/i);
  if (exitMatch) {
    data.exitPrice = parseFloat(exitMatch[1].replace(/,/g, ''));
  }
  
  // Extract stop loss
  const stopMatch = ocrText.match(/(?:stop|stop[\s-]?loss|sl)[\s:]*\$?([\d,]+\.?\d*)/i);
  if (stopMatch) {
    data.stopLoss = parseFloat(stopMatch[1].replace(/,/g, ''));
  }
  
  // Extract quantity
  const qtyMatch = ocrText.match(/(?:qty|quantity|shares|contracts|size)[\s:]*([\d,]+\.?\d*)/i);
  if (qtyMatch) {
    data.qty = parseFloat(qtyMatch[1].replace(/,/g, ''));
  }
  
  // Extract symbol
  const symbolMatch = ocrText.match(/\b([A-Z]{1,5})\b/);
  if (symbolMatch) {
    data.symbol = symbolMatch[1];
  }
  
  return data;
}

