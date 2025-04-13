import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BugCategoryResponseDto, BugReport } from '../../../src/api/bugReport';
import BugSideBar from '../../../src/components/Bug/BugSideBar';
import {
  mockBugReportData,
  MockBugReportProvider,
} from '../../contexts/MockBugReportProvider';
import { BugPriority } from '../../../src/utils/types';

const { mockFetchAllCategories, mockUpdateBugCategory, mockUpdateBugPriority } =
  vi.hoisted(() => ({
    mockFetchAllCategories: vi.fn(),
    mockUpdateBugCategory: vi.fn(),
    mockUpdateBugPriority: vi.fn(),
  }));

vi.mock('../../../src/api/bugReport', () => ({
  fetchAllCategories: mockFetchAllCategories,
  updateBugCategory: mockUpdateBugCategory,
  updateBugPriority: mockUpdateBugPriority,
}));

const mockCategories: BugCategoryResponseDto[] = [
  { id: 1, name: 'Category A', count: 5 },
  { id: 2, name: 'Category B', count: 10 },
  { id: 3, name: 'Category C', count: 6 },
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

  it('renders category menu based on fetched categories', async () => {
    const { getByText, findByRole } = renderComponent({
      isBugLoading: false,
      bugReport: mockBugReportData,
    });

    await waitFor(() => expect(mockFetchAllCategories).toHaveBeenCalled());

    const categoryEditIcon =
      getByText('Category').parentElement?.querySelector('a');
    if (categoryEditIcon) {
      fireEvent.click(categoryEditIcon);
    }

    const dropdownMenu = await findByRole('menu');
    expect(dropdownMenu).toBeInTheDocument();

    await waitFor(async () => {
      for (const category of mockCategories) {
        expect(
          await within(dropdownMenu).findByText(category.name)
        ).toBeInTheDocument();
      }
    });
  });

  it('updates categories', async () => {
    const newCategory = mockCategories[1];
    const updatedBugReport = {
      ...mockBugReportData,
      category_id: newCategory.id,
      category: newCategory.name,
    };
    mockUpdateBugCategory.mockResolvedValue(updatedBugReport);

    const { findByRole, getByRole } = renderComponent({
      isBugLoading: false,
      bugReport: mockBugReportData,
    });

    await waitFor(() => expect(mockFetchAllCategories).toHaveBeenCalled());

    const categoryEditIcon = screen
      .getByText('Category')
      .parentElement?.querySelector('a');
    if (categoryEditIcon) {
      fireEvent.click(categoryEditIcon);
    }

    const dropdownMenu = await findByRole('menu');
    expect(dropdownMenu).toBeInTheDocument();
    const menuItem = await within(dropdownMenu).findByText(newCategory.name);
    fireEvent.click(menuItem);

    expect(getByRole('img', { name: /loading/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockUpdateBugCategory).toHaveBeenCalledWith(
        mockBugReportData.id,
        newCategory.id
      );
    });
  });

  it('renders priority menu based on fetched priorities', async () => {
    renderComponent({ isBugLoading: false, bugReport: mockBugReportData });

    const priorityEditIcon = screen
      .getByText('Bug Priority')
      .parentElement?.querySelector('a');
    if (priorityEditIcon) {
      fireEvent.click(priorityEditIcon);
    }

    const dropdownMenu = await screen.findByRole('menu');
    expect(dropdownMenu).toBeInTheDocument();

    await waitFor(async () => {
      for (const priorityValue of Object.values(BugPriority)) {
        expect(
          await within(dropdownMenu).findByText(priorityValue)
        ).toBeInTheDocument();
      }
    });
  });

  it('updates priority', async () => {
    const newPriority = BugPriority.HIGH;
    const updatedBugReport = {
      ...mockBugReportData,
      priority: newPriority,
    };
    mockUpdateBugPriority.mockResolvedValue(updatedBugReport);

    const { findByRole, getByRole } = renderComponent({
      isBugLoading: false,
      bugReport: mockBugReportData,
    });

    const priorityEditIcon = screen
      .getByText('Bug Priority')
      .parentElement?.querySelector('a');
    if (priorityEditIcon) {
      fireEvent.click(priorityEditIcon);
    }

    const dropdownMenu = await findByRole('menu');
    expect(dropdownMenu).toBeInTheDocument();
    const menuItem = await within(dropdownMenu).findByText(newPriority);
    fireEvent.click(menuItem);

    expect(getByRole('img', { name: /loading/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockUpdateBugPriority).toHaveBeenCalledWith(
        mockBugReportData.id,
        newPriority
      );
    });
  });
});
