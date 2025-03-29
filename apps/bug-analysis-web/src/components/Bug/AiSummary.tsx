import { ReloadOutlined } from '@ant-design/icons';
import { Collapse, Skeleton, Typography } from 'antd';
import React from 'react';
import type { AiSummary } from '../../api/bugReport';
import { fetchBugReportAiSummary } from '../../api/bugReport';
import { useBugReport } from '../../contexts/BugReportContext';

const AiSummary: React.FC = () => {
  const { bugReport } = useBugReport();

  const [aiSummary, setAiSummary] = React.useState<AiSummary | null>(null);
  const [isFetchSuccess, setIsFetchSuccess] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const fetchAiSummary = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    if (isFetchSuccess) {
      return;
    }
    setIsFetchSuccess(false);
    setAiSummary(null);
    if (!bugReport) {
      setAiSummary('No bug report found, please try again');
      return;
    }
    try {
      const data = await fetchBugReportAiSummary(bugReport.id);
      setAiSummary(data.summary);
      setIsFetchSuccess(true);
    } catch (error) {
      console.error(
        `Error fetching AI summary for bug report ${bugReport.id}:`,
        error
      );
      setAiSummary('Error fetching AI summary, please try again');
    }
  };

  if (!bugReport) {
    return <></>;
  }

  return (
    <Collapse
      expandIconPosition="end"
      onChange={fetchAiSummary}
      items={[
        {
          key: 'ai-summary',
          label: <Typography.Text>✨AI Summary</Typography.Text>,
          children: aiSummary ? (
            <div className="flex items-center gap-2">
              {aiSummary}
              {!isFetchSuccess && (
                <ReloadOutlined
                  className="cursor-pointer"
                  onClick={fetchAiSummary}
                />
              )}
            </div>
          ) : (
            <Skeleton active paragraph={{ rows: 4 }} title={false} />
          ),
        },
      ]}
    />
  );
};

export default AiSummary;
