import { render, RenderResult, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Responses } from '~api';
import {
  BugReports,
  DbmsListResponseDto,
  DbmsResponseDto,
} from '../../src/api/dbms';
import Dashboard from '../../src/pages/dashboard';
import { MockAppProvider } from '../contexts/MockAppProvider';
import { MockAuthProvider } from '../contexts/MockAuthProvider';
import {
  MockSessionProvider,
  mockTenantA,
  mockTenantAData,
} from '../contexts/MockSessionProvider';
import { expectComponentCalledWithPropsContaining } from '../TestUtils';

const { mockSearchBugReports, mockFetchBugTrend, mockFetchDbmsData } =
  vi.hoisted(() => ({
    mockSearchBugReports: vi.fn(),
    mockFetchBugTrend: vi.fn(),
    mockFetchDbmsData: vi.fn(),
  }));

vi.mock('../../src/api/dbms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/api/dbms')>(); // Import actual module
  return {
    ...actual,
    searchBugReports: mockSearchBugReports,
    fetchBugTrend: mockFetchBugTrend,
    fetchDbmsData: mockFetchDbmsData,
  };
});

type BugReportResponseDto = Responses<'BugReportResponseDto'>;
const mockBugReport: BugReportResponseDto = {
  id: 101,
  dbms_id: mockTenantA.id,
  dbms: 'Test DBMS',
  category_id: 1,
  category: 'UI',
  title: 'Mock Bug Report',
  description: 'A mock description',
  url: '',
  priority: 'Low',
  issue_created_at: new Date().toISOString(),
  issue_updated_at: null,
  issue_closed_at: null,
  is_closed: false,
};
const mockBugReportsResult: BugReports = {
  bug_reports: [mockBugReport],
};
mockSearchBugReports.mockResolvedValue(mockBugReportsResult);
const mockTrendData: number[] = [1, 2, 3];
mockFetchBugTrend.mockResolvedValue(mockTrendData);
mockFetchDbmsData.mockImplementation((id): Promise<DbmsResponseDto> => {
  if (id === mockTenantA.id) {
    return Promise.resolve(mockTenantAData);
  }
  return Promise.reject(
    new Error('Mock fetchDbmsData: ID not found or not mocked')
  );
});

const {
  mockBugDistributionComponent,
  mockBugSearchComponent,
  mockBugTrendComponent,
  mockCategoryFilterComponent,
  mockCommentSectionComponent,
  mockDashboardAiSummaryComponent,
  mockDbmsDetailsComponent,
} = vi.hoisted(() => ({
  mockBugDistributionComponent: vi.fn(() => (
    <div data-testid="mock-bug-distribution" />
  )),
  mockBugSearchComponent: vi.fn(() => <div data-testid="mock-bug-search" />),
  mockBugTrendComponent: vi.fn(() => <div data-testid="mock-bug-trend" />),
  mockCategoryFilterComponent: vi.fn(() => (
    <div data-testid="mock-category-filter" />
  )),
  mockCommentSectionComponent: vi.fn(() => (
    <div data-testid="mock-comment-section" />
  )),
  mockDashboardAiSummaryComponent: vi.fn(() => (
    <div data-testid="mock-dashboard-ai-summary" />
  )),
  mockDbmsDetailsComponent: vi.fn(() => (
    <div data-testid="mock-dbms-details" />
  )),
}));

vi.mock('../../src/modules/BugDistribution', () => ({
  BugDistribution: mockBugDistributionComponent,
}));
vi.mock('../../src/modules/BugSearch', () => ({
  BugSearch: mockBugSearchComponent,
}));
vi.mock('../../src/modules/BugTrend', () => ({
  BugTrend: mockBugTrendComponent,
}));
vi.mock('../../src/modules/CategoryFilter', () => ({
  CategoryFilter: mockCategoryFilterComponent,
}));
vi.mock('../../src/modules/CommentSection', () => ({
  CommentSection: mockCommentSectionComponent,
}));
vi.mock('../../src/modules/DashboardAiSummary', () => ({
  DashboardAiSummary: mockDashboardAiSummaryComponent,
}));
vi.mock('../../src/modules/DbmsDetails', () => ({
  DbmsDetails: mockDbmsDetailsComponent,
}));

const pushMock = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

type RenderPageOptions = {
  isAuthenticated?: boolean;
  isLoading?: boolean;
  currentTenant?: DbmsListResponseDto;
};

const renderPage = (options: RenderPageOptions = {}): RenderResult => {
  const { isAuthenticated, isLoading, currentTenant } = options;

  return render(
    <MockAppProvider>
      <MockAuthProvider isAuthenticated={isAuthenticated} loading={isLoading}>
        <MockSessionProvider currentTenant={currentTenant}>
          <Dashboard />
        </MockSessionProvider>
      </MockAuthProvider>
    </MockAppProvider>
  );
};

describe('dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login if not authenticated', async () => {
    renderPage({ isAuthenticated: false, isLoading: false });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });

  it('does nothing if not authenticated but is loading', async () => {
    renderPage({ isAuthenticated: false, isLoading: true });

    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it('shows skeleton when no tenant is currently selected', () => {
    const { container } = renderPage({ currentTenant: undefined });

    const skeletonElement = container.querySelector('.ant-skeleton');
    expect(skeletonElement).toBeInTheDocument();
  });

  it('updates BugTrend with fetchBugTrend', async () => {
    console.log('START');
    renderPage({
      isAuthenticated: true,
      isLoading: false,
      currentTenant: mockTenantA,
    });

    await waitFor(() => {
      expect(mockFetchBugTrend).toHaveBeenCalledWith(mockTenantA.id);
      expect(mockBugTrendComponent).toHaveBeenCalled();
    });

    expectComponentCalledWithPropsContaining(mockBugTrendComponent, {
      bugTrend: mockTrendData,
    });
  });

  it('updates BugTrend, BugDistribution and DbmsDetails with fetchDbmsData', async () => {
    mockFetchDbmsData.mockResolvedValue(mockTenantAData);
    renderPage({
      isAuthenticated: true,
      isLoading: false,
      currentTenant: mockTenantA,
    });

    await waitFor(() => {
      expect(mockFetchDbmsData).toHaveBeenCalledWith(mockTenantA.id);
    });

    await waitFor(() => {
      expectComponentCalledWithPropsContaining(mockBugTrendComponent, {
        bugCount: mockTenantAData.bug_count,
      });
    });

    await waitFor(() => {
      expectComponentCalledWithPropsContaining(mockBugDistributionComponent, {
        categories: mockTenantAData.bug_categories,
      });
    });

    await waitFor(() => {
      expect(mockDbmsDetailsComponent).toHaveBeenCalled();
    });
  });
});
