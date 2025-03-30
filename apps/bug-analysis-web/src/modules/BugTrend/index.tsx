import { Typography } from 'antd';
import EChartsReact from 'echarts-for-react';
import { generateBugTrendChart } from '../../utils/chart';

interface BugTrendModuleProps {
  bugTrend: number[];
  bugCount: number;
}

const BugTrendModule: React.FC<BugTrendModuleProps> = (
  props: BugTrendModuleProps
) => {
  const { bugTrend, bugCount } = props;

  const bugTrendLen = bugTrend.length;
  const bugTallyInstances = bugTrend.map((count, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (bugTrendLen - 1 - index));
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}`;
    return {
      label: index === bugTrendLen - 1 ? 'Today' : formattedDate,
      count,
    };
  });

  return (
    <>
      <Typography.Title level={4} className="!mb-1">
        Total Bugs
      </Typography.Title>
      <Typography.Title level={2} className="!mt-2 inline-block pr-2">
        {bugCount}
      </Typography.Title>
      <Typography.Title level={4} className="mb-4 inline-block !font-thin">
        Issues currently tracked
      </Typography.Title>
      <EChartsReact
        option={generateBugTrendChart(bugTallyInstances)}
        style={{ height: 'calc(35vh - 150px)' }}
      />
    </>
  );
};

export default BugTrendModule;
