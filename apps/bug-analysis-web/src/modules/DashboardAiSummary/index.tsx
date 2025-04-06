import { ThunderboltTwoTone } from '@ant-design/icons';
import { Button, Card, Skeleton, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AiSummary, fetchAiSummary } from '../../api/dbms';
import { useAppContext } from '../../contexts/AppContext';
import { BugTrackColors } from '../../utils/theme';

type Props = {
  dbmsId: number;
};

const DashboardAiSummaryModule: React.FC<Props> = ({ dbmsId }) => {
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

export default DashboardAiSummaryModule;
