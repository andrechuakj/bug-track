import { LoadingOutlined } from '@ant-design/icons';
import { List, Tabs } from 'antd';
import clsx from 'clsx';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import SearchResultListItem from '../../components/SearchResultListItem';
import { BugSearchResultStruct } from '../../utils/bug';
import { useAppContext } from '../../utils/context';

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

const BugExploreSearchResultsModule: React.FC<Props> = (props) => {
  const { theme } = useAppContext();
  const isDarkMode = theme === 'dark';
  const {
    bugReports,
    bugSearchReports,
    handleBugExploreLoadMore,
    activeKey,
    setActiveKey,
    isFetchingSearchResult,
  } = props;

  const bugExplore: ReactNode = (
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
  );

  const bugSearchResults: ReactNode = (
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
  );

  const items = [
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
  ];

  // Tabs callbacks
  const onChange = (newActiveKey: string) => setActiveKey(newActiveKey);

  return <Tabs {...{ onChange, activeKey, items }} />;
};

export default BugExploreSearchResultsModule;
