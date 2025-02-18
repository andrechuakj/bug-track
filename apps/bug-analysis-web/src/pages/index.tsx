import { Card, Col, Row, Skeleton, Typography } from 'antd';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useState } from 'react';
import { BugCategory, DbmsResponseDto, fetchDbmsData } from '../api/dbms';
import CategoryTag from '../components/CategoryTag';
import { generateBugDistrBar, generateBugTrendChart } from '../utils/chart';
import { useAppContext } from '../utils/context';
import { antdTagPresets } from '../utils/theme';
import { AppTheme } from '../utils/types';

// Dynamically import ECharts for client-side rendering only
const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false });

const HomePage: React.FC = (): ReactNode => {
  const [dbmsData, setDbmsData] = useState<DbmsResponseDto>();

  useEffect(() => {
    fetchDbmsData(1).then((res: DbmsResponseDto) => setDbmsData(res));
  }, []);
  const { theme } = useAppContext();
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
            <Col xs={24} md={12}>
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
                  <div className="h-[calc(35vh-150px)] overflow-y-scroll">
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
              </Row>
            </Col>

            <Col xs={24} md={12}>
              <Card className="h-[35vh]">
                <Typography.Title level={4}>Bug Tally Trend</Typography.Title>
                <EChartsReact
                  option={generateBugTrendChart(bugTallyInstances)}
                  style={{ height: '30vh' }}
                />
              </Card>
            </Col>
          </Row>
          <Row className="mt-4">
            <Card className="h-[40vh] w-[100%]">
              <Typography.Title level={4}>
                Bug Distribution (by category)
              </Typography.Title>
              <EChartsReact
                option={generateBugDistrBar(
                  dbmsData.bug_categories,
                  'Bug Distribution (by Category)',
                  (theme as AppTheme) ?? 'dark'
                )}
              />
            </Card>
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
