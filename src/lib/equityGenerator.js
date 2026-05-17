/**
 * Synthetic equity curve generator for AlphaAudit.
 */

function seededRandom(seed) {
  let t = seed + 0x6D2B79F5;
  return function () {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalRandom(rng) {
  const u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2);
}

function generateDates(days) {
  const dates = [];
  const start = new Date('2023-01-03');
  let current = new Date(start);
  let count = 0;
  while (count < days) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(current));
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function generateCurve(days, params, seed) {
  const rng = seededRandom(seed);
  const { annualReturn, volatility, maxDrawdown } = params;
  const dailyReturn = annualReturn / 252;
  const dailyVol = volatility / Math.sqrt(252);
  const curve = [10000];
  let peak = 10000;

  for (let i = 1; i < days; i++) {
    const noise = normalRandom(rng) * dailyVol;
    const drawdownRatio = (peak - curve[i - 1]) / peak;
    const reversion = drawdownRatio > maxDrawdown * 0.7
      ? 0.002 * (drawdownRatio / maxDrawdown) : 0;
    const dailyPnl = curve[i - 1] * (dailyReturn + noise + reversion);
    let newValue = curve[i - 1] + dailyPnl;
    const minValue = peak * (1 - maxDrawdown * 1.2);
    if (newValue < minValue) {
      newValue = minValue + Math.abs(normalRandom(rng)) * peak * 0.005;
    }
    curve.push(Math.max(newValue, curve[0] * 0.3));
    peak = Math.max(peak, newValue);
  }
  return curve;
}

function calculateSharpe(curve) {
  const returns = [];
  for (let i = 1; i < curve.length; i++) {
    returns.push((curve[i] - curve[i - 1]) / curve[i - 1]);
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  const std = Math.sqrt(variance);
  if (std === 0) return 0;
  return (mean / std) * Math.sqrt(252);
}

export function generateEquityCurves(findings = []) {
  const days = 252;
  const dates = generateDates(days);
  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const warningCount = findings.filter(f => f.severity === 'WARNING').length;

  const naiveCurve = generateCurve(days, {
    annualReturn: 0.45, volatility: 0.12, maxDrawdown: 0.08,
  }, 42);

  const penaltyFactor = Math.max(0.1, 1 - (criticalCount * 0.20) - (warningCount * 0.05));

  const correctedCurve = generateCurve(days, {
    annualReturn: 0.45 * penaltyFactor,
    volatility: 0.12 + (criticalCount * 0.06) + (warningCount * 0.02),
    maxDrawdown: Math.min(0.45, 0.08 + (criticalCount * 0.10) + (warningCount * 0.04)),
  }, 137);

  const naiveFinal = naiveCurve[naiveCurve.length - 1];
  const correctedFinal = correctedCurve[correctedCurve.length - 1];

  return {
    dates,
    naiveCurve,
    correctedCurve,
    stats: {
      naiveReturn: `+${((naiveFinal - 10000) / 100).toFixed(1)}%`,
      correctedReturn: `${correctedFinal >= 10000 ? '+' : ''}${((correctedFinal - 10000) / 100).toFixed(1)}%`,
      naiveSharpe: calculateSharpe(naiveCurve).toFixed(2),
      correctedSharpe: calculateSharpe(correctedCurve).toFixed(2),
    },
  };
}

export function formatForChart(dates, curve) {
  return dates.map((date, i) => ({
    time: date.toISOString().split('T')[0],
    value: Math.round(curve[i] * 100) / 100,
  }));
}
