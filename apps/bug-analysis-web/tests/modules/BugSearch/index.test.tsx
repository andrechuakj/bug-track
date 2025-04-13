import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BUG_EXPLORE_KEY,
  BugSearch,
  BugSearchProps,
  SEARCH_RESULTS_KEY,
} from '../../../src/modules';
import { MockAppProvider } from '../../contexts/MockAppProvider';
import { BugSearchResultStruct } from '../../../src/utils/bug';
import { AppTheme, FilterBugCategory } from '../../../src/utils/types';
import { fireEvent, render } from '@testing-library/react';
import { expectComponentCalledWithPropsContaining } from '../../MockFnAssertUtils';
import { Dispatch, SetStateAction } from 'react';

const { mockSearchResultListItem, mockLoadingOutlined } = vi.hoisted(() => ({
  mockSearchResultListItem: vi.fn(() => (
    <div data-testid="mock-search-result-list-item" />
  )),
  mockLoadingOutlined: vi.fn(() => <div data-testid="mock-loading-outlined" />),
}));

vi.mock('../../../src/components/SearchResultListItem', () => ({
  default: mockSearchResultListItem,
}));

vi.mock('@ant-design/icons', async (importOriginal) => {
  const original = await importOriginal<typeof import('@ant-design/icons')>();
  return {
    ...original,
    LoadingOutlined: mockLoadingOutlined,
  };
});

const defaultProps: BugSearchProps = {
  bugReports: {},
  bugSearchReports: {},
  handleBugExploreLoadMore: vi.fn(),
  activeKey: BUG_EXPLORE_KEY,
  setActiveKey: vi.fn(),
  isFetchingSearchResult: false,
};

const mockBugReports: BugSearchResultStruct = {
  [FilterBugCategory.OTHERS]: {
    categoryId: 10,
    title: FilterBugCategory.OTHERS,
    bugs: [
      {
        display: 'test bug',
        bugReportId: 1,
        description: 'This is a test bug',
      },
    ],
  },
};

const mockBugSearchReportsData: BugSearchResultStruct = {
  [FilterBugCategory.CRASH]: {
    categoryId: 20,
    title: FilterBugCategory.CRASH,
    bugs: [
      {
        display: 'test network bug',
        bugReportId: 3,
        description: 'This is a test network bug',
      },
    ],
  },
};

type RenderComponentOptions = {
  bugReports?: BugSearchResultStruct;
  bugSearchReports?: BugSearchResultStruct;
  handleBugExploreLoadMore?: (tenantId: number, categoryId: number) => void;
  activeKey?: string;
  setActiveKey?: Dispatch<SetStateAction<string>>;
  isFetchingSearchResult?: boolean;
  currentTheme?: AppTheme;
};

const renderComponent = (options: RenderComponentOptions = {}) => {
  const { currentTheme, ...componentProps } = options;

  const finalComponentProps = { ...defaultProps, ...componentProps };

  return render(
    <MockAppProvider theme={currentTheme}>
      <BugSearch {...finalComponentProps} />
    </MockAppProvider>
  );
};

