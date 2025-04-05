import { EChartsOption } from 'echarts-for-react';
import { BugCategory } from '../api/dbms';
import { truncateName } from './text';
import { antdTagPresets, BugTrackColors } from './theme';
import { AppTheme } from './types';

const MAX_LABEL_LEN = 10;

export const generateBugDistrBar = (
  distr: BugCategory[],
  theme: AppTheme = 'dark'
): EChartsOption => {
  const isDark = theme === 'dark';
  const color = isDark ? '#ffffff' : '#000000';

  // Filter categories with counts
  const filteredDistr = distr?.filter((b: BugCategory) => b.count > 0) ?? [];

  // Show 'No Bugs' if no data
  if (filteredDistr.length === 0) {
    return {
      title: {
        text: 'No Bugs',
        left: 'center',
        top: 'middle',
        textStyle: {
          color,
          fontSize: 20,
        },
      },
    };
  }

  // Normal Bar Graph with Axis Label Fix
  return {
    grid: {
      top: '5%',
      left: '1%',
      right: '1%',
      bottom: '1%',
      containLabel: true,
    },
    tooltip: {},
    xAxis: {
      type: 'category',
      data: filteredDistr.map((e: BugCategory) =>
        truncateName(e.name, MAX_LABEL_LEN)
      ),
      axisLabel: {
        color,
        interval: 0, // Show all labels
        fontSize: 10,
      },
      axisLine: {
        lineStyle: { color },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color,
        fontSize: 10,
      },
      axisLine: {
        lineStyle: { color },
      },
    },
    series: [
      {
        data: filteredDistr.map((e: BugCategory, idx: number) => ({
          value: e.count,
          itemStyle: {
            color: antdTagPresets[idx % antdTagPresets.length],
            opacity: 0.45,
            borderColor: antdTagPresets[idx % antdTagPresets.length],
            borderWidth: 2,
            borderRadius: [2, 2, 0, 0],
          },
        })),
        type: 'bar',
      },
    ],
  };
};

// NOTE: This is a temporary component for showcase of layout
// TODO: Replace this component/type once dashboard design is finalised
type BugTallyInstance = { label: string; count: number };
export const generateBugTrendChart = (
  bugTallyInstances: BugTallyInstance[]
) => {
  // Extract labels and counts from the input
  const labels = bugTallyInstances.map(
    (instance: BugTallyInstance) => instance.label
  );
  const counts = bugTallyInstances.map(
    (instance: BugTallyInstance) => instance.count
  );

  const option = {
    title: {
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisTick: { alignWithLabel: true },
      axisLabel: {
        interval: (index: number) => (index % 2 === 0 ? false : true),
        formatter: (value: string) => truncateName(value, 6),
      },
    },

    yAxis: {
      type: 'value',
    },
    grid: {
      top: '5%',
      left: '1%',
      right: '1%',
      bottom: '1%',
      containLabel: true,
    },
    series: [
      {
        name: 'Bugs',
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: BugTrackColors.MAGENTA,
        },
        areaStyle: {
          opacity: 0.1,
        },
        data: counts,
      },
    ],
  };

  return option;
};
