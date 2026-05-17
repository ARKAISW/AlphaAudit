import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineStyle, LineSeries } from 'lightweight-charts';
import { formatForChart } from '../lib/equityGenerator';

export default function EquityCurve({ equityData }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 200;

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    let chart;
    try {
      chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: '#0d1117' },
          textColor: '#8b949e',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
        },
        grid: {
          vertLines: { color: '#21262d' },
          horzLines: { color: '#21262d' },
        },
        crosshair: {
          vertLine: { color: '#484f58', style: LineStyle.Dashed, width: 1 },
          horzLine: { color: '#484f58', style: LineStyle.Dashed, width: 1 },
        },
        rightPriceScale: {
          borderColor: '#30363d',
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: {
          borderColor: '#30363d',
          timeVisible: false,
        },
        width: width,
        height: height,
      });
      chartRef.current = chart;
    } catch (err) {
      console.error('Failed to create chart:', err);
      return;
    }

    if (equityData) {
      const { dates, naiveCurve, correctedCurve } = equityData;

      if (dates && naiveCurve && correctedCurve) {
        // Adjusted curve (reality after bias removal) — green, should be LOWER
        const adjustedSeries = chart.addSeries(LineSeries, {
          color: '#3fb950',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          title: 'Adjusted',
          priceFormat: { type: 'custom', formatter: (p) => `$${p.toFixed(0)}` },
        });
        adjustedSeries.setData(formatForChart(dates, correctedCurve));

        // Reported curve (inflated backtest) — red, should be HIGHER
        const reportedSeries = chart.addSeries(LineSeries, {
          color: '#f85149',
          lineWidth: 2,
          title: 'Reported',
          priceFormat: { type: 'custom', formatter: (p) => `$${p.toFixed(0)}` },
        });
        reportedSeries.setData(formatForChart(dates, naiveCurve));

        chart.timeScale().fitContent();
      }
    }

    // Resize observer with cleanup check
    const resizeObserver = new ResizeObserver(entries => {
      if (!chartRef.current) return;
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          chartRef.current.applyOptions({ width, height });
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [equityData]);

  return (
    <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
      <div className="panel-header">
        <span>Equity Curve</span>
        {equityData?.stats && (
          <div className="flex gap-3">
            <span className="text-xs font-mono" style={{ color: 'var(--color-critical)', fontSize: '10px' }}>
              Reported: {equityData.stats.naiveReturn} (SR {equityData.stats.naiveSharpe})
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--color-success)', fontSize: '10px' }}>
              Adjusted: {equityData.stats.correctedReturn} (SR {equityData.stats.correctedSharpe})
            </span>
          </div>
        )}
      </div>
      <div
        ref={chartContainerRef}
        className="flex-1 min-h-0"
        style={{
          backgroundColor: '#0d1117',
        }}
      >
        {!equityData && (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
              Run audit to generate curves
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
