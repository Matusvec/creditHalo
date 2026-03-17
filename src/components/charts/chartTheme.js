import colors from '../../theme/colors';

// ---------------------------------------------------------------------------
// Chart color palette (ordered by visual priority)
// ---------------------------------------------------------------------------

/** Ordered list of chart series/slice colors matching the glass theme. */
export const CHART_COLORS = [
  '#D4A843', // gold (primary)
  '#4FC3F7', // blue
  '#81C784', // green
  '#FF8A65', // orange
  '#CE93D8', // purple
  '#F48FB1', // pink
  '#4DD0E1', // cyan
  '#FFD54F', // yellow
  '#AED581', // lime
  '#7986CB', // indigo
];

// ---------------------------------------------------------------------------
// Shared chart config consumed by react-native-gifted-charts wrappers
// ---------------------------------------------------------------------------

/**
 * Base configuration object for all chart components.
 * Pass relevant keys into gifted-charts props as needed.
 */
export const chartConfig = {
  backgroundColor: 'transparent',
  textColor: colors.textSecondary,
  labelColor: colors.textTertiary,
  gridColor: 'rgba(255, 248, 230, 0.06)',
  axisColor: 'rgba(255, 248, 230, 0.1)',
  tooltipBg: colors.surface,
  tooltipText: colors.text,
  tooltipBorder: colors.glassBorder,
};

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

/**
 * Formats a numeric dollar value for compact axis/tooltip display.
 * Values >= 1000 are shown as "$1.2k". Handles null/NaN safely.
 * @param {number} value
 * @returns {string}
 */
export const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return '$0';
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${Math.round(value)}`;
};

/**
 * Formats a decimal ratio or percentage integer as a percentage string.
 * Handles null/NaN safely. Values in range 0–1 are auto-detected and multiplied by 100.
 * @param {number} value - Either a 0–100 integer or a 0–1 decimal
 * @returns {string}
 */
export const formatPercent = (value) => {
  if (value == null || isNaN(value)) return '0%';
  const pct = value > 0 && value < 1 ? value * 100 : value;
  return `${Math.round(pct)}%`;
};

// ---------------------------------------------------------------------------
// Gifted-charts preset configs
// ---------------------------------------------------------------------------

/**
 * Common props for BarChart components styled to the glass theme.
 */
export const barChartDefaults = {
  frontColor: CHART_COLORS[0],
  gradientColor: CHART_COLORS[0] + '60',
  showGradient: true,
  barBorderRadius: 4,
  backgroundColor: 'transparent',
  rulesColor: chartConfig.gridColor,
  rulesType: 'solid',
  xAxisColor: chartConfig.axisColor,
  yAxisColor: chartConfig.axisColor,
  yAxisTextStyle: { color: chartConfig.labelColor, fontSize: 11 },
  xAxisLabelTextStyle: { color: chartConfig.labelColor, fontSize: 11 },
  noOfSections: 4,
  isAnimated: true,
  animationDuration: 600,
};

/**
 * Common props for LineChart components styled to the glass theme.
 */
export const lineChartDefaults = {
  color: CHART_COLORS[0],
  thickness: 2,
  curved: true,
  hideDataPoints: false,
  dataPointsColor: CHART_COLORS[0],
  dataPointsRadius: 4,
  backgroundColor: 'transparent',
  rulesColor: chartConfig.gridColor,
  rulesType: 'solid',
  xAxisColor: chartConfig.axisColor,
  yAxisColor: chartConfig.axisColor,
  yAxisTextStyle: { color: chartConfig.labelColor, fontSize: 11 },
  xAxisLabelTextStyle: { color: chartConfig.labelColor, fontSize: 11 },
  noOfSections: 4,
  isAnimated: true,
  animationDuration: 800,
  startFillColor: CHART_COLORS[0] + '30',
  endFillColor: CHART_COLORS[0] + '00',
  areaChart: true,
};

/**
 * Common props for PieChart components styled to the glass theme.
 */
export const pieChartDefaults = {
  donut: true,
  innerRadius: 55,
  radius: 90,
  strokeColor: colors.background,
  strokeWidth: 2,
  isAnimated: true,
  animationDuration: 700,
  textColor: colors.text,
  textSize: 12,
};
