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
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AiSummary,
  BugCategory,
  BugReport,
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
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import BugExploreSearchResultsModule, {
  BUG_EXPLORE_KEY,
  SEARCH_RESULTS_KEY,
} from '../modules/BugExploreSearchResults';
import BugTrendModule from '../modules/BugTrend';
import DbmsDetails from '../modules/DbmsDetails';
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
import { antdTagPresets, BugTrackColors } from '../utils/theme';
import {
  FilterBugCategory,
  FilterBugPriority,
  FilterSettings,
  getCategoryId,
} from '../utils/types';

// Dynamically import ECharts for client-side rendering only
const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false });

const Title: React.FC<Readonly<{ title?: string }>> = ({ title }) => (
  <Flex align="center" justify="space-between">
    {title}
    <a
      href="https://www.google.com/search?q=antd"
      target="_blank"
      rel="noopener noreferrer"
    >
      more
    </a>
  </Flex>
);

const HomePage: React.FC = (): ReactNode => {
  const { isAuthenticated, loading } = useAuth();
  const { currentTenant } = useSession();
  const router = useRouter();
  const [dbmsData, setDbmsData] = useState<DbmsResponseDto>();
  const [bugTrend, setBugTrend] = useState<number[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
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

  const [acBugReports, setAcBugReports] = useState<BugReport[]>([]);

  const [bugSearchReports, setBugSearchReports] =
    useState<BugSearchResultStruct>({});

  // Form logic (bug search)
  const [redemptionForm] = Form.useForm();
  const searchFieldRef = useRef<InputRef>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login page');
      void router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

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
  }, [bugExploreDistribution, currentTenant]);

  // AI logic

  const fetchDashboardData = useCallback(async () => {
    if (!currentTenant) return;
    await Promise.all([
      fetchBugExplore(),
      fetchDbmsData(currentTenant.id).then((res) => setDbmsData(res)),
      fetchBugTrend(currentTenant.id).then((res) => setBugTrend(res)),
    ]);
  }, [currentTenant, fetchBugExplore]);

  useEffect(() => {
    setIsDashboardLoading(true);
    fetchDashboardData()
      .then(() => {
        setIsDashboardLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching dashboard data:', error);
        setIsDashboardLoading(false);
      });
  }, [currentTenant, fetchDashboardData]);

  const handleSearch = useCallback(
    async (searchStr: string) => {
      if (!currentTenant) return;
      const categoryId = getCategoryId(filterSettings);

      const bugReports: BugReports = await searchBugReports(
        currentTenant.id,
        searchStr,
        0,
        100,
        categoryId
      );
      if (bugReports) {
        setAcBugReports(bugReports.bug_reports);
        setLastSearchedStr(searchStr);
      }
      return bugReports;
    },
    [currentTenant, filterSettings]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearchDebounce = useCallback(
    debounce(async (searchStr: string) => {
      if (!currentTenant) return;
      if (searchStr.length >= 3) {
        await handleSearch(searchStr);
      }
    }, 500),
    [currentTenant, handleSearch]
  );

  const handlePopulateSearchResults = async () => {
    let bugReportsResult = acBugReports;
    const searchValue = searchFieldRef.current?.input?.value;

    if (searchValue && searchValue != lastSearchedStr) {
      // Fetch due to mismatch
      setIsFetchingSearchResult(true);
      // Return result as setAcBugReport is done asynchronously, and we
      // want to use the immediate result
      const res = await handleSearch(searchValue);
      if (res) {
        bugReportsResult = res.bug_reports;
      }
      setIsFetchingSearchResult(false);
    }
    setBugSearchResults(setBugSearchReports, bugReportsResult);
    setExploreSearchActiveKey(SEARCH_RESULTS_KEY);
    setAcBugReports([]); // close the autocomplete drop-down
  };

  // Filter
  const bugCategoryFilterOptions = Object.values(
    FilterBugCategory
  ) as FilterBugCategory[];

  const bugPriorityFilterOptions = Object.values(
    FilterBugPriority
  ) as FilterBugPriority[];

  const filterModalItems: React.JSX.Element[] = useMemo(
    () => [
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
    ],
    [
      bugCategoryFilterOptions,
      bugPriorityFilterOptions,
      filterSettings.category,
      filterSettings.priority,
    ]
  );

  const handleApplyFilter = useCallback(async () => {
    let bugReportsResult = acBugReports;

    setIsFetchingSearchResult(true);
    const res = await handleSearch(lastSearchedStr);
    if (res) {
      bugReportsResult = res.bug_reports;
    }
    setIsFetchingSearchResult(false);
    setBugSearchResults(setBugSearchReports, bugReportsResult);
    setExploreSearchActiveKey(SEARCH_RESULTS_KEY);
    setIsFilterModalOpen(false);
  }, [acBugReports, handleSearch, lastSearchedStr]);

  const handleBugExploreLoadMore = useCallback(
    async (tenantId: number, categoryId: number) => {
      const bugExploreReports = await loadMoreBugsByCategory(
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
    },
    [bugExploreDistribution]
  );

  // Mock BugTallyInstance data

  const renderItem = useCallback(
    (title: string, bugReportId: number, _count: number) => ({
      value: title,
      label: (
        <Flex
          align="center"
          justify="space-between"
          onClick={() => void router.push(`/bug/${bugReportId}`)}
        >
          {title}
        </Flex>
      ),
    }),
    [router]
  );

  // Parse bugReports into options
  const generateOptions = useCallback(
    (result: AcBugSearchResultStruct) => {
      return result.categories.map((cat: AcBugSearchResultCategory) => ({
        label: <Title title={cat.title} />,
        options:
          cat.options?.map((opt: AcBugSearchResult) =>
            renderItem(opt.display, opt.bugReportId, 1000)
          ) ?? [],
      }));
    },
    [renderItem]
  );

  const searchResultStruct: AcBugSearchResultStruct = useMemo(
    () => categoriseBugs(acBugReports),
    [acBugReports]
  );
  const options = useMemo(
    () => generateOptions(searchResultStruct),
    [generateOptions, searchResultStruct]
  );

  const modal = useMemo(
    () => (
      <DynamicModal
        modalTitle="Filter settings"
        modalOkButtonText="Apply filters"
        isModalOpen={isFilterModalOpen}
        setIsModalOpen={setIsFilterModalOpen}
        modalItems={filterModalItems}
        handleOk={void handleApplyFilter}
      />
    ),
    [filterModalItems, handleApplyFilter, isFilterModalOpen]
  );

  if (!dbmsData || !currentTenant) {
    return <Skeleton active round />;
  }

  return (
    <div className="px-4">
      <Form form={redemptionForm} onFinish={() => {}}>
        <div className="flex flex-row flex-wrap">
          <div className="w-3/4">
            <Form.Item name={['bugSearchValue']} labelCol={{ span: 24 }}>
              <AutoComplete
                options={options}
                onSearch={void handleSearchDebounce}
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
                  onSearch={void handlePopulateSearchResults}
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
          handleBugExploreLoadMore={(tenantId, categoryId) => {
            handleBugExploreLoadMore(tenantId, categoryId);
          }}
          activeKey={exploreSearchActiveKey}
          setActiveKey={setExploreSearchActiveKey}
          isFetchingSearchResult={isFetchingSearchResult || isDashboardLoading}
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
          <Card className="h-[35vh] overflow-y-scroll">
            <DbmsDetails />
          </Card>
        </Col>
      </Row>

      <Row className="mt-4" gutter={[16, 16]}>
        <Col xs={24} md={10}>
          <DbmsAiSummary dbmsId={currentTenant?.id} />
        </Col>
        <Col xs={24} md={14}>
          <BugDistrubutionChart categories={dbmsData.bug_categories} />
        </Col>
      </Row>
      {modal}
    </div>
  );
};

const DbmsAiSummary: React.FC<{ dbmsId: number }> = ({ dbmsId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<string>();
  const { theme } = useAppContext();
  const isDarkMode = useMemo(() => theme === 'dark', [theme]);

  const reload = useCallback(() => {
    fetchAiSummary(dbmsId)
      .then((res: AiSummary) => setSummary(res.summary))
      .finally(() => {
        setIsLoading(false);
      });
  }, [dbmsId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <Card className="h-full">
      <div className="h-[5vh] flex justify-between flex-wrap overflow-y-scroll">
        <img
          src={isDarkMode ? 'ai_summary_white.png' : 'ai_summary_black.png'}
          className="h-[5vh]"
        />
        <Button
          icon={<ThunderboltTwoTone twoToneColor={BugTrackColors.ORANGE} />}
          style={{
            background: `linear-gradient(135deg, ${BugTrackColors.MAGENTA}, ${BugTrackColors.ORANGE})`,
            border: `1px solid ${isDarkMode ? 'white' : 'black'}`,
          }}
          loading={isLoading}
          disabled={isLoading}
          onClick={reload}
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
          {!summary && (
            <div className="mr-4">
              <Skeleton active />
            </div>
          )}
          {summary && <p className="fade-in-text ">{summary}</p>}
        </Typography.Title>
      </Card>
    </Card>
  );
};

const BugDistrubutionChart: React.FC<{ categories: BugCategory[] }> = ({
  categories,
}) => {
  const { theme } = useAppContext();

  return (
    <Card className="h-[40vh] w-[100%]">
      <div className="h-[5vh]">
        <Typography.Title level={4}>
          Bug Distribution (by category)
        </Typography.Title>
      </div>

      <EChartsReact
        option={generateBugDistrBar(categories, theme) as unknown}
        style={{ height: '20vh' }}
      />
      <div className="overflow-y-scroll p-1 flex flex-wrap">
        {categories.map(
          (cat: BugCategory, idx: number) =>
            cat.count > 0 && (
              <CategoryTag
                key={idx}
                color={antdTagPresets[idx % antdTagPresets.length]}
                text={`${cat.name} | ${cat.count}`}
                className="mt-2"
              />
            )
        )}
      </div>
    </Card>
  );
};

export default HomePage;
