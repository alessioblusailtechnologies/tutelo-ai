'use client';

import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { ViewDefinition, ViewResult } from '@/lib/viste/types';
import styles from './visualization.module.scss';

const CHART_COLORS = [
  '#2563B0', '#3A82D4', '#7EB8FF', '#1A7A4A', '#38BDF8',
  '#C0392B', '#E67E22', '#7B5EA7', '#F59E0B', '#10B981',
];

interface Props {
  definition: ViewDefinition;
  result: ViewResult;
}

function formatValue(value: unknown, format?: 'number' | 'currency' | 'percentage'): string {
  if (value === null || value === undefined) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  switch (format) {
    case 'currency':
      return `€${num.toLocaleString('it-IT', { maximumFractionDigits: 2 })}`;
    case 'percentage':
      return `${num.toLocaleString('it-IT', { maximumFractionDigits: 1 })}%`;
    default:
      return num.toLocaleString('it-IT');
  }
}

function humanize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return value.toLocaleString('it-IT');
  if (typeof value === 'string') {
    // ISO date detection
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return new Date(value).toLocaleDateString('it-IT', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    }
    return value;
  }
  return String(value);
}

export default function VisualizationRenderer({ definition, result }: Props) {
  const { visualization } = definition;
  const { rows, columns } = result;

  // ========== KPI ==========
  if (visualization.type === 'kpi') {
    const valueField = visualization.value_field || columns[0];
    const value = rows[0]?.[valueField];
    return (
      <div className={styles.kpiCard}>
        <div className={styles.kpiLabel}>{visualization.label || visualization.title || humanize(valueField)}</div>
        <div className={styles.kpiValue}>{formatValue(value, visualization.format)}</div>
      </div>
    );
  }

  // ========== Bar Chart ==========
  if (visualization.type === 'bar_chart') {
    const xField = visualization.x_field || columns[0];
    const yField = visualization.y_field || columns.find((c) => c !== xField) || columns[1];

    const chartData = rows.map((row) => ({
      name: String(row[xField] ?? '—'),
      value: Number(row[yField]) || 0,
    }));

    return (
      <div className={styles.chartContainer}>
        {visualization.title && <h3 className={styles.chartTitle}>{visualization.title}</h3>}
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 61, 111, 0.08)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#7A9CC0"
              fontSize={11}
              tickLine={false}
              angle={-20}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis stroke="#7A9CC0" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid rgba(27, 61, 111, 0.1)',
                borderRadius: 8,
                fontSize: 12,
                boxShadow: '0 4px 16px rgba(27, 61, 111, 0.1)',
              }}
            />
            <Bar dataKey="value" fill="#2563B0" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ========== Pie Chart ==========
  if (visualization.type === 'pie_chart') {
    const xField = visualization.x_field || columns[0];
    const valueField = visualization.value_field || visualization.y_field || columns.find((c) => c !== xField) || columns[1];

    const chartData = rows.map((row) => ({
      name: String(row[xField] ?? '—'),
      value: Number(row[valueField]) || 0,
    }));

    return (
      <div className={styles.chartContainer}>
        {visualization.title && <h3 className={styles.chartTitle}>{visualization.title}</h3>}
        <ResponsiveContainer width="100%" height={380}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={130}
              dataKey="value"
              label={(entry) => `${entry.name}: ${entry.value}`}
              labelLine={false}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid rgba(27, 61, 111, 0.1)',
                borderRadius: 8,
                fontSize: 12,
                boxShadow: '0 4px 16px rgba(27, 61, 111, 0.1)',
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ========== Table ==========
  return (
    <div className={styles.tableWrapper}>
      {visualization.title && <h3 className={styles.chartTitle}>{visualization.title}</h3>}
      {rows.length === 0 ? (
        <div className={styles.empty}>Nessun risultato</div>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col} className={styles.th}>{humanize(col)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  {columns.map((col) => (
                    <td key={col} className={styles.td}>{formatCell(row[col])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
