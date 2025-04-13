import { Card, Spin, Typography } from 'antd';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { BugCategory } from '../../api/dbms';
import CategoryTag from '../../components/CategoryTag';
import { useAppContext } from '../../contexts/AppContext';
import { generateBugDistrBar } from '../../utils/chart';
import { antdTagPresets } from '../../utils/theme';

// Dynamically import ECharts for client-side rendering only
const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false });

export type BugDistributionProps = {
  categories: BugCategory[];
};

export const BugDistribution: React.FC<BugDistributionProps> = ({
  categories,
}) => {
  const { theme } = useAppContext();
  const [chartOption, setChartOption] = useState(() =>
    generateBugDistrBar(categories, theme)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      setChartOption(generateBugDistrBar(categories, theme));
      setLoading(false);
    }, 500);
  }, [categories, theme]);

  return (
    <Card className="h-[40vh] w-[100%]">
      <div className="h-[5vh]">
        <Typography.Title level={4}>
          Bug Distribution (by category)
        </Typography.Title>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[20vh]">
          <Spin size="large" />
        </div>
      ) : (
        <EChartsReact option={chartOption} style={{ height: '20vh' }} />
      )}

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
