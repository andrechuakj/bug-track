import {
  FilterOutlined,
  SortAscendingOutlined,
  ThunderboltTwoTone,
} from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  InputRef,
  Row,
  SelectProps,
  Skeleton,
  Typography,
} from 'antd';
import { debounce } from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  AiSummary,
  BugCategory,
  BugExploreReports,
  BugReports,
  DbmsResponseDto,
  fetchAiSummary,
  fetchBugTrend,
  fetchDbmsData,
  loadMoreBugsByCategory,
  searchBugReports,
} from '../api/dbms';
import CategoryTag from '../components/CategoryTag';
import DynamicModal from '../components/DynamicModal';
import FilterSelection from '../components/FilterSelection';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import BugExploreSearchResultsModule, {
  BUG_EXPLORE_KEY,
  SEARCH_RESULTS_KEY,
} from '../modules/BugExploreSearchResults';
import BugTrendModule from '../modules/BugTrend';
import {
  AcBugSearchResult,
  AcBugSearchResultCategory,
  AcBugSearchResultStruct,
  BUG_CATEGORIES,
  BugSearchResultStruct,
  categoriseBugs,
  setBugExplore,
  setBugSearchResults,
} from '../utils/bug';
import { generateBugDistrBar } from '../utils/chart';
import { useAppContext } from '../utils/context';
import { antdTagPresets, BugTrackColors } from '../utils/theme';
import {
  AppTheme,
  categoryToIdMap,
  FilterBugCategory,
  FilterBugPriority,
  FilterSettings,
} from '../utils/types';

// Dynamically import ECharts for client-side rendering only
const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false });

