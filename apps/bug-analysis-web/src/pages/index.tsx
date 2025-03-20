import {
  FilterOutlined,
  SortAscendingOutlined,
  ThunderboltTwoTone,
  UserOutlined,
} from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  List,
  Row,
  SelectProps,
  Skeleton,
  Typography,
} from 'antd';
import clsx from 'clsx';
import { debounce } from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import {
  AiSummary,
  BugCategory,
  BugExploreReports,
  BugReports,
  DbmsResponseDto,
  fetchAiSummary,
  fetchDbmsData,
  loadMoreBugsByCategory,
  searchBugReports,
} from '../api/dbms';
import CategoryTag from '../components/CategoryTag';
import DynamicModal from '../components/DynamicModal';
import FilterSelection from '../components/FilterSelection';
import SearchResultListItem from '../components/SearchResultListItem';
import { useAuth } from '../contexts/AuthContext';
import {
  AcBugSearchResult,
  AcBugSearchResultCategory,
  AcBugSearchResultStruct,
  BUG_CATEGORIES,
  BugSearchResultStruct,
  categoriseBugs,
  setBugExplore,
} from '../utils/bug';
import { generateBugDistrBar, generateBugTrendChart } from '../utils/chart';
import { useAppContext } from '../utils/context';
import { antdTagPresets, BugTrackColors } from '../utils/theme';
import {
  AppTheme,
  FilterBugCategory,
  FilterBugPriority,
  FilterSettings,
} from '../utils/types';

// Dynamically import ECharts for client-side rendering only
const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false });

const HomePage: React.FC = (): ReactNode => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [dbmsData, setDbmsData] = useState<DbmsResponseDto>();
  const [aiSummary, setAiSummary] = useState<AiSummary>();
  const [aiButtonLoading, setAiButtonLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login page');
      router.push('/login');
    } else {
      fetchBugExplore();
      fetchDbmsData(1).then((res: DbmsResponseDto) => setDbmsData(res));
      handleAiSummary();
    }
  }, [loading, isAuthenticated, router]);

  // Form logic (bug search)
  const [redemptionForm] = Form.useForm();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  // TODO: Implement sort modal
  // const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const [acBugReports, setAcBugReports] = useState<BugReports>({
    bug_reports: [],
  });

  const handleSearch = useCallback(
    debounce(async (searchStr: string) => {
      if (searchStr.length >= 3) {
        // TODO: edit this accordingly
        const bugReports: BugReports = await searchBugReports(
          1,
          searchStr,
          0,
          100
        );
        if (bugReports) {
          setAcBugReports(bugReports);
        }
      }
    }, 500),
    []
  );

  // Filter
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    category: FilterBugCategory.NONE_SELECTED,
    priority: FilterBugPriority.NONE_SELECTED,
  });

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
    const bugReports: BugReports = await searchBugReports(1, '', 0, 100);
    if (bugReports) {
      setBugExplore(
        bugExploreDistribution,
        setBugExploreDistribution,
        setBugReports,
        bugReports
      );
    }
  }, []);

  const handleBugExploreLoadMore = async (
    categoryId: number
  ): Promise<void> => {
    const bugExploreReports: BugExploreReports = await loadMoreBugsByCategory(
      1,
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
    setAiSummary(undefined);
    setAiButtonLoading(true);
    await fetchAiSummary(1).then((res: AiSummary) => setAiSummary(res));
    setAiButtonLoading(false);
  };

  const { theme } = useAppContext();
  const isDarkMode = theme === 'dark';

  // Mock BugTallyInstance data
  // Temporary type
  const bugTallyInstances: { label: string; count: number }[] = [
    { label: 'Jan', count: 120 },
    { label: 'Feb', count: 150 },
    { label: 'Mar', count: 180 },
    { label: 'Apr', count: 160 },
    { label: 'May', count: 130 },
    { label: 'Jun', count: 170 },
    { label: 'Jul', count: 200 },
    { label: 'Aug', count: 190 },
    { label: 'Sep', count: 220 },
    { label: 'Oct', count: 210 },
    { label: 'Nov', count: 230 },
    { label: 'Dec', count: 240 },
  ];

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

  const renderItem = (title: string, count: number) => ({
    value: title,
    label: (
      <Flex align="center" justify="space-between">
        {title}
        <span>
          <UserOutlined /> {count}
        </span>
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
                    onSearch={handleSearch}
                    size="large"
                    filterOption={
                      ((inputValue, option) =>
                        String(option?.value)
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !==
                        -1) as SelectProps['filterOption']
                    }
                  >
                    <Input.Search size="large" placeholder="Search for bug" />
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
          <Card className="mb-4 ">
            <Typography.Title
              level={4}
            >{`Explore bug reports`}</Typography.Title>
            {bugReports && (
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
                  'h-[30vh] overflow-y-scroll',
                  isDarkMode ? 'bg-black' : 'bg-white'
                )}
              />
            )}
          </Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={14}>
              <Row>
                <Card className="w-full h-[35vh] overflow-y-scroll">
                  <Typography.Title level={4} className="!mb-1">
                    Total Bugs
                  </Typography.Title>
                  <Typography.Title
                    level={2}
                    className="!mt-2 inline-block pr-2"
                  >
                    {dbmsData.bug_count}
                  </Typography.Title>
                  <Typography.Title
                    level={4}
                    className="mb-4 inline-block !font-thin"
                  >
                    Issues currently tracked
                  </Typography.Title>
                  <EChartsReact
                    option={generateBugTrendChart(bugTallyInstances)}
                    style={{ height: 'calc(35vh - 150px)' }}
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
                  <div className="flex flex-row overflow-scroll gap-2">
                    <Card
                      style={{
                        borderRadius: '12px',
                        backgroundColor: `${BugTrackColors.MAGENTA}40`,
                        width: '33%',
                        maxHeight: '19vh',
                        overflow: 'scroll',
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
                        overflow: 'scroll',
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
                        overflow: 'scroll',
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
                    'Bug Distribution (by Category)',
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
      />
    </>
  );
};

export default HomePage;
