import { ThunderboltTwoTone } from '@ant-design/icons';
import { Button, Card, Col, Row, Skeleton, Typography } from 'antd';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useState } from 'react';
import {
  AiSummary,
  BugCategory,
  DbmsResponseDto,
  fetchAiSummary,
  fetchDbmsData,
} from '../api/dbms';
import CategoryTag from '../components/CategoryTag';
import { generateBugDistrBar, generateBugTrendChart } from '../utils/chart';
import { useAppContext } from '../utils/context';
import { antdTagPresets, BugTrackColors } from '../utils/theme';
import { AppTheme } from '../utils/types';

// Dynamically import ECharts for client-side rendering only
const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false });

const HomePage: React.FC = (): ReactNode => {
  const [dbmsData, setDbmsData] = useState<DbmsResponseDto>();
  const [aiSummary, setAiSummary] = useState<AiSummary>();
  const [aiButtonLoading, setAiButtonLoading] = useState(false);

  const handleAiSummary = async () => {
    setAiSummary(undefined);
    setAiButtonLoading(true);
    await fetchAiSummary(1).then((res: AiSummary) => setAiSummary(res));
    setAiButtonLoading(false);
  };

  useEffect(() => {
    fetchDbmsData(1).then((res: DbmsResponseDto) => setDbmsData(res));
    handleAiSummary();
  }, []);

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

  return (
    <>
      {!dbmsData && <Skeleton active round />}
      {dbmsData && (
        <div className="px-4">
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
                  {dbmsData.bug_categories.map(
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
    </>
  );
};

export default HomePage;