const HomePage: React.FC = (): ReactNode => {
  const { isAuthenticated, loading } = useAuth();
  const { currentTenant } = useSession();
  const router = useRouter();
  const [dbmsData, setDbmsData] = useState<DbmsResponseDto>();
  const [aiSummary, setAiSummary] = useState<AiSummary>();
  const [bugTrend, setBugTrend] = useState<number[]>([]);
  const [aiButtonLoading, setAiButtonLoading] = useState(false);
  const [lastSearchedStr, setLastSearchedStr] = useState('');
  // Filter states
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    category: FilterBugCategory.NONE_SELECTED,
    priority: FilterBugPriority.NONE_SELECTED,
  });
  // Form states
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [exploreSearchActiveKey, setExploreSearchActiveKey] =
    useState(BUG_EXPLORE_KEY);
  const [isFetchingSearchResult, setIsFetchingSearchResult] = useState(false);

  const [acBugReports, setAcBugReports] = useState<BugReports>({
    bug_reports: [],
  });
  const [bugSearchReports, setBugSearchReports] =
    useState<BugSearchResultStruct>({});

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login page');
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!currentTenant) return;
    fetchBugExplore();
    fetchDbmsData(currentTenant.id).then((res) => setDbmsData(res));
    fetchBugTrend(currentTenant.id).then((res) => setBugTrend(res));
    handleAiSummary();
  }, [currentTenant]);

  // Form logic (bug search)
  const [redemptionForm] = Form.useForm();

  const searchFieldRef = useRef<InputRef>(null);

  const handleSearch = useCallback(
    async (searchStr: string) => {
      if (!currentTenant) return;
      const category =
        filterSettings.category !== FilterBugCategory.NONE_SELECTED &&
        categoryToIdMap[filterSettings.category];

      const bugReports: BugReports = await searchBugReports(
        currentTenant.id,
        searchStr,
        0,
        100,
        category || undefined
      );
      if (bugReports) {
        setAcBugReports(bugReports);
        setLastSearchedStr(searchStr);
      }
      return bugReports;
    },
    [currentTenant, filterSettings]
  );

  const handleSearchDebounce = useCallback(
    debounce(async (searchStr: string) => {
      if (!currentTenant) return;
      if (searchStr.length >= 3) {
        handleSearch(searchStr);
      }
    }, 500),
    [currentTenant]
  );

  const handlePopulateSearchResults = async () => {
    let bugReportsResult: BugReports = acBugReports;
    const searchValue = searchFieldRef.current?.input?.value;

    if (searchValue && searchValue != lastSearchedStr) {
      // Fetch due to mismatch
      setIsFetchingSearchResult(true);
      // Return result as setAcBugReport is done asynchronously, and we
      // want to use the immediate result
      const res = await handleSearch(searchValue);
      if (res) {
        bugReportsResult = res;
      }
      setIsFetchingSearchResult(false);
    }
    setBugSearchResults(setBugSearchReports, bugReportsResult);
    setExploreSearchActiveKey(SEARCH_RESULTS_KEY);
    setAcBugReports({ bug_reports: [] }); // close the autocomplete drop-down
  };

  // Filter
  const bugCategoryFilterOptions = Object.values(
    FilterBugCategory
  ) as FilterBugCategory[];

  const bugPriorityFilterOptions = Object.values(
    FilterBugPriority
  ) as FilterBugPriority[];

  const filterModalItems: React.JSX.Element[] = [
    <FilterSelection
      key="filter-sel-1"
      filterPrefix={<p className="font-light">Category:</p>}
      filterSetting={filterSettings.category}
      filterOptions={bugCategoryFilterOptions}
      filterOnChange={(val: FilterBugCategory | FilterBugPriority) => {
        setFilterSettings((settings) => ({
          ...settings,
          category: val as FilterBugCategory,
        }));
      }}
      filterPlaceholder="Select Bug Category"
    />,
    <FilterSelection
      key="filter-sel-1"
      filterPrefix={<p className="font-light">Priority:</p>}
      filterSetting={filterSettings.priority}
      filterOptions={bugPriorityFilterOptions}
      filterOnChange={(val: FilterBugCategory | FilterBugPriority) => {
        setFilterSettings((settings) => ({
          ...settings,
          priority: val as FilterBugPriority,
        }));
      }}
      filterPlaceholder="Select Bug Priority"
    />,
  ];

  const handleApplyFilter = useCallback(async () => {
    let bugReportsResult: BugReports = acBugReports;

    setIsFetchingSearchResult(true);
    const res = await handleSearch(lastSearchedStr);
    if (res) {
      bugReportsResult = res;
    }
    setIsFetchingSearchResult(false);
    setBugSearchResults(setBugSearchReports, bugReportsResult);
    setExploreSearchActiveKey(SEARCH_RESULTS_KEY);
    setIsFilterModalOpen(false);
  }, [lastSearchedStr, filterSettings]);

  // Category bug explore
  // Note: The reason why we have separate data structures for autocomplete and bug explore
  //       is because these are 2 separate components, and their needs are different. While
  //       autocomplete (AC) results can be dumped as an array. We might prefer fast lookup
  //       when trying to load more of a specific category.
  const [bugExploreDistribution, setBugExploreDistribution] = useState<
    number[]
  >(Object.values(FilterBugCategory).map((_) => 0));
  const [bugReports, setBugReports] = useState<BugSearchResultStruct>({});

  const fetchBugExplore = useCallback(async () => {
    if (!currentTenant) return;
    const bugReports: BugReports = await searchBugReports(
      currentTenant.id,
      '',
      0,
      10
    );
    if (bugReports) {
      setBugExplore(
        bugExploreDistribution,
        setBugExploreDistribution,
        setBugReports,
        bugReports
      );
    }
  }, [currentTenant]);

  const handleBugExploreLoadMore = async (
    tenantId: number,
    categoryId: number
  ): Promise<void> => {
    if (tenantId === undefined) return;

    const bugExploreReports: BugExploreReports = await loadMoreBugsByCategory(
      tenantId,
      categoryId,
      bugExploreDistribution,
      5
    );
    const { bug_reports_delta, new_bug_distr } = bugExploreReports;
    setBugExploreDistribution(new_bug_distr);
    // Utilise setBugExplore function again

    setBugExplore(
      bugExploreDistribution,
      setBugExploreDistribution,
      setBugReports,
      { bug_reports: bug_reports_delta },
      BUG_CATEGORIES[categoryId],
      categoryId
    );
  };

  // AI logic
  const handleAiSummary = async () => {
    if (!currentTenant) return;
    setAiSummary(undefined);
    setAiButtonLoading(true);
    await fetchAiSummary(currentTenant.id).then((res: AiSummary) =>
      setAiSummary(res)
    );
    setAiButtonLoading(false);
  };

  const { theme } = useAppContext();
  const isDarkMode = theme === 'dark';

  // Mock BugTallyInstance data

  const Title: React.FC<Readonly<{ title?: string }>> = (props: {
    title?: string;
  }) => (
    <Flex align="center" justify="space-between">
      {props.title}
      <a
        href="https://www.google.com/search?q=antd"
        target="_blank"
        rel="noopener noreferrer"
      >
        more
      </a>
    </Flex>
  );

  const renderItem = (title: string, _count: number) => ({
    value: title,
    label: (
      <Flex align="center" justify="space-between">
        {title}
      </Flex>
    ),
  });

  // Parse bugReports into options
  const generateOptions = (result: AcBugSearchResultStruct) => {
    return result.categories.map((cat: AcBugSearchResultCategory) => ({
      label: <Title title={cat.title} />,
      options:
        cat.options?.map((opt: AcBugSearchResult) =>
          renderItem(opt.display, 1000)
        ) ?? [],
    }));
  };
  const searchResultStruct: AcBugSearchResultStruct =
    categoriseBugs(acBugReports);
  const options = generateOptions(searchResultStruct);

  return (
    <>
      {!dbmsData && <Skeleton active round />}
      {dbmsData && (
        <div className="px-4">
          <Form form={redemptionForm} onFinish={() => {}}>
            <div className="flex flex-row flex-wrap">
              <div className="w-3/4">
                <Form.Item name={['bugSearchValue']} labelCol={{ span: 24 }}>
                  <AutoComplete
                    options={options}
                    onSearch={handleSearchDebounce}
                    size="large"
                    filterOption={
                      ((inputValue, option) =>
                        String(option?.value)
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !==
                        -1) as SelectProps['filterOption']
                    }
                  >
                    <Input.Search
                      ref={searchFieldRef}
                      size="large"
                      placeholder="Search for bug"
                      onSearch={handlePopulateSearchResults}
                    />
                  </AutoComplete>
                </Form.Item>
              </div>
              <div className="w-1/8 pl-2">
                <Button
                  icon={<FilterOutlined />}
                  className="h-[40px] !w-[40px]"
                  onClick={() => setIsFilterModalOpen(true)}
                />
              </div>
              <div className="w-1/8 pl-2">
                <Button
                  icon={<SortAscendingOutlined />}
                  className="h-[40px] !w-[40px]"
                />
              </div>
            </div>
          </Form>
          <Card className="mb-4 h-[52.5vh]">
            <BugExploreSearchResultsModule
              bugReports={bugReports}
              bugSearchReports={bugSearchReports}
              handleBugExploreLoadMore={handleBugExploreLoadMore}
              activeKey={exploreSearchActiveKey}
              setActiveKey={setExploreSearchActiveKey}
              isFetchingSearchResult={isFetchingSearchResult}
            />
          </Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={14}>
              <Row>
                <Card className="w-full h-[35vh] overflow-y-scroll">
                  <BugTrendModule
                    bugTrend={bugTrend}
                    bugCount={dbmsData.bug_count}
                  />
                </Card>
              </Row>
            </Col>

            <Col xs={24} md={10}>
              <Card className="h-[35vh]">
                <Typography.Title level={4}>Key Issues</Typography.Title>
                <Typography.Title level={4} className="!font-light">
                  DBMS performance requires attention.
                </Typography.Title>
                <div className="flex flex-col justify-center h-[21vh]">
                  <div className="flex flex-row gap-2">
                    <Card
                      style={{
                        borderRadius: '12px',
                        backgroundColor: `${BugTrackColors.MAGENTA}40`,
                        width: '33%',
                        maxHeight: '19vh',
                      }}
                    >
                      <Typography.Title level={4}>
                        Number of Reporters
                      </Typography.Title>
                      <Typography.Title level={4} className="!font-light">
                        123
                      </Typography.Title>
                    </Card>

                    <Card
                      style={{
                        borderRadius: '12px',
                        backgroundColor: `${BugTrackColors.GREEN}40`,
                        width: '33%',
                        maxHeight: '19vh',
                      }}
                    >
                      <Typography.Title level={4}>
                        Database Health
                      </Typography.Title>
                      <Typography.Title level={4} className="!font-light">
                        Healthy
                      </Typography.Title>
                    </Card>

                    <Card
                      style={{
                        borderRadius: '12px',
                        backgroundColor: `${BugTrackColors.BLUE}40`,
                        width: '33%',
                        maxHeight: '19vh',
                      }}
                    >
                      <Typography.Title level={4}>
                        Report Last Updated
                      </Typography.Title>
                      <Typography.Title level={4} className="!font-light">
                        7/3/25
                      </Typography.Title>
                    </Card>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
          <Row className="mt-4" gutter={[16, 16]}>
            <Col xs={24} md={10}>
              <Card className="h-full">
                <div className="h-[5vh] flex justify-between flex-wrap overflow-y-scroll">
                  <img
                    src={
                      isDarkMode
                        ? 'ai_summary_white.png'
                        : 'ai_summary_black.png'
                    }
                    className="h-[5vh]"
                  />
                  <Button
                    icon={
                      <ThunderboltTwoTone
                        twoToneColor={BugTrackColors.ORANGE}
                      />
                    }
                    style={{
                      background: `linear-gradient(135deg, ${BugTrackColors.MAGENTA}, ${BugTrackColors.ORANGE})`,
                      border: `1px solid ${isDarkMode ? 'white' : 'black'}`,
                    }}
                    loading={aiButtonLoading}
                    disabled={aiButtonLoading}
                    onClick={handleAiSummary}
                  >
                    AI Summary
                  </Button>
                </div>
                <Card
                  className="m-1 p-3 h-[26vh] overflow-y-scroll"
                  styles={{
                    body: {
                      padding: 0,
                    },
                  }}
                >
                  <Typography.Title
                    level={5}
                    className="!font-light text-justify !leading-[1.75]"
                  >
                    {!aiSummary && (
                      <div className="mr-4">
                        <Skeleton active />
                      </div>
                    )}
                    {aiSummary && (
                      <p className="fade-in-text ">{aiSummary?.summary}</p>
                    )}
                  </Typography.Title>
                </Card>
              </Card>
            </Col>
            <Col xs={24} md={14}>
              <Card className="h-[40vh] w-[100%]">
                <div className="h-[5vh]">
                  <Typography.Title level={4}>
                    Bug Distribution (by category)
                  </Typography.Title>
                </div>

                <EChartsReact
                  option={generateBugDistrBar(
                    dbmsData.bug_categories,
                    (theme as AppTheme) ?? 'dark'
                  )}
                  style={{ height: '20vh' }}
                />
                <div className="h-[calc(15vh-48px)] overflow-y-scroll p-1 flex flex-wrap">
                  {dbmsData?.bug_categories?.map(
                    (cat: BugCategory, idx: number) =>
                      cat.count > 0 ? (
                        <CategoryTag
                          key={idx}
                          color={antdTagPresets[idx % antdTagPresets.length]}
                          text={`${cat.name} | ${cat.count}`}
                          className="mt-2"
                        />
                      ) : (
                        <></>
                      )
                  )}
                </div>
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} className="mt-4">
            <Col xs={24} md={12}>
              <Card>
                <Typography.Title level={5}>Detail A</Typography.Title>
                <Typography.Text>
                  Some statistic or info goes here...
                </Typography.Text>
              </Card>
            </Col>
            <Col md={12}>
              <Card>
                <Typography.Title level={5}>Detail B</Typography.Title>
                <Typography.Text>
                  Some statistic or info goes here...
                </Typography.Text>
              </Card>
            </Col>
          </Row>
        </div>
      )}
      <DynamicModal
        modalTitle="Filter settings"
        modalOkButtonText="Apply filters"
        isModalOpen={isFilterModalOpen}
        setIsModalOpen={setIsFilterModalOpen}
        modalItems={filterModalItems}
        handleOk={handleApplyFilter}
      />
    </>
  );
};

export default HomePage;