describe('BugSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Explore tab content when activeKey is BUG_EXPLORE_KEY', () => {
    renderComponent({
      bugReports: mockBugReports,
      bugSearchReports: mockBugSearchReportsData,
      activeKey: BUG_EXPLORE_KEY,
      isFetchingSearchResult: false,
    });

    const expectedCategory = Object.values(mockBugReports)[0];
    expectComponentCalledWithPropsContaining(mockSearchResultListItem, {
      searchResultCategory: expectedCategory,
    });
  });

  it('renders Search Results tab content when activeKey is SEARCH_RESULTS_KEY', () => {
    renderComponent({
      bugReports: mockBugReports,
      bugSearchReports: mockBugSearchReportsData,
      activeKey: SEARCH_RESULTS_KEY,
      isFetchingSearchResult: false,
    });

    const expectedCategory = Object.values(mockBugSearchReportsData)[0];
    expectComponentCalledWithPropsContaining(mockSearchResultListItem, {
      searchResultCategory: expectedCategory,
    });
  });

  it('renders tab options', () => {
    const { getByText } = renderComponent();
    expect(getByText('Explore Bug Reports')).toBeInTheDocument();
    expect(getByText('Search Results')).toBeInTheDocument();
  });

  it('switches tabs on click', () => {
    const setActiveKeyMock = vi.fn();
    const { getByText, rerender } = renderComponent({
      activeKey: SEARCH_RESULTS_KEY,
      setActiveKey: setActiveKeyMock,
    });

    expect(setActiveKeyMock).not.toHaveBeenCalled();

    fireEvent.click(getByText('Explore Bug Reports'));
    expect(setActiveKeyMock).toHaveBeenCalledWith(BUG_EXPLORE_KEY);

    rerender(
      <MockAppProvider>
        <BugSearch
          {...defaultProps}
          activeKey={BUG_EXPLORE_KEY}
          setActiveKey={setActiveKeyMock}
          bugReports={mockBugReports}
          bugSearchReports={mockBugSearchReportsData}
        />
      </MockAppProvider>
    );

    fireEvent.click(getByText('Search Results'));
    expect(setActiveKeyMock).toHaveBeenCalledWith(SEARCH_RESULTS_KEY);
  });

  it('renders LoadingOutlined in Explore tab when fetching', () => {
    const { getByTestId } = renderComponent({ isFetchingSearchResult: true });
    expect(getByTestId('mock-loading-outlined')).toBeInTheDocument();
  });

  it('renders LoadingOutlined in Search Results tab when fetching', () => {
    const { getByTestId } = renderComponent({
      isFetchingSearchResult: true,
      activeKey: SEARCH_RESULTS_KEY,
    });
    expect(getByTestId('mock-loading-outlined')).toBeInTheDocument();
  });

  it('renders SearchResultListItem in Search Results tab with data', () => {
    const mockBugSearchReports: BugSearchResultStruct = {
      [FilterBugCategory.OTHERS]: {
        categoryId: 10,
        title: FilterBugCategory.OTHERS,
        bugs: [
          {
            display: 'test search bug',
            bugReportId: 2,
            description: 'This is a test search bug',
          },
        ],
      },
    };
    renderComponent({
      bugSearchReports: mockBugSearchReports,
      isFetchingSearchResult: false,
      activeKey: SEARCH_RESULTS_KEY,
    });
    expect(mockSearchResultListItem).toHaveBeenCalled();
  });

  it('renders SearchResultListItem in Explore tab with data', () => {
    renderComponent({
      bugReports: mockBugReports,
      isFetchingSearchResult: false,
    });
    expect(mockSearchResultListItem).toHaveBeenCalled();
  });

  it('renders themes differently in Explore tab', () => {
    const { container: containerDark } = renderComponent({
      currentTheme: 'dark',
      bugReports: mockBugReports,
      activeKey: BUG_EXPLORE_KEY,
    });
    const listDark = containerDark.querySelector('.ant-list');
    const darkClasses = listDark?.className;

    const { container: containerLight } = renderComponent({
      currentTheme: 'light',
      bugReports: mockBugReports,
      activeKey: BUG_EXPLORE_KEY,
    });
    const listLight = containerLight.querySelector('.ant-list');
    const lightClasses = listLight?.className;

    expect(darkClasses).not.toBe(lightClasses);
    expect(darkClasses).toBeDefined();
    expect(lightClasses).toBeDefined();
  });

  it('renders themes differently in Search Results tab', () => {
    const { container: containerDark } = renderComponent({
      currentTheme: 'dark',
      bugSearchReports: mockBugSearchReportsData,
      activeKey: SEARCH_RESULTS_KEY,
    });
    const listDark = containerDark.querySelector('.ant-list');
    const darkClasses = listDark?.className;

    const { container: containerLight } = renderComponent({
      currentTheme: 'light',
      bugSearchReports: mockBugSearchReportsData,
      activeKey: SEARCH_RESULTS_KEY,
    });
    const listLight = containerLight.querySelector('.ant-list');
    const lightClasses = listLight?.className;

    expect(darkClasses).not.toBe(lightClasses);
    expect(darkClasses).toBeDefined();
    expect(lightClasses).toBeDefined();
  });
});
