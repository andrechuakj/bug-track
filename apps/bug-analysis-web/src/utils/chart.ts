// Bug distribution by category, bar graph

export interface BugCategory {
  category: string;
  count: number;
}

export interface BugDistribution {
  categories: BugCategory[];
}

export const generateBugDistrBar = (
  distr: BugDistribution,
  title: string,
  theme: 'dark' | 'light' = 'dark'
) => {
  const isDark = theme === 'dark';
  const color = isDark ? '#ffffff' : '#000000';

  return {
    tooltip: {},
    xAxis: {
      type: 'category',
      data: distr.categories.map((e) => e.category),
      axisLabel: { color },
      axisLine: { lineStyle: { color } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color },
      axisLine: { lineStyle: { color } },
    },
    series: [
      {
        data: distr.categories.map((e) => e.count),
        type: 'bar',
        itemStyle: { color: '#7f51db' },
      },
    ],
  };
};
