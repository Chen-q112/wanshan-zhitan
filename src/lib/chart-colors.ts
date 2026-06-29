// ECharts hex 色板 —— 从 tailwind-theme.css chart-1~5 HSL 转换
// chart-1: hsl(207 60% 48%) → #3176ba
// chart-2: hsl(237 60% 48%) → #3131ba
// chart-3: hsl(267 60% 48%) → #5c31ba
// chart-4: hsl(297 60% 48%) → #9631ba
// chart-5: hsl(327 60% 48%) → #ba3176

export const CHART_COLORS = [
  '#3176ba',
  '#3131ba',
  '#5c31ba',
  '#9631ba',
  '#ba3176',
] as const;

export type ChartColor = (typeof CHART_COLORS)[number];
