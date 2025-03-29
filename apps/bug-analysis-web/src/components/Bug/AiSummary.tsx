import { ReloadOutlined } from '@ant-design/icons';
import { Collapse, Skeleton, Typography } from 'antd';
import React from 'react';
import { fetchBugReportAiSummary } from '../../api/bugReport';
import { useBugReport } from '../../contexts/BugReportContext';

const AiSummary: React.FC = () => {
  const { bugReport } = useBugReport();

  const [summary, setSummary] = React.useState<string | null>(null);
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
    setSummary(null);
    if (!bugReport) {
      setSummary('No bug report found, please try again');
      return;
    }
    try {
      const data = await fetchBugReportAiSummary(bugReport.id);
      setSummary(data);
      setIsFetchSuccess(true);
    } catch (error) {
      console.error(
        `Error fetching AI summary for bug report ${bugReport.id}:`,
        error
      );
      setSummary('Error fetching AI summary, please try again');
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
          children: summary ? (
            <div className="flex items-center gap-2">
              {summary}
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
