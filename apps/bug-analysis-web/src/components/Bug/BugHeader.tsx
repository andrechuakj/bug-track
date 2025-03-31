import { Button, Skeleton, Typography } from 'antd';
import { useBugReport } from '../../contexts/BugReportContext';
import BugStatusIcon from './BugStatusIcon';

const BugHeader: React.FC = () => {
  const { bugReport, isBugLoading } = useBugReport();

  if (isBugLoading) {
    return <Skeleton active paragraph={{ rows: 1 }} />;
  }

  if (!bugReport) {
    return (
      <Typography.Title level={2} className="text-red-500">
        Error loading bug report
      </Typography.Title>
    );
  }

  return (
    <div className="w-full flex gap-4">
      <div className="w-3/4">
        <Typography.Title level={2}>
          {bugReport.title
            ? `${bugReport.title} #${bugReport.id}`
            : 'No title found'}
        </Typography.Title>
        <BugStatusIcon isClosed={bugReport.is_closed} />
      </div>
      <div className="w-1/4 flex flex-col xl:flex-row xl:justify-end gap-4">
        {bugReport.url && (
          <Button type="primary" href={bugReport.url} target="_blank">
            View on GitHub
          </Button>
        )}
        {bugReport.repo_url && (
          <Button type="default" href={bugReport.repo_url} target="_blank">
            View Repository
          </Button>
        )}
      </div>
    </div>
  );
};

export default BugHeader;
