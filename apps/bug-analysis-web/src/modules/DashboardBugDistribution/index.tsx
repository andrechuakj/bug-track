import { Card, Typography } from 'antd';
import dynamic from 'next/dynamic';
import { BugCategory } from '../../api/dbms';
import CategoryTag from '../../components/CategoryTag';
import { useAppContext } from '../../contexts/AppContext';
import { generateBugDistrBar } from '../../utils/chart';
import { antdTagPresets } from '../../utils/theme';

// Dynamically import ECharts for client-side rendering only
const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false });

type Props = {
  categories: BugCategory[];
};

const DashboardBugDistributionChartModule: React.FC<Props> = ({
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
        option={generateBugDistrBar(categories, theme)}
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

export default DashboardBugDistributionChartModule;
