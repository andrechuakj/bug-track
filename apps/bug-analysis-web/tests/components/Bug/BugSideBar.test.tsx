import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BugCategoryResponseDto, BugReport } from '../../../src/api/bugReport';
import BugSideBar from '../../../src/components/Bug/BugSideBar';
import {
  mockBugReportData,
  MockBugReportProvider,
} from '../../contexts/MockBugReportProvider';

const { mockFetchAllCategories, mockUpdateBugCategory } = vi.hoisted(() => ({
  mockFetchAllCategories: vi.fn(),
  mockUpdateBugCategory: vi.fn(),
}));

vi.mock('../../../src/api/bugReport', () => ({
  fetchAllCategories: mockFetchAllCategories,
  updateBugCategory: mockUpdateBugCategory,
}));

const mockCategories: BugCategoryResponseDto[] = [
  { id: 1, name: 'UI', count: 5 },
  { id: 2, name: 'Backend', count: 10 },
  { id: 3, name: 'Database', count: 3 },
];
mockFetchAllCategories.mockResolvedValue(mockCategories);

type RenderComponentOptions = {
  isBugLoading?: boolean;
  bugReport?: BugReport;
};

const renderComponent = (options: RenderComponentOptions = {}) => {
  return render(
    <MockBugReportProvider {...options}>
      <BugSideBar />
    </MockBugReportProvider>
  );
};

describe('BugSideBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchAllCategories.mockResolvedValue(mockCategories);
  });

  it('renders titles', async () => {
    renderComponent({ isBugLoading: true });

    await waitFor(() => {
      expect(screen.getByText('DBMS')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Versions affected')).toBeInTheDocument();
    });
  });

  it('renders skeletons when isBugLoading is true', async () => {
    const { container } = renderComponent({ isBugLoading: true });

    await waitFor(() => {
      const skeletons = container.querySelectorAll('.ant-skeleton-input');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it('renders Category Tags', async () => {
    renderComponent({ isBugLoading: false, bugReport: mockBugReportData });

    await waitFor(() => {
      expect(screen.getByText(mockBugReportData.category)).toBeInTheDocument();
      expect(screen.getByText(mockBugReportData.dbms)).toBeInTheDocument();
    });
  });
});
