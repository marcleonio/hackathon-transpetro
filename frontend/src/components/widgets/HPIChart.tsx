import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from 'recharts';
import { DailyPrediction } from '../../types';
import { formatShortDate, formatFullDate } from '../../utils/dateUtils';
import {
  getHPIColor,
  getCurrentHPI,
  calculateHPIRange,
  HPI_CONSTANTS,
} from '../../utils/hpiUtils';
import { cn } from '../../utils';

interface HPIChartProps {
  predictions: DailyPrediction[];
  showLimit?: boolean;
  height?: number;
}

interface ChartDataPoint {
  date: string;
  hpi: number;
  fullDate: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: Array<{
    payload: ChartDataPoint;
    value: number;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0]?.payload;
  const hpiValue = payload[0]?.value;

  if (!data || hpiValue === undefined) {
    return null;
  }

  const isCritical = hpiValue >= HPI_CONSTANTS.CRITICAL_LIMIT;

  return (
    <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
      <p className="text-xs font-bold text-gray-900 mb-1.5">
        {formatFullDate(data.fullDate)}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-600">HPI:</span>
        <span className={cn('text-sm font-bold', isCritical ? 'text-red-600' : 'text-gray-900')}>
          {hpiValue.toFixed(3)}
        </span>
      </div>
      {isCritical && (
        <p className="text-xs text-red-600 mt-1.5 font-semibold">Acima do limite crítico</p>
      )}
    </div>
  );
};

export const HPIChart: React.FC<HPIChartProps> = ({
  predictions,
  showLimit = true,
  height = 300,
}) => {
  const chartData: ChartDataPoint[] = useMemo(
    () =>
      predictions.slice(0, 90).map((pred) => ({
        date: formatShortDate(pred.data),
        hpi: Number(pred.hpi.toFixed(3)),
        fullDate: pred.data,
      })),
    [predictions]
  );

  const currentHPI = useMemo(() => getCurrentHPI(predictions), [predictions]);
  const { min: minHPI, max: maxHPI } = useMemo(
    () => calculateHPIRange(predictions, 90),
    [predictions]
  );

  const lineColor = useMemo(() => getHPIColor(currentHPI), [currentHPI]);

  const yAxisMin = Math.max(0.95, Math.floor(minHPI * 20) / 20);
  const yAxisMax = Math.min(2.0, Math.ceil(maxHPI * 20) / 20);
  const yAxisDomain = [yAxisMin, yAxisMax];

  const chartMargin = { top: 20, right: 20, left: 10, bottom: 15 };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={chartMargin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={10}
            fontWeight={500}
            tickLine={false}
            axisLine={true}
            interval="preserveStartEnd"
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            domain={yAxisDomain}
            stroke="#6b7280"
            fontSize={10}
            fontWeight={500}
            tickLine={false}
            axisLine={true}
            tick={{ fill: '#6b7280' }}
            width={50}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLimit && (
            <ReferenceLine
              y={HPI_CONSTANTS.CRITICAL_LIMIT}
              stroke="#dc2626"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
          <ReferenceLine
            y={HPI_CONSTANTS.IDEAL}
            stroke="#00b21e"
            strokeWidth={2}
            strokeDasharray="3 3"
            opacity={0.6}
          />
          <Line
            type="monotone"
            dataKey="hpi"
            stroke={lineColor}
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: lineColor,
              strokeWidth: 2,
              stroke: '#fff',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
