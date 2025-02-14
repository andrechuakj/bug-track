import { Card, Col, Row, Typography } from 'antd';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { BugDistribution, generateBugDistrBar } from '../utils/chart';
import { useAppContext } from '../utils/context';
import { AppTheme } from '../utils/types';

// Dynamically import ECharts for client-side rendering only
const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false });

// Note: To remove, once the API is ready
const DUMMY_BUG_DISTR: BugDistribution = {
  categories: [
    { category: 'UI/UX', count: 12 },
    { category: 'Joins', count: 24 },
    { category: 'Aggregation', count: 2 },
    { category: 'Performance', count: 25 },
    { category: 'Nested Queries', count: 12 },
  ],
};
const DUMMY_BUG_COUNT = DUMMY_BUG_DISTR.categories.reduce(
  (a, c) => a + c.count,
  0
);

const HomePage: React.FC = (): ReactNode => {
  const { theme } = useAppContext();

  return (
    <div className="px-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Row>
            <Card className="w-full">
              <Typography.Title level={4}>Total Bugs</Typography.Title>
              <Typography.Title level={2}>{DUMMY_BUG_COUNT}</Typography.Title>
              <Typography.Text>Active issues currently tracked</Typography.Text>
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
        </Col>

        <Col xs={24} md={12}>
          <Card>
            <Typography.Title level={4}>
              Bug Distribution (by category)
            </Typography.Title>
            <EChartsReact
              option={generateBugDistrBar(
                DUMMY_BUG_DISTR,
                'Bug Distribution (by Category)',
                (theme as AppTheme) ?? 'dark'
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card>
            <Typography.Title level={5}>Larger Detail C</Typography.Title>
            <Typography.Text>Extra content...</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <Typography.Title level={5}>Larger Detail D</Typography.Title>
            <Typography.Text>Extra content...</Typography.Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
