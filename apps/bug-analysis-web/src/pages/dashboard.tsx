import { FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';
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
  BugCategory,
  BugExploreReports,
  BugReports,
  DbmsResponseDto,
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
import DashboardAiSummaryModule from '../modules/DashboardAiSummary';
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
import { antdTagPresets } from '../utils/theme';
import {
  FilterBugCategory,
  FilterBugPriority,
  FilterSettings,
  getCategoryId,
} from '../utils/types';

// Dynamically import ECharts for client-side rendering only
const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false });

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

  const [acBugReports, setAcBugReports] = useState<BugReports>({
    bug_reports: [],
  });

  const [bugSearchReports, setBugSearchReports] =
    useState<BugSearchResultStruct>({});

  // Form logic (bug search)
  const [redemptionForm] = Form.useForm();
  const searchFieldRef = useRef<InputRef>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login page');
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const fetchDashboardData = async () => {
    if (!currentTenant) return;
    await Promise.all([
      fetchBugExplore(),
      fetchDbmsData(currentTenant.id).then((res) => setDbmsData(res)),
      fetchBugTrend(currentTenant.id).then((res) => setBugTrend(res)),
    ]);
  };

  useEffect(() => {
    setIsDashboardLoading(true);
    fetchDashboardData();
    setIsDashboardLoading(false);
  }, [currentTenant]);

  const handleSearch = useCallback(
    async (searchStr: string) => {
      if (!currentTenant) return;
      const category = getCategoryId(filterSettings);

      const bugReports: BugReports = await searchBugReports(
        currentTenant.id,
        searchStr,
        0,
        100,
        category
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

  const { theme } = useAppContext();

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

  const renderItem = (title: string, bugReportId: number, _count: number) => ({
    value: title,
    label: (
      <Flex
        align="center"
        justify="space-between"
        onClick={() => {
          router.push(`/bug/${bugReportId}`);
        }}
      >
        {title}
      </Flex>
    ),
  });

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
    () => categoriseBugs(acBugReports.bug_reports),
    [acBugReports]
  );
  const options = useMemo(
    () => generateOptions(searchResultStruct),
    [generateOptions, searchResultStruct]
  );

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
              isFetchingSearchResult={
                isFetchingSearchResult || isDashboardLoading
              }
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
              {currentTenant && (
                <DashboardAiSummaryModule dbmsId={currentTenant.id} />
              )}
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
                    theme ?? 'dark'
                  )}
                  style={{ height: '20vh' }}
                />
                <div className="overflow-y-scroll p-1 flex flex-wrap">
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
