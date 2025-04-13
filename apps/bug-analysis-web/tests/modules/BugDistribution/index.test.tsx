import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BugDistribution, BugDistributionProps } from '../../../src/modules';
import { MockAppProvider } from '../../contexts/MockAppProvider';
import { BugCategory } from '../../../src/api/dbms';
import { expectComponentAnyCallWithPropsContaining } from '../../MockFnAssertUtils';

const { mockEChartsReact } = vi.hoisted(() => ({
  mockEChartsReact: vi.fn(() => <div data-testid="mock-echarts-react" />),
}));
vi.mock('echarts-for-react', () => ({
  default: mockEChartsReact,
}));

const { mockSpin } = vi.hoisted(() => ({
  mockSpin: vi.fn(() => <div data-testid="mock-spin" />),
}));
vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>();
  return {
    ...antd,
    Spin: mockSpin,
  };
});

const { mockGenerateBugDistrBar } = vi.hoisted(() => ({
  mockGenerateBugDistrBar: vi.fn(() => ({})),
}));
vi.mock('../../../src/utils/chart', () => ({
  generateBugDistrBar: mockGenerateBugDistrBar,
}));

const { mockCategoryTag } = vi.hoisted(() => ({
  mockCategoryTag: vi.fn(({ text }) => (
    <div data-testid="mock-category-tag">{text}</div>
  )),
}));
vi.mock('../../../src/components/CategoryTag', () => ({
  default: mockCategoryTag,
}));

const mockCategories: BugCategory[] = [
  { id: 1, name: 'UI', count: 5 },
  { id: 2, name: 'Backend', count: 0 },
  { id: 3, name: 'Database', count: 10 },
];

const renderComponent = (props: BugDistributionProps) => {
  return render(
    <MockAppProvider>
      <BugDistribution {...props} />
    </MockAppProvider>
  );
};

describe('BugDistribution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title', () => {
    renderComponent({ categories: [] });
    expect(
      screen.getByText('Bug Distribution (by category)')
    ).toBeInTheDocument();
  });

  it('renders spinner initially', () => {
    renderComponent({ categories: [] });

    expect(screen.getByTestId('mock-spin')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-echarts-react')).not.toBeInTheDocument();
  });

  it('renders EChartsReact component after load', async () => {
    renderComponent({ categories: mockCategories });

    expect(screen.queryByTestId('mock-echarts-react')).not.toBeInTheDocument();
    expect(mockGenerateBugDistrBar).toHaveBeenCalled();
    mockGenerateBugDistrBar.mockClear();

    await waitFor(() => {
      expect(screen.getByTestId('mock-echarts-react')).toBeInTheDocument();
    });

    expect(mockGenerateBugDistrBar).toHaveBeenCalled();
  });

  it('renders category tags correctly, filtering zero counts', () => {
    renderComponent({ categories: mockCategories });

    mockCategories.forEach((cat) => {
      const expectedText = `${cat.name} | ${cat.count}`;
      if (cat.count > 0) {
        expect(screen.getByText(expectedText)).toBeInTheDocument();
        expectComponentAnyCallWithPropsContaining(mockCategoryTag, {
          text: expectedText,
        });
      } else if (cat.count == 0) {
        expect(screen.queryByText(expectedText)).not.toBeInTheDocument();
      }
    });
  });
});
