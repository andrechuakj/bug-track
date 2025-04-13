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
} from 'antd';
import { debounce } from 'lodash';
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
  BugExploreReports,
  BugReports,
  DbmsResponseDto,
  fetchBugTrend,
  fetchDbmsData,
  loadMoreBugsByCategory,
  searchBugReports,
} from '../api/dbms';
import AutocompleteTitle from '../components/AutocompleteTitle';
import DynamicModal from '../components/DynamicModal';
import FilterSelection from '../components/FilterSelection';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import {
  BUG_EXPLORE_KEY,
  BugDistribution,
  BugSearch,
  BugTrend,
  DashboardAiSummary,
  DbmsDetails,
  SEARCH_RESULTS_KEY,
} from '../modules';
import {
  AcBugSearchResultStruct,
  BUG_CATEGORIES,
  BugSearchResultStruct,
  categoriseBugs,
  setBugExplore,
  setBugSearchResults,
} from '../utils/bug';
import {
  BUG_CATEGORY_FILTERS,
  BUG_PRIORITY_FILTERS,
  FilterBugCategory,
  FilterBugPriority,
  FilterSettings,
  getCategoryId,
} from '../utils/types';

const Dashboard: React.FC = (): ReactNode => {
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
    // Only run once on mount (per tenant)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearchDebounce = useCallback(
    debounce((searchStr: string) => {
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

  const filterModalItems: React.JSX.Element[] = useMemo(
    () => [
      <FilterSelection<'category'>
        key="filter-sel-category"
        filterPrefix={<p className="font-light">Category:</p>}
        filterSetting={filterSettings.category}
        filterOptions={BUG_CATEGORY_FILTERS}
        filterOnChange={(val) => {
          setFilterSettings((settings) => ({ ...settings, category: val }));
        }}
        filterPlaceholder="Select Bug Category"
      />,
      <FilterSelection<'priority'>
        key="filter-sel-priority"
        filterPrefix={<p className="font-light">Priority:</p>}
        filterSetting={filterSettings.priority}
        filterOptions={BUG_PRIORITY_FILTERS}
        filterOnChange={(val) => {
          setFilterSettings((settings) => ({ ...settings, priority: val }));
        }}
        filterPlaceholder="Select Bug Priority"
      />,
    ],
    [filterSettings.category, filterSettings.priority]
  );

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
    // TODO: Investigate eslint warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (bugReports !== undefined) {
      setBugExplore(
        bugExploreDistribution,
        setBugExploreDistribution,
        setBugReports,
        bugReports
      );
    }
    // TODO: Investigate eslint warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Mock BugTallyInstance data

  // TODO: Investigate eslint warning
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      return result.categories.map((cat) => ({
        label: <AutocompleteTitle title={cat.title} />,
        options: cat.options.map(({ display, bugReportId }) =>
          renderItem(display, bugReportId, 1000)
        ),
      }));
    },
    [renderItem]
  );

  const options = useMemo(
    () => generateOptions(categoriseBugs(acBugReports.bug_reports)),
    [acBugReports.bug_reports, generateOptions]
  );

  const filterModal = useMemo(
    () => (
      <DynamicModal
        modalTitle="Filter settings"
        modalOkButtonText="Apply filters"
        isModalOpen={isFilterModalOpen}
        setIsModalOpen={setIsFilterModalOpen}
        modalItems={filterModalItems}
        handleOk={() => {
          handleApplyFilter();
        }}
      />
    ),
    [filterModalItems, handleApplyFilter, isFilterModalOpen]
  );

  const dashboardOnSuccess = currentTenant && dbmsData && (
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
                  onSearch={() => {
                    handlePopulateSearchResults();
                  }}
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
        <BugSearch
          bugReports={bugReports}
          bugSearchReports={bugSearchReports}
          handleBugExploreLoadMore={async (tenantId, categoryId) => {
            await handleBugExploreLoadMore(tenantId, categoryId);
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
              <BugTrend bugTrend={bugTrend} bugCount={dbmsData.bug_count} />
            </Card>
          </Row>
        </Col>

        <Col xs={24} md={10}>
          <Card className="h-[35vh] overflow-y-scroll">
            {currentTenant && <DbmsDetails dbmsId={currentTenant.id} />}
          </Card>
        </Col>
      </Row>
      <Row className="mt-4" gutter={[16, 16]}>
        <Col xs={24} md={10}>
          {currentTenant && <DashboardAiSummary dbmsId={currentTenant.id} />}
        </Col>
        <Col xs={24} md={14}>
          <BugDistribution categories={dbmsData.bug_categories} />
        </Col>
      </Row>
    </div>
  );

  const skeleton = (!currentTenant || !dbmsData) && <Skeleton active round />;

  return (
    <>
      {skeleton}
      {dashboardOnSuccess}
      {filterModal}
    </>
  );
};

export default Dashboard;
