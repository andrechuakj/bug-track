import { Collapse, Skeleton, Typography } from 'antd';
import React from 'react';
import { fetchBugReportAiSummary } from '../../api/bugReport';
import { useBugDetail } from '../../contexts/BugDetailContext';

const AiSummary: React.FC = () => {
  const { bugDetail } = useBugDetail();

  const [summary, setSummary] = React.useState<string | null>(null);
  const [isFetchSuccess, setIsFetchSuccess] = React.useState(false);

  const fetchAiSummary = async () => {
    if (isFetchSuccess) {
      return;
    }
    if (!bugDetail?.id) {
      setSummary('No bug report found, please try again');
      return;
    }
    try {
      const data = await fetchBugReportAiSummary(bugDetail.id);
      setSummary(data);
      setIsFetchSuccess(true);
    } catch (error) {
      console.error(
        `Error fetching AI summary for bug report ${bugDetail.id}:`,
        error
      );
      setSummary('Error fetching AI summary, please try again');
    }
  };

  return (
    <Collapse
      expandIconPosition="end"
      onChange={fetchAiSummary}
      items={[
        {
          key: 'ai-summary',
          label: <Typography.Text>✨AI Summary</Typography.Text>,
          children: summary || (
            <Skeleton active paragraph={{ rows: 4 }} title={false} />
          ),
        },
      ]}
    />
  );
};

export default AiSummary;
