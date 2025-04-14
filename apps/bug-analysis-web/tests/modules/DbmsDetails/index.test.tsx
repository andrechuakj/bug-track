import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DbmsDetails,
  TITLE_BUG_CATEGORIES,
  TITLE_KEY_ISSUES,
  TITLE_REPORT_GENERATED,
} from '../../../src/modules';
import { BugCategory } from '../../../src/api/dbms';
import { expectComponentNthCallWithPropsContaining } from '../../MockFnAssertUtils';

const { mockFetchNumReportsToday, mockFetchNewBugReportCategoriesToday } =
  vi.hoisted(() => ({
    mockFetchNumReportsToday: vi.fn(),
    mockFetchNewBugReportCategoriesToday: vi.fn(),
  }));
vi.mock('../../../src/api/dbms', () => ({
  fetchNumReportsToday: mockFetchNumReportsToday,
  fetchNewBugReportCategoriesToday: mockFetchNewBugReportCategoriesToday,
}));

const mockBugCategories: BugCategory[] = [
  { id: 1, name: 'Crash', count: 5 },
  { id: 2, name: 'UI Freeze', count: 4 },
  { id: 3, name: 'Data Loss', count: 0 },
];
mockFetchNumReportsToday.mockResolvedValue(mockBugCategories.length);
mockFetchNewBugReportCategoriesToday.mockResolvedValue(mockBugCategories);

const { mockCategoryTag } = vi.hoisted(() => ({
  mockCategoryTag: vi.fn(({ text }) => (
    <div data-testid="mock-category-tag">{text}</div>
  )),
}));
vi.mock('../../../src/components/CategoryTag', () => ({
  default: mockCategoryTag,
}));

type RenderPageOptions = {
  dbmsId: number;
};

const renderComponent = (options: RenderPageOptions) => {
  return render(<DbmsDetails {...options} />);
};

describe('DbmsDetails', () => {
  const MOCK_DATE_STRING = '11/1/2024, 1:11:11 PM'; // avoids mockBugCategory length

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date.prototype, 'toLocaleString').mockReturnValue(
      MOCK_DATE_STRING
    );
  });

  it('renders static titles', async () => {
    const { getByText } = renderComponent({ dbmsId: 1 });

    await waitFor(() => {
      expect(getByText(TITLE_KEY_ISSUES)).toBeInTheDocument();
      expect(getByText(TITLE_BUG_CATEGORIES)).toBeInTheDocument();
      expect(getByText(TITLE_REPORT_GENERATED)).toBeInTheDocument();
    });
  });

  it('calls fetch functions with dbmsId', async () => {
    const testDbmsId = 5;
    renderComponent({ dbmsId: testDbmsId });

    await waitFor(() => {
      expect(mockFetchNumReportsToday).toHaveBeenCalledWith(testDbmsId);
      expect(mockFetchNewBugReportCategoriesToday).toHaveBeenCalledWith(
        testDbmsId
      );
    });
  });

  it('displays fetched bug report count', async () => {
    const expectedCountA = mockBugCategories.length;
    const expectedCountB = 0;

    mockFetchNumReportsToday.mockResolvedValue(expectedCountA);
    const { findByText, rerender } = renderComponent({ dbmsId: 1 });

    const countHeading = await findByText((content) => {
      return content.includes(expectedCountA.toString());
    });
    expect(countHeading.textContent).not.toMatch(
      new RegExp(`\\b${expectedCountB}\\b`)
    );

    mockFetchNumReportsToday.mockResolvedValue(expectedCountB);
    rerender(<DbmsDetails dbmsId={2} />);

    await waitFor(() => {
      expect(countHeading.textContent).toMatch(
        new RegExp(`\\b${expectedCountB}\\b`)
      );
      expect(countHeading.textContent).not.toMatch(
        new RegExp(`\\b${expectedCountA}\\b`)
      );
    });
  });

  it('does not render category tags while categories are loading', async () => {
    mockFetchNewBugReportCategoriesToday.mockImplementationOnce(
      () => new Promise(() => {})
    );

    const { queryByTestId } = renderComponent({ dbmsId: 1 });

    await waitFor(() => {
      expect(queryByTestId('mock-category-tag')).toBeNull();
    });
  });

  it('renders correct CategoryTag props for each fetched category', async () => {
    renderComponent({ dbmsId: 1 });

    await waitFor(() => {
      expect(mockFetchNewBugReportCategoriesToday).toHaveBeenCalled();
    });

    mockBugCategories.forEach((category, index) => {
      expectComponentNthCallWithPropsContaining(mockCategoryTag, index + 1, {
        text: `${category.name} (${category.count})`,
      });
    });
  });
});
