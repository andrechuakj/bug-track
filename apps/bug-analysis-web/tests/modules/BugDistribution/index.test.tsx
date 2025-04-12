import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BugDistribution, BugDistributionProps } from '../../../src/modules';
import { MockAppProvider } from '../../contexts/MockAppProvider';
import { BugCategory } from '../../../src/api/dbms';
import { expectNthCallWithPropsContaining } from '../../TestUtils';

const { mockEChartsReact } = vi.hoisted(() => ({
  mockEChartsReact: vi.fn(() => <div data-testid="mock-echarts-react" />),
}));

vi.mock('echarts-for-react', () => ({
  default: mockEChartsReact,
}));

const { mockCategoryTag } = vi.hoisted(() => ({
  mockCategoryTag: vi.fn(({ text }) => (
    <div data-testid="mock-category-tag">{text}</div>
  )),
}));

vi.mock('../../../src/components/CategoryTag', () => ({
  default: mockCategoryTag,
}));

const renderComponent = (props: BugDistributionProps) => {
  return render(
    <MockAppProvider>
      <BugDistribution {...props} />
    </MockAppProvider>
  );
};

describe('BugDistribution', () => {
  it('renders title', () => {
    renderComponent({ categories: [] });
    expect(
      screen.getByText('Bug Distribution (by category)')
    ).toBeInTheDocument();
  });

  it('renders EChartsReact component', () => {
    renderComponent({ categories: [] });
    expect(screen.getByTestId('mock-echarts-react')).toBeInTheDocument();
  });

  it('renders category tags correctly, filtering zero counts', () => {
    const mockCategories: BugCategory[] = [
      { id: 1, name: 'UI', count: 5 },
      { id: 2, name: 'Backend', count: 0 },
      { id: 3, name: 'Database', count: 10 },
    ];

    renderComponent({ categories: mockCategories });

    expect(screen.getByText('UI | 5')).toBeInTheDocument();
    expect(screen.getByText('Database | 10')).toBeInTheDocument();
    expect(screen.queryByText('Backend | 0')).not.toBeInTheDocument();

    expect(mockCategoryTag).toHaveBeenCalledTimes(2);

    expectNthCallWithPropsContaining(mockCategoryTag, 1, {
      text: 'UI | 5',
    });

    expectNthCallWithPropsContaining(mockCategoryTag, 2, {
      text: 'Database | 10',
    });
  });
});
