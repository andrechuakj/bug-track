import { LoadingOutlined } from '@ant-design/icons';
import { List, Tabs } from 'antd';
import clsx from 'clsx';
import { Dispatch, ReactNode, SetStateAction, useMemo } from 'react';
import SearchResultListItem from '../../components/SearchResultListItem';
import { useAppContext } from '../../contexts/AppContext';
import { BugSearchResultStruct } from '../../utils/bug';

type Props = {
  bugReports: BugSearchResultStruct;
  bugSearchReports: BugSearchResultStruct;
  handleBugExploreLoadMore: (tenantId: number, categoryId: number) => void;
  activeKey: string;
  setActiveKey: Dispatch<SetStateAction<string>>;
  isFetchingSearchResult: boolean;
};

export const BUG_EXPLORE_KEY = '1';
export const SEARCH_RESULTS_KEY = '2';

const BugExploreSearchResultsModule: React.FC<Props> = ({
  bugReports,
  bugSearchReports,
  handleBugExploreLoadMore,
  activeKey,
  setActiveKey,
  isFetchingSearchResult,
}) => {
  const { theme } = useAppContext();
  const isDarkMode = theme === 'dark';

  const bugExplore: ReactNode = useMemo(
    () => (
      <>
        {isFetchingSearchResult && <LoadingOutlined />}
        {!isFetchingSearchResult && bugReports && (
          <List
            size="large"
            bordered
            dataSource={Object.entries(bugReports)}
            renderItem={([_, value]) => (
              <SearchResultListItem
                searchResultCategory={value}
                handleLoadMore={handleBugExploreLoadMore}
              />
            )}
            className={clsx(
              'h-[40vh] overflow-y-scroll',
              isDarkMode ? 'bg-black' : 'bg-white'
            )}
          />
        )}
      </>
    ),
    [bugReports, handleBugExploreLoadMore, isDarkMode, isFetchingSearchResult]
  );

  const bugSearchResults: ReactNode = useMemo(
    () => (
      <>
        {isFetchingSearchResult && <LoadingOutlined />}
        {!isFetchingSearchResult && bugSearchReports && (
          <List
            size="large"
            bordered
            dataSource={Object.entries(bugSearchReports)}
            renderItem={([_, value]) => (
              <SearchResultListItem searchResultCategory={value} />
            )}
            className={clsx(
              'h-[40vh] overflow-y-scroll',
              isDarkMode ? 'bg-black' : 'bg-white',
              Object.keys(bugSearchReports).length === 0 &&
                'flex justify-center items-center'
            )}
          />
        )}
      </>
    ),
    [bugSearchReports, isDarkMode, isFetchingSearchResult]
  );

  const items = useMemo(
    () => [
      {
        label: 'Explore Bug Reports',
        children: bugExplore,
        key: BUG_EXPLORE_KEY,
      },
      {
        label: 'Search Results',
        children: bugSearchResults,
        key: SEARCH_RESULTS_KEY,
      },
    ],
    [bugExplore, bugSearchResults]
  );

  // Tabs callbacks
  const onChange = (newActiveKey: string) => setActiveKey(newActiveKey);

  return <Tabs {...{ onChange, activeKey, items }} />;
};

export default BugExploreSearchResultsModule;
