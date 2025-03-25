import { describe, expect, it } from 'vitest';
import { BugCategory } from '../../src/api/dbms';
import {
  generateBugDistrBar,
  generateBugTrendChart,
} from '../../src/utils/chart';

describe('generateBugDistrBar', () => {
  it('should return "No Bugs" chart when no data is provided', () => {
    const result = generateBugDistrBar([]);
    expect(result.title?.text).toBe('No Bugs');
    expect(result.series).toBeUndefined();
  });

  it('should generate a bar chart with filtered data', () => {
    const mockData: BugCategory[] = [
      { id: 0, name: 'Performance Degradation', count: 5 },
      { id: 1, name: 'Compatibility', count: 0 },
      { id: 2, name: 'Usability', count: 3 },
    ];
    const result = generateBugDistrBar(mockData);

    // Only categories with count > 0
    expect(result.series?.[0]?.data).toHaveLength(2);
  });

  it('should apply dark theme styles correctly', () => {
    const mockData: BugCategory[] = [{ id: 1, name: 'UI Bug', count: 5 }];
    const result = generateBugDistrBar(mockData, 'dark');

    expect(result.xAxis?.axisLabel?.color).toBe('#ffffff');
    expect(result.yAxis?.axisLabel?.color).toBe('#ffffff');
  });

  it('should apply light theme styles correctly', () => {
    const mockData: BugCategory[] = [{ id: 1, name: 'UI Bug', count: 5 }];
    const result = generateBugDistrBar(mockData, 'light');

    expect(result.xAxis?.axisLabel?.color).toBe('#000000');
    expect(result.yAxis?.axisLabel?.color).toBe('#000000');
  });
});

describe('generateBugTrendChart', () => {
  it('should generate a line chart with correct labels and data', () => {
    const mockData = [
      { label: 'Jan', count: 10 },
      { label: 'Feb', count: 15 },
      { label: 'Mar', count: 5 },
    ];
    const result = generateBugTrendChart(mockData);

    expect(result.xAxis?.data).toEqual(['Jan', 'Feb', 'Mar']);
    expect(result.series?.[0]?.data).toEqual([10, 15, 5]);
  });

  it('should truncate long labels in the x-axis', () => {
    const mockData = [{ label: 'VeryLongMonthName', count: 10 }];
    const result = generateBugTrendChart(mockData);

    expect(result.xAxis?.axisLabel?.formatter('VeryLongMonthName')).toBe(
      'VeryLo...'
    );
  });

  it('should set the correct series type and styles', () => {
    const mockData = [{ label: 'Jan', count: 10 }];
    const result = generateBugTrendChart(mockData);

    expect(result.series?.[0]?.type).toBe('line');
  });
});
